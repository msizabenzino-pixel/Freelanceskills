/**
 * CMS Management — shared/models/cms.ts
 * Section 25 — FreelanceSkills.net
 * Tables: cmsPages, cmsPageVersions, cmsBlocks, cmsMedia
 */
import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// ─── CMS Pages ────────────────────────────────────────────────────────────────
export const cmsPages = pgTable("cms_pages", {
  id:              varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug:            varchar("slug", { length: 200 }).notNull().unique(),
  title:           varchar("title", { length: 300 }).notNull(),
  pageType:        varchar("page_type", { length: 60 }).notNull().default("custom"),
  // page types: homepage | about | terms | privacy | faq | help | blog | careers | landing | footer | custom
  status:          varchar("status", { length: 20 }).notNull().default("draft"),
  // status: draft | published | scheduled | archived
  content:         jsonb("content").default([]),
  // array of section objects: { id, type, order, data: {...} }
  metadata:        jsonb("metadata").default({}),
  seoTitle:        varchar("seo_title", { length: 300 }),
  seoDescription:  text("seo_description"),
  seoKeywords:     text("seo_keywords"),
  ogImage:         varchar("og_image", { length: 500 }),
  language:        varchar("language", { length: 10 }).notNull().default("en"),
  isABTest:        boolean("is_ab_test").default(false),
  abVariant:       varchar("ab_variant", { length: 2 }),         // "A" | "B"
  abParentId:      varchar("ab_parent_id"),                       // parent page ID for B variant
  scheduledAt:     timestamp("scheduled_at"),
  publishedAt:     timestamp("published_at"),
  authorId:        varchar("author_id").references(() => users.id),
  lastEditedBy:    varchar("last_edited_by").references(() => users.id),
  viewCount:       integer("view_count").default(0),
  wordCount:       integer("word_count").default(0),
  readingTimeMins: integer("reading_time_mins").default(1),
  // Africa-first fields
  ussdVersion:     text("ussd_version"),                          // plain-text USSD fallback
  translations:    jsonb("translations").default({}),             // { zu: {...}, xh: {...}, ... }
  createdAt:       timestamp("created_at").defaultNow(),
  updatedAt:       timestamp("updated_at").defaultNow(),
  deletedAt:       timestamp("deleted_at"),
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;

// ─── CMS Page Versions (immutable history) ───────────────────────────────────
export const cmsPageVersions = pgTable("cms_page_versions", {
  id:          varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId:      varchar("page_id").notNull().references(() => cmsPages.id),
  version:     integer("version").notNull().default(1),
  title:       varchar("title", { length: 300 }),
  content:     jsonb("content").default([]),
  metadata:    jsonb("metadata").default({}),
  seoTitle:    varchar("seo_title", { length: 300 }),
  seoDescription: text("seo_description"),
  status:      varchar("status", { length: 20 }),
  changedBy:   varchar("changed_by").references(() => users.id),
  changeNote:  text("change_note"),
  diffSummary: text("diff_summary"),
  createdAt:   timestamp("created_at").defaultNow(),
});

export const insertCmsPageVersionSchema = createInsertSchema(cmsPageVersions).omit({ id: true, createdAt: true });
export type InsertCmsPageVersion = z.infer<typeof insertCmsPageVersionSchema>;
export type CmsPageVersion = typeof cmsPageVersions.$inferSelect;

// ─── CMS Component Library (reusable blocks) ─────────────────────────────────
export const cmsBlocks = pgTable("cms_blocks", {
  id:         varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name:       varchar("name", { length: 200 }).notNull(),
  category:   varchar("category", { length: 80 }).notNull().default("content"),
  // categories: hero | content | cta | testimonials | faq | pricing | footer | africa | media | trust
  blockType:  varchar("block_type", { length: 80 }).notNull(),
  description: text("description"),
  content:    jsonb("content").default({}),
  defaultData: jsonb("default_data").default({}),
  previewImg: varchar("preview_img", { length: 500 }),
  isGlobal:   boolean("is_global").default(false),
  isBuiltIn:  boolean("is_built_in").default(false),
  usageCount: integer("usage_count").default(0),
  tags:       text("tags").array(),
  createdBy:  varchar("created_by").references(() => users.id),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
});

export const insertCmsBlockSchema = createInsertSchema(cmsBlocks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCmsBlock = z.infer<typeof insertCmsBlockSchema>;
export type CmsBlock = typeof cmsBlocks.$inferSelect;

// ─── CMS Media Library ────────────────────────────────────────────────────────
export const cmsMedia = pgTable("cms_media", {
  id:         varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename:   varchar("filename", { length: 300 }).notNull(),
  url:        varchar("url", { length: 800 }).notNull(),
  mimeType:   varchar("mime_type", { length: 100 }),
  sizeBytes:  integer("size_bytes"),
  altText:    varchar("alt_text", { length: 300 }),
  caption:    text("caption"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  usageCount: integer("usage_count").default(0),
  tags:       text("tags").array(),
  createdAt:  timestamp("created_at").defaultNow(),
});

export const insertCmsMediaSchema = createInsertSchema(cmsMedia).omit({ id: true, createdAt: true });
export type InsertCmsMedia = z.infer<typeof insertCmsMediaSchema>;
export type CmsMedia = typeof cmsMedia.$inferSelect;
