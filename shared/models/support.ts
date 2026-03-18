/**
 * SUPPORT TICKET SYSTEM — PostgreSQL + Drizzle ORM Schema
 *
 * Tables:
 *   supportTickets      — master ticket record with AI scores
 *   ticketMessages      — full thread (user + agent replies + internal notes)
 *   ticketAttachments   — files and voice notes
 *   slaTimers           — SLA tracking + escalation timestamps
 *   empathyLogs         — every frustration event detected
 *   ticketSurveys       — post-resolution happiness pulse
 *   agentTemplates      — saved mediation/response templates
 */

import { pgTable, serial, varchar, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── 1. SUPPORT TICKETS ───────────────────────────────────────────────────────
export const supportTickets = pgTable("support_tickets", {
  id:               varchar("id", { length: 64 }).primaryKey(),
  userId:           varchar("user_id", { length: 128 }).notNull(),
  userType:         varchar("user_type", { length: 16 }).notNull().default("client"), // client | freelancer
  userDisplayName:  varchar("user_display_name", { length: 128 }),
  userAcademyBadge: varchar("user_academy_badge", { length: 64 }),
  category:         varchar("category", { length: 32 }).notNull().default("other"),
  subject:          varchar("subject", { length: 256 }).notNull(),
  priority:         varchar("priority", { length: 16 }).notNull().default("medium"),
  status:           varchar("status", { length: 24 }).notNull().default("open"),
  assignedAgent:    varchar("assigned_agent", { length: 128 }),
  linkedOrderId:    varchar("linked_order_id", { length: 64 }),
  linkedDisputeId:  varchar("linked_dispute_id", { length: 64 }),
  linkedContractId: varchar("linked_contract_id", { length: 64 }),
  // AI fields
  aiCategory:       varchar("ai_category", { length: 32 }),
  aiConfidence:     integer("ai_confidence"),
  aiFrustrationScore: integer("ai_frustration_score").default(0),
  aiRiskScore:      integer("ai_risk_score").default(0),
  aiFirstResponse:  text("ai_first_response"),
  aiEmpathyLevel:   varchar("ai_empathy_level", { length: 16 }),
  aiAcademyCourse:  varchar("ai_academy_course", { length: 128 }),
  aiEarningsLift:   integer("ai_earnings_lift"),
  slaDeadline:      timestamp("sla_deadline"),
  slaBreached:      boolean("sla_breached").default(false),
  resolvedAt:       timestamp("resolved_at"),
  closedAt:         timestamp("closed_at"),
  satisfactionScore: integer("satisfaction_score"),
  createdAt:        timestamp("created_at").defaultNow().notNull(),
  updatedAt:        timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ createdAt: true, updatedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// ─── 2. TICKET MESSAGES (full thread) ────────────────────────────────────────
export const ticketMessages = pgTable("ticket_messages", {
  id:         serial("id").primaryKey(),
  ticketId:   varchar("ticket_id", { length: 64 }).notNull(),
  sender:     varchar("sender", { length: 128 }).notNull(),
  senderType: varchar("sender_type", { length: 16 }).notNull().default("user"), // user | agent | ai | system
  messageType: varchar("message_type", { length: 16 }).default("reply"), // reply | internal_note | ai_suggestion
  message:    text("message").notNull(),
  isInternal: boolean("is_internal").default(false),
  sentiment:  varchar("sentiment", { length: 16 }),
  sentAt:     timestamp("sent_at").defaultNow().notNull(),
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({ id: true, sentAt: true });
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type TicketMessage = typeof ticketMessages.$inferSelect;

// ─── 3. ATTACHMENTS + VOICE NOTES ────────────────────────────────────────────
export const ticketAttachments = pgTable("ticket_attachments", {
  id:         serial("id").primaryKey(),
  ticketId:   varchar("ticket_id", { length: 64 }).notNull(),
  uploadedBy: varchar("uploaded_by", { length: 128 }).notNull(),
  fileName:   varchar("file_name", { length: 256 }).notNull(),
  fileType:   varchar("file_type", { length: 64 }),
  mimeType:   varchar("mime_type", { length: 128 }),
  fileSizeKb: integer("file_size_kb"),
  isVoiceNote: boolean("is_voice_note").default(false),
  transcription: text("transcription"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertTicketAttachmentSchema = createInsertSchema(ticketAttachments).omit({ id: true, uploadedAt: true });
export type InsertTicketAttachment = z.infer<typeof insertTicketAttachmentSchema>;
export type TicketAttachment = typeof ticketAttachments.$inferSelect;

// ─── 4. SLA TIMERS ────────────────────────────────────────────────────────────
export const slaTimers = pgTable("sla_timers", {
  id:             serial("id").primaryKey(),
  ticketId:       varchar("ticket_id", { length: 64 }).notNull(),
  priorityLevel:  varchar("priority_level", { length: 16 }).notNull(),
  targetHours:    integer("target_hours").notNull(),
  startedAt:      timestamp("started_at").defaultNow().notNull(),
  deadlineAt:     timestamp("deadline_at").notNull(),
  escalatedAt:    timestamp("escalated_at"),
  escalatedTo:    varchar("escalated_to", { length: 128 }),
  breachedAt:     timestamp("breached_at"),
  resolvedAt:     timestamp("resolved_at"),
});

export const insertSlaTimerSchema = createInsertSchema(slaTimers).omit({ id: true });
export type InsertSlaTimer = z.infer<typeof insertSlaTimerSchema>;
export type SlaTimer = typeof slaTimers.$inferSelect;

// ─── 5. EMPATHY LOGS ──────────────────────────────────────────────────────────
export const empathyLogs = pgTable("empathy_logs", {
  id:          serial("id").primaryKey(),
  ticketId:    varchar("ticket_id", { length: 64 }).notNull(),
  triggeredBy: varchar("triggered_by", { length: 128 }),
  keywords:    text("keywords").array(),
  score:       integer("score").notNull().default(0),
  level:       varchar("level", { length: 16 }).notNull(),
  suggestion:  text("suggestion"),
  loggedAt:    timestamp("logged_at").defaultNow().notNull(),
});

export const insertEmpathyLogSchema = createInsertSchema(empathyLogs).omit({ id: true, loggedAt: true });
export type InsertEmpathyLog = z.infer<typeof insertEmpathyLogSchema>;
export type EmpathyLog = typeof empathyLogs.$inferSelect;

// ─── 6. POST-RESOLUTION SURVEYS ───────────────────────────────────────────────
export const ticketSurveys = pgTable("ticket_surveys", {
  id:               serial("id").primaryKey(),
  ticketId:         varchar("ticket_id", { length: 64 }).notNull(),
  userId:           varchar("user_id", { length: 128 }).notNull(),
  satisfactionScore: integer("satisfaction_score"),
  resolutionFair:   boolean("resolution_fair"),
  wouldRecommend:   boolean("would_recommend"),
  feedback:         text("feedback"),
  beforeMoodScore:  integer("before_mood_score"),
  afterMoodScore:   integer("after_mood_score"),
  submittedAt:      timestamp("submitted_at").defaultNow().notNull(),
});

export const insertTicketSurveySchema = createInsertSchema(ticketSurveys).omit({ id: true, submittedAt: true });
export type InsertTicketSurvey = z.infer<typeof insertTicketSurveySchema>;
export type TicketSurvey = typeof ticketSurveys.$inferSelect;

// ─── 7. AGENT TEMPLATES ───────────────────────────────────────────────────────
export const agentTemplates = pgTable("agent_templates", {
  id:          serial("id").primaryKey(),
  name:        varchar("name", { length: 128 }).notNull(),
  category:    varchar("category", { length: 32 }),
  subject:     varchar("subject", { length: 256 }),
  body:        text("body").notNull(),
  isInternal:  boolean("is_internal").default(false),
  usageCount:  integer("usage_count").default(0),
  createdBy:   varchar("created_by", { length: 128 }),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const insertAgentTemplateSchema = createInsertSchema(agentTemplates).omit({ id: true, createdAt: true });
export type InsertAgentTemplate = z.infer<typeof insertAgentTemplateSchema>;
export type AgentTemplate = typeof agentTemplates.$inferSelect;
