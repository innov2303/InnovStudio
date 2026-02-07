import { type User, type InsertUser, users, type Project, type InsertProject, projects, type ProjectFeature, type InsertFeature, projectFeatures, type ProjectDocument, type InsertDocument, projectDocuments, type Subscription, type InsertSubscription, subscriptions, type SubscriptionOffer, subscriptionOffers, securityLogs, type SecurityLog } from "@shared/schema";
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
  updateUserSignature(userId: string, signature: string): Promise<void>;
  updateUserProfile(userId: string, data: { company: string; address: string; postalCode: string; city: string; billingAddress?: string; billingPostalCode?: string; billingCity?: string; sameAsBilling?: boolean }): Promise<User | undefined>;
  setEmailChangeRequest(userId: string, newEmail: string, token: string, expires: Date): Promise<void>;
  getUserByEmailChangeToken(token: string): Promise<User | undefined>;
  confirmEmailChange(userId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  initializeAdmin(): Promise<void>;
  // Projects
  createProject(userId: string, project: InsertProject): Promise<Project>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  updateProjectStatus(id: string, status: string): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
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
  updateDocumentClientSignature(id: string, clientSignature: string): Promise<ProjectDocument | undefined>;
  updateQuoteDetails(id: string, details: { quoteTitle?: string; quoteDescription?: string; quoteLineItems?: string; quoteAmount?: string; quoteDepositPercent?: string; quoteValidityDays?: string; quoteNotes?: string }): Promise<ProjectDocument | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  createInvoiceFromQuote(quoteId: string): Promise<ProjectDocument | undefined>;
  createSubscriptionInvoice(projectId: string, subscriptionId: string, offerName: string, amount: string): Promise<ProjectDocument | undefined>;
  // Subscriptions
  createSubscription(userId: string, projectId: string, offerType: string, monthlyPrice: string): Promise<Subscription>;
  createSubscriptionWithStripe(userId: string, projectId: string, offerType: string, monthlyPrice: string, stripeSubscriptionId: string, currentPeriodEnd: Date | null): Promise<Subscription>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  getSubscriptionsByUser(userId: string): Promise<Subscription[]>;
  getSubscriptionsByProject(projectId: string): Promise<Subscription[]>;
  getAllSubscriptions(): Promise<Subscription[]>;
  updateSubscriptionStatus(id: string, status: string): Promise<Subscription | undefined>;
  updateSubscriptionStripeData(id: string, currentPeriodEnd: Date | null, cancelAtPeriodEnd: boolean): Promise<Subscription | undefined>;
  deleteSubscription(id: string): Promise<boolean>;
  
  // Subscription Offers
  getSubscriptionOffers(): Promise<SubscriptionOffer[]>;
  getSubscriptionOffer(id: string): Promise<SubscriptionOffer | undefined>;
  updateSubscriptionOffer(id: string, price: string, discountPercent?: string | null): Promise<SubscriptionOffer | undefined>;
  deleteSubscriptionOffer(id: string): Promise<boolean>;
  
  // Security Logs
  createSecurityLog(log: { type: string; userId?: string; email?: string; ipAddress?: string; userAgent?: string; details?: string }): Promise<void>;
  getSecurityLogs(limit?: number): Promise<any[]>;
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

  async updateUserSignature(userId: string, signature: string): Promise<void> {
    await db
      .update(users)
      .set({ signature })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, data: { company: string; address: string; postalCode: string; city: string; billingAddress?: string; billingPostalCode?: string; billingCity?: string; sameAsBilling?: boolean }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        company: data.company,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        billingAddress: data.sameAsBilling ? data.address : (data.billingAddress || data.address),
        billingPostalCode: data.sameAsBilling ? data.postalCode : (data.billingPostalCode || data.postalCode),
        billingCity: data.sameAsBilling ? data.city : (data.billingCity || data.city),
        sameAsBilling: data.sameAsBilling || false,
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async setEmailChangeRequest(userId: string, newEmail: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({ pendingEmail: newEmail, emailChangeToken: token, emailChangeExpires: expires })
      .where(eq(users.id, userId));
  }

  async getUserByEmailChangeToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailChangeToken, token));
    return user;
  }

  async confirmEmailChange(userId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user || !user.pendingEmail) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        email: user.pendingEmail, 
        pendingEmail: null, 
        emailChangeToken: null, 
        emailChangeExpires: null 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async initializeAdmin(): Promise<void> {
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await db.insert(users).values({
        username: "admin",
        email: "admin@innov-studio.fr",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "Studio",
        company: "Innov Studio",
        address: "1 Rue de l'Innovation, 75001 Paris",
        billingAddress: "1 Rue de l'Innovation, 75001 Paris",
        sameAsBilling: true,
        role: "admin",
        mustChangePassword: true,
        emailVerified: true,
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

  async deleteProject(id: string): Promise<boolean> {
    // Delete related features first
    await db.delete(projectFeatures).where(eq(projectFeatures.projectId, id));
    // Delete related documents
    await db.delete(projectDocuments).where(eq(projectDocuments.projectId, id));
    // Delete the project
    await db.delete(projects).where(eq(projects.id, id));
    return true;
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

  async updateDocumentClientSignature(id: string, clientSignature: string): Promise<ProjectDocument | undefined> {
    const [doc] = await db
      .update(projectDocuments)
      .set({ clientSignature, status: "signed", updatedAt: new Date() })
      .where(eq(projectDocuments.id, id))
      .returning();
    return doc;
  }

  async updateQuoteDetails(id: string, details: { quoteTitle?: string; quoteDescription?: string; quoteLineItems?: string; quoteAmount?: string; quoteDepositPercent?: string; quoteValidityDays?: string; quoteNotes?: string }): Promise<ProjectDocument | undefined> {
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

  async createInvoiceFromQuote(quoteId: string): Promise<ProjectDocument | undefined> {
    // Get the original quote
    const quote = await this.getDocument(quoteId);
    if (!quote || quote.type !== "quote") {
      return undefined;
    }

    // Get project to use its title
    const project = await this.getProject(quote.projectId);
    const invoiceTitle = project ? `Facture - ${project.title}` : quote.quoteTitle;

    // Create invoice with same details as quote but as "invoice" type and "paid" status
    const [invoice] = await db
      .insert(projectDocuments)
      .values({
        projectId: quote.projectId,
        type: "invoice",
        status: "paid",
        quoteTitle: invoiceTitle,
        quoteDescription: quote.quoteDescription,
        quoteLineItems: quote.quoteLineItems,
        quoteAmount: quote.quoteAmount,
        quoteDepositPercent: quote.quoteDepositPercent,
        quoteValidityDays: quote.quoteValidityDays,
        quoteNotes: quote.quoteNotes,
        clientSignature: quote.clientSignature,
      })
      .returning();
    return invoice;
  }

  async createSubscriptionInvoice(projectId: string, subscriptionId: string, offerName: string, amount: string): Promise<ProjectDocument | undefined> {
    // Create subscription invoice document
    const [invoice] = await db
      .insert(projectDocuments)
      .values({
        projectId,
        type: "subscription_invoice",
        status: "paid",
        quoteTitle: `Facture - Abonnement '${offerName}'`,
        quoteDescription: `Abonnement mensuel ${offerName}`,
        quoteLineItems: JSON.stringify([{ description: `Abonnement ${offerName}`, amount }]),
        quoteAmount: amount,
        quoteDepositPercent: null,
        quoteNotes: `Abonnement ID: ${subscriptionId}`,
      })
      .returning();
    return invoice;
  }

  // Subscription operations
  async createSubscription(userId: string, projectId: string, offerType: string, monthlyPrice: string): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        projectId,
        offerType,
        monthlyPrice,
        status: "active",
      })
      .returning();
    return subscription;
  }

  async createSubscriptionWithStripe(userId: string, projectId: string, offerType: string, monthlyPrice: string, stripeSubscriptionId: string, currentPeriodEnd: Date | null): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        projectId,
        offerType,
        monthlyPrice,
        status: "active",
        stripeSubscriptionId,
        currentPeriodEnd,
      })
      .returning();
    return subscription;
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription;
  }

  async getSubscriptionsByUser(userId: string): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt));
  }

  async getSubscriptionsByProject(projectId: string): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.projectId, projectId)).orderBy(desc(subscriptions.createdAt));
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async updateSubscriptionStatus(id: string, status: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ status, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async updateSubscriptionStripeData(id: string, currentPeriodEnd: Date | null, cancelAtPeriodEnd: boolean): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ currentPeriodEnd, cancelAtPeriodEnd, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async deleteSubscription(id: string): Promise<boolean> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
    return true;
  }

  // Subscription Offers
  async getSubscriptionOffers(): Promise<SubscriptionOffer[]> {
    return db.select().from(subscriptionOffers);
  }

  async getSubscriptionOffer(id: string): Promise<SubscriptionOffer | undefined> {
    const [offer] = await db.select().from(subscriptionOffers).where(eq(subscriptionOffers.id, id));
    return offer;
  }

  async updateSubscriptionOffer(id: string, price: string, discountPercent?: string | null): Promise<SubscriptionOffer | undefined> {
    const updateData: any = { price, updatedAt: new Date() };
    if (discountPercent !== undefined) {
      updateData.discountPercent = discountPercent;
    }
    const [offer] = await db
      .update(subscriptionOffers)
      .set(updateData)
      .where(eq(subscriptionOffers.id, id))
      .returning();
    return offer;
  }

  async deleteSubscriptionOffer(id: string): Promise<boolean> {
    const result = await db.delete(subscriptionOffers).where(eq(subscriptionOffers.id, id)).returning();
    return result.length > 0;
  }

  // Security Logs
  async createSecurityLog(log: { type: string; userId?: string; email?: string; ipAddress?: string; userAgent?: string; details?: string }): Promise<void> {
    await db.insert(securityLogs).values(log);
  }

  async getSecurityLogs(limit: number = 100): Promise<SecurityLog[]> {
    return db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
