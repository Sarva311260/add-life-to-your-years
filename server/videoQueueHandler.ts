/**
 * Heartbeat handler: /api/scheduled/process-video-queue
 *
 * Two-tick approach to handle long audio files within the 2-minute Heartbeat timeout:
 *
 * TICK 1 (videoStatus='pending', videoMp4Url=null):
 *   - Download cover image + audio from S3
 *   - Encode MP4 with ffmpeg ultrafast preset (~15s regardless of audio length)
 *   - Upload MP4 to S3, save URL to videoMp4Url
 *   - Set videoStatus='encoding_done'
 *
 * TICK 2 (videoStatus='encoding_done', videoMp4Url set):
 *   - Stream MP4 from S3 URL directly to YouTube API
 *   - Set thumbnail, save youtubeVideoId, set videoStatus='done'
 */

import type { Request, Response } from "express";
import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import { eq, or } from "drizzle-orm";
import { uploadVideoToYouTube } from "./youtube";
import { storagePut } from "./storage";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createRequire } from "module";

const execFileAsync = promisify(execFile);

function getFfmpegPath(): string {
  try {
    const req = createRequire(import.meta.url);
    const { path: p } = req("@ffmpeg-installer/ffmpeg") as { path: string };
    if (p) return p;
  } catch { /* fall through */ }
  try {
    const req = createRequire(import.meta.url);
    const p = req("ffmpeg-static") as string;
    if (p) return p;
  } catch { /* fall through */ }
  return "ffmpeg";
}

export async function processVideoQueueHandler(req: Request, res: Response): Promise<void> {
  const taskUid = req.headers["x-manus-cron-task-uid"] as string | undefined;
  console.log(`[VideoQueue] Triggered by Heartbeat, task_uid=${taskUid}`);

  const db = await getDb();
  if (!db) {
    res.status(500).json({ error: "DB unavailable" });
    return;
  }

  // Pick the oldest post that needs work (either pending or encoding_done)
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
    console.log("[VideoQueue] No pending videos — nothing to do");
    res.json({ ok: true, processed: 0 });
    return;
  }

  console.log(`[VideoQueue] Post ${post.id} "${post.title}" — status: ${post.videoStatus}`);

  // ─── TICK 2: Upload encoded MP4 to YouTube ────────────────────────────────
  if (post.videoStatus === "encoding_done" && post.videoMp4Url) {
    console.log(`[VideoQueue] TICK 2: Uploading MP4 to YouTube for post ${post.id}...`);

    // Bump updatedAt to prevent double-pick
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

      const videoId = await uploadVideoToYouTube({
        videoMp4Url: post.videoMp4Url,
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

      console.log(`[VideoQueue] TICK 2 done! YouTube videoId=${videoId} for post ${post.id}`);
      res.json({ ok: true, processed: 1, tick: 2, postId: post.id, videoId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[VideoQueue] TICK 2 failed for post ${post.id}:`, msg);
      await db.update(blogPosts)
        .set({ videoStatus: "error", videoError: `YouTube upload failed: ${msg}` })
        .where(eq(blogPosts.id, post.id));
      res.json({ ok: false, error: msg, tick: 2, postId: post.id });
    }
    return;
  }

  // ─── TICK 1: Encode MP4 with ffmpeg and save to S3 ───────────────────────
  if (post.videoStatus === "pending") {
    if (!post.audioUrl) {
      await db.update(blogPosts)
        .set({ videoStatus: "error", videoError: "No audio URL — generate audio first" })
        .where(eq(blogPosts.id, post.id));
      res.json({ ok: false, error: "No audio URL", postId: post.id });
      return;
    }
    if (!post.coverImageUrl) {
      await db.update(blogPosts)
        .set({ videoStatus: "error", videoError: "No cover image — add a cover image first" })
        .where(eq(blogPosts.id, post.id));
      res.json({ ok: false, error: "No cover image", postId: post.id });
      return;
    }

    // Bump updatedAt to prevent double-pick
    await db.update(blogPosts)
      .set({ updatedAt: new Date() })
      .where(eq(blogPosts.id, post.id));

    const tmpDir = await mkdtemp(join(tmpdir(), "blog-video-"));
    const imgPath = join(tmpDir, "cover.jpg");
    const audPath = join(tmpDir, "audio.mp3");
    const outPath = join(tmpDir, "output.mp4");

    try {
      console.log(`[VideoQueue] TICK 1: Downloading assets for post ${post.id}...`);
      const [imgResp, audResp] = await Promise.all([
        fetch(post.coverImageUrl),
        fetch(post.audioUrl),
      ]);
      if (!imgResp.ok) throw new Error(`Failed to download cover image: HTTP ${imgResp.status}`);
      if (!audResp.ok) throw new Error(`Failed to download audio: HTTP ${audResp.status}`);

      const [imgBuffer, audBuffer] = await Promise.all([
        imgResp.arrayBuffer().then(Buffer.from),
        audResp.arrayBuffer().then(Buffer.from),
      ]);
      await Promise.all([writeFile(imgPath, imgBuffer), writeFile(audPath, audBuffer)]);

      // ultrafast preset — ~15 seconds for any audio length
      const ffmpeg = getFfmpegPath();
      console.log(`[VideoQueue] TICK 1: Encoding MP4 (ultrafast) for post ${post.id}...`);
      // -r 1 = 1 frame per second (still image video) — encodes ~30x faster than 30fps
      // For a 27-min audio: ~30s on sandbox, ~90s on Cloud Run 1vCPU — within 2min Heartbeat limit
      await execFileAsync(ffmpeg, [
        "-loop", "1",
        "-i", imgPath,
        "-i", audPath,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-tune", "stillimage",
        "-r", "1",
        "-c:a", "aac",
        "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black",
        "-shortest",
        "-movflags", "+faststart",
        "-y",
        outPath,
      ], { timeout: 110_000 }); // 110s max — within 2min Heartbeat limit

      console.log(`[VideoQueue] TICK 1: Uploading MP4 to S3 for post ${post.id}...`);
      const videoBuffer = await readFile(outPath);
      const videoKey = `blog-video-mp4/${post.slug}-${Date.now()}.mp4`;
      const { url: videoMp4Url } = await storagePut(videoKey, videoBuffer, "video/mp4");

      await db.update(blogPosts)
        .set({ videoMp4Url, videoStatus: "encoding_done" })
        .where(eq(blogPosts.id, post.id));

      console.log(`[VideoQueue] TICK 1 done! MP4 saved to S3 for post ${post.id}. Next tick will upload to YouTube.`);
      res.json({ ok: true, processed: 1, tick: 1, postId: post.id, videoMp4Url });

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[VideoQueue] TICK 1 failed for post ${post.id}:`, msg);
      await db.update(blogPosts)
        .set({ videoStatus: "error", videoError: `Encoding failed: ${msg}` })
        .where(eq(blogPosts.id, post.id));
      res.json({ ok: false, error: msg, tick: 1, postId: post.id });
    } finally {
      await Promise.allSettled([
        unlink(imgPath).catch(() => {}),
        unlink(audPath).catch(() => {}),
        unlink(outPath).catch(() => {}),
      ]);
    }
    return;
  }

  res.json({ ok: true, processed: 0 });
}
