import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, evaluations, recommendations, InsertEvaluation, InsertRecommendation,
  consultations, consultMessages, consultReports, shopProducts, reviewRequests, consultRatings,
  InsertConsultation, InsertConsultMessage, InsertConsultReport, InsertShopProduct, InsertReviewRequest, InsertConsultRating,
  pemfAffiliates, InsertPemfAffiliate, pemfEnquiries, InsertPemfEnquiry,
  pemfResources, InsertPemfResource,
  dripSequences, InsertDripSequence, dripEmails, InsertDripEmail,
  dripEnrollments, InsertDripEnrollment, dripSendLog, InsertDripSendLog,
  emailLog, InsertEmailLog,
  affiliateDripOverrides, InsertAffiliateDripOverride,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<{ isNewUser: boolean }> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return { isNewUser: false };
  }

  try {
    // Check if user already exists
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
    const isNewUser = existing.length === 0;

    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    return { isNewUser };
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ---- Evaluation helpers ----

export async function createEvaluation(data: InsertEvaluation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(evaluations).values(data);
  return result[0].insertId;
}

export async function getUserEvaluations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(evaluations).where(eq(evaluations.userId, userId)).orderBy(desc(evaluations.completedAt));
}

export async function getEvaluationById(evaluationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(evaluations).where(eq(evaluations.id, evaluationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---- Recommendation helpers ----

export async function createRecommendations(data: InsertRecommendation[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.length === 0) return;
  await db.insert(recommendations).values(data);
}

export async function getRecommendationsByEvaluation(evaluationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(recommendations).where(eq(recommendations.evaluationId, evaluationId));
}

export async function getLatestRecommendations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const latestEval = await db.select().from(evaluations).where(eq(evaluations.userId, userId)).orderBy(desc(evaluations.completedAt)).limit(1);
  if (latestEval.length === 0) return [];
  return db.select().from(recommendations).where(eq(recommendations.evaluationId, latestEval[0].id));
}

// ---- Consultation helpers ----

export async function createConsultation(data: InsertConsultation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(consultations).values(data);
  return result[0].insertId;
}

export async function getConsultationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(consultations).where(eq(consultations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserConsultations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(consultations).where(eq(consultations.userId, userId)).orderBy(desc(consultations.createdAt));
}

export async function updateConsultation(id: number, data: Partial<InsertConsultation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(consultations).set(data).where(eq(consultations.id, id));
}

// ---- Consultation message helpers ----

export async function addConsultMessage(data: InsertConsultMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(consultMessages).values(data);
  return result[0].insertId;
}

export async function getConsultMessages(consultationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(consultMessages).where(eq(consultMessages.consultationId, consultationId));
}

// ---- Consultation report helpers ----

export async function createConsultReport(data: InsertConsultReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(consultReports).values(data);
  return result[0].insertId;
}

export async function getConsultReport(consultationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(consultReports).where(eq(consultReports.consultationId, consultationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserConsultReports(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(consultReports).where(eq(consultReports.userId, userId)).orderBy(desc(consultReports.createdAt));
}

// ---- Shop product helpers ----

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(shopProducts).where(eq(shopProducts.isActive, 1)).orderBy(shopProducts.sortOrder);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(shopProducts).where(eq(shopProducts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: InsertShopProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shopProducts).values(data);
  return result[0].insertId;
}

export async function updateProduct(id: number, data: Partial<InsertShopProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(shopProducts).set(data).where(eq(shopProducts.id, id));
}

export async function updateUserFirstName(userId: number, firstName: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ firstName }).where(eq(users.id, userId));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLatestEvaluationByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(evaluations).where(eq(evaluations.userId, userId)).orderBy(desc(evaluations.completedAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---- Review request helpers ----

export async function createReviewRequest(data: InsertReviewRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviewRequests).values(data);
  return result[0].insertId;
}

export async function getReviewRequestByReportId(reportId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(reviewRequests).where(eq(reviewRequests.reportId, reportId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReviewRequestBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(reviewRequests).where(eq(reviewRequests.stripeSessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateReviewRequest(id: number, data: Partial<InsertReviewRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviewRequests).set(data).where(eq(reviewRequests.id, id));
}

export async function getUserReviewRequests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(reviewRequests).where(eq(reviewRequests.userId, userId)).orderBy(desc(reviewRequests.createdAt));
}

export async function createConsultRating(data: InsertConsultRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(consultRatings).values(data);
  return (result as { insertId: number }).insertId;
}

export async function getConsultRating(consultationId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(consultRatings)
    .where(eq(consultRatings.consultationId, consultationId))
    .limit(1);
  return rows[0] || null;
}

export async function updateConsultRating(id: number, data: { rating: number; feedback?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(consultRatings).set(data).where(eq(consultRatings.id, id));
}

// ─── PEMF Affiliates ───────────────────────────────────────────────

export async function createPemfAffiliate(data: InsertPemfAffiliate): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(pemfAffiliates).values(data);
  return (result as { insertId: number }).insertId;
}

export async function getPemfAffiliateBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(pemfAffiliates)
    .where(eq(pemfAffiliates.slug, slug))
    .limit(1);
  return rows[0] || null;
}

export async function getPemfAffiliateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(pemfAffiliates)
    .where(eq(pemfAffiliates.id, id))
    .limit(1);
  return rows[0] || null;
}

export async function checkSlugExists(slug: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ id: pemfAffiliates.id }).from(pemfAffiliates)
    .where(eq(pemfAffiliates.slug, slug))
    .limit(1);
  return rows.length > 0;
}

// ─── PEMF Enquiries ────────────────────────────────────────────────

export async function createPemfEnquiry(data: InsertPemfEnquiry): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(pemfEnquiries).values(data);
  return (result as { insertId: number }).insertId;
}

export async function getPemfAffiliateByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(pemfAffiliates)
    .where(eq(pemfAffiliates.email, email))
    .limit(1);
  return rows[0] || null;
}

export async function updatePemfAffiliate(id: number, data: Partial<{
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  isActive: number;
  lastLoginAt: Date;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pemfAffiliates).set(data).where(eq(pemfAffiliates.id, id));
}

export async function getAllPemfAffiliates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pemfAffiliates).orderBy(pemfAffiliates.createdAt);
}

export async function getPemfEnquiriesByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pemfEnquiries)
    .where(eq(pemfEnquiries.affiliateId, affiliateId))
    .orderBy(pemfEnquiries.createdAt);
}

