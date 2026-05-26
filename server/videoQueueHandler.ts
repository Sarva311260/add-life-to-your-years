/**
 * Heartbeat handler: /api/scheduled/process-video-queue
 *
 * Triggered every 60 seconds by the Manus Heartbeat cron.
 * Picks up ONE blog post with videoStatus='pending' and processes it
 * (download image + audio → ffmpeg → S3 upload → mark done).
 *
 * The handler must complete within 2 minutes (Heartbeat timeout).
 * If a post takes longer, it will be retried on the next tick.
 */

import type { Request, Response } from "express";
import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import { eq, and, or } from "drizzle-orm";
import { storagePut } from "./storage";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createRequire } from "module";

const execFileAsync = promisify(execFile);

// Charlie voice ID on ElevenLabs
const ELEVENLABS_VOICE_ID = "IKne3meq5aSn9XLyUdCD";
const ELEVENLABS_MODEL = "eleven_turbo_v2_5";

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

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/`[^`]+`/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/^[|\s-]+$/gm, "")
    .replace(/\|/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function processVideoQueueHandler(req: Request, res: Response): Promise<void> {
  // Verify this is a legitimate Heartbeat call
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

  // Mark as in-progress (re-use 'pending' status, just update timestamp to prevent double-pick)
  await db.update(blogPosts)
    .set({ updatedAt: new Date() })
    .where(and(eq(blogPosts.id, post.id), eq(blogPosts.videoStatus, "pending")));

  try {
    // Ensure audio exists
    let audioUrl = post.audioUrl;
    if (!audioUrl) {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) throw new Error("ElevenLabs API key not configured");
      const cleanText = `${post.title}.\n\n${stripMarkdown(post.content)}`;
      console.log(`[VideoQueue] Generating audio for post ${post.id}...`);
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          model_id: ELEVENLABS_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`ElevenLabs error ${resp.status}: ${errText.substring(0, 200)}`);
      }
      const audioBuffer = Buffer.from(await resp.arrayBuffer());
      const audioKey = `blog-audio/${post.slug}-${Date.now()}.mp3`;
      const { url } = await storagePut(audioKey, audioBuffer, "audio/mpeg");
      audioUrl = url;
      await db.update(blogPosts).set({ audioUrl }).where(eq(blogPosts.id, post.id));
      console.log(`[VideoQueue] Audio saved for post ${post.id}`);
    }

    if (!post.coverImageUrl) throw new Error("Post has no cover image");

    // Download image and audio
    console.log(`[VideoQueue] Downloading assets for post ${post.id}...`);
    const [imgResp, audResp] = await Promise.all([
      fetch(post.coverImageUrl),
      fetch(audioUrl),
    ]);
    if (!imgResp.ok) throw new Error("Failed to download cover image");
    if (!audResp.ok) throw new Error("Failed to download audio");

    const [imgBuffer, audBuffer] = await Promise.all([
      imgResp.arrayBuffer().then(Buffer.from),
      audResp.arrayBuffer().then(Buffer.from),
    ]);

    const imgExt = post.coverImageUrl.match(/\.(jpe?g|png|webp)/i)?.[1] ?? "jpg";
    const tmpDir = await mkdtemp(join(tmpdir(), "blog-video-"));
    const imgPath = join(tmpDir, `cover.${imgExt}`);
    const audPath = join(tmpDir, "audio.mp3");
    const outPath = join(tmpDir, "output.mp4");

    try {
      await Promise.all([writeFile(imgPath, imgBuffer), writeFile(audPath, audBuffer)]);

      const ffmpeg = getFfmpegPath();
      console.log(`[VideoQueue] Running ffmpeg for post ${post.id}...`);
      await execFileAsync(ffmpeg, [
        "-loop", "1",
        "-i", imgPath,
        "-i", audPath,
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black",
        "-shortest",
        "-movflags", "+faststart",
        "-y",
        outPath,
      ], { timeout: 100_000 }); // 100s max (well within 2min Heartbeat limit)

      console.log(`[VideoQueue] Uploading video for post ${post.id}...`);
      const videoBuffer = await readFile(outPath);
      const videoKey = `blog-video/${post.slug}-${Date.now()}.mp4`;
      const { url: videoUrl } = await storagePut(videoKey, videoBuffer, "video/mp4");

      await db.update(blogPosts)
        .set({ videoUrl, videoStatus: "done", videoError: null })
        .where(eq(blogPosts.id, post.id));

      console.log(`[VideoQueue] Done! Post ${post.id} video: ${videoUrl}`);
      res.json({ ok: true, processed: 1, postId: post.id, videoUrl });
    } finally {
      await Promise.allSettled([unlink(imgPath), unlink(audPath), unlink(outPath)]);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[VideoQueue] Failed for post ${post.id}:`, msg);
    await db.update(blogPosts)
      .set({ videoStatus: "error", videoError: msg })
      .where(eq(blogPosts.id, post.id));
    // Return 200 so Heartbeat doesn't retry (the error is saved in DB for the user to see)
    res.json({ ok: false, error: msg, postId: post.id });
  }
}
