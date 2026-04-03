import { sql } from "drizzle-orm";
import {
  pgTable, varchar, text, timestamp, integer, boolean, jsonb, index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// ─── VETTING RECORDS ───────────────────────────────────────────────────────────
// One row per user — the master vetting status record
export const vettingRecords = pgTable(
  "vetting_records",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),

    // Tier progression: 0 = Basic, 1 = Identity+Skills, 2 = Education+Deep, 3 = Elite
    tier: integer("tier").notNull().default(0),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    // "pending" | "in_progress" | "tier1_complete" | "tier2_complete" | "elite" | "suspended"

    // Step completion flags
    consentGiven: boolean("consent_given").default(false),
    consentGivenAt: timestamp("consent_given_at"),
    identityVerified: boolean("identity_verified").default(false),
    identityVerifiedAt: timestamp("identity_verified_at"),
    educationVerified: boolean("education_verified").default(false),
    educationVerifiedAt: timestamp("education_verified_at"),
    skillsVerified: boolean("skills_verified").default(false),
    skillsVerifiedAt: timestamp("skills_verified_at"),
    backgroundChecked: boolean("background_checked").default(false),
    backgroundCheckedAt: timestamp("background_checked_at"),

    // Scores (0-100)
    identityScore: integer("identity_score").default(0),
    skillsScore: integer("skills_score").default(0),
    educationScore: integer("education_score").default(0),
    overallScore: integer("overall_score").default(0),

    // Blockchain / trust hash
    blockchainHash: varchar("blockchain_hash", { length: 128 }),
    blockchainMintedAt: timestamp("blockchain_minted_at"),

    // AI risk flag
    fraudRiskFlag: boolean("fraud_risk_flag").default(false),
    fraudRiskReason: text("fraud_risk_reason"),

    // Lebo AI progress nudges (last state)
    leborLastMessage: text("lebo_last_message"),
    leborLanguage: varchar("lebo_language", { length: 20 }).default("en"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("vetting_records_user_idx").on(t.userId),
    tierIdx: index("vetting_records_tier_idx").on(t.tier),
  })
);

// ─── VETTING DOCUMENTS ─────────────────────────────────────────────────────────
export const vettingDocuments = pgTable(
  "vetting_documents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),

    // Document classification
    type: varchar("type", { length: 60 }).notNull(),
    // "sa_id" | "passport" | "selfie_liveness" | "degree" | "diploma" | "trade_cert"
    // "professional_body_reg" | "background_clearance" | "portfolio"

    // File metadata
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    fileSizeBytes: integer("file_size_bytes"),

    // OCR / AI extraction result
    ocrExtracted: jsonb("ocr_extracted"),
    // e.g. { "id_number": "...", "name": "...", "dob": "...", "expiry": "..." }

    // Verification status
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    // "pending" | "ai_passed" | "manual_review" | "approved" | "rejected"
    reviewedBy: varchar("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),

    // Hashed document ID (for privacy — POPIA)
    hashedId: varchar("hashed_id", { length: 128 }),

    uploadedAt: timestamp("uploaded_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("vetting_docs_user_idx").on(t.userId),
    typeIdx: index("vetting_docs_type_idx").on(t.type),
  })
);

// ─── SKILL ASSESSMENTS ─────────────────────────────────────────────────────────
export const vettingSkillAssessments = pgTable(
  "vetting_skill_assessments",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),

    // What was tested
    testType: varchar("test_type", { length: 80 }).notNull(),
    // e.g. "react_frontend", "python_backend", "plumbing_trade", "digital_marketing"
    skillCategory: varchar("skill_category", { length: 80 }),
    difficultyLevel: varchar("difficulty_level", { length: 20 }).default("intermediate"),
    // "beginner" | "intermediate" | "advanced" | "expert"

    // Scores
    rawScore: integer("raw_score"),
    percentileScore: integer("percentile_score"), // vs SA freelancer pool
    passThreshold: integer("pass_threshold").default(70),
    passed: boolean("passed").default(false),

    // Proctoring metadata (anti-cheat)
    proctorData: jsonb("proctor_data"),
    // { "tab_switches": 0, "face_detected": true, "ai_flag": false, "time_ms": 1800000 }
    proctorFlagged: boolean("proctor_flag").default(false),
    proctorFlagReason: text("proctor_flag_reason"),

    // Portfolio AI analysis
    portfolioAnalysis: jsonb("portfolio_analysis"),
    // { "quality_score": 82, "relevance_score": 76, "originality_flag": true }

    // Adaptive test engine
    questionsServed: integer("questions_served"),
    questionIds: jsonb("question_ids"),

    // Attempt tracking
    attemptNumber: integer("attempt_number").default(1),
    nextAttemptAllowedAt: timestamp("next_attempt_allowed_at"),

    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("vetting_skills_user_idx").on(t.userId),
    typeIdx: index("vetting_skills_type_idx").on(t.testType),
  })
);

