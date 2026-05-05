/**
 * Merge Tag System
 * ─────────────────────────────────────────────────────────────────────────────
 * Three layers of tags:
 *
 * 1. SYSTEM TAGS — auto-resolved from context (prospect, affiliate data)
 *    e.g. {{first_name}}, {{affiliate_name}}, {{affiliate_phone}}
 *
 * 2. GLOBAL TAGS — admin-defined, available to all affiliates
 *    e.g. {{pemf_link}}, {{redox_link}}, {{masterpeace_link}}
 *    Stored in crm_merge_tags table.
 *
 * 3. AFFILIATE CUSTOM LINKS — per-affiliate overrides or additions
 *    e.g. {{my_booking_link}}, {{my_calendar}}
 *    Stored in affiliate_custom_links table.
 *    If tagKey matches a global tag, it overrides the default for that affiliate.
 *
 * 4. ASSETS — shared video/document library
 *    e.g. {{video_redox}}, {{pdf_guide}}
 *    Stored in crm_assets table.
 *    When substituted, generates an HTML snippet (link or embed).
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { crmMergeTags, affiliateCustomLinks, crmAssets } from "../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";
import { getPemfAffiliateById } from "../db";

async function getD() {
  const d = await getDb();
  if (!d) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return d;
}

const ADMIN_PASSWORD = process.env.PEMF_ADMIN_PASSWORD || "pemf-admin-2024";
const AFFILIATE_JWT_SECRET = ENV.cookieSecret + "_affiliate";
const affiliateSecret = new TextEncoder().encode(AFFILIATE_JWT_SECRET);

async function verifyAffiliateToken(token: string): Promise<{ affiliateId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, affiliateSecret);
    if (payload.type === "affiliate" && typeof payload.affiliateId === "number") {
      return { affiliateId: payload.affiliateId };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── DB Helpers ──────────────────────────────────────────────────────────────

export async function getAllGlobalMergeTags() {
  return (await getD()).select().from(crmMergeTags).where(eq(crmMergeTags.isActive, 1)).orderBy(asc(crmMergeTags.sortOrder));
}

export async function getAffiliateCustomLinks(affiliateId: number) {
  return (await getD()).select().from(affiliateCustomLinks).where(eq(affiliateCustomLinks.affiliateId, affiliateId)).orderBy(asc(affiliateCustomLinks.createdAt));
}

export async function getAllCrmAssets() {
  return (await getD()).select().from(crmAssets).where(eq(crmAssets.isActive, 1)).orderBy(asc(crmAssets.sortOrder));
}

// ─── Merge Substitution Engine ───────────────────────────────────────────────

export interface MergeContext {
  /** The prospect/lead receiving the email */
  prospect?: { name?: string; email?: string; phone?: string };
  /** The affiliate sending the email */
  affiliate?: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    slug?: string;
    aseaCartUrl?: string | null;
  };
  /** Base URL of the site (e.g. https://addlifetoyouryears.org) */
  origin?: string;
}

/**
 * Resolve all merge tags for a given affiliate + prospect context.
 * Returns a map of tagKey → resolved value.
 */
