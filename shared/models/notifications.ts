import { pgTable, serial, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { notificationTypeEnum } from "./enums";

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    link: varchar("link"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_notifications_user_read").on(table.userId, table.isRead),
    index("idx_notifications_user").on(table.userId),
  ]
);

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
  updatedAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
