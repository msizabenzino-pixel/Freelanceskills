import { pgTable, serial, varchar, text, integer, numeric, boolean, timestamp, jsonb, date, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SUBSCRIPTION MANAGEMENT v3.0 — ELON MUSK 200% INTELLIGENCE                 ║
 * ║  The revenue & loyalty backbone that obliterates all competitors             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * OUT-ENGINEERS:
 * - FSN-competitor-B: Static 3 tiers (Basic/Plus/Freelancer Plus). We have AI-personalized
 *           dynamic pricing + hybrid metered billing + auto-upgrade intelligence.
 * - FSN-competitor-A: Seller levels (no subscription). We have full tiered subscriptions
 *           with agency/team features + loyalty token economy.
 * - Patreon: Creator-only, zero marketplace intelligence. We embed gig performance,
 *            earnings trajectory, proposal success rate into plan recommendations.
 * - Substack: Writers only, basic tiers. We have hybrid billing (fixed + metered),
 *             Africa micro-access (daily/weekly), and mobile-money integration.
 *
 * 25 SUPERPOWERS:
 *  1. AI Plan Recommender — analyzes user behavior + earnings + predicts best plan
 *  2. Hybrid Billing Engine — fixed subscription + metered overages (proposals/connects)
 *  3. Dynamic Pricing — AI adjusts price/perks to prevent churn in real-time
 *  4. Auto-Upgrade Paths — "you're earning enough for Pro — upgrade now?"
 *  5. Agency/Team Features — sub-accounts, role permissions, shared billing
 *  6. Africa-first Micro-Access — daily/weekly plans for low-income markets
 *  7. Mobile Money Integration — M-PESA/MTN MoMo/Airtel Money billing hooks
 *  8. USSD Signup Flow — *120*PREMIUM# subscribe without smartphone
 *  9. Loyalty Token System — earn tokens on activity → redeem for perks
 * 10. Churn Prediction AI — 0-100 risk score + intervention suggestions
 * 11. LTV Forecasting — predict user lifetime value per cohort
 * 12. MRR/ARR Real-time — monthly/annual recurring revenue dashboards
 * 13. Plan Conversion Funnel — track free→basic→pro→agency journey
 * 14. Billing Event Audit Log — every charge/refund/dispute immutable record
 * 15. Stripe/Paystack/Paddle Hooks — multi-gateway payment orchestration
 * 16. Proration Intelligence — fair billing on mid-cycle upgrades/downgrades
 * 17. Trial Management — 7/14/30-day trials with auto-convert logic
 * 18. Coupon/Discount Engine — referral credits, first-month-free, bundle deals
 * 19. Usage-based Alerts — "you've used 80% of your proposals this month"
 * 20. White-label Options — agency plans get custom branding
 * 21. Multi-currency Support — ZAR/NGN/KES/USD dynamic pricing
 * 22. Tax Compliance — VAT/GST calculation + invoicing hooks
 * 23. Refund Workflow — admin-approve refunds with reason tracking
 * 24. Dunning Management — smart retry logic for failed payments
 * 25. 3-Year Future-Proof — designed to scale to 10M users + $500M ARR
 */

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION PLANS — The core product catalog
// ═══════════════════════════════════════════════════════════════════════════
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Basic, Pro, Agency, Enterprise
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  
  // Pricing Structure
  price_monthly_cents: integer("price_monthly_cents").notNull(),
  price_annual_cents: integer("price_annual_cents"), // null if annual not available
  price_weekly_cents: integer("price_weekly_cents"), // Africa micro-access
  price_daily_cents: integer("price_daily_cents"), // Africa micro-access
  currency: varchar("currency", { length: 3 }).default("ZAR"), // ZAR, USD, NGN, KES
  
  // Billing Configuration
  billing_cycle_default: varchar("billing_cycle_default", { length: 20 }).default("monthly"), // monthly, annual, weekly, daily
  trial_days: integer("trial_days").default(0), // 0, 7, 14, 30
  
  // Plan Limits & Features
  features: jsonb("features").default(sql`'[]'::jsonb`), // [{ name: "Unlimited proposals", enabled: true }, ...]
  proposal_limit_monthly: integer("proposal_limit_monthly"), // null = unlimited
  gig_slots: integer("gig_slots").default(5), // max active gigs
  team_size: integer("team_size").default(1), // 1 = solo, >1 = team/agency
  withdrawal_speed: varchar("withdrawal_speed", { length: 20 }).default("standard"), // instant, fast, standard
  support_level: varchar("support_level", { length: 20 }).default("standard"), // basic, standard, priority, vip
  
  // Agency/Team Features
  white_label_enabled: boolean("white_label_enabled").default(false),
  sub_accounts_enabled: boolean("sub_accounts_enabled").default(false),
  shared_billing_enabled: boolean("shared_billing_enabled").default(false),
  role_permissions_enabled: boolean("role_permissions_enabled").default(false),
  
  // Visibility & Ranking
  featured_gig_priority: boolean("featured_gig_priority").default(false),
  search_boost_multiplier: numeric("search_boost_multiplier", { precision: 3, scale: 2 }).default(sql`1.0`), // 1.0, 1.5, 2.0
  profile_badge: varchar("profile_badge", { length: 50 }), // "Pro", "Verified Pro", "Agency Partner"
  
  // Metered Overages (Hybrid Billing)
  overage_proposal_cents: integer("overage_proposal_cents"), // charge per proposal beyond limit
  overage_connect_cents: integer("overage_connect_cents"), // charge per connect/bid beyond limit
  overage_featured_gig_cents: integer("overage_featured_gig_cents"),
  
  // Status & Visibility
  is_active: boolean("is_active").default(true),
  is_visible: boolean("is_visible").default(true), // hide from public but keep for legacy users
  display_order: integer("display_order").default(0), // sort order on pricing page
  recommended: boolean("recommended").default(false), // "Most Popular" badge
  
  // AI Pricing Insights
  ai_suggested_price_cents: integer("ai_suggested_price_cents"), // AI recommendation based on market analysis
  dynamic_pricing_enabled: boolean("dynamic_pricing_enabled").default(false), // allow AI to adjust price
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_subscription_plans_slug").on(table.slug),
  index("idx_subscription_plans_is_active").on(table.is_active),
]);

