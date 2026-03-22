-- One row per Clerk subscription line item (`commerce_subscription_item`).
-- Populated from `subscription.*` (authoritative list) and `subscriptionItem.*` (incremental updates).

CREATE TABLE IF NOT EXISTS "billing_subscription_items" (
  "id" text PRIMARY KEY NOT NULL,
  "subscription_id" text REFERENCES "billing_subscriptions" ("id") ON DELETE SET NULL,
  "payer_id" text,
  "status" "billing_subscription_status" NOT NULL,
  "plan_id" text,
  "plan_slug" text,
  "plan_period" varchar(8),
  "credit" jsonb,
  "payload" jsonb NOT NULL,
  "last_event_type" varchar(80) NOT NULL,
  "clerk_period_start" timestamptz,
  "clerk_period_end" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "billing_subscription_items_subscription_id_idx"
  ON "billing_subscription_items" ("subscription_id");
CREATE INDEX IF NOT EXISTS "billing_subscription_items_payer_id_idx"
  ON "billing_subscription_items" ("payer_id");
CREATE INDEX IF NOT EXISTS "billing_subscription_items_status_idx"
  ON "billing_subscription_items" ("status");
