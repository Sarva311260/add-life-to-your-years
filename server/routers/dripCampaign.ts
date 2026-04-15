import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";
import {
  createDripSequence, getAllDripSequences, updateDripSequence, deleteDripSequence,
  createDripEmail, getDripEmailsBySequence, updateDripEmail, deleteDripEmail,
  createDripEnrollment, getDripEnrollmentsByAffiliate, getDripEnrollmentByToken,
  updateDripEnrollment, getDueEmails, logDripSend, getDripSendLogByEnrollment,
  logEmail, getAllEmailLog, getEmailLogByAffiliate,
  getAllPemfAffiliates, getPemfAffiliateById, getActiveDripSequences,
  getAffiliateDripOverride, upsertAffiliateDripOverride, getAffiliateDripOverridesForAffiliate,
} from "../db";
import { Resend } from "resend";

const ADMIN_PASSWORD = process.env.PEMF_ADMIN_PASSWORD || "pemf-admin-2024";
const ADMIN_JWT_SECRET = ENV.cookieSecret + "_pemf_admin";
const AFFILIATE_JWT_SECRET = ENV.cookieSecret + "_affiliate";
const adminSecret = new TextEncoder().encode(ADMIN_JWT_SECRET);
const affiliateSecret = new TextEncoder().encode(AFFILIATE_JWT_SECRET);

const FROM_ADDRESS = "Add Life to Your Years Team <noreply@addlifetoyouryears.org>";

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, adminSecret);
    return payload.type === "pemf_admin";
  } catch {
    return false;
  }
}

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

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Email service not configured." });
  return new Resend(key);
}

/** Generate a random unsubscribe token */
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Build an unsubscribe URL */
function unsubscribeUrl(origin: string, token: string): string {
  return `${origin}/unsubscribe?token=${token}`;
}

/** Wrap email body with unsubscribe footer */
function wrapWithUnsubscribe(body: string, unsubLink: string, affiliateName: string): string {
  return `${body}

<hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
<p style="font-size:12px;color:#9ca3af;margin:0;">
  This email was sent on behalf of <strong>${affiliateName}</strong> via Add Life to Your Years.<br>
  If you no longer wish to receive emails, <a href="${unsubLink}" style="color:#6b7280;">unsubscribe here</a>.
</p>`;
}

