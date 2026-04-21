/**
 * Recommended Products router
 * - Admin: full CRUD for products (password-gated)
 * - Public: list published products (with optional affiliate slug to resolve links)
 * - Affiliate: save/delete their own affiliate link for a product
 */
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { jwtVerify } from "jose";
import { ENV } from "../_core/env";
import {
  getAllRecommendedProducts,
  getPublishedRecommendedProducts,
  getRecommendedProductById,
  createRecommendedProduct,
  updateRecommendedProduct,
  deleteRecommendedProduct,
  getAffiliateProductLinks,
  upsertAffiliateProductLink,
  deleteAffiliateProductLink,
} from "../db";
import { getPemfAffiliateBySlug } from "../db";

const AFFILIATE_JWT_SECRET = ENV.cookieSecret + "_affiliate";
const affiliateSecret = new TextEncoder().encode(AFFILIATE_JWT_SECRET);
// Admin tokens are signed with the same secret as affiliate tokens (AFFILIATE_JWT_SECRET)
const adminSecret = affiliateSecret;

/** Verify the admin JWT token (same secret as pemfAffiliate router) */
async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, adminSecret);
    return payload.type === "pemf_admin";
  } catch {
    return false;
  }
}

async function verifyAffiliateToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, affiliateSecret);
    return (payload as any).affiliateId ?? null;
  } catch {
    return null;
  }
}

export const recommendedProductsRouter = router({
  /** Public: list all published products, optionally resolving affiliate links by slug */
  list: publicProcedure
    .input(z.object({ affiliateSlug: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const products = await getPublishedRecommendedProducts();
      if (!input?.affiliateSlug) {
        return products;
      }
      // Resolve affiliate's own links
      const affiliate = await getPemfAffiliateBySlug(input.affiliateSlug);
      if (!affiliate) return products;
      const affiliateLinks = await getAffiliateProductLinks(affiliate.id);
      const linkMap = new Map(affiliateLinks.map(l => [l.productId, l.affiliateUrl]));
      return products.map(p => ({
        ...p,
        resolvedUrl: p.isAffiliate
          ? (linkMap.get(p.id) ?? p.defaultAffiliateUrl ?? null)
          : p.defaultAffiliateUrl ?? null,
      }));
    }),

  /** Admin: list all products (including unpublished) */
  adminList: publicProcedure
    .input(z.object({ adminToken: z.string() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return getAllRecommendedProducts();
    }),

  /** Admin: create a product */
  adminCreate: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      name: z.string().min(1),
      description: z.string().min(1),
      shortDescription: z.string().optional(),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      isAffiliate: z.boolean().default(false),
      defaultAffiliateUrl: z.string().optional(),
      isPublished: z.boolean().default(true),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await createRecommendedProduct({
        name: input.name,
        description: input.description,
        shortDescription: input.shortDescription ?? null,
        imageUrl: input.imageUrl ?? null,
        category: input.category ?? null,
        isAffiliate: input.isAffiliate ? 1 : 0,
        defaultAffiliateUrl: input.defaultAffiliateUrl ?? null,
        isPublished: input.isPublished ? 1 : 0,
        sortOrder: input.sortOrder,
      });
      return { success: true };
    }),

  /** Admin: update a product */
  adminUpdate: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      isAffiliate: z.boolean().optional(),
      defaultAffiliateUrl: z.string().optional(),
      isPublished: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const { adminToken, id, isAffiliate, isPublished, ...rest } = input;
      const update: Record<string, any> = { ...rest };
      if (isAffiliate !== undefined) update.isAffiliate = isAffiliate ? 1 : 0;
      if (isPublished !== undefined) update.isPublished = isPublished ? 1 : 0;
      await updateRecommendedProduct(id, update);
      return { success: true };
    }),

  /** Admin: delete a product */
  adminDelete: publicProcedure
    .input(z.object({ adminToken: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await deleteRecommendedProduct(input.id);
      return { success: true };
    }),

  /** Affiliate: get their own product links */
  getMyLinks: publicProcedure
    .input(z.object({ affiliateToken: z.string() }))
    .query(async ({ input }) => {
      const affiliateId = await verifyAffiliateToken(input.affiliateToken);
      if (!affiliateId) throw new TRPCError({ code: "UNAUTHORIZED" });
      const products = await getPublishedRecommendedProducts();
      const affiliateLinks = await getAffiliateProductLinks(affiliateId);
      const linkMap = new Map(affiliateLinks.map(l => [l.productId, l.affiliateUrl]));
      // Only return affiliate products
      return products
        .filter(p => p.isAffiliate)
        .map(p => ({
          ...p,
          myUrl: linkMap.get(p.id) ?? "",
        }));
    }),

  /** Affiliate: save their link for a product */
  saveMyLink: publicProcedure
    .input(z.object({
      affiliateToken: z.string(),
      productId: z.number(),
      affiliateUrl: z.string().url("Please enter a valid URL"),
    }))
    .mutation(async ({ input }) => {
      const affiliateId = await verifyAffiliateToken(input.affiliateToken);
      if (!affiliateId) throw new TRPCError({ code: "UNAUTHORIZED" });
      await upsertAffiliateProductLink({
        affiliateId,
        productId: input.productId,
        affiliateUrl: input.affiliateUrl,
      });
      return { success: true };
    }),

  /** Admin: upload a product image to S3 and return the URL */
  adminUploadImage: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      fileName: z.string().max(255),
      fileBase64: z.string(),
      mimeType: z.string().max(100),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      const { storagePut } = await import("../storage");
      const buffer = Buffer.from(input.fileBase64, "base64");
      const suffix = Date.now().toString(36);
      const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `recommended-products/${suffix}-${safeFileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { success: true, url };
    }),

  /** Affiliate: remove their link for a product */
  removeMyLink: publicProcedure
    .input(z.object({
      affiliateToken: z.string(),
      productId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const affiliateId = await verifyAffiliateToken(input.affiliateToken);
      if (!affiliateId) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteAffiliateProductLink(affiliateId, input.productId);
      return { success: true };
    }),
});
