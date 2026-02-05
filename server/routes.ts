import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import crypto from "crypto";
import { storage } from "./storage";
import { loginSchema, registerSchema, changePasswordSchema, createProjectSchema, createFeatureSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé"));
    }
  },
});

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const PgSession = connectPgSimple(session);

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "webstudio-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  await storage.initializeAdmin();

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Données invalides" });
      }

      const { email, password } = result.data;
      
      // Try to find user by email first, then by username (for admin account)
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Fallback to username for admin account
        user = await storage.getUserByUsername(email);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      // Check if email is verified (skip for admin account)
      if (user.role !== "admin" && !user.emailVerified) {
        return res.status(403).json({ 
          message: "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception.",
          requiresVerification: true
        });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const existingUser = await storage.getUserByEmail(result.data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Generate username from email (part before @)
      const username = result.data.email.split('@')[0] + '_' + Date.now().toString(36);
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await storage.createUser({
        ...result.data,
        username,
        verificationToken,
        billingAddress: result.data.sameAsBilling ? result.data.address : (result.data.billingAddress || result.data.address),
      });

      // Send verification email
      const emailSent = await sendVerificationEmail(result.data.email, result.data.firstName, verificationToken);
      
      if (!emailSent) {
        console.error("Failed to send verification email to:", result.data.email);
      }

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        user: userWithoutPassword,
        message: "Un email de vérification a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.",
        requiresVerification: true
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Email verification endpoint
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Token de vérification invalide" });
      }

      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Token de vérification invalide ou expiré" });
      }

      await storage.verifyUserEmail(user.id);

      res.json({ message: "Email vérifié avec succès", verified: true });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Resend verification email endpoint
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email requis" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "Si cet email existe, un nouveau lien de vérification a été envoyé" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Cet email est déjà vérifié" });
      }

      // Generate new token
      const verificationToken = crypto.randomUUID();
      await storage.updateUserVerificationToken(user.id, verificationToken);

      // Send new verification email (sendVerificationEmail builds the URL internally)
      await sendVerificationEmail(email, user.firstName, verificationToken);

      res.json({ message: "Un nouveau lien de vérification a été envoyé à votre adresse email" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const result = forgotPasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Email invalide" });
      }

      const { email } = result.data;
      const user = await storage.getUserByEmail(email);

      // Don't reveal if email exists for security
      if (!user) {
        return res.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé" });
      }

      // Generate reset token and set expiry (1 hour)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.setPasswordResetToken(user.id, resetToken, expires);

      // Send reset email
      const emailSent = await sendPasswordResetEmail(email, user.firstName, resetToken);

      if (!emailSent) {
        console.error("Failed to send password reset email to:", email);
      }

      res.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const result = resetPasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { token, newPassword } = result.data;
      const user = await storage.getUserByPasswordResetToken(token);

      if (!user) {
        return res.status(400).json({ message: "Lien de réinitialisation invalide ou expiré" });
      }

      // Check if token has expired
      if (!user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
        await storage.clearPasswordResetToken(user.id);
        return res.status(400).json({ message: "Le lien de réinitialisation a expiré" });
      }

      // Update password and clear reset token
      await storage.updateUserPassword(user.id, newPassword);
      await storage.clearPasswordResetToken(user.id);

      res.json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Déconnexion réussie" });
    });
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const result = changePasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      const passwordMatch = await bcrypt.compare(result.data.currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Mot de passe actuel incorrect" });
      }

      await storage.updateUserPassword(user.id, result.data.newPassword);

      const updatedUser = await storage.getUser(user.id);
      const { password: _, ...userWithoutPassword } = updatedUser!;
      
      res.json({ message: "Mot de passe modifié avec succès", user: userWithoutPassword });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/auth/save-signature", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Seul l'admin peut enregistrer une signature" });
      }

      const { signature } = req.body;
      if (!signature || typeof signature !== 'string') {
        return res.status(400).json({ message: "Signature invalide" });
      }

      if (!signature.startsWith('data:image/png;base64,')) {
        return res.status(400).json({ message: "Format de signature invalide" });
      }

      await storage.updateUserSignature(currentUser.id, signature);

      res.json({ message: "Signature enregistrée avec succès" });
    } catch (error) {
      console.error("Save signature error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password: _, ...user }) => user);
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Projects routes
  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const result = createProjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const project = await storage.createProject(req.session.userId!, result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Admin sees all projects, users see only their own
      const projectsList = currentUser.role === "admin" 
        ? await storage.getAllProjects()
        : await storage.getProjectsByUser(req.session.userId!);
      
      res.json(projectsList);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id as string);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Check access rights
      if (currentUser.role !== "admin" && project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      res.json(project);
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/projects/:id/status", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const { status } = req.body;
      const validStatuses = ["pending", "in_review", "awaiting_signature", "awaiting_deposit", "approved", "in_progress", "in_progress_1", "in_progress_2", "awaiting_final_payment", "completed", "cancelled"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }

      const project = await storage.updateProjectStatus(req.params.id as string, status);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      res.json(project);
    } catch (error) {
      console.error("Update project status error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Delete project (owner only, only if no signed documents)
  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const projectId = req.params.id as string;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      // Only project owner can delete their project
      if (project.userId !== currentUser.id) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Check if any document is signed
      const docs = await storage.getDocumentsByProject(projectId);
      const hasSignedDocument = docs.some(doc => doc.status === "signed");
      if (hasSignedDocument) {
        return res.status(400).json({ message: "Impossible de supprimer un projet avec un devis signé" });
      }

      await storage.deleteProject(projectId);
      res.json({ message: "Projet supprimé" });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Feature routes
  app.post("/api/projects/:projectId/features", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.projectId as string;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Only project owner can add features
      if (project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Cannot add features to completed projects
      if (project.status === "completed") {
        return res.status(400).json({ message: "Impossible d'ajouter des fonctionnalités à un projet terminé" });
      }

      const result = createFeatureSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const feature = await storage.createFeature(projectId, result.data);
      res.status(201).json(feature);
    } catch (error) {
      console.error("Create feature error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/projects/:projectId/features", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.projectId as string;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Check access rights
      if (currentUser.role !== "admin" && project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const features = await storage.getFeaturesByProject(projectId);
      res.json(features);
    } catch (error) {
      console.error("Get features error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.patch("/api/features/:id/status", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const { status, adminNotes } = req.body;
      const validStatuses = ["pending", "in_progress", "completed", "blocked"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }

      const featureId = req.params.id as string;
      const feature = await storage.updateFeatureStatus(featureId, status, adminNotes);
      if (!feature) {
        return res.status(404).json({ message: "Fonctionnalité non trouvée" });
      }

      res.json(feature);
    } catch (error) {
      console.error("Update feature status error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Update feature (only if pending and user is project owner)
  app.patch("/api/features/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const featureId = req.params.id as string;
      const feature = await storage.getFeature(featureId);
      if (!feature) {
        return res.status(404).json({ message: "Fonctionnalité non trouvée" });
      }

      // Check if feature is still pending
      if (feature.status !== "pending") {
        return res.status(400).json({ message: "Cette fonctionnalité est déjà en cours de traitement" });
      }

      // Check if user owns the project
      const project = await storage.getProject(feature.projectId);
      if (!project || project.userId !== currentUser.id) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const { name, description } = req.body;
      const updatedFeature = await storage.updateFeature(featureId, { name, description });
      res.json(updatedFeature);
    } catch (error) {
      console.error("Update feature error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Delete feature (only if pending and user is project owner)
  app.delete("/api/features/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const featureId = req.params.id as string;
      const feature = await storage.getFeature(featureId);
      if (!feature) {
        return res.status(404).json({ message: "Fonctionnalité non trouvée" });
      }

      // Check if feature is still pending
      if (feature.status !== "pending") {
        return res.status(400).json({ message: "Cette fonctionnalité est déjà en cours de traitement" });
      }

      // Check if user owns the project
      const project = await storage.getProject(feature.projectId);
      if (!project || project.userId !== currentUser.id) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      await storage.deleteFeature(featureId);
      res.json({ message: "Fonctionnalité supprimée" });
    } catch (error) {
      console.error("Delete feature error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Document routes
  
  // Get documents for a project
  app.get("/api/projects/:projectId/documents", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.projectId as string;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Check access rights
      if (currentUser.role !== "admin" && project.userId !== req.session.userId) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const documents = await storage.getDocumentsByProject(projectId);
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Create a document (triggered when project status changes to in_review)
  app.post("/api/projects/:projectId/documents", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const projectId = req.params.projectId as string;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      const { type = "quote", quoteDescription } = req.body;
      const document = await storage.createDocument(projectId, type, quoteDescription);
      res.status(201).json(document);
    } catch (error) {
      console.error("Create document error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Update quote details (admin only, only when draft)
  app.patch("/api/documents/:id/quote", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      if (document.status !== "draft") {
        return res.status(400).json({ message: "Le devis ne peut plus être modifié une fois envoyé" });
      }

      const { quoteTitle, quoteDescription, quoteLineItems, quoteAmount, quoteDepositPercent, quoteValidityDays, quoteNotes } = req.body;
      const updatedDoc = await storage.updateQuoteDetails(documentId, {
        quoteTitle,
        quoteDescription,
        quoteLineItems,
        quoteAmount,
        quoteDepositPercent,
        quoteValidityDays,
        quoteNotes,
      });

      res.json(updatedDoc);
    } catch (error) {
      console.error("Update quote details error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Admin sends the quote (changes document and project status)
  app.post("/api/documents/:id/send", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Check if admin has a signature saved
      const adminUser = await storage.getUserByUsername("admin");
      if (!adminUser?.signature || !adminUser.signature.startsWith("data:image/png;base64,")) {
        return res.status(400).json({ 
          message: "Veuillez d'abord enregistrer votre signature électronique dans les paramètres avant d'envoyer un devis",
          requiresSignature: true
        });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      if (!document.quoteTitle || !document.quoteAmount) {
        return res.status(400).json({ message: "Le devis doit avoir un titre et un montant" });
      }

      // Update document status to awaiting_signature
      await storage.updateDocumentStatus(documentId, "awaiting_signature");
      
      // Update project status to awaiting_signature
      await storage.updateProjectStatus(document.projectId, "awaiting_signature");
      
      const finalDoc = await storage.getDocument(documentId);
      res.json(finalDoc);
    } catch (error) {
      console.error("Send quote error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Client uploads signed document
  app.post("/api/documents/:id/upload-signed", requireAuth, upload.single("file"), async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      // Check if user owns the project
      const project = await storage.getProject(document.projectId);
      if (!project || (project.userId !== currentUser.id && currentUser.role !== "admin")) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Can only upload signed doc if status is awaiting_signature
      if (document.status !== "awaiting_signature") {
        return res.status(400).json({ message: "Ce document n'est pas en attente de signature" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Fichier requis" });
      }

      // Update document with signed file and change status
      const updatedDoc = await storage.updateDocumentSignedFile(documentId, req.file.filename);
      
      // Update project status to awaiting_deposit
      await storage.updateProjectStatus(document.projectId, "awaiting_deposit");
      
      res.json(updatedDoc);
    } catch (error) {
      console.error("Upload signed document error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Client electronic signature
  app.post("/api/documents/:id/sign-electronic", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      // Check if user owns the project
      const project = await storage.getProject(document.projectId);
      if (!project || project.userId !== currentUser.id) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Can only sign if status is awaiting_signature
      if (document.status !== "awaiting_signature") {
        return res.status(400).json({ message: "Ce document n'est pas en attente de signature" });
      }

      const { signature } = req.body;
      if (!signature || typeof signature !== 'string') {
        return res.status(400).json({ message: "Signature invalide" });
      }

      if (!signature.startsWith('data:image/png;base64,')) {
        return res.status(400).json({ message: "Format de signature invalide" });
      }

      // Update document with client signature and change status to signed
      const updatedDoc = await storage.updateDocumentClientSignature(documentId, signature);
      
      // Update project status to awaiting_deposit
      await storage.updateProjectStatus(document.projectId, "awaiting_deposit");
      
      res.json(updatedDoc);
    } catch (error) {
      console.error("Electronic signature error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Download document file
  app.get("/api/documents/:id/download", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      // Check access rights
      const project = await storage.getProject(document.projectId);
      if (!project || (project.userId !== currentUser.id && currentUser.role !== "admin")) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const fileType = req.query.type as string;
      const fileName = fileType === "signed" ? document.signedFileName : document.fileName;
      
      if (!fileName) {
        return res.status(404).json({ message: "Fichier non trouvé" });
      }

      const filePath = path.join(uploadDir, fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Fichier non trouvé" });
      }

      res.download(filePath, fileName);
    } catch (error) {
      console.error("Download document error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Generate PDF quote
  app.get("/api/documents/:id/generate-pdf", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      const project = await storage.getProject(document.projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      // Allow admin OR project owner (when document is sent)
      const isAdmin = currentUser.role === "admin";
      const isOwner = project.userId === currentUser.id;
      const documentSent = document.status !== "draft";
      
      if (!isAdmin && !(isOwner && documentSent)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      if (!document.quoteTitle || !document.quoteAmount) {
        return res.status(400).json({ message: "Veuillez remplir le titre et le montant du devis" });
      }

      const projectOwner = await storage.getUser(project.userId);
      
      // Fetch admin user for company info and signature (always use the admin account)
      const adminUser = await storage.getUserByUsername("admin");
      const admin = adminUser || currentUser;

      // Create PDF
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=Devis_${document.quoteTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      
      doc.pipe(res);

      // Header with company info
      doc.fontSize(24).fillColor("#6366f1").text("INNOV STUDIO", 50, 50);
      doc.fontSize(10).fillColor("#666666").text("Studio de Production Web", 50, 80);
      
      // Company address
      doc.fontSize(9).fillColor("#333333");
      doc.text(admin.company || "Innov Studio", 50, 100);
      if (admin.address) {
        const addressLines = admin.address.split("\n");
        let yPos = 112;
        addressLines.forEach(line => {
          doc.text(line.trim(), 50, yPos);
          yPos += 12;
        });
      }
      if (admin.email) {
        doc.text(admin.email, 50, doc.y + 5);
      }

      // DEVIS title
      doc.fontSize(28).fillColor("#1a1a1a").text("DEVIS", 400, 50, { align: "right" });
      
      // Quote number and date
      doc.fontSize(10).fillColor("#666666");
      doc.text(`N° ${documentId.substring(0, 8).toUpperCase()}`, 350, 85, { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 350, 100, { align: "right" });
      doc.text(`Validité: ${document.quoteValidityDays || "30"} jours`, 350, 115, { align: "right" });

      // Separator line
      doc.moveTo(50, 160).lineTo(545, 160).strokeColor("#e5e7eb").stroke();

      // Client section
      doc.fontSize(11).fillColor("#6366f1").text("DESTINATAIRE", 350, 180);
      doc.fontSize(10).fillColor("#333333");
      
      if (projectOwner) {
        doc.text(projectOwner.company || `${projectOwner.firstName} ${projectOwner.lastName}`, 350, 195);
        doc.text(`${projectOwner.firstName} ${projectOwner.lastName}`, 350, 210);
        if (projectOwner.billingAddress || projectOwner.address) {
          const clientAddress = (projectOwner.billingAddress || projectOwner.address || "").split("\n");
          let yPos = 225;
          clientAddress.forEach(line => {
            doc.text(line.trim(), 350, yPos);
            yPos += 12;
          });
        }
      }

      // Project info
      doc.fontSize(11).fillColor("#6366f1").text("PROJET", 50, 180);
      doc.fontSize(10).fillColor("#333333").text(project.title, 50, 195);

      // Quote title
      doc.fontSize(14).fillColor("#1a1a1a").text(document.quoteTitle, 50, 280);

      // Separator
      doc.moveTo(50, 305).lineTo(545, 305).strokeColor("#e5e7eb").stroke();

      // Prestations table
      let currentY = 320;
      
      // Parse line items
      let lineItems: Array<{ description: string; amount: string }> = [];
      if (document.quoteLineItems) {
        try {
          lineItems = JSON.parse(document.quoteLineItems);
        } catch (e) {
          console.error("Error parsing line items:", e);
        }
      }
      
      if (lineItems.length > 0) {
        doc.fontSize(11).fillColor("#6366f1").text("PRESTATIONS", 50, currentY);
        currentY += 20;
        
        // Table header
        doc.rect(50, currentY, 425, 25).fillColor("#f1f5f9").fill();
        doc.rect(475, currentY, 70, 25).fillColor("#f1f5f9").fill();
        doc.fontSize(9).fillColor("#64748b").text("Description", 60, currentY + 8);
        doc.text("Montant", 480, currentY + 8);
        currentY += 25;
        
        // Table rows
        lineItems.forEach((item, index) => {
          const isEven = index % 2 === 0;
          if (isEven) {
            doc.rect(50, currentY, 495, 22).fillColor("#fafafa").fill();
          }
          doc.fontSize(10).fillColor("#333333").text(item.description, 60, currentY + 6, { width: 400 });
          doc.text(`${item.amount} €`, 480, currentY + 6);
          currentY += 22;
        });
        
        // Total line
        doc.rect(50, currentY, 495, 28).fillColor("#e2e8f0").fill();
        doc.fontSize(11).fillColor("#1a1a1a").text("Total HT", 60, currentY + 8);
        doc.fontSize(12).fillColor("#6366f1").text(`${document.quoteAmount} €`, 475, currentY + 7);
        currentY += 28;
        
        // Deposit line if specified
        if (document.quoteDepositPercent) {
          const depositAmount = (parseFloat(document.quoteAmount) * parseFloat(document.quoteDepositPercent) / 100).toFixed(2);
          doc.rect(50, currentY, 495, 24).fillColor("#fef3c7").fill();
          doc.fontSize(10).fillColor("#92400e").text(`Acompte à la commande (${document.quoteDepositPercent}%)`, 60, currentY + 6);
          doc.fontSize(11).fillColor("#92400e").text(`${depositAmount} €`, 475, currentY + 5);
          currentY += 24;
        }
        currentY += 15;
      }

      // Features section
      if (document.quoteDescription) {
        doc.fontSize(11).fillColor("#6366f1").text("FONCTIONNALITÉS DU SITE", 50, currentY);
        doc.fontSize(10).fillColor("#333333").text(document.quoteDescription, 50, currentY + 15, { width: 495 });
        currentY = doc.y + 30;
      }

      // Signature section - positioned after content with enough space
      const signatureY = Math.max(currentY + 20, 580);
      
      // Check if we need a new page
      if (signatureY > 650) {
        doc.addPage();
        const newPageY = 50;
        
        // Signature title
        doc.fontSize(11).fillColor("#6366f1").text("SIGNATURE", 50, newPageY);
        
        // Instructions
        doc.fontSize(9).fillColor("#666666");
        doc.text("Ce devis est valable pour la durée indiquée à compter de sa date d'émission.", 50, newPageY + 20);
        doc.text("Merci de retourner ce document signé avec la mention \"Bon pour accord\".", 50, newPageY + 35);
        
        // Signature boxes
        doc.rect(50, newPageY + 60, 220, 80).strokeColor("#d1d5db").lineWidth(1).stroke();
        doc.rect(295, newPageY + 60, 220, 80).strokeColor("#d1d5db").lineWidth(1).stroke();
        
        // Labels inside boxes
        doc.fontSize(8).fillColor("#9ca3af");
        doc.text("Pour Innov Studio", 55, newPageY + 65);
        doc.text("Date et signature :", 55, newPageY + 120);
        doc.text("Le Client", 300, newPageY + 65);
        doc.text("Date, signature et mention \"Bon pour accord\" :", 300, newPageY + 120);
        
        // Add admin signature if available
        if (admin.signature && admin.signature.startsWith("data:image/png;base64,")) {
          try {
            const signatureBase64 = admin.signature.replace("data:image/png;base64,", "");
            const signatureBuffer = Buffer.from(signatureBase64, "base64");
            doc.image(signatureBuffer, 70, newPageY + 75, { width: 160, height: 40 });
          } catch (sigError) {
            console.error("Error embedding admin signature:", sigError);
          }
        }
        
        // Add client signature if available
        if (document.clientSignature && document.clientSignature.startsWith("data:image/png;base64,")) {
          try {
            const clientSigBase64 = document.clientSignature.replace("data:image/png;base64,", "");
            const clientSigBuffer = Buffer.from(clientSigBase64, "base64");
            doc.image(clientSigBuffer, 315, newPageY + 75, { width: 160, height: 40 });
          } catch (sigError) {
            console.error("Error embedding client signature:", sigError);
          }
        }
      } else {
        // Signature section on same page
        doc.fontSize(11).fillColor("#6366f1").text("SIGNATURE", 50, signatureY);
        
        // Instructions
        doc.fontSize(9).fillColor("#666666");
        doc.text("Ce devis est valable pour la durée indiquée à compter de sa date d'émission.", 50, signatureY + 20);
        doc.text("Merci de retourner ce document signé avec la mention \"Bon pour accord\".", 50, signatureY + 35);
        
        // Signature boxes
        doc.rect(50, signatureY + 55, 220, 80).strokeColor("#d1d5db").lineWidth(1).stroke();
        doc.rect(295, signatureY + 55, 220, 80).strokeColor("#d1d5db").lineWidth(1).stroke();
        
        // Labels inside boxes
        doc.fontSize(8).fillColor("#9ca3af");
        doc.text("Pour Innov Studio", 55, signatureY + 60);
        doc.text("Date et signature :", 55, signatureY + 115);
        doc.text("Le Client", 300, signatureY + 60);
        doc.text("Date, signature et mention \"Bon pour accord\" :", 300, signatureY + 115);
        
        // Add admin signature if available
        if (admin.signature && admin.signature.startsWith("data:image/png;base64,")) {
          try {
            const signatureBase64 = admin.signature.replace("data:image/png;base64,", "");
            const signatureBuffer = Buffer.from(signatureBase64, "base64");
            doc.image(signatureBuffer, 70, signatureY + 70, { width: 160, height: 40 });
          } catch (sigError) {
            console.error("Error embedding admin signature:", sigError);
          }
        }
        
        // Add client signature if available
        if (document.clientSignature && document.clientSignature.startsWith("data:image/png;base64,")) {
          try {
            const clientSigBase64 = document.clientSignature.replace("data:image/png;base64,", "");
            const clientSigBuffer = Buffer.from(clientSigBase64, "base64");
            doc.image(clientSigBuffer, 315, signatureY + 70, { width: 160, height: 40 });
          } catch (sigError) {
            console.error("Error embedding client signature:", sigError);
          }
        }
      }

      doc.end();
    } catch (error) {
      console.error("Generate PDF error:", error);
      res.status(500).json({ message: "Erreur lors de la génération du PDF" });
    }
  });

  // Generate invoice PDF (for invoices)
  app.get("/api/documents/:id/generate-invoice-pdf", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      if (document.type !== "invoice") {
        return res.status(400).json({ message: "Ce document n'est pas une facture" });
      }

      const project = await storage.getProject(document.projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      // Allow admin OR project owner
      const isAdmin = currentUser.role === "admin";
      const isOwner = project.userId === currentUser.id;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      if (!document.quoteTitle || !document.quoteAmount) {
        return res.status(400).json({ message: "Données de facture incomplètes" });
      }

      // Fetch project owner for client info
      const projectOwner = await storage.getUser(project.userId);
      
      // Fetch admin user for company info and signature
      const adminUser = await storage.getUserByUsername("admin");
      const admin = adminUser || currentUser;

      // Create PDF
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=Facture_${document.quoteTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      
      doc.pipe(res);

      // Header with company info
      doc.fontSize(24).fillColor("#6366f1").text("INNOV STUDIO", 50, 50);
      doc.fontSize(10).fillColor("#666666").text("Studio de Production Web", 50, 80);
      
      // Company address
      doc.fontSize(9).fillColor("#333333");
      doc.text(admin.company || "Innov Studio", 50, 100);
      if (admin.address) {
        const addressLines = admin.address.split("\n");
        let yPos = 112;
        addressLines.forEach(line => {
          doc.text(line.trim(), 50, yPos);
          yPos += 12;
        });
      }
      if (admin.email) {
        doc.text(admin.email, 50, doc.y + 5);
      }

      // FACTURE title with PAYÉ badge
      doc.fontSize(28).fillColor("#1a1a1a").text("FACTURE", 400, 50, { align: "right" });
      
      // PAYÉ badge
      doc.rect(435, 85, 70, 22).fillColor("#22c55e").fill();
      doc.fontSize(11).fillColor("#ffffff").text("PAYÉE", 440, 90, { align: "center", width: 60 });
      
      // Invoice number and date
      doc.fontSize(10).fillColor("#666666");
      doc.text(`N° FAC-${documentId.substring(0, 8).toUpperCase()}`, 350, 115, { align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 350, 130, { align: "right" });

      // Separator line
      doc.moveTo(50, 170).lineTo(545, 170).strokeColor("#e5e7eb").stroke();

      // Client section
      doc.fontSize(11).fillColor("#6366f1").text("FACTURÉ À", 350, 190);
      doc.fontSize(10).fillColor("#333333");
      
      if (projectOwner) {
        doc.text(projectOwner.company || `${projectOwner.firstName} ${projectOwner.lastName}`, 350, 205);
        doc.text(`${projectOwner.firstName} ${projectOwner.lastName}`, 350, 220);
        if (projectOwner.billingAddress || projectOwner.address) {
          const clientAddress = (projectOwner.billingAddress || projectOwner.address || "").split("\n");
          let yPos = 235;
          clientAddress.forEach(line => {
            doc.text(line.trim(), 350, yPos);
            yPos += 12;
          });
        }
      }

      // Project info
      doc.fontSize(11).fillColor("#6366f1").text("PROJET", 50, 190);
      doc.fontSize(10).fillColor("#333333").text(project.title, 50, 205);

      // Invoice title
      doc.fontSize(14).fillColor("#1a1a1a").text(document.quoteTitle, 50, 290);

      // Separator
      doc.moveTo(50, 315).lineTo(545, 315).strokeColor("#e5e7eb").stroke();

      // Prestations table
      let currentY = 330;
      
      // Parse line items
      let lineItems: Array<{ description: string; amount: string }> = [];
      if (document.quoteLineItems) {
        try {
          lineItems = JSON.parse(document.quoteLineItems);
        } catch (e) {
          console.error("Error parsing line items:", e);
        }
      }
      
      if (lineItems.length > 0) {
        doc.fontSize(11).fillColor("#6366f1").text("PRESTATIONS", 50, currentY);
        currentY += 20;
        
        // Table header
        doc.rect(50, currentY, 425, 25).fillColor("#f1f5f9").fill();
        doc.rect(475, currentY, 70, 25).fillColor("#f1f5f9").fill();
        doc.fontSize(9).fillColor("#64748b").text("Description", 60, currentY + 8);
        doc.text("Montant", 480, currentY + 8);
        currentY += 25;
        
        // Table rows
        lineItems.forEach((item, index) => {
          const isEven = index % 2 === 0;
          if (isEven) {
            doc.rect(50, currentY, 495, 22).fillColor("#fafafa").fill();
          }
          doc.fontSize(10).fillColor("#333333").text(item.description, 60, currentY + 6, { width: 400 });
          doc.text(`${item.amount} €`, 480, currentY + 6);
          currentY += 22;
        });
        
        // Total line
        doc.rect(50, currentY, 495, 28).fillColor("#e2e8f0").fill();
        doc.fontSize(11).fillColor("#1a1a1a").text("Total HT", 60, currentY + 8);
        doc.fontSize(12).fillColor("#6366f1").text(`${document.quoteAmount} €`, 475, currentY + 7);
        currentY += 28;
        
        // Deposit paid line if specified
        if (document.quoteDepositPercent) {
          const depositAmount = (parseFloat(document.quoteAmount) * parseFloat(document.quoteDepositPercent) / 100).toFixed(2);
          doc.rect(50, currentY, 495, 24).fillColor("#dcfce7").fill();
          doc.fontSize(10).fillColor("#166534").text(`Acompte versé (${document.quoteDepositPercent}%)`, 60, currentY + 6);
          doc.fontSize(11).fillColor("#166534").text(`- ${depositAmount} €`, 475, currentY + 5);
          currentY += 24;
          
          // Final payment
          const finalAmount = (parseFloat(document.quoteAmount) - parseFloat(depositAmount)).toFixed(2);
          doc.rect(50, currentY, 495, 24).fillColor("#dcfce7").fill();
          doc.fontSize(10).fillColor("#166534").text("Solde réglé", 60, currentY + 6);
          doc.fontSize(11).fillColor("#166534").text(`- ${finalAmount} €`, 475, currentY + 5);
          currentY += 24;
        }
        
        // PAID total
        doc.rect(50, currentY, 495, 28).fillColor("#22c55e").fill();
        doc.fontSize(11).fillColor("#ffffff").text("SOLDE DÛ", 60, currentY + 8);
        doc.fontSize(12).fillColor("#ffffff").text("0,00 €", 475, currentY + 7);
        currentY += 28;
        
        currentY += 15;
      }

      // Features section
      if (document.quoteDescription) {
        doc.fontSize(11).fillColor("#6366f1").text("DÉTAILS DU PROJET", 50, currentY);
        doc.fontSize(10).fillColor("#333333").text(document.quoteDescription, 50, currentY + 15, { width: 495 });
        currentY = doc.y + 30;
      }

      // Thank you message
      const thankYouY = Math.max(currentY + 20, 650);
      doc.fontSize(11).fillColor("#6366f1").text("Merci pour votre confiance !", 50, thankYouY, { align: "center", width: 495 });

      doc.end();
    } catch (error) {
      console.error("Generate invoice PDF error:", error);
      res.status(500).json({ message: "Erreur lors de la génération du PDF de facture" });
    }
  });

  // Delete document (admin or project owner, only when draft/not yet sent for signature)
  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const documentId = req.params.id as string;
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      // Get the project to check ownership
      const project = await storage.getProject(document.projectId);
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      // Allow admin or project owner to delete
      const isAdmin = currentUser.role === "admin";
      const isOwner = project.userId === currentUser.id;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Can only delete if document is not yet signed
      if (document.status === "signed") {
        return res.status(400).json({ message: "Le devis ne peut plus être supprimé une fois signé" });
      }

      await storage.deleteDocument(documentId);
      res.json({ message: "Document supprimé" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Update document status (admin only)
  app.patch("/api/documents/:id/status", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const { status } = req.body;
      const validStatuses = ["draft", "awaiting_signature", "signed"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }

      const documentId = req.params.id as string;
      const document = await storage.updateDocumentStatus(documentId, status);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      res.json(document);
    } catch (error) {
      console.error("Update document status error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", requireAuth, (req, res, next) => {
    // Verify user can access the file
    next();
  }, (req, res) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "Fichier non trouvé" });
    }
  });

  // Stripe payment routes
  
  // Get Stripe publishable key
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Get Stripe config error:", error);
      res.status(500).json({ message: "Erreur de configuration Stripe" });
    }
  });

  // Create checkout session for deposit payment
  app.post("/api/projects/:projectId/pay-deposit", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.projectId as string;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Only project owner can pay deposit
      if (project.userId !== currentUser.id) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Check project is in awaiting_deposit status
      if (project.status !== "awaiting_deposit") {
        return res.status(400).json({ message: "Ce projet n'est pas en attente de paiement d'acompte" });
      }

      // Get signed quote document to find deposit amount
      const documents = await storage.getDocumentsByProject(projectId);
      const signedQuote = documents.find(d => d.type === "quote" && d.status === "signed");
      
      if (!signedQuote) {
        return res.status(400).json({ message: "Aucun devis signé trouvé" });
      }

      // Calculate deposit amount
      const quoteAmount = parseFloat(signedQuote.quoteAmount || "0");
      const depositPercent = parseFloat(signedQuote.quoteDepositPercent || "30");
      const depositAmount = Math.round((quoteAmount * depositPercent / 100) * 100); // Convert to cents

      if (depositAmount <= 0) {
        return res.status(400).json({ message: "Montant d'acompte invalide" });
      }

      const stripe = await getUncachableStripeClient();

      // Get domain from request
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['host'];
      const baseUrl = `${protocol}://${host}`;

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Acompte - ${project.title}`,
              description: `Acompte de ${depositPercent}% pour le projet "${project.title}"`,
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard?payment=success&project=${projectId}`,
        cancel_url: `${baseUrl}/dashboard?payment=cancelled&project=${projectId}`,
        metadata: {
          projectId: projectId,
          documentId: signedQuote.id,
          userId: currentUser.id,
          type: 'deposit',
        },
        customer_email: currentUser.email || undefined,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Create deposit checkout error:", error);
      res.status(500).json({ message: "Erreur lors de la création de la session de paiement" });
    }
  });

  // Create checkout session for final payment (remaining balance)
  app.post("/api/projects/:projectId/pay-final", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.projectId as string;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Only project owner can pay final
      if (project.userId !== currentUser.id) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Check project is in awaiting_final_payment status
      if (project.status !== "awaiting_final_payment") {
        return res.status(400).json({ message: "Ce projet n'est pas en attente du règlement final" });
      }

      // Get signed quote document to find remaining amount
      const documents = await storage.getDocumentsByProject(projectId);
      const signedQuote = documents.find(d => d.type === "quote" && d.status === "signed");
      
      if (!signedQuote) {
        return res.status(400).json({ message: "Aucun devis signé trouvé" });
      }

      // Calculate remaining amount (total - deposit)
      const quoteAmount = parseFloat(signedQuote.quoteAmount || "0");
      const depositPercent = parseFloat(signedQuote.quoteDepositPercent || "30");
      const remainingPercent = 100 - depositPercent;
      const remainingAmount = Math.round((quoteAmount * remainingPercent / 100) * 100); // Convert to cents

      if (remainingAmount <= 0) {
        return res.status(400).json({ message: "Montant du solde invalide" });
      }

      const stripe = await getUncachableStripeClient();

      // Get domain from request
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['host'];
      const baseUrl = `${protocol}://${host}`;

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Solde - ${project.title}`,
              description: `Règlement final (${remainingPercent}%) pour le projet "${project.title}"`,
            },
            unit_amount: remainingAmount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard?payment=final_success&project=${projectId}`,
        cancel_url: `${baseUrl}/dashboard?payment=cancelled&project=${projectId}`,
        metadata: {
          projectId: projectId,
          documentId: signedQuote.id,
          userId: currentUser.id,
          type: 'final',
        },
        customer_email: currentUser.email || undefined,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Create final checkout error:", error);
      res.status(500).json({ message: "Erreur lors de la création de la session de paiement" });
    }
  });

  // Handle successful payment (called from webhook or verified manually)
  app.post("/api/projects/:projectId/confirm-payment", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const projectId = req.params.projectId as string;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }

      if (project.status !== "awaiting_deposit") {
        return res.status(400).json({ message: "Ce projet n'est pas en attente de paiement" });
      }

      // Update project status to approved
      const updatedProject = await storage.updateProjectStatus(projectId, "approved");
      res.json(updatedProject);
    } catch (error) {
      console.error("Confirm payment error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  return httpServer;
}
