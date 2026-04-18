/**
 * Client Profiles schema — extends the base users/profiles tables
 *
 * HOW WE BEAT THE COMPETITION:
 * ✦ FSN-competitor-A: No client analytics → we track spend trends, LTV, dispute rate, Academy hire correlation
 * ✦ FSN-competitor-B: Payment verification is manual → our AI Fraud Score auto-flags risky clients in real-time
 * ✦ FSN-competitor-C: Premium clients only → we handle all client tiers with dynamic Bronze→Gold levelling
 * ✦ FSN-competitor-D: Static profiles → predictive churn forecast + LTV projection
 * ✦ Guru: No Academy integration → Hire Quality Score shows Academy freelancer ROI to clients
 */
import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const clientProfiles = pgTable("client_profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),

  // Company / Business
  companyName: text("company_name"),
  businessType: text("business_type"),    // "startup" | "smb" | "enterprise" | "individual"
  companySize: text("company_size"),       // "1-10" | "11-50" | "51-200" | "200+"
  industry: text("industry"),

  // Spending
  totalSpentCents: integer("total_spent_cents").notNull().default(0),
  monthlyAvgSpentCents: integer("monthly_avg_spent_cents").notNull().default(0),
  lastSpendAt: timestamp("last_spend_at"),

  // Jobs
  totalJobsPosted: integer("total_jobs_posted").notNull().default(0),
  activeJobCount: integer("active_job_count").notNull().default(0),
  avgJobValueCents: integer("avg_job_value_cents").notNull().default(0),

  // Quality & Risk
  disputeCount: integer("dispute_count").notNull().default(0),
  refundCount: integer("refund_count").notNull().default(0),
  refundedCents: integer("refunded_cents").notNull().default(0),
  fraudRiskScore: integer("fraud_risk_score").notNull().default(0),   // 0–100 AI-generated
  hireQualityScore: integer("hire_quality_score").notNull().default(50), // 0–100 Academy correlation
  predictiveLtvCents: integer("predictive_ltv_cents").notNull().default(0),
  churnRiskPct: integer("churn_risk_pct").notNull().default(0),       // 0–100

  // Level system (smarter than FSN-competitor-A's buyer rewards)
  clientLevel: text("client_level").notNull().default("new"), // "new" | "bronze" | "silver" | "gold"
  isVerifiedPayer: boolean("is_verified_payer").notNull().default(false),
  verifiedPayerAt: timestamp("verified_payer_at"),

  // Admin actions
  isFlagged: boolean("is_flagged").notNull().default(false),
  flagReason: text("flag_reason"),
  flaggedAt: timestamp("flagged_at"),
  flaggedBy: varchar("flagged_by"),

  isRestricted: boolean("is_restricted").notNull().default(false),
  restrictionReason: text("restriction_reason"),
  restrictedUntil: timestamp("restricted_until"),
  postingBudgetCapCents: integer("posting_budget_cap_cents"),

  // Fraud investigation
  underInvestigation: boolean("under_investigation").notNull().default(false),
  investigationNotes: text("investigation_notes"),
  investigationOpenedAt: timestamp("investigation_opened_at"),

  // Meta
  approvedAt: timestamp("approved_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientProfileSchema = createInsertSchema(clientProfiles).omit({ updatedAt: true });
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = z.infer<typeof insertClientProfileSchema>;

export const CLIENT_LEVELS = ["new", "bronze", "silver", "gold"] as const;
export type ClientLevel = typeof CLIENT_LEVELS[number];

/** Dynamic level thresholds (smarter than FSN-competitor-A/FSN-competitor-B flat tiers) */
export const CLIENT_LEVEL_CONFIG: Record<ClientLevel, {
  label: string; icon: string; color: string; bg: string;
  minSpentCents: number; maxDisputeRatePct: number;
}> = {
  new:    { label: "New Client",   icon: "🌱", color: "#6b7280", bg: "#6b728015", minSpentCents: 0,       maxDisputeRatePct: 100 },
  bronze: { label: "Bronze",       icon: "🥉", color: "#b45309", bg: "#b4530915", minSpentCents: 500000,  maxDisputeRatePct: 20  }, // R5,000
  silver: { label: "Silver",       icon: "🥈", color: "#6366f1", bg: "#6366f115", minSpentCents: 5000000, maxDisputeRatePct: 10  }, // R50,000
  gold:   { label: "Gold Partner", icon: "🏆", color: "#f59e0b", bg: "#f59e0b15", minSpentCents: 20000000, maxDisputeRatePct: 5  }, // R200,000
};
