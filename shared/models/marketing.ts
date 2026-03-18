import { pgTable, serial, varchar, text, integer, numeric, boolean, timestamp, jsonb, date, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Marketing System v2.0 — 200% Intelligence
 * The ultimate growth & viral acquisition engine for FreelanceSkills.net
 *
 * Obliterates:
 * - Fiverr: basic credits (no AI, no predictive)
 * - Upwork: generic boost (no virality, no Africa tiers)
 * - Klaviyo/Shopify: template automation (no agent reasoning)
 *
 * 20 Superpowers:
 * 1. AI Campaign Brain — autonomous agent suggests + builds + A/B tests
 * 2. Predictive LTV Engine — forecast user lifetime value + churn risk
 * 3. Viral Coefficient Tracker — measure + optimize word-of-mouth growth
 * 4. Referral System — referral links + bonuses + tiers + leaderboard
 * 5. Dynamic Coupons — discount codes + usage limits + condition rules
 * 6. Affiliate Program — tracking + commissions + payout automation
 * 7. Growth Forecasting — ML-style growth curve prediction
 * 8. Africa USSD Flows — WhatsApp + SMS + mobile money referral payouts
 * 9. A/B Testing Engine — campaign variant testing + auto-winner declaration
 * 10. Email Campaign Manager — newsletters + win-back + announcements + referral push
 * 11. Gamification & Loyalty Tiers — badges + streaks + escalating bonuses
 * 12. Real-time Socket.io Alerts — live campaign perf + viral alerts + milestone hits
 * 13. Funnel Attribution — track referral → signup → purchase → advocate
 * 14. Churn Prevention AI — predict + intervene + win-back campaigns
 * 15. Community Virality Heatmap — peer-to-peer recommendation networks
 * 16. Acquisition Cost Optimizer — bid management + channel ROI
 * 17. Zero-data Africa Signup — USSD referral codes, no smartphone needed
 * 18. Sentiment-Driven Incentives — adjust bonuses by user satisfaction
 * 19. Growth Loop Automation — reward loops that compound over time
 * 20. 5-Year Roadmap Intelligence — foresee growth barriers + preempt problems
 */

// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGNS — Email + Referral + Win-back + Announcements
// ═══════════════════════════════════════════════════════════════════════════
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("newsletter"), // newsletter, announcement, win_back, referral_push
  status: varchar("status", { length: 30 }).notNull().default("draft"), // draft, scheduled, active, paused, completed
  subject: varchar("subject", { length: 255 }),
  headline: varchar("headline", { length: 255 }),
  body: text("body"),
  cta_text: varchar("cta_text", { length: 100 }),
  cta_url: varchar("cta_url", { length: 2048 }),
  
  // Targeting
  target_segment: varchar("target_segment", { length: 50 }).default("all"), // all, freelancers, clients, high_value, at_risk, inactive
  target_countries: jsonb("target_countries").default(sql`'[]'::jsonb`), // [ZA, NG, KE, ...]
  min_spend_cents: integer("min_spend_cents"),
  max_churn_risk: numeric("max_churn_risk", { precision: 3, scale: 2 }),
  
  // AI Brain
  ai_generated: boolean("ai_generated").default(false),
  ai_variant_a: jsonb("ai_variant_a"), // { subject, body, cta_text }
  ai_variant_b: jsonb("ai_variant_b"),
  ai_suggested_send_time: timestamp("ai_suggested_send_time"),
  
  // A/B Testing
  ab_enabled: boolean("ab_enabled").default(true),
  ab_split_pct: integer("ab_split_pct").default(50),
  ab_variant_a_id: varchar("ab_variant_a_id", { length: 50 }),
  ab_variant_b_id: varchar("ab_variant_b_id", { length: 50 }),
  ab_winner_variant: varchar("ab_winner_variant", { length: 1 }), // A or B
  ab_confidence_pct: numeric("ab_confidence_pct", { precision: 5, scale: 2 }),
  
  // Performance
  scheduled_at: timestamp("scheduled_at"),
  sent_at: timestamp("sent_at"),
  recipients_count: integer("recipients_count").default(0),
  opens: integer("opens").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  open_rate: numeric("open_rate", { precision: 5, scale: 2 }).default(sql`0`),
  click_rate: numeric("click_rate", { precision: 5, scale: 2 }).default(sql`0`),
  conversion_rate: numeric("conversion_rate", { precision: 5, scale: 2 }).default(sql`0`),
  revenue_generated_cents: integer("revenue_generated_cents").default(0),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_campaigns_status").on(table.status),
  index("idx_campaigns_type").on(table.type),
  index("idx_campaigns_created_at").on(table.created_at),
]);

