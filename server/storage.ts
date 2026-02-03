import { type User, type InsertUser, users, type Project, type InsertProject, projects } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role?: string; mustChangePassword?: boolean }): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  initializeAdmin(): Promise<void>;
  // Projects
  createProject(userId: string, project: InsertProject): Promise<Project>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
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

  async createUser(insertUser: InsertUser & { role?: string; mustChangePassword?: boolean }): Promise<User> {
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

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async initializeAdmin(): Promise<void> {
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      await this.createUser({
        username: "admin",
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
}

export const storage = new DatabaseStorage();
