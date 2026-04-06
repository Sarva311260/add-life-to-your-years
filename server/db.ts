import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, evaluations, recommendations, InsertEvaluation, InsertRecommendation,
  consultations, consultMessages, consultReports, shopProducts,
  InsertConsultation, InsertConsultMessage, InsertConsultReport, InsertShopProduct,
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
