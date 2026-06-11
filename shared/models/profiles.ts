import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, boolean, json, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { userTypeEnum, profileStatusEnum, profileRoleEnum, kycStatusEnum } from "./enums";

export type ProCredential = {
  title: string;
  issuer?: string;
  year?: string;
  url?: string;
};

export const profiles = pgTable(
  "profiles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
    userType: userTypeEnum("user_type").notNull().default("client"),
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
    status: profileStatusEnum("status").notNull().default("active"),
    role: profileRoleEnum("role").notNull().default("client"),
    kycStatus: kycStatusEnum("kyc_status").notNull().default("not_started"),
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
    workHistoryJson: text("work_history_json"),
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
    // 3-Tier Trust Badge System
    identityVerified: boolean("identity_verified").notNull().default(false),
    skillsVerified: boolean("skills_verified").notNull().default(false),
    topPerformer: boolean("top_performer").notNull().default(false),
    identityVerifiedAt: timestamp("identity_verified_at"),
    skillsVerifiedAt: timestamp("skills_verified_at"),
    topPerformerAt: timestamp("top_performer_at"),
    onTimeDeliveryRate: integer("on_time_delivery_rate"), // 0-100
    // Verification tier model (0=none, 1=identity, 2=identity+skills, 3=pro)
    verificationTier: integer("verification_tier").notNull().default(0),
    skillsVerifiedCategory: text("skills_verified_category"),
    isProVerified: boolean("is_pro_verified").notNull().default(false),
    proVerifiedAt: timestamp("pro_verified_at"),
    proCredentials: json("pro_credentials").$type<ProCredential[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_profiles_status").on(table.status),
    index("idx_profiles_role").on(table.role),
    index("idx_profiles_user_type").on(table.userType),
  ]
);

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  completedJobs: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
