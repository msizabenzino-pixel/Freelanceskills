import { pgTable, text, integer, timestamp, varchar, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  resource: varchar("resource").notNull(),
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export const disputes = pgTable("disputes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bookingId: varchar("booking_id").notNull(),
  initiatorId: varchar("initiator_id").notNull(),
  respondentId: varchar("respondent_id").notNull(),
  reason: varchar("reason").notNull(),
  description: text("description").notNull(),
  status: varchar("status").notNull().default("open"),
  adminId: varchar("admin_id"),
  resolution: text("resolution"),
  chatLogExport: jsonb("chat_log_export").$type<any[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({ id: true, createdAt: true, resolvedAt: true });
export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;

export const escrowTransactions = pgTable("escrow_transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bookingId: varchar("booking_id").notNull(),
  clientId: varchar("client_id").notNull(),
  freelancerId: varchar("freelancer_id").notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency").notNull().default("ZAR"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").notNull().default("held"),
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEscrowTransactionSchema = createInsertSchema(escrowTransactions).omit({ id: true, createdAt: true });
export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type InsertEscrowTransaction = z.infer<typeof insertEscrowTransactionSchema>;

export const premiumTiers = pgTable("premium_tiers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  tier: varchar("tier").notNull().default("free"),
  visibilityBoost: integer("visibility_boost").notNull().default(0),
  rateLimitMultiplier: real("rate_limit_multiplier").notNull().default(1),
  featuredUntil: timestamp("featured_until"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPremiumTierSchema = createInsertSchema(premiumTiers).omit({ id: true, createdAt: true, updatedAt: true });
export type PremiumTier = typeof premiumTiers.$inferSelect;
export type InsertPremiumTier = z.infer<typeof insertPremiumTierSchema>;

export const cronLogs = pgTable("cron_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  jobName: varchar("job_name").notNull(),
  status: varchar("status").notNull(),
  itemsProcessed: integer("items_processed").default(0),
  details: jsonb("details").$type<Record<string, any>>(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertCronLogSchema = createInsertSchema(cronLogs).omit({ id: true, startedAt: true });
export type CronLog = typeof cronLogs.$inferSelect;
export type InsertCronLog = z.infer<typeof insertCronLogSchema>;
