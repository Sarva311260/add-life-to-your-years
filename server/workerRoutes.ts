/**
 * Worker API endpoints — used by the local video-worker.mjs script running on Sarva's computer.
 *
 * These endpoints are authenticated with a shared secret (WORKER_SECRET env var).
 * The worker script polls /api/worker/claim-job every 30 seconds, processes the job
 * locally (ffmpeg + YouTube upload), then calls /api/worker/complete-job.
 *
 * Routes:
 *   GET  /api/worker/claim-job     — returns the oldest pending/encoding_done post
 *   POST /api/worker/complete-job  — marks a post as done (or error)
 *   POST /api/worker/set-encoding  — marks a post as encoding_done with videoMp4Url
 *   GET  /api/worker/youtube-tokens — returns the stored YouTube OAuth tokens
 */

import type { Express, Request, Response } from "express";
import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import { eq, or } from "drizzle-orm";

function getWorkerSecret(): string {
  return process.env.WORKER_SECRET ?? "altyyy-worker-secret-2026";
}

function checkAuth(req: Request, res: Response): boolean {
  const auth = req.headers["x-worker-secret"] ?? req.query.secret;
  if (auth !== getWorkerSecret()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function registerWorkerRoutes(app: Express): void {
  // GET /api/worker/claim-job — returns the oldest pending or encoding_done post
  app.get("/api/worker/claim-job", async (req: Request, res: Response) => {
    if (!checkAuth(req, res)) return;

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "DB unavailable" });
      return;
    }

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(or(
        eq(blogPosts.videoStatus, "pending"),
        eq(blogPosts.videoStatus, "encoding_done"),
      ))
      .orderBy(blogPosts.updatedAt)
      .limit(1);

    if (!post) {
      res.json({ job: null });
      return;
    }

    res.json({
      job: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        tags: post.tags,
        audioUrl: post.audioUrl,
        coverImageUrl: post.coverImageUrl,
        videoStatus: post.videoStatus,
        videoMp4Url: post.videoMp4Url,
      },
    });
  });

  // POST /api/worker/set-encoding — marks post as encoding_done with MP4 URL
  app.post("/api/worker/set-encoding", async (req: Request, res: Response) => {
    if (!checkAuth(req, res)) return;

    const { id, videoMp4Url } = req.body as { id: number; videoMp4Url: string };
    if (!id || !videoMp4Url) {
      res.status(400).json({ error: "id and videoMp4Url are required" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "DB unavailable" });
      return;
    }

    await db.update(blogPosts)
      .set({ videoMp4Url, videoStatus: "encoding_done" })
      .where(eq(blogPosts.id, id));

    console.log(`[Worker] Post ${id} encoding done, MP4 saved to S3: ${videoMp4Url}`);
    res.json({ ok: true });
  });

  // POST /api/worker/complete-job — marks post as done or error
  app.post("/api/worker/complete-job", async (req: Request, res: Response) => {
    if (!checkAuth(req, res)) return;

    const { id, youtubeVideoId, error } = req.body as {
      id: number;
      youtubeVideoId?: string;
      error?: string;
    };

    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "DB unavailable" });
      return;
    }

    if (error) {
      await db.update(blogPosts)
        .set({ videoStatus: "error", videoError: error })
        .where(eq(blogPosts.id, id));
      console.log(`[Worker] Post ${id} failed: ${error}`);
      res.json({ ok: true, status: "error" });
      return;
    }

    if (!youtubeVideoId) {
      res.status(400).json({ error: "youtubeVideoId or error is required" });
      return;
    }

    await db.update(blogPosts)
      .set({
        youtubeVideoId,
        videoUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        videoStatus: "done",
        videoError: null,
      })
      .where(eq(blogPosts.id, id));

    console.log(`[Worker] Post ${id} published to YouTube: ${youtubeVideoId}`);
    res.json({ ok: true, status: "done", youtubeVideoId });
  });

  // GET /api/worker/youtube-tokens — returns the stored YouTube OAuth tokens for the worker
  app.get("/api/worker/youtube-tokens", async (req: Request, res: Response) => {
    if (!checkAuth(req, res)) return;

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "DB unavailable" });
      return;
    }

    try {
      const { systemSettings } = await import("../drizzle/schema");
      const { eq: eqOp } = await import("drizzle-orm");
      const rows = await db
        .select()
        .from(systemSettings)
        .where(eqOp(systemSettings.key, "youtube_oauth_tokens"))
        .limit(1);

      if (!rows.length || !rows[0].value) {
        res.status(404).json({ error: "No YouTube tokens found. Connect YouTube in the admin panel first." });
        return;
      }

      res.json({ tokens: JSON.parse(rows[0].value) });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /api/worker/upload-mp4 — accepts base64-encoded MP4 from the local worker and saves to S3
  app.post("/api/worker/upload-mp4", async (req: Request, res: Response) => {
    if (!checkAuth(req, res)) return;

    const { base64, contentType, filename } = req.body as {
      base64: string;
      contentType: string;
      filename: string;
    };
    if (!base64 || !filename) {
      res.status(400).json({ error: "base64 and filename are required" });
      return;
    }

    try {
      const { storagePut } = await import("./storage");
      const buffer = Buffer.from(base64, "base64");
      const fileKey = `blog-video-mp4/${filename}`;
      const { url } = await storagePut(fileKey, buffer, contentType ?? "video/mp4");
      console.log(`[Worker] MP4 uploaded to S3: ${url} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
      res.json({ ok: true, url });
    } catch (err) {
      console.error("[Worker] MP4 upload failed:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // POST /api/worker/save-tokens — saves refreshed YouTube OAuth tokens from the worker
  app.post("/api/worker/save-tokens", async (req: Request, res: Response) => {
    if (!checkAuth(req, res)) return;

    const { tokens } = req.body as { tokens: object };
    if (!tokens) {
      res.status(400).json({ error: "tokens is required" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).json({ error: "DB unavailable" });
      return;
    }

    try {
      const { systemSettings } = await import("../drizzle/schema");
      const value = JSON.stringify(tokens);
      await db
        .insert(systemSettings)
        .values({ key: "youtube_oauth_tokens", value })
        .onDuplicateKeyUpdate({ set: { value } });
      console.log("[Worker] YouTube tokens saved to DB");
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
}
