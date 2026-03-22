import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';

/* ── Social icons ────────────────────────────────────────────── */

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.91 19.91 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
  </svg>
);

/* ── Footer link ─────────────────────────────────────────────── */

const FooterLink = (props: { href: string; children: React.ReactNode }) => (
  <li>
    <Link
      href={props.href}
      className="text-sm text-subtle transition-colors duration-200 hover:text-foreground"
    >
      {props.children}
    </Link>
  </li>
);

/* ── Section ─────────────────────────────────────────────────── */

export const SiteFooter = async () => {
  const t = await getTranslations('SiteFooter');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/6 bg-surface">

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">

            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div
                className="flex size-8 items-center justify-center rounded-ui-sm"
                style={{ background: 'var(--gradient-cta)' }}
              >
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="font-bold text-foreground">Nedriva</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {t('tagline')}
            </p>

            {/* Social links */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('social_twitter')}
                className="flex size-8 items-center justify-center rounded-ui-sm bg-elevated text-subtle transition-colors hover:bg-brand/20 hover:text-brand-light"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('social_github')}
                className="flex size-8 items-center justify-center rounded-ui-sm bg-elevated text-subtle transition-colors hover:bg-brand/20 hover:text-brand-light"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('social_discord')}
                className="flex size-8 items-center justify-center rounded-ui-sm bg-elevated text-subtle transition-colors hover:bg-brand/20 hover:text-brand-light"
              >
                <DiscordIcon />
              </a>
            </div>
          </div>

          {/* Product column */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">
              {t('col_product')}
            </p>
            <ul className="space-y-2.5">
              <FooterLink href="/tools/upscaler">{t('link_upscaler')}</FooterLink>
              <FooterLink href="/tools/denoiser">{t('link_denoiser')}</FooterLink>
              <FooterLink href="/tools/sharpener">{t('link_sharpener')}</FooterLink>
              <FooterLink href="/tools/bg-remover">{t('link_bg_remover')}</FooterLink>
              <FooterLink href="/tools/restorer">{t('link_restorer')}</FooterLink>
              <FooterLink href="/tools/face-enhancer">{t('link_face')}</FooterLink>
              <FooterLink href="/api-business">{t('link_api')}</FooterLink>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">
              {t('col_company')}
            </p>
            <ul className="space-y-2.5">
              <FooterLink href="/pricing">{t('link_pricing')}</FooterLink>
              <FooterLink href="/blog">{t('link_blog')}</FooterLink>
              <FooterLink href="/about">{t('link_about')}</FooterLink>
              <FooterLink href={Routes.affiliateProgram}>{t('link_affiliate')}</FooterLink>
              <FooterLink href="/changelog">{t('link_changelog')}</FooterLink>
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-subtle">
              {t('col_legal')}
            </p>
            <ul className="space-y-2.5">
              <FooterLink href="/privacy">{t('link_privacy')}</FooterLink>
              <FooterLink href="/terms">{t('link_terms')}</FooterLink>
              <FooterLink href="/cookies">{t('link_cookies')}</FooterLink>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-subtle">
            {t('copyright', { year })}
          </p>

          {/* Status badge */}
          <div className="flex items-center gap-1.5 text-xs text-subtle">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            All systems operational
          </div>
        </div>
      </div>

    </footer>
  );
};
