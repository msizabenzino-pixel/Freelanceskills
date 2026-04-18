/**
 * REPORT & ABUSE MANAGEMENT SCHEMA
 *
 * THE SAFEST, MOST REHABILITATIVE TRUST & SAFETY SYSTEM IN AFRICA
 *
 * Competitor Weaknesses We Fix:
 * FSN-competitor-A/FSN-competitor-B  → Slow manual review, opaque decisions      → We: AI severity scoring + transparent audit trail
 * X/Instagram    → Reactive only, no rehabilitation           → We: Predictive Risk Engine + Academy rehab path
 * Reddit/Discord → Weak rehabilitation, permabans are common → We: Growth-first approach + appeal windows
 * TikTok         → No context, blanket suspensions           → We: Evidence Intelligence Vault + full context
 *
 * DRIZZLE TABLES:
 * 1. abuseReports          — core report records
 * 2. reportEvidence        — files, screenshots, voice notes, links
 * 3. rehabilitationPlans   — Academy-linked recovery plans for reported users
 * 4. reportRiskScores      — AI severity + predictive risk engine (0-100)
 * 5. reportAuditLog        — immutable action history
 * 6. reportMessages        — reporter/admin communication thread
 * 7. reportBulkViews       — saved admin views ("High-risk scam rings")
 */

import { pgTable, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ─── 1. ABUSE REPORTS ────────────────────────────────────────────────────────
export const abuseReports = pgTable("abuse_reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id", { length: 100 }).notNull(),
  reporterDisplayName: varchar("reporter_display_name", { length: 200 }),
  reporterMotiveBadge: varchar("reporter_motive_badge", { length: 50 }).default("concerned_user"),
  reportedUserId: varchar("reported_user_id", { length: 100 }).notNull(),
  reportedDisplayName: varchar("reported_display_name", { length: 200 }),
  reportedAcademyLevel: varchar("reported_academy_level", { length: 50 }),
  reportedPriorReports: integer("reported_prior_reports").default(0),
  reportType: varchar("report_type", { length: 50 }).notNull(), // spam | scam | fake_account | harassment | copyright | other
  contentType: varchar("content_type", { length: 50 }), // gig | job | proposal | message | profile
  contentId: varchar("content_id", { length: 100 }),
  contentUrl: text("content_url"),
  description: text("description").notNull(),
  status: varchar("status", { length: 30 }).default("open"), // open | under_review | resolved | closed
  assignedAdminId: varchar("assigned_admin_id", { length: 100 }),
  adminAction: varchar("admin_action", { length: 50 }), // warn | suspend | ban | escalate | close
  resolutionNote: text("resolution_note"),
  suspensionDurationDays: integer("suspension_duration_days"),
  appealWindowDays: integer("appeal_window_days").default(7),
  isAnonymous: boolean("is_anonymous").default(false),
  ussdSubmitted: boolean("ussd_submitted").default(false), // Africa zero-data feature
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").default({}),
});

// ─── 2. REPORT EVIDENCE ──────────────────────────────────────────────────────
export const reportEvidence = pgTable("report_evidence", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id", { length: 36 }).notNull(),
  uploadedBy: varchar("uploaded_by", { length: 100 }).notNull(),
  fileName: varchar("file_name", { length: 255 }),
  fileType: varchar("file_type", { length: 50 }), // image | video | audio | document | link
  fileUrl: text("file_url"),
  externalLink: text("external_link"),
  aiAuthenticity: integer("ai_authenticity").default(0), // 0-100 AI authenticity score
  aiSentiment: varchar("ai_sentiment", { length: 50 }), // positive | neutral | negative | hostile
  aiSummary: text("ai_summary"),
  aiPlagiarismScore: integer("ai_plagiarism_score").default(0),
  transcription: text("transcription"), // for voice notes
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// ─── 3. REHABILITATION PLANS ─────────────────────────────────────────────────
export const rehabilitationPlans = pgTable("rehabilitation_plans", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  recommendedCourses: jsonb("recommended_courses").default([]),
  growthMessage: text("growth_message"),
  healingSteps: jsonb("healing_steps").default([]),
  earningsLiftForecast: integer("earnings_lift_forecast").default(0),
  completionDeadlineDays: integer("completion_deadline_days").default(30),
  status: varchar("status", { length: 30 }).default("pending"), // pending | in_progress | completed | failed
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 4. REPORT RISK SCORES ────────────────────────────────────────────────────
export const reportRiskScores = pgTable("report_risk_scores", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id", { length: 36 }).notNull(),
  severityScore: integer("severity_score").default(0), // 0-100
  recidivismRisk: integer("recidivism_risk").default(0), // 0-100 re-offend probability
  platformHarmScore: integer("platform_harm_score").default(0),
  communityImpactScore: integer("community_impact_score").default(0),
  rehabilitationPotential: integer("rehabilitation_potential").default(0), // 0-100
  recommendedAction: varchar("recommended_action", { length: 50 }),
  aiRationale: text("ai_rationale"),
  computedAt: timestamp("computed_at").defaultNow(),
});

// ─── 5. REPORT AUDIT LOG (IMMUTABLE) ─────────────────────────────────────────
export const reportAuditLog = pgTable("report_audit_log", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id", { length: 36 }).notNull(),
  adminId: varchar("admin_id", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  previousStatus: varchar("previous_status", { length: 30 }),
  newStatus: varchar("new_status", { length: 30 }),
  details: jsonb("details").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
});

// ─── 6. REPORT MESSAGES ───────────────────────────────────────────────────────
export const reportMessages = pgTable("report_messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id", { length: 36 }).notNull(),
  senderId: varchar("sender_id", { length: 100 }).notNull(),
  senderRole: varchar("sender_role", { length: 20 }).default("admin"), // admin | reporter | system
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

// ─── INSERT SCHEMAS ───────────────────────────────────────────────────────────
export const insertAbuseReportSchema = createInsertSchema(abuseReports).omit({
  id: true, createdAt: true, resolvedAt: true,
});
export const insertReportEvidenceSchema = createInsertSchema(reportEvidence).omit({
  id: true, uploadedAt: true,
});
export const insertRehabilitationPlanSchema = createInsertSchema(rehabilitationPlans).omit({
  id: true, createdAt: true,
});
export const insertReportRiskScoreSchema = createInsertSchema(reportRiskScores).omit({
  id: true, computedAt: true,
});

export type AbuseReport = typeof abuseReports.$inferSelect;
export type InsertAbuseReport = z.infer<typeof insertAbuseReportSchema>;
export type ReportEvidence = typeof reportEvidence.$inferSelect;
export type RehabilitationPlan = typeof rehabilitationPlans.$inferSelect;
export type ReportRiskScore = typeof reportRiskScores.$inferSelect;
