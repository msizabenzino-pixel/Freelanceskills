import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: text("referrer_id").notNull(),
  referredUserId: text("referred_user_id"),
  referralCode: text("referral_code").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, signup, completed, paid
  rewardAmount: integer("reward_amount").notNull().default(0), // in cents
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
