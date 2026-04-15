import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  firstName: varchar("firstName", { length: 100 }),
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

/**
 * Review requests — tracks paid personal review requests by Sarva.
 */
export const reviewRequests = mysqlTable("review_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consultationId: int("consultationId").notNull(),
  reportId: int("reportId").notNull(),
  /** Stripe checkout session ID */
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  /** Stripe payment intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  /** 'pending_payment', 'paid', 'in_review', 'completed', 'refunded' */
  status: varchar("status", { length: 32 }).default("pending_payment").notNull(),
  /** Sarva's personal notes/recommendations added during review */
  reviewNotes: text("reviewNotes"),
  /** When Sarva completed the review */
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReviewRequest = typeof reviewRequests.$inferSelect;
export type InsertReviewRequest = typeof reviewRequests.$inferInsert;

/**
 * Consultation ratings — stores user star ratings and optional feedback.
 */
export const consultRatings = mysqlTable("consult_ratings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consultationId: int("consultationId").notNull(),
  reportId: int("reportId").notNull(),
  /** Star rating 1-5 */
  rating: int("rating").notNull(),
  /** Optional written feedback */
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsultRating = typeof consultRatings.$inferSelect;
export type InsertConsultRating = typeof consultRatings.$inferInsert;

/**
 * PEMF Affiliates — brand partners who get personalised PEMF pages.
 */
export const pemfAffiliates = mysqlTable("pemf_affiliates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  /** URL-friendly slug derived from name (e.g. john-smith) */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** Bcrypt hashed password for affiliate login */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Whether the affiliate is currently active */
  isActive: int("isActive").default(1).notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PemfAffiliate = typeof pemfAffiliates.$inferSelect;
export type InsertPemfAffiliate = typeof pemfAffiliates.$inferInsert;

/**
 * PEMF Enquiries — contact form submissions from affiliate pages.
 */
export const pemfEnquiries = mysqlTable("pemf_enquiries", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  /** Visitor's name */
  visitorName: varchar("visitorName", { length: 255 }).notNull(),
  /** Visitor's email */
  visitorEmail: varchar("visitorEmail", { length: 320 }).notNull(),
  /** Visitor's phone */
  visitorPhone: varchar("visitorPhone", { length: 50 }),
  /** Message from the visitor */
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PemfEnquiry = typeof pemfEnquiries.$inferSelect;
export type InsertPemfEnquiry = typeof pemfEnquiries.$inferInsert;

/**
 * PEMF Resources — documents, scripts, email templates, and videos for affiliates.
 */
export const pemfResources = mysqlTable("pemf_resources", {
  id: int("id").autoincrement().primaryKey(),
  /** Resource type: 'document' | 'script' | 'email_template' | 'video' */
  type: mysqlEnum("type", ["document", "script", "email_template", "video"]).notNull(),
  /** Display title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Optional description shown to affiliates */
  description: text("description"),
  /** For documents/scripts: S3 CDN URL of uploaded file */
  fileUrl: varchar("fileUrl", { length: 512 }),
  /** Original filename (for documents/scripts) */
  fileName: varchar("fileName", { length: 255 }),
  /** For email templates: the full email body text */
  content: text("content"),
  /** For videos: YouTube/Vimeo URL */
  videoUrl: varchar("videoUrl", { length: 512 }),
  /** Category label for grouping (e.g. 'Getting Started', 'Social Media') */
  category: varchar("category", { length: 100 }),
  /** Whether visible to affiliates */
  isPublished: int("isPublished").default(1).notNull(),
  /** Display order within category */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PemfResource = typeof pemfResources.$inferSelect;
export type InsertPemfResource = typeof pemfResources.$inferInsert;