export async function getEnquiryCountsByAffiliate(): Promise<Record<number, number>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select({
    affiliateId: pemfEnquiries.affiliateId,
    count: sql<number>`COUNT(*)`,
  }).from(pemfEnquiries).groupBy(pemfEnquiries.affiliateId);
  const map: Record<number, number> = {};
  for (const row of rows) {
    map[row.affiliateId] = Number(row.count);
  }
  return map;
}

// ─── PEMF Resource Helpers ────────────────────────────────────────────────────

export async function createPemfResource(data: InsertPemfResource): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [result] = await db.insert(pemfResources).values(data);
  return (result as any).insertId;
}

export async function getAllPemfResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pemfResources).orderBy(pemfResources.sortOrder, pemfResources.createdAt);
}

export async function getPublishedPemfResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pemfResources)
    .where(eq(pemfResources.isPublished, 1))
    .orderBy(pemfResources.sortOrder, pemfResources.createdAt);
}

export async function updatePemfResource(id: number, data: Partial<InsertPemfResource>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(pemfResources).set(data).where(eq(pemfResources.id, id));
}

export async function deletePemfResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(pemfResources).where(eq(pemfResources.id, id));
}

// ─── Drip Sequences ───────────────────────────────────────────────────────────

export async function createDripSequence(data: InsertDripSequence): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [result] = await db.insert(dripSequences).values(data);
  return (result as any).insertId;
}

export async function getAllDripSequences() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dripSequences).orderBy(dripSequences.createdAt);
}

export async function getActiveDripSequences() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dripSequences).where(eq(dripSequences.isActive, 1)).orderBy(dripSequences.createdAt);
}

export async function updateDripSequence(id: number, data: Partial<InsertDripSequence>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(dripSequences).set(data).where(eq(dripSequences.id, id));
}

export async function deleteDripSequence(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(dripSequences).where(eq(dripSequences.id, id));
}

// ─── Drip Emails ──────────────────────────────────────────────────────────────

export async function createDripEmail(data: InsertDripEmail): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [result] = await db.insert(dripEmails).values(data);
  return (result as any).insertId;
}

export async function getDripEmailsBySequence(sequenceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dripEmails)
    .where(eq(dripEmails.sequenceId, sequenceId))
    .orderBy(dripEmails.sortOrder, dripEmails.dayOffset);
}

export async function updateDripEmail(id: number, data: Partial<InsertDripEmail>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(dripEmails).set(data).where(eq(dripEmails.id, id));
}

export async function deleteDripEmail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(dripEmails).where(eq(dripEmails.id, id));
}

// ─── Drip Enrollments ─────────────────────────────────────────────────────────

export async function createDripEnrollment(data: InsertDripEnrollment): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [result] = await db.insert(dripEnrollments).values(data);
  return (result as any).insertId;
}

export async function getDripEnrollmentsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dripEnrollments)
    .where(eq(dripEnrollments.affiliateId, affiliateId))
    .orderBy(desc(dripEnrollments.enrolledAt));
}

export async function getDripEnrollmentByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(dripEnrollments)
    .where(eq(dripEnrollments.unsubscribeToken, token))
    .limit(1);
  return rows[0] || null;
}

export async function updateDripEnrollment(id: number, data: Partial<InsertDripEnrollment>) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(dripEnrollments).set(data).where(eq(dripEnrollments.id, id));
}

