import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Evaluations table — stores each completed self-evaluation.
 */
export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** JSON object mapping category ID to percentage score (0-100) */
  categoryScores: json("categoryScores").notNull(),
  /** JSON object mapping question ID to selected value (1-5) */
  responses: json("responses").notNull(),
  /** Overall wellness score (0-100) */
  overallScore: decimal("overallScore", { precision: 5, scale: 2 }).notNull(),
  /** Whether cardiac flag was triggered */
  cardiacFlag: int("cardiacFlag").default(0).notNull(),
  /** Demographics: gender */
  gender: varchar("gender", { length: 10 }),
  /** Demographics: age */
  age: int("age"),
  /** Demographics: height in cm (stored in metric) */
  heightCm: decimal("heightCm", { precision: 5, scale: 1 }),
  /** Demographics: weight in kg (stored in metric) */
  weightKg: decimal("weightKg", { precision: 5, scale: 1 }),
  /** Calculated BMI */
  bmi: decimal("bmi", { precision: 4, scale: 1 }),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;

/**
 * Recommendations table — stores AI-generated recommendations per evaluation.
 */
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).notNull(),
  /** JSON array of action step strings */
  actionSteps: json("actionSteps").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * Consultations table — stores each consultation session.
 */
export const consultations = mysqlTable("consultations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** 'full_review' or 'specific_conditions' */
  consultType: varchar("consultType", { length: 32 }).notNull(),
  /** JSON array of selected condition strings (for specific_conditions type) */
  selectedConditions: json("selectedConditions"),
  /** Current phase of the consultation (1-6) */
  currentPhase: int("currentPhase").default(1).notNull(),
  /** 'active', 'completed', 'abandoned' */
  status: varchar("status", { length: 20 }).default("active").notNull(),
  /** ID of the linked self-evaluation (if imported) */
  evaluationId: int("evaluationId"),
  /** Summary generated at end of consultation */
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

/**
 * Consultation messages — stores the chat history for each consultation.
 */
export const consultMessages = mysqlTable("consult_messages", {
  id: int("id").autoincrement().primaryKey(),
  consultationId: int("consultationId").notNull(),
  /** 'user', 'assistant', 'system' */
  role: varchar("role", { length: 16 }).notNull(),
  content: text("content").notNull(),
  /** Which phase this message belongs to (1-6) */
  phase: int("phase"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsultMessage = typeof consultMessages.$inferSelect;
export type InsertConsultMessage = typeof consultMessages.$inferInsert;

/**
 * Consultation reports — stores the final personalised report.
 */
export const consultReports = mysqlTable("consult_reports", {
  id: int("id").autoincrement().primaryKey(),
  consultationId: int("consultationId").notNull(),
  userId: int("userId").notNull(),
  /** Full markdown report content */
  content: text("content").notNull(),
  /** JSON array of recommendation objects */
  recommendations: json("recommendations").notNull(),
  /** JSON array of product recommendation objects with shop links */
  productRecommendations: json("productRecommendations"),
  /** S3 URL for downloadable PDF version */
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsultReport = typeof consultReports.$inferSelect;
export type InsertConsultReport = typeof consultReports.$inferInsert;

/**
 * Shop products — wellness products available for purchase.
 */
export const shopProducts = mysqlTable("shop_products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  /** Short description for product cards */
  shortDescription: varchar("shortDescription", { length: 500 }),
  /** Price in cents */
  priceInCents: int("priceInCents").notNull(),
  /** Currency code (e.g. 'AUD') */
  currency: varchar("currency", { length: 3 }).default("AUD").notNull(),
  /** CDN URL for product image */
  imageUrl: varchar("imageUrl", { length: 512 }),
  /** Product category for grouping */
  category: varchar("category", { length: 64 }),
  /** JSON array of recommendation IDs this product relates to */
  relatedRecommendations: json("relatedRecommendations"),
  /** External purchase URL if applicable */
  purchaseUrl: varchar("purchaseUrl", { length: 512 }),
  /** Whether the product is currently available */
  isActive: int("isActive").default(1).notNull(),
  /** Display order */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShopProduct = typeof shopProducts.$inferSelect;
export type InsertShopProduct = typeof shopProducts.$inferInsert;
