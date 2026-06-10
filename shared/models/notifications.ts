import { pgTable, serial, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // "job_match" | "message" | "payment" | "system" | "application_status"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  link: varchar("link"),
});

/**
 * Notification types that always bypass the daily cap (currently 10/day).
 * These are transactional — silently dropping them causes real user harm
 * (e.g. a freelancer misses an interview invite or a payment confirmation).
 */
export const HIGH_PRIORITY_NOTIFICATION_TYPES: ReadonlySet<string> = new Set([
  "application_status", // interview invites, offers, shortlists, rejections
  "payment",            // escrow releases, payouts, refunds
]);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
