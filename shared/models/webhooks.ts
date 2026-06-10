import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    source: varchar("source", { length: 50 }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
    payload: text("payload"),
    status: varchar("status", { length: 20 }).notNull().default("processed"),
    errorMessage: text("error_message"),
    processedAt: timestamp("processed_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique("uq_webhook_events_idempotency").on(table.source, table.idempotencyKey),
    index("idx_webhook_events_source").on(table.source),
    index("idx_webhook_events_created").on(table.createdAt),
  ]
);

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  processedAt: true,
  createdAt: true,
});
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