// ═══════════════════════════════════════════════════════════════════════════
// MARKETING REFERRALS — Referral links, tracking, bonuses
// ═══════════════════════════════════════════════════════════════════════════
export const marketingReferrals = pgTable("marketing_referrals", {
  id: serial("id").primaryKey(),
  referrer_id: varchar("referrer_id", { length: 120 }).notNull(),
  referral_code: varchar("referral_code", { length: 50 }).notNull().unique(),
  referral_link: varchar("referral_link", { length: 2048 }).notNull(),
  
  // Bonus Rules
  bonus_type: varchar("bonus_type", { length: 30 }).default("credits"), // credits, discount_pct, commission_share, account_boost
  bonus_amount_cents: integer("bonus_amount_cents").notNull(),
  bonus_for_referrer: boolean("bonus_for_referrer").default(true),
  bonus_for_referee: boolean("bonus_for_referee").default(true),
  bonus_when: varchar("bonus_when", { length: 30 }).default("signup"), // signup, first_job, first_payment
  
  // Tracking
  total_referrals: integer("total_referrals").default(0),
  successful_referrals: integer("successful_referrals").default(0),
  failed_referrals: integer("failed_referrals").default(0),
  viral_coefficient: numeric("viral_coefficient", { precision: 4, scale: 2 }).default(sql`0`), // k-factor: expected users referred per user
  total_bonus_paid_cents: integer("total_bonus_paid_cents").default(0),
  
  // Status & Expiry
  is_active: boolean("is_active").default(true),
  expires_at: timestamp("expires_at"),
  
  // Africa-specific
  ussd_code: varchar("ussd_code", { length: 30 }), // *120*FREELANCE*REFCODE#
  whatsapp_template: varchar("whatsapp_template", { length: 2048 }),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_referrals_referrer_id").on(table.referrer_id),
  index("idx_referrals_code").on(table.referral_code),
  index("idx_referrals_is_active").on(table.is_active),
]);

// ═══════════════════════════════════════════════════════════════════════════
// REFERRAL EVENTS — Track every referral action
// ═══════════════════════════════════════════════════════════════════════════
export const referralEvents = pgTable("referral_events", {
  id: serial("id").primaryKey(),
  referral_id: integer("referral_id").notNull().references(() => marketingReferrals.id, { onDelete: "cascade" }),
  referee_id: varchar("referee_id", { length: 120 }).notNull(),
  event_type: varchar("event_type", { length: 30 }).notNull(), // clicked, signed_up, verified, completed_first_job, made_payment
  source: varchar("source", { length: 30 }), // direct_link, ussd, whatsapp, email, social
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, failed
  bonus_paid_cents: integer("bonus_paid_cents").default(0),
  bonus_paid_at: timestamp("bonus_paid_at"),
  created_at: timestamp("created_at").default(sql`NOW()`),
}, table => [
  index("idx_referral_events_referral_id").on(table.referral_id),
  index("idx_referral_events_referee_id").on(table.referee_id),
  index("idx_referral_events_type").on(table.event_type),
]);

// ═══════════════════════════════════════════════════════════════════════════
// COUPONS — Discount codes with usage limits and conditions
// ═══════════════════════════════════════════════════════════════════════════
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  
  // Discount
  discount_type: varchar("discount_type", { length: 20 }).notNull(), // percentage, fixed_amount, free_trial_days
  discount_value: numeric("discount_value", { precision: 10, scale: 2 }).notNull(), // % or cents or days
  max_discount_cents: integer("max_discount_cents"), // cap on discount (e.g., 50% off but max R500)
  
  // Usage Limits
  usage_limit_total: integer("usage_limit_total"), // null = unlimited
  usage_limit_per_user: integer("usage_limit_per_user").default(1),
  current_usage: integer("current_usage").default(0),
  
  // Conditions
  min_spend_cents: integer("min_spend_cents"), // minimum purchase to use coupon
  applicable_to: varchar("applicable_to", { length: 100 }), // all, services, jobs, promotions, first_purchase
  target_user_type: varchar("target_user_type", { length: 50 }), // all, new_users, returning, high_value
  country_restrictions: jsonb("country_restrictions").default(sql`'[]'::jsonb`), // [ZA, NG, ...] — empty = all countries
  
  // Status
  is_active: boolean("is_active").default(true),
  starts_at: timestamp("starts_at").default(sql`NOW()`),
  expires_at: timestamp("expires_at"),
  
  // Performance
  total_revenue_cents: integer("total_revenue_cents").default(0),
  redemptions: integer("redemptions").default(0),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_coupons_code").on(table.code),
  index("idx_coupons_is_active").on(table.is_active),
  index("idx_coupons_expires_at").on(table.expires_at),
]);

