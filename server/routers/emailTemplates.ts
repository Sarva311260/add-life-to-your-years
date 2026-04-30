import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { jwtVerify } from "jose";
import { ENV } from "../_core/env";
import {
  getEmailTemplatesByAffiliate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getEmailLogByContact,
  getPemfAffiliateById,
} from "../db";

const AFFILIATE_JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret + "_affiliate");

async function verifyAffiliateToken(token: string): Promise<{ affiliateId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, AFFILIATE_JWT_SECRET);
    if (!payload.affiliateId || typeof payload.affiliateId !== "number") return null;
    return { affiliateId: payload.affiliateId };
  } catch {
    return null;
  }
}

export const emailTemplatesRouter = router({
  // ─── List templates for the logged-in affiliate ──────────────────────────
  list: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getEmailTemplatesByAffiliate(payload.affiliateId);
    }),

  // ─── Create a new template ───────────────────────────────────────────────
  create: publicProcedure
    .input(z.object({
      token: z.string(),
      name: z.string().min(1).max(255),
      subject: z.string().min(1).max(255),
      body: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const id = await createEmailTemplate({
        affiliateId: payload.affiliateId,
        name: input.name,
        subject: input.subject,
        body: input.body,
      });
      return { id };
    }),

  // ─── Update an existing template ─────────────────────────────────────────
  update: publicProcedure
    .input(z.object({
      token: z.string(),
      id: z.number(),
      name: z.string().min(1).max(255),
      subject: z.string().min(1).max(255),
      body: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      await updateEmailTemplate(input.id, payload.affiliateId, {
        name: input.name,
        subject: input.subject,
        body: input.body,
      });
      return { success: true };
    }),

  // ─── Delete a template ───────────────────────────────────────────────────
  delete: publicProcedure
    .input(z.object({ token: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteEmailTemplate(input.id, payload.affiliateId);
      return { success: true };
    }),

  // ─── Get email history sent to a specific contact email ──────────────────
  getContactHistory: publicProcedure
    .input(z.object({
      token: z.string(),
      contactEmail: z.string().email(),
    }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getEmailLogByContact(payload.affiliateId, input.contactEmail);
    }),
});
