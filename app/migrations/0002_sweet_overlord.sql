CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(320),
	"first_name" varchar(256),
	"last_name" varchar(256),
	"image_url" text,
	"username" varchar(256),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "enhancer_processed_images" ADD CONSTRAINT "enhancer_processed_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;