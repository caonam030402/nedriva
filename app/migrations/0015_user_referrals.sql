-- Referral: mã giới thiệu + người mời; thưởng credits khi đăng ký qua link ?ref=

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" varchar(16);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referred_by_user_id" text REFERENCES "users" ("id") ON DELETE SET NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_bonus_applied_at" timestamptz;

UPDATE "users"
SET "referral_code" = lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
WHERE "referral_code" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_uidx" ON "users" ("referral_code");
ALTER TABLE "users" ALTER COLUMN "referral_code" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "users_referred_by_user_id_idx" ON "users" ("referred_by_user_id");
