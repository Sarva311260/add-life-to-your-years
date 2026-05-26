/**
 * YouTube Data API v3 helpers
 * Handles OAuth2 token management and video uploads.
 * Tokens are stored in the database (system_settings table) for persistence across deployments.
 */
import { google } from "googleapis";
import { ENV } from "./_core/env";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";

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
    prompt: "consent", // force refresh token on every auth
  });
}

// ─── Token persistence (stored in DB system_settings table) ──────────────────
const YOUTUBE_TOKEN_KEY = "youtube_oauth_tokens";

export async function saveTokens(tokens: object): Promise<void> {
  try {
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) throw new Error("No DB");
    // Use raw execute since system_settings is not in Drizzle schema
    await (db as unknown as { execute: (sql: string, params: unknown[]) => Promise<unknown> }).execute(
      "INSERT INTO system_settings (`key`, value, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()",
      [YOUTUBE_TOKEN_KEY, JSON.stringify(tokens)]
    );
    console.log("[YouTube] Tokens saved to database");
  } catch (err) {
    console.error("[YouTube] Failed to save tokens to DB, falling back to file:", err);
    const TOKEN_FILE = path.join(os.homedir(), ".youtube_tokens.json");
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
  }
}

export async function loadTokens(): Promise<Record<string, string> | null> {
  try {
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) throw new Error("No DB");
    const result = await (db as unknown as { execute: (sql: string, params: unknown[]) => Promise<unknown> }).execute(
      "SELECT value FROM system_settings WHERE `key` = ?",
      [YOUTUBE_TOKEN_KEY]
    );
    // MySQL2 returns [rows, fields]
    const rows = Array.isArray(result) ? result[0] : result;
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row || !(row as Record<string, string>).value) return null;
    return JSON.parse((row as Record<string, string>).value);
  } catch {
    // Fallback to file
    try {
      const TOKEN_FILE = path.join(os.homedir(), ".youtube_tokens.json");
      if (!fs.existsSync(TOKEN_FILE)) return null;
      return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    } catch {
      return null;
    }
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

// ─── Video upload ─────────────────────────────────────────────────────────────

export async function uploadVideoToYouTube({
  videoUrl,
  title,
  description,
  tags,
}: {
  videoUrl: string;
  title: string;
  description: string;
  tags?: string[];
}): Promise<string> {
  const auth = await getAuthedClient();
  const youtube = google.youtube({ version: "v3", auth });

  // Download video to a temp file first (YouTube API needs a readable stream)
  const tmpFile = path.join(os.tmpdir(), `yt_upload_${Date.now()}.mp4`);

  await new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(tmpFile);
    const request = https.get(videoUrl, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Failed to download video: HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });
    request.on("error", (err) => {
      fs.unlink(tmpFile, () => {});
      reject(err);
    });
  });

  try {
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags: tags ?? ["wellness", "health", "plant-based", "vitality"],
          categoryId: "26", // How-to & Style
          defaultLanguage: "en",
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: "video/mp4",
        body: fs.createReadStream(tmpFile),
      },
    });

    const videoId = response.data.id;
    if (!videoId) throw new Error("YouTube did not return a video ID");
    return videoId;
  } finally {
    fs.unlink(tmpFile, () => {});
  }
}
