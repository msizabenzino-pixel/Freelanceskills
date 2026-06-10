-- Create enum types
CREATE TYPE "public"."application_status" AS ENUM('applied', 'reviewing', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."bid_status" AS ENUM('pending', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."dispute_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."dispute_reason" AS ENUM('quality', 'payment', 'timeline', 'communication', 'theft', 'other');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'under_review', 'resolved', 'closed', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."escrow_status" AS ENUM('held', 'released', 'refunded', 'disputed', 'auto_released');--> statement-breakpoint
CREATE TYPE "public"."gig_status" AS ENUM('draft', 'pending_approval', 'active', 'paused', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('open', 'hired', 'in_progress', 'delivered', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."kyc_status_enum" AS ENUM('not_started', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('onsite', 'remote', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('job_match', 'message', 'payment', 'system', 'application_status', 'review', 'booking', 'referral');--> statement-breakpoint
CREATE TYPE "public"."profile_role" AS ENUM('client', 'freelancer', 'admin', 'moderator', 'upskiller');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('active', 'suspended', 'banned', 'pending');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('normal', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('client', 'freelancer', 'both');--> statement-breakpoint

-- Create rewards tables if not exists (may already exist from server startup code)
CREATE TABLE IF NOT EXISTS "point_transactions" (
        "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "point_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
        "user_id" varchar(255) NOT NULL,
        "amount" integer NOT NULL,
        "action" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "balance_after" integer NOT NULL,
        "metadata" text,
        "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reward_redemptions" (
        "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reward_redemptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
        "user_id" varchar(255) NOT NULL,
        "reward_id" varchar(100) NOT NULL,
        "reward_name" varchar(255) NOT NULL,
        "points_cost" integer NOT NULL,
        "status" varchar(50) DEFAULT 'pending' NOT NULL,
        "applied_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Drop and recreate FK constraints with proper cascade behaviour
ALTER TABLE "job_applications" DROP CONSTRAINT IF EXISTS "job_applications_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "availability_slots" DROP CONSTRAINT IF EXISTS "availability_slots_freelancer_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_participant1_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_participant2_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_conversation_id_conversations_id_fk";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_sender_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "academy_enrolments" DROP CONSTRAINT IF EXISTS "academy_enrolments_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "course_progress" DROP CONSTRAINT IF EXISTS "course_progress_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "course_progress" DROP CONSTRAINT IF EXISTS "course_progress_lesson_id_lessons_id_fk";--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_course_id_courses_id_fk";--> statement-breakpoint
ALTER TABLE "freelancer_skills" DROP CONSTRAINT IF EXISTS "freelancer_skills_freelancer_id_users_id_fk";--> statement-breakpoint

-- Apply enum types to existing columns
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DEFAULT 'applied'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DATA TYPE "public"."application_status" USING "status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "location_type" SET DATA TYPE "public"."location_type" USING "location_type"::"public"."location_type";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'open'::"public"."job_status";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "status" SET DATA TYPE "public"."job_status" USING "status"::"public"."job_status";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "user_type" SET DEFAULT 'client'::"public"."user_type";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "user_type" SET DATA TYPE "public"."user_type" USING "user_type"::"public"."user_type";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."profile_status";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "status" SET DATA TYPE "public"."profile_status" USING "status"::"public"."profile_status";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'client'::"public"."profile_role";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" SET DATA TYPE "public"."profile_role" USING "role"::"public"."profile_role";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "kyc_status" SET DEFAULT 'not_started'::"public"."kyc_status_enum";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "kyc_status" SET DATA TYPE "public"."kyc_status_enum" USING "kyc_status"::"public"."kyc_status_enum";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."booking_status" USING "status"::"public"."booking_status";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."bid_status";--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "status" SET DATA TYPE "public"."bid_status" USING "status"::"public"."bid_status";--> statement-breakpoint

-- Add new columns to existing tables
ALTER TABLE "aggregated_jobs" ADD COLUMN IF NOT EXISTS "ai_skill_tags" text;--> statement-breakpoint
ALTER TABLE "aggregated_jobs" ADD COLUMN IF NOT EXISTS "freelance_friendly" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "aggregated_jobs" ADD COLUMN IF NOT EXISTS "entry_level_possible" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "aggregated_jobs" ADD COLUMN IF NOT EXISTS "sa_match_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "urgency" "urgency" DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "response_rate" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "published_profile" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "portfolio_projects_json" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "photo_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "certifications" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "languages" text[];--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "github_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "portfolio_url" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "availability" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "available_now" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "tagline" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "experience_level" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "category" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "service_packages" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "freelancer_profiles" ADD COLUMN IF NOT EXISTS "portfolio_projects_json" text;--> statement-breakpoint
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;--> statement-breakpoint

-- Add FK constraints (rewards)
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (jobs)
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (profiles)
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (services / availability)
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (messages / conversations)
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant1_id_users_id_fk" FOREIGN KEY ("participant1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant2_id_users_id_fk" FOREIGN KEY ("participant2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (academy)
ALTER TABLE "academy_enrolments" ADD CONSTRAINT "academy_enrolments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_enrolments" ADD CONSTRAINT "academy_enrolments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (referrals)
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (notifications)
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (audit / escrow / premium)
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_tiers" ADD CONSTRAINT "premium_tiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add FK constraints (marketplace)
ALTER TABLE "freelancer_skills" ADD CONSTRAINT "freelancer_skills_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_point_transactions_user" ON "point_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reward_redemptions_user" ON "reward_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aggregated_jobs_active" ON "aggregated_jobs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aggregated_jobs_province_category" ON "aggregated_jobs" USING btree ("province","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aggregated_jobs_source" ON "aggregated_jobs" USING btree ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aggregated_jobs_created" ON "aggregated_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_applications_user" ON "job_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_applications_job" ON "job_applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_job_applications_status" ON "job_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_client" ON "jobs" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_status" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_jobs_created" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_status" ON "profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_user_type" ON "profiles" USING btree ("user_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_availability_slots_freelancer" ON "availability_slots" USING btree ("freelancer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_client" ON "bookings" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_freelancer" ON "bookings" USING btree ("freelancer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conversations_p1" ON "conversations" USING btree ("participant1_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conversations_p2" ON "conversations" USING btree ("participant2_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_conversation" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_created" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_sender" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academy_enrolments_user" ON "academy_enrolments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_academy_enrolments_course" ON "academy_enrolments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_course_progress_user" ON "course_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_course_progress_course" ON "course_progress" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bids_job" ON "bids" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bids_freelancer" ON "bids" USING btree ("freelancer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bids_status" ON "bids" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_freelancer_skills_freelancer" ON "freelancer_skills" USING btree ("freelancer_id");--> statement-breakpoint

-- Add unique constraints
ALTER TABLE "job_applications" ADD CONSTRAINT "uq_job_applications_user_job" UNIQUE("user_id","job_id");--> statement-breakpoint
ALTER TABLE "availability_slots" ADD CONSTRAINT "uq_availability_slots_freelancer_day_time" UNIQUE("freelancer_id","day_of_week","start_time");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "uq_conversations_participants" UNIQUE("participant1_id","participant2_id");--> statement-breakpoint
ALTER TABLE "academy_enrolments" ADD CONSTRAINT "uq_academy_enrolments_user_course" UNIQUE("user_id","course_id");--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "uq_course_progress_user_lesson" UNIQUE("user_id","lesson_id");--> statement-breakpoint
ALTER TABLE "freelancer_skills" ADD CONSTRAINT "uq_freelancer_skills_freelancer_skill" UNIQUE("freelancer_id","skill");
