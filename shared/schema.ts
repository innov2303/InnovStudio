import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projectStatusEnum = ["pending", "in_review", "approved", "in_progress", "completed", "cancelled"] as const;

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company").notNull(),
  address: text("address").notNull(),
  billingAddress: text("billing_address").notNull(),
  sameAsBilling: boolean("same_as_billing").default(false),
  role: text("role").notNull().default("user"),
  mustChangePassword: boolean("must_change_password").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  company: true,
  address: true,
  billingAddress: true,
  sameAsBilling: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Minimum 3 caractères"),
  password: z.string().min(6, "Minimum 6 caractères"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  company: z.string().min(1, "Entreprise requise"),
  address: z.string().min(1, "Adresse requise"),
  billingAddress: z.string().optional(),
  sameAsBilling: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(6, "Minimum 6 caractères"),
  confirmPassword: z.string().min(6, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

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
