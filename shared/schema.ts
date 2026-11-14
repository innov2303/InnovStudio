import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projectStatusEnum = ["pending", "in_review", "awaiting_signature", "awaiting_deposit", "approved", "in_progress", "in_progress_1", "in_progress_2", "awaiting_final_payment", "completed", "cancelled"] as const;
export const featureStatusEnum = ["pending", "in_progress", "completed", "blocked"] as const;

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company").notNull(),
  address: text("address").notNull(),
  postalCode: text("postal_code").notNull().default(""),
  city: text("city").notNull().default(""),
  billingAddress: text("billing_address").notNull(),
  billingPostalCode: text("billing_postal_code").notNull().default(""),
  billingCity: text("billing_city").notNull().default(""),
  sameAsBilling: boolean("same_as_billing").default(false),
  role: text("role").notNull().default("user"),
  mustChangePassword: boolean("must_change_password").default(false),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  pendingEmail: text("pending_email"),
  emailChangeToken: text("email_change_token"),
  emailChangeExpires: timestamp("email_change_expires"),
  signature: text("signature"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  company: true,
  address: true,
  postalCode: true,
  city: true,
  billingAddress: true,
  billingPostalCode: true,
  billingCity: true,
  sameAsBilling: true,
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const emailAddressSchema = z.string().trim().email("Email invalide").max(254, "Email trop long");

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(120, "Nom trop long"),
  email: emailAddressSchema,
  phone: z.string().trim().max(40, "Téléphone trop long")
    .regex(/^[0-9+().\-\s]*$/, "Format de téléphone invalide")
    .optional()
    .default(""),
  subject: z.string().trim().max(200, "Sujet trop long").optional().default(""),
  message: z.string().trim().min(1, "Message requis").max(10_000, "Message trop long"),
}).transform((data) => ({
  ...data,
  subject: data.subject || "Sans sujet",
}));

export const registerSchema = insertUserSchema.extend({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  company: z.string().min(1, "Entreprise requise"),
  address: z.string().min(1, "Adresse requise"),
  postalCode: z.string().min(1, "Code postal requis"),
  city: z.string().min(1, "Ville requise"),
  billingAddress: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCity: z.string().optional(),
  sameAsBilling: z.boolean().optional(),
}).omit({ username: true });

export const googleProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis"),
  lastName: z.string().trim().min(1, "Nom requis"),
  company: z.string().trim().min(1, "Entreprise requise"),
  address: z.string().trim().min(1, "Adresse requise"),
  postalCode: z.string().trim().min(1, "Code postal requis"),
  city: z.string().trim().min(1, "Ville requise"),
  sameAsBilling: z.boolean().default(true),
  billingAddress: z.string().trim().optional(),
  billingPostalCode: z.string().trim().optional(),
  billingCity: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  if (data.sameAsBilling) return;

  if (!data.billingAddress) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["billingAddress"], message: "Adresse de facturation requise" });
  }
  if (!data.billingPostalCode) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["billingPostalCode"], message: "Code postal requis" });
  }
  if (!data.billingCity) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["billingCity"], message: "Ville requise" });
  }
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(6, "Minimum 6 caractères"),
  confirmPassword: z.string().min(6, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  newPassword: z.string().min(6, "Minimum 6 caractères"),
  confirmPassword: z.string().min(6, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  company: z.string().min(1, "Entreprise requise"),
  address: z.string().min(1, "Adresse requise"),
  postalCode: z.string().min(1, "Code postal requis"),
  city: z.string().min(1, "Ville requise"),
  billingAddress: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCity: z.string().optional(),
  sameAsBilling: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type GoogleProfileData = z.infer<typeof googleProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Projects table
export const projectTypeEnum = ["site_vitrine", "app_enterprise"] as const;

export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  projectType: text("project_type").notNull().default("site_vitrine"),
  businessSector: text("business_sector").notNull(),
  features: text("features").notNull(),
  designStyle: text("design_style").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  projectType: true,
  businessSector: true,
  features: true,
  designStyle: true,
});

export const createProjectSchema = insertProjectSchema.extend({
  title: z.string().min(3, "Minimum 3 caractères"),
  description: z.string().min(10, "Minimum 10 caractères"),
  projectType: z.enum(projectTypeEnum, { message: "Type de projet requis" }),
  businessSector: z.string().min(1, "Secteur d'activité requis"),
  features: z.string().min(10, "Minimum 10 caractères"),
  designStyle: z.string().min(1, "Style de design requis"),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type CreateProjectData = z.infer<typeof createProjectSchema>;

export const innovDevSiteStatusEnum = [
  "draft",
  "creating_repl",
  "ready",
  "publishing",
  "published",
  "error",
] as const;

export const innovDevServiceSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500),
});

