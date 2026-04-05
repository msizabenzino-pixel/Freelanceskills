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

export const insertJobSchema = createInsertSchema(jobs, {
  budget: z.number().int().min(100, "Budget must be at least R1.00 (100 cents)"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  freelancerId: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export const aggregatedJobs = pgTable("aggregated_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: text("location").notNull(),
  province: text("province").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryPeriod: text("salary_period").default("month"),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  category: text("category").notNull(),
  jobType: text("job_type").notNull().default("full-time"),
  experienceLevel: text("experience_level"),
  postedDate: timestamp("posted_date").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  // AI Intelligence fields
  aiScore: integer("ai_score").default(75),
  skills: text("skills"),
  isUrgent: boolean("is_urgent").default(false),
  applicationCount: integer("application_count").default(0),
  viewCount: integer("view_count").default(0),
  upgradeCount: integer("upgrade_count").default(0),
  isRemote: boolean("is_remote").default(false),
  companySize: text("company_size"),
  beeLevel: text("bee_level"),
  agentGenerated: boolean("agent_generated").default(false),
});

export const insertAggregatedJobSchema = createInsertSchema(aggregatedJobs).omit({
  id: true,
  createdAt: true,
});

export type InsertAggregatedJob = z.infer<typeof insertAggregatedJobSchema>;
export type AggregatedJob = typeof aggregatedJobs.$inferSelect;

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: varchar("job_id"),
  aggregatedJobId: varchar("aggregated_job_id"),
  jobTitle: text("job_title").notNull(),
  company: text("company"),
  coverLetter: text("cover_letter"),
  resumeSummary: text("resume_summary"),
  status: text("status").notNull().default("applied"),
  source: text("source"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
  status: true,
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape"
] as const;

export const JOB_SOURCES = [
  "PNet", 
  "CareerJunction", 
  "LinkedIn", 
  "Indeed SA", 
  "Careers24", 
  "Gumtree Jobs",
  "Mr Price Jobs", 
  "Government Vacancies", 
  "Bizcommunity",
  "OfferZen",
  "BestJobs",
  "JobMail"
] as const;

export const OPPORTUNITY_TYPES = [
  "job", "apprenticeship", "bursary", "learnership", "internship", "graduate-programme"
] as const;