/** Get all active enrollments with their sequence emails that are due to be sent. */
export async function getDueEmails(): Promise<Array<{
  enrollment: typeof dripEnrollments.$inferSelect;
  dripEmail: typeof dripEmails.$inferSelect;
}>> {
  const db = await getDb();
  if (!db) return [];

  // Get all active enrollments
  const activeEnrollments = await db.select().from(dripEnrollments)
    .where(eq(dripEnrollments.status, "active"));

  if (activeEnrollments.length === 0) return [];

  // Get already-sent log entries
  const sentLogs = await db.select().from(dripSendLog);
  const sentSet = new Set(sentLogs.map(l => `${l.enrollmentId}-${l.dripEmailId}`));

  const due: Array<{ enrollment: typeof dripEnrollments.$inferSelect; dripEmail: typeof dripEmails.$inferSelect }> = [];

  for (const enrollment of activeEnrollments) {
    const emails = await getDripEmailsBySequence(enrollment.sequenceId);
    const now = Date.now();
    const enrolledMs = new Date(enrollment.enrolledAt).getTime();

    for (const email of emails) {
      const key = `${enrollment.id}-${email.id}`;
      if (sentSet.has(key)) continue; // already sent

      const sendAfterMs = enrolledMs + email.dayOffset * 24 * 60 * 60 * 1000;
      if (now >= sendAfterMs) {
        due.push({ enrollment, dripEmail: email });
      }
    }
  }

  return due;
}

export async function logDripSend(data: InsertDripSendLog) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [result] = await db.insert(dripSendLog).values(data);
  return (result as any).insertId;
}

export async function getDripSendLogByEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dripSendLog)
    .where(eq(dripSendLog.enrollmentId, enrollmentId))
    .orderBy(dripSendLog.sentAt);
}

// ─── Email Log ────────────────────────────────────────────────────────────────

export async function logEmail(data: InsertEmailLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [result] = await db.insert(emailLog).values(data);
  return (result as any).insertId;
}

export async function getEmailLogByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailLog)
    .where(eq(emailLog.affiliateId, affiliateId))
    .orderBy(desc(emailLog.sentAt));
}

export async function getAllEmailLog(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailLog).orderBy(desc(emailLog.sentAt)).limit(limit);
}

// ─── Affiliate Drip Overrides ─────────────────────────────────────────────────

export async function getAffiliateDripOverride(affiliateId: number, dripEmailId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(affiliateDripOverrides)
    .where(and(eq(affiliateDripOverrides.affiliateId, affiliateId), eq(affiliateDripOverrides.dripEmailId, dripEmailId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertAffiliateDripOverride(data: InsertAffiliateDripOverride) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await getAffiliateDripOverride(data.affiliateId!, data.dripEmailId!);
  if (existing) {
    await db.update(affiliateDripOverrides)
      .set({ subject: data.subject, body: data.body })
      .where(eq(affiliateDripOverrides.id, existing.id));
  } else {
    await db.insert(affiliateDripOverrides).values(data);
  }
}

export async function getAffiliateDripOverridesForAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateDripOverrides)
    .where(eq(affiliateDripOverrides.affiliateId, affiliateId));
}

/** Update the status of a drip send log entry by its ID */
export async function updateDripSendStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(dripSendLog).set({ status } as any).where(eq(dripSendLog.id, id));
}

/** Get open and click stats per drip email for a given affiliate */
export async function getDripEmailStats(affiliateId: number): Promise<Array<{
  dripEmailId: number;
  sent: number;
  opens: number;
  clicks: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  const [rows] = await (db as any).execute(
    `SELECT
       sl.dripEmailId,
       COUNT(DISTINCT sl.id) AS sent,
       COUNT(DISTINCT oe.id) AS opens,
       COUNT(DISTINCT ce.id) AS clicks
     FROM drip_send_log sl
     JOIN drip_enrollments de ON sl.enrollmentId = de.id
     LEFT JOIN email_open_events oe ON oe.dripSendLogId = sl.id
     LEFT JOIN email_click_events ce ON ce.dripSendLogId = sl.id
     WHERE de.affiliateId = ? AND sl.status = 'sent'
     GROUP BY sl.dripEmailId`,
    [affiliateId]
  );
  return (rows as any[]).map((r: any) => ({
    dripEmailId: r.dripEmailId,
    sent: Number(r.sent),
    opens: Number(r.opens),
    clicks: Number(r.clicks),
  }));
}

/** Get open and click stats per drip email across all affiliates (admin view) */
export async function getAdminDripEmailStats(): Promise<Array<{
  dripEmailId: number;
  sent: number;
  opens: number;
  clicks: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  const [rows] = await (db as any).execute(
    `SELECT
       sl.dripEmailId,
       COUNT(DISTINCT sl.id) AS sent,
       COUNT(DISTINCT oe.id) AS opens,
       COUNT(DISTINCT ce.id) AS clicks
     FROM drip_send_log sl
     LEFT JOIN email_open_events oe ON oe.dripSendLogId = sl.id
     LEFT JOIN email_click_events ce ON ce.dripSendLogId = sl.id
     WHERE sl.status = 'sent'
     GROUP BY sl.dripEmailId`,
    []
  );
  return (rows as any[]).map((r: any) => ({
    dripEmailId: r.dripEmailId,
    sent: Number(r.sent),
    opens: Number(r.opens),
    clicks: Number(r.clicks),
  }));
}
