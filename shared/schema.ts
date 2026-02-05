import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projectStatusEnum = ["pending", "in_review", "approved", "in_progress", "awaiting_final_payment", "completed", "cancelled"] as const;
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
  billingAddress: text("billing_address").notNull(),
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
  billingAddress: true,
  sameAsBilling: true,
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = insertUserSchema.extend({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  company: z.string().min(1, "Entreprise requise"),
  address: z.string().min(1, "Adresse requise"),
  billingAddress: z.string().optional(),
  sameAsBilling: z.boolean().optional(),
}).omit({ username: true });

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
  billingAddress: z.string().optional(),
  sameAsBilling: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
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
  businessSector: true,
  features: true,
  designStyle: true,
});

export const createProjectSchema = insertProjectSchema.extend({
  title: z.string().min(3, "Minimum 3 caractères"),
  description: z.string().min(10, "Minimum 10 caractères"),
  businessSector: z.string().min(1, "Secteur d'activité requis"),
  features: z.string().min(10, "Minimum 10 caractères"),
  designStyle: z.string().min(1, "Style de design requis"),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type CreateProjectData = z.infer<typeof createProjectSchema>;

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
export const subscriptionOfferEnum = ["maintenance", "hosting", "pack"] as const;
export const subscriptionStatusEnum = ["active", "cancelled", "expired"] as const;

// Subscription offers table (configurable prices)
export const subscriptionOffers = pgTable("subscription_offers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  description: text("description").notNull(),
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
  offerType: text("offer_type").notNull(), // maintenance, hosting, pack
  status: text("status").notNull().default("active"),
  monthlyPrice: text("monthly_price").notNull(),
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
  offerType: z.enum(subscriptionOfferEnum, { errorMap: () => ({ message: "Type d'offre invalide" }) }),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type CreateSubscriptionData = z.infer<typeof createSubscriptionSchema>;
