import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Freelancer Verification Status
export const freelancerVerifications = pgTable("freelancer_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  freelancerId: text("freelancer_id").notNull(),
  
  // Identity Verification
  identityVerified: boolean("identity_verified").default(false),
  identityDocType: text("identity_doc_type"), // 'sa_id', 'passport', 'drivers_license'
  identityVerifiedAt: timestamp("identity_verified_at"),
  
  // Qualification Verification
  qualificationsVerified: boolean("qualifications_verified").default(false),
  qualificationDocs: text("qualification_docs").array(), // URLs to uploaded certificates
  qualificationVerifiedAt: timestamp("qualification_verified_at"),
  qualificationNotes: text("qualification_notes"),
  
  // Experience Verification
  experienceVerified: boolean("experience_verified").default(false),
  claimedYearsExperience: integer("claimed_years_experience"),
  verifiedYearsExperience: integer("verified_years_experience"),
  experienceVerifiedAt: timestamp("experience_verified_at"),
  referenceContacts: text("reference_contacts").array(), // Previous employer contacts
  
  // Professional Body Registration (for trades)
  professionalBodyVerified: boolean("professional_body_verified").default(false),
  professionalBodyName: text("professional_body_name"), // e.g., 'PIRB', 'SACPCMP', 'ECSA'
  registrationNumber: text("registration_number"),
  registrationExpiry: timestamp("registration_expiry"),
  
  // Background Check
  backgroundCheckCompleted: boolean("background_check_completed").default(false),
  backgroundCheckDate: timestamp("background_check_date"),
  backgroundCheckResult: text("background_check_result"), // 'clear', 'flagged', 'pending'
  
  // Skills Assessment
  skillsAssessmentCompleted: boolean("skills_assessment_completed").default(false),
  skillsAssessmentScore: integer("skills_assessment_score"), // 0-100
  skillsAssessmentDate: timestamp("skills_assessment_date"),
  
  // Customer Handling Assessment
  customerHandlingScore: integer("customer_handling_score"), // 0-100 based on reviews
  responseTimeAvg: integer("response_time_avg"), // in minutes
  completionRate: integer("completion_rate"), // percentage
  disputeRate: integer("dispute_rate"), // percentage
  
  // Overall Verification Level
  verificationLevel: text("verification_level").default("unverified"), // 'unverified', 'basic', 'verified', 'pro_verified', 'elite'
  verificationScore: integer("verification_score").default(0), // 0-100
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Private Feedback (Fiverr-style double testimonial)
export const privateFeedback = pgTable("private_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: text("booking_id").notNull(),
  reviewerId: text("reviewer_id").notNull(),
  revieweeId: text("reviewee_id").notNull(),
  
  // Private ratings (not shown publicly)
  privateRating: integer("private_rating").notNull(), // 1-5
  wouldRecommend: boolean("would_recommend"),
  wouldHireAgain: boolean("would_hire_again"),
  
  // Specific private feedback
  communicationRating: integer("communication_rating"), // 1-5
  professionalismRating: integer("professionalism_rating"), // 1-5
  qualityRating: integer("quality_rating"), // 1-5
  valueRating: integer("value_rating"), // 1-5
  
  // Open feedback (only seen by platform, not the other party)
  privateComments: text("private_comments"),
  concernsRaised: text("concerns_raised").array(),
  
  // Flags for platform review
  flaggedForReview: boolean("flagged_for_review").default(false),
  flagReason: text("flag_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Skill Verification Tests
export const skillTests = pgTable("skill_tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: text("category").notNull(), // 'plumbing', 'electrical', 'safety', etc.
  title: text("title").notNull(),
  description: text("description"),
  questions: text("questions").array(), // JSON array of questions
  passingScore: integer("passing_score").default(70),
  timeLimit: integer("time_limit").default(30), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Freelancer Test Results
export const testResults = pgTable("test_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  freelancerId: text("freelancer_id").notNull(),
  testId: uuid("test_id").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  answers: text("answers").array(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Types
export type FreelancerVerification = typeof freelancerVerifications.$inferSelect;
export type InsertFreelancerVerification = z.infer<typeof insertVerificationSchema>;
export type PrivateFeedback = typeof privateFeedback.$inferSelect;
export type InsertPrivateFeedback = z.infer<typeof insertPrivateFeedbackSchema>;

// Schemas
export const insertVerificationSchema = createInsertSchema(freelancerVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrivateFeedbackSchema = createInsertSchema(privateFeedback).omit({
  id: true,
  createdAt: true,
});

// Verification level thresholds
export const VERIFICATION_LEVELS = {
  unverified: { minScore: 0, label: "Unverified", color: "gray" },
  basic: { minScore: 20, label: "Basic Verified", color: "blue" },
  verified: { minScore: 50, label: "Verified", color: "green" },
  pro_verified: { minScore: 75, label: "Pro Verified", color: "amber" },
  elite: { minScore: 90, label: "Elite", color: "purple" },
};

// Professional bodies in South Africa
export const SA_PROFESSIONAL_BODIES = [
  { code: "PIRB", name: "Plumbing Industry Registration Board", trades: ["plumbing"] },
  { code: "ECSA", name: "Engineering Council of South Africa", trades: ["electrical", "engineering"] },
  { code: "SACPCMP", name: "SA Council for Project & Construction Management Professions", trades: ["construction", "safety"] },
  { code: "CIDB", name: "Construction Industry Development Board", trades: ["construction", "building"] },
  { code: "NHBRC", name: "National Home Builders Registration Council", trades: ["building", "construction"] },
  { code: "SAICA", name: "SA Institute of Chartered Accountants", trades: ["accounting", "finance"] },
  { code: "LSSA", name: "Law Society of South Africa", trades: ["legal"] },
  { code: "HPCSA", name: "Health Professions Council of SA", trades: ["healthcare"] },
];

// Concern categories for private feedback
export const CONCERN_CATEGORIES = [
  "arrived_late",
  "left_early", 
  "poor_communication",
  "unprofessional_behavior",
  "work_quality_issues",
  "overcharged",
  "asked_for_cash",
  "tried_to_take_offline",
  "misrepresented_skills",
  "safety_concerns",
  "property_damage",
  "no_show",
];
