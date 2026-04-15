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
  createPemfResource,
  getAllPemfResources,
  getPublishedPemfResources,
  updatePemfResource,
  deletePemfResource,
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
   * Check if a slug is available.
   * Public — used for real-time availability check on sign-up form.
   */
  checkSlugAvailability: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      const sanitized = generateSlug(input.slug);
      if (!sanitized) return { available: false, sanitized: "" };
      const taken = await checkSlugExists(sanitized);
      return { available: !taken, sanitized };
    }),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email().max(320),
        phone: z.string().min(5).max(50),
        password: z.string().min(6).max(100),
        customSlug: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if email already registered
      const existing = await getPemfAffiliateByEmail(input.email.trim().toLowerCase());
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
      }

      // Determine slug: use custom if provided, otherwise generate from name
      let finalSlug: string;
      if (input.customSlug) {
        finalSlug = generateSlug(input.customSlug);
        if (!finalSlug) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid URL — please use letters, numbers, and hyphens only." });
        }
        if (await checkSlugExists(finalSlug)) {
          throw new TRPCError({ code: "CONFLICT", message: "That URL is already taken. Please choose a different one." });
        }
      } else {
        let slug = generateSlug(input.name);
        if (!slug) slug = "partner-" + Date.now();
        finalSlug = slug;
        if (await checkSlugExists(finalSlug)) {
          finalSlug = `${slug}-${Date.now().toString().slice(-6)}`;
        }
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

      // Send welcome email to the new affiliate
      sendAffiliateWelcomeEmail({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        slug: finalSlug,
        origin: (process.env.VITE_OAUTH_PORTAL_URL ? "https://addlifetoyouryears.org" : "https://addlifetoyouryears.org"),
      }).catch((err) => {
        console.warn("[Email] Failed to send affiliate welcome email:", err);
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

  // ─── RESOURCE PROCEDURES ─────────────────────────────────────────

  /**
   * Get all published resources (for affiliates).
   */
  getResources: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      return getPublishedPemfResources();
    }),

  /**
   * Admin: get all resources (published + unpublished).
   */
  adminGetResources: publicProcedure
    .input(z.object({ adminToken: z.string() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      return getAllPemfResources();
    }),

  /**
   * Admin: create a new resource (document, script, email template, or video).
   */
  adminCreateResource: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      type: z.enum(["document", "script", "email_template", "video"]),
      title: z.string().min(1).max(255),
      description: z.string().max(2000).optional(),
      fileUrl: z.string().url().optional(),
      fileName: z.string().max(255).optional(),
      content: z.string().optional(),
      videoUrl: z.string().url().optional(),
      category: z.string().max(100).optional(),
      isPublished: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      const id = await createPemfResource({
        type: input.type,
        title: input.title,
        description: input.description || null,
        fileUrl: input.fileUrl || null,
        fileName: input.fileName || null,
        content: input.content || null,
        videoUrl: input.videoUrl || null,
        category: input.category || null,
        isPublished: input.isPublished ? 1 : 0,
        sortOrder: input.sortOrder,
      });
      return { success: true, id };
    }),

  /**
   * Admin: update an existing resource.
   */
  adminUpdateResource: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().max(2000).optional(),
      fileUrl: z.string().url().optional().nullable(),
      fileName: z.string().max(255).optional().nullable(),
      content: z.string().optional().nullable(),
      videoUrl: z.string().url().optional().nullable(),
      category: z.string().max(100).optional().nullable(),
      isPublished: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      const updates: Record<string, unknown> = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.fileUrl !== undefined) updates.fileUrl = input.fileUrl;
      if (input.fileName !== undefined) updates.fileName = input.fileName;
      if (input.content !== undefined) updates.content = input.content;
      if (input.videoUrl !== undefined) updates.videoUrl = input.videoUrl;
      if (input.category !== undefined) updates.category = input.category;
      if (input.isPublished !== undefined) updates.isPublished = input.isPublished ? 1 : 0;
      if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;
      await updatePemfResource(input.id, updates as any);
      return { success: true };
    }),

  /**
   * Admin: delete a resource.
   */
  adminDeleteResource: publicProcedure
    .input(z.object({ adminToken: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session." });
      }
      await deletePemfResource(input.id);
      return { success: true };
    }),

  /**
   * Admin: upload a file (PDF/doc/script) to S3 and return the URL.
   * Accepts base64-encoded file content.
   */
  adminUploadFile: publicProcedure
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
      const key = `pemf-resources/${suffix}-${safeFileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { success: true, url, fileName: input.fileName };
    }),
});

/**
 * Send a welcome email to a new affiliate using the Forge notification API.
 * Falls back gracefully if the API is unavailable.
 */
async function sendAffiliateWelcomeEmail({
  name,
  email,
  slug,
  origin,
}: {
  name: string;
  email: string;
  slug: string;
  origin: string;
}) {
  const pemfLink = `${origin}/pemf/${slug}`;
  const portalLink = `${origin}/pemf/portal`;

  const subject = `Welcome to the Add Life to Your Years Brand Partner Programme`;
  const body = `
Hi ${name},

Welcome to the Add Life to Your Years Brand Partner Programme! We're thrilled to have you on board.

Your personal PEMF page is now live and ready to share:
${pemfLink}

Share this link with anyone interested in PEMF therapy. Every enquiry that comes through your page will be tracked in your partner portal.

---
Your Partner Portal
---
Log in to your partner portal to view your enquiry stats, update your details, and access resources:
${portalLink}

Use the email address you registered with and the password you created during sign-up.

---
What's in Your Portal
---
• Your personal PEMF link to share
• Enquiry tracking — see who has reached out through your page
• Resources — marketing materials, scripts, email templates, and more
• Profile settings — update your details or change your password

If you have any questions, simply reply to this email.

Warm regards,
Add Life to Your Years Team
https://addlifetoyouryears.org
`.trim();

  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    console.warn("[Email] Forge API not configured, skipping welcome email.");
    return;
  }

  const response = await fetch(`${forgeApiUrl}/api/v1/email/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${forgeApiKey}`,
    },
    body: JSON.stringify({
      to: email,
      subject,
      text: body,
      from_name: "Add Life to Your Years Team",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.warn(`[Email] Welcome email failed (${response.status}): ${text}`);
  } else {
    console.log(`[Email] Welcome email sent to ${email}`);
  }
}