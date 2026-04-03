/**
 * Creates the FreelanceSkills Nuclear Vetting System tables.
 * Run with: npx tsx script/create-vetting-tables.ts
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createVettingTables() {
  console.log("🔐 FreelanceSkills Nuclear Vetting — Creating tables...\n");

  // ── vetting_records ─────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vetting_records (
      id               VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tier             INTEGER NOT NULL DEFAULT 0,
      status           VARCHAR(30) NOT NULL DEFAULT 'pending',

      consent_given    BOOLEAN DEFAULT FALSE,
      consent_given_at TIMESTAMP,

      identity_verified    BOOLEAN DEFAULT FALSE,
      identity_verified_at TIMESTAMP,
      education_verified   BOOLEAN DEFAULT FALSE,
      education_verified_at TIMESTAMP,
      skills_verified      BOOLEAN DEFAULT FALSE,
      skills_verified_at   TIMESTAMP,
      background_checked   BOOLEAN DEFAULT FALSE,
      background_checked_at TIMESTAMP,

      identity_score  INTEGER DEFAULT 0,
      skills_score    INTEGER DEFAULT 0,
      education_score INTEGER DEFAULT 0,
      overall_score   INTEGER DEFAULT 0,

      blockchain_hash      VARCHAR(128),
      blockchain_minted_at TIMESTAMP,

      fraud_risk_flag   BOOLEAN DEFAULT FALSE,
      fraud_risk_reason TEXT,

      lebo_last_message TEXT,
      lebo_language     VARCHAR(20) DEFAULT 'en',

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS vetting_records_user_unique ON vetting_records(user_id);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_records_tier_idx ON vetting_records(tier);`);
  console.log("  ✅ vetting_records");

  // ── vetting_documents ────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vetting_documents (
      id              VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type            VARCHAR(60) NOT NULL,
      file_name       VARCHAR(255) NOT NULL,
      file_path       VARCHAR(500) NOT NULL,
      mime_type       VARCHAR(100),
      file_size_bytes INTEGER,
      ocr_extracted   JSONB,
      status          VARCHAR(30) NOT NULL DEFAULT 'pending',
      reviewed_by     VARCHAR REFERENCES users(id),
      reviewed_at     TIMESTAMP,
      review_notes    TEXT,
      hashed_id       VARCHAR(128),
      uploaded_at     TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_docs_user_idx ON vetting_documents(user_id);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_docs_type_idx ON vetting_documents(type);`);
  console.log("  ✅ vetting_documents");

  // ── vetting_skill_assessments ─────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vetting_skill_assessments (
      id                       VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id                  VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      test_type                VARCHAR(80) NOT NULL,
      skill_category           VARCHAR(80),
      difficulty_level         VARCHAR(20) DEFAULT 'intermediate',
      raw_score                INTEGER,
      percentile_score         INTEGER,
      pass_threshold           INTEGER DEFAULT 70,
      passed                   BOOLEAN DEFAULT FALSE,
      proctor_data             JSONB,
      proctor_flag             BOOLEAN DEFAULT FALSE,
      proctor_flag_reason      TEXT,
      portfolio_analysis       JSONB,
      questions_served         INTEGER,
      question_ids             JSONB,
      attempt_number           INTEGER DEFAULT 1,
      next_attempt_allowed_at  TIMESTAMP,
      completed_at             TIMESTAMP,
      created_at               TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_skills_user_idx ON vetting_skill_assessments(user_id);`);
  console.log("  ✅ vetting_skill_assessments");

  // ── vetting_references ────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vetting_references (
      id                   VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id              VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ref_name             VARCHAR(120) NOT NULL,
      ref_title            VARCHAR(120),
      ref_company          VARCHAR(120),
      ref_email            VARCHAR(255),
      ref_phone            VARCHAR(30),
      ref_relationship     VARCHAR(60),
      outreach_sent_at     TIMESTAMP,
      reminder_sent_at     TIMESTAMP,
      response_received_at TIMESTAMP,
      verified_status      VARCHAR(30) DEFAULT 'pending',
      verified_score       INTEGER,
      reference_notes      TEXT,
      response_data        JSONB,
      created_at           TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_refs_user_idx ON vetting_references(user_id);`);
  console.log("  ✅ vetting_references");

  // ── vetting_audit_logs ───────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vetting_audit_logs (
      id                   VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id              VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_id             VARCHAR REFERENCES users(id),
      action               VARCHAR(100) NOT NULL,
      category             VARCHAR(50),
      details              JSONB,
      ip_address           VARCHAR(50),
      user_agent           TEXT,
      retention_expires_at TIMESTAMP,
      timestamp            TIMESTAMP DEFAULT NOW()
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_audit_user_idx ON vetting_audit_logs(user_id);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_audit_action_idx ON vetting_audit_logs(action);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_audit_ts_idx ON vetting_audit_logs(timestamp);`);
  console.log("  ✅ vetting_audit_logs");

  // ── vetting_consents ─────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vetting_consents (
      id                         VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id                    VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      consent_version            VARCHAR(20) NOT NULL DEFAULT 'v1.0',
      consent_text               TEXT NOT NULL,
      consented_to_identity      BOOLEAN DEFAULT FALSE,
      consented_to_education     BOOLEAN DEFAULT FALSE,
      consented_to_skills        BOOLEAN DEFAULT FALSE,
      consented_to_background    BOOLEAN DEFAULT FALSE,
      consented_to_retention     BOOLEAN DEFAULT FALSE,
      consented_to_third_party   BOOLEAN DEFAULT FALSE,
      ip_address                 VARCHAR(50),
      user_agent                 TEXT,
      given_at                   TIMESTAMP DEFAULT NOW(),
      withdrawn                  BOOLEAN DEFAULT FALSE,
      withdrawn_at               TIMESTAMP,
      withdrawn_reason           TEXT
    );
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS vetting_consents_user_idx ON vetting_consents(user_id);`);
  console.log("  ✅ vetting_consents");

  console.log("\n✅ All vetting tables created successfully!");
  console.log("🚀 Nuclear Vetting System database is ready.\n");
  process.exit(0);
}

createVettingTables().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
