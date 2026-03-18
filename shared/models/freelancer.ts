import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const freelancerProfiles = pgTable("freelancer_profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  level: text("level").notNull().default("new"),
  commissionRate: integer("commission_rate").notNull().default(1000),
  commissionAutoRule: text("commission_auto_rule").default("flat"),
  isFeatured: boolean("is_featured").notNull().default(false),
  featuredAt: timestamp("featured_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  aiPortfolioScore: integer("ai_portfolio_score").default(50),
  responseTimeHours: integer("response_time_hours").default(24),
  availability: text("availability").notNull().default("available"),
  availableDays: text("available_days").array(),
  nextAvailableDate: timestamp("next_available_date"),
  portfolioUrls: text("portfolio_urls").array(),
  languages: text("languages").array(),
  yearsExperience: integer("years_experience").default(0),
  earningsLiftPct: integer("earnings_lift_pct").default(0),
  totalEarningsCents: integer("total_earnings_cents").notNull().default(0),
  monthlyAvgEarningsCents: integer("monthly_avg_earnings_cents").notNull().default(0),
  proposalSuccessCount: integer("proposal_success_count").default(0),
  gigPackagesJson: text("gig_packages_json"),
  verificationStagesJson: text("verification_stages_json"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFreelancerProfileSchema = createInsertSchema(freelancerProfiles).omit({
  updatedAt: true,
});

export type FreelancerProfile = typeof freelancerProfiles.$inferSelect;
export type InsertFreelancerProfile = z.infer<typeof insertFreelancerProfileSchema>;

export const FREELANCER_LEVELS = ["new", "rising", "level1", "level2", "top_rated"] as const;
export type FreelancerLevel = typeof FREELANCER_LEVELS[number];

export const LEVEL_LABELS: Record<FreelancerLevel, string> = {
  new: "New", rising: "Rising Talent", level1: "Level 1", level2: "Level 2", top_rated: "Top Rated",
};

export const LEVEL_COLORS: Record<FreelancerLevel, string> = {
  new: "#6b7280", rising: "#3b82f6", level1: "#8b5cf6", level2: "#f59e0b", top_rated: "#1DBF73",
};

/** Dynamic commission by level — beats Fiverr flat 20%, Upwork 5-20% tiered */
export const LEVEL_AUTO_COMMISSION: Record<FreelancerLevel, number> = {
  new: 1200, rising: 1100, level1: 1000, level2: 900, top_rated: 800,
};
