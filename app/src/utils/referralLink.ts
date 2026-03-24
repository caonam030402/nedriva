import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

/**
 * Normalizes a raw referral code string.
 * - Trims whitespace
 * - Converts to lowercase
 * - Removes all non-alphanumeric characters
 * - Validates length (4-16 characters)
 * @param raw - The raw referral code string
 * @returns Normalized code or null if invalid
 */
export function normalizeRefCode(raw: string): string | null {
  const t = raw.trim().toLowerCase().replaceAll(/[^a-z0-9]/g, '');
  if (t.length < 4 || t.length > 16) {
    return null;
  }
  return t;
}

/**
 * Absolute sign-up URL with `?ref=` for sharing.
 * @param locale
 * @param referralCode
 */
export function buildReferralSignupLink(locale: string, referralCode: string): string {
  const base = getBaseUrl().replace(/\/$/, '');
  const signUpPath = getI18nPath('/sign-up', locale);
  return `${base}${signUpPath}?ref=${encodeURIComponent(referralCode)}`;
}
