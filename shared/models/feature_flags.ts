/**
 * Feature Flags Department — shared/models/feature_flags.ts
 * Section 26 — FreelanceSkills.net
 * The nuclear master control panel of the entire platform.
 * LaunchDarkly-level + 3 years ahead — Africa-first, AI-powered.
 */
import { pgTable, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Feature Flags ────────────────────────────────────────────────────────────
export const featureFlags = pgTable("feature_flags", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: varchar("key", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).default("general"),
  // general | marketplace | africa | ai | payment | social | security | academy | performance | compliance
  status: varchar("status", { length: 32 }).default("off"),
  // off | on | rollout | experiment | scheduled | deprecated
  rolloutPercentage: integer("rollout_percentage").default(0),
  targetingRules: jsonb("targeting_rules").default("[]"),
  // [{type, operator, value, description}]
  tags: text("tags").array().default("{}"),
  impactLevel: varchar("impact_level", { length: 16 }).default("low"),
  // low | medium | high | critical
  defaultValue: boolean("default_value").default(false),
  metadata: jsonb("metadata").default("{}"),
  createdBy: varchar("created_by", { length: 128 }),
  isKillSwitch: boolean("is_kill_switch").default(false),
  isLocked: boolean("is_locked").default(false),
  lockedReason: text("locked_reason"),
  enabledAt: timestamp("enabled_at"),
  disabledAt: timestamp("disabled_at"),
  scheduledEnableAt: timestamp("scheduled_enable_at"),
  scheduledDisableAt: timestamp("scheduled_disable_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Flag History — Immutable Audit Trail ─────────────────────────────────────
export const flagHistory = pgTable("flag_history", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  flagId: varchar("flag_id", { length: 128 }).notNull(),
  flagKey: varchar("flag_key", { length: 128 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  // created | enabled | disabled | rollout-changed | targeting-updated | experiment-started | rollback | deleted | scheduled | locked
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  changedBy: varchar("changed_by", { length: 128 }),
  changeNote: text("change_note"),
  rolloutBefore: integer("rollout_before"),
  rolloutAfter: integer("rollout_after"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Flag Experiments (A/B Tests) ─────────────────────────────────────────────
export const flagExperiments = pgTable("flag_experiments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  flagId: varchar("flag_id", { length: 128 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  hypothesis: text("hypothesis"),
  status: varchar("status", { length: 32 }).default("draft"),
  // draft | running | paused | concluded | archived
  variants: jsonb("variants").default("[]"),
  // [{id, name, description, rollout, isControl}]
  trafficSplit: jsonb("traffic_split").default("{}"),
  // {control: 50, treatment: 50}
  targetMetric: varchar("target_metric", { length: 128 }),
  startedAt: timestamp("started_at"),
  concludedAt: timestamp("concluded_at"),
  winner: varchar("winner", { length: 128 }),
  winnerConfidence: integer("winner_confidence"),
  results: jsonb("results").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Schemas & Types ──────────────────────────────────────────────────────────
export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true, createdAt: true, updatedAt: true, enabledAt: true, disabledAt: true,
});
export const insertFlagHistorySchema = createInsertSchema(flagHistory).omit({ id: true, createdAt: true });
export const insertFlagExperimentSchema = createInsertSchema(flagExperiments).omit({ id: true, createdAt: true });

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type FlagHistory = typeof flagHistory.$inferSelect;
export type FlagExperiment = typeof flagExperiments.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
