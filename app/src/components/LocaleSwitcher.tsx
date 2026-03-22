'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { usePathname, useRouter } from '@/libs/i18n/I18nNavigation';
import { routing } from '@/libs/i18n/I18nRouting';

/* ── Locale metadata ─────────────────────────────────────────── */

const LOCALE_META: Record<string, { label: string; short: string; flag: string }> = {
  en: { label: 'English', short: 'EN', flag: '🇬🇧' },
  fr: { label: 'Français', short: 'FR', flag: '🇫🇷' },
};

const GlobeIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
    <circle cx="10" cy="10" r="7.5" />
    <path strokeLinecap="round" d="M10 2.5c0 0-3 3-3 7.5s3 7.5 3 7.5M10 2.5c0 0 3 3 3 7.5s-3 7.5-3 7.5M2.5 10h15" />
  </svg>
);

const ChevronIcon = (props: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={`size-3 transition-transform duration-200 ${props.open ? 'rotate-180' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
  </svg>
);

/* ── Component ───────────────────────────────────────────────── */

export const LocaleSwitcher = () => {
  const t = useTranslations('LocaleSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_META[currentLocale] ?? { label: currentLocale, short: currentLocale.toUpperCase(), flag: '🌐' };

  const handleSelect = (locale: string) => {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }
    const { search } = window.location;
    router.push(`${pathname}${search}`, { locale, scroll: false });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('change_language')}
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 rounded-ui-sm px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-foreground"
      >
        <GlobeIcon />
        <span>{current.short}</span>
        <ChevronIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-card border border-brand/20 bg-elevated shadow-card"
            >
              {routing.locales.map((locale) => {
                const meta = LOCALE_META[locale] ?? { label: locale, short: locale.toUpperCase(), flag: '🌐' };
                const isActive = locale === currentLocale;
                return (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => handleSelect(locale)}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-brand/15 font-semibold text-brand-light'
                        : 'text-muted hover:bg-surface hover:text-foreground'
                    }`}
                  >
                    <span className="text-base leading-none">{meta.flag}</span>
                    <span>{meta.label}</span>
                    {isActive && (
                      <svg viewBox="0 0 16 16" fill="currentColor" className="ml-auto size-3.5 text-brand-light">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
