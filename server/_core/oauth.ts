import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { notifyOwner } from "./notification";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function parseState(state: string): { redirectUri: string; returnPath: string } {
  try {
    const decoded = atob(state);
    // Try parsing as JSON (new format with returnPath)
    try {
      const parsed = JSON.parse(decoded);
      return {
        redirectUri: parsed.redirectUri || "/",
        returnPath: parsed.returnPath || "/",
      };
    } catch {
      // Legacy format: state is just the base64-encoded redirectUri
      return {
        redirectUri: decoded,
        returnPath: "/",
      };
    }
  } catch {
    return {
      redirectUri: "/",
      returnPath: "/",
    };
  }
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      const { isNewUser } = await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Notify owner when a new user registers
      if (isNewUser) {
        const userName = userInfo.name || "Unknown";
        const userEmail = userInfo.email || "No email provided";
        const loginMethod = userInfo.loginMethod ?? userInfo.platform ?? "unknown";
        const registeredAt = new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" });
        notifyOwner({
          title: `New User Registration: ${userName}`,
          content: `A new user has registered on Add Life to Your Years.\n\nName: ${userName}\nEmail: ${userEmail}\nLogin Method: ${loginMethod}\nRegistered: ${registeredAt}`,
        }).catch((err) => {
          console.warn("[OAuth] Failed to send new user notification:", err);
        });
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[OAuth] Setting session cookie:", {
        cookieName: COOKIE_NAME,
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
        httpOnly: cookieOptions.httpOnly,
        protocol: req.protocol,
        xForwardedProto: req.headers["x-forwarded-proto"],
        hostname: req.hostname,
      });
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to the return path (e.g., /questionnaire) instead of always /
      const { returnPath } = parseState(state);
      // Ensure returnPath is a relative path to prevent open redirect
      const safePath = returnPath.startsWith("/") ? returnPath : "/";
      // Append session token as query param for browsers that block cookies
      // during redirect chains (e.g., Edge InPrivate mode).
      // The frontend will detect this and set the cookie via XHR if needed.
      const separator = safePath.includes("?") ? "&" : "?";
      res.redirect(302, `${safePath}${separator}auth_token=${encodeURIComponent(sessionToken)}`);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