export async function resolveMergeTags(ctx: MergeContext): Promise<Record<string, string>> {
  const tags: Record<string, string> = {};
  const origin = ctx.origin || "https://addlifetoyouryears.org";
  const slug = ctx.affiliate?.slug || "";

  // 1. System tags
  if (ctx.prospect) {
    const firstName = ctx.prospect.name?.split(" ")[0] || ctx.prospect.name || "";
    tags["first_name"] = firstName;
    tags["full_name"] = ctx.prospect.name || "";
    tags["prospect_email"] = ctx.prospect.email || "";
    tags["prospect_phone"] = ctx.prospect.phone || "";
  }
  if (ctx.affiliate) {
    tags["affiliate_name"] = ctx.affiliate.name || "";
    tags["affiliate_email"] = ctx.affiliate.email || "";
    tags["affiliate_phone"] = ctx.affiliate.phone || "";
    tags["pemf_link"] = slug ? `${origin}/pemf/${slug}` : `${origin}/pemf`;
    tags["redox_link"] = slug ? `${origin}/redox/${slug}` : `${origin}/redox`;
    tags["olylife_link"] = slug ? `${origin}/olylife/${slug}` : `${origin}/olylife`;
    tags["book_link"] = slug ? `${origin}/book?ref=${slug}` : `${origin}/book`;
    tags["assessment_link"] = slug ? `${origin}/evaluate?ref=${slug}` : `${origin}/evaluate`;
    tags["site_link"] = origin;
  }

  // 2. Global merge tags from DB (may override system defaults)
  const globalTags = await getAllGlobalMergeTags();
  for (const tag of globalTags) {
    if (tag.defaultValue) {
      tags[tag.tagKey] = tag.defaultValue;
    }
  }

  // 3. Affiliate custom links (override global tags or add new ones)
  if (ctx.affiliate?.id) {
    const customLinks = await getAffiliateCustomLinks(ctx.affiliate.id);
    for (const link of customLinks) {
      tags[link.tagKey] = link.value;
    }
  }

  // 4. Asset tags — generate HTML snippets
  // Assets are inserted by affiliates as {{asset_tagKey}} (with the "asset_" prefix).
  // We store the resolved HTML under BOTH the raw tagKey and the "asset_" prefixed key
  // so both {{video_water_1}} and {{asset_video_water_1}} resolve correctly.
  const assets = await getAllCrmAssets();
  for (const asset of assets) {
    let html: string;
    if (asset.embedHtml) {
      html = asset.embedHtml;
    } else if (asset.assetType === "video") {
      html = `<a href="${asset.url}" style="display:inline-block;background:#0ea5e9;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">▶ Watch: ${asset.title}</a>`;
    } else if (asset.assetType === "pdf") {
      html = `<a href="${asset.url}" style="display:inline-block;background:#6366f1;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">📄 Download: ${asset.title}</a>`;
    } else {
      html = `<a href="${asset.url}">${asset.title}</a>`;
    }
    // Register under raw tagKey (e.g. video_water_1)
    tags[asset.tagKey] = html;
    // Also register under asset_ prefix (e.g. asset_video_water_1) — this is what the Insert picker inserts
    tags[`asset_${asset.tagKey}`] = html;
  }

  return tags;
}

/**
 * Substitute all {{tag_key}} occurrences in a string with resolved values.
 * Unknown tags are left as-is (not removed).
 */
export function substituteMergeTags(text: string, tags: Record<string, string>): string {
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    return key in tags ? tags[key] : match;
  });
}

/**
 * Full pipeline: resolve tags for context, then substitute in subject + body.
 */
export async function applyMergeTags(
  subject: string,
  body: string,
  ctx: MergeContext
): Promise<{ subject: string; body: string }> {
  const tags = await resolveMergeTags(ctx);
  return {
    subject: substituteMergeTags(subject, tags),
    body: substituteMergeTags(body, tags),
  };
}

// ─── tRPC Router ─────────────────────────────────────────────────────────────

