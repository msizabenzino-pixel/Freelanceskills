/**
 * Gig Marketplace Schema — FreelanceSkills.net Revenue Engine
 *
 * Tables:
 * - gigs: Core gig listings with AI scores + Academy correlation
 * - gigPackages: Basic/Standard/Premium pricing tiers
 * - gigAnalytics: Predictive orders, earnings, demand forecasts
 */

import { pgTable, varchar, text, integer, decimal, timestamp, boolean, jsonb, serial, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { profiles } from "./profiles";
import { courseEnrolments } from "./academy";

// ─────────────────────────────────────────────────────────────────────
// GIGS TABLE
// ─────────────────────────────────────────────────────────────────────
export const gigs = pgTable(
  "gigs",
  {
    id: varchar("id").primaryKey().default(() => `gig_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`),
    freelancerId: varchar("freelancer_id").notNull().references(() => profiles.userId),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(), // e.g., "Web Dev", "Data Science", "UI/UX"
    skills: jsonb("skills").default([]), // ["React", "TypeScript", "Tailwind"]
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    ratingBreakdown: jsonb("rating_breakdown").default({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }), // {5: 120, 4: 30, 3: 5, 2: 1, 1: 0}
    ordersLifetime: integer("orders_lifetime").default(0),
    ordersThisMonth: integer("orders_this_month").default(0),
    deliveryTimeHours: integer("delivery_time_hours").notNull(), // Base delivery time
    ruralAdjustmentPercent: integer("rural_adjustment_percent").default(0), // +10%, +20% for rural areas
    status: varchar("status", { length: 50 }).default("draft"), // draft, pending_approval, active, paused, suspended
    featured: boolean("featured").default(false),
    featuredUntil: timestamp("featured_until"),
    aiIntelligenceScore: integer("ai_intelligence_score").default(0), // 0-100: predictive earnings + completion probability
    aiCompletionProbability: decimal("ai_completion_probability", { precision: 3, scale: 2 }).default("0.00"), // 0.00-1.00
    academyCorrelationMultiplier: decimal("academy_correlation_multiplier", { precision: 5, scale: 2 }).default("1.00"), // 1.5x, 2.0x, etc.
    predictedMonthlyOrders: integer("predicted_monthly_orders").default(0),
    predictedMonthlyEarningsZAR: decimal("predicted_monthly_earnings_zar", { precision: 10, scale: 2 }).default("0.00"),
    approvedBy: varchar("approved_by", { length: 255 }), // Admin user ID who approved
    rejectionReason: text("rejection_reason"),
    zarInflationAdjustment: decimal("zar_inflation_adjustment", { precision: 5, scale: 2 }).default("1.00"), // 1.05 = 5% increase
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_gigs_freelancer").on(table.freelancerId),
    index("idx_gigs_status").on(table.status),
    index("idx_gigs_category").on(table.category),
    index("idx_gigs_rating").on(table.rating),
  ]
);

// ─────────────────────────────────────────────────────────────────────
// GIG PACKAGES TABLE (Basic/Standard/Premium pricing tiers)
// ─────────────────────────────────────────────────────────────────────
export const gigPackages = pgTable(
  "gig_packages",
  {
    id: serial("id").primaryKey(),
    gigId: varchar("gig_id").notNull().references(() => gigs.id),
    tier: varchar("tier", { length: 20 }).notNull(), // "basic", "standard", "premium"
    priceZAR: decimal("price_zar", { precision: 10, scale: 2 }).notNull(),
    deliveryDays: integer("delivery_days").notNull(),
    revisions: integer("revisions").notNull(),
    features: jsonb("features").default([]), // ["Source files", "Revisions included", "24h support"]
    aiSuggestedPrice: decimal("ai_suggested_price", { precision: 10, scale: 2 }), // AI recommendation based on demand + history
    demand: varchar("demand", { length: 20 }).default("medium"), // "low", "medium", "high", "very_high"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_packages_gig").on(table.gigId)]
);

// ─────────────────────────────────────────────────────────────────────
// GIG ANALYTICS TABLE (Predictive demand, earnings, order forecasts)
// ─────────────────────────────────────────────────────────────────────
export const gigAnalytics = pgTable(
  "gig_analytics",
  {
    id: serial("id").primaryKey(),
    gigId: varchar("gig_id").notNull().references(() => gigs.id),
    dayOfMonth: integer("day_of_month").notNull(),
    predictedOrdersNext30: integer("predicted_orders_next30").default(0),
    predictedEarningsZARNext30: decimal("predicted_earnings_zar_next30", { precision: 10, scale: 2 }).default("0.00"),
    completionRate: decimal("completion_rate", { precision: 3, scale: 2 }).default("0.95"), // 0.00-1.00
    academyCertBonus: jsonb("academy_cert_bonus").default({}), // {"Web Dev Cert": 1.35, "AI Data Scientist": 1.50}
    demandTrendPercent: integer("demand_trend_percent").default(0), // +15%, -5%, etc.
    competitorCount: integer("competitor_count").default(0),
    marketShareEstimate: decimal("market_share_estimate", { precision: 3, scale: 2 }).default("0.00"),
    ruralDemandPercent: integer("rural_demand_percent").default(0), // 30% of orders from rural areas
    zarExchangeRate: decimal("zar_exchange_rate", { precision: 5, scale: 2 }).default("18.00"), // ZAR/USD
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_analytics_gig").on(table.gigId)]
);

// ─────────────────────────────────────────────────────────────────────
// SCHEMAS & TYPES
// ─────────────────────────────────────────────────────────────────────

export const gigInsertSchema = createInsertSchema(gigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const gigPackageInsertSchema = createInsertSchema(gigPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Gig = typeof gigs.$inferSelect;
export type GigInsert = z.infer<typeof gigInsertSchema>;
export type GigPackage = typeof gigPackages.$inferSelect;
export type GigPackageInsert = z.infer<typeof gigPackageInsertSchema>;
export type GigAnalytics = typeof gigAnalytics.$inferSelect;
