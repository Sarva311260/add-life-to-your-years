import type { Express, Request, Response } from "express";
import { getDb } from "./db";
import { emailOpenEvents, emailClickEvents } from "../drizzle/schema";

// 1×1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export function registerTrackingRoutes(app: Express) {
  // ── Open tracking pixel ────────────────────────────────────────────────────────────────────────────
  // URL: /track/open?t=<id>&a=<affiliateId>&e=<dripEmailId>&p=<email>[&m=1]
  // m=1: t is emailLogId (manual email); otherwise t is dripSendLogId
  app.get("/track/open", async (req: Request, res: Response) => {
    // Always return the pixel immediately — never block on DB
    res.set({
      "Content-Type": "image/gif",
      "Content-Length": TRACKING_PIXEL.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
    });
    res.end(TRACKING_PIXEL);

    // Record open asynchronously
    try {
      const id = parseInt(req.query.t as string);
      const affiliateId = parseInt(req.query.a as string);
      const dripEmailId = parseInt(req.query.e as string);
      const prospectEmail = (req.query.p as string) || null;
      const isManual = req.query.m === "1";
      const userAgent = req.headers["user-agent"] || null;

      if (!isNaN(id) && !isNaN(affiliateId)) {
        const db = await getDb();
        if (!db) return;
        if (isManual) {
          await db.insert(emailOpenEvents).values({
            emailLogId: id,
            dripSendLogId: null,
            affiliateId,
            dripEmailId: null,
            prospectEmail,
            userAgent,
          });
        } else {
          await db.insert(emailOpenEvents).values({
            dripSendLogId: id,
            emailLogId: null,
            affiliateId,
            dripEmailId: isNaN(dripEmailId) ? null : dripEmailId,
            prospectEmail,
            userAgent,
          });
        }
      }
    } catch (err) {
      console.warn("[Tracking] Failed to record open:", err);
    }
  });  // ── Click tracking redirect ────────────────────────────────────────────────────────────────────────────
  // URL: /track/click?t=<id>&a=<affiliateId>&e=<dripEmailId>&p=<email>&u=<encodedUrl>[&m=1]
  // m=1: t is emailLogId (manual email); otherwise t is dripSendLogId
  app.get("/track/click", async (req: Request, res: Response) => {
    const targetUrl = req.query.u ? decodeURIComponent(req.query.u as string) : null;

    // Redirect immediately
    if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
      res.redirect(302, targetUrl);
    } else {
      res.redirect(302, "/");
    }

    // Record click asynchronously
    try {
      const id = parseInt(req.query.t as string);
      const affiliateId = parseInt(req.query.a as string);
      const dripEmailId = parseInt(req.query.e as string);
      const prospectEmail = (req.query.p as string) || null;
      const isManual = req.query.m === "1";
      const userAgent = req.headers["user-agent"] || null;

      if (!isNaN(id) && !isNaN(affiliateId) && targetUrl) {
        const db2 = await getDb();
        if (!db2) return;
        if (isManual) {
          await db2.insert(emailClickEvents).values({
            emailLogId: id,
            dripSendLogId: null,
            affiliateId,
            dripEmailId: null,
            prospectEmail,
            targetUrl,
            userAgent,
          });
        } else {
          await db2.insert(emailClickEvents).values({
            dripSendLogId: id,
            emailLogId: null,
            affiliateId,
            dripEmailId: isNaN(dripEmailId) ? null : dripEmailId,
            prospectEmail,
            targetUrl,
            userAgent,
          });
        }
      }
    } catch (err) {
      console.warn("[Tracking] Failed to record click:", err);
    }
  });
}
