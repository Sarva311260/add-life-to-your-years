#!/usr/bin/env node
/**
 * ============================================================
 *  Add Life to Your Years — Local Video Worker
 * ============================================================
 *
 * Runs on your Mac/PC. Polls the website every 30 seconds for
 * pending YouTube uploads, encodes the MP4 with ffmpeg, and
 * uploads it to YouTube.
 *
 * REQUIREMENTS:
 *   1. Node.js 18+ installed (https://nodejs.org)
 *   2. ffmpeg installed:
 *      - Mac:     brew install ffmpeg
 *      - Windows: https://ffmpeg.org/download.html  (add to PATH)
 *
 * SETUP (one time):
 *   1. Open Terminal / Command Prompt
 *   2. cd to the folder containing this file
 *   3. Run:  node video-worker.mjs
 *
 * That's it! Leave the terminal window open while you work.
 * The worker will automatically pick up any "Upload to YouTube"
 * jobs you queue from the admin panel.
 *
 * Press Ctrl+C to stop the worker.
 * ============================================================
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createRequire } from "module";
import https from "https";
import http from "http";
import { google } from "googleapis";

const execFileAsync = promisify(execFile);

// ─── Configuration ────────────────────────────────────────────────────────────
const SITE_URL = "https://addlifetoyouryears.org";
const WORKER_SECRET = "altyyy-worker-secret-2026";
const POLL_INTERVAL_MS = 30_000; // 30 seconds

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiGet(path) {
  const url = `${SITE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "x-worker-secret": WORKER_SECRET },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} → HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${SITE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-worker-secret": WORKER_SECRET,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buffer);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
  console.log(`  ✓ Downloaded ${sizeMB} MB → ${destPath}`);
}

function getFfmpegPath() {
  // Try system ffmpeg first
  return "ffmpeg";
}

async function uploadToS3(buffer, contentType, filename) {
  // Upload via the site's storage proxy — POST multipart to /api/worker/upload-mp4
  // We use a simple approach: base64 encode and send as JSON
  const base64 = buffer.toString("base64");
  const res = await fetch(`${SITE_URL}/api/worker/upload-mp4`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-worker-secret": WORKER_SECRET,
    },
    body: JSON.stringify({ base64, contentType, filename }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  const { url } = await res.json();
  return url;
}

// ─── YouTube upload ───────────────────────────────────────────────────────────

async function uploadToYouTube({ tokens, videoPath, title, description, tags, thumbnailUrl }) {
  const oauth2Client = new google.auth.OAuth2(
    // We use the tokens stored in the DB — no client ID/secret needed on the worker
    // because we're using the access_token directly
  );

  // Use the tokens from the database
  oauth2Client.setCredentials(tokens);

  // Save refreshed tokens back to the DB
  oauth2Client.on("tokens", async (newTokens) => {
    try {
      const merged = { ...tokens, ...newTokens };
      await apiPost("/api/worker/save-tokens", { tokens: merged });
      console.log("  ✓ YouTube tokens refreshed and saved");
    } catch (err) {
      console.warn("  ⚠ Failed to save refreshed tokens:", err.message);
    }
  });

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  console.log("  ↑ Uploading to YouTube...");
  const { createReadStream } = await import("fs");
  const videoStream = createReadStream(videoPath);

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags: tags ?? ["wellness", "health", "plant-based", "vitality", "longevity"],
        categoryId: "26",
        defaultLanguage: "en",
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      mimeType: "video/mp4",
      body: videoStream,
    },
  });

  const videoId = response.data.id;
  if (!videoId) throw new Error("YouTube did not return a video ID");
  console.log(`  ✓ YouTube upload complete! videoId=${videoId}`);

  // Set thumbnail
  if (thumbnailUrl) {
    try {
      console.log("  ↑ Setting thumbnail...");
      const thumbRes = await fetch(thumbnailUrl);
      if (thumbRes.ok) {
        const thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
        const { Readable } = await import("stream");
        const thumbStream = Readable.from(thumbBuffer);
        const ext = thumbnailUrl.match(/\.(png|webp)/i)?.[1]?.toLowerCase();
        const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        await youtube.thumbnails.set({
          videoId,
          media: { mimeType, body: thumbStream },
        });
        console.log("  ✓ Thumbnail set");
      }
    } catch (thumbErr) {
      console.warn("  ⚠ Thumbnail upload failed (non-fatal):", thumbErr.message);
    }
  }

  return videoId;
}

// ─── Main job processor ───────────────────────────────────────────────────────

async function processJob(job) {
  console.log(`\n📹 Processing: "${job.title}" (id=${job.id})`);
  console.log(`   Status: ${job.videoStatus}`);

  const tmpDir = await mkdtemp(join(tmpdir(), "altyyy-video-"));
  const imgPath = join(tmpDir, "cover.jpg");
  const audPath = join(tmpDir, "audio.mp3");
  const outPath = join(tmpDir, "output.mp4");

  try {
    // ── STEP 1: Encode MP4 if not already done ──────────────────────────────
    let videoMp4Url = job.videoMp4Url;

    if (job.videoStatus === "pending") {
      if (!job.audioUrl) throw new Error("No audio URL — generate audio first in the admin panel");
      if (!job.coverImageUrl) throw new Error("No cover image — add a cover image first in the admin panel");

      console.log("  ↓ Downloading cover image and audio...");
      await Promise.all([
        downloadToFile(job.coverImageUrl, imgPath),
        downloadToFile(job.audioUrl, audPath),
      ]);

      console.log("  ⚙ Encoding MP4 with ffmpeg (1fps, ultrafast)...");
      const ffmpeg = getFfmpegPath();
      const start = Date.now();

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
      ]);

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const stat = await import("fs").then(m => m.statSync(outPath));
      const sizeMB = (stat.size / 1024 / 1024).toFixed(1);
      console.log(`  ✓ Encoded in ${elapsed}s — ${sizeMB} MB`);

      // Upload MP4 to S3 via worker upload endpoint
      console.log("  ↑ Uploading MP4 to S3...");
      const videoBuffer = await readFile(outPath);
      videoMp4Url = await uploadToS3(videoBuffer, "video/mp4", `${job.slug}-${Date.now()}.mp4`);
      console.log(`  ✓ MP4 uploaded to S3: ${videoMp4Url}`);

      // Tell the site the MP4 is ready
      await apiPost("/api/worker/set-encoding", { id: job.id, videoMp4Url });
    } else {
      // encoding_done — MP4 already on S3, just need to upload to YouTube
      console.log("  ↓ Downloading encoded MP4 from S3...");
      await downloadToFile(videoMp4Url, outPath);
    }

    // ── STEP 2: Upload to YouTube ────────────────────────────────────────────
    console.log("  ↓ Fetching YouTube tokens from site...");
    const { tokens } = await apiGet("/api/worker/youtube-tokens");

    const description = [
      job.excerpt ?? "",
      "",
      `Read the full article: https://addlifetoyouryears.org/blog/${job.slug}`,
      "",
      "Add Life to Your Years — evidence-based health, wellness and vitality.",
      "Subscribe: https://www.youtube.com/@addlifetoyouryears",
      "Website: https://addlifetoyouryears.org",
    ].join("\n");

    const tags = job.tags
      ? job.tags.split(",").map(t => t.trim()).filter(Boolean)
      : ["wellness", "health", "plant-based", "vitality", "longevity"];

    const videoId = await uploadToYouTube({
      tokens,
      videoPath: outPath,
      title: job.title,
      description,
      tags,
      thumbnailUrl: job.coverImageUrl,
    });

    // ── STEP 3: Tell the site it's done ──────────────────────────────────────
    await apiPost("/api/worker/complete-job", { id: job.id, youtubeVideoId: videoId });
    console.log(`\n✅ Done! "${job.title}" is now on YouTube: https://www.youtube.com/watch?v=${videoId}`);

  } catch (err) {
    console.error(`\n❌ Failed: ${err.message}`);
    try {
      await apiPost("/api/worker/complete-job", { id: job.id, error: err.message });
    } catch (reportErr) {
      console.error("  Could not report error to site:", reportErr.message);
    }
  } finally {
    // Clean up temp files
    await Promise.allSettled([
      unlink(imgPath).catch(() => {}),
      unlink(audPath).catch(() => {}),
      unlink(outPath).catch(() => {}),
    ]);
  }
}

// ─── Poll loop ────────────────────────────────────────────────────────────────

let isProcessing = false;

async function poll() {
  if (isProcessing) return;

  try {
    const { job } = await apiGet("/api/worker/claim-job");

    if (!job) {
      process.stdout.write(".");
      return;
    }

    isProcessing = true;
    await processJob(job);
  } catch (err) {
    console.error(`\n⚠ Poll error: ${err.message}`);
  } finally {
    isProcessing = false;
  }
}

// ─── Startup ──────────────────────────────────────────────────────────────────

console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║   Add Life to Your Years — Local Video Worker            ║");
console.log("╠══════════════════════════════════════════════════════════╣");
console.log("║  Polling https://addlifetoyouryears.org every 30s        ║");
console.log("║  Press Ctrl+C to stop                                    ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log("");
console.log("Waiting for jobs (dots = polling, no jobs yet)...");

// Check site connectivity first
try {
  const res = await fetch(`${SITE_URL}/api/health`);
  if (res.ok) {
    const data = await res.json();
    console.log(`✓ Connected to site (DB: ${data.db})\n`);
  }
} catch (err) {
  console.error(`✗ Cannot reach ${SITE_URL} — check your internet connection`);
  process.exit(1);
}

// Start polling
setInterval(poll, POLL_INTERVAL_MS);
poll(); // Run immediately on startup
