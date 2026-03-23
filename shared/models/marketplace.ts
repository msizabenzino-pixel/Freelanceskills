import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { jobs } from "./jobs";

// ── BIDS ─────────────────────────────────────────────────────────────────────
export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  freelancerId: varchar("freelancer_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in ZAR cents
  message: text("message"), // cover letter / bid message
  estimatedDelivery: integer("estimated_delivery").notNull(), // days
  status: text("status").notNull().default("pending"), // pending | accepted | rejected | withdrawn
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBidSchema = createInsertSchema(bids, {
  amount: z.number().int().min(100, "Bid must be at least R1.00"),
  estimatedDelivery: z.number().int().min(1, "Delivery time must be at least 1 day").max(365),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;

// ── REVIEWS & RATINGS ────────────────────────────────────────────────────────
export const bidReviews = pgTable("bid_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  tags: text("tags").array().default([]), // e.g., ["professional", "responsive", "quality"]
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBidReviewSchema = createInsertSchema(bidReviews, {
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(100),
  comment: z.string().min(10).max(2000),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertBidReview = z.infer<typeof insertBidReviewSchema>;
export type BidReview = typeof bidReviews.$inferSelect;

// ── JOB ESCROW TRANSACTIONS ──────────────────────────────────────────────────
export const jobEscrow = pgTable("job_escrow", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  bidId: varchar("bid_id").notNull().references(() => bids.id),
  amount: integer("amount").notNull(), // in ZAR cents
  status: text("status").notNull().default("held"), // held | released | refunded
  releasedAt: timestamp("released_at"),
  milestone: integer("milestone").default(1), // milestone number
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobEscrowSchema = createInsertSchema(jobEscrow, {
  amount: z.number().int().min(100),
  milestone: z.number().int().min(1).default(1),
}).omit({
  id: true,
  createdAt: true,
  releasedAt: true,
  status: true,
});

export type InsertJobEscrow = z.infer<typeof insertJobEscrowSchema>;
export type JobEscrow = typeof jobEscrow.$inferSelect;

// ── FREELANCER SKILLS (for matching) ──────────────────────────────────────────
export const freelancerSkills = pgTable("freelancer_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  freelancerId: varchar("freelancer_id").notNull().references(() => users.id),
  skill: text("skill").notNull(),
  proficiency: text("proficiency").notNull().default("intermediate"), // beginner | intermediate | expert
  yearsExperience: integer("years_experience").default(1),
  verified: boolean("verified").default(false),
  endorsements: integer("endorsements").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSkillSchema = createInsertSchema(freelancerSkills, {
  skill: z.string().min(2).max(100),
  proficiency: z.enum(["beginner", "intermediate", "expert"]),
  yearsExperience: z.number().int().min(0).max(100),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type FreelancerSkill = typeof freelancerSkills.$inferSelect;
