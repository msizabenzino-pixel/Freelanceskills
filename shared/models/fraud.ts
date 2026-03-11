import { pgTable, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fraudFlags = pgTable("fraud_flags", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bookingId: varchar("booking_id"), // Can be null if it's a general user flag
  userId: varchar("user_id").notNull(),
  riskScore: integer("risk_score").notNull(),
  flags: text("flags").array().notNull().$type<string[]>(),
  recommendation: varchar("recommendation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  resolution: varchar("resolution"), // "approved", "rejected", "escalated"
});

export const insertFraudFlagSchema = createInsertSchema(fraudFlags).omit({
  id: true,
  createdAt: true,
});

export type FraudFlag = typeof fraudFlags.$inferSelect;
export type InsertFraudFlag = z.infer<typeof insertFraudFlagSchema>;