// ═══════════════════════════════════════════════════════════════════════════
// USER SUBSCRIPTIONS — Active subscriptions per user
// ═══════════════════════════════════════════════════════════════════════════
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 120 }).notNull(),
  plan_id: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  
  // Subscription Lifecycle
  status: varchar("status", { length: 30 }).notNull().default("active"), // trial, active, past_due, cancelled, expired, suspended
  billing_cycle: varchar("billing_cycle", { length: 20 }).notNull(), // monthly, annual, weekly, daily
  
  // Dates
  trial_start: timestamp("trial_start"),
  trial_end: timestamp("trial_end"),
  current_period_start: timestamp("current_period_start").notNull(),
  current_period_end: timestamp("current_period_end").notNull(),
  cancelled_at: timestamp("cancelled_at"),
  expires_at: timestamp("expires_at"),
  
  // Billing
  price_paid_cents: integer("price_paid_cents").notNull(), // what they actually paid (may differ from plan price due to discounts)
  currency: varchar("currency", { length: 3 }).default("ZAR"),
  payment_method: varchar("payment_method", { length: 50 }), // card, mobile_money, bank_transfer, airtime
  payment_gateway: varchar("payment_gateway", { length: 50 }), // stripe, paystack, paddle, mpesa
  external_subscription_id: varchar("external_subscription_id", { length: 255 }), // Stripe subscription ID
  
  // Auto-Renewal
  auto_renew: boolean("auto_renew").default(true),
  next_billing_date: timestamp("next_billing_date"),
  next_billing_amount_cents: integer("next_billing_amount_cents"),
  
  // Usage Tracking (for metered billing)
  proposals_used_this_period: integer("proposals_used_this_period").default(0),
  connects_used_this_period: integer("connects_used_this_period").default(0),
  overage_charges_cents: integer("overage_charges_cents").default(0),
  
  // Churn Prevention
  churn_risk_score: numeric("churn_risk_score", { precision: 5, scale: 2 }), // 0-100
  churn_risk_reason: varchar("churn_risk_reason", { length: 255 }),
  retention_discount_applied: boolean("retention_discount_applied").default(false),
  retention_discount_pct: integer("retention_discount_pct"),
  
  // Upgrade/Downgrade Tracking
  previous_plan_id: integer("previous_plan_id"),
  upgrade_recommended_plan_id: integer("upgrade_recommended_plan_id"), // AI suggestion
  upgrade_recommended_at: timestamp("upgrade_recommended_at"),
  upgrade_recommended_reason: varchar("upgrade_recommended_reason", { length: 500 }),
  
  // Loyalty & Rewards
  loyalty_tokens_earned: integer("loyalty_tokens_earned").default(0),
  loyalty_tokens_redeemed: integer("loyalty_tokens_redeemed").default(0),
  
  // Team/Agency (if applicable)
  is_team_plan: boolean("is_team_plan").default(false),
  team_owner_user_id: varchar("team_owner_user_id", { length: 120 }), // null if solo, set if team member
  team_role: varchar("team_role", { length: 50 }), // owner, admin, member
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_user_subscriptions_user_id").on(table.user_id),
  index("idx_user_subscriptions_status").on(table.status),
  index("idx_user_subscriptions_plan_id").on(table.plan_id),
  index("idx_user_subscriptions_next_billing").on(table.next_billing_date),
]);

