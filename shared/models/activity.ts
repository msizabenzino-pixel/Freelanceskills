import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Activity tracking (Command 15) ────────────────────────────────────────────
// Loosely-coupled analytics tables (no FK constraints) so fire-and-forget
// tracking can never crash a request on a missing/late reference. sessionId is
// used for anonymous users and merged into userId on login.

export const gigViews = pgTable(
  "gig_views",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    gigId: varchar("gig_id").notNull(),
    sellerId: varchar("seller_id"),
    category: text("category"),
    userId: varchar("user_id"),
    sessionId: varchar("session_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("idx_gig_views_gig").on(t.gigId),
    index("idx_gig_views_seller").on(t.sellerId),
    index("idx_gig_views_user").on(t.userId),
    index("idx_gig_views_session").on(t.sessionId),
    index("idx_gig_views_created").on(t.createdAt),
  ]
);

export const searchLog = pgTable(
  "search_log",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    query: text("query"),
    category: text("category"),
    resultsCount: integer("results_count").default(0),
    userId: varchar("user_id"),
    sessionId: varchar("session_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("idx_search_log_user").on(t.userId),
    index("idx_search_log_session").on(t.sessionId),
    index("idx_search_log_created").on(t.createdAt),
  ]
);

export const savedGigs = pgTable(
  "saved_gigs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    gigId: varchar("gig_id").notNull(),
    userId: varchar("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("uq_saved_gigs_user_gig").on(t.userId, t.gigId),
    index("idx_saved_gigs_user").on(t.userId),
  ]
);

export const categoryViews = pgTable(
  "category_views",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    category: text("category").notNull(),
    subcategory: text("subcategory"),
    userId: varchar("user_id"),
    sessionId: varchar("session_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("idx_category_views_user").on(t.userId),
    index("idx_category_views_session").on(t.sessionId),
    index("idx_category_views_created").on(t.createdAt),
  ]
);

export const insertGigViewSchema = createInsertSchema(gigViews).omit({ id: true, createdAt: true });
export const insertSearchLogSchema = createInsertSchema(searchLog).omit({ id: true, createdAt: true });
export const insertSavedGigSchema = createInsertSchema(savedGigs).omit({ id: true, createdAt: true });
export const insertCategoryViewSchema = createInsertSchema(categoryViews).omit({ id: true, createdAt: true });

export type GigView = typeof gigViews.$inferSelect;
export type InsertGigView = z.infer<typeof insertGigViewSchema>;
export type SearchLog = typeof searchLog.$inferSelect;
export type InsertSearchLog = z.infer<typeof insertSearchLogSchema>;
export type SavedGig = typeof savedGigs.$inferSelect;
export type InsertSavedGig = z.infer<typeof insertSavedGigSchema>;
export type CategoryView = typeof categoryViews.$inferSelect;
export type InsertCategoryView = z.infer<typeof insertCategoryViewSchema>;
