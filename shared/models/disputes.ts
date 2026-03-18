/**
 * DISPUTE MANAGEMENT SYSTEM SCHEMA
 * Fair, transparent, AI-powered conflict resolution
 */
import { pgTable, text, timestamp, integer, boolean, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── MAIN DISPUTE TABLE ───────────────────────────────────────
export const disputes = pgTable("disputes", {
  id: varchar("id").primaryKey().default(() => Math.random().toString(36).substring(7)),
  orderId: varchar("order_id").notNull(),
  contractId: varchar("contract_id"),
  clientId: varchar("client_id").notNull(),
  clientName: text("client_name"),
  clientLTV: integer("client_ltv").default(0), // Lifetime value in ZAR cents
  freelancerId: varchar("freelancer_id").notNull(),
  freelancerName: text("freelancer_name"),
  freelancerAcademyLevel: varchar("freelancer_academy_level").default("Intermediate"), // Top Rated / Pro / Intermediate / Beginner
  freelancerEarningsLift: integer("freelancer_earnings_lift").default(0), // % earnings increase from Academy
  reason: varchar("reason").notNull(), // Categorised: quality / payment / timeline / communication / theft / other
  customReason: text("custom_reason"), // Free-text reason
  status: varchar("status").default("open"), // open / under_review / resolved / closed / escalated
  priority: varchar("priority").default("medium"), // low / medium / high / critical
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  closedAt: timestamp("closed_at"),
  resolvedAt: timestamp("resolved_at"),
});

// ─── EVIDENCE VAULT ───────────────────────────────────────────
export const evidenceItems = pgTable("evidence_items", {
  id: varchar("id").primaryKey().default(() => Math.random().toString(36).substring(7)),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id),
  type: varchar("type").notNull(), // file / photo / screenshot / voice_note / chat_log / code
  fileName: text("file_name"),
  filePath: text("file_path"),
  mimeType: varchar("mime_type"),
  uploadedBy: varchar("uploaded_by").notNull(), // client / freelancer / admin
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  // AI Analysis
  aiSentiment: varchar("ai_sentiment"), // positive / neutral / negative / aggressive
  aiTrust: integer("ai_trust").default(50), // 0-100: plagiarism/authenticity score
  transcription: text("transcription"), // For voice notes
  highlightedText: text("highlighted_text"), // Key excerpts from chat logs
});

// ─── RESOLUTION LOG ─────────────────────────────────────────────
export const resolutionLogs = pgTable("resolution_logs", {
  id: varchar("id").primaryKey().default(() => Math.random().toString(36).substring(7)),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id),
  action: varchar("action").notNull(), // split_payment / refund_client / pay_freelancer / escalate / close / reopen
  adminId: varchar("admin_id"),
  notes: text("notes"),
  clientPaymentZAR: integer("client_payment_zar"), // What client gets (in cents)
  freelancerPaymentZAR: integer("freelancer_payment_zar"), // What freelancer gets (in cents)
  platformRetainedZAR: integer("platform_retained_zar"), // What platform keeps
  reason: text("reason"), // Why this decision
  createdAt: timestamp("created_at").defaultNow(),
  // Immutable audit
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
});

// ─── FAIRNESS SCORE (AI) ──────────────────────────────────────
export const fairnessScores = pgTable("fairness_scores", {
  id: varchar("id").primaryKey().default(() => Math.random().toString(36).substring(7)),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id),
  overallScore: integer("overall_score"), // 0-100
  clientCaseStrength: integer("client_case_strength"), // 0-100: how strong is client's claim
  freelancerCaseStrength: integer("freelancer_case_strength"), // 0-100: how strong is freelancer's claim
  academyImpact: integer("academy_impact"), // 0-100: does freelancer have Academy certification?
  recommendedSplit: text("recommended_split"), // JSON: { clientZAR, freelancerZAR, platformZAR }
  recommendedAction: varchar("recommended_action"), // full_refund / full_pay / 50_50_split / other
  confidence: integer("confidence"), // 0-100: how confident is the AI in this recommendation
  reasoning: text("reasoning"), // Explainable AI: why this recommendation
  generatedAt: timestamp("generated_at").defaultNow(),
});

// ─── POST-DISPUTE GROWTH PATH ───────────────────────────────────
export const growthPaths = pgTable("growth_paths", {
  id: varchar("id").primaryKey().default(() => Math.random().toString(36).substring(7)),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id),
  freelancerId: varchar("freelancer_id"),
  clientId: varchar("client_id"),
  // For freelancer
  recommendedCourses: json("recommended_courses"), // Array of Academy courses to prevent future disputes
  expectedEarningsLift: integer("expected_earnings_lift"), // % expected increase after training
  // For client
  communicationTips: text("communication_tips"), // How to work better with freelancers
  // General
  nextSteps: text("next_steps"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── CHAT HISTORY (Full conversation replay) ───────────────────
export const disputeChats = pgTable("dispute_chats", {
  id: varchar("id").primaryKey().default(() => Math.random().toString(36).substring(7)),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id),
  sender: varchar("sender").notNull(), // client / freelancer
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  // AI Highlighting
  isHighlighted: boolean("is_highlighted").default(false),
  highlightReason: varchar("highlight_reason"), // key_agreement / key_disagreement / payment_mention / etc
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