export const mergeTagsRouter = router({

  // ─── PUBLIC: Get all tags for the picker (global + system reference) ──────
  getAllTags: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const [globalTags, customLinks, assets] = await Promise.all([
        getAllGlobalMergeTags(),
        getAffiliateCustomLinks(payload.affiliateId),
        getAllCrmAssets(),
      ]);
      const systemTags = [
        { tagKey: "first_name", label: "Prospect First Name", category: "system", description: "The lead's first name" },
        { tagKey: "full_name", label: "Prospect Full Name", category: "system", description: "The lead's full name" },
        { tagKey: "prospect_email", label: "Prospect Email", category: "system", description: "The lead's email address" },
        { tagKey: "affiliate_name", label: "Your Name", category: "system", description: "Your full name" },
        { tagKey: "affiliate_email", label: "Your Email", category: "system", description: "Your email address" },
        { tagKey: "affiliate_phone", label: "Your Phone", category: "system", description: "Your phone number" },
        { tagKey: "pemf_link", label: "Your PEMF Page Link", category: "system", description: "Your personalised PEMF page URL" },
        { tagKey: "redox_link", label: "Your Redox Page Link", category: "system", description: "Your personalised Redox/ASEA page URL" },
        { tagKey: "olylife_link", label: "Your OlyLife Page Link", category: "system", description: "Your personalised OlyLife page URL" },
        { tagKey: "book_link", label: "Read the Book Link", category: "system", description: "Your personalised link to the book (tracks affiliate credit)" },
        { tagKey: "assessment_link", label: "Self-Assessment Link", category: "system", description: "Your personalised link to the self-assessment" },
        { tagKey: "site_link", label: "Main Site Link", category: "system", description: "https://addlifetoyouryears.org" },
      ];
      return { systemTags, globalTags, customLinks, assets };
    }),

  // ─── AFFILIATE: Manage custom links ──────────────────────────────────────
  getMyCustomLinks: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getAffiliateCustomLinks(payload.affiliateId);
    }),

  upsertCustomLink: publicProcedure
    .input(z.object({
      token: z.string(),
      id: z.number().optional(),
      tagKey: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, "Tag key must be lowercase letters, numbers and underscores only"),
      label: z.string().min(1).max(255),
      value: z.string().min(1),
      category: z.enum(["link", "text"]).default("link"),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (input.id) {
        // Update existing
        await (await getD()).update(affiliateCustomLinks)
          .set({ tagKey: input.tagKey, label: input.label, value: input.value, category: input.category })
          .where(and(eq(affiliateCustomLinks.id, input.id), eq(affiliateCustomLinks.affiliateId, payload.affiliateId)));
      } else {
        // Insert new
        await (await getD()).insert(affiliateCustomLinks).values({
          affiliateId: payload.affiliateId,
          tagKey: input.tagKey,
          label: input.label,
          value: input.value,
          category: input.category,
        });
      }
      return { success: true };
    }),

  deleteCustomLink: publicProcedure
    .input(z.object({ token: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      await (await getD()).delete(affiliateCustomLinks)
        .where(and(eq(affiliateCustomLinks.id, input.id), eq(affiliateCustomLinks.affiliateId, payload.affiliateId)));
      return { success: true };
    }),

  // ─── ADMIN: Manage global merge tags ─────────────────────────────────────
  adminGetAllTags: publicProcedure
    .input(z.object({ adminPassword: z.string() }))
    .query(async ({ input }) => {
      if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED" });
      const [globalTags, assets] = await Promise.all([
        getAllGlobalMergeTags(),
        getAllCrmAssets(),
      ]);
      const systemTags = [
        { tagKey: "first_name", label: "Prospect First Name", category: "system", description: "The lead's first name" },
        { tagKey: "full_name", label: "Prospect Full Name", category: "system", description: "The lead's full name" },
        { tagKey: "prospect_email", label: "Prospect Email", category: "system", description: "The lead's email address" },
        { tagKey: "affiliate_name", label: "Affiliate Name", category: "system", description: "The affiliate's full name" },
        { tagKey: "affiliate_email", label: "Affiliate Email", category: "system", description: "The affiliate's email address" },
        { tagKey: "affiliate_phone", label: "Affiliate Phone", category: "system", description: "The affiliate's phone number" },
        { tagKey: "pemf_link", label: "Affiliate PEMF Page Link", category: "system", description: "The affiliate's personalised PEMF page URL" },
        { tagKey: "redox_link", label: "Affiliate Redox Page Link", category: "system", description: "The affiliate's personalised Redox/ASEA page URL" },
        { tagKey: "olylife_link", label: "Affiliate OlyLife Page Link", category: "system", description: "The affiliate's personalised OlyLife page URL" },
        { tagKey: "book_link", label: "Read the Book Link", category: "system", description: "The affiliate's personalised link to the book" },
        { tagKey: "assessment_link", label: "Self-Assessment Link", category: "system", description: "The affiliate's personalised link to the self-assessment" },
        { tagKey: "site_link", label: "Main Site Link", category: "system", description: "https://addlifetoyouryears.org" },
      ];
      return { systemTags, globalTags, customLinks: [], assets };
    }),

  adminUpsertTag: publicProcedure
    .input(z.object({
      adminPassword: z.string(),
      id: z.number().optional(),
      tagKey: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, "Tag key must be lowercase letters, numbers and underscores only"),
      label: z.string().min(1).max(255),
      defaultValue: z.string().optional(),
      category: z.enum(["link", "text", "asset"]).default("link"),
      description: z.string().max(512).optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (input.id) {
        await (await getD()).update(crmMergeTags).set({
          tagKey: input.tagKey, label: input.label, defaultValue: input.defaultValue || null,
          category: input.category, description: input.description || null, sortOrder: input.sortOrder,
        }).where(eq(crmMergeTags.id, input.id));
      } else {
        await (await getD()).insert(crmMergeTags).values({
          tagKey: input.tagKey, label: input.label, defaultValue: input.defaultValue || null,
          category: input.category, description: input.description || null, sortOrder: input.sortOrder,
        });
      }
      return { success: true };
    }),

  adminDeleteTag: publicProcedure
    .input(z.object({ adminPassword: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED" });
      await (await getD()).delete(crmMergeTags).where(eq(crmMergeTags.id, input.id));
      return { success: true };
    }),

  adminToggleTag: publicProcedure
    .input(z.object({ adminPassword: z.string(), id: z.number(), isActive: z.number() }))
    .mutation(async ({ input }) => {
      if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED" });
      await (await getD()).update(crmMergeTags).set({ isActive: input.isActive }).where(eq(crmMergeTags.id, input.id));
      return { success: true };
    }),

  // ─── ADMIN: Manage asset library ─────────────────────────────────────────
  adminGetAllAssets: publicProcedure
    .input(z.object({ adminPassword: z.string() }))
    .query(async ({ input }) => {
      if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED" });
      return (await getD()).select().from(crmAssets).orderBy(asc(crmAssets.sortOrder));
    }),

  adminUpsertAsset: publicProcedure
    .input(z.object({
      adminPassword: z.string(),
      id: z.number().optional(),
      tagKey: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, "Tag key must be lowercase letters, numbers and underscores only"),
      title: z.string().min(1).max(255),
      assetType: z.enum(["video", "pdf", "image", "link"]).default("video"),
      url: z.string().url().max(1024),
      thumbnailUrl: z.string().url().max(1024).optional(),
      description: z.string().max(512).optional(),
      embedHtml: z.string().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED" });
      if (input.id) {
        await (await getD()).update(crmAssets).set({
          tagKey: input.tagKey, title: input.title, assetType: input.assetType,
          url: input.url, thumbnailUrl: input.thumbnailUrl || null,
          description: input.description || null, embedHtml: input.embedHtml || null,
          sortOrder: input.sortOrder,
        }).where(eq(crmAssets.id, input.id));
      } else {
        await (await getD()).insert(crmAssets).values({
          tagKey: input.tagKey, title: input.title, assetType: input.assetType,
          url: input.url, thumbnailUrl: input.thumbnailUrl || null,
          description: input.description || null, embedHtml: input.embedHtml || null,
          sortOrder: input.sortOrder,
        });
      }
      return { success: true };
    }),

  adminDeleteAsset: publicProcedure
    .input(z.object({ adminPassword: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      if (input.adminPassword !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED" });
      await (await getD()).delete(crmAssets).where(eq(crmAssets.id, input.id));
      return { success: true };
    }),
});
