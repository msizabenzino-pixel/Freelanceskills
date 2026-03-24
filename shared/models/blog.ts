import { pgTable, serial, text, boolean, integer, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("emerald"),
  icon: varchar("icon", { length: 50 }),
  postCount: integer("post_count").default(0),
});

export const blogAuthors = pgTable("blog_authors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio"),
  avatar: text("avatar"),
  role: varchar("role", { length: 100 }),
  linkedinUrl: text("linkedin_url"),
  twitterHandle: varchar("twitter_handle", { length: 100 }),
  postCount: integer("post_count").default(0),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  coverImageAlt: text("cover_image_alt"),
  categoryId: integer("category_id"),
  authorId: integer("author_id"),
  tags: text("tags").array().default([]),
  targetKeywords: text("target_keywords").array().default([]),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  readingTimeMinutes: integer("reading_time_minutes").default(5),
  viewCount: integer("view_count").default(0),
  status: varchar("status", { length: 20 }).default("published"),
  isFeatured: boolean("is_featured").default(false),
  linkedCourseIds: integer("linked_course_ids").array().default([]),
  linkedJobCategories: text("linked_job_categories").array().default([]),
  relatedPostIds: integer("related_post_ids").array().default([]),
  structuredData: jsonb("structured_data"),
  publishedAt: timestamp("published_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories);
export const insertBlogAuthorSchema = createInsertSchema(blogAuthors);
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true });

export type BlogCategory = typeof blogCategories.$inferSelect;
export type BlogAuthor = typeof blogAuthors.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
