ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "credit_balance" integer DEFAULT 0 NOT NULL;