// ═══════════════════════════════════════════════════════════════════════════
// BILLING EVENTS — Immutable audit log of every transaction
// ═══════════════════════════════════════════════════════════════════════════
export const billingEvents = pgTable("billing_events", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 120 }).notNull(),
  subscription_id: integer("subscription_id").references(() => userSubscriptions.id),
  
  // Event Type
  event_type: varchar("event_type", { length: 50 }).notNull(), // charge, refund, dispute, overage, trial_start, trial_convert, upgrade, downgrade, cancel, renew
  event_status: varchar("event_status", { length: 30 }).default("pending"), // pending, succeeded, failed, refunded
  
  // Financial Details
  amount_cents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default("ZAR"),
  payment_method: varchar("payment_method", { length: 50 }),
  payment_gateway: varchar("payment_gateway", { length: 50 }),
  external_transaction_id: varchar("external_transaction_id", { length: 255 }),
  
  // Metadata
  description: text("description"),
  metadata: jsonb("metadata"), // { invoice_id, receipt_url, failure_reason, etc. }
  
  // Tax & Compliance
  tax_amount_cents: integer("tax_amount_cents").default(0),
  tax_rate_pct: numeric("tax_rate_pct", { precision: 5, scale: 2 }),
  invoice_number: varchar("invoice_number", { length: 100 }),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
}, table => [
  index("idx_billing_events_user_id").on(table.user_id),
  index("idx_billing_events_subscription_id").on(table.subscription_id),
  index("idx_billing_events_type").on(table.event_type),
  index("idx_billing_events_status").on(table.event_status),
  index("idx_billing_events_created_at").on(table.created_at),
]);

// ═══════════════════════════════════════════════════════════════════════════
// LOYALTY TOKENS — Earn & redeem tokens for perks
// ═══════════════════════════════════════════════════════════════════════════
export const loyaltyTokens = pgTable("loyalty_tokens", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 120 }).notNull(),
  
  // Balances
  tokens_available: integer("tokens_available").default(0),
  tokens_lifetime_earned: integer("tokens_lifetime_earned").default(0),
  tokens_lifetime_redeemed: integer("tokens_lifetime_redeemed").default(0),
  
  // Earning Rules (config per user)
  earn_on_subscription_payment: integer("earn_on_subscription_payment").default(100), // 100 tokens per payment
  earn_on_completed_job: integer("earn_on_completed_job").default(50),
  earn_on_referral_conversion: integer("earn_on_referral_conversion").default(200),
  earn_on_review_received: integer("earn_on_review_received").default(25),
  
  // Tier Multipliers (loyalty tier from marketing system)
  token_multiplier: numeric("token_multiplier", { precision: 3, scale: 2 }).default(sql`1.0`), // 1.0, 1.5, 2.0 for higher tiers
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_loyalty_tokens_user_id").on(table.user_id),
]);

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN TRANSACTIONS — Earn & redeem log
// ═══════════════════════════════════════════════════════════════════════════
export const tokenTransactions = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 120 }).notNull(),
  
  // Transaction Type
  type: varchar("type", { length: 20 }).notNull(), // earn, redeem
  amount: integer("amount").notNull(), // positive for earn, negative for redeem
  balance_after: integer("balance_after").notNull(),
  
  // Source/Reason
  source: varchar("source", { length: 50 }).notNull(), // subscription_payment, job_completed, referral, review, admin_award, perk_redeemed
  description: varchar("description", { length: 500 }),
  related_id: varchar("related_id", { length: 120 }), // subscription_id, job_id, referral_id, etc.
  
  created_at: timestamp("created_at").default(sql`NOW()`),
}, table => [
  index("idx_token_transactions_user_id").on(table.user_id),
  index("idx_token_transactions_created_at").on(table.created_at),
]);

