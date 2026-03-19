/**
 * System Performance Department — shared/models/performance.ts
 * Section 31 — FreelanceSkills.net | 300% ELON MUSK GOD-MODE
 *
 * Operational cardiology for the platform. Beats Datadog + New Relic + Grafana + Sentry combined:
 *   — Prometheus exposition, in-memory sliding-window counters, 3-sigma anomaly detection,
 *     Africa-first metrics (USSD/MobileMoney), Node.js runtime health, capacity forecasting.
 *
 * Tables:
 *   performance_snapshots    — 5s periodic API/DB/runtime snapshots (1h history)
 *   performance_slow_queries — top slowest endpoint + DB query log (rolling 500 entries)
 *   performance_alert_rules  — threshold-based alert rules with auto-escalation
 *   performance_anomalies    — 3-sigma + MAD anomaly events with root-cause analysis
 */
import { pgTable, varchar, text, boolean, timestamp, jsonb, integer, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

// ─── Performance Snapshots ────────────────────────────────────────────────────
export const performanceSnapshots = pgTable("performance_snapshots", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  capturedAt: timestamp("captured_at").defaultNow(),
  // API latency (ms)
  apiP50: real("api_p50").default(0),
  apiP95: real("api_p95").default(0),
  apiP99: real("api_p99").default(0),
  apiReqPerMin: real("api_req_per_min").default(0),
  apiErrorRate: real("api_error_rate").default(0),
  // DB metrics
  dbQueryAvgMs: real("db_query_avg_ms").default(0),
  dbQueryP95: real("db_query_p95").default(0),
  dbConnectionsActive: integer("db_connections_active").default(0),
  dbSlowQueryCount: integer("db_slow_query_count").default(0),
  // Node.js runtime
  heapUsedMb: real("heap_used_mb").default(0),
  heapTotalMb: real("heap_total_mb").default(0),
  eventLoopLagMs: real("event_loop_lag_ms").default(0),
  gcPauseMs: real("gc_pause_ms").default(0),
  cpuUserMs: real("cpu_user_ms").default(0),
  cpuSystemMs: real("cpu_system_ms").default(0),
  // Socket.io
  socketConnections: integer("socket_connections").default(0),
  socketMsgPerMin: real("socket_msg_per_min").default(0),
  socketDropRate: real("socket_drop_rate").default(0),
  // Queues
  queueBacklog: integer("queue_backlog").default(0),
  queueProcessingMs: real("queue_processing_ms").default(0),
  // External services
  emailProviderMs: real("email_provider_ms").default(0),
  smsProviderMs: real("sms_provider_ms").default(0),
  paymentGatewayMs: real("payment_gateway_ms").default(0),
  paymentSuccessRate: real("payment_success_rate").default(0),
  // Africa-specific
  mobileMoneyMs: real("mobile_money_ms").default(0),
  ussdLatencyMs: real("ussd_latency_ms").default(0),
  ruralReqPct: real("rural_req_pct").default(0),
  // Business KPIs
  proposalToOrderAvgMin: real("proposal_to_order_avg_min").default(0),
  escrowHoldAvgHr: real("escrow_hold_avg_hr").default(0),
  disputeResolutionAvgHr: real("dispute_resolution_avg_hr").default(0),
  // Health score
  healthScore: real("health_score").default(100),
  extras: jsonb("extras").default({}),
});

// ─── Slow Query Log ───────────────────────────────────────────────────────────
export const performanceSlowQueries = pgTable("performance_slow_queries", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  capturedAt: timestamp("captured_at").defaultNow(),
  type: varchar("type", { length: 16 }).default("endpoint"), // "endpoint" | "db_query"
  label: text("label").notNull(),
  method: varchar("method", { length: 10 }).default("GET"),
  durationMs: real("duration_ms").default(0),
  p50: real("p50").default(0),
  p95: real("p95").default(0),
  p99: real("p99").default(0),
  callCount: integer("call_count").default(0),
  errorCount: integer("error_count").default(0),
  impact: real("impact").default(0), // p95 * callCount — business impact score
  extras: jsonb("extras").default({}),
});

// ─── Alert Rules ──────────────────────────────────────────────────────────────
export const performanceAlertRules = pgTable("performance_alert_rules", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  name: text("name").notNull(),
  metric: varchar("metric", { length: 64 }).notNull(), // "api_p99", "heap_used_mb", etc.
  operator: varchar("operator", { length: 4 }).default("gt"), // "gt" | "lt" | "eq"
  threshold: real("threshold").notNull(),
  severity: varchar("severity", { length: 10 }).default("warning"), // "info" | "warning" | "critical"
  channels: text("channels").array().default([]), // "email" | "sms" | "slack" | "ticket"
  cooldownMin: integer("cooldown_min").default(15),
  enabled: boolean("enabled").default(true),
  lastFiredAt: timestamp("last_fired_at"),
  fireCount: integer("fire_count").default(0),
  description: text("description").default(""),
  autoTicket: boolean("auto_ticket").default(false),
});

// ─── Anomaly Events ───────────────────────────────────────────────────────────
export const performanceAnomalies = pgTable("performance_anomalies", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  detectedAt: timestamp("detected_at").defaultNow(),
  metric: varchar("metric", { length: 64 }).notNull(),
  value: real("value").notNull(),
  expected: real("expected").notNull(),
  zScore: real("z_score").notNull(),
  severity: varchar("severity", { length: 10 }).default("warning"),
  method: varchar("method", { length: 10 }).default("zscore"), // "zscore" | "mad"
  rootCause: text("root_cause").default(""),
  recommendations: text("recommendations").array().default([]),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: varchar("acknowledged_by", { length: 36 }),
  resolvedAt: timestamp("resolved_at"),
  extras: jsonb("extras").default({}),
});

// ─── Insert Schemas & Types ───────────────────────────────────────────────────
export const insertPerformanceSnapshotSchema = createInsertSchema(performanceSnapshots).omit({ id: true, capturedAt: true });
export const insertSlowQuerySchema = createInsertSchema(performanceSlowQueries).omit({ id: true, capturedAt: true });
export const insertAlertRuleSchema = createInsertSchema(performanceAlertRules).omit({ id: true, createdAt: true, updatedAt: true, lastFiredAt: true, fireCount: true });
export const insertAnomalySchema = createInsertSchema(performanceAnomalies).omit({ id: true, detectedAt: true });

export type InsertPerformanceSnapshot = z.infer<typeof insertPerformanceSnapshotSchema>;
export type InsertSlowQuery = z.infer<typeof insertSlowQuerySchema>;
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;
export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;

export type PerformanceSnapshot = typeof performanceSnapshots.$inferSelect;
export type SlowQuery = typeof performanceSlowQueries.$inferSelect;
export type AlertRule = typeof performanceAlertRules.$inferSelect;
export type PerformanceAnomaly = typeof performanceAnomalies.$inferSelect;
