/**
 * next-intl `AppConfig` — ties `Locale` and `Messages` to this app’s routing + default catalog.
 * Lives under `libs/i18n` with runtime config (`I18n.ts`), not under `src/types` (feature / API types only).
 */
import type { routing } from '@/libs/i18n/I18nRouting';
import type messages from '@/locales/en.json';

declare module 'next-intl' {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
