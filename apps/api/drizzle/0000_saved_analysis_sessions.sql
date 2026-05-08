CREATE TYPE "public"."saved_session_input_mode" AS ENUM('json', 'audio');--> statement-breakpoint
CREATE TABLE "saved_analysis_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_key" varchar(256) NOT NULL,
	"user_id" uuid,
	"input_mode" "saved_session_input_mode" NOT NULL,
	"title" varchar(160),
	"reference_text" text,
	"pronunciation_band" real,
	"fluency_band" real,
	"wpm" integer,
	"input_metadata" jsonb NOT NULL,
	"metrics" jsonb NOT NULL,
	"feedback" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "saved_analysis_sessions_owner_key_created_at_idx" ON "saved_analysis_sessions" USING btree ("owner_key","created_at");--> statement-breakpoint
CREATE INDEX "saved_analysis_sessions_user_id_created_at_idx" ON "saved_analysis_sessions" USING btree ("user_id","created_at");