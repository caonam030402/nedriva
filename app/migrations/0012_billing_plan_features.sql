-- Tách feature khỏi `billing_plans`: catalog feature + N-N plan ↔ feature.

CREATE TABLE "billing_features" (
  "id" text PRIMARY KEY NOT NULL,
  "display_name" varchar(128) NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "billing_plan_features" (
  "billing_plan_id" text NOT NULL REFERENCES "billing_plans" ("id") ON DELETE CASCADE,
  "feature_id" text NOT NULL REFERENCES "billing_features" ("id") ON DELETE CASCADE,
  PRIMARY KEY ("billing_plan_id", "feature_id")
);

INSERT INTO "billing_features" ("id", "display_name", "sort_order") VALUES
  ('unused_credits_rollover', 'Unused credits roll over', 10),
  ('ai_art', 'AI art', 20),
  ('remove_background', 'Remove background', 30),
  ('priority_enhancement', 'Priority enhancement', 40),
  ('chat_support', 'Chat support', 50),
  ('early_access', 'Early access', 60),
  ('flex_plan_change', 'Flexible plan change', 70),
  ('api_access', 'API access', 80)
ON CONFLICT ("id") DO NOTHING;

-- Đồng bộ từ cột boolean cũ (trước khi DROP).
INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'unused_credits_rollover' FROM "billing_plans" WHERE "feat_unused_credits_rollover" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'ai_art' FROM "billing_plans" WHERE "feat_ai_art" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'remove_background' FROM "billing_plans" WHERE "feat_remove_background" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'priority_enhancement' FROM "billing_plans" WHERE "feat_priority_enhancement" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'chat_support' FROM "billing_plans" WHERE "feat_chat_support" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'early_access' FROM "billing_plans" WHERE "feat_early_access" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'flex_plan_change' FROM "billing_plans" WHERE "feat_flex_plan_change" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

INSERT INTO "billing_plan_features" ("billing_plan_id", "feature_id")
SELECT "id", 'api_access' FROM "billing_plans" WHERE "feat_api_access" IS TRUE
ON CONFLICT ("billing_plan_id", "feature_id") DO NOTHING;

ALTER TABLE "billing_plans"
  DROP COLUMN IF EXISTS "feat_unused_credits_rollover",
  DROP COLUMN IF EXISTS "feat_ai_art",
  DROP COLUMN IF EXISTS "feat_remove_background",
  DROP COLUMN IF EXISTS "feat_priority_enhancement",
  DROP COLUMN IF EXISTS "feat_chat_support",
  DROP COLUMN IF EXISTS "feat_early_access",
  DROP COLUMN IF EXISTS "feat_flex_plan_change",
  DROP COLUMN IF EXISTS "feat_api_access";
