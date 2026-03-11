import { pgTable, text, integer, timestamp, varchar, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const abTests = pgTable("ab_tests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  testName: varchar("test_name").notNull(),
  variant: varchar("variant").notNull(),
  userId: varchar("user_id"),
  sessionId: varchar("session_id"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAbTestSchema = createInsertSchema(abTests).omit({ id: true, createdAt: true });
export type AbTest = typeof abTests.$inferSelect;
export type InsertAbTest = z.infer<typeof insertAbTestSchema>;

export const trackingPixels = pgTable("tracking_pixels", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pixelType: varchar("pixel_type").notNull(),
  eventName: varchar("event_name").notNull(),
  userId: varchar("user_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrackingPixelSchema = createInsertSchema(trackingPixels).omit({ id: true, createdAt: true });
export type TrackingPixel = typeof trackingPixels.$inferSelect;
export type InsertTrackingPixel = z.infer<typeof insertTrackingPixelSchema>;

export const discountCodes = pgTable("discount_codes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code").notNull(),
  type: varchar("type").notNull().default("percentage"),
  value: integer("value").notNull(),
  maxUses: integer("max_uses").notNull().default(100),
  currentUses: integer("current_uses").notNull().default(0),
  affiliateId: varchar("affiliate_id"),
  stripeCouponId: varchar("stripe_coupon_id"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({ id: true, createdAt: true });
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export const badges = pgTable("badges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  badgeType: varchar("badge_type").notNull(),
  badgeName: varchar("badge_name").notNull(),
  badgeIcon: varchar("badge_icon").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, earnedAt: true });
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export const flashSales = pgTable("flash_sales", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  originalPrice: integer("original_price").notNull(),
  salePrice: integer("sale_price").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  maxRedemptions: integer("max_redemptions").notNull().default(100),
  currentRedemptions: integer("current_redemptions").notNull().default(0),
  targetAudience: varchar("target_audience").notNull().default("new_freelancers"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFlashSaleSchema = createInsertSchema(flashSales).omit({ id: true, createdAt: true });
export type FlashSale = typeof flashSales.$inferSelect;
export type InsertFlashSale = z.infer<typeof insertFlashSaleSchema>;

export const affiliates = pgTable("affiliates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  affiliateCode: varchar("affiliate_code").notNull(),
  commissionRate: real("commission_rate").notNull().default(15),
  totalEarnings: integer("total_earnings").notNull().default(0),
  totalReferrals: integer("total_referrals").notNull().default(0),
  payoutMethod: varchar("payout_method").default("eft"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({ id: true, createdAt: true });
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;

export const churnEvents = pgTable("churn_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull(),
  eventType: varchar("event_type").notNull(),
  daysSinceLastActivity: integer("days_since_last_activity"),
  emailSent: boolean("email_sent").notNull().default(false),
  creditOffered: integer("credit_offered").default(0),
  reactivated: boolean("reactivated").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChurnEventSchema = createInsertSchema(churnEvents).omit({ id: true, createdAt: true });
export type ChurnEvent = typeof churnEvents.$inferSelect;
export type InsertChurnEvent = z.infer<typeof insertChurnEventSchema>;
