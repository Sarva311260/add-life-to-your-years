/**
 * Heartbeat handler: /api/scheduled/process-video-queue
 *
 * Triggered every 60 seconds by the Manus Heartbeat cron.
 * Picks up ONE blog post with videoStatus='pending' and uploads its audio
 * directly to YouTube (streaming from S3 URL — no temp file, no ffmpeg).
 *
 * The handler streams the audio directly from S3 to YouTube's upload API,
 * then sets the cover image as the thumbnail.
 */

import type { Request, Response } from "express";
import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { uploadVideoToYouTube } from "./youtube";

export async function processVideoQueueHandler(req: Request, res: Response): Promise<void> {
  const taskUid = req.headers["x-manus-cron-task-uid"] as string | undefined;
  console.log(`[VideoQueue] Triggered by Heartbeat, task_uid=${taskUid}`);

  const db = await getDb();
  if (!db) {
    res.status(500).json({ error: "DB unavailable" });
    return;
  }

  // Pick the oldest pending post
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.videoStatus, "pending"))
    .orderBy(blogPosts.updatedAt)
    .limit(1);

  if (!post) {
    console.log("[VideoQueue] No pending videos — nothing to do");
    res.json({ ok: true, processed: 0 });
    return;
  }

  console.log(`[VideoQueue] Processing post ${post.id}: "${post.title}"`);

  if (!post.audioUrl) {
    await db.update(blogPosts)
      .set({ videoStatus: "error", videoError: "No audio URL — generate audio first" })
      .where(eq(blogPosts.id, post.id));
    res.json({ ok: false, error: "No audio URL", postId: post.id });
    return;
  }

  // Mark as in-progress by bumping updatedAt to prevent double-pick on next tick
  await db.update(blogPosts)
    .set({ updatedAt: new Date() })
    .where(eq(blogPosts.id, post.id));

  try {
    const description = [
      post.excerpt ?? "",
      "",
      `Read the full article: https://addlifetoyouryears.org/blog/${post.slug}`,
      "",
      "Add Life to Your Years — evidence-based health, wellness and vitality.",
      "Subscribe: https://www.youtube.com/@addlifetoyouryears",
      "Website: https://addlifetoyouryears.org",
    ].join("\n");

    const tags = post.tags
      ? post.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : ["wellness", "health", "plant-based", "vitality", "longevity"];

    // Stream audio directly from S3 to YouTube — no temp file, no ffmpeg
    const videoId = await uploadVideoToYouTube({
      audioUrl: post.audioUrl,
      thumbnailUrl: post.coverImageUrl ?? undefined,
      title: post.title,
      description,
      tags,
    });

    await db.update(blogPosts)
      .set({
        youtubeVideoId: videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        videoStatus: "done",
        videoError: null,
      })
      .where(eq(blogPosts.id, post.id));

    console.log(`[VideoQueue] Published to YouTube: ${videoId} for post ${post.id}`);
    res.json({ ok: true, processed: 1, postId: post.id, videoId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[VideoQueue] Failed for post ${post.id}:`, msg);
    await db.update(blogPosts)
      .set({ videoStatus: "error", videoError: msg })
      .where(eq(blogPosts.id, post.id));
    // Return 200 so Heartbeat doesn't retry endlessly (error saved in DB)
    res.json({ ok: false, error: msg, postId: post.id });
  }
}
