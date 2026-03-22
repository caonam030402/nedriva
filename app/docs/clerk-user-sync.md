# Clerk → Postgres sync (`users`)

## Environment

Add to `.env` / production:

```bash
# Clerk Dashboard → Webhooks → Signing Secret
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

## Clerk Dashboard

1. **Webhooks** → **Add Endpoint**
2. URL: `https://<domain>/api/webhooks/clerk` (dev: use [ngrok](https://ngrok.com) or Clerk CLI forwarding)
3. Subscribe: `user.created`, `user.updated`, `user.deleted`
4. Copy **Signing secret** → `CLERK_WEBHOOK_SIGNING_SECRET`

## Behavior

| Source | Action |
|--------|--------|
| Webhook | `user.created` / `user.updated` → upsert `users`; `user.deleted` → `deleted_at` (soft delete) |
| Authenticated API | `ensureAppUserFromCurrentClerkUser()` (e.g. `POST /api/process`) ensures a row exists before writing FKs to `users.id` |

**Credits:** On the first **insert** into `users`, `credit_balance` is set to `DEFAULT_NEW_USER_CREDIT_BALANCE` (10) — see `src/constants/userCredits.ts`. Later upserts **do not** overwrite the balance (profile fields only). **`GET /api/credits`** returns `{ balance }` for the signed-in user; the client hook **`useUserCreditBalanceQuery`** (`reactQueryKeys.user.credits()`) keeps the Boost header in sync after **`POST /api/process`** deducts credits (`calcEnhancerCreditsFromOps` must match UI `calcCredits`). **Public pricing UI** lives at **`/pricing`** (marketing layout, no login). The Boost header “credits” control links there.

### `column "credit_balance" of relation "users" does not exist`

The `users.credit_balance` column is added in migration **`0004_user_credit_balance`**. Apply migrations against the **same** database as `DATABASE_URL`:

```bash
npm run db:migrate
```

If you only run `next dev` without the bundled PGlite task, run `db:migrate` once after pulling. For hosted Postgres, run it in CI or manually before deploy.

**Manual SQL** (if you cannot use Drizzle migrate):

```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "credit_balance" integer DEFAULT 0 NOT NULL;
```

## Migration `0002` and FK

`enhancer_processed_images.user_id` references `users.id`. If migration fails because enhancer rows exist without matching users:

- Delete orphans: `DELETE FROM enhancer_processed_images;` (dev only), **or**
- Backfill `users` from distinct `user_id` values before running the migration.

## Referrals (`?ref=`)

- **Share link:** `/sign-up?ref=<referral_code>` (locale prefix when not default). Invite page: **`/boost/invite`**.
- **Cookie:** `pending_referral_code` is set on **sign-up** / **sign-in** when `ref` is present (`PendingReferralCookieSetter`).
- **Apply bonus:** After `ensureAppUserFromCurrentClerkUser()`, `tryConsumePendingReferralCookie()` reads the cookie, links `users.referred_by_user_id`, and adds credits per `src/constants/referral.ts` (business vs consumer email domain). Webhooks do **not** run cookie logic.
- **API:** `GET /api/referrals/me` returns `{ code, link, inviteCount, … }` for the signed-in user.

## Middleware

`/api/webhooks/*` skips Arcjet bot protection so Svix/Clerk can reach the endpoint.

## `Webhook failed` / `Failed query: insert into "users"`

1. **Run migrations** against the same `DATABASE_URL` as `next dev`:
   ```bash
   npm run db:migrate
   ```
   If logs show `pg_code=42P01` or `relation "users" does not exist`, the `users` table is missing (migration `0002` not applied).

2. **`Invalid webhook signature` (401)** — `CLERK_WEBHOOK_SIGNING_SECRET` in `.env` does not match the **Signing secret** for that Clerk endpoint (each endpoint has its own secret).

3. **500** from the handler — check server logs for Postgres/Drizzle details; the client only receives a generic error message.
