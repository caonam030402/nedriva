-- `plans`: id (uuid), payer_type, clerk_slug, name.
-- Credits & limits → `plan_benefits` (1:1). `clerk_plan_id` = Clerk BillingPlan.id (đồng bộ API).

ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "uuid_id" uuid DEFAULT gen_random_uuid();
UPDATE "plans" SET "uuid_id" = gen_random_uuid() WHERE "uuid_id" IS NULL;
ALTER TABLE "plans" ALTER COLUMN "uuid_id" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "plans_uuid_id_uidx" ON "plans" ("uuid_id");

CREATE TABLE "plan_benefits" (
  "plan_id" uuid NOT NULL REFERENCES "plans" ("uuid_id") ON DELETE CASCADE,
  "credits_per_payment" integer NOT NULL DEFAULT 0,
  "monthly_credit_allowance" integer NOT NULL DEFAULT 0,
  "max_banked_credits" integer NOT NULL DEFAULT 0,
  "max_output_megapixels" integer NOT NULL DEFAULT 0,
  "cloud_storage_months" integer NOT NULL DEFAULT 0,
  "max_input_megapixels" integer NOT NULL DEFAULT 64,
  "max_input_file_mb" integer NOT NULL DEFAULT 50,
  "active" boolean NOT NULL DEFAULT true,
  "clerk_plan_id" text,
  "clerk_payload_snapshot" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY ("plan_id")
);

INSERT INTO "plan_benefits" (
  "plan_id",
  "credits_per_payment",
  "monthly_credit_allowance",
  "max_banked_credits",
  "max_output_megapixels",
  "cloud_storage_months",
  "max_input_megapixels",
  "max_input_file_mb",
  "active",
  "clerk_payload_snapshot"
)
SELECT
  "uuid_id",
  "credits_per_payment",
  "monthly_credit_allowance",
  "max_banked_credits",
  "max_output_megapixels",
  "cloud_storage_months",
  "max_input_megapixels",
  "max_input_file_mb",
  "active",
  "clerk_payload_snapshot"
FROM "plans";

DELETE FROM "plan_features" pf
WHERE NOT EXISTS (SELECT 1 FROM "plans" p WHERE p."id" = pf."plan_id"::text);

UPDATE "user_subscription_capabilities" u
SET "plan_id" = NULL
WHERE "plan_id" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "plans" p WHERE p."id" = u."plan_id"::text);

ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS "plan_features_pkey";
ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS "plan_features_plan_id_fkey";
ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS "plan_features_plan_id_plans_id_fk";
ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS "plan_features_feature_id_fkey";
ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS "plan_features_feature_id_features_id_fk";

-- PG không cho subquery trong ALTER ... USING — dùng cột tạm + UPDATE ... FROM
ALTER TABLE "plan_features" ADD COLUMN "plan_uuid" uuid;
UPDATE "plan_features" pf
SET "plan_uuid" = p."uuid_id"
FROM "plans" p
WHERE p."id" = pf."plan_id"::text;
DELETE FROM "plan_features" WHERE "plan_uuid" IS NULL;
ALTER TABLE "plan_features" DROP COLUMN "plan_id";
ALTER TABLE "plan_features" RENAME COLUMN "plan_uuid" TO "plan_id";
ALTER TABLE "plan_features" ALTER COLUMN "plan_id" SET NOT NULL;

ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_pkey" PRIMARY KEY ("plan_id", "feature_id");
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans" ("uuid_id") ON DELETE CASCADE;
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_feature_id_fkey"
  FOREIGN KEY ("feature_id") REFERENCES "features" ("id") ON DELETE CASCADE;

ALTER TABLE "user_subscription_capabilities" DROP CONSTRAINT IF EXISTS "user_subscription_capabilities_plan_id_fkey";
ALTER TABLE "user_subscription_capabilities" DROP CONSTRAINT IF EXISTS "user_subscription_capabilities_plan_id_plans_id_fk";

ALTER TABLE "user_subscription_capabilities" ADD COLUMN "plan_uuid" uuid;
UPDATE "user_subscription_capabilities" u
SET "plan_uuid" = p."uuid_id"
FROM "plans" p
WHERE u."plan_id" IS NOT NULL
  AND p."id" = u."plan_id"::text;
ALTER TABLE "user_subscription_capabilities" DROP COLUMN "plan_id";
ALTER TABLE "user_subscription_capabilities" RENAME COLUMN "plan_uuid" TO "plan_id";

ALTER TABLE "user_subscription_capabilities" ADD CONSTRAINT "user_subscription_capabilities_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans" ("uuid_id") ON DELETE SET NULL;

ALTER TABLE "plan_benefits" DROP CONSTRAINT IF EXISTS "plan_benefits_plan_id_fkey";
ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS "plan_features_plan_id_fkey";
ALTER TABLE "user_subscription_capabilities" DROP CONSTRAINT IF EXISTS "user_subscription_capabilities_plan_id_fkey";

ALTER TABLE "plans" DROP CONSTRAINT IF EXISTS "plans_pkey";

ALTER TABLE "plans" RENAME COLUMN "id" TO "legacy_id";
ALTER TABLE "plans" RENAME COLUMN "uuid_id" TO "id";

DROP INDEX IF EXISTS "plans_uuid_id_uidx";

ALTER TABLE "plans" ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");

ALTER TABLE "plans" DROP COLUMN "legacy_id";
ALTER TABLE "plans" DROP COLUMN "credits_per_payment";
ALTER TABLE "plans" DROP COLUMN "monthly_credit_allowance";
ALTER TABLE "plans" DROP COLUMN "max_banked_credits";
ALTER TABLE "plans" DROP COLUMN "max_output_megapixels";
ALTER TABLE "plans" DROP COLUMN "cloud_storage_months";
ALTER TABLE "plans" DROP COLUMN "max_input_megapixels";
ALTER TABLE "plans" DROP COLUMN "max_input_file_mb";
ALTER TABLE "plans" DROP COLUMN "active";
ALTER TABLE "plans" DROP COLUMN "clerk_payload_snapshot";

ALTER TABLE "plans" RENAME COLUMN "display_name" TO "name";

ALTER TABLE "plan_benefits" ADD CONSTRAINT "plan_benefits_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE CASCADE;

ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE CASCADE;

ALTER TABLE "user_subscription_capabilities" ADD CONSTRAINT "user_subscription_capabilities_plan_id_fkey"
  FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE SET NULL;
