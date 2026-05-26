import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createRequire } from "module";

const execFileAsync = promisify(execFile);

/** Get the ffmpeg binary path — prefer ffmpeg-static, fall back to system ffmpeg */
function getFfmpegPath(): string {
  try {
    const require = createRequire(import.meta.url);
    const p = require("ffmpeg-static") as string;
    if (p) return p;
  } catch {
    // fall through
  }
  return "ffmpeg";
}

// Charlie voice ID on ElevenLabs
const ELEVENLABS_VOICE_ID = "IKne3meq5aSn9XLyUdCD";
const ELEVENLABS_MODEL = "eleven_turbo_v2_5";

/** Strip Markdown formatting so ElevenLabs reads clean prose */
function stripMarkdown(md: string): string {
  return md
    // Remove headings
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italic
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // Remove inline code
    .replace(/`[^`]+`/g, "")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Remove blockquote markers
    .replace(/^>\s*/gm, "")
    // Remove table separators
    .replace(/^[|\s-]+$/gm, "")
    // Remove table pipes
    .replace(/\|/g, " ")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const blogRouter = router({
  /** List all published posts (public) */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const posts = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        tags: blogPosts.tags,
        coverImageUrl: blogPosts.coverImageUrl,
        bookAnchorId: blogPosts.bookAnchorId,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, 1))
      .orderBy(desc(blogPosts.publishedAt));
    return posts;
  }),

  /** Get a single post by slug (public) */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug))
        .limit(1);
      return post ?? null;
    }),

  /** List ALL posts including drafts (admin only) */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) return [];
    const posts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt));
    return posts;
  }),

  /** Create a new post (admin only) */
  create: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        tags: z.string().default(""),
        coverImageUrl: z.string().default(""),
        bookAnchorId: z.string().default(""),
        published: z.number().int().min(0).max(1).default(1),
        publishedAt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
      await db.insert(blogPosts).values({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        tags: input.tags,
        coverImageUrl: input.coverImageUrl,
        bookAnchorId: input.bookAnchorId,
        published: input.published,
        publishedAt,
      });
      return { success: true };
    }),

  /** Generate audio for a blog post using ElevenLabs TTS (admin only) */
  generateAudio: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "ElevenLabs API key not configured" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Fetch the post
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      // Build clean text: title + content
      const cleanText = `${post.title}.\n\n${stripMarkdown(post.content)}`;

      // Call ElevenLabs TTS
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: ELEVENLABS_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `ElevenLabs error ${resp.status}: ${errText.substring(0, 200)}`,
        });
      }

      // Upload to S3
      const audioBuffer = Buffer.from(await resp.arrayBuffer());
      const fileKey = `blog-audio/${post.slug}-${Date.now()}.mp3`;
      const { url } = await storagePut(fileKey, audioBuffer, "audio/mpeg");

      // Save URL to database
      await db.update(blogPosts).set({ audioUrl: url }).where(eq(blogPosts.id, input.id));

      return { success: true, audioUrl: url };
    }),

  /** Generate video for a blog post: hero image + ElevenLabs audio → MP4 (admin only) */
  generateVideo: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Fetch the post
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      if (!post.coverImageUrl) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Post has no cover image — add a hero image first" });
      }

      // Ensure audio exists (generate if missing)
      let audioUrl = post.audioUrl;
      if (!audioUrl) {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "ElevenLabs API key not configured" });
        const cleanText = `${post.title}.\n\n${stripMarkdown(post.content)}`;
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
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `ElevenLabs error ${resp.status}: ${errText.substring(0, 200)}` });
        }
        const audioBuffer = Buffer.from(await resp.arrayBuffer());
        const audioKey = `blog-audio/${post.slug}-${Date.now()}.mp3`;
        const { url } = await storagePut(audioKey, audioBuffer, "audio/mpeg");
        audioUrl = url;
        await db.update(blogPosts).set({ audioUrl }).where(eq(blogPosts.id, input.id));
      }

      // Download hero image
      const imgResp = await fetch(post.coverImageUrl);
      if (!imgResp.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to download cover image" });
      const imgBuffer = Buffer.from(await imgResp.arrayBuffer());
      const imgExt = post.coverImageUrl.match(/\.(jpe?g|png|webp)/i)?.[1] ?? "jpg";

      // Download audio
      const audResp = await fetch(audioUrl);
      if (!audResp.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to download audio" });
      const audBuffer = Buffer.from(await audResp.arrayBuffer());

      // Write temp files
      const tmpDir = await mkdtemp(join(tmpdir(), "blog-video-"));
      const imgPath = join(tmpDir, `cover.${imgExt}`);
      const audPath = join(tmpDir, "audio.mp3");
      const outPath = join(tmpDir, "output.mp4");

      try {
        await writeFile(imgPath, imgBuffer);
        await writeFile(audPath, audBuffer);

        // Run ffmpeg: static image + audio → MP4 (H.264 + AAC, 1080p max, YouTube-compatible)
        const ffmpeg = getFfmpegPath();
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
        ], { timeout: 600_000 }); // 10 min max

        // Upload to S3
        const videoBuffer = await readFile(outPath);
        const videoKey = `blog-video/${post.slug}-${Date.now()}.mp4`;
        const { url: videoUrl } = await storagePut(videoKey, videoBuffer, "video/mp4");

        // Save URL to database
        await db.update(blogPosts).set({ videoUrl }).where(eq(blogPosts.id, input.id));

        return { success: true, videoUrl };
      } finally {
        // Cleanup temp files
        await Promise.allSettled([unlink(imgPath), unlink(audPath), unlink(outPath)]);
      }
    }),

  /** Update an existing post (admin only) */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        slug: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        tags: z.string().optional(),
        coverImageUrl: z.string().optional(),
        bookAnchorId: z.string().optional(),
        published: z.number().int().min(0).max(1).optional(),
        publishedAt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, publishedAt: publishedAtStr, ...rest } = input;
      const updates: Record<string, unknown> = { ...rest };
      if (publishedAtStr) updates.publishedAt = new Date(publishedAtStr);
      await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id));
      return { success: true };
    }),
});