export const dripCampaignRouter = router({

  // ─── ADMIN: Drip Sequence CRUD ────────────────────────────────────────────

  adminGetSequences: publicProcedure
    .input(z.object({ adminToken: z.string() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const sequences = await getAllDripSequences();
      const result = [];
      for (const seq of sequences) {
        const emails = await getDripEmailsBySequence(seq.id);
        result.push({ ...seq, emailCount: emails.length });
      }
      return result;
    }),

  adminCreateSequence: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      name: z.string().min(1).max(255),
      description: z.string().max(2000).optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const id = await createDripSequence({
        name: input.name,
        description: input.description || null,
        isActive: input.isActive ? 1 : 0,
      });
      return { success: true, id };
    }),

  adminUpdateSequence: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().max(2000).optional().nullable(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const data: Record<string, unknown> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.isActive !== undefined) data.isActive = input.isActive ? 1 : 0;
      await updateDripSequence(input.id, data as any);
      return { success: true };
    }),

  adminDeleteSequence: publicProcedure
    .input(z.object({ adminToken: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteDripSequence(input.id);
      return { success: true };
    }),

  // ─── ADMIN: Drip Email CRUD ───────────────────────────────────────────────

  adminGetSequenceEmails: publicProcedure
    .input(z.object({ adminToken: z.string(), sequenceId: z.number() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getDripEmailsBySequence(input.sequenceId);
    }),

  adminCreateDripEmail: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      sequenceId: z.number(),
      dayOffset: z.number().int().min(0),
      subject: z.string().min(1).max(255),
      body: z.string().min(1),
      sortOrder: z.number().int().default(0),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const id = await createDripEmail({
        sequenceId: input.sequenceId,
        dayOffset: input.dayOffset,
        subject: input.subject,
        body: input.body,
        sortOrder: input.sortOrder,
      });
      return { success: true, id };
    }),

  adminUpdateDripEmail: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      id: z.number(),
      dayOffset: z.number().int().min(0).optional(),
      subject: z.string().min(1).max(255).optional(),
      body: z.string().min(1).optional(),
      sortOrder: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const data: Record<string, unknown> = {};
      if (input.dayOffset !== undefined) data.dayOffset = input.dayOffset;
      if (input.subject !== undefined) data.subject = input.subject;
      if (input.body !== undefined) data.body = input.body;
      if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
      await updateDripEmail(input.id, data as any);
      return { success: true };
    }),

  adminDeleteDripEmail: publicProcedure
    .input(z.object({ adminToken: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteDripEmail(input.id);
      return { success: true };
    }),

  // ─── ADMIN: Broadcast email to all affiliates ─────────────────────────────

  adminBroadcast: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      subject: z.string().min(1).max(255),
      body: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const resend = getResend();
      const affiliates = await getAllPemfAffiliates();
      const active = affiliates.filter(a => a.isActive && a.email);

      let sent = 0;
      let failed = 0;
      for (const affiliate of active) {
        try {
          const result = await resend.emails.send({
            from: FROM_ADDRESS,
            to: affiliate.email,
            subject: input.subject,
            html: `<p>Hi ${affiliate.name},</p>${input.body}`,
          });
          await logEmail({
            type: "admin_broadcast",
            affiliateId: null,
            toEmail: affiliate.email,
            toName: affiliate.name,
            subject: input.subject,
            body: input.body,
            resendId: result.data?.id || null,
            status: "sent",
          });
          sent++;
        } catch (err) {
          console.warn("[Broadcast] Failed to send to", affiliate.email, err);
          await logEmail({
            type: "admin_broadcast",
            affiliateId: null,
            toEmail: affiliate.email,
            toName: affiliate.name,
            subject: input.subject,
            body: input.body,
            resendId: null,
            status: "failed",
          });
          failed++;
        }
      }
      return { success: true, sent, failed, total: active.length };
    }),

  // ─── ADMIN: Email individual affiliate ───────────────────────────────────

  adminEmailAffiliate: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      affiliateId: z.number(),
      subject: z.string().min(1).max(255),
      body: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const affiliate = await getPemfAffiliateById(input.affiliateId);
      if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found." });
      const resend = getResend();
      const result = await resend.emails.send({
        from: FROM_ADDRESS,
        to: affiliate.email,
        subject: input.subject,
        html: `<p>Hi ${affiliate.name},</p>${input.body}`,
      });
      await logEmail({
        type: "admin_to_affiliate",
        affiliateId: affiliate.id,
        toEmail: affiliate.email,
        toName: affiliate.name,
        subject: input.subject,
        body: input.body,
        resendId: result.data?.id || null,
        status: "sent",
      });
      return { success: true };
    }),

  // ─── ADMIN: View email log ────────────────────────────────────────────────

  adminGetEmailLog: publicProcedure
    .input(z.object({ adminToken: z.string(), limit: z.number().int().max(500).default(100) }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getAllEmailLog(input.limit);
    }),

  // ─── ADMIN: Process due drip emails (called by a background job or on-demand) ──

  adminProcessDripQueue: publicProcedure
    .input(z.object({ adminToken: z.string(), origin: z.string() }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      return processDripQueue(input.origin);
    }),

  // ─── AFFILIATE: Send manual email to a lead ──────────────────────────────

  affiliateSendEmailToLead: publicProcedure
    .input(z.object({
      token: z.string(),
      leadEmail: z.string().email(),
      leadName: z.string(),
      subject: z.string().min(1).max(255),
      body: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED", message: "Account not found." });

      const resend = getResend();
      const result = await resend.emails.send({
        from: `${affiliate.name} via Add Life to Your Years <noreply@addlifetoyouryears.org>`,
        replyTo: affiliate.email,
        to: input.leadEmail,
        subject: input.subject,
        html: `<p>Hi ${input.leadName},</p>${input.body}<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"><p style="font-size:12px;color:#9ca3af;">This email was sent by ${affiliate.name} via Add Life to Your Years. To reply, contact ${affiliate.email} directly.</p>`,
      });

      await logEmail({
        type: "affiliate_to_lead",
        affiliateId: affiliate.id,
        toEmail: input.leadEmail,
        toName: input.leadName,
        subject: input.subject,
        body: input.body,
        resendId: result.data?.id || null,
        status: "sent",
      });

      return { success: true };
    }),

  // ─── AFFILIATE: Get drip enrollment status for their leads ───────────────

  affiliateGetEnrollments: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED", message: "Account not found." });

      const enrollments = await getDripEnrollmentsByAffiliate(affiliate.id);
      const result = [];
      for (const e of enrollments) {
        const sentLog = await getDripSendLogByEnrollment(e.id);
        result.push({
          id: e.id,
          enquiryId: e.enquiryId,
          leadEmail: e.leadEmail,
          leadName: e.leadName,
          status: e.status,
          enrolledAt: e.enrolledAt,
          emailsSent: sentLog.length,
        });
      }
      return result;
    }),

  // ─── AFFILIATE: Get/save drip email overrides ────────────────────────────

  affiliateGetDripOverrides: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });

      // Get all active sequences with their emails
      const sequences = await getAllDripSequences();
      const result = [];
      for (const seq of sequences) {
        const emails = await getDripEmailsBySequence(seq.id);
        const emailsWithOverrides = await Promise.all(
          emails.map(async (email) => {
            const override = await getAffiliateDripOverride(payload.affiliateId, email.id);
            return {
              ...email,
              customSubject: override?.subject ?? null,
              customBody: override?.body ?? null,
              hasOverride: !!override,
            };
          })
        );
        result.push({ ...seq, emails: emailsWithOverrides });
      }
      return result;
    }),

  affiliateSaveDripOverride: publicProcedure
    .input(z.object({
      token: z.string(),
      dripEmailId: z.number(),
      subject: z.string().nullable(),
      body: z.string().nullable(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });

      await upsertAffiliateDripOverride({
        affiliateId: payload.affiliateId,
        dripEmailId: input.dripEmailId,
        subject: input.subject,
        body: input.body,
      });
      return { success: true };
    }),

  // ─── PUBLIC: Unsubscribe ──────────────────────────────────────────────────

  unsubscribe: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const enrollment = await getDripEnrollmentByToken(input.token);
      if (!enrollment) throw new TRPCError({ code: "NOT_FOUND", message: "Unsubscribe link not found." });
      if (enrollment.status !== "unsubscribed") {
        await updateDripEnrollment(enrollment.id, { status: "unsubscribed" });
      }
      return { success: true, leadName: enrollment.leadName };
    }),
});

