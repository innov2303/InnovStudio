import { type User, type InsertUser, users, type Project, type InsertProject, projects, type ProjectFeature, type InsertFeature, projectFeatures, type ProjectDocument, type InsertDocument, projectDocuments } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string; mustChangePassword?: boolean; verificationToken?: string }): Promise<User>;
  verifyUserEmail(userId: string): Promise<void>;
  updateUserVerificationToken(userId: string, token: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  clearPasswordResetToken(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  initializeAdmin(): Promise<void>;
  // Projects
  createProject(userId: string, project: InsertProject): Promise<Project>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  updateProjectStatus(id: string, status: string): Promise<Project | undefined>;
  // Features
  createFeature(projectId: string, feature: InsertFeature): Promise<ProjectFeature>;
  getFeature(id: string): Promise<ProjectFeature | undefined>;
  getFeaturesByProject(projectId: string): Promise<ProjectFeature[]>;
  updateFeature(id: string, updates: { name?: string; description?: string }): Promise<ProjectFeature | undefined>;
  updateFeatureStatus(id: string, status: string, adminNotes?: string): Promise<ProjectFeature | undefined>;
  deleteFeature(id: string): Promise<boolean>;
  // Documents
  createDocument(projectId: string, type: string, quoteDescription?: string): Promise<ProjectDocument>;
  getDocument(id: string): Promise<ProjectDocument | undefined>;
  getDocumentsByProject(projectId: string): Promise<ProjectDocument[]>;
  updateDocumentStatus(id: string, status: string): Promise<ProjectDocument | undefined>;
  updateDocumentFile(id: string, fileName: string): Promise<ProjectDocument | undefined>;
  updateDocumentSignedFile(id: string, signedFileName: string): Promise<ProjectDocument | undefined>;
  updateQuoteDetails(id: string, details: { quoteTitle?: string; quoteDescription?: string; quoteAmount?: string; quoteDepositPercent?: string; quoteValidityDays?: string; quoteNotes?: string }): Promise<ProjectDocument | undefined>;
  deleteDocument(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: true, verificationToken: null })
      .where(eq(users.id, userId));
  }

  async updateUserVerificationToken(userId: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ verificationToken: token })
      .where(eq(users.id, userId));
  }

  async createUser(insertUser: InsertUser & { role?: string; mustChangePassword?: boolean; verificationToken?: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        role: insertUser.role || "user",
        mustChangePassword: insertUser.mustChangePassword || false,
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ 
        password: hashedPassword, 
        mustChangePassword: false 
      })
      .where(eq(users.id, userId));
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({ passwordResetToken: token, passwordResetExpires: expires })
      .where(eq(users.id, userId));
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ passwordResetToken: null, passwordResetExpires: null })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async initializeAdmin(): Promise<void> {
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      await this.createUser({
        username: "admin",
        email: "admin@innov-studio.fr",
        password: "admin",
        firstName: "Admin",
        lastName: "Studio",
        company: "Innov Studio",
        address: "1 Rue de l'Innovation, 75001 Paris",
        billingAddress: "1 Rue de l'Innovation, 75001 Paris",
        sameAsBilling: true,
        role: "admin",
        mustChangePassword: true,
      });
      console.log("Admin user created with default credentials");
    } else if (!existingAdmin.email) {
      // Update existing admin with email if not set
      await db.update(users).set({ email: "admin@innov-studio.fr" }).where(eq(users.username, "admin"));
      console.log("Admin email updated");
    }
  }

  async createProject(userId: string, project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values({
        ...project,
        userId,
      })
      .returning();
    return newProject;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async updateProjectStatus(id: string, status: string): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async createFeature(projectId: string, feature: InsertFeature): Promise<ProjectFeature> {
    const [newFeature] = await db
      .insert(projectFeatures)
      .values({
        ...feature,
        projectId,
      })
      .returning();
    return newFeature;
  }

  async getFeature(id: string): Promise<ProjectFeature | undefined> {
    const [feature] = await db.select().from(projectFeatures).where(eq(projectFeatures.id, id));
    return feature;
  }

  async getFeaturesByProject(projectId: string): Promise<ProjectFeature[]> {
    return db.select().from(projectFeatures).where(eq(projectFeatures.projectId, projectId)).orderBy(desc(projectFeatures.createdAt));
  }

  async updateFeature(id: string, updates: { name?: string; description?: string }): Promise<ProjectFeature | undefined> {
    const [feature] = await db
      .update(projectFeatures)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projectFeatures.id, id))
      .returning();
    return feature;
  }

  async updateFeatureStatus(id: string, status: string, adminNotes?: string): Promise<ProjectFeature | undefined> {
    const [feature] = await db
      .update(projectFeatures)
      .set({ status, adminNotes, updatedAt: new Date() })
      .where(eq(projectFeatures.id, id))
      .returning();
    return feature;
  }

  async deleteFeature(id: string): Promise<boolean> {
    const result = await db.delete(projectFeatures).where(eq(projectFeatures.id, id));
    return true;
  }

  // Document operations
  async createDocument(projectId: string, type: string, quoteDescription?: string): Promise<ProjectDocument> {
    const [doc] = await db
      .insert(projectDocuments)
      .values({
        projectId,
        type,
        status: "draft",
        quoteDescription,
      })
      .returning();
    return doc;
  }

  async getDocument(id: string): Promise<ProjectDocument | undefined> {
    const [doc] = await db.select().from(projectDocuments).where(eq(projectDocuments.id, id));
    return doc;
  }

  async getDocumentsByProject(projectId: string): Promise<ProjectDocument[]> {
    return db.select().from(projectDocuments).where(eq(projectDocuments.projectId, projectId)).orderBy(desc(projectDocuments.createdAt));
  }

  async updateDocumentStatus(id: string, status: string): Promise<ProjectDocument | undefined> {
    const [doc] = await db
      .update(projectDocuments)
      .set({ status, updatedAt: new Date() })
      .where(eq(projectDocuments.id, id))
      .returning();
    return doc;
  }

  async updateDocumentFile(id: string, fileName: string): Promise<ProjectDocument | undefined> {
    const [doc] = await db
      .update(projectDocuments)
      .set({ fileName, updatedAt: new Date() })
      .where(eq(projectDocuments.id, id))
      .returning();
    return doc;
  }

  async updateDocumentSignedFile(id: string, signedFileName: string): Promise<ProjectDocument | undefined> {
    const [doc] = await db
      .update(projectDocuments)
      .set({ signedFileName, status: "signed", updatedAt: new Date() })
      .where(eq(projectDocuments.id, id))
      .returning();
    return doc;
  }

  async updateQuoteDetails(id: string, details: { quoteTitle?: string; quoteDescription?: string; quoteAmount?: string; quoteDepositPercent?: string; quoteValidityDays?: string; quoteNotes?: string }): Promise<ProjectDocument | undefined> {
    const [doc] = await db
      .update(projectDocuments)
      .set({ ...details, updatedAt: new Date() })
      .where(eq(projectDocuments.id, id))
      .returning();
    return doc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    await db.delete(projectDocuments).where(eq(projectDocuments.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
