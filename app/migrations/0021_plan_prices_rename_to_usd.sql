-- Convert and rename: cents INTEGER → USD numeric(10,2)
-- PostgreSQL requires each ALTER COLUMN in its own statement
ALTER TABLE plans ALTER COLUMN monthly_price_usd_cents TYPE NUMERIC(10,2) USING monthly_price_usd_cents / 100.0;
ALTER TABLE plans ALTER COLUMN annual_price_usd_cents  TYPE NUMERIC(10,2) USING annual_price_usd_cents  / 100.0;

ALTER TABLE plans RENAME COLUMN monthly_price_usd_cents TO monthly_price_usd;
ALTER TABLE plans RENAME COLUMN annual_price_usd_cents  TO annual_price_usd;

COMMENT ON COLUMN plans.monthly_price_usd IS 'Monthly price in USD (null = free / no base fee). From Clerk BillingPlan.fee.amount / 100.';
COMMENT ON COLUMN plans.annual_price_usd  IS 'Annual price in USD (null = no annual plan). From Clerk BillingPlan.annualFee.amount / 100.';
