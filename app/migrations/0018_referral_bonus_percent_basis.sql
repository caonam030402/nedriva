-- Snapshot % and plan monthly-credit basis for each subscription referral bonus (UI + audit).
-- Existing rows: percent defaulted to 30; basis unknown → NULL.

ALTER TABLE "referral_subscription_bonuses"
  ADD COLUMN IF NOT EXISTS "bonus_percent_applied" integer NOT NULL DEFAULT 30;

ALTER TABLE "referral_subscription_bonuses"
  ADD COLUMN IF NOT EXISTS "monthly_credit_allowance_basis" integer;

COMMENT ON COLUMN "referral_subscription_bonuses"."bonus_percent_applied" IS
  'Percent of invitee monthly allowance used when bonus was granted; mirrors app constant at insert time.';

COMMENT ON COLUMN "referral_subscription_bonuses"."monthly_credit_allowance_basis" IS
  'Invitee plan monthly credit allowance (credits/mo) the % was applied to; NULL for legacy rows.';
