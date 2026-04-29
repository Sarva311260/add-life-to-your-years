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
  /** Social media links */
  facebook: varchar("facebook", { length: 512 }),
  instagram: varchar("instagram", { length: 512 }),
  linkedin: varchar("linkedin", { length: 512 }),
  tiktok: varchar("tiktok", { length: 512 }),
  youtube: varchar("youtube", { length: 512 }),
  twitter: varchar("twitter", { length: 512 }),
  /** ASEA shopping cart URLs for the Redox Signaling affiliate page */
  aseaCartUrl: varchar("aseaCartUrl", { length: 1024 }),
  aseaRedoxRetailUrl: varchar("aseaRedoxRetailUrl", { length: 1024 }),
  aseaRedoxSubscriptionUrl: varchar("aseaRedoxSubscriptionUrl", { length: 1024 }),
  aseaRenu28RetailUrl: varchar("aseaRenu28RetailUrl", { length: 1024 }),
  aseaRenu28SubscriptionUrl: varchar("aseaRenu28SubscriptionUrl", { length: 1024 }),
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
  /** The page URL the enquiry was submitted from (e.g. /pemf/john-smith) */
  sourcePage: varchar("sourcePage", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PemfEnquiry = typeof pemfEnquiries.$inferSelect;
export type InsertPemfEnquiry = typeof pemfEnquiries.$inferInsert;

/**
 * PEMF Resources — documents, scripts, email templates, and videos for affiliates.
 */
export const pemfResources = mysqlTable("pemf_resources", {
  id: int("id").autoincrement().primaryKey(),
  /** Resource type: 'document' | 'script' | 'email_template' | 'video' | 'landing_page' */
  type: mysqlEnum("type", ["document", "script", "email_template", "video", "landing_page"]).notNull(),
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
  /** Subcategory label for further grouping within a category (e.g. 'PEMF Pages', 'Health Resources') */
  subcategory: varchar("subcategory", { length: 100 }),
  /** For landing_page type: the URL of the page or website */
  pageUrl: varchar("pageUrl", { length: 512 }),
  /** Whether visible to affiliates */
  isPublished: int("isPublished").default(1).notNull(),
  /** Display order within category */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PemfResource = typeof pemfResources.$inferSelect;
export type InsertPemfResource = typeof pemfResources.$inferInsert;

/**
 * Drip Sequences — admin-defined email sequences sent to leads automatically.
 */
export const dripSequences = mysqlTable("drip_sequences", {
  id: int("id").autoincrement().primaryKey(),
  /** Display name for this sequence (e.g. "PEMF Welcome Series") */
  name: varchar("name", { length: 255 }).notNull(),
  /** Optional description */
  description: text("description"),
  /** Whether this sequence is active and will enroll new leads */
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DripSequence = typeof dripSequences.$inferSelect;
export type InsertDripSequence = typeof dripSequences.$inferInsert;

/**
 * Drip Emails — individual emails within a drip sequence.
 */
export const dripEmails = mysqlTable("drip_emails", {
  id: int("id").autoincrement().primaryKey(),
  sequenceId: int("sequenceId").notNull(),
  /** Days after enrollment to send this email (0 = immediately) */
  dayOffset: int("dayOffset").default(0).notNull(),
  /** Email subject line */
  subject: varchar("subject", { length: 255 }).notNull(),
  /** Email body (HTML supported) */
  body: text("body").notNull(),
  /** Display order within the sequence */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DripEmail = typeof dripEmails.$inferSelect;
export type InsertDripEmail = typeof dripEmails.$inferInsert;

/**
 * Drip Enrollments — tracks which leads are enrolled in which sequences.
 */
export const dripEnrollments = mysqlTable("drip_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  sequenceId: int("sequenceId").notNull(),
  enquiryId: int("enquiryId").notNull(),
  affiliateId: int("affiliateId").notNull(),
  /** Lead's email address */
  leadEmail: varchar("leadEmail", { length: 320 }).notNull(),
  /** Lead's name */
  leadName: varchar("leadName", { length: 255 }).notNull(),
  /** When the enrollment started */
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  /** 'active' | 'completed' | 'unsubscribed' */
  status: varchar("status", { length: 20 }).default("active").notNull(),
  /** Unique token for unsubscribe link */
  unsubscribeToken: varchar("unsubscribeToken", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DripEnrollment = typeof dripEnrollments.$inferSelect;
export type InsertDripEnrollment = typeof dripEnrollments.$inferInsert;

/**
 * Drip Send Log — tracks which drip emails have been sent to which enrollments.
 */
export const dripSendLog = mysqlTable("drip_send_log", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull(),
  dripEmailId: int("dripEmailId").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  /** 'sent' | 'failed' */
  status: varchar("status", { length: 20 }).default("sent").notNull(),
});

export type DripSendLog = typeof dripSendLog.$inferSelect;
export type InsertDripSendLog = typeof dripSendLog.$inferInsert;

/**
 * Email Log — tracks all manually sent emails (affiliate→lead, admin→affiliate, broadcasts).
 */
export const emailLog = mysqlTable("email_log", {
  id: int("id").autoincrement().primaryKey(),
  /** 'affiliate_to_lead' | 'admin_to_affiliate' | 'admin_broadcast' */
  type: varchar("type", { length: 32 }).notNull(),
  /** Sender affiliate ID (if affiliate→lead) */
  affiliateId: int("affiliateId"),
  /** Recipient email */
  toEmail: varchar("toEmail", { length: 320 }).notNull(),
  /** Recipient name */
  toName: varchar("toName", { length: 255 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  /** Resend message ID */
  resendId: varchar("resendId", { length: 128 }),
  /** 'sent' | 'failed' */
  status: varchar("status", { length: 20 }).default("sent").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLog.$inferSelect;
export type InsertEmailLog = typeof emailLog.$inferInsert;

/**
 * Affiliate Drip Email Overrides — allows affiliates to customise the subject/body
 * of individual drip emails for their own leads. Falls back to the admin default if no override.
 */
export const affiliateDripOverrides = mysqlTable("affiliate_drip_overrides", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  dripEmailId: int("dripEmailId").notNull(),
  /** Custom subject (null = use admin default) */
  subject: varchar("subject", { length: 255 }),
  /** Custom body HTML (null = use admin default) */
  body: text("body"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateDripOverride = typeof affiliateDripOverrides.$inferSelect;
export type InsertAffiliateDripOverride = typeof affiliateDripOverrides.$inferInsert;

/**
 * Email Open Events — recorded when a tracking pixel is loaded.
 */
export const emailOpenEvents = mysqlTable("email_open_events", {
  id: int("id").autoincrement().primaryKey(),
  /** The drip send log entry this open belongs to */
  dripSendLogId: int("dripSendLogId").notNull(),
  affiliateId: int("affiliateId").notNull(),
  dripEmailId: int("dripEmailId").notNull(),
  prospectEmail: varchar("prospectEmail", { length: 320 }),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  userAgent: text("userAgent"),
});
export type EmailOpenEvent = typeof emailOpenEvents.$inferSelect;

/**
 * Email Click Events — recorded when a tracked link is clicked.
 */
export const emailClickEvents = mysqlTable("email_click_events", {
  id: int("id").autoincrement().primaryKey(),
  dripSendLogId: int("dripSendLogId").notNull(),
  affiliateId: int("affiliateId").notNull(),
  dripEmailId: int("dripEmailId").notNull(),
  prospectEmail: varchar("prospectEmail", { length: 320 }),
  /** The original destination URL */
  targetUrl: text("targetUrl").notNull(),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
  userAgent: text("userAgent"),
});
export type EmailClickEvent = typeof emailClickEvents.$inferSelect;

/**
 * Recommended products — products shown on the main site's Recommended Products section.
 * Each product can have a default affiliate link (Peter's) and optionally be part of
 * a third-party affiliate programme so Brand Partners can enter their own links.
 */
export const recommendedProducts = mysqlTable("recommended_products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 500 }),
  /** CDN URL for product image */
  imageUrl: varchar("imageUrl", { length: 512 }),
  /** Product category for grouping/display */
  category: varchar("category", { length: 64 }),
  /** Whether this product is part of a third-party affiliate programme */
  isAffiliate: int("isAffiliate").default(0).notNull(),
  /** Peter's (owner's) default affiliate link for this product */
  defaultAffiliateUrl: varchar("defaultAffiliateUrl", { length: 1024 }),
  /** Whether the product is published and visible on the main site */
  isPublished: int("isPublished").default(1).notNull(),
  /** Display order */
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RecommendedProduct = typeof recommendedProducts.$inferSelect;
export type InsertRecommendedProduct = typeof recommendedProducts.$inferInsert;

/**
 * Affiliate product links — stores each Brand Partner's own affiliate link
 * for a specific recommended product. Falls back to the product's defaultAffiliateUrl
 * if no override is present.
 */
export const affiliateProductLinks = mysqlTable("affiliate_product_links", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  productId: int("productId").notNull(),
  /** The affiliate's own link for this product */
  affiliateUrl: varchar("affiliateUrl", { length: 1024 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AffiliateProductLink = typeof affiliateProductLinks.$inferSelect;
export type InsertAffiliateProductLink = typeof affiliateProductLinks.$inferInsert;

/**
 * Affiliate Contacts — manually added or imported contacts for each Brand Partner.
 * Separate from pemfEnquiries (which are inbound form submissions).
 */
export const affiliateContacts = mysqlTable("affiliate_contacts", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  /** Contact's full name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Contact's email address */
  email: varchar("email", { length: 320 }),
  /** Contact's phone number */
  phone: varchar("phone", { length: 50 }),
  /** Optional notes about this contact */
  notes: text("notes"),
  /** Address fields */
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 100 }),
  addressPostcode: varchar("addressPostcode", { length: 20 }),
  addressCountry: varchar("addressCountry", { length: 100 }),
  /** Birthday (stored as date string YYYY-MM-DD) */
  birthday: varchar("birthday", { length: 10 }),
  /** Comma-separated tags e.g. "hot lead,follow up" */
  tags: text("tags"),
  /** Reminder date (UTC ms timestamp) */
  reminderAt: int("reminderAt"),
  /** Reminder note */
  reminderNote: text("reminderNote"),
  /** How this contact was added: manual | csv | vcf | enquiry */
  source: varchar("source", { length: 20 }).notNull().default("manual"),
  /** If enrolled in a drip campaign, the sequence ID */
  enrolledSequenceId: int("enrolledSequenceId"),
  /** When the contact was enrolled in the campaign */
  enrolledAt: timestamp("enrolledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AffiliateContact = typeof affiliateContacts.$inferSelect;
export type InsertAffiliateContact = typeof affiliateContacts.$inferInsert;

/**
 * CRM Merge Tags — admin-defined global tags available to all affiliates.
 * e.g. {{pemf_link}}, {{redox_link}}, {{masterpeace_link}}
 * scope: 'global' = available to all; 'system' = auto-resolved, not editable
 */
export const crmMergeTags = mysqlTable("crm_merge_tags", {
  id: int("id").autoincrement().primaryKey(),
  /** The tag key used in templates e.g. "pemf_link" → {{pemf_link}} */
  tagKey: varchar("tagKey", { length: 100 }).notNull().unique(),
  /** Human-readable label shown in the picker */
  label: varchar("label", { length: 255 }).notNull(),
  /** The default value (URL or text) — affiliates may override via affiliate_custom_links */
  defaultValue: text("defaultValue"),
  /** Category for grouping in the picker: 'link' | 'text' | 'asset' */
  category: varchar("category", { length: 20 }).notNull().default("text"),
  /** Short description shown in the picker */
  description: varchar("description", { length: 512 }),
  /** Display order */
  sortOrder: int("sortOrder").default(0).notNull(),
  /** Whether this tag is active */
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CrmMergeTag = typeof crmMergeTags.$inferSelect;
export type InsertCrmMergeTag = typeof crmMergeTags.$inferInsert;

/**
 * Affiliate Custom Links — each affiliate's own overrides or additions to merge tags.
 * e.g. their personal booking link, Facebook group link, etc.
 * If tagKey matches a global tag, it overrides the default for that affiliate.
 * If tagKey is new, it creates an affiliate-only tag.
 */
export const affiliateCustomLinks = mysqlTable("affiliate_custom_links", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  /** The tag key — must be unique per affiliate */
  tagKey: varchar("tagKey", { length: 100 }).notNull(),
  /** Human-readable label */
  label: varchar("label", { length: 255 }).notNull(),
  /** The URL or text value */
  value: text("value").notNull(),
  /** Category: 'link' | 'text' */
  category: varchar("category", { length: 20 }).notNull().default("link"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AffiliateCustomLink = typeof affiliateCustomLinks.$inferSelect;
export type InsertAffiliateCustomLink = typeof affiliateCustomLinks.$inferInsert;

/**
 * CRM Assets — shared video and document library for use in email campaigns.
 * Admin manages this library; affiliates can reference assets via {{asset_key}} tags.
 */
export const crmAssets = mysqlTable("crm_assets", {
  id: int("id").autoincrement().primaryKey(),
  /** The tag key used in templates e.g. "video_redox" → {{video_redox}} */
  tagKey: varchar("tagKey", { length: 100 }).notNull().unique(),
  /** Human-readable title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Asset type: 'video' | 'pdf' | 'image' | 'link' */
  assetType: varchar("assetType", { length: 20 }).notNull().default("video"),
  /** URL to the asset (YouTube, Vimeo, S3, or external URL) */
  url: varchar("url", { length: 1024 }).notNull(),
  /** Optional thumbnail URL */
  thumbnailUrl: varchar("thumbnailUrl", { length: 1024 }),
  /** Short description */
  description: varchar("description", { length: 512 }),
  /** When inserted into email, this is the HTML snippet generated */
  embedHtml: text("embedHtml"),
  /** Display order */
  sortOrder: int("sortOrder").default(0).notNull(),
  /** Whether this asset is active */
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CrmAsset = typeof crmAssets.$inferSelect;
export type InsertCrmAsset = typeof crmAssets.$inferInsert;
