-- Add price columns to plan_benefits (synced from Clerk BillingPlan.fee / annualFee)
ALTER TABLE plan_benefits
  ADD COLUMN monthly_price_usd_cents INTEGER,
  ADD COLUMN annual_price_usd_cents  INTEGER;

COMMENT ON COLUMN plan_benefits.monthly_price_usd_cents IS 'Monthly price in USD cents (null = free / no base fee). From Clerk BillingPlan.fee.amount.';
COMMENT ON COLUMN plan_benefits.annual_price_usd_cents  IS 'Annual price in USD cents (null = no annual plan). From Clerk BillingPlan.annualFee.amount.';
