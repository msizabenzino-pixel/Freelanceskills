/**
 * Academy Schema — FreelanceSkills.net
 *
 * HOW WE BEAT THE COMPETITION:
 * ✦ FIVERR: Static learning paths → Real-time earnings-lift data per course (before/after cert)
 * ✦ UPWORK: Skill badges only → Dynamic level upgrades (New → Rising → Pro → Top Rated) backed by data
 * ✦ LINKEDIN LEARNING: Generic content → Africa-first skill demand forecasting (2026-2028)
 * ✦ COURSERA FOR BUSINESS: Disconnected from freelance outcomes → Direct correlation: cert → job win rate
 * ✦ UDEMY: No marketplace integration → Auto-matches certified freelancers to new job postings
 *
 * AFRICA-FIRST DESIGN:
 * - ZAR earnings-lift (total R value unlocked per certification cohort)
 * - DTIC-ready impact export (job creation + skills uplift metrics)
 * - SA provincial skill demand heatmap
 * - Township economy freelancers tracked separately for govt reporting
 */
import { pgTable, serial, text, integer, boolean, timestamp, real, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

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
  // Extended for Academy Admin
  status: text("status").notNull().default("live"),          // live | draft | archived
  skillsTaught: text("skills_taught"),                       // JSON array of skill tags
  earningsLiftPct: integer("earnings_lift_pct").default(0),  // avg % earnings increase post-cert
  averageRating: real("average_rating").default(0),          // 0.0–5.0
  enrolmentCount: integer("enrolment_count").default(0),     // denormalized for speed
  completionRate: real("completion_rate").default(0),        // 0–100%
  isFeatured: boolean("is_featured").default(false),
  aiRecommendation: text("ai_recommendation"),               // AI-generated "why take this course"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // markdown
  orderIndex: integer("order_index").notNull(),
  type: text("type").notNull(), // video, text, quiz
  videoUrl: text("video_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseProgress = pgTable(
  "course_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    unique("uq_course_progress_user_lesson").on(table.userId, table.lessonId),
    index("idx_course_progress_user").on(table.userId),
    index("idx_course_progress_course").on(table.courseId),
  ]
);

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  certificateCode: text("certificate_code").unique().notNull(),
  // Extended for admin management
  status: text("status").default("approved"),  // pending | approved | rejected
  approvedBy: text("approved_by"),
  rejectedReason: text("rejected_reason"),
  earningsBeforeCents: integer("earnings_before_cents").default(0),
  earningsAfterCents: integer("earnings_after_cents").default(0),
  jobWinsBeforeCert: integer("job_wins_before_cert").default(0),
  jobWinsAfterCert: integer("job_wins_after_cert").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * SkillDemandForecast — Africa-first skill demand engine
 * Beats LinkedIn Learning by tying demand to actual SA job posting data
 */
export const skillDemandForecasts = pgTable("skill_demand_forecasts", {
  id: serial("id").primaryKey(),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(),
  demandScore: integer("demand_score").notNull().default(50),       // 0–100
  growthRate: real("growth_rate").notNull().default(0),             // % YoY
  forecastYear: integer("forecast_year").notNull().default(2026),
  province: text("province"),                                       // null = national
  jobPostingCount: integer("job_posting_count").default(0),
  averageBudgetCents: integer("average_budget_cents").default(0),   // avg job budget in ZAR cents
  gapScore: integer("gap_score").default(0),                        // demand - supply gap (0–100)
  hasCourse: boolean("has_course").default(false),
  suggestedCourseTitle: text("suggested_course_title"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * AcademyEnrolment — tracks per-user course enrolments (separate from lesson-level progress)
 */
export const academyEnrolments = pgTable(
  "academy_enrolments",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    enroledAt: timestamp("enroled_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    progressPct: real("progress_pct").default(0),                  // 0–100
    streakDays: integer("streak_days").default(0),
    lastActiveAt: timestamp("last_active_at").defaultNow(),
  },
  (table) => [
    unique("uq_academy_enrolments_user_course").on(table.userId, table.courseId),
    index("idx_academy_enrolments_user").on(table.userId),
    index("idx_academy_enrolments_course").on(table.courseId),
  ]
);

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });
export const insertCourseProgressSchema = createInsertSchema(courseProgress).omit({ id: true });
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true });
export const insertSkillDemandForecastSchema = createInsertSchema(skillDemandForecasts).omit({ id: true });
export const insertAcademyEnrolmentSchema = createInsertSchema(academyEnrolments).omit({ id: true });

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type CourseProgress = typeof courseProgress.$inferSelect;
export type InsertCourseProgress = z.infer<typeof insertCourseProgressSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type SkillDemandForecast = typeof skillDemandForecasts.$inferSelect;
export type InsertSkillDemandForecast = z.infer<typeof insertSkillDemandForecastSchema>;
export type AcademyEnrolment = typeof academyEnrolments.$inferSelect;
export type InsertAcademyEnrolment = z.infer<typeof insertAcademyEnrolmentSchema>;

export const COURSE_CATEGORIES = [
  "Digital Marketing", "Web Development", "Graphic Design", "Data Analytics",
  "AI & Machine Learning", "Accounting & Finance", "Project Management",
  "Copywriting", "Video & Animation", "Business Development",
  "Photography", "Translation & Languages", "Legal Services", "Architecture",
] as const;

export const SA_SKILL_DEMAND = [
  { skill: "AI Prompt Engineering",   demand: 94, growth: 340, gap: 87 },
  { skill: "React / Next.js",         demand: 89, growth: 82,  gap: 71 },
  { skill: "Data Analytics (Python)", demand: 87, growth: 95,  gap: 68 },
  { skill: "Blockchain Dev",          demand: 82, growth: 210, gap: 79 },
  { skill: "UI/UX Design",            demand: 81, growth: 67,  gap: 54 },
  { skill: "Digital Marketing",       demand: 78, growth: 55,  gap: 43 },
  { skill: "Copywriting (AI-Assist)", demand: 75, growth: 88,  gap: 61 },
  { skill: "Cloud Architecture",      demand: 74, growth: 110, gap: 70 },
  { skill: "Mobile Dev (React Native)",demand: 72, growth: 74, gap: 60 },
  { skill: "Video Editing",           demand: 70, growth: 52,  gap: 35 },
] as const;
