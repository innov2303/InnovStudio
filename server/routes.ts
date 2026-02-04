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
      const validStatuses = ["pending", "in_review", "approved", "in_progress", "completed", "cancelled"];
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

  return httpServer;
}
