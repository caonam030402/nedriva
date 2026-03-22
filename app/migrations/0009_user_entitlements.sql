-- Per-user feature flags (subscription tier + optional manual rows).
-- Credits on successful payment are idempotent via billing_payment_attempts.benefits_applied_at.

CREATE TYPE "user_entitlement_source" AS ENUM ('subscription', 'manual');

CREATE TABLE IF NOT EXISTS "user_entitlements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "feature_key" varchar(64) NOT NULL,
  "source" "user_entitlement_source" NOT NULL,
  "plan_slug_snapshot" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_entitlements_user_feature_source_uidx"
  ON "user_entitlements" ("user_id", "feature_key", "source");

CREATE INDEX IF NOT EXISTS "user_entitlements_user_id_idx"
  ON "user_entitlements" ("user_id");

ALTER TABLE "billing_payment_attempts"
  ADD COLUMN IF NOT EXISTS "benefits_applied_at" timestamptz;
