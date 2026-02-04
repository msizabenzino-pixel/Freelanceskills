import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  userType: text("user_type").notNull().default("client"), // "client" | "freelancer" | "both"
  bio: text("bio"),
  title: text("title"), // Job title for freelancers
  skills: text("skills").array(), // Array of skills
  hourlyRate: integer("hourly_rate"), // in ZAR cents
  location: text("location"), // City/Province
  isPro: boolean("is_pro").notNull().default(false),
  rating: integer("rating").default(0), // 0-5 scale * 100 (e.g., 450 = 4.5 stars)
  completedJobs: integer("completed_jobs").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  completedJobs: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