export const innovDevSiteContentSchema = z.object({
  brandName: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(160),
  heroTitle: z.string().trim().min(1).max(180),
  heroDescription: z.string().trim().max(1200),
  heroImageUrl: z.string().trim().url().startsWith("https://").or(z.literal("")),
  primaryColor: z.string().regex(/^#[\da-fA-F]{6}$/),
  servicesTitle: z.string().trim().min(1).max(120),
  services: z.array(innovDevServiceSchema).max(8),
  aboutTitle: z.string().trim().min(1).max(120),
  aboutText: z.string().trim().max(1600),
  contactTitle: z.string().trim().min(1).max(120),
  contactEmail: z.string().trim().email().max(254).or(z.literal("")),
  contactPhone: z.string().trim().max(40).regex(/^[0-9+().\-\s]*$/),
  footerText: z.string().trim().max(250),
});

export type InnovDevSiteContent = z.infer<typeof innovDevSiteContentSchema>;

export function createDefaultInnovDevSiteContent(brandName = "Votre entreprise"): InnovDevSiteContent {
  const brand = brandName.trim().slice(0, 120) || "Votre entreprise";
  return {
    brandName: brand,
    tagline: "Des solutions adaptées à vos besoins",
    heroTitle: `Bienvenue chez ${brand}`,
    heroDescription: "Présentez votre activité, vos services et la valeur que vous apportez à vos clients.",
    heroImageUrl: "",
    primaryColor: "#2563eb",
    servicesTitle: "Nos services",
    services: [
      { title: "Conseil", description: "Un accompagnement adapté à votre projet." },
      { title: "Réalisation", description: "Des solutions pensées pour votre activité." },
      { title: "Accompagnement", description: "Un suivi disponible après la mise en ligne." },
    ],
    aboutTitle: "À propos",
    aboutText: "Présentez votre entreprise, votre expérience et votre façon de travailler.",
    contactTitle: "Parlons de votre projet",
    contactEmail: "",
    contactPhone: "",
    footerText: `${brand} — Tous droits réservés.`,
  };
}

export const innovDevSites = pgTable("innov_dev_sites", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  siteName: text("site_name").notNull(),
  templateId: text("template_id").notNull().default("showcase-v1"),
  content: jsonb("content").$type<InnovDevSiteContent>().notNull(),
  status: text("status").notNull().default("draft"),
  replitAppName: text("replit_app_name"),
  replitAppId: text("replit_app_id"),
  replitEditorUrl: text("replit_editor_url"),
  publicUrl: text("public_url"),
  lastError: text("last_error"),
  lastPublishedAt: timestamp("last_published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const createInnovDevSiteSchema = z.object({
  projectId: z.string().trim().min(1).max(36),
  siteName: z.string().trim().min(2).max(120),
  templateId: z.literal("showcase-v1").default("showcase-v1"),
  content: innovDevSiteContentSchema,
});

export const updateInnovDevSiteSchema = z.object({
  siteName: z.string().trim().min(2).max(120).optional(),
  content: innovDevSiteContentSchema.optional(),
});

export type CreateInnovDevSiteData = z.infer<typeof createInnovDevSiteSchema>;
export type InnovDevSite = typeof innovDevSites.$inferSelect;

export const innovDevReplitConnections = pgTable("innov_dev_replit_connections", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id", { length: 36 }).notNull().unique(),
  encryptedPayload: text("encrypted_payload").notNull(),
  connectedAt: timestamp("connected_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project Features table
export const projectFeatures = pgTable("project_features", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFeatureSchema = createInsertSchema(projectFeatures).pick({
  title: true,
  description: true,
});

export const createFeatureSchema = insertFeatureSchema.extend({
  title: z.string().min(3, "Minimum 3 caractères"),
  description: z.string().optional(),
});

export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type ProjectFeature = typeof projectFeatures.$inferSelect;
export type CreateFeatureData = z.infer<typeof createFeatureSchema>;

// Document status enum
export const documentStatusEnum = ["draft", "awaiting_signature", "signed", "paid"] as const;
export const documentTypeEnum = ["quote", "invoice"] as const;

// Project Documents table
export const projectDocuments = pgTable("project_documents", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  type: text("type").notNull().default("quote"),
  status: text("status").notNull().default("draft"),
  // Quote details
  quoteTitle: text("quote_title"),
  quoteDescription: text("quote_description"),
  quoteLineItems: text("quote_line_items"), // JSON array of {description, amount}
  quoteAmount: text("quote_amount"),
  quoteDepositPercent: text("quote_deposit_percent"),
  quoteValidityDays: text("quote_validity_days"),
  quoteNotes: text("quote_notes"),
  // Files
  fileName: text("file_name"),
  signedFileName: text("signed_file_name"),
  clientSignature: text("client_signature"), // Base64 PNG signature from client
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(projectDocuments).pick({
  projectId: true,
  type: true,
});

export const updateQuoteSchema = z.object({
  quoteTitle: z.string().min(1, "Titre requis"),
  quoteDescription: z.string().optional(),
  quoteLineItems: z.string().optional(), // JSON string
  quoteAmount: z.string().min(1, "Montant requis"),
  quoteDepositPercent: z.string().optional(),
  quoteValidityDays: z.string().optional(),
  quoteNotes: z.string().optional(),
});

export type QuoteLineItem = {
  description: string;
  amount: string;
};

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type UpdateQuoteData = z.infer<typeof updateQuoteSchema>;

// Subscription offer types
export const subscriptionOfferEnum = [
  "hosting_vitrine", "maintenance_vitrine", "pack_vitrine",
  "hosting_enterprise", "maintenance_enterprise", "pack_enterprise"
] as const;
export const subscriptionStatusEnum = ["active", "cancelled", "expired"] as const;

// Subscription offers table (configurable prices)
export const subscriptionOffers = pgTable("subscription_offers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  description: text("description").notNull(),
  discountPercent: text("discount_percent"),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const updateSubscriptionOfferSchema = z.object({
  price: z.string().min(1, "Prix requis"),
});

export type SubscriptionOffer = typeof subscriptionOffers.$inferSelect;
export type UpdateSubscriptionOfferData = z.infer<typeof updateSubscriptionOfferSchema>;

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  offerType: text("offer_type").notNull(),
  status: text("status").notNull().default("active"),
  monthlyPrice: text("monthly_price").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  projectId: true,
  offerType: true,
});

export const createSubscriptionSchema = insertSubscriptionSchema.extend({
  projectId: z.string().min(1, "Projet requis"),
  offerType: z.enum(subscriptionOfferEnum, { message: "Type d'offre invalide" }),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type CreateSubscriptionData = z.infer<typeof createSubscriptionSchema>;

// Security Logs
export const securityLogTypeEnum = ["login_success", "login_failed", "register", "password_reset_request", "password_changed", "account_locked", "suspicious_activity", "rate_limit_exceeded"] as const;

export const securityLogs = pgTable("security_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  userId: varchar("user_id", { length: 36 }),
  email: text("email"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSecurityLogSchema = createInsertSchema(securityLogs).pick({
  type: true,
  userId: true,
  email: true,
  ipAddress: true,
  userAgent: true,
  details: true,
});

export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type SecurityLog = typeof securityLogs.$inferSelect;

// Page Visits (Analytics)
export const pageVisits = pgTable("page_visits", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  path: text("path").notNull(),
  referrer: text("referrer"),
  source: text("source"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PageVisit = typeof pageVisits.$inferSelect;

// References (Portfolio)
export const references = pgTable("references", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  displayOrder: text("display_order").notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReferenceSchema = createInsertSchema(references).pick({
  title: true,
  url: true,
  category: true,
  description: true,
  imageUrl: true,
  displayOrder: true,
});

export type InsertReference = z.infer<typeof insertReferenceSchema>;
export type Reference = typeof references.$inferSelect;

// SEO Reports (Agent SEO)
export const seoReports = pgTable("seo_reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  analysisDate: timestamp("analysis_date").defaultNow(),
  score: varchar("score", { length: 10 }).notNull().default("0"),
  suggestions: text("suggestions").notNull().default("[]"),
  appliedSuggestions: text("applied_suggestions").notNull().default("[]"),
  trendingKeywords: text("trending_keywords").notNull().default("[]"),
  visitStats: text("visit_stats").notNull().default("{}"),
  emailSent: boolean("email_sent").notNull().default(false),
});

export type SeoReport = typeof seoReports.$inferSelect;
