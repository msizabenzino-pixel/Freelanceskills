import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  duration: text("duration").notNull(), // e.g. "2 hours"
  totalLessons: integer("total_lessons").notNull(),
  imageUrl: text("image_url"),
  isFree: boolean("is_free").default(true).notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // markdown
  orderIndex: integer("order_index").notNull(),
  type: text("type").notNull(), // video, text, quiz
  videoUrl: text("video_url"),
});

export const courseProgress = pgTable("course_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  certificateCode: text("certificate_code").unique().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export const insertCourseProgressSchema = createInsertSchema(courseProgress).omit({ id: true });
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true });

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type CourseProgress = typeof courseProgress.$inferSelect;
export type InsertCourseProgress = z.infer<typeof insertCourseProgressSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