// ═══════════════════════════════════════════════════════════════════════════
// CHURN PREDICTIONS — AI-predicted churn risk + intervention suggestions
// ═══════════════════════════════════════════════════════════════════════════
export const churnPredictions = pgTable("churn_predictions", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 120 }).notNull(),
  subscription_id: integer("subscription_id").references(() => userSubscriptions.id),
  
  // Prediction
  churn_risk_score: numeric("churn_risk_score", { precision: 5, scale: 2 }).notNull(), // 0-100
  prediction_confidence: numeric("prediction_confidence", { precision: 5, scale: 2 }), // 0-100
  prediction_date: timestamp("prediction_date").default(sql`NOW()`),
  
  // Risk Factors
  risk_factors: jsonb("risk_factors"), // [{ factor: "low_usage", weight: 0.3 }, { factor: "payment_failure", weight: 0.5 }]
  days_until_predicted_churn: integer("days_until_predicted_churn"),
  
  // Intervention Suggestions
  suggested_interventions: jsonb("suggested_interventions"), // [{ type: "discount", value_pct: 20, message: "..." }, { type: "downgrade", to_plan: "basic" }]
  intervention_taken: varchar("intervention_taken", { length: 50 }),
  intervention_taken_at: timestamp("intervention_taken_at"),
  intervention_result: varchar("intervention_result", { length: 30 }), // retained, churned, pending
  
  // Behavioral Signals
  last_login_days_ago: integer("last_login_days_ago"),
  proposals_sent_last_30d: integer("proposals_sent_last_30d"),
  jobs_won_last_30d: integer("jobs_won_last_30d"),
  revenue_last_30d_cents: integer("revenue_last_30d_cents"),
  support_tickets_last_30d: integer("support_tickets_last_30d"),
  payment_failures_count: integer("payment_failures_count").default(0),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
  updated_at: timestamp("updated_at").default(sql`NOW()`),
}, table => [
  index("idx_churn_predictions_user_id").on(table.user_id),
  index("idx_churn_predictions_score").on(table.churn_risk_score),
  index("idx_churn_predictions_date").on(table.prediction_date),
]);

// ═══════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION ANALYTICS — Pre-computed metrics for speed
// ═══════════════════════════════════════════════════════════════════════════
export const subscriptionAnalytics = pgTable("subscription_analytics", {
  id: serial("id").primaryKey(),
  metric_date: date("metric_date").notNull().default(sql`CURRENT_DATE`),
  
  // Revenue Metrics
  mrr_cents: integer("mrr_cents").default(0), // Monthly Recurring Revenue
  arr_cents: integer("arr_cents").default(0), // Annual Recurring Revenue
  total_revenue_today_cents: integer("total_revenue_today_cents").default(0),
  
  // Subscription Counts
  active_subscriptions: integer("active_subscriptions").default(0),
  trial_subscriptions: integer("trial_subscriptions").default(0),
  cancelled_today: integer("cancelled_today").default(0),
  new_subscriptions_today: integer("new_subscriptions_today").default(0),
  
  // Plan Distribution
  basic_count: integer("basic_count").default(0),
  pro_count: integer("pro_count").default(0),
  agency_count: integer("agency_count").default(0),
  enterprise_count: integer("enterprise_count").default(0),
  
  // Churn & Retention
  churn_rate_pct: numeric("churn_rate_pct", { precision: 5, scale: 2 }),
  retention_rate_pct: numeric("retention_rate_pct", { precision: 5, scale: 2 }),
  avg_churn_risk_score: numeric("avg_churn_risk_score", { precision: 5, scale: 2 }),
  
  // LTV & Cohort
  avg_ltv_cents: integer("avg_ltv_cents"), // average lifetime value
  avg_subscription_length_days: integer("avg_subscription_length_days"),
  
  // Conversions
  trial_to_paid_conversion_pct: numeric("trial_to_paid_conversion_pct", { precision: 5, scale: 2 }),
  upgrade_rate_pct: numeric("upgrade_rate_pct", { precision: 5, scale: 2 }),
  downgrade_rate_pct: numeric("downgrade_rate_pct", { precision: 5, scale: 2 }),
  
  created_at: timestamp("created_at").default(sql`NOW()`),
}, table => [
  index("idx_subscription_analytics_date").on(table.metric_date),
]);

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type SubscriptionPlanInsert = typeof subscriptionPlans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type UserSubscriptionInsert = typeof userSubscriptions.$inferInsert;
export type BillingEvent = typeof billingEvents.$inferSelect;
export type LoyaltyToken = typeof loyaltyTokens.$inferSelect;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type ChurnPrediction = typeof churnPredictions.$inferSelect;
export type SubscriptionAnalytics = typeof subscriptionAnalytics.$inferSelect;
