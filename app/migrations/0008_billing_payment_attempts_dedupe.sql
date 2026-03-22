-- One row per Clerk payment: `paymentAttempt.created` then `paymentAttempt.updated` share (instance_id, payment_id).

WITH keepers AS (
  SELECT DISTINCT ON ("instance_id", "payment_id") "id"
    FROM "billing_payment_attempts"
ORDER BY "instance_id", "payment_id", "updated_at" DESC NULLS LAST, "clerk_updated_at" DESC NULLS LAST
)
DELETE FROM "billing_payment_attempts" AS p
 WHERE NOT EXISTS (SELECT 1 FROM keepers AS k WHERE k."id" = p."id");

DROP INDEX IF EXISTS "billing_payment_attempts_payment_id_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "billing_payment_attempts_instance_payment_uidx"
  ON "billing_payment_attempts" ("instance_id", "payment_id");
