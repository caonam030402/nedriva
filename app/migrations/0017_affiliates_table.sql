-- Metrics giới thiệu / affiliate: tách khỏi `users` (1–1 theo user_id)

CREATE TABLE IF NOT EXISTS "affiliates" (
  "user_id" text PRIMARY KEY REFERENCES "users" ("id") ON DELETE CASCADE,
  "link_click_count" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

INSERT INTO "affiliates" ("user_id", "link_click_count")
SELECT "id", COALESCE("referral_link_click_count", 0)
FROM "users"
ON CONFLICT ("user_id") DO NOTHING;

ALTER TABLE "users" DROP COLUMN IF EXISTS "referral_link_click_count";
