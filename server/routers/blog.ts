import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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
