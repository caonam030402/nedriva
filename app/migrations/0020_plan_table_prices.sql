-- Store recurring prices on `plans` (canonical); remove duplicate columns from `plan_benefits`.
ALTER TABLE plans
  ADD COLUMN monthly_price_usd_cents INTEGER,
  ADD COLUMN annual_price_usd_cents  INTEGER;

COMMENT ON COLUMN plans.monthly_price_usd_cents IS 'Monthly price in USD cents (null = free / no base fee). From Clerk BillingPlan.fee.amount.';
COMMENT ON COLUMN plans.annual_price_usd_cents  IS 'Annual price in USD cents (null = no annual plan). From Clerk BillingPlan.annualFee.amount.';

-- Backfill from plan_benefits if 0019 already populated them
UPDATE plans p
SET
  monthly_price_usd_cents = pb.monthly_price_usd_cents,
  annual_price_usd_cents = pb.annual_price_usd_cents
FROM plan_benefits pb
WHERE pb.plan_id = p.id
  AND (pb.monthly_price_usd_cents IS NOT NULL OR pb.annual_price_usd_cents IS NOT NULL);

ALTER TABLE plan_benefits
  DROP COLUMN IF EXISTS monthly_price_usd_cents,
  DROP COLUMN IF EXISTS annual_price_usd_cents;
