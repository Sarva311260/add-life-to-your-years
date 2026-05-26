import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

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
