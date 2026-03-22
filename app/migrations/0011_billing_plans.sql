-- Catalog: Clerk plan slugs × payer type (cá nhân vs doanh nghiệp). Webhook đọc từ đây; có thể bổ sung row khi Clerk thêm plan.

CREATE TYPE "plan_payer_type" AS ENUM ('user', 'organization');

CREATE TABLE "billing_plans" (
  "id" text PRIMARY KEY NOT NULL,
  "payer_type" "plan_payer_type" NOT NULL,
  "clerk_slug" text NOT NULL,
  "display_name" varchar(128),
  "credits_per_payment" integer NOT NULL DEFAULT 0,
  "monthly_credit_allowance" integer NOT NULL DEFAULT 0,
  "max_banked_credits" integer NOT NULL DEFAULT 0,
  "max_output_megapixels" integer NOT NULL DEFAULT 0,
  "cloud_storage_months" integer NOT NULL DEFAULT 0,
  "max_input_megapixels" integer NOT NULL DEFAULT 64,
  "max_input_file_mb" integer NOT NULL DEFAULT 50,
  "feat_unused_credits_rollover" boolean NOT NULL DEFAULT false,
  "feat_ai_art" boolean NOT NULL DEFAULT false,
  "feat_remove_background" boolean NOT NULL DEFAULT false,
  "feat_priority_enhancement" boolean NOT NULL DEFAULT false,
  "feat_chat_support" boolean NOT NULL DEFAULT false,
  "feat_early_access" boolean NOT NULL DEFAULT false,
  "feat_flex_plan_change" boolean NOT NULL DEFAULT false,
  "feat_api_access" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "clerk_payload_snapshot" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "billing_plans_clerk_slug_payer_uidx" UNIQUE ("clerk_slug", "payer_type")
);

ALTER TABLE "user_subscription_capabilities"
  ADD COLUMN IF NOT EXISTS "billing_plan_id" text REFERENCES "billing_plans" ("id") ON DELETE SET NULL;

-- Seed (đồng bộ với copy pricing; sửa nếu Dashboard Clerk khác slug)
INSERT INTO "billing_plans" (
  "id", "payer_type", "clerk_slug", "display_name", "credits_per_payment",
  "monthly_credit_allowance", "max_banked_credits", "max_output_megapixels", "cloud_storage_months",
  "max_input_megapixels", "max_input_file_mb",
  "feat_unused_credits_rollover", "feat_ai_art", "feat_remove_background", "feat_priority_enhancement",
  "feat_chat_support", "feat_early_access", "feat_flex_plan_change", "feat_api_access"
) VALUES
  ('user_starter', 'user', 'starter', 'Starter', 100,
   100, 600, 256, 3, 64, 50,
   true, true, true, true, true, true, true, false),
  ('user_pro', 'user', 'pro', 'Pro', 300,
   300, 1800, 350, 6, 64, 50,
   true, true, true, true, true, true, true, false),
  ('user_max', 'user', 'max', 'Max', 500,
   500, 3000, 512, 6, 64, 50,
   true, true, true, true, true, true, true, true),
  ('org_1000', 'organization', '1000', 'Team 1k', 1000,
   1000, 6000, 350, 6, 64, 50,
   true, true, true, true, true, true, true, false),
  ('org_2500', 'organization', '2500', 'Team 2.5k', 2500,
   2500, 15000, 350, 6, 64, 50,
   true, true, true, true, true, true, true, false),
  ('org_5000', 'organization', '5000', 'Team 5k', 5000,
   5000, 30000, 512, 6, 64, 50,
   true, true, true, true, true, true, true, true)
ON CONFLICT ("id") DO NOTHING;
