CREATE TABLE "gig_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"gig_id" varchar NOT NULL,
	"day_of_month" integer NOT NULL,
	"predicted_orders_next30" integer DEFAULT 0,
	"predicted_earnings_zar_next30" numeric(10, 2) DEFAULT '0.00',
	"completion_rate" numeric(3, 2) DEFAULT '0.95',
	"academy_cert_bonus" jsonb DEFAULT '{}'::jsonb,
	"demand_trend_percent" integer DEFAULT 0,
	"competitor_count" integer DEFAULT 0,
	"market_share_estimate" numeric(3, 2) DEFAULT '0.00',
	"rural_demand_percent" integer DEFAULT 0,
	"zar_exchange_rate" numeric(5, 2) DEFAULT '18.00',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gig_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"gig_id" varchar NOT NULL,
	"tier" varchar(20) NOT NULL,
	"price_zar" numeric(10, 2) NOT NULL,
	"delivery_days" integer NOT NULL,
	"revisions" integer NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"ai_suggested_price" numeric(10, 2),
	"demand" varchar(20) DEFAULT 'medium',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gigs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freelancer_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"rating_breakdown" jsonb DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb,
	"orders_lifetime" integer DEFAULT 0,
	"orders_this_month" integer DEFAULT 0,
	"delivery_time_hours" integer NOT NULL,
	"rural_adjustment_percent" integer DEFAULT 0,
	"status" "gig_status" DEFAULT 'draft',
	"featured" boolean DEFAULT false,
	"featured_until" timestamp,
	"ai_intelligence_score" integer DEFAULT 0,
	"ai_completion_probability" numeric(3, 2) DEFAULT '0.00',
	"academy_correlation_multiplier" numeric(5, 2) DEFAULT '1.00',
	"predicted_monthly_orders" integer DEFAULT 0,
	"predicted_monthly_earnings_zar" numeric(10, 2) DEFAULT '0.00',
	"approved_by" varchar(255),
	"rejection_reason" text,
	"zar_inflation_adjustment" numeric(5, 2) DEFAULT '1.00',
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "escrow_transactions" ALTER COLUMN "status" SET DEFAULT 'held'::"public"."escrow_status";--> statement-breakpoint
ALTER TABLE "escrow_transactions" ALTER COLUMN "status" SET DATA TYPE "public"."escrow_status" USING "status"::"public"."escrow_status";--> statement-breakpoint
ALTER TABLE "payment_escrows" ALTER COLUMN "status" SET DEFAULT 'held'::"public"."escrow_status";--> statement-breakpoint
ALTER TABLE "payment_escrows" ALTER COLUMN "status" SET DATA TYPE "public"."escrow_status" USING "status"::"public"."escrow_status";--> statement-breakpoint
ALTER TABLE "job_escrow" ALTER COLUMN "status" SET DEFAULT 'held'::"public"."escrow_status";--> statement-breakpoint
ALTER TABLE "job_escrow" ALTER COLUMN "status" SET DATA TYPE "public"."escrow_status" USING "status"::"public"."escrow_status";--> statement-breakpoint
ALTER TABLE "gig_analytics" ADD CONSTRAINT "gig_analytics_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gig_packages" ADD CONSTRAINT "gig_packages_gig_id_gigs_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_freelancer_id_profiles_user_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_gig" ON "gig_analytics" USING btree ("gig_id");--> statement-breakpoint
CREATE INDEX "idx_packages_gig" ON "gig_packages" USING btree ("gig_id");--> statement-breakpoint
CREATE INDEX "idx_gigs_freelancer" ON "gigs" USING btree ("freelancer_id");--> statement-breakpoint
CREATE INDEX "idx_gigs_status" ON "gigs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_gigs_category" ON "gigs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_gigs_rating" ON "gigs" USING btree ("rating");