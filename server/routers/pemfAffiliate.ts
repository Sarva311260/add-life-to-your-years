import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import {
  createPemfAffiliate,
  getPemfAffiliateBySlug,
  getPemfAffiliateByEmail,
  getPemfAffiliateById,
  checkSlugExists,
  createPemfEnquiry,
  updatePemfAffiliate,
  getAllPemfAffiliates,
  getPemfEnquiriesByAffiliate,
  getEnquiryCountsByAffiliate,
} from "../db";
import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";

const AFFILIATE_JWT_SECRET = ENV.cookieSecret + "_affiliate";
const ADMIN_PASSWORD = process.env.PEMF_ADMIN_PASSWORD || "pemf-admin-2024";

/**
 * Generate a URL-friendly slug from a name.
 * e.g. "John Smith" → "john-smith"
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const secret = new TextEncoder().encode(AFFILIATE_JWT_SECRET);

async function signAffiliateToken(affiliateId: number): Promise<string> {
  return new SignJWT({ affiliateId, type: "affiliate" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyAffiliateToken(token: string): Promise<{ affiliateId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "affiliate") return null;
    return { affiliateId: payload.affiliateId as number };
  } catch {
    return null;
  }
}

async function signAdminToken(): Promise<string> {
  return new SignJWT({ type: "pemf_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(secret);
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.type === "pemf_admin";
  } catch {
    return false;
  }
}

export const pemfAffiliateRouter = router({
  /**
   * Register a new PEMF affiliate (brand partner).
   * Public — no auth required.
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email().max(320),
        phone: z.string().min(5).max(50),
        password: z.string().min(6).max(100),
      })
    )
    .mutation(async ({ input }) => {
      // Check if email already registered
      const existing = await getPemfAffiliateByEmail(input.email.trim().toLowerCase());
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
      }

      // Generate slug from name
      let slug = generateSlug(input.name);
      if (!slug) {
        slug = "partner-" + Date.now();
      }

      // Ensure slug is unique
      let finalSlug = slug;
      let counter = 1;
      while (await checkSlugExists(finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      const affiliateId = await createPemfAffiliate({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        slug: finalSlug,
        passwordHash,
      });

      // Notify the owner about the new affiliate
      notifyOwner({
        title: `New PEMF Brand Partner: ${input.name}`,
        content:
          `A new brand partner has registered for PEMF.\n\n` +
          `Name: ${input.name}\n` +
          `Email: ${input.email}\n` +
          `Phone: ${input.phone}\n` +
          `Personal Link: /pemf/${finalSlug}\n`,
      }).catch((err) => {
        console.warn("[Notification] Failed to send affiliate registration notification:", err);
      });

      const token = await signAffiliateToken(affiliateId);

      return {
        success: true,
        slug: finalSlug,
        affiliateId,
        token,
      };
    }),

  /**
   * Affiliate login — returns a JWT token.
   */
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const affiliate = await getPemfAffiliateByEmail(input.email.trim().toLowerCase());
      if (!affiliate || !affiliate.isActive) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }
      if (!affiliate.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Account not yet activated. Please contact your administrator." });
      }
      const valid = await bcrypt.compare(input.password, affiliate.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      // Update last login
      await updatePemfAffiliate(affiliate.id, { lastLoginAt: new Date() });

      const token = await signAffiliateToken(affiliate.id);
      return {
        success: true,
        token,
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          phone: affiliate.phone,
          slug: affiliate.slug,
        },
      };
    }),

  /**
   * Get current affiliate profile (requires token).
   */
  getProfile: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED", message: "Account not found." });
      const enquiries = await getPemfEnquiriesByAffiliate(affiliate.id);
      return {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        slug: affiliate.slug,
        createdAt: affiliate.createdAt,
        enquiryCount: enquiries.length,
        recentEnquiries: enquiries.slice(-5).reverse().map(e => ({
          id: e.id,
          visitorName: e.visitorName,
          visitorEmail: e.visitorEmail,
          visitorPhone: e.visitorPhone,
          message: e.message,
          createdAt: e.createdAt,
        })),
      };
    }),

  /**
   * Update affiliate profile (requires token).
   */
  updateProfile: publicProcedure
    .input(z.object({
      token: z.string(),
      name: z.string().min(2).max(255).optional(),
      phone: z.string().min(5).max(50).optional(),
      email: z.string().email().max(320).optional(),
      newPassword: z.string().min(6).max(100).optional(),
      currentPassword: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED", message: "Account not found." });

      const updates: Parameters<typeof updatePemfAffiliate>[1] = {};

      if (input.name) updates.name = input.name.trim();
      if (input.phone) updates.phone = input.phone.trim();
      if (input.email) {
        const emailLower = input.email.trim().toLowerCase();
        if (emailLower !== affiliate.email) {
          const existing = await getPemfAffiliateByEmail(emailLower);
          if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already in use." });
          updates.email = emailLower;
        }
      }

      if (input.newPassword) {
        if (!input.currentPassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Current password required to set a new password." });
        if (!affiliate.passwordHash) throw new TRPCError({ code: "BAD_REQUEST", message: "No password set on account." });
        const valid = await bcrypt.compare(input.currentPassword, affiliate.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect." });
        updates.passwordHash = await bcrypt.hash(input.newPassword, 10);
      }

      if (Object.keys(updates).length > 0) {
        await updatePemfAffiliate(affiliate.id, updates);
      }

      return { success: true };
    }),

  /**
   * Look up an affiliate by their URL slug.
   * Public — used to render personalised PEMF pages.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const affiliate = await getPemfAffiliateBySlug(input.slug);
      if (!affiliate || !affiliate.isActive) {
        return null;
      }
      return {
        id: affiliate.id,
        name: affiliate.name,
        phone: affiliate.phone,
        slug: affiliate.slug,
      };
    }),

  /**
   * Submit a contact enquiry from an affiliate's personalised PEMF page.
   * Public — no auth required.
   */
  submitEnquiry: publicProcedure
    .input(
      z.object({
        affiliateSlug: z.string().min(1),
        visitorName: z.string().min(2).max(255),
        visitorEmail: z.string().email().max(320),
        visitorPhone: z.string().max(50).optional(),
        message: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const affiliate = await getPemfAffiliateBySlug(input.affiliateSlug);
      if (!affiliate || !affiliate.isActive) {
        throw new Error("Affiliate not found");
      }

      const enquiryId = await createPemfEnquiry({
        affiliateId: affiliate.id,
        visitorName: input.visitorName.trim(),
        visitorEmail: input.visitorEmail.trim().toLowerCase(),
        visitorPhone: input.visitorPhone?.trim() || null,
        message: input.message?.trim() || null,
      });

      notifyOwner({
        title: `New PEMF Enquiry via ${affiliate.name}`,
        content:
          `A visitor has submitted an enquiry through ${affiliate.name}'s PEMF page.\n\n` +
          `Visitor Name: ${input.visitorName}\n` +
          `Visitor Email: ${input.visitorEmail}\n` +
          `Visitor Phone: ${input.visitorPhone || "Not provided"}\n` +
          `Message: ${input.message || "No message"}\n\n` +
          `Brand Partner: ${affiliate.name}\n` +
          `Partner Email: ${affiliate.email}\n` +
          `Partner Phone: ${affiliate.phone}\n`,
      }).catch((err) => {
        console.warn("[Notification] Failed to send enquiry notification to owner:", err);
      });

      return { success: true, enquiryId };
    }),

  // ─── ADMIN PROCEDURES ────────────────────────────────────────────

  /**
   * Admin login — password-based, returns a short-lived admin JWT.
   */
  adminLogin: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      if (input.password !== ADMIN_PASSWORD) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin password." });
      }
      const token = await signAdminToken();
      return { success: true, token };
    }),

  /**
   * Admin: get all affiliates with enquiry counts.
   */
  adminGetAffiliates: publicProcedure
    .input(z.object({ adminToken: z.string() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      const affiliates = await getAllPemfAffiliates();
      const counts = await getEnquiryCountsByAffiliate();
      return affiliates.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        slug: a.slug,
        isActive: a.isActive,
        lastLoginAt: a.lastLoginAt,
        createdAt: a.createdAt,
        enquiryCount: counts[a.id] || 0,
        hasPassword: !!a.passwordHash,
      }));
    }),

  /**
   * Admin: get enquiries for a specific affiliate.
   */
  adminGetEnquiries: publicProcedure
    .input(z.object({ adminToken: z.string(), affiliateId: z.number() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      return getPemfEnquiriesByAffiliate(input.affiliateId);
    }),

  /**
   * Admin: activate or deactivate an affiliate.
   */
  adminSetActive: publicProcedure
    .input(z.object({ adminToken: z.string(), affiliateId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      await updatePemfAffiliate(input.affiliateId, { isActive: input.isActive ? 1 : 0 });
      return { success: true };
    }),

  /**
   * Admin: reset an affiliate's password.
   */
  adminResetPassword: publicProcedure
    .input(z.object({ adminToken: z.string(), affiliateId: z.number(), newPassword: z.string().min(6) }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await updatePemfAffiliate(input.affiliateId, { passwordHash });
      return { success: true };
    }),

  /**
   * Admin: update affiliate details.
   */
  adminUpdateAffiliate: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      affiliateId: z.number(),
      name: z.string().min(2).max(255).optional(),
      email: z.string().email().max(320).optional(),
      phone: z.string().min(5).max(50).optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      const updates: Parameters<typeof updatePemfAffiliate>[1] = {};
      if (input.name) updates.name = input.name.trim();
      if (input.phone) updates.phone = input.phone.trim();
      if (input.email) updates.email = input.email.trim().toLowerCase();
      if (Object.keys(updates).length > 0) {
        await updatePemfAffiliate(input.affiliateId, updates);
      }
      return { success: true };
    }),
});
