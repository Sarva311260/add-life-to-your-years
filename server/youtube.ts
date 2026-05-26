/**
 * YouTube Data API v3 helpers
 * Handles OAuth2 token management and video uploads.
 * Tokens are stored in the database (system_settings table via Drizzle) for persistence across deployments.
 */
import { google } from "googleapis";
import { ENV } from "./_core/env";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { systemSettings } from "../drizzle/schema";

// ─── OAuth2 client ────────────────────────────────────────────────────────────

export const YOUTUBE_REDIRECT_URI = "https://addlifetoyouryears.org/api/youtube/callback";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    YOUTUBE_REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube",
    ],
    prompt: "consent",
  });
}

// ─── Token persistence via Drizzle ORM ───────────────────────────────────────
const YOUTUBE_TOKEN_KEY = "youtube_oauth_tokens";

export async function saveTokens(tokens: object): Promise<void> {
  console.log("[YouTube] Attempting to save tokens to DB...");
  const db = await getDb();
  if (!db) {
    console.error("[YouTube] saveTokens: getDb() returned null — cannot save tokens");
    throw new Error("Database connection unavailable");
  }
  const value = JSON.stringify(tokens);
  try {
    await db
      .insert(systemSettings)
      .values({ key: YOUTUBE_TOKEN_KEY, value })
      .onDuplicateKeyUpdate({ set: { value } });
    console.log("[YouTube] Tokens saved to database successfully");
  } catch (err) {
    console.error("[YouTube] Failed to save tokens to DB:", err);
    throw err;
  }
}

export async function loadTokens(): Promise<Record<string, string> | null> {
  const db = await getDb();
  if (!db) {
    console.error("[YouTube] loadTokens: getDb() returned null");
    return null;
  }
  try {
    const rows = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, YOUTUBE_TOKEN_KEY))
      .limit(1);
    if (!rows.length || !rows[0].value) {
      console.log("[YouTube] No tokens found in DB");
      return null;
    }
    return JSON.parse(rows[0].value);
  } catch (err) {
    console.error("[YouTube] Failed to load tokens from DB:", err);
    return null;
  }
}

export async function hasValidTokens(): Promise<boolean> {
  const tokens = await loadTokens();
  return !!(tokens?.refresh_token);
}

export async function getAuthedClient() {
  const tokens = await loadTokens();
  if (!tokens?.refresh_token) {
    throw new Error("YouTube not authorised. Please connect YouTube first.");
  }
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  // Auto-save refreshed tokens
  oauth2Client.on("tokens", (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    saveTokens(merged).catch(console.error);
  });
  return oauth2Client;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload an audio file (MP3) directly to YouTube.
 * YouTube accepts audio-only uploads and displays the cover image as a static thumbnail.
 * No ffmpeg encoding needed — YouTube handles all processing on their end.
 *
 * @param audioUrl  Public URL of the MP3 file (from S3)
 * @param thumbnailUrl  Public URL of the cover image (JPEG/PNG/WebP)
 * @param title  Video title
 * @param description  Video description
 * @param tags  Optional tags
 * @returns YouTube video ID
 */
export async function uploadVideoToYouTube({
  audioUrl,
  thumbnailUrl,
  title,
  description,
  tags,
}: {
  audioUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  tags?: string[];
}): Promise<string> {
  const auth = await getAuthedClient();
  const youtube = google.youtube({ version: "v3", auth });

  // Download audio to a temp file (YouTube API needs a readable stream)
  const tmpAudio = path.join(os.tmpdir(), `yt_audio_${Date.now()}.mp3`);
  console.log(`[YouTube] Downloading audio from ${audioUrl}...`);

  await new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(tmpAudio);
    const request = https.get(audioUrl, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Failed to download audio: HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    });
    request.on("error", (err) => { fs.unlink(tmpAudio, () => {}); reject(err); });
  });

  console.log(`[YouTube] Uploading audio to YouTube...`);
  let videoId: string;
  try {
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags: tags ?? ["wellness", "health", "plant-based", "vitality", "add life to your years"],
          categoryId: "26", // Howto & Style
          defaultLanguage: "en",
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: "audio/mpeg",
        body: fs.createReadStream(tmpAudio),
      },
    });

    videoId = response.data.id!;
    if (!videoId) throw new Error("YouTube did not return a video ID");
    console.log(`[YouTube] Audio uploaded successfully, videoId=${videoId}`);
  } finally {
    fs.unlink(tmpAudio, () => {});
  }

  // Set the cover image as the video thumbnail
  if (thumbnailUrl) {
    try {
      console.log(`[YouTube] Setting thumbnail from ${thumbnailUrl}...`);
      const tmpThumb = path.join(os.tmpdir(), `yt_thumb_${Date.now()}.jpg`);
      await new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(tmpThumb);
        const request = https.get(thumbnailUrl, (res) => {
          res.pipe(file);
          file.on("finish", () => { file.close(); resolve(); });
        });
        request.on("error", reject);
      });
      const ext = thumbnailUrl.match(/\.(png|webp)/i)?.[1]?.toLowerCase();
      const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      await youtube.thumbnails.set({
        videoId,
        media: { mimeType, body: fs.createReadStream(tmpThumb) },
      });
      fs.unlink(tmpThumb, () => {});
      console.log(`[YouTube] Thumbnail set for videoId=${videoId}`);
    } catch (thumbErr) {
      // Thumbnail upload is non-critical — log but don't fail the whole upload
      console.warn(`[YouTube] Thumbnail upload failed (non-fatal):`, thumbErr);
    }
  }

  return videoId;
}
