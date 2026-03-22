-- Clerk Billing webhook mirror: subscriptions + payment attempts (full JSON payloads for audit).

CREATE TABLE IF NOT EXISTS "billing_subscriptions" (
  "id" text PRIMARY KEY NOT NULL,
  "status" varchar(32) NOT NULL,
  "payer_id" text NOT NULL,
  "payer_user_id" text REFERENCES "users" ("id") ON DELETE SET NULL,
  "payer_organization_id" text,
  "latest_payment_id" text,
  "payment_source_id" text,
  "items" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "payload" jsonb NOT NULL,
  "last_event_type" varchar(80) NOT NULL,
  "clerk_created_at" timestamptz,
  "clerk_updated_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "billing_subscriptions_payer_user_id_idx"
  ON "billing_subscriptions" ("payer_user_id");
CREATE INDEX IF NOT EXISTS "billing_subscriptions_payer_organization_id_idx"
  ON "billing_subscriptions" ("payer_organization_id");
CREATE INDEX IF NOT EXISTS "billing_subscriptions_status_idx"
  ON "billing_subscriptions" ("status");

CREATE TABLE IF NOT EXISTS "billing_payment_attempts" (
  "id" text PRIMARY KEY NOT NULL,
  "instance_id" text NOT NULL,
  "payment_id" text NOT NULL,
  "statement_id" text,
  "gateway_external_id" text,
  "status" varchar(24) NOT NULL,
  "charge_type" varchar(24) NOT NULL,
  "payer" jsonb,
  "payee" jsonb,
  "totals" jsonb,
  "payment_source" jsonb,
  "subscription_items" jsonb,
  "payload" jsonb NOT NULL,
  "last_event_type" varchar(80) NOT NULL,
  "clerk_created_at" timestamptz,
  "clerk_updated_at" timestamptz,
  "paid_at" timestamptz,
  "failed_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "billing_payment_attempts_payment_id_idx"
  ON "billing_payment_attempts" ("payment_id");
CREATE INDEX IF NOT EXISTS "billing_payment_attempts_status_idx"
  ON "billing_payment_attempts" ("status");
