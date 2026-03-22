-- Bỏ prefix `billing_` trên tên bảng; cột FK gọn `plan_id`.

ALTER TABLE "billing_plans" RENAME TO "plans";
ALTER TABLE "billing_features" RENAME TO "features";
ALTER TABLE "billing_subscriptions" RENAME TO "subscriptions";
ALTER TABLE "billing_subscription_items" RENAME TO "subscription_items";
ALTER TABLE "billing_payment_attempts" RENAME TO "payment_attempts";
ALTER TABLE "billing_plan_features" RENAME TO "plan_features";

ALTER TABLE "plan_features" RENAME COLUMN "billing_plan_id" TO "plan_id";
ALTER TABLE "user_subscription_capabilities" RENAME COLUMN "billing_plan_id" TO "plan_id";

ALTER TABLE "plans" RENAME CONSTRAINT "billing_plans_pkey" TO "plans_pkey";
ALTER TABLE "plans" RENAME CONSTRAINT "billing_plans_clerk_slug_payer_uidx" TO "plans_clerk_slug_payer_uidx";

ALTER TABLE "features" RENAME CONSTRAINT "billing_features_pkey" TO "features_pkey";

ALTER TABLE "plan_features" RENAME CONSTRAINT "billing_plan_features_pkey" TO "plan_features_pkey";

ALTER TABLE "subscriptions" RENAME CONSTRAINT "billing_subscriptions_pkey" TO "subscriptions_pkey";
ALTER INDEX "billing_subscriptions_payer_user_id_idx" RENAME TO "subscriptions_payer_user_id_idx";
ALTER INDEX "billing_subscriptions_payer_organization_id_idx" RENAME TO "subscriptions_payer_organization_id_idx";
ALTER INDEX "billing_subscriptions_status_idx" RENAME TO "subscriptions_status_idx";

ALTER TABLE "subscription_items" RENAME CONSTRAINT "billing_subscription_items_pkey" TO "subscription_items_pkey";
ALTER INDEX "billing_subscription_items_subscription_id_idx" RENAME TO "subscription_items_subscription_id_idx";
ALTER INDEX "billing_subscription_items_payer_id_idx" RENAME TO "subscription_items_payer_id_idx";
ALTER INDEX "billing_subscription_items_status_idx" RENAME TO "subscription_items_status_idx";

ALTER TABLE "payment_attempts" RENAME CONSTRAINT "billing_payment_attempts_pkey" TO "payment_attempts_pkey";
ALTER INDEX "billing_payment_attempts_instance_payment_uidx" RENAME TO "payment_attempts_instance_payment_uidx";
ALTER INDEX "billing_payment_attempts_status_idx" RENAME TO "payment_attempts_status_idx";
