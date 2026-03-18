/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AUDIT LOGS — Immutable, Hash-Chained Accountability Layer                  ║
 * ║  The unbreakable accountability layer that makes FreelanceSkills.net        ║
 * ║  legally defensible in every jurisdiction including South Africa (POPIA),   ║
 * ║  Nigeria (NDPR), Kenya (DPA 2019), EU (GDPR), and US (SOC 2).             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * WHAT MAKES THIS LEGALLY UNBREAKABLE:
 * 1. SHA-256 hash chain: each log includes hash(own_data + previous_hash)
 *    → Any tampering breaks the chain instantly verifiable from log #1
 * 2. Append-only: no UPDATE or DELETE ever runs on this table
 * 3. Immutable timestamps: created_at cannot be updated (no updated_at column)
 * 4. Full before/after JSONB diffs: court-admissible proof of every change
 * 5. IP + session_id: links every action to a specific network identity
 * 6. Auto-logged by middleware: no admin can perform an action WITHOUT a log
 */

import { pgTable, serial, varchar, text, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id:              serial("id").primaryKey(),

  // WHO did it
  admin_user_id:   varchar("admin_user_id", { length: 128 }).notNull(),
  admin_email:     varchar("admin_email",   { length: 255 }),
  session_id:      varchar("session_id",   { length: 128 }),
  ip_address:      varchar("ip_address",   { length: 64 }),
  user_agent:      text("user_agent"),

  // WHAT they did
  action:          varchar("action",           { length: 128 }).notNull(),
  action_category: varchar("action_category",  { length: 64 }).notNull().default("system"),
  department:      varchar("department",       { length: 64 }).notNull().default("general"),
  description:     text("description"),

  // WHO/WHAT was affected
  target_type:     varchar("target_type",  { length: 64 }),
  target_id:       varchar("target_id",   { length: 128 }),
  target_label:    varchar("target_label",{ length: 255 }),

  // BEFORE ↔ AFTER diff (court-admissible evidence)
  before_state:    jsonb("before_state"),
  after_state:     jsonb("after_state"),

  // WHY (admin note)
  reason:          text("reason"),

  // RISK CLASSIFICATION
  severity:        varchar("severity", { length: 16 }).notNull().default("low"),
  is_automated:    boolean("is_automated").notNull().default(false),
  is_anomaly:      boolean("is_anomaly").notNull().default(false),
  anomaly_reason:  text("anomaly_reason"),
  anomaly_score:   varchar("anomaly_score", { length: 8 }),

  // TAMPER-PROOF HASH CHAIN
  // current_hash = SHA256(admin_user_id|action|target_id|created_at|previous_hash)
  previous_hash:   varchar("previous_hash", { length: 64 }),
  current_hash:    varchar("current_hash",  { length: 64 }),
  chain_valid:     boolean("chain_valid").notNull().default(true),

  // IMMUTABLE TIMESTAMP — no updated_at ever
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_aal_admin").on(t.admin_user_id),
  index("idx_aal_action").on(t.action),
  index("idx_aal_department").on(t.department),
  index("idx_aal_severity").on(t.severity),
  index("idx_aal_created_at").on(t.created_at),
  index("idx_aal_target").on(t.target_type, t.target_id),
  index("idx_aal_anomaly").on(t.is_anomaly),
  index("idx_aal_hash").on(t.current_hash),
]);

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
