CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"password" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aggregated_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"location" text NOT NULL,
	"province" text NOT NULL,
	"country" text,
	"salary_min" integer,
	"salary_max" integer,
	"salary_period" text DEFAULT 'month',
	"source" text NOT NULL,
	"source_url" text,
	"apply_url" text,
	"live_source" text,
	"category" text NOT NULL,
	"job_type" text DEFAULT 'full-time' NOT NULL,
	"experience_level" text,
	"posted_date" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"ai_score" integer DEFAULT 75,
	"skills" text,
	"is_urgent" boolean DEFAULT false,
	"application_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"upgrade_count" integer DEFAULT 0,
	"is_remote" boolean DEFAULT false,
	"company_size" text,
	"bee_level" text,
	"agent_generated" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"job_id" varchar,
	"aggregated_job_id" varchar,
	"job_title" text NOT NULL,
	"company" text,
	"location" text,
	"cover_letter" text,
	"ai_cover_letter" text,
	"resume_summary" text,
	"employability_score" integer,
	"status" text DEFAULT 'applied' NOT NULL,
	"notes" text,
	"interview_date" timestamp,
	"source" text,
	"apply_url" text,
	"applied_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"location_type" text NOT NULL,
	"location" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"budget" integer NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"client_id" varchar NOT NULL,
	"freelancer_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"user_type" text DEFAULT 'client' NOT NULL,
	"bio" text,
	"title" text,
	"skills" text[],
	"hourly_rate" integer,
	"location" text,
	"is_pro" boolean DEFAULT false NOT NULL,
	"rating" integer DEFAULT 0,
	"completed_jobs" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"role" text DEFAULT 'client' NOT NULL,
	"kyc_status" text DEFAULT 'not_started' NOT NULL,
	"phone_number" varchar(30),
	"country" varchar(100),
	"wallet_balance" integer DEFAULT 0 NOT NULL,
	"last_login_at" timestamp,
	"last_login_ip" varchar(45),
	"suspended_until" timestamp,
	"suspended_reason" text,
	"ban_reason" text,
	"deleted_at" timestamp,
	"deleted_by" varchar(50),
	"delete_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "availability_slots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"service_package_id" varchar,
	"job_id" varchar,
	"booking_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" integer NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_invitations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_name" text NOT NULL,
	"category" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"website_url" text,
	"invite_code" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"claimed_by_user_id" varchar,
	"sent_via" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "business_invitations_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar NOT NULL,
	"reviewer_id" varchar NOT NULL,
	"reviewee_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_packages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"price" integer NOT NULL,
	"duration" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"booking_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant1_id" varchar NOT NULL,
	"participant2_id" varchar NOT NULL,
	"job_id" varchar,
	"last_message_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freelancer_id" text NOT NULL,
	"identity_verified" boolean DEFAULT false,
	"identity_doc_type" text,
	"identity_verified_at" timestamp,
	"qualifications_verified" boolean DEFAULT false,
	"qualification_docs" text[],
	"qualification_verified_at" timestamp,
	"qualification_notes" text,
	"experience_verified" boolean DEFAULT false,
	"claimed_years_experience" integer,
	"verified_years_experience" integer,
	"experience_verified_at" timestamp,
	"reference_contacts" text[],
	"professional_body_verified" boolean DEFAULT false,
	"professional_body_name" text,
	"registration_number" text,
	"registration_expiry" timestamp,
	"background_check_completed" boolean DEFAULT false,
	"background_check_date" timestamp,
	"background_check_result" text,
	"skills_assessment_completed" boolean DEFAULT false,
	"skills_assessment_score" integer,
	"skills_assessment_date" timestamp,
	"customer_handling_score" integer,
	"response_time_avg" integer,
	"completion_rate" integer,
	"dispute_rate" integer,
	"verification_level" text DEFAULT 'unverified',
	"verification_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "private_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"reviewee_id" text NOT NULL,
	"private_rating" integer NOT NULL,
	"would_recommend" boolean,
	"would_hire_again" boolean,
	"communication_rating" integer,
	"professionalism_rating" integer,
	"quality_rating" integer,
	"value_rating" integer,
	"private_comments" text,
	"concerns_raised" text[],
	"flagged_for_review" boolean DEFAULT false,
	"flag_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"questions" text[],
	"passing_score" integer DEFAULT 70,
	"time_limit" integer DEFAULT 30,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freelancer_id" text NOT NULL,
	"test_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" text[],
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enterprise_leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"contact_person" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company_size" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academy_enrolments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"enroled_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"progress_pct" real DEFAULT 0,
	"streak_days" integer DEFAULT 0,
	"last_active_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"certificate_code" text NOT NULL,
	"status" text DEFAULT 'approved',
	"approved_by" text,
	"rejected_reason" text,
	"earnings_before_cents" integer DEFAULT 0,
	"earnings_after_cents" integer DEFAULT 0,
	"job_wins_before_cert" integer DEFAULT 0,
	"job_wins_after_cert" integer DEFAULT 0,
	CONSTRAINT "certificates_certificate_code_unique" UNIQUE("certificate_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"duration" text NOT NULL,
	"total_lessons" integer NOT NULL,
	"image_url" text,
	"is_free" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'live' NOT NULL,
	"skills_taught" text,
	"earnings_lift_pct" integer DEFAULT 0,
	"average_rating" real DEFAULT 0,
	"enrolment_count" integer DEFAULT 0,
	"completion_rate" real DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"ai_recommendation" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"order_index" integer NOT NULL,
	"type" text NOT NULL,
	"video_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill_demand_forecasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"skill_name" text NOT NULL,
	"category" text NOT NULL,
	"demand_score" integer DEFAULT 50 NOT NULL,
	"growth_rate" real DEFAULT 0 NOT NULL,
	"forecast_year" integer DEFAULT 2026 NOT NULL,
	"province" text,
	"job_posting_count" integer DEFAULT 0,
	"average_budget_cents" integer DEFAULT 0,
	"gap_score" integer DEFAULT 0,
	"has_course" boolean DEFAULT false,
	"suggested_course_title" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referred_user_id" text,
	"referral_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_amount" integer DEFAULT 0 NOT NULL,
	"tier" text DEFAULT 'bronze' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"link" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fraud_flags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fraud_flags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"booking_id" varchar,
	"user_id" varchar NOT NULL,
	"risk_score" integer NOT NULL,
	"flags" text[] NOT NULL,
	"recommendation" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar,
	"action" varchar NOT NULL,
	"resource" varchar NOT NULL,
	"resource_id" varchar,
	"metadata" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cron_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cron_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_name" varchar NOT NULL,
	"status" varchar NOT NULL,
	"items_processed" integer DEFAULT 0,
	"details" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "escrow_transactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "escrow_transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"booking_id" varchar NOT NULL,
	"client_id" varchar NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar DEFAULT 'ZAR' NOT NULL,
	"payfast_payment_id" varchar,
	"status" varchar DEFAULT 'held' NOT NULL,
	"released_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "premium_tiers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "premium_tiers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"tier" varchar DEFAULT 'free' NOT NULL,
	"visibility_boost" integer DEFAULT 0 NOT NULL,
	"rate_limit_multiplier" real DEFAULT 1 NOT NULL,
	"featured_until" timestamp,
	"payfast_subscription_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ab_tests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ab_tests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"test_name" varchar NOT NULL,
	"variant" varchar NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "affiliates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "affiliates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"affiliate_code" varchar NOT NULL,
	"commission_rate" real DEFAULT 15 NOT NULL,
	"total_earnings" integer DEFAULT 0 NOT NULL,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"payout_method" varchar DEFAULT 'eft',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "badges" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "badges_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"badge_type" varchar NOT NULL,
	"badge_name" varchar NOT NULL,
	"badge_icon" varchar NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "churn_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "churn_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"days_since_last_activity" integer,
	"email_sent" boolean DEFAULT false NOT NULL,
	"credit_offered" integer DEFAULT 0,
	"reactivated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discount_codes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "discount_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar NOT NULL,
	"type" varchar DEFAULT 'percentage' NOT NULL,
	"value" integer NOT NULL,
	"max_uses" integer DEFAULT 100 NOT NULL,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"affiliate_id" varchar,
	"payfast_coupon_id" varchar,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flash_sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "flash_sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"discount_percent" integer NOT NULL,
	"original_price" integer NOT NULL,
	"sale_price" integer NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"max_redemptions" integer DEFAULT 100 NOT NULL,
	"current_redemptions" integer DEFAULT 0 NOT NULL,
	"target_audience" varchar DEFAULT 'new_freelancers' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracking_pixels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tracking_pixels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pixel_type" varchar NOT NULL,
	"event_name" varchar NOT NULL,
	"user_id" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_contracts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_contracts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"client_id" varchar NOT NULL,
	"contract_text" text NOT NULL,
	"ai_metadata" jsonb,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blockchain_credentials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blockchain_credentials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"credential_type" varchar NOT NULL,
	"issuer" varchar NOT NULL,
	"hash" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_forum_posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "community_forum_posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"category" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_forum_replies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "community_forum_replies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"post_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_accepted_solution" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dao_proposals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dao_proposals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"creator_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"min_votes_required" integer DEFAULT 10 NOT NULL,
	"deadline" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dao_votes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dao_votes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"proposal_id" integer NOT NULL,
	"voter_id" varchar NOT NULL,
	"vote" boolean NOT NULL,
	"power" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "green_impact_scores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "green_impact_scores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"job_id" integer,
	"carbon_kgs" real NOT NULL,
	"impact_type" varchar NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mentor_matches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mentor_matches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mentor_id" varchar NOT NULL,
	"mentee_id" varchar NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"ai_match_score" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_badges" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "nft_badges_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"token_id" varchar NOT NULL,
	"contract_address" varchar NOT NULL,
	"tx_hash" varchar NOT NULL,
	"badge_name" varchar NOT NULL,
	"image_url" text,
	"metadata" jsonb,
	"minted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wellness_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wellness_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"log_type" varchar NOT NULL,
	"duration_minutes" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"performed_by" varchar,
	"action" varchar(100) NOT NULL,
	"details" text,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount_cents" integer NOT NULL,
	"balance_after_cents" integer NOT NULL,
	"description" text,
	"reference_id" varchar,
	"reference_type" varchar(50),
	"performed_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kyc_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(50) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"mime_type" varchar(100),
	"file_size_bytes" integer,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"level" text DEFAULT 'new' NOT NULL,
	"commission_rate" integer DEFAULT 1000 NOT NULL,
	"commission_auto_rule" text DEFAULT 'flat',
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_at" timestamp,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"ai_portfolio_score" integer DEFAULT 50,
	"response_time_hours" integer DEFAULT 24,
	"availability" text DEFAULT 'available' NOT NULL,
	"available_days" text[],
	"next_available_date" timestamp,
	"portfolio_urls" text[],
	"languages" text[],
	"years_experience" integer DEFAULT 0,
	"earnings_lift_pct" integer DEFAULT 0,
	"total_earnings_cents" integer DEFAULT 0 NOT NULL,
	"monthly_avg_earnings_cents" integer DEFAULT 0 NOT NULL,
	"proposal_success_count" integer DEFAULT 0,
	"gig_packages_json" text,
	"verification_stages_json" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"company_name" text,
	"business_type" text,
	"company_size" text,
	"industry" text,
	"total_spent_cents" integer DEFAULT 0 NOT NULL,
	"monthly_avg_spent_cents" integer DEFAULT 0 NOT NULL,
	"last_spend_at" timestamp,
	"total_jobs_posted" integer DEFAULT 0 NOT NULL,
	"active_job_count" integer DEFAULT 0 NOT NULL,
	"avg_job_value_cents" integer DEFAULT 0 NOT NULL,
	"dispute_count" integer DEFAULT 0 NOT NULL,
	"refund_count" integer DEFAULT 0 NOT NULL,
	"refunded_cents" integer DEFAULT 0 NOT NULL,
	"fraud_risk_score" integer DEFAULT 0 NOT NULL,
	"hire_quality_score" integer DEFAULT 50 NOT NULL,
	"predictive_ltv_cents" integer DEFAULT 0 NOT NULL,
	"churn_risk_pct" integer DEFAULT 0 NOT NULL,
	"client_level" text DEFAULT 'new' NOT NULL,
	"is_verified_payer" boolean DEFAULT false NOT NULL,
	"verified_payer_at" timestamp,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"flag_reason" text,
	"flagged_at" timestamp,
	"flagged_by" varchar,
	"is_restricted" boolean DEFAULT false NOT NULL,
	"restriction_reason" text,
	"restricted_until" timestamp,
	"posting_budget_cap_cents" integer,
	"under_investigation" boolean DEFAULT false NOT NULL,
	"investigation_notes" text,
	"investigation_opened_at" timestamp,
	"approved_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "escrow_release_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"condition" text NOT NULL,
	"condition_threshold" integer DEFAULT 0,
	"auto_release_after_hours" integer DEFAULT 48 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"triggered_count" integer DEFAULT 0 NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_escrows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar,
	"job_title" text,
	"client_id" varchar NOT NULL,
	"freelancer_id" varchar,
	"amount_cents" integer NOT NULL,
	"platform_fee_cents" integer DEFAULT 0 NOT NULL,
	"freelancer_payout_cents" integer NOT NULL,
	"status" text DEFAULT 'held' NOT NULL,
	"release_score" integer DEFAULT 50 NOT NULL,
	"fraud_risk_score" integer DEFAULT 0 NOT NULL,
	"held_at" timestamp DEFAULT now(),
	"released_at" timestamp,
	"refunded_at" timestamp,
	"disputed_at" timestamp,
	"auto_release_at" timestamp,
	"released_by" varchar,
	"refunded_by" varchar,
	"payout_status" text DEFAULT 'pending' NOT NULL,
	"payout_ref" varchar,
	"payout_initiated_at" timestamp,
	"payout_completed_at" timestamp,
	"notes" text,
	"is_on_hold" boolean DEFAULT false NOT NULL,
	"hold_reason" text,
	"auto_release_rule_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dispute_chats" (
	"id" varchar PRIMARY KEY NOT NULL,
	"dispute_id" varchar NOT NULL,
	"sender" varchar NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"is_highlighted" boolean DEFAULT false,
	"highlight_reason" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "disputes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"order_id" varchar NOT NULL,
	"contract_id" varchar,
	"client_id" varchar NOT NULL,
	"client_name" text,
	"client_ltv" integer DEFAULT 0,
	"freelancer_id" varchar NOT NULL,
	"freelancer_name" text,
	"freelancer_academy_level" varchar DEFAULT 'Intermediate',
	"freelancer_earnings_lift" integer DEFAULT 0,
	"reason" varchar NOT NULL,
	"custom_reason" text,
	"status" varchar DEFAULT 'open',
	"priority" varchar DEFAULT 'medium',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"closed_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"dispute_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"file_name" text,
	"file_path" text,
	"mime_type" varchar,
	"uploaded_by" varchar NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"ai_sentiment" varchar,
	"ai_trust" integer DEFAULT 50,
	"transcription" text,
	"highlighted_text" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fairness_scores" (
	"id" varchar PRIMARY KEY NOT NULL,
	"dispute_id" varchar NOT NULL,
	"overall_score" integer,
	"client_case_strength" integer,
	"freelancer_case_strength" integer,
	"academy_impact" integer,
	"recommended_split" text,
	"recommended_action" varchar,
	"confidence" integer,
	"reasoning" text,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "growth_paths" (
	"id" varchar PRIMARY KEY NOT NULL,
	"dispute_id" varchar NOT NULL,
	"freelancer_id" varchar,
	"client_id" varchar,
	"recommended_courses" json,
	"expected_earnings_lift" integer,
	"communication_tips" text,
	"next_steps" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resolution_logs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"dispute_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"admin_id" varchar,
	"notes" text,
	"client_payment_zar" integer,
	"freelancer_payment_zar" integer,
	"platform_retained_zar" integer,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"ip_address" varchar,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"category" varchar(32),
	"subject" varchar(256),
	"body" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_by" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "empathy_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(64) NOT NULL,
	"triggered_by" varchar(128),
	"keywords" text[],
	"score" integer DEFAULT 0 NOT NULL,
	"level" varchar(16) NOT NULL,
	"suggestion" text,
	"logged_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sla_timers" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(64) NOT NULL,
	"priority_level" varchar(16) NOT NULL,
	"target_hours" integer NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"deadline_at" timestamp NOT NULL,
	"escalated_at" timestamp,
	"escalated_to" varchar(128),
	"breached_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"user_type" varchar(16) DEFAULT 'client' NOT NULL,
	"user_display_name" varchar(128),
	"user_academy_badge" varchar(64),
	"category" varchar(32) DEFAULT 'other' NOT NULL,
	"subject" varchar(256) NOT NULL,
	"priority" varchar(16) DEFAULT 'medium' NOT NULL,
	"status" varchar(24) DEFAULT 'open' NOT NULL,
	"assigned_agent" varchar(128),
	"linked_order_id" varchar(64),
	"linked_dispute_id" varchar(64),
	"linked_contract_id" varchar(64),
	"ai_category" varchar(32),
	"ai_confidence" integer,
	"ai_frustration_score" integer DEFAULT 0,
	"ai_risk_score" integer DEFAULT 0,
	"ai_first_response" text,
	"ai_empathy_level" varchar(16),
	"ai_academy_course" varchar(128),
	"ai_earnings_lift" integer,
	"sla_deadline" timestamp,
	"sla_breached" boolean DEFAULT false,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"satisfaction_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(64) NOT NULL,
	"uploaded_by" varchar(128) NOT NULL,
	"file_name" varchar(256) NOT NULL,
	"file_type" varchar(64),
	"mime_type" varchar(128),
	"file_size_kb" integer,
	"is_voice_note" boolean DEFAULT false,
	"transcription" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(64) NOT NULL,
	"sender" varchar(128) NOT NULL,
	"sender_type" varchar(16) DEFAULT 'user' NOT NULL,
	"message_type" varchar(16) DEFAULT 'reply',
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"sentiment" varchar(16),
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" varchar(64) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"satisfaction_score" integer,
	"resolution_fair" boolean,
	"would_recommend" boolean,
	"feedback" text,
	"before_mood_score" integer,
	"after_mood_score" integer,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "abuse_reports" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" varchar(100) NOT NULL,
	"reporter_display_name" varchar(200),
	"reporter_motive_badge" varchar(50) DEFAULT 'concerned_user',
	"reported_user_id" varchar(100) NOT NULL,
	"reported_display_name" varchar(200),
	"reported_academy_level" varchar(50),
	"reported_prior_reports" integer DEFAULT 0,
	"report_type" varchar(50) NOT NULL,
	"content_type" varchar(50),
	"content_id" varchar(100),
	"content_url" text,
	"description" text NOT NULL,
	"status" varchar(30) DEFAULT 'open',
	"assigned_admin_id" varchar(100),
	"admin_action" varchar(50),
	"resolution_note" text,
	"suspension_duration_days" integer,
	"appeal_window_days" integer DEFAULT 7,
	"is_anonymous" boolean DEFAULT false,
	"ussd_submitted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rehabilitation_plans" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar(36) NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"recommended_courses" jsonb DEFAULT '[]'::jsonb,
	"growth_message" text,
	"healing_steps" jsonb DEFAULT '[]'::jsonb,
	"earnings_lift_forecast" integer DEFAULT 0,
	"completion_deadline_days" integer DEFAULT 30,
	"status" varchar(30) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_audit_log" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar(36) NOT NULL,
	"admin_id" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"previous_status" varchar(30),
	"new_status" varchar(30),
	"details" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_evidence" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar(36) NOT NULL,
	"uploaded_by" varchar(100) NOT NULL,
	"file_name" varchar(255),
	"file_type" varchar(50),
	"file_url" text,
	"external_link" text,
	"ai_authenticity" integer DEFAULT 0,
	"ai_sentiment" varchar(50),
	"ai_summary" text,
	"ai_plagiarism_score" integer DEFAULT 0,
	"transcription" text,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_messages" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar(36) NOT NULL,
	"sender_id" varchar(100) NOT NULL,
	"sender_role" varchar(20) DEFAULT 'admin',
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_risk_scores" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" varchar(36) NOT NULL,
	"severity_score" integer DEFAULT 0,
	"recidivism_risk" integer DEFAULT 0,
	"platform_harm_score" integer DEFAULT 0,
	"community_impact_score" integer DEFAULT 0,
	"rehabilitation_potential" integer DEFAULT 0,
	"recommended_action" varchar(50),
	"ai_rationale" text,
	"computed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxonomy_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"icon" varchar(20) DEFAULT '📁',
	"color" varchar(10) DEFAULT '#6b7280',
	"parent_id" varchar,
	"type" varchar(20) DEFAULT 'category',
	"sort_order" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active',
	"gig_count" integer DEFAULT 0,
	"job_count" integer DEFAULT 0,
	"user_count" integer DEFAULT 0,
	"search_count" integer DEFAULT 0,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "taxonomy_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxonomy_skill_endorsements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" varchar NOT NULL,
	"endorsee_id" varchar NOT NULL,
	"endorser_id" varchar NOT NULL,
	"level" varchar(20) NOT NULL,
	"note" text,
	"order_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxonomy_skills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"category_id" varchar NOT NULL,
	"icon" varchar(20) DEFAULT '🔧',
	"status" varchar(20) DEFAULT 'active',
	"proficiency_levels" jsonb DEFAULT '["Beginner","Intermediate","Expert"]'::jsonb,
	"trend_score" integer DEFAULT 0,
	"usage_count" integer DEFAULT 0,
	"gig_count" integer DEFAULT 0,
	"job_count" integer DEFAULT 0,
	"endorsement_count" integer DEFAULT 0,
	"search_count" integer DEFAULT 0,
	"ai_synonyms" jsonb DEFAULT '[]'::jsonb,
	"ai_related" jsonb DEFAULT '[]'::jsonb,
	"avg_hourly_rate" integer DEFAULT 0,
	"is_emerging" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "taxonomy_skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxonomy_suggestions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"parent_category_id" varchar,
	"suggested_by" varchar,
	"source" varchar(20) DEFAULT 'user',
	"reason" text,
	"evidence" text,
	"status" varchar(20) DEFAULT 'pending',
	"votes" integer DEFAULT 0,
	"reviewed_by" varchar,
	"review_note" text,
	"merged_into_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "affiliate_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" varchar(120) NOT NULL,
	"affiliate_name" varchar(255),
	"affiliate_email" varchar(255),
	"affiliate_website" varchar(2048),
	"commission_type" varchar(30) NOT NULL,
	"commission_value" numeric(10, 2) NOT NULL,
	"tiered_rates" jsonb,
	"unique_tracking_id" varchar(50) NOT NULL,
	"total_referrals" integer DEFAULT 0,
	"total_conversions" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2) DEFAULT 0,
	"total_commission_earned_cents" integer DEFAULT 0,
	"payout_method" varchar(30),
	"payout_account" jsonb,
	"minimum_payout_cents" integer DEFAULT 50000,
	"last_payout_at" timestamp,
	"next_payout_at" timestamp,
	"is_active" boolean DEFAULT true,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "affiliate_programs_affiliate_id_unique" UNIQUE("affiliate_id"),
	CONSTRAINT "affiliate_programs_unique_tracking_id_unique" UNIQUE("unique_tracking_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'newsletter' NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"subject" varchar(255),
	"headline" varchar(255),
	"body" text,
	"cta_text" varchar(100),
	"cta_url" varchar(2048),
	"target_segment" varchar(50) DEFAULT 'all',
	"target_countries" jsonb DEFAULT '[]'::jsonb,
	"min_spend_cents" integer,
	"max_churn_risk" numeric(3, 2),
	"ai_generated" boolean DEFAULT false,
	"ai_variant_a" jsonb,
	"ai_variant_b" jsonb,
	"ai_suggested_send_time" timestamp,
	"ab_enabled" boolean DEFAULT true,
	"ab_split_pct" integer DEFAULT 50,
	"ab_variant_a_id" varchar(50),
	"ab_variant_b_id" varchar(50),
	"ab_winner_variant" varchar(1),
	"ab_confidence_pct" numeric(5, 2),
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"recipients_count" integer DEFAULT 0,
	"opens" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"open_rate" numeric(5, 2) DEFAULT 0,
	"click_rate" numeric(5, 2) DEFAULT 0,
	"conversion_rate" numeric(5, 2) DEFAULT 0,
	"revenue_generated_cents" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(255),
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"max_discount_cents" integer,
	"usage_limit_total" integer,
	"usage_limit_per_user" integer DEFAULT 1,
	"current_usage" integer DEFAULT 0,
	"min_spend_cents" integer,
	"applicable_to" varchar(100),
	"target_user_type" varchar(50),
	"country_restrictions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"starts_at" timestamp DEFAULT NOW(),
	"expires_at" timestamp,
	"total_revenue_cents" integer DEFAULT 0,
	"redemptions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "growth_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_date" date DEFAULT CURRENT_DATE NOT NULL,
	"campaigns_sent" integer DEFAULT 0,
	"campaign_opens" integer DEFAULT 0,
	"campaign_clicks" integer DEFAULT 0,
	"campaign_conversions" integer DEFAULT 0,
	"campaign_revenue_cents" integer DEFAULT 0,
	"new_referrals" integer DEFAULT 0,
	"referral_signups" integer DEFAULT 0,
	"referral_conversions" integer DEFAULT 0,
	"referral_bonus_paid_cents" integer DEFAULT 0,
	"viral_coefficient_avg" numeric(4, 2) DEFAULT 0,
	"coupon_redemptions" integer DEFAULT 0,
	"coupon_discount_value_cents" integer DEFAULT 0,
	"coupon_revenue_cents" integer DEFAULT 0,
	"affiliate_referrals" integer DEFAULT 0,
	"affiliate_conversions" integer DEFAULT 0,
	"affiliate_commission_paid_cents" integer DEFAULT 0,
	"new_users" integer DEFAULT 0,
	"retention_rate" numeric(5, 2) DEFAULT 0,
	"churn_rate" numeric(5, 2) DEFAULT 0,
	"ltv_avg_cents" integer DEFAULT 0,
	"cac_avg_cents" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"tier_name" varchar(50) DEFAULT 'bronze',
	"tier_points" integer DEFAULT 0,
	"tier_level" integer DEFAULT 1,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"streak_days" integer DEFAULT 0,
	"bonus_multiplier" numeric(3, 2) DEFAULT 1.0,
	"referral_bonus_boost_pct" integer DEFAULT 0,
	"next_tier_points_needed" integer DEFAULT 100,
	"referrals_made" integer DEFAULT 0,
	"campaigns_engaged" integer DEFAULT 0,
	"coupons_used" integer DEFAULT 0,
	"total_referral_revenue_cents" integer DEFAULT 0,
	"rewards_claimed" integer DEFAULT 0,
	"rewards_value_cents" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "loyalty_tiers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketing_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" varchar(120) NOT NULL,
	"referral_code" varchar(50) NOT NULL,
	"referral_link" varchar(2048) NOT NULL,
	"bonus_type" varchar(30) DEFAULT 'credits',
	"bonus_amount_cents" integer NOT NULL,
	"bonus_for_referrer" boolean DEFAULT true,
	"bonus_for_referee" boolean DEFAULT true,
	"bonus_when" varchar(30) DEFAULT 'signup',
	"total_referrals" integer DEFAULT 0,
	"successful_referrals" integer DEFAULT 0,
	"failed_referrals" integer DEFAULT 0,
	"viral_coefficient" numeric(4, 2) DEFAULT 0,
	"total_bonus_paid_cents" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"ussd_code" varchar(30),
	"whatsapp_template" varchar(2048),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "marketing_referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"source" varchar(50) DEFAULT 'homepage',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"subscribed" boolean DEFAULT true NOT NULL,
	"confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "predictive_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"metric_date" date DEFAULT CURRENT_DATE NOT NULL,
	"predicted_ltv_cents" integer NOT NULL,
	"ltv_confidence" numeric(5, 2),
	"ltv_trend" varchar(10),
	"churn_risk_score" numeric(5, 2),
	"churn_risk_reason" varchar(255),
	"growth_potential_score" numeric(5, 2),
	"recommended_incentives" jsonb,
	"predicted_campaign_open_rate" numeric(5, 2),
	"predicted_referral_conversion" numeric(5, 2),
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referral_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"referral_id" integer NOT NULL,
	"referee_id" varchar(120) NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"source" varchar(30),
	"status" varchar(20) DEFAULT 'pending',
	"bonus_paid_cents" integer DEFAULT 0,
	"bonus_paid_at" timestamp,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"subscription_id" integer,
	"event_type" varchar(50) NOT NULL,
	"event_status" varchar(30) DEFAULT 'pending',
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'ZAR',
	"payment_method" varchar(50),
	"payment_gateway" varchar(50),
	"external_transaction_id" varchar(255),
	"description" text,
	"metadata" jsonb,
	"tax_amount_cents" integer DEFAULT 0,
	"tax_rate_pct" numeric(5, 2),
	"invoice_number" varchar(100),
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "churn_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"subscription_id" integer,
	"churn_risk_score" numeric(5, 2) NOT NULL,
	"prediction_confidence" numeric(5, 2),
	"prediction_date" timestamp DEFAULT NOW(),
	"risk_factors" jsonb,
	"days_until_predicted_churn" integer,
	"suggested_interventions" jsonb,
	"intervention_taken" varchar(50),
	"intervention_taken_at" timestamp,
	"intervention_result" varchar(30),
	"last_login_days_ago" integer,
	"proposals_sent_last_30d" integer,
	"jobs_won_last_30d" integer,
	"revenue_last_30d_cents" integer,
	"support_tickets_last_30d" integer,
	"payment_failures_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"tokens_available" integer DEFAULT 0,
	"tokens_lifetime_earned" integer DEFAULT 0,
	"tokens_lifetime_redeemed" integer DEFAULT 0,
	"earn_on_subscription_payment" integer DEFAULT 100,
	"earn_on_completed_job" integer DEFAULT 50,
	"earn_on_referral_conversion" integer DEFAULT 200,
	"earn_on_review_received" integer DEFAULT 25,
	"token_multiplier" numeric(3, 2) DEFAULT 1.0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_date" date DEFAULT CURRENT_DATE NOT NULL,
	"mrr_cents" integer DEFAULT 0,
	"arr_cents" integer DEFAULT 0,
	"total_revenue_today_cents" integer DEFAULT 0,
	"active_subscriptions" integer DEFAULT 0,
	"trial_subscriptions" integer DEFAULT 0,
	"cancelled_today" integer DEFAULT 0,
	"new_subscriptions_today" integer DEFAULT 0,
	"basic_count" integer DEFAULT 0,
	"pro_count" integer DEFAULT 0,
	"agency_count" integer DEFAULT 0,
	"enterprise_count" integer DEFAULT 0,
	"churn_rate_pct" numeric(5, 2),
	"retention_rate_pct" numeric(5, 2),
	"avg_churn_risk_score" numeric(5, 2),
	"avg_ltv_cents" integer,
	"avg_subscription_length_days" integer,
	"trial_to_paid_conversion_pct" numeric(5, 2),
	"upgrade_rate_pct" numeric(5, 2),
	"downgrade_rate_pct" numeric(5, 2),
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" text,
	"price_monthly_cents" integer NOT NULL,
	"price_annual_cents" integer,
	"price_weekly_cents" integer,
	"price_daily_cents" integer,
	"currency" varchar(3) DEFAULT 'ZAR',
	"billing_cycle_default" varchar(20) DEFAULT 'monthly',
	"trial_days" integer DEFAULT 0,
	"features" jsonb DEFAULT '[]'::jsonb,
	"proposal_limit_monthly" integer,
	"gig_slots" integer DEFAULT 5,
	"team_size" integer DEFAULT 1,
	"withdrawal_speed" varchar(20) DEFAULT 'standard',
	"support_level" varchar(20) DEFAULT 'standard',
	"white_label_enabled" boolean DEFAULT false,
	"sub_accounts_enabled" boolean DEFAULT false,
	"shared_billing_enabled" boolean DEFAULT false,
	"role_permissions_enabled" boolean DEFAULT false,
	"featured_gig_priority" boolean DEFAULT false,
	"search_boost_multiplier" numeric(3, 2) DEFAULT 1.0,
	"profile_badge" varchar(50),
	"overage_proposal_cents" integer,
	"overage_connect_cents" integer,
	"overage_featured_gig_cents" integer,
	"is_active" boolean DEFAULT true,
	"is_visible" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"recommended" boolean DEFAULT false,
	"ai_suggested_price_cents" integer,
	"dynamic_pricing_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"source" varchar(50) NOT NULL,
	"description" varchar(500),
	"related_id" varchar(120),
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(120) NOT NULL,
	"plan_id" integer NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"billing_cycle" varchar(20) NOT NULL,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancelled_at" timestamp,
	"expires_at" timestamp,
	"price_paid_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'ZAR',
	"payment_method" varchar(50),
	"payment_gateway" varchar(50),
	"external_subscription_id" varchar(255),
	"auto_renew" boolean DEFAULT true,
	"next_billing_date" timestamp,
	"next_billing_amount_cents" integer,
	"proposals_used_this_period" integer DEFAULT 0,
	"connects_used_this_period" integer DEFAULT 0,
	"overage_charges_cents" integer DEFAULT 0,
	"churn_risk_score" numeric(5, 2),
	"churn_risk_reason" varchar(255),
	"retention_discount_applied" boolean DEFAULT false,
	"retention_discount_pct" integer,
	"previous_plan_id" integer,
	"upgrade_recommended_plan_id" integer,
	"upgrade_recommended_at" timestamp,
	"upgrade_recommended_reason" varchar(500),
	"loyalty_tokens_earned" integer DEFAULT 0,
	"loyalty_tokens_redeemed" integer DEFAULT 0,
	"is_team_plan" boolean DEFAULT false,
	"team_owner_user_id" varchar(120),
	"team_role" varchar(50),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" varchar(128) NOT NULL,
	"admin_email" varchar(255),
	"session_id" varchar(128),
	"ip_address" varchar(64),
	"user_agent" text,
	"action" varchar(128) NOT NULL,
	"action_category" varchar(64) DEFAULT 'system' NOT NULL,
	"department" varchar(64) DEFAULT 'general' NOT NULL,
	"description" text,
	"target_type" varchar(64),
	"target_id" varchar(128),
	"target_label" varchar(255),
	"before_state" jsonb,
	"after_state" jsonb,
	"reason" text,
	"severity" varchar(16) DEFAULT 'low' NOT NULL,
	"is_automated" boolean DEFAULT false NOT NULL,
	"is_anomaly" boolean DEFAULT false NOT NULL,
	"anomaly_reason" text,
	"anomaly_score" varchar(8),
	"previous_hash" varchar(64),
	"current_hash" varchar(64),
	"chain_valid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_blocks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(80) DEFAULT 'content' NOT NULL,
	"block_type" varchar(80) NOT NULL,
	"description" text,
	"content" jsonb DEFAULT '{}'::jsonb,
	"default_data" jsonb DEFAULT '{}'::jsonb,
	"preview_img" varchar(500),
	"is_global" boolean DEFAULT false,
	"is_built_in" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"tags" text[],
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_media" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(300) NOT NULL,
	"url" varchar(800) NOT NULL,
	"mime_type" varchar(100),
	"size_bytes" integer,
	"alt_text" varchar(300),
	"caption" text,
	"uploaded_by" varchar,
	"usage_count" integer DEFAULT 0,
	"tags" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_page_versions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"title" varchar(300),
	"content" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"seo_title" varchar(300),
	"seo_description" text,
	"status" varchar(20),
	"changed_by" varchar,
	"change_note" text,
	"diff_summary" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(300) NOT NULL,
	"page_type" varchar(60) DEFAULT 'custom' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"content" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"seo_title" varchar(300),
	"seo_description" text,
	"seo_keywords" text,
	"og_image" varchar(500),
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"is_ab_test" boolean DEFAULT false,
	"ab_variant" varchar(2),
	"ab_parent_id" varchar,
	"scheduled_at" timestamp,
	"published_at" timestamp,
	"author_id" varchar,
	"last_edited_by" varchar,
	"view_count" integer DEFAULT 0,
	"word_count" integer DEFAULT 0,
	"reading_time_mins" integer DEFAULT 1,
	"ussd_version" text,
	"translations" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "cms_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_flags" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"key" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"category" varchar(64) DEFAULT 'general',
	"status" varchar(32) DEFAULT 'off',
	"rollout_percentage" integer DEFAULT 0,
	"targeting_rules" jsonb DEFAULT '[]',
	"tags" text[] DEFAULT '{}',
	"impact_level" varchar(16) DEFAULT 'low',
	"default_value" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}',
	"created_by" varchar(128),
	"is_kill_switch" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"locked_reason" text,
	"enabled_at" timestamp,
	"disabled_at" timestamp,
	"scheduled_enable_at" timestamp,
	"scheduled_disable_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flag_experiments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"flag_id" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"hypothesis" text,
	"status" varchar(32) DEFAULT 'draft',
	"variants" jsonb DEFAULT '[]',
	"traffic_split" jsonb DEFAULT '{}',
	"target_metric" varchar(128),
	"started_at" timestamp,
	"concluded_at" timestamp,
	"winner" varchar(128),
	"winner_confidence" integer,
	"results" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flag_history" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"flag_id" varchar(128) NOT NULL,
	"flag_key" varchar(128) NOT NULL,
	"action" varchar(64) NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"changed_by" varchar(128),
	"change_note" text,
	"rollout_before" integer,
	"rollout_after" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"resource" varchar(64),
	"action" varchar(64),
	"department" varchar(64),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_change_history" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_key" varchar(64) NOT NULL,
	"permission_key" varchar(128),
	"action" varchar(32) NOT NULL,
	"changed_by" varchar(128),
	"changed_at" timestamp DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_conditional_rules" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_key" varchar(64) NOT NULL,
	"permission_key" varchar(128),
	"condition_type" varchar(64),
	"condition_value" jsonb DEFAULT '{}'::jsonb,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_by" varchar(128),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_key" varchar(64) NOT NULL,
	"permission_key" varchar(128) NOT NULL,
	"granted_by" varchar(128),
	"granted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT '#8b5cf6',
	"is_system" boolean DEFAULT false,
	"inherits_from" varchar(64),
	"user_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_role_assignments" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"role_key" varchar(64) NOT NULL,
	"assigned_by" varchar(128),
	"expires_at" timestamp,
	"conditions" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_breach" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(32) NOT NULL,
	"title" varchar(255) NOT NULL,
	"severity" varchar(16) DEFAULT 'medium' NOT NULL,
	"status" varchar(32) DEFAULT 'detected' NOT NULL,
	"breach_type" varchar(64) NOT NULL,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"contained_at" timestamp,
	"notification_deadline" timestamp,
	"users_notified_at" timestamp,
	"authority_notified_at" timestamp,
	"users_affected" integer DEFAULT 0,
	"data_categories" jsonb DEFAULT '[]'::jsonb,
	"affected_jurisdictions" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"root_cause" text,
	"remediation" text,
	"regulator_reference" varchar(128),
	"reported_by" varchar(128),
	"assigned_to" varchar(128),
	"timeline" jsonb DEFAULT '[]'::jsonb,
	"dpia_required" boolean DEFAULT false,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"regulator_report" jsonb,
	"regulator_report_at" timestamp,
	"user_notification_sent" boolean DEFAULT false,
	CONSTRAINT "compliance_breach_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_consent" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"purpose" varchar(128) NOT NULL,
	"purpose_label" varchar(255),
	"lawful_basis" varchar(64) DEFAULT 'consent',
	"granted" boolean DEFAULT false NOT NULL,
	"version" varchar(16) DEFAULT '1.0',
	"granted_at" timestamp,
	"withdrawn_at" timestamp,
	"ip_address" varchar(64),
	"user_agent" text,
	"jurisdiction" varchar(32) DEFAULT 'POPIA',
	"channel" varchar(32) DEFAULT 'web',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_deletion_proof" (
	"id" serial PRIMARY KEY NOT NULL,
	"certificate_id" varchar(64) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"dsr_id" integer,
	"sha256_hash" varchar(64) NOT NULL,
	"data_categories" jsonb DEFAULT '[]'::jsonb,
	"tables_affected" jsonb DEFAULT '[]'::jsonb,
	"records_deleted" integer DEFAULT 0,
	"deletion_method" varchar(32) DEFAULT 'cryptographic_erasure',
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"jurisdiction" varchar(32) DEFAULT 'POPIA',
	"verified_by" varchar(128),
	"signature" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"chain_hash" varchar(64),
	"prev_cert_id" varchar(64),
	CONSTRAINT "compliance_deletion_proof_certificate_id_unique" UNIQUE("certificate_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_dpia" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"project" varchar(255),
	"purpose" text,
	"data_categories" jsonb DEFAULT '[]'::jsonb,
	"processing_activities" jsonb DEFAULT '[]'::jsonb,
	"data_subjects" jsonb DEFAULT '[]'::jsonb,
	"legal_basis" varchar(64),
	"risks" jsonb DEFAULT '[]'::jsonb,
	"mitigations" jsonb DEFAULT '[]'::jsonb,
	"residual_risk" varchar(16) DEFAULT 'medium',
	"necessity_assessment" text,
	"proportionality" text,
	"status" varchar(32) DEFAULT 'draft',
	"dpo_approved" boolean DEFAULT false,
	"dpo_notes" text,
	"ai_generated" boolean DEFAULT false,
	"created_by" varchar(128),
	"approved_by" varchar(128),
	"approved_at" timestamp,
	"review_date" timestamp,
	"jurisdictions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_dsr" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(32) NOT NULL,
	"user_id" varchar(128),
	"user_email" varchar(255) NOT NULL,
	"user_name" varchar(255),
	"request_type" varchar(64) NOT NULL,
	"jurisdiction" varchar(32) DEFAULT 'POPIA' NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"priority" varchar(16) DEFAULT 'normal' NOT NULL,
	"sla_days" integer DEFAULT 30 NOT NULL,
	"sla_deadline" timestamp,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"closed_at" timestamp,
	"processed_by" varchar(128),
	"description" text,
	"notes" text,
	"data_categories" jsonb DEFAULT '[]'::jsonb,
	"verification_method" varchar(64),
	"identity_verified" boolean DEFAULT false,
	"export_url" text,
	"deletion_proof_id" integer,
	"rejection_reason" text,
	"channel" varchar(32) DEFAULT 'web',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"orchestration_data" jsonb,
	"orchestration_status" varchar(32),
	"orchestration_at" timestamp,
	"user_notified_at" timestamp,
	"ussd_msisdn" varchar(20),
	"consent_language" varchar(8) DEFAULT 'en',
	CONSTRAINT "compliance_dsr_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(64) NOT NULL,
	"data_types" jsonb DEFAULT '[]'::jsonb,
	"storage_location" varchar(255),
	"system" varchar(128),
	"third_parties" jsonb DEFAULT '[]'::jsonb,
	"legal_basis" varchar(64),
	"purpose" text,
	"data_subjects" jsonb DEFAULT '[]'::jsonb,
	"retention_period" varchar(64),
	"risk_level" varchar(16) DEFAULT 'medium',
	"encryption_at_rest" boolean DEFAULT true,
	"encryption_in_transit" boolean DEFAULT true,
	"cross_border" boolean DEFAULT false,
	"cross_border_safeguard" varchar(128),
	"popia_section" varchar(64),
	"gdpr_article" varchar(64),
	"ai_discovered" boolean DEFAULT false,
	"notes" text,
	"last_reviewed" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compliance_retention" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"data_category" varchar(64) NOT NULL,
	"table_name" varchar(128),
	"retention_days" integer NOT NULL,
	"legal_basis" varchar(255),
	"jurisdiction" varchar(32) DEFAULT 'POPIA',
	"auto_purge" boolean DEFAULT false,
	"purge_method" varchar(32) DEFAULT 'soft_delete',
	"schedule_cron" varchar(64) DEFAULT '0 2 * * 0',
	"last_run" timestamp,
	"next_run" timestamp,
	"records_purged" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"legal_hold" boolean DEFAULT false,
	"legal_hold_reason" text,
	"legal_hold_by" varchar(128),
	"legal_hold_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bid_reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"from_user_id" varchar NOT NULL,
	"to_user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"comment" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bids" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"message" text,
	"estimated_delivery" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_skills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"skill" text NOT NULL,
	"proficiency" text DEFAULT 'intermediate' NOT NULL,
	"years_experience" integer DEFAULT 1,
	"verified" boolean DEFAULT false,
	"endorsements" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_escrow" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar NOT NULL,
	"bid_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'held' NOT NULL,
	"released_at" timestamp,
	"milestone" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"bio" text,
	"avatar" text,
	"role" varchar(100),
	"linkedin_url" text,
	"twitter_handle" varchar(100),
	"post_count" integer DEFAULT 0,
	CONSTRAINT "blog_authors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT 'emerald',
	"icon" varchar(50),
	"post_count" integer DEFAULT 0,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"cover_image" text,
	"cover_image_alt" text,
	"category_id" integer,
	"author_id" integer,
	"tags" text[] DEFAULT '{}',
	"target_keywords" text[] DEFAULT '{}',
	"meta_title" text,
	"meta_description" text,
	"og_image" text,
	"reading_time_minutes" integer DEFAULT 5,
	"view_count" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'published',
	"is_featured" boolean DEFAULT false,
	"linked_course_ids" integer[] DEFAULT '{}',
	"linked_job_categories" text[] DEFAULT '{}',
	"related_post_ids" integer[] DEFAULT '{}',
	"structured_data" jsonb,
	"published_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vetting_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"actor_id" varchar,
	"action" varchar(100) NOT NULL,
	"category" varchar(50),
	"details" jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"retention_expires_at" timestamp,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vetting_consents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"consent_version" varchar(20) DEFAULT 'v1.0' NOT NULL,
	"consent_text" text NOT NULL,
	"consented_to_identity" boolean DEFAULT false,
	"consented_to_education" boolean DEFAULT false,
	"consented_to_skills" boolean DEFAULT false,
	"consented_to_background" boolean DEFAULT false,
	"consented_to_retention" boolean DEFAULT false,
	"consented_to_third_party" boolean DEFAULT false,
	"ip_address" varchar(50),
	"user_agent" text,
	"given_at" timestamp DEFAULT now(),
	"withdrawn" boolean DEFAULT false,
	"withdrawn_at" timestamp,
	"withdrawn_reason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vetting_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(60) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"mime_type" varchar(100),
	"file_size_bytes" integer,
	"ocr_extracted" jsonb,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"hashed_id" varchar(128),
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vetting_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tier" integer DEFAULT 0 NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"consent_given" boolean DEFAULT false,
	"consent_given_at" timestamp,
	"identity_verified" boolean DEFAULT false,
	"identity_verified_at" timestamp,
	"education_verified" boolean DEFAULT false,
	"education_verified_at" timestamp,
	"skills_verified" boolean DEFAULT false,
	"skills_verified_at" timestamp,
	"background_checked" boolean DEFAULT false,
	"background_checked_at" timestamp,
	"identity_score" integer DEFAULT 0,
	"skills_score" integer DEFAULT 0,
	"education_score" integer DEFAULT 0,
	"overall_score" integer DEFAULT 0,
	"blockchain_hash" varchar(128),
	"blockchain_minted_at" timestamp,
	"fraud_risk_flag" boolean DEFAULT false,
	"fraud_risk_reason" text,
	"lebo_last_message" text,
	"lebo_language" varchar(20) DEFAULT 'en',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vetting_references" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"ref_name" varchar(120) NOT NULL,
	"ref_title" varchar(120),
	"ref_company" varchar(120),
	"ref_email" varchar(255),
	"ref_phone" varchar(30),
	"ref_relationship" varchar(60),
	"outreach_sent_at" timestamp,
	"reminder_sent_at" timestamp,
	"response_received_at" timestamp,
	"verified_status" varchar(30) DEFAULT 'pending',
	"verified_score" integer,
	"reference_notes" text,
	"response_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vetting_skill_assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"test_type" varchar(80) NOT NULL,
	"skill_category" varchar(80),
	"difficulty_level" varchar(20) DEFAULT 'intermediate',
	"raw_score" integer,
	"percentile_score" integer,
	"pass_threshold" integer DEFAULT 70,
	"passed" boolean DEFAULT false,
	"proctor_data" jsonb,
	"proctor_flag" boolean DEFAULT false,
	"proctor_flag_reason" text,
	"portfolio_analysis" jsonb,
	"questions_served" integer,
	"question_ids" jsonb,
	"attempt_number" integer DEFAULT 1,
	"next_attempt_allowed_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_package_id_service_packages_id_fk" FOREIGN KEY ("service_package_id") REFERENCES "public"."service_packages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_claimed_by_user_id_users_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant1_id_users_id_fk" FOREIGN KEY ("participant1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participant2_id_users_id_fk" FOREIGN KEY ("participant2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "academy_enrolments" ADD CONSTRAINT "academy_enrolments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "freelancer_profiles" ADD CONSTRAINT "freelancer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "escrow_release_rules" ADD CONSTRAINT "escrow_release_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payment_escrows" ADD CONSTRAINT "payment_escrows_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payment_escrows" ADD CONSTRAINT "payment_escrows_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payment_escrows" ADD CONSTRAINT "payment_escrows_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "dispute_chats" ADD CONSTRAINT "dispute_chats_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "fairness_scores" ADD CONSTRAINT "fairness_scores_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "growth_paths" ADD CONSTRAINT "growth_paths_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "resolution_logs" ADD CONSTRAINT "resolution_logs_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_categories" ADD CONSTRAINT "taxonomy_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_skill_endorsements" ADD CONSTRAINT "taxonomy_skill_endorsements_skill_id_taxonomy_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."taxonomy_skills"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_skill_endorsements" ADD CONSTRAINT "taxonomy_skill_endorsements_endorsee_id_users_id_fk" FOREIGN KEY ("endorsee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_skill_endorsements" ADD CONSTRAINT "taxonomy_skill_endorsements_endorser_id_users_id_fk" FOREIGN KEY ("endorser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_skills" ADD CONSTRAINT "taxonomy_skills_category_id_taxonomy_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."taxonomy_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_skills" ADD CONSTRAINT "taxonomy_skills_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_suggestions" ADD CONSTRAINT "taxonomy_suggestions_suggested_by_users_id_fk" FOREIGN KEY ("suggested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "taxonomy_suggestions" ADD CONSTRAINT "taxonomy_suggestions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referral_id_marketing_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."marketing_referrals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "churn_predictions" ADD CONSTRAINT "churn_predictions_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cms_blocks" ADD CONSTRAINT "cms_blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cms_media" ADD CONSTRAINT "cms_media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cms_page_versions" ADD CONSTRAINT "cms_page_versions_page_id_cms_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."cms_pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cms_page_versions" ADD CONSTRAINT "cms_page_versions_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_last_edited_by_users_id_fk" FOREIGN KEY ("last_edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bid_reviews" ADD CONSTRAINT "bid_reviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bid_reviews" ADD CONSTRAINT "bid_reviews_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bid_reviews" ADD CONSTRAINT "bid_reviews_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bids" ADD CONSTRAINT "bids_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bids" ADD CONSTRAINT "bids_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "freelancer_skills" ADD CONSTRAINT "freelancer_skills_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "job_escrow" ADD CONSTRAINT "job_escrow_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "job_escrow" ADD CONSTRAINT "job_escrow_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_audit_logs" ADD CONSTRAINT "vetting_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_audit_logs" ADD CONSTRAINT "vetting_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_consents" ADD CONSTRAINT "vetting_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_documents" ADD CONSTRAINT "vetting_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_documents" ADD CONSTRAINT "vetting_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_records" ADD CONSTRAINT "vetting_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_references" ADD CONSTRAINT "vetting_references_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "vetting_skill_assessments" ADD CONSTRAINT "vetting_skill_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_affiliate_programs_affiliate_id" ON "affiliate_programs" USING btree ("affiliate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_affiliate_programs_tracking_id" ON "affiliate_programs" USING btree ("unique_tracking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_affiliate_programs_is_active" ON "affiliate_programs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaigns_status" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaigns_type" ON "campaigns" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaigns_created_at" ON "campaigns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_coupons_code" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_coupons_is_active" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_coupons_expires_at" ON "coupons" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_growth_metrics_date" ON "growth_metrics" USING btree ("metric_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_tiers_user_id" ON "loyalty_tiers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_tiers_tier_name" ON "loyalty_tiers" USING btree ("tier_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referrals_referrer_id" ON "marketing_referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referrals_code" ON "marketing_referrals" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referrals_is_active" ON "marketing_referrals" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_predictive_metrics_user_id" ON "predictive_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_predictive_metrics_date" ON "predictive_metrics" USING btree ("metric_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_predictive_metrics_churn_risk" ON "predictive_metrics" USING btree ("churn_risk_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referral_events_referral_id" ON "referral_events" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referral_events_referee_id" ON "referral_events" USING btree ("referee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_referral_events_type" ON "referral_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_billing_events_user_id" ON "billing_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_billing_events_subscription_id" ON "billing_events" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_billing_events_type" ON "billing_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_billing_events_status" ON "billing_events" USING btree ("event_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_billing_events_created_at" ON "billing_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_churn_predictions_user_id" ON "churn_predictions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_churn_predictions_score" ON "churn_predictions" USING btree ("churn_risk_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_churn_predictions_date" ON "churn_predictions" USING btree ("prediction_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_loyalty_tokens_user_id" ON "loyalty_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscription_analytics_date" ON "subscription_analytics" USING btree ("metric_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscription_plans_slug" ON "subscription_plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscription_plans_is_active" ON "subscription_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_token_transactions_user_id" ON "token_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_token_transactions_created_at" ON "token_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_user_id" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_status" ON "user_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_plan_id" ON "user_subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_next_billing" ON "user_subscriptions" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_admin" ON "admin_audit_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_action" ON "admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_department" ON "admin_audit_logs" USING btree ("department");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_severity" ON "admin_audit_logs" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_created_at" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_target" ON "admin_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_anomaly" ON "admin_audit_logs" USING btree ("is_anomaly");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_aal_hash" ON "admin_audit_logs" USING btree ("current_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_breach_status" ON "compliance_breach" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_breach_severity" ON "compliance_breach" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_consent_user_purpose" ON "compliance_consent" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dsr_status" ON "compliance_dsr" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dsr_user" ON "compliance_dsr" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_audit_user_idx" ON "vetting_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_audit_action_idx" ON "vetting_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_audit_ts_idx" ON "vetting_audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_consents_user_idx" ON "vetting_consents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_docs_user_idx" ON "vetting_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_docs_type_idx" ON "vetting_documents" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_records_user_idx" ON "vetting_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_records_tier_idx" ON "vetting_records" USING btree ("tier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_refs_user_idx" ON "vetting_references" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_skills_user_idx" ON "vetting_skill_assessments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vetting_skills_type_idx" ON "vetting_skill_assessments" USING btree ("test_type");