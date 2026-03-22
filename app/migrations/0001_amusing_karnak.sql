CREATE TYPE "public"."enhancer_job_status" AS ENUM('queued', 'processing', 'done', 'error');--> statement-breakpoint
CREATE TABLE "enhancer_processed_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"job_id" varchar(32) NOT NULL,
	"client_queue_item_id" varchar(128),
	"input_storage_key" text NOT NULL,
	"original_filename" varchar(512) NOT NULL,
	"input_width" integer,
	"input_height" integer,
	"status" "enhancer_job_status" DEFAULT 'queued' NOT NULL,
	"output_url" text,
	"output_urls" jsonb,
	"output_width" integer,
	"output_height" integer,
	"ops" jsonb NOT NULL,
	"error_message" text,
	"processing_ms" integer,
	"credit_cost" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "enhancer_processed_images_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE INDEX "enhancer_processed_images_user_created_idx" ON "enhancer_processed_images" USING btree ("user_id","created_at" desc);