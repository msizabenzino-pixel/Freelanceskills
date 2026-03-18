/**
 * TAXONOMY: Category, Subcategory, Skill, Suggestion, Endorsement schemas
 * FreelanceSkills.net — 16th Admin Section
 * Marketplace taxonomy backbone: the knowledge graph that powers matching,
 * search, gig discovery, user profiles, and Academy recommendations.
 */
import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// ─── CATEGORIES (top-level + subcategories via parentId self-reference) ───────
export const taxonomyCategories = pgTable("taxonomy_categories", {
  id:          varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name:        varchar("name", { length: 120 }).notNull(),
  slug:        varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  icon:        varchar("icon", { length: 20 }).default("📁"),
  color:       varchar("color", { length: 10 }).default("#6b7280"),
  parentId:    varchar("parent_id"),                       // null = top-level category
  type:        varchar("type", { length: 20 }).default("category"), // "category" | "subcategory"
  sortOrder:   integer("sort_order").default(0),
  status:      varchar("status", { length: 20 }).default("active"), // "active" | "hidden" | "deprecated"
  // Aggregated stats (refreshed periodically)
  gigCount:    integer("gig_count").default(0),
  jobCount:    integer("job_count").default(0),
  userCount:   integer("user_count").default(0),
  searchCount: integer("search_count").default(0),
  createdBy:   varchar("created_by").references(() => users.id),
  createdAt:   timestamp("created_at").defaultNow(),
  updatedAt:   timestamp("updated_at").defaultNow(),
});

export const insertTaxonomyCategorySchema = createInsertSchema(taxonomyCategories).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertTaxonomyCategory = z.infer<typeof insertTaxonomyCategorySchema>;
export type TaxonomyCategory = typeof taxonomyCategories.$inferSelect;

// ─── SKILLS (atomic capabilities, assigned to categories) ────────────────────
export const taxonomySkills = pgTable("taxonomy_skills", {
  id:                varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name:              varchar("name", { length: 120 }).notNull(),
  slug:              varchar("slug", { length: 120 }).notNull().unique(),
  description:       text("description"),
  categoryId:        varchar("category_id").notNull().references(() => taxonomyCategories.id),
  icon:              varchar("icon", { length: 20 }).default("🔧"),
  status:            varchar("status", { length: 20 }).default("active"),
  // Proficiency levels available for this skill
  proficiencyLevels: jsonb("proficiency_levels").default(["Beginner", "Intermediate", "Expert"]),
  // Trend & usage
  trendScore:        integer("trend_score").default(0),     // 0-100 — how fast-growing
  usageCount:        integer("usage_count").default(0),     // freelancer profiles using this skill
  gigCount:          integer("gig_count").default(0),
  jobCount:          integer("job_count").default(0),
  endorsementCount:  integer("endorsement_count").default(0),
  searchCount:       integer("search_count").default(0),
  // AI metadata
  aiSynonyms:        jsonb("ai_synonyms").default([]),      // ["ReactJS", "React.js"]
  aiRelated:         jsonb("ai_related").default([]),       // related skill IDs
  avgHourlyRate:     integer("avg_hourly_rate").default(0), // ZAR/hour
  isEmerging:        boolean("is_emerging").default(false), // new/fast-growing flag
  createdBy:         varchar("created_by").references(() => users.id),
  createdAt:         timestamp("created_at").defaultNow(),
  updatedAt:         timestamp("updated_at").defaultNow(),
});

export const insertTaxonomySkillSchema = createInsertSchema(taxonomySkills).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertTaxonomySkill = z.infer<typeof insertTaxonomySkillSchema>;
export type TaxonomySkill = typeof taxonomySkills.$inferSelect;

// ─── SKILL SUGGESTIONS (user-submitted + AI-generated) ───────────────────────
export const taxonomySuggestions = pgTable("taxonomy_suggestions", {
  id:               varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type:             varchar("type", { length: 20 }).notNull(), // "category" | "subcategory" | "skill"
  name:             varchar("name", { length: 120 }).notNull(),
  description:      text("description"),
  parentCategoryId: varchar("parent_category_id"),
  suggestedBy:      varchar("suggested_by").references(() => users.id),
  source:           varchar("source", { length: 20 }).default("user"), // "user" | "ai" | "admin"
  reason:           text("reason"),
  evidence:         text("evidence"),                    // e.g., "Used in 230 job posts this month"
  status:           varchar("status", { length: 20 }).default("pending"), // "pending" | "approved" | "rejected" | "duplicate"
  votes:            integer("votes").default(0),
  reviewedBy:       varchar("reviewed_by").references(() => users.id),
  reviewNote:       text("review_note"),
  mergedIntoId:     varchar("merged_into_id"),          // if merged with existing
  createdAt:        timestamp("created_at").defaultNow(),
  reviewedAt:       timestamp("reviewed_at"),
});

export const insertTaxonomySuggestionSchema = createInsertSchema(taxonomySuggestions).omit({
  id: true, createdAt: true, reviewedAt: true,
});
export type InsertTaxonomySuggestion = z.infer<typeof insertTaxonomySuggestionSchema>;
export type TaxonomySuggestion = typeof taxonomySuggestions.$inferSelect;

// ─── SKILL ENDORSEMENTS (client validates freelancer's proficiency) ────────────
export const taxonomySkillEndorsements = pgTable("taxonomy_skill_endorsements", {
  id:           varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  skillId:      varchar("skill_id").notNull().references(() => taxonomySkills.id),
  endorseeId:   varchar("endorsee_id").notNull().references(() => users.id),   // freelancer
  endorserId:   varchar("endorser_id").notNull().references(() => users.id),   // client/admin
  level:        varchar("level", { length: 20 }).notNull(),                    // "Beginner" | "Intermediate" | "Expert"
  note:         text("note"),
  orderId:      varchar("order_id"),   // endorsed after completing an order
  createdAt:    timestamp("created_at").defaultNow(),
});

export const insertTaxonomySkillEndorsementSchema = createInsertSchema(taxonomySkillEndorsements).omit({
  id: true, createdAt: true,
});
export type InsertTaxonomySkillEndorsement = z.infer<typeof insertTaxonomySkillEndorsementSchema>;
export type TaxonomySkillEndorsement = typeof taxonomySkillEndorsements.$inferSelect;
