/**
 * YouTube OAuth2 callback route.
 * Handles the redirect from Google after the user authorises the app.
 */
import type { Express, Request, Response } from "express";
import { getOAuth2Client, saveTokens } from "./youtube";

export function registerYouTubeRoutes(app: Express) {
  // Step 2 of OAuth flow: Google redirects here with ?code=...
  app.get("/api/youtube/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send("Missing code parameter");
    }
    try {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      saveTokens(tokens);
      console.log("[YouTube] OAuth tokens saved successfully");
      // Redirect back to the admin panel with success flag
      res.redirect("/pemf/admin?youtube=authorised");
    } catch (err) {
      console.error("[YouTube] OAuth callback error:", err);
      res.redirect("/pemf/admin?youtube=error");
    }
  });
}
