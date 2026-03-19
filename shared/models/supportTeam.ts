/**
 * Support Team System v1.0 — shared/models/supportTeam.ts
 * Section 28 — FreelanceSkills.net | 200% ELON MUSK INTELLIGENCE
 *
 * Tables:
 *   support_agents              — team agent roster (status, specialization, load balancing)
 *   support_canned_responses    — reply library (AI-enhanced, category-filtered)
 *   support_escalation_rules    — auto-escalation triggers and routing
 *   support_agent_performance   — daily performance KPIs + leaderboard data
 *   support_team_tickets        — team-managed ticket view (extends Section 7)
 */
import { pgTable, varchar, text, boolean, timestamp, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

// ─── Support Agents ───────────────────────────────────────────────────────────
export const supportAgents = pgTable("support_agents", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  status: varchar("status", { length: 20 }).default("offline"), // online|busy|break|offline
  specialization: varchar("specialization", { length: 64 }).default("general"), // payment|dispute|technical|general|africa
  channelFocus: varchar("channel_focus", { length: 64 }).default("all"), // all|chat|email|whatsapp|ussd
  maxTickets: integer("max_tickets").default(15),
  activeTickets: integer("active_tickets").default(0),
  ticketsToday: integer("tickets_today").default(0),
  avgResponseMins: real("avg_response_mins").default(0),
  satisfactionScore: real("satisfaction_score").default(0),
  firstResponseSla: integer("first_response_sla").default(60), // minutes
  isActive: boolean("is_active").default(true),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertSupportAgentSchema = createInsertSchema(supportAgents).omit({ id: true, createdAt: true });
export type InsertSupportAgent = z.infer<typeof insertSupportAgentSchema>;
export type SupportAgent = typeof supportAgents.$inferSelect;

// ─── Canned Responses ─────────────────────────────────────────────────────────
export const supportCannedResponses = pgTable("support_canned_responses", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 64 }).default("general"), // payment|dispute|technical|general|escalation|africa
  channel: varchar("channel", { length: 32 }).default("all"), // all|email|chat|whatsapp|ussd
  tags: varchar("tags", { length: 256 }),
  usageCount: integer("usage_count").default(0),
  avgRating: real("avg_rating").default(0),
  aiGenerated: boolean("ai_generated").default(false),
  createdBy: varchar("created_by", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertCannedResponseSchema = createInsertSchema(supportCannedResponses).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCannedResponse = z.infer<typeof insertCannedResponseSchema>;
export type CannedResponse = typeof supportCannedResponses.$inferSelect;

// ─── Escalation Rules ─────────────────────────────────────────────────────────
export const supportEscalationRules = pgTable("support_escalation_rules", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  triggerType: varchar("trigger_type", { length: 64 }).notNull(), // sla_breach|sentiment|keyword|department|priority|vip
  triggerValue: jsonb("trigger_value").default({}), // {minutes:60}|{score:-0.8}|{words:["refund","legal"]}
  targetRole: varchar("target_role", { length: 64 }).default("senior_agent"), // senior_agent|finance|legal|moderator|management
  priority: varchar("priority", { length: 20 }).default("medium"), // low|medium|high|critical
  description: text("description"),
  autoNotify: boolean("auto_notify").default(true),
  isActive: boolean("is_active").default(true),
  triggeredCount: integer("triggered_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertEscalationRuleSchema = createInsertSchema(supportEscalationRules).omit({ id: true, createdAt: true });
export type InsertEscalationRule = z.infer<typeof insertEscalationRuleSchema>;
export type EscalationRule = typeof supportEscalationRules.$inferSelect;

// ─── Agent Daily Performance ──────────────────────────────────────────────────
export const supportAgentPerformance = pgTable("support_agent_performance", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 36 }).notNull(),
  agentName: varchar("agent_name", { length: 128 }),
  date: varchar("date", { length: 12 }).notNull(), // YYYY-MM-DD
  ticketsResolved: integer("tickets_resolved").default(0),
  avgResponseMins: real("avg_response_mins").default(0),
  firstResponseMins: real("first_response_mins").default(0),
  satisfactionScore: real("satisfaction_score").default(0),
  escalations: integer("escalations").default(0),
  autoResolved: integer("auto_resolved").default(0),
  channelBreakdown: jsonb("channel_breakdown").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});
export type AgentPerformance = typeof supportAgentPerformance.$inferSelect;

// ─── Team Tickets (supervisor view) ──────────────────────────────────────────
export const supportTeamTickets = pgTable("support_team_tickets", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 32 }).default("open"), // open|in_progress|pending_user|escalated|resolved|closed
  priority: varchar("priority", { length: 16 }).default("medium"), // urgent|high|medium|low
  category: varchar("category", { length: 64 }).default("general"),
  channel: varchar("channel", { length: 32 }).default("chat"), // email|chat|whatsapp|ussd|sms|in_app
  sentiment: varchar("sentiment", { length: 20 }).default("neutral"), // positive|neutral|negative|critical
  sentimentScore: real("sentiment_score").default(0),
  aiPriority: integer("ai_priority").default(50), // 0-100 AI calculated urgency
  assignedTo: varchar("assigned_to", { length: 128 }),
  assignedAgentName: varchar("assigned_agent_name", { length: 128 }),
  escalatedTo: varchar("escalated_to", { length: 64 }),
  slaDeadline: timestamp("sla_deadline"),
  slaBreached: boolean("sla_breached").default(false),
  resolvedAt: timestamp("resolved_at"),
  satisfactionRating: integer("satisfaction_rating"),
  tags: varchar("tags", { length: 512 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertTeamTicketSchema = createInsertSchema(supportTeamTickets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTeamTicket = z.infer<typeof insertTeamTicketSchema>;
export type TeamTicket = typeof supportTeamTickets.$inferSelect;
