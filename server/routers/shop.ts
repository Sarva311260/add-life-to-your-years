import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
} from "../db";

export const shopRouter = router({
  /** Get all active products (public) */
  list: publicProcedure.query(async () => {
    return getActiveProducts();
  }),

  /** Get a single product by ID (public) */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await getProductById(input.id);
      if (!product || !product.isActive) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      return product;
    }),

  /** Admin: Create a new product */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(1),
        shortDescription: z.string().max(500).optional(),
        priceInCents: z.number().int().min(0),
        currency: z.string().length(3).default("AUD"),
        imageUrl: z.string().url().optional(),
        category: z.string().max(64).optional(),
        relatedRecommendations: z.array(z.number()).optional(),
        purchaseUrl: z.string().url().optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const id = await createProduct({
        name: input.name,
        description: input.description,
        shortDescription: input.shortDescription || null,
        priceInCents: input.priceInCents,
        currency: input.currency,
        imageUrl: input.imageUrl || null,
        category: input.category || null,
        relatedRecommendations: input.relatedRecommendations || null,
        purchaseUrl: input.purchaseUrl || null,
        sortOrder: input.sortOrder,
      });
      return { id };
    }),

  /** Admin: Update a product */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(1).optional(),
        shortDescription: z.string().max(500).optional(),
        priceInCents: z.number().int().min(0).optional(),
        imageUrl: z.string().url().optional(),
        category: z.string().max(64).optional(),
        relatedRecommendations: z.array(z.number()).optional(),
        purchaseUrl: z.string().url().optional(),
        isActive: z.number().min(0).max(1).optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { id, ...data } = input;
      await updateProduct(id, data as any);
      return { success: true };
    }),
});
