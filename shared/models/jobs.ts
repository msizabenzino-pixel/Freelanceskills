import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  locationType: text("location_type").notNull(), // "onsite" | "remote"
  location: text("location"), // City/province for onsite
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  budget: integer("budget").notNull(), // in ZAR cents
  status: text("status").notNull().default("open"), // open | hired | in_progress | delivered | completed | cancelled
  clientId: varchar("client_id").notNull().references(() => users.id),
  freelancerId: varchar("freelancer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  freelancerId: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
