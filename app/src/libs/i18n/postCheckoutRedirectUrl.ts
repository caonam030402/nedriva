import { AppConfig } from '@/utils/AppConfig';

/**
 * Path with next-intl prefix (`as-needed` skips prefix for default locale).
 */
export function getLocalizedPath(path: string, locale: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (AppConfig.i18n.localePrefix === 'as-needed' && locale === AppConfig.i18n.defaultLocale) {
    return p;
  }
  return `/${locale}${p}`;
}

/**
 * Absolute URL for Clerk Billing `newSubscriptionRedirectUrl` (same tab after checkout).
 */
export function getPostCheckoutAbsoluteUrl(path: string, locale: string, origin: string | null) {
  const localized = getLocalizedPath(path, locale);
  if (origin) {
    return `${origin.replace(/\/$/, '')}${localized}`;
  }
  return localized;
}
