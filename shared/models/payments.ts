/**
 * Escrow & Payments Schema — FreelanceSkills.net
 *
 * HOW WE BEAT THE COMPETITION:
 * ✦ FIVERR: Instant release but zero control → We have AI Release Scoring (0–100) with Academy correlation
 * ✦ UPWORK: Milestone-based only → We support both milestone + full escrow with fraud detection per transaction
 * ✦ TOPTAL: Secure but opaque → We give full transparency: per-factor AI score breakdown shown to admin
 * ✦ PEOPLEPERHOUR: Manual dispute process → We have real-time anomaly detection + auto-hold logic
 * ✦ GURU: SafePay is basic → We have predictive fraud prevention + auto-release rules engine
 * ✦ FREELANCER.COM: Milestone disputes take weeks → We resolve in hours with AI scoring + one-tap release
 *
 * KEY ZAR-FIRST FEATURES:
 * - All amounts in ZAR cents (Africa-first)
 * - PayFast payout reference tracking
 * - Rural-friendly SMS confirmation (on release)
 * - Auto-release rules tied to Academy certification + freelancer level
 */
import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { jobs } from "./jobs";
import { escrowStatusEnum } from "./enums";

/**
 * PaymentEscrow — core financial record for the Payments Control Centre
 * Extended schema: AI Release Score, fraud risk, auto-release rules, PayFast payout tracking
 * (Distinct from the legacy fortify.ts escrowTransactions which tracks basic booking holds)
 */
export const paymentEscrows = pgTable("payment_escrows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Job + People
  jobId: varchar("job_id").references(() => jobs.id),
  jobTitle: text("job_title"), // denormalized for speed
  clientId: varchar("client_id").notNull().references(() => users.id),
  freelancerId: varchar("freelancer_id").references(() => users.id),

  // Amounts (all ZAR cents)
  amountCents: integer("amount_cents").notNull(),        // total escrow held
  platformFeeCents: integer("platform_fee_cents").notNull().default(0), // platform commission
  freelancerPayoutCents: integer("freelancer_payout_cents").notNull(),  // what freelancer receives

  // Status lifecycle
  // held → released | refunded | disputed | auto_released
  status: escrowStatusEnum("status").notNull().default("held"),

  // AI scores (0–100)
  releaseScore: integer("release_score").notNull().default(50),  // AI Release Score
  fraudRiskScore: integer("fraud_risk_score").notNull().default(0), // fraud probability

  // Timestamps
  heldAt: timestamp("held_at").defaultNow(),
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  disputedAt: timestamp("disputed_at"),
  autoReleaseAt: timestamp("auto_release_at"),   // scheduled auto-release time

  // Release tracking
  releasedBy: varchar("released_by"),            // userId of admin OR "auto"
  refundedBy: varchar("refunded_by"),

  // PayFast payout
  payoutStatus: text("payout_status").notNull().default("pending"), // "pending" | "processing" | "paid" | "failed"
  payoutRef: varchar("payout_ref"),              // PayFast reference
  payoutInitiatedAt: timestamp("payout_initiated_at"),
  payoutCompletedAt: timestamp("payout_completed_at"),

  // Extra
  notes: text("notes"),
  isOnHold: boolean("is_on_hold").notNull().default(false),
  holdReason: text("hold_reason"),
  autoReleaseRuleId: varchar("auto_release_rule_id"), // which rule triggered auto-release

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentEscrowSchema = createInsertSchema(paymentEscrows).omit({
  id: true, createdAt: true, updatedAt: true, heldAt: true,
});
export type PaymentEscrow = typeof paymentEscrows.$inferSelect;
export type InsertPaymentEscrow = z.infer<typeof insertPaymentEscrowSchema>;

/**
 * EscrowReleaseRule — smart auto-release engine
 * Beats FSN-competitor-A/FSN-competitor-B by tying release logic to freelancer quality + Academy certification
 */
export const escrowReleaseRules = pgTable("escrow_release_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  condition: text("condition").notNull(), // "academy_certified" | "top_rated" | "level2_plus" | "high_release_score"
  conditionThreshold: integer("condition_threshold").default(0), // e.g. release score >= 85
  autoReleaseAfterHours: integer("auto_release_after_hours").notNull().default(48),
  isActive: boolean("is_active").notNull().default(true),
  triggeredCount: integer("triggered_count").notNull().default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEscrowReleaseRuleSchema = createInsertSchema(escrowReleaseRules).omit({ id: true, createdAt: true, triggeredCount: true });
export type EscrowReleaseRule = typeof escrowReleaseRules.$inferSelect;
export type InsertEscrowReleaseRule = z.infer<typeof insertEscrowReleaseRuleSchema>;

// ─── Constants ───────────────────────────────────────────────────
export const ESCROW_STATUSES = ["held", "released", "refunded", "disputed", "auto_released"] as const;
export type EscrowStatus = typeof ESCROW_STATUSES[number];

export const STATUS_CONFIG: Record<EscrowStatus, { label: string; color: string; bg: string }> = {
  held:          { label: "Held",          color: "#f59e0b", bg: "#f59e0b18" },
  released:      { label: "Released",      color: "#1DBF73", bg: "#1DBF7318" },
  auto_released: { label: "Auto-Released", color: "#3b82f6", bg: "#3b82f618" },
  refunded:      { label: "Refunded",      color: "#8b5cf6", bg: "#8b5cf618" },
  disputed:      { label: "Disputed",      color: "#ef4444", bg: "#ef444418" },
};

/** AI Release Score factors (transparent — beats all competitors) */
export const RELEASE_SCORE_FACTORS = {
  academyCertified:   { label: "Academy Certified",          max: 30, description: "Freelancer has Academy certificate" },
  jobSuccessRate:     { label: "Job Success Rate",           max: 25, description: "% of completed jobs (satisfied clients)" },
  clientLTV:          { label: "Client LTV Score",           max: 20, description: "Client lifetime value (low churn risk)" },
  responseTime:       { label: "Response Time",              max: 15, description: "Freelancer average response time" },
  kycVerified:        { label: "KYC Verified",               max: 10, description: "Both parties KYC-verified" },
} as const;
