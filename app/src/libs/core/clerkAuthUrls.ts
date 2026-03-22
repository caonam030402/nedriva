import { routing } from '@/libs/i18n/I18nRouting';
import { ClerkLocalizations } from '@/utils/AppConfig';

/**
 * Clerk `localization` prop from app locale code.
 * @param locale - next-intl segment (e.g. `en`, `fr`)
 */
export function getClerkLocalization(locale: string) {
  return ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;
}

/**
 * Auth URLs with optional `/{locale}` prefix when not `defaultLocale` (next-intl `as-needed`).
 * Keeps sign-in, post-auth redirect, and sign-out in sync with the active locale segment.
 * @param locale - next-intl segment (e.g. `en`, `fr`)
 */
export function getClerkAuthUrls(locale: string) {
  const p = (path: string) =>
    locale === routing.defaultLocale ? path : `/${locale}${path}`;

  return {
    signInUrl: p('/sign-in'),
    signUpUrl: p('/sign-up'),
    signInFallbackRedirectUrl: p('/boost'),
    signUpFallbackRedirectUrl: p('/boost'),
    afterSignOutUrl: p('/'),
  } as const;
}