/**
 * Process the drip email queue — send any emails that are due.
 * This should be called periodically (e.g. every hour) or on-demand.
 */
export async function processDripQueue(origin: string): Promise<{ sent: number; failed: number }> {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  const due = await getDueEmails();
  let sent = 0;
  let failed = 0;

  for (const { enrollment, dripEmail } of due) {
    const affiliate = await getPemfAffiliateById(enrollment.affiliateId);
    if (!affiliate) continue;

    const unsubLink = unsubscribeUrl(origin, enrollment.unsubscribeToken);
    // Check for affiliate override
    const override = await getAffiliateDripOverride(enrollment.affiliateId, dripEmail.id);
    const emailSubject = override?.subject || dripEmail.subject;
    const emailBodyRaw = override?.body || dripEmail.body;
    const htmlBody = wrapWithUnsubscribe(emailBodyRaw, unsubLink, affiliate.name);

    try {
      const result = await resend.emails.send({
        from: `${affiliate.name} via Add Life to Your Years <noreply@addlifetoyouryears.org>`,
        replyTo: affiliate.email,
        to: enrollment.leadEmail,
        subject: emailSubject,
        html: `<p>Hi ${enrollment.leadName},</p>${htmlBody}`,
      });

      await logDripSend({
        enrollmentId: enrollment.id,
        dripEmailId: dripEmail.id,
        status: "sent",
      });

      await logEmail({
        type: "affiliate_to_lead",
        affiliateId: affiliate.id,
        toEmail: enrollment.leadEmail,
        toName: enrollment.leadName,
        subject: dripEmail.subject,
        body: dripEmail.body,
        resendId: result.data?.id || null,
        status: "sent",
      });

      sent++;
    } catch (err) {
      console.warn("[Drip] Failed to send email:", err);
      await logDripSend({
        enrollmentId: enrollment.id,
        dripEmailId: dripEmail.id,
        status: "failed",
      });
      failed++;
    }
  }

  console.log(`[Drip] Processed queue: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}

/**
 * Enroll a new lead in all active drip sequences.
 * Call this after a new enquiry is created.
 */
export async function enrollLeadInDripSequences({
  enquiryId,
  affiliateId,
  leadEmail,
  leadName,
}: {
  enquiryId: number;
  affiliateId: number;
  leadEmail: string;
  leadName: string;
}): Promise<void> {
  try {
    const sequences = await getActiveDripSequences();
    for (const seq of sequences) {
      const token = generateToken();
      await createDripEnrollment({
        sequenceId: seq.id,
        enquiryId,
        affiliateId,
        leadEmail,
        leadName,
        unsubscribeToken: token,
        status: "active",
      });
    }
    console.log(`[Drip] Enrolled ${leadEmail} in ${sequences.length} sequence(s)`);
  } catch (err) {
    console.warn("[Drip] Failed to enroll lead:", err);
  }
}
