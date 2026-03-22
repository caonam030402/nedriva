import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

/** Absolute sign-up URL with `?ref=` for sharing. */
export function buildReferralSignupLink(locale: string, referralCode: string): string {
  const base = getBaseUrl().replace(/\/$/, '');
  const signUpPath = getI18nPath('/sign-up', locale);
  return `${base}${signUpPath}?ref=${encodeURIComponent(referralCode)}`;
}
