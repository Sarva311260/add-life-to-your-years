import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { jwtVerify } from "jose";
import { ENV } from "../_core/env";
import {
  getAffiliateContacts,
  createAffiliateContact,
  bulkCreateAffiliateContacts,
  updateAffiliateContact,
  deleteAffiliateContact,
  deleteAffiliateContactAdmin,
  getAllAffiliateContactsAdmin,
  getPemfAffiliateById,
  getAllPemfAffiliates,
  getAllDripSequences,
  createDripEnrollment,
} from "../db";

const AFFILIATE_JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret + "_affiliate");
const ADMIN_JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret + "_affiliate");

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload.type === "pemf_admin";
  } catch {
    return false;
  }
}

async function verifyAffiliateToken(token: string): Promise<{ affiliateId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, AFFILIATE_JWT_SECRET);
    if (!payload.affiliateId || typeof payload.affiliateId !== "number") return null;
    return { affiliateId: payload.affiliateId };
  } catch {
    return null;
  }
}

function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Parse a CSV string into contact rows. Handles common column name variations. */
function parseCsv(csvText: string): Array<{ name: string; email?: string; phone?: string; notes?: string }> {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));

  const findCol = (aliases: string[]) => {
    for (const alias of aliases) {
      const idx = headers.findIndex(h => h.includes(alias));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx = findCol(["name", "full name", "contact name", "display name"]);
  const firstIdx = findCol(["first name", "firstname", "given name"]);
  const lastIdx = findCol(["last name", "lastname", "surname", "family name"]);
  const emailIdx = findCol(["email", "e-mail", "email address"]);
  const phoneIdx = findCol(["phone", "mobile", "cell", "telephone", "tel"]);
  const notesIdx = findCol(["notes", "note", "comment", "description"]);

  const contacts: Array<{ name: string; email?: string; phone?: string; notes?: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV split (handles quoted fields)
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { cols.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    cols.push(current.trim());

    const get = (idx: number) => (idx >= 0 && idx < cols.length ? cols[idx].replace(/^"|"$/g, "").trim() : "");

    let name = get(nameIdx);
    if (!name && (firstIdx >= 0 || lastIdx >= 0)) {
      name = [get(firstIdx), get(lastIdx)].filter(Boolean).join(" ");
    }
    if (!name) continue; // skip rows with no name

    const email = get(emailIdx) || undefined;
    const phone = get(phoneIdx) || undefined;
    const notes = get(notesIdx) || undefined;

    contacts.push({ name, email, phone, notes });
  }

  return contacts;
}

/** Parse a vCard (.vcf) string into contact rows. Supports vCard 2.1, 3.0, 4.0. */
function parseVcf(vcfText: string): Array<{ name: string; email?: string; phone?: string; notes?: string }> {
  const contacts: Array<{ name: string; email?: string; phone?: string; notes?: string }> = [];
  const cards = vcfText.split(/BEGIN:VCARD/i).slice(1);

  for (const card of cards) {
    const lines = card.split(/\r?\n/);
    let name = "";
    let email: string | undefined;
    let phone: string | undefined;
    let notes: string | undefined;

    for (const line of lines) {
      const upper = line.toUpperCase();
      if (upper.startsWith("FN:") || upper.startsWith("FN;")) {
        name = line.split(":").slice(1).join(":").trim();
      } else if (!name && (upper.startsWith("N:") || upper.startsWith("N;"))) {
        // N:Last;First;Middle;Prefix;Suffix
        const parts = line.split(":").slice(1).join(":").split(";");
        name = [parts[1], parts[0]].filter(Boolean).join(" ").trim();
      } else if (upper.startsWith("EMAIL") && !email) {
        email = line.split(":").slice(1).join(":").trim() || undefined;
      } else if (upper.startsWith("TEL") && !phone) {
        phone = line.split(":").slice(1).join(":").trim() || undefined;
      } else if (upper.startsWith("NOTE:") || upper.startsWith("NOTE;")) {
        notes = line.split(":").slice(1).join(":").trim() || undefined;
      }
    }

    if (name) {
      contacts.push({ name, email, phone, notes });
    }
  }

  return contacts;
}

export const affiliateContactsRouter = router({
  // ─── Get all contacts ────────────────────────────────────────────────────
  list: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getAffiliateContacts(payload.affiliateId);
    }),

  // ─── Add one contact manually ────────────────────────────────────────────
  add: publicProcedure
    .input(z.object({
      token: z.string(),
      name: z.string().min(1).max(255),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().max(50).optional().or(z.literal("")),
      notes: z.string().max(2000).optional().or(z.literal("")),
      addressStreet: z.string().max(255).optional().or(z.literal("")),
      addressCity: z.string().max(100).optional().or(z.literal("")),
      addressState: z.string().max(100).optional().or(z.literal("")),
      addressPostcode: z.string().max(20).optional().or(z.literal("")),
      addressCountry: z.string().max(100).optional().or(z.literal("")),
      birthday: z.string().max(10).optional().or(z.literal("")),
      tags: z.string().max(500).optional().or(z.literal("")),
      reminderAt: z.number().optional(),
      reminderNote: z.string().max(500).optional().or(z.literal("")),
      category: z.string().max(100).optional().or(z.literal("")),
      enrollSequenceId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED" });

      const contactId = await createAffiliateContact({
        affiliateId: payload.affiliateId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        notes: input.notes || null,
        addressStreet: input.addressStreet || null,
        addressCity: input.addressCity || null,
        addressState: input.addressState || null,
        addressPostcode: input.addressPostcode || null,
        addressCountry: input.addressCountry || null,
        birthday: input.birthday || null,
        tags: input.tags || null,
        reminderAt: input.reminderAt ?? null,
        reminderNote: input.reminderNote || null,
        category: input.category || "General",
        source: "manual",
        enrolledSequenceId: input.enrollSequenceId ?? null,
        enrolledAt: input.enrollSequenceId ? new Date() : null,
      });

      // Enrol in drip campaign if requested
      if (input.enrollSequenceId && input.email) {
        await createDripEnrollment({
          sequenceId: input.enrollSequenceId,
          enquiryId: contactId, // re-use enquiryId field as contact reference
          affiliateId: payload.affiliateId,
          leadEmail: input.email,
          leadName: input.name,
          unsubscribeToken: generateToken(),
          status: "active",
        });
      }

      return { success: true, id: contactId };
    }),

  // ─── Update a contact ────────────────────────────────────────────────────
  update: publicProcedure
    .input(z.object({
      token: z.string(),
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().max(50).optional().or(z.literal("")),
      notes: z.string().max(2000).optional().or(z.literal("")),
      addressStreet: z.string().max(255).optional().or(z.literal("")),
      addressCity: z.string().max(100).optional().or(z.literal("")),
      addressState: z.string().max(100).optional().or(z.literal("")),
      addressPostcode: z.string().max(20).optional().or(z.literal("")),
      addressCountry: z.string().max(100).optional().or(z.literal("")),
      birthday: z.string().max(10).optional().or(z.literal("")),
      tags: z.string().max(500).optional().or(z.literal("")),
      reminderAt: z.number().nullable().optional(),
      reminderNote: z.string().max(500).optional().or(z.literal("")),
      category: z.string().max(100).optional().or(z.literal("")),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const data: Record<string, unknown> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.email !== undefined) data.email = input.email || null;
      if (input.phone !== undefined) data.phone = input.phone || null;
      if (input.notes !== undefined) data.notes = input.notes || null;
      if (input.addressStreet !== undefined) data.addressStreet = input.addressStreet || null;
      if (input.addressCity !== undefined) data.addressCity = input.addressCity || null;
      if (input.addressState !== undefined) data.addressState = input.addressState || null;
      if (input.addressPostcode !== undefined) data.addressPostcode = input.addressPostcode || null;
      if (input.addressCountry !== undefined) data.addressCountry = input.addressCountry || null;
      if (input.birthday !== undefined) data.birthday = input.birthday || null;
      if (input.tags !== undefined) data.tags = input.tags || null;
      if (input.reminderAt !== undefined) data.reminderAt = input.reminderAt;
      if (input.reminderNote !== undefined) data.reminderNote = input.reminderNote || null;
      if (input.category !== undefined) data.category = input.category || "General";
      await updateAffiliateContact(input.id, payload.affiliateId, data as any);
      return { success: true };
    }),

  // ─── Delete a contact ────────────────────────────────────────────────────
  delete: publicProcedure
    .input(z.object({ token: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteAffiliateContact(input.id, payload.affiliateId);
      return { success: true };
    }),

  // ─── Import from CSV ─────────────────────────────────────────────────────
  importCsv: publicProcedure
    .input(z.object({
      token: z.string(),
      csvText: z.string().max(5_000_000), // 5MB limit
      enrollSequenceId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED" });

      const parsed = parseCsv(input.csvText);
      if (parsed.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No contacts found in CSV file." });

      const now = new Date();
      const rows = parsed.map(c => ({
        affiliateId: payload.affiliateId,
        name: c.name,
        email: c.email || null,
        phone: c.phone || null,
        notes: c.notes || null,
        source: "csv" as const,
        enrolledSequenceId: input.enrollSequenceId ?? null,
        enrolledAt: input.enrollSequenceId ? now : null,
      }));

      const count = await bulkCreateAffiliateContacts(rows);

      // Enrol contacts with email in drip campaign if requested
      if (input.enrollSequenceId) {
        for (const c of parsed) {
          if (c.email) {
            await createDripEnrollment({
              sequenceId: input.enrollSequenceId!,
              enquiryId: 0,
              affiliateId: payload.affiliateId,
              leadEmail: c.email,
              leadName: c.name,
              unsubscribeToken: generateToken(),
              status: "active",
            });
          }
        }
      }

      return { success: true, imported: count };
    }),

  // ─── Import from vCard (.vcf) ─────────────────────────────────────────────
  importVcf: publicProcedure
    .input(z.object({
      token: z.string(),
      vcfText: z.string().max(5_000_000),
      enrollSequenceId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const affiliate = await getPemfAffiliateById(payload.affiliateId);
      if (!affiliate || !affiliate.isActive) throw new TRPCError({ code: "UNAUTHORIZED" });

      const parsed = parseVcf(input.vcfText);
      if (parsed.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No contacts found in vCard file." });

      const now = new Date();
      const rows = parsed.map(c => ({
        affiliateId: payload.affiliateId,
        name: c.name,
        email: c.email || null,
        phone: c.phone || null,
        notes: c.notes || null,
        source: "vcf" as const,
        enrolledSequenceId: input.enrollSequenceId ?? null,
        enrolledAt: input.enrollSequenceId ? now : null,
      }));

      const count = await bulkCreateAffiliateContacts(rows);

      if (input.enrollSequenceId) {
        for (const c of parsed) {
          if (c.email) {
            await createDripEnrollment({
              sequenceId: input.enrollSequenceId!,
              enquiryId: 0,
              affiliateId: payload.affiliateId,
              leadEmail: c.email,
              leadName: c.name,
              unsubscribeToken: generateToken(),
              status: "active",
            });
          }
        }
      }

      return { success: true, imported: count };
    }),

  // ─── Get available drip sequences (for campaign dropdown) ─────────────────
  getSequences: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const payload = await verifyAffiliateToken(input.token);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED" });
      const sequences = await getAllDripSequences();
      return sequences.filter(s => s.isActive).map(s => ({ id: s.id, name: s.name }));
    }),

  // ─── ADMIN: List all contacts (optionally by affiliate) ──────────────────
  adminList: publicProcedure
    .input(z.object({ adminToken: z.string(), affiliateId: z.number().optional() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getAllAffiliateContactsAdmin(input.affiliateId);
    }),

  // ─── ADMIN: List all affiliates (for filter dropdown) ────────────────────
  adminListAffiliates: publicProcedure
    .input(z.object({ adminToken: z.string() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const affiliates = await getAllPemfAffiliates();
      return affiliates.map(a => ({ id: a.id, name: a.name, email: a.email }));
    }),

  // ─── ADMIN: Add a contact for a specific affiliate ───────────────────────
  adminAdd: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      affiliateId: z.number(),
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional().or(z.literal("")),
      notes: z.string().optional().or(z.literal("")),
      enrollSequenceId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const id = await createAffiliateContact({
        affiliateId: input.affiliateId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        notes: input.notes || null,
        source: "manual",
        enrolledSequenceId: input.enrollSequenceId ?? null,
        enrolledAt: input.enrollSequenceId ? new Date() : null,
      });
      if (input.enrollSequenceId && input.email) {
        await createDripEnrollment({
          sequenceId: input.enrollSequenceId,
          enquiryId: 0,
          affiliateId: input.affiliateId,
          leadEmail: input.email,
          leadName: input.name,
          unsubscribeToken: generateToken(),
          status: "active",
        });
      }
      return { success: true, id };
    }),

  // ─── ADMIN: Delete any contact ───────────────────────────────────────────
  adminDelete: publicProcedure
    .input(z.object({ adminToken: z.string(), id: z.number() }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteAffiliateContactAdmin(input.id);
      return { success: true };
    }),

  // ─── ADMIN: Import CSV for a specific affiliate ───────────────────────────
  adminImportCsv: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      affiliateId: z.number(),
      csvText: z.string().max(5_000_000),
      enrollSequenceId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const parsed = parseCsv(input.csvText);
      if (parsed.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No contacts found in CSV file." });
      const now = new Date();
      const rows = parsed.map(c => ({
        affiliateId: input.affiliateId,
        name: c.name, email: c.email || null, phone: c.phone || null,
        notes: c.notes || null, source: "csv" as const,
        enrolledSequenceId: input.enrollSequenceId ?? null,
        enrolledAt: input.enrollSequenceId ? now : null,
      }));
      const count = await bulkCreateAffiliateContacts(rows);
      if (input.enrollSequenceId) {
        for (const c of parsed) {
          if (c.email) {
            await createDripEnrollment({
              sequenceId: input.enrollSequenceId!, enquiryId: 0,
              affiliateId: input.affiliateId, leadEmail: c.email, leadName: c.name,
              unsubscribeToken: generateToken(), status: "active",
            });
          }
        }
      }
      return { success: true, imported: count };
    }),

  // ─── ADMIN: Import VCF for a specific affiliate ───────────────────────────
  adminImportVcf: publicProcedure
    .input(z.object({
      adminToken: z.string(),
      affiliateId: z.number(),
      vcfText: z.string().max(5_000_000),
      enrollSequenceId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const parsed = parseVcf(input.vcfText);
      if (parsed.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No contacts found in vCard file." });
      const now = new Date();
      const rows = parsed.map(c => ({
        affiliateId: input.affiliateId,
        name: c.name, email: c.email || null, phone: c.phone || null,
        notes: c.notes || null, source: "vcf" as const,
        enrolledSequenceId: input.enrollSequenceId ?? null,
        enrolledAt: input.enrollSequenceId ? now : null,
      }));
      const count = await bulkCreateAffiliateContacts(rows);
      if (input.enrollSequenceId) {
        for (const c of parsed) {
          if (c.email) {
            await createDripEnrollment({
              sequenceId: input.enrollSequenceId!, enquiryId: 0,
              affiliateId: input.affiliateId, leadEmail: c.email, leadName: c.name,
              unsubscribeToken: generateToken(), status: "active",
            });
          }
        }
      }
      return { success: true, imported: count };
    }),

  // ─── ADMIN: Get sequences ────────────────────────────────────────────────
  adminGetSequences: publicProcedure
    .input(z.object({ adminToken: z.string() }))
    .query(async ({ input }) => {
      if (!await verifyAdminToken(input.adminToken)) throw new TRPCError({ code: "UNAUTHORIZED" });
      const sequences = await getAllDripSequences();
      return sequences.filter(s => s.isActive).map(s => ({ id: s.id, name: s.name }));
    }),
});
