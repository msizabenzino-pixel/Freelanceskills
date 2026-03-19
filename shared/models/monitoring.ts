/**
 * Real-Time Monitoring Department — shared/models/monitoring.ts
 * Section 29 — FreelanceSkills.net | 200% ELON MUSK INTELLIGENCE MASTERPIECE
 *
 * STUDY: Datadog $31/host/mo · New Relic $0.25/GB · Grafana Enterprise $50k/yr · Sentry $26/mo
 * — all require separate infrastructure, none have Africa-first intelligence, none auto-escalate
 *   via Permission System, none predict crashes before they happen.
 * We built real-time sub-second streaming monitoring FREE + embedded in the platform.
 *
 * Tables:
 *   monitoring_snapshots   — 5s periodic metric snapshots (1h history in DB, 1min in-memory)
 *   monitoring_anomalies   — AI-detected anomaly events (z-score + predictive ML)
 *   monitoring_alert_rules — user-configured threshold rules (auto-escalate via Permissions)
 */
import { pgTable, varchar, text, boolean, timestamp, jsonb, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

// ─── Metric Snapshots ─────────────────────────────────────────────────────────
export const monitoringSnapshots = pgTable("monitoring_snapshots", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  capturedAt: timestamp("captured_at").defaultNow(),
  usersOnline: integer("users_online").default(0),
  ordersPerMin: real("orders_per_min").default(0),
  paymentsPerMin: real("payments_per_min").default(0),
  errorsPerMin: real("errors_per_min").default(0),
  gigsPerMin: real("gigs_per_min").default(0),
  disputesPerMin: real("disputes_per_min").default(0),
  academyPerMin: real("academy_per_min").default(0),
  mobileMoneyPerMin: real("mobile_money_per_min").default(0),
  ussdPerMin: real("ussd_per_min").default(0),
  avgResponseMs: real("avg_response_ms").default(0),
  cpuLoad: real("cpu_load").default(0),
  memoryMb: real("memory_mb").default(0),
  paymentSuccessRate: real("payment_success_rate").default(0),
  errorRate: real("error_rate").default(0),
  platformHealthScore: real("platform_health_score").default(100),
  geoBreakdown: jsonb("geo_breakdown").default({}),
  channelBreakdown: jsonb("channel_breakdown").default({}),
  providerBreakdown: jsonb("provider_breakdown").default({}),
});
export type MonitoringSnapshot = typeof monitoringSnapshots.$inferSelect;

// ─── AI Anomaly Events ────────────────────────────────────────────────────────
export const monitoringAnomalies = pgTable("monitoring_anomalies", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 64 }).notNull(),
  metric: varchar("metric", { length: 64 }),
  severity: varchar("severity", { length: 16 }).default("warning"),
  message: text("message").notNull(),
  details: jsonb("details").default({}),
  zScore: real("z_score").default(0),
  confidence: integer("confidence").default(0),
  currentValue: real("current_value").default(0),
  avgValue: real("avg_value").default(0),
  predictive: boolean("predictive").default(false),
  minutesAhead: integer("minutes_ahead").default(0),
  predictedValue: real("predicted_value"),
  suggestedAction: text("suggested_action"),
  autoActionsTriggered: jsonb("auto_actions_triggered").default([]),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: varchar("acknowledged_by", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow(),
});
export type MonitoringAnomaly = typeof monitoringAnomalies.$inferSelect;

// ─── Alert Rules ──────────────────────────────────────────────────────────────
export const monitoringAlertRules = pgTable("monitoring_alert_rules", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  metric: varchar("metric", { length: 64 }).notNull(),
  operator: varchar("operator", { length: 8 }).default("gt"),
  threshold: real("threshold").notNull(),
  severity: varchar("severity", { length: 16 }).default("warning"),
  description: text("description"),
  autoNotify: boolean("auto_notify").default(true),
  autoCreateTicket: boolean("auto_create_ticket").default(false),
  autoAuditLog: boolean("auto_audit_log").default(true),
  targetRole: varchar("target_role", { length: 64 }).default("admin"),
  cooldownMins: integer("cooldown_mins").default(5),
  isActive: boolean("is_active").default(true),
  triggeredCount: integer("triggered_count").default(0),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type MonitoringAlertRule = typeof monitoringAlertRules.$inferSelect;

export const insertAlertRuleSchema = createInsertSchema(monitoringAlertRules).omit({ id: true, triggeredCount: true, lastTriggeredAt: true, createdAt: true });
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;
