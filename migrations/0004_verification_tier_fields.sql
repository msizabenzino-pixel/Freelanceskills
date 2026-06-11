-- Command C04 — Verification Tier Data Model (Phase 1, Trust Foundation)
-- Additive, idempotent migration. Safe to run multiple times.
-- NOTE: Do NOT use `drizzle-kit push` on this repo — it proposes destructive
-- table renames (it cannot match the new dispute_chats table and offers ~30
-- existing tables as rename candidates). Apply additive SQL like this instead.

-- ── profiles: 3-tier trust badge + verification tier columns ──────────────
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "work_history_json" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "identity_verified" boolean NOT NULL DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "skills_verified" boolean NOT NULL DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "top_performer" boolean NOT NULL DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "identity_verified_at" timestamp;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "skills_verified_at" timestamp;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "top_performer_at" timestamp;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "on_time_delivery_rate" integer;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "verification_tier" integer NOT NULL DEFAULT 0;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "skills_verified_category" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "is_pro_verified" boolean NOT NULL DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "pro_verified_at" timestamp;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "pro_credentials" json DEFAULT '[]'::json;

-- ── disputes: columns required by the nightly Top Performer cron query ─────
-- (open-dispute count is keyed on freelancer_id; closed_at marks resolution)
ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "freelancer_id" varchar;
ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "closed_at" timestamp;
