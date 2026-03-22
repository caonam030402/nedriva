-- Strongly-typed status columns (match Clerk Billing payloads).

CREATE TYPE "billing_subscription_status" AS ENUM (
  'abandoned',
  'active',
  'canceled',
  'ended',
  'expired',
  'incomplete',
  'past_due',
  'upcoming'
);

CREATE TYPE "billing_payment_attempt_status" AS ENUM ('pending', 'paid', 'failed');

CREATE TYPE "billing_charge_type" AS ENUM ('checkout', 'recurring');

ALTER TABLE "billing_subscriptions"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "billing_subscription_status"
  USING ("status"::"billing_subscription_status");

ALTER TABLE "billing_payment_attempts"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "billing_payment_attempt_status"
  USING ("status"::"billing_payment_attempt_status");

ALTER TABLE "billing_payment_attempts"
  ALTER COLUMN "charge_type" DROP DEFAULT,
  ALTER COLUMN "charge_type" TYPE "billing_charge_type"
  USING ("charge_type"::"billing_charge_type");
