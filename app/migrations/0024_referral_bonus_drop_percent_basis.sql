ALTER TABLE referral_subscription_bonuses
  DROP COLUMN IF EXISTS bonus_percent_applied,
  DROP COLUMN IF EXISTS monthly_credit_allowance_basis;

COMMENT ON COLUMN referral_subscription_bonuses.invitee_paid_total_usd IS
  'Total USD the invitee paid on the charge (Clerk paymentAttempt.totals.grand_total). bonus_amount_usd = round(this * app referral pct / 100); pct is not stored per row.';
