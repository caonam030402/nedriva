# Clerk Billing → credits & plan capabilities

## Flow

1. **`paymentAttempt.*` → `status: paid`**  
   Grant credits from line-item slugs → read `plan_benefits.credits_per_payment` (join `plans` by `clerk_slug` + payer).  
   Idempotent via `payment_attempts.benefits_applied_at`.

2. **`subscription.*`**  
   Call **`billing.getPlanList`** (Clerk) → upsert **`plans`** (identity) + **`plan_benefits`** (snapshot + `clerk_plan_id`) + **`plan_features`**.  
   Merge entitlements into **`user_subscription_capabilities`** (FK `plan_id` = internal uuid).  
   Non-active subscription ⇒ **free-tier defaults**.

## Schema

**Catalog**

- **`plans`**: `id` (uuid), `payer_type`, `clerk_slug`, `name` — synced name/slug/payer from Clerk.
- **`plan_benefits`**: 1:1 with `plans` — `credits_per_payment`, numeric limits, `active`, **`clerk_plan_id`** (Clerk `BillingPlan.id`), `clerk_payload_snapshot` (JSON on sync).
- **`features`**, **`plan_features`**: feature catalog + plan links.

**Clerk mirror**

- **`subscriptions`**, **`subscription_items`**, **`payment_attempts`**.

**`user_subscription_capabilities`**

- Snapshot booleans + numbers for API; **`plan_id`** → `plans.id` (uuid).

## Code

- Slug resolution + merge caps: `src/constants/billingPlanBenefits.ts`.
- Catalog feature id → booleans: `src/constants/billingCatalogFeatures.ts`.
- Join `plans` + `plan_benefits`: `src/libs/persistence/billing/planCatalog.ts`.
- Sync Clerk → DB: `src/libs/persistence/billing/syncBillingPlansFromClerk.ts` + `POST /api/billing/sync-plans-from-clerk`.
- Read caps: `src/libs/persistence/users/userEntitlements.ts`.

## Migrations

- **`0014`**: `plans.id` → uuid; `display_name` → `name`; split limits/credits into **`plan_benefits`**.  
- Run `yarn db:migrate` or `npm run db:migrate`.