// ─── REFERENCES ────────────────────────────────────────────────────────────────
export const vettingReferences = pgTable(
  "vetting_references",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),

    // Reference contact details
    refName: varchar("ref_name", { length: 120 }).notNull(),
    refTitle: varchar("ref_title", { length: 120 }),
    refCompany: varchar("ref_company", { length: 120 }),
    refEmail: varchar("ref_email", { length: 255 }),
    refPhone: varchar("ref_phone", { length: 30 }),
    refRelationship: varchar("ref_relationship", { length: 60 }),
    // "manager" | "client" | "colleague" | "professor" | "mentor"

    // Automated outreach
    outreachSentAt: timestamp("outreach_sent_at"),
    reminderSentAt: timestamp("reminder_sent_at"),
    responseReceivedAt: timestamp("response_received_at"),

    // Verification outcome
    verifiedStatus: varchar("verified_status", { length: 30 }).default("pending"),
    // "pending" | "responded" | "verified" | "declined" | "bounced"
    verifiedScore: integer("verified_score"), // 0-100 from reference response
    referenceNotes: text("reference_notes"),
    responseData: jsonb("response_data"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("vetting_refs_user_idx").on(t.userId),
  })
);

// ─── VETTING AUDIT LOGS (POPIA Compliance) ────────────────────────────────────
export const vettingAuditLogs = pgTable(
  "vetting_audit_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    actorId: varchar("actor_id").references(() => users.id),
    // Who triggered this (may equal userId for self-actions, or admin id)

    // Action details
    action: varchar("action", { length: 100 }).notNull(),
    // e.g. "consent_given", "document_uploaded", "identity_verified",
    //      "skill_test_started", "tier_upgraded", "data_deleted"
    category: varchar("category", { length: 50 }),
    // "consent" | "identity" | "education" | "skills" | "background" | "admin" | "popia"

    // Rich details
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),

    // POPIA data retention marker
    retentionExpiresAt: timestamp("retention_expires_at"),

    timestamp: timestamp("timestamp").defaultNow(),
  },
  (t) => ({
    userIdx: index("vetting_audit_user_idx").on(t.userId),
    actionIdx: index("vetting_audit_action_idx").on(t.action),
    tsIdx: index("vetting_audit_ts_idx").on(t.timestamp),
  })
);

// ─── VETTING CONSENTS (POPIA) ─────────────────────────────────────────────────
export const vettingConsents = pgTable(
  "vetting_consents",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),

    consentVersion: varchar("consent_version", { length: 20 }).notNull().default("v1.0"),
    consentText: text("consent_text").notNull(),

    // What was consented to
    consentedToIdentityCheck: boolean("consented_to_identity").default(false),
    consentedToEducationCheck: boolean("consented_to_education").default(false),
    consentedToSkillsAssessment: boolean("consented_to_skills").default(false),
    consentedToBackgroundCheck: boolean("consented_to_background").default(false),
    consentedToDataRetention: boolean("consented_to_retention").default(false),
    consentedToThirdParty: boolean("consented_to_third_party").default(false),

    // Capture proof
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    givenAt: timestamp("given_at").defaultNow(),

    // Withdrawal
    withdrawn: boolean("withdrawn").default(false),
    withdrawnAt: timestamp("withdrawn_at"),
    withdrawnReason: text("withdrawn_reason"),
  },
  (t) => ({
    userIdx: index("vetting_consents_user_idx").on(t.userId),
  })
);

// ─── INSERT SCHEMAS ────────────────────────────────────────────────────────────
export const insertVettingRecordSchema = createInsertSchema(vettingRecords).omit({
  id: true, createdAt: true, updatedAt: true
});
export const insertVettingDocumentSchema = createInsertSchema(vettingDocuments).omit({
  id: true, uploadedAt: true, reviewedAt: true
});
export const insertVettingSkillAssessmentSchema = createInsertSchema(vettingSkillAssessments).omit({
  id: true, createdAt: true
});
export const insertVettingReferenceSchema = createInsertSchema(vettingReferences).omit({
  id: true, createdAt: true
});
export const insertVettingAuditLogSchema = createInsertSchema(vettingAuditLogs).omit({
  id: true, timestamp: true
});
export const insertVettingConsentSchema = createInsertSchema(vettingConsents).omit({
  id: true, givenAt: true
});

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type VettingRecord = typeof vettingRecords.$inferSelect;
export type InsertVettingRecord = z.infer<typeof insertVettingRecordSchema>;
export type VettingDocument = typeof vettingDocuments.$inferSelect;
export type InsertVettingDocument = z.infer<typeof insertVettingDocumentSchema>;
export type VettingSkillAssessment = typeof vettingSkillAssessments.$inferSelect;
export type InsertVettingSkillAssessment = z.infer<typeof insertVettingSkillAssessmentSchema>;
export type VettingReference = typeof vettingReferences.$inferSelect;
export type InsertVettingReference = z.infer<typeof insertVettingReferenceSchema>;
export type VettingAuditLog = typeof vettingAuditLogs.$inferSelect;
export type InsertVettingAuditLog = z.infer<typeof insertVettingAuditLogSchema>;
export type VettingConsent = typeof vettingConsents.$inferSelect;
export type InsertVettingConsent = z.infer<typeof insertVettingConsentSchema>;
