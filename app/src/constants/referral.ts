/** Cookie set from `/sign-up?ref=` — server reads after the user signs in. */
export const PENDING_REFERRAL_COOKIE = 'pending_referral_code' as const;

/** Cookie lifetime for pending referral code (days) — keep in sync with `PendingReferralCookieSetter`. */
export const PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS = 30;

/** Credits each (referrer + invitee) when the invitee email is a “consumer” domain (gmail, …). */
export const REFERRAL_CREDITS_CONSUMER_EMAIL = 5;

/** Credits each when the invitee email looks like a work email (domain not in consumer list). */
export const REFERRAL_CREDITS_BUSINESS_EMAIL = 10;

/** % of paid-plan monthly credits (monthlyCreditAllowance) for the referrer when invitee activates an active subscription (once per invitee). */
export const REFERRAL_SUBSCRIPTION_BONUS_PERCENT = 30;

const CONSUMER_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'aol.com',
  'mail.com',
  'yandex.com',
  'gmx.com',
  'gmx.de',
  'hey.com',
  'fastmail.com',
]);

/**
 * “Consumer” email (lower bonus). Missing email → treat as consumer (safe default).
 */
export function isConsumerEmailDomain(email: string | null | undefined): boolean {
  if (email == null) {
    return true;
  }
  const at = email.lastIndexOf('@');
  if (at < 0) {
    return true;
  }
  const domain = email.slice(at + 1).trim().toLowerCase();
  return CONSUMER_EMAIL_DOMAINS.has(domain);
}

export function referralCreditsPerPersonForEmail(email: string | null | undefined): number {
  return isConsumerEmailDomain(email)
    ? REFERRAL_CREDITS_CONSUMER_EMAIL
    : REFERRAL_CREDITS_BUSINESS_EMAIL;
}
