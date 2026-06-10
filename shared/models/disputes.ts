/**
 * DISPUTE MANAGEMENT SYSTEM SCHEMA
 * Fair, transparent, AI-powered conflict resolution
 */
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, boolean, json, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { disputeStatusEnum, disputePriorityEnum, disputeReasonEnum } from "./enums";

// ─── MAIN DISPUTE TABLE ───────────────────────────────────────
export const disputes = pgTable(
  "disputes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("order_id").notNull(),
    contractId: varchar("contract_id"),
    clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "set null" }),
    clientName: text("client_name"),
    clientLTV: integer("client_ltv").default(0),
    freelancerId: varchar("freelancer_id").notNull().references(() => users.id, { onDelete: "set null" }),
    freelancerName: text("freelancer_name"),
    freelancerAcademyLevel: varchar("freelancer_academy_level").default("Intermediate"),
    freelancerEarningsLift: integer("freelancer_earnings_lift").default(0),
    reason: disputeReasonEnum("reason").notNull(),
    customReason: text("custom_reason"),
    status: disputeStatusEnum("status").default("open"),
    priority: disputePriorityEnum("priority").default("medium"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    closedAt: timestamp("closed_at"),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [
    index("idx_disputes_client").on(table.clientId),
    index("idx_disputes_freelancer").on(table.freelancerId),
    index("idx_disputes_status").on(table.status),
  ]
);

// ─── EVIDENCE VAULT ───────────────────────────────────────────
export const evidenceItems = pgTable("evidence_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  fileName: text("file_name"),
  filePath: text("file_path"),
  mimeType: varchar("mime_type"),
  uploadedBy: varchar("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  aiSentiment: varchar("ai_sentiment"),
  aiTrust: integer("ai_trust").default(50),
  transcription: text("transcription"),
  highlightedText: text("highlighted_text"),
});

// ─── RESOLUTION LOG ─────────────────────────────────────────────
export const resolutionLogs = pgTable("resolution_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  adminId: varchar("admin_id").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"),
  clientPaymentZAR: integer("client_payment_zar"),
  freelancerPaymentZAR: integer("freelancer_payment_zar"),
  platformRetainedZAR: integer("platform_retained_zar"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
});

// ─── FAIRNESS SCORE (AI) ──────────────────────────────────────
export const fairnessScores = pgTable("fairness_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score"),
  clientCaseStrength: integer("client_case_strength"),
  freelancerCaseStrength: integer("freelancer_case_strength"),
  academyImpact: integer("academy_impact"),
  recommendedSplit: text("recommended_split"),
  recommendedAction: varchar("recommended_action"),
  confidence: integer("confidence"),
  reasoning: text("reasoning"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// ─── POST-DISPUTE GROWTH PATH ───────────────────────────────────
export const growthPaths = pgTable("growth_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  freelancerId: varchar("freelancer_id").references(() => users.id, { onDelete: "set null" }),
  clientId: varchar("client_id").references(() => users.id, { onDelete: "set null" }),
  recommendedCourses: json("recommended_courses"),
  expectedEarningsLift: integer("expected_earnings_lift"),
  communicationTips: text("communication_tips"),
  nextSteps: text("next_steps"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── CHAT HISTORY (Full conversation replay) ───────────────────
export const disputeChats = pgTable("dispute_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  sender: varchar("sender").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  isHighlighted: boolean("is_highlighted").default(false),
  highlightReason: varchar("highlight_reason"),
});

// ─── ZOD SCHEMAS ───────────────────────────────────────────────
export const insertDisputeSchema = createInsertSchema(disputes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;

export const insertEvidenceItemSchema = createInsertSchema(evidenceItems).omit({ id: true, uploadedAt: true });
export type InsertEvidenceItem = z.infer<typeof insertEvidenceItemSchema>;
export type EvidenceItem = typeof evidenceItems.$inferSelect;

export const insertResolutionLogSchema = createInsertSchema(resolutionLogs).omit({ id: true, createdAt: true });
export type InsertResolutionLog = z.infer<typeof insertResolutionLogSchema>;
export type ResolutionLog = typeof resolutionLogs.$inferSelect;

export const insertFairnessScoreSchema = createInsertSchema(fairnessScores).omit({ id: true, generatedAt: true });
export type InsertFairnessScore = z.infer<typeof insertFairnessScoreSchema>;
export type FairnessScore = typeof fairnessScores.$inferSelect;

export const insertGrowthPathSchema = createInsertSchema(growthPaths).omit({ id: true, createdAt: true });
export type InsertGrowthPath = z.infer<typeof insertGrowthPathSchema>;
export type GrowthPath = typeof growthPaths.$inferSelect;

export const insertDisputeChatSchema = createInsertSchema(disputeChats).omit({ id: true, sentAt: true });
export type InsertDisputeChat = z.infer<typeof insertDisputeChatSchema>;
export type DisputeChat = typeof disputeChats.$inferSelect;
