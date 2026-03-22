# Affiliate / referral program (Nedriva)

Public landing: **`/affiliate-program`** (localized prefix when not default locale). Legacy **`/affiliate`** redirects there.

## User flows

| Action | Route |
|--------|--------|
| Read overview + copy plain-text brief | `/affiliate-program` |
| Copy personal invite URL | `/boost/invite` (signed in) |
| Friend opens link before sign-up | `/sign-up?ref=<code>` (cookie set on client) |

## Rewards (code)

- Constants: `src/constants/referral.ts` — `REFERRAL_CREDITS_BUSINESS_EMAIL`, `REFERRAL_CREDITS_CONSUMER_EMAIL`, consumer domain list, `PENDING_REFERRAL_COOKIE`, `PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS`.
- Apply bonus: `src/libs/persistence/users/tryConsumePendingReferralCookie.ts` after `ensureAppUserFromCurrentClerkUser()` (read-only cookie in RSC; client clears via `POST /api/referrals/clear-pending-cookie`).

## Copyable summary

The marketing page builds `copy_full` from `AffiliateProgram.copy_full` in locale JSON, with interpolated `{business}`, `{consumer}`, `{days}`, `{cookie}`, `{example_url}`, `{invite_path}`, `{affiliate_path}`, `{site_url}`. **Update the English and French strings whenever product rules change** so “Copy all” stays accurate.

## Related docs

- Clerk + cookie behavior: `docs/clerk-user-sync.md` (Referrals section).
