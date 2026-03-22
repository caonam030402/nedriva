-- Referral: đếm lượt mở link sign-up + thưởng referrer khi invitee có gói trả phí (active)

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_link_click_count" integer DEFAULT 0 NOT NULL;

CREATE TABLE IF NOT EXISTS "referral_subscription_bonuses" (
  "invitee_user_id" text PRIMARY KEY REFERENCES "users" ("id") ON DELETE CASCADE,
  "referrer_user_id" text NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "credits_awarded" integer NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "referral_sub_bonus_referrer_idx"
  ON "referral_subscription_bonuses" ("referrer_user_id");
