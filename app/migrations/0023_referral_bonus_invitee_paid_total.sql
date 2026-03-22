-- Basis for subscription referral bonus: total USD the invitee actually paid (invoice), not "monthly catalog".
ALTER TABLE referral_subscription_bonuses
  RENAME COLUMN monthly_plan_price_usd_basis TO invitee_paid_total_usd;

COMMENT ON COLUMN referral_subscription_bonuses.invitee_paid_total_usd IS
  'Total USD the invitee paid on the charge (Clerk paymentAttempt.totals.grand_total).';
