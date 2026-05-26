/**
 * YouTube Data API v3 helpers
 * Handles OAuth2 token management and video uploads.
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
    scope: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"],
    prompt: "consent", // force refresh token on every auth
  });
}

// ─── Token persistence (stored in a local JSON file on the server) ────────────
// In production this persists across restarts because the file lives in the
// container's writable layer. For a more robust solution, store in DB.

const TOKEN_FILE = path.join(os.homedir(), ".youtube_tokens.json");

export function saveTokens(tokens: object) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

export function loadTokens(): Record<string, string> | null {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function hasValidTokens(): boolean {
  const tokens = loadTokens();
  return !!(tokens?.refresh_token);
}

export async function getAuthedClient() {
  const tokens = loadTokens();
  if (!tokens?.refresh_token) throw new Error("YouTube not authorised. Please authorise first.");
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
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
    https.get(videoUrl, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
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
    // Clean up temp file
    fs.unlink(tmpFile, () => {});
  }
}
