-- One row per user: explicit boolean feature flags + numeric limits (Starter / Pro / Max style).
-- Replaces prior `user_entitlements` multi-row design.

DROP TABLE IF EXISTS "user_entitlement_profile";
DROP TYPE IF EXISTS "app_feature";
DROP TABLE IF EXISTS "user_entitlements";
DROP TYPE IF EXISTS "user_entitlement_source";

CREATE TABLE "user_subscription_capabilities" (
  "user_id" text PRIMARY KEY NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "plan_slug_snapshot" text,
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
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
