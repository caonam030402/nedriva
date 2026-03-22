'use client';

import { Button } from '@heroui/react/button';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher';
import { clerkUserButtonPopoverElements } from '@/libs/core/ClerkUserButtonAppearance';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';

type SolutionLabelKey = 'solutions_api_label' | 'solutions_ai_label';
type SolutionDescKey = 'solutions_api_desc' | 'solutions_ai_desc';

type SolutionItem = {
  key: string;
  labelKey: SolutionLabelKey;
  descKey: SolutionDescKey;
  href: string;
  highlight?: boolean;
};

const SOLUTIONS: SolutionItem[] = [
  {
    key: 'api',
    labelKey: 'solutions_api_label',
    descKey: 'solutions_api_desc',
    href: '/api-business',
  },
  {
    key: 'ai-image',
    labelKey: 'solutions_ai_label',
    descKey: 'solutions_ai_desc',
    href: '/features',
    highlight: true,
  },
];

const NavLink = (props: { href: string; children: React.ReactNode }) => (
  <Link
    href={props.href}
    className="rounded-ui-sm px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
  >
    {props.children}
  </Link>
);

/** Signed-in CTA — glass + brand hover; avoids oversized gradient competing with avatar */
const OPEN_APP_BTN_CLASS =
  'h-9 shrink-0 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-semibold tracking-wide text-foreground shadow-none ring-0 transition-colors hover:border-brand/45 hover:bg-brand/12 hover:text-brand-light';

const headerUserButtonAppearance = {
  elements: {
    ...clerkUserButtonPopoverElements,
    avatarBox: 'size-8 ring-1 ring-white/10',
  },
} as const;

export const SiteHeader = () => {
  const t = useTranslations('SiteHeader');
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/6">
      <div
        className="absolute inset-0 -z-10 backdrop-blur-md"
        style={{ background: 'rgba(9,8,15,0.80)' }}
      />
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex size-8 items-center justify-center rounded-ui-sm"
            style={{ background: 'var(--gradient-cta)' }}
          >
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="font-bold text-foreground">Nedriva</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-1 sm:flex">
          {/* Solutions dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 rounded-ui-sm px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              aria-expanded={solutionsOpen}
            >
              {t('solutions_label')}
              <svg
                className={`size-3.5 transition-transform duration-200 ${solutionsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {solutionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full left-0 z-50 mt-1 w-72 rounded-card border border-brand/20 bg-elevated p-2 shadow-card"
                >
                  {SOLUTIONS.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex flex-col gap-0.5 rounded-ui-md px-3 py-2.5 transition-colors ${
                        item.highlight ? 'bg-brand/10 hover:bg-brand/20' : 'hover:bg-surface'
                      }`}
                    >
                      <span
                        className={`flex items-center gap-1.5 text-sm font-medium ${item.highlight ? 'text-brand-light' : 'text-foreground'}`}
                      >
                        {item.highlight && (
                          <span className="rounded-pill bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-brand-light uppercase">
                            {t('solutions_new_badge')}
                          </span>
                        )}
                        {t(item.labelKey)}
                      </span>
                      <span className="text-xs text-subtle">{t(item.descKey)}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink href="/pricing">{t('pricing_link')}</NavLink>
          <NavLink href={Routes.affiliateProgram}>{t('affiliate_nav')}</NavLink>
          <NavLink href="/blog">{t('blog_link')}</NavLink>
        </nav>

        {/* ── Desktop CTAs ── */}
        <div className="hidden items-center justify-end gap-3 sm:flex">
          <LocaleSwitcher />
          <SignedOut>
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium text-muted hover:text-foreground"
              >
                {t('sign_in')}
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                className="rounded-pill font-semibold text-white shadow-cta"
                style={{ background: 'var(--gradient-cta)' }}
              >
                {t('get_started')}
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3 border-l border-white/8 pl-3">
              <Link href={Routes.dashboard.enhance}>
                <Button size="sm" variant="ghost" className={OPEN_APP_BTN_CLASS}>
                  {t('go_to_app')}
                </Button>
              </Link>
              <UserButton appearance={headerUserButtonAppearance} />
            </div>
          </SignedIn>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          type="button"
          className="flex size-9 items-center justify-center justify-self-end rounded-ui-sm text-muted transition-colors hover:bg-surface hover:text-foreground sm:hidden"
          aria-label={t('toggle_menu_label')}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-brand/20 bg-page sm:hidden"
          >
            <div className="space-y-1 px-4 pt-3 pb-4">
              <p className="mb-1 px-3 text-[11px] font-semibold tracking-widest text-subtle uppercase">
                {t('solutions_label')}
              </p>
              {SOLUTIONS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex flex-col rounded-ui-md px-3 py-2.5 transition-colors ${
                    item.highlight ? 'bg-brand/10' : 'hover:bg-surface'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span
                    className={`text-sm font-medium ${item.highlight ? 'text-brand-light' : 'text-foreground'}`}
                  >
                    {t(item.labelKey)}
                  </span>
                  <span className="text-xs text-subtle">{t(item.descKey)}</span>
                </Link>
              ))}

              <div className="mt-1 border-t border-white/6 pt-1">
                <Link
                  href="/pricing"
                  className="block rounded-ui-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('pricing_link')}
                </Link>
                <Link
                  href={Routes.affiliateProgram}
                  className="block rounded-ui-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('affiliate_nav')}
                </Link>
                <Link
                  href="/blog"
                  className="block rounded-ui-md px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('blog_link')}
                </Link>
              </div>

              <div className="flex items-center justify-between border-t border-white/6 pt-3">
                <LocaleSwitcher />
              </div>

              <SignedOut>
                <div className="flex gap-2">
                  <Link href="/sign-in" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 font-medium text-muted"
                    >
                      {t('sign_in')}
                    </Button>
                  </Link>
                  <Link href="/sign-up" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button
                      className="w-full rounded-pill font-semibold text-white"
                      style={{ background: 'var(--gradient-cta)' }}
                    >
                      {t('get_started')}
                    </Button>
                  </Link>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex flex-col gap-4 border-t border-white/6 pt-4">
                  <Link href={Routes.dashboard.enhance} onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className={`w-full ${OPEN_APP_BTN_CLASS} h-11`}>
                      {t('go_to_app')}
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center pb-1">
                    <UserButton appearance={headerUserButtonAppearance} />
                  </div>
                </div>
              </SignedIn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
