import { pgTable, text, integer, timestamp, varchar, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const POINT_ACTIONS = {
  profile_complete: { points: 50, label: "Complete your profile", icon: "👤", category: "profile" },
  photo_upload: { points: 20, label: "Upload a profile photo", icon: "📸", category: "profile" },
  first_job_posted: { points: 100, label: "Post your first job", icon: "📋", category: "jobs" },
  first_hired: { points: 150, label: "Hire your first freelancer", icon: "🤝", category: "jobs" },
  job_completed: { points: 75, label: "Complete a job", icon: "✅", category: "jobs" },
  five_star_review: { points: 75, label: "Receive a 5-star review", icon: "⭐", category: "reputation" },
  identity_verified: { points: 100, label: "Verify your identity", icon: "🛡️", category: "trust" },
  course_complete: { points: 25, label: "Complete an Academy course", icon: "🎓", category: "learning" },
  referral_signup: { points: 200, label: "Refer a friend who signs up", icon: "👥", category: "referral" },
  monthly_active: { points: 10, label: "Stay active this month", icon: "🔥", category: "engagement" },
  proposal_sent: { points: 5, label: "Send a proposal", icon: "📨", category: "jobs" },
  ai_brief_generated: { points: 10, label: "Generate an AI job brief", icon: "🤖", category: "ai" },
} as const;

export type PointAction = keyof typeof POINT_ACTIONS;

export const REWARD_TIERS = [
  { name: "Bronze", min: 0, max: 499, icon: "🥉", color: "text-amber-700", bg: "bg-amber-950/50", border: "border-amber-800/50" },
  { name: "Silver", min: 500, max: 1999, icon: "🥈", color: "text-slate-400", bg: "bg-slate-800/50", border: "border-slate-600/50" },
  { name: "Gold", min: 2000, max: 4999, icon: "🥇", color: "text-amber-400", bg: "bg-amber-950/50", border: "border-amber-600/50" },
  { name: "Platinum", min: 5000, max: 14999, icon: "💎", color: "text-sky-400", bg: "bg-sky-950/50", border: "border-sky-600/50" },
  { name: "Elite", min: 15000, max: Infinity, icon: "👑", color: "text-emerald-400", bg: "bg-emerald-950/50", border: "border-emerald-600/50" },
] as const;

export const REWARDS_CATALOGUE = [
  { id: "discount_5", name: "5% Subscription Discount", cost: 500, icon: "🏷️", description: "5% off your next subscription renewal", category: "discount" },
  { id: "credit_50", name: "R50 Platform Credit", cost: 1000, icon: "💳", description: "R50 credit applied to your wallet", category: "credit" },
  { id: "premium_1mo", name: "1 Month Premium Free", cost: 2000, icon: "⭐", description: "Unlock all Premium features for 1 month", category: "subscription" },
  { id: "credit_250", name: "R250 Platform Credit", cost: 5000, icon: "💰", description: "R250 credit applied to your wallet", category: "credit" },
  { id: "commission_off", name: "50% Commission Reduction", cost: 3000, icon: "📉", description: "Half commission rate for your next 3 contracts", category: "discount" },
  { id: "academy_course", name: "Free Premium Course", cost: 800, icon: "🎓", description: "Unlock any paid Academy course for free", category: "learning" },
] as const;

export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    description: text("description").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_point_transactions_user").on(table.userId)]
);

export const rewardRedemptions = pgTable(
  "reward_redemptions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    rewardId: varchar("reward_id", { length: 100 }).notNull(),
    rewardName: varchar("reward_name", { length: 255 }).notNull(),
    pointsCost: integer("points_cost").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    appliedAt: timestamp("applied_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_reward_redemptions_user").on(table.userId)]
);

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({ id: true, createdAt: true });
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

export const insertRewardRedemptionSchema = createInsertSchema(rewardRedemptions).omit({ id: true, createdAt: true });
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = z.infer<typeof insertRewardRedemptionSchema>;

export function getTierForPoints(points: number) {
  return REWARD_TIERS.find(t => points >= t.min && points <= t.max) ?? REWARD_TIERS[0];
}

export function getNextTier(points: number) {
  const idx = REWARD_TIERS.findIndex(t => points >= t.min && points <= t.max);
  return idx < REWARD_TIERS.length - 1 ? REWARD_TIERS[idx + 1] : null;
}
