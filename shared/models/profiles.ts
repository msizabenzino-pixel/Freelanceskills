import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  userType: text("user_type").notNull().default("client"), // "client" | "freelancer" | "both"
  bio: text("bio"),
  title: text("title"),
  skills: text("skills").array(),
  hourlyRate: integer("hourly_rate"), // in ZAR cents
  location: text("location"),
  isPro: boolean("is_pro").notNull().default(false),
  rating: integer("rating").default(0), // 0-5 scale * 100
  completedJobs: integer("completed_jobs").notNull().default(0),
  responseRate: integer("response_rate"),
  // Publish state — tracks whether the freelancer's profile is visible to employers
  publishedProfile: boolean("published_profile").notNull().default(false),
  publishedAt: timestamp("published_at"),
  // Admin-managed fields
  status: text("status").notNull().default("active"), // "active" | "suspended" | "banned" | "pending"
  role: text("role").notNull().default("client"), // "client" | "freelancer" | "admin" | "moderator" | "upskiller"
  kycStatus: text("kyc_status").notNull().default("not_started"), // "not_started" | "pending" | "verified" | "rejected"
  phoneNumber: varchar("phone_number", { length: 30 }),
  country: varchar("country", { length: 100 }),
  walletBalance: integer("wallet_balance").notNull().default(0), // in ZAR cents
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  suspendedUntil: timestamp("suspended_until"),
  suspendedReason: text("suspended_reason"),
  banReason: text("ban_reason"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by", { length: 50 }),
  deleteReason: text("delete_reason"),
  portfolioProjectsJson: text("portfolio_projects_json"),
  // Extended profile fields
  photoUrl: text("photo_url"),
  certifications: text("certifications"),
  languages: text("languages").array(),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  availability: text("availability"),
  availableNow: boolean("available_now").notNull().default(false),
  tagline: text("tagline"),
  experienceLevel: text("experience_level"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  completedJobs: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
