import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// User activity / audit log
export const userActivityLogs = pgTable("user_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  performedBy: varchar("performed_by").references(() => users.id), // admin who performed action
  action: varchar("action", { length: 100 }).notNull(), // "login" | "suspend" | "ban" | "role_change" | "password_reset" | "kyc_update" | ...
  details: text("details"),
  metadata: jsonb("metadata"), // extra data (old value, new value, IP, etc.)
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;

// Wallet transactions
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // "credit" | "debit" | "escrow_hold" | "escrow_release" | "payout"
  amountCents: integer("amount_cents").notNull(), // in ZAR cents (positive = credit, negative = debit)
  balanceAfterCents: integer("balance_after_cents").notNull(),
  description: text("description"),
  referenceId: varchar("reference_id"), // booking ID, payment ID, etc.
  referenceType: varchar("reference_type", { length: 50 }), // "booking" | "payment" | "manual" | "payout"
  performedBy: varchar("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
