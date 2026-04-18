/**
 * AI Brain Department — shared/models/aiBrain.ts
 * Section 30 — FreelanceSkills.net | 200% ELON MUSK INTELLIGENCE MASTERPIECE
 *
 * STUDY: FSN-competitor-B Uma · FSN-competitor-A Neo · FSN-competitor-C AI Screening · Vellum · Salesforce Einstein
 * — all require separate AI infrastructure costing $100k+/yr, none have Africa-first
 *   intelligence, none self-improve from platform outcomes, none run adversarial
 *   red-team simulation, none have a multi-agent swarm with majority voting.
 * We built the entire AI brain EMBEDDED in the product at zero additional cost.
 *
 * Tables:
 *   ai_agents           — 12 specialized agents registry (status, health, inference counts)
 *   ai_inference_events — every AI call logged (tokens, cost, latency, confidence, CO2)
 *   ai_feedback_signals — RLHF-style signals (user ratings + outcome → fine-tune)
 *   ai_swarm_decisions  — multi-agent debate records (votes, confidence, majority result)
 *   ai_agent_memory     — cross-department user pattern memory graph
 */
import { pgTable, varchar, text, boolean, timestamp, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

// ─── Agent Registry ───────────────────────────────────────────────────────────
export const aiAgents = pgTable("ai_agents", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 64 }).notNull(),
  specialization: varchar("specialization", { length: 64 }).notNull(),
  description: text("description"),
  model: varchar("model", { length: 64 }).default("gpt-4o-mini"),
  status: varchar("status", { length: 16 }).default("online"),
  healthScore: real("health_score").default(100),
  totalInferences: integer("total_inferences").default(0),
  avgLatencyMs: real("avg_latency_ms").default(0),
  avgConfidence: real("avg_confidence").default(0),
  totalTokensUsed: integer("total_tokens_used").default(0),
  totalCostUsd: real("total_cost_usd").default(0),
  capabilities: jsonb("capabilities").default([]),
  africaOptimized: boolean("africa_optimized").default(false),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
export type AiAgent = typeof aiAgents.$inferSelect;

// ─── Inference Events ─────────────────────────────────────────────────────────
export const aiInferenceEvents = pgTable("ai_inference_events", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 36 }),
  agentName: varchar("agent_name", { length: 64 }),
  feature: varchar("feature", { length: 64 }).notNull(),
  userId: varchar("user_id", { length: 128 }),
  inputSummary: text("input_summary"),
  outputSummary: text("output_summary"),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  latencyMs: integer("latency_ms").default(0),
  confidence: real("confidence").default(0),
  costUsd: real("cost_usd").default(0),
  co2Grams: real("co2_grams").default(0),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});
export type AiInferenceEvent = typeof aiInferenceEvents.$inferSelect;

// ─── RLHF Feedback Signals ────────────────────────────────────────────────────
export const aiFeedbackSignals = pgTable("ai_feedback_signals", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  inferenceEventId: varchar("inference_event_id", { length: 36 }),
  feature: varchar("feature", { length: 64 }).notNull(),
  rating: integer("rating"),
  thumbs: varchar("thumbs", { length: 4 }),
  outcome: varchar("outcome", { length: 32 }),
  notes: text("notes"),
  submittedBy: varchar("submitted_by", { length: 128 }),
  usedForTraining: boolean("used_for_training").default(false),
  trainingWeight: real("training_weight").default(1.0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Swarm Decisions ──────────────────────────────────────────────────────────
export const aiSwarmDecisions = pgTable("ai_swarm_decisions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  taskType: varchar("task_type", { length: 64 }).notNull(),
  inputSummary: text("input_summary"),
  agents: jsonb("agents").default([]),
  agentVotes: jsonb("agent_votes").default([]),
  finalDecision: text("final_decision"),
  finalConfidence: real("final_confidence").default(0),
  consensusType: varchar("consensus_type", { length: 32 }).default("majority"),
  totalLatencyMs: integer("total_latency_ms").default(0),
  totalCostUsd: real("total_cost_usd").default(0),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Agent Memory Graph ───────────────────────────────────────────────────────
export const aiAgentMemory = pgTable("ai_agent_memory", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull(),
  department: varchar("department", { length: 64 }),
  patternKey: varchar("pattern_key", { length: 128 }).notNull(),
  patternValue: text("pattern_value"),
  strength: real("strength").default(1.0),
  observations: integer("observations").default(1),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(aiFeedbackSignals).omit({ id: true, usedForTraining: true, createdAt: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