// ═══════════════════════════════════════════════════════════════════════════
// AFFILIATE PROGRAMS — Affiliate tracking and commission rules
// ═══════════════════════════════════════════════════════════════════════════
export const affiliatePrograms = pgTable("affiliate_programs", {
  id: serial("id").primaryKey(),
  affiliate_id: varchar("affiliate_id", { length: 120 }).notNull().unique(),
  affiliate_name: varchar("affiliate_name", { length: 255 }),
  affiliate_email: varchar("affiliate_email", { length: 255 }),
  affiliate_website: varchar("affiliate_website", { length: 2048 }),
  
  // Commission Rules
  commission_type: varchar("commission_type", { length: 30 }).notNull(), // percentage, fixed_per_referral, tiered
  commission_value: numeric("commission_value", { precision: 10, scale: 2 }).notNull(), // % or cents
  tiered_rates: jsonb("tiered_rates"), // [{ min_referrals: 0, rate: 5 }, { min_referrals: 50, rate: 8 }, ...]
  
  // Tracking
  unique_tracking_id: varchar("unique_tracking_id", { length: 50 }).notNull().unique(),
  total_referrals: integer("total_referrals").default(0),
  total_conversions: integer("total_conversions").default(0),
  conversion_rate: numeric("conversion_rate", { precision: 5, scale: 2 }).default(sql`0`),
  total_commission_earned_cents: integer("total_commission_earned_cents").default(0),
  
  // Payout
  payout_method: varchar("payout_method", { length: 30 }), // bank_transfer, mobile_money, store_credit, check
  payout_account: jsonb("payout_account"), // { bank_name, account_number, swift_code } or { phone_number, provider }
  minimum_payout_cents: integer("minimum_payout_cents").default(50000), // min R500
  last_payout_at: timestamp("last_payout_at"),
  next_payout_at: timestamp("next_payout_at"),
  
  // Status
  is_active: boolean("is_active").default(true),
  approved_at: timestamp("approved_at"),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_affiliate_programs_affiliate_id").on(table.affiliate_id),
  index("idx_affiliate_programs_tracking_id").on(table.unique_tracking_id),
  index("idx_affiliate_programs_is_active").on(table.is_active),
]);

// ═══════════════════════════════════════════════════════════════════════════
// GROWTH METRICS — Analytics for campaigns, referrals, coupons, affiliates
// ═══════════════════════════════════════════════════════════════════════════
export const growthMetrics = pgTable("growth_metrics", {
  id: serial("id").primaryKey(),
  metric_date: date("metric_date").notNull().default(sql`CURRENT_DATE`),
  
  // Campaign Metrics
  campaigns_sent: integer("campaigns_sent").default(0),
  campaign_opens: integer("campaign_opens").default(0),
  campaign_clicks: integer("campaign_clicks").default(0),
  campaign_conversions: integer("campaign_conversions").default(0),
  campaign_revenue_cents: integer("campaign_revenue_cents").default(0),
  
  // Referral Metrics
  new_referrals: integer("new_referrals").default(0),
  referral_signups: integer("referral_signups").default(0),
  referral_conversions: integer("referral_conversions").default(0),
  referral_bonus_paid_cents: integer("referral_bonus_paid_cents").default(0),
  viral_coefficient_avg: numeric("viral_coefficient_avg", { precision: 4, scale: 2 }).default(sql`0`),
  
  // Coupon Metrics
  coupon_redemptions: integer("coupon_redemptions").default(0),
  coupon_discount_value_cents: integer("coupon_discount_value_cents").default(0),
  coupon_revenue_cents: integer("coupon_revenue_cents").default(0),
  
  // Affiliate Metrics
  affiliate_referrals: integer("affiliate_referrals").default(0),
  affiliate_conversions: integer("affiliate_conversions").default(0),
  affiliate_commission_paid_cents: integer("affiliate_commission_paid_cents").default(0),
  
  // Overall Growth
  new_users: integer("new_users").default(0),
  retention_rate: numeric("retention_rate", { precision: 5, scale: 2 }).default(sql`0`),
  churn_rate: numeric("churn_rate", { precision: 5, scale: 2 }).default(sql`0`),
  ltv_avg_cents: integer("ltv_avg_cents").default(0),
  cac_avg_cents: integer("cac_avg_cents").default(0), // customer acquisition cost
  
  created_at: timestamp("created_at").default(sql`NOW()`),
}, table => [
  index("idx_growth_metrics_date").on(table.metric_date),
]);

