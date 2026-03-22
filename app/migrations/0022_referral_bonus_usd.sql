-- Subscription referral bonus: store USD from % of invitee monthly plan price (no new enhancer credits).

ALTER TABLE referral_subscription_bonuses
  ADD COLUMN IF NOT EXISTS bonus_amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE referral_subscription_bonuses
  ADD COLUMN IF NOT EXISTS monthly_plan_price_usd_basis NUMERIC(10, 2);

-- Map monthly credit allowance → catalog monthly USD (must match MONTHLY_CREDIT_ALLOWANCE_USD in app).
UPDATE referral_subscription_bonuses
SET monthly_plan_price_usd_basis = CASE monthly_credit_allowance_basis
  WHEN 100 THEN 9
  WHEN 300 THEN 24
  WHEN 500 THEN 34
  WHEN 1000 THEN 72
  WHEN 2500 THEN 149
  WHEN 5000 THEN 279
  ELSE NULL
END::numeric(10, 2)
WHERE monthly_plan_price_usd_basis IS NULL;

-- Legacy rows: bonus was credits; approximate USD from stored basis.
UPDATE referral_subscription_bonuses
SET bonus_amount_usd = ROUND(
  (credits_awarded::numeric * monthly_plan_price_usd_basis)
    / NULLIF(monthly_credit_allowance_basis, 0),
  2
)
WHERE credits_awarded > 0
  AND monthly_credit_allowance_basis IS NOT NULL
  AND monthly_credit_allowance_basis > 0
  AND monthly_plan_price_usd_basis IS NOT NULL
  AND (bonus_amount_usd IS NULL OR bonus_amount_usd = 0);

COMMENT ON COLUMN referral_subscription_bonuses.bonus_amount_usd IS 'One-time referrer bonus in USD (% of invitee monthly plan price at grant).';
COMMENT ON COLUMN referral_subscription_bonuses.monthly_plan_price_usd_basis IS 'Invitee monthly subscription price in USD snapshot used for the bonus.';