// ═══════════════════════════════════════════════════════════════════════════
// LOYALTY TIERS — Gamification & badges & escalating bonuses
// ═══════════════════════════════════════════════════════════════════════════
export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 120 }).notNull().unique(),
  
  // Tier Progress
  tier_name: varchar("tier_name", { length: 50 }).default("bronze"), // bronze, silver, gold, platinum, diamond
  tier_points: integer("tier_points").default(0),
  tier_level: integer("tier_level").default(1),
  
  // Badges
  badges: jsonb("badges").default(sql`'[]'::jsonb`), // [{ name: "First referral", icon: "🎯", earned_at: "2026-03-18" }]
  streak_days: integer("streak_days").default(0), // consecutive days active
  
  // Bonuses & Rewards
  bonus_multiplier: numeric("bonus_multiplier", { precision: 3, scale: 2 }).default(sql`1.0`), // 1.0 = no bonus, 1.5 = 50% extra
  referral_bonus_boost_pct: integer("referral_bonus_boost_pct").default(0), // extra % on referral bonuses at higher tiers
  next_tier_points_needed: integer("next_tier_points_needed").default(100),
  
  // Engagement
  referrals_made: integer("referrals_made").default(0),
  campaigns_engaged: integer("campaigns_engaged").default(0),
  coupons_used: integer("coupons_used").default(0),
  total_referral_revenue_cents: integer("total_referral_revenue_cents").default(0),
  
  // Rewards Claimed
  rewards_claimed: integer("rewards_claimed").default(0),
  rewards_value_cents: integer("rewards_value_cents").default(0),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_loyalty_tiers_user_id").on(table.user_id),
  index("idx_loyalty_tiers_tier_name").on(table.tier_name),
]);

// ═══════════════════════════════════════════════════════════════════════════
// PREDICTIVE METRICS — LTV, churn risk, growth forecasts
// ═══════════════════════════════════════════════════════════════════════════
export const predictiveMetrics = pgTable("predictive_metrics", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 120 }).notNull(),
  metric_date: date("metric_date").notNull().default(sql`CURRENT_DATE`),
  
  // LTV Prediction
  predicted_ltv_cents: integer("predicted_ltv_cents").notNull(),
  ltv_confidence: numeric("ltv_confidence", { precision: 5, scale: 2 }), // 0.0-100.0
  ltv_trend: varchar("ltv_trend", { length: 10 }), // up, down, stable
  
  // Churn Risk
  churn_risk_score: numeric("churn_risk_score", { precision: 5, scale: 2 }), // 0.0-100.0
  churn_risk_reason: varchar("churn_risk_reason", { length: 255 }), // "No activity in 30 days", "Low conversion rate"
  
  // Growth Potential
  growth_potential_score: numeric("growth_potential_score", { precision: 5, scale: 2 }), // 0.0-100.0
  recommended_incentives: jsonb("recommended_incentives"), // [{ type: "referral_bonus", value_cents: 5000, reason: "High referrer potential" }]
  
  // Engagement Forecast
  predicted_campaign_open_rate: numeric("predicted_campaign_open_rate", { precision: 5, scale: 2 }),
  predicted_referral_conversion: numeric("predicted_referral_conversion", { precision: 5, scale: 2 }),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
}, table => [
  index("idx_predictive_metrics_user_id").on(table.user_id),
  index("idx_predictive_metrics_date").on(table.metric_date),
  index("idx_predictive_metrics_churn_risk").on(table.churn_risk_score),
]);

export type Campaign = typeof campaigns.$inferSelect;
export type CampaignInsert = typeof campaigns.$inferInsert;
export type MarketingReferral = typeof marketingReferrals.$inferSelect;
export type MarketingReferralInsert = typeof marketingReferrals.$inferInsert;
export type ReferralEvent = typeof referralEvents.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type CouponInsert = typeof coupons.$inferInsert;
export type AffiliateProgram = typeof affiliatePrograms.$inferSelect;
export type GrowthMetric = typeof growthMetrics.$inferSelect;
export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type PredictiveMetric = typeof predictiveMetrics.$inferSelect;
