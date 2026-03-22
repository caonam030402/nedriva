import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';
import {
  PENDING_REFERRAL_COOKIE,
  PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
  REFERRAL_CREDITS_BUSINESS_EMAIL,
  REFERRAL_CREDITS_CONSUMER_EMAIL,
} from '@/constants/referral';
import { AffiliateProgramCopyBlock } from '@/components/pages/marketing/affiliate-program/AffiliateProgramCopyBlock';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';
import { Routes } from '@/utils/Routes';

type Props = {
  locale: string;
};

type FeatureIconType = 'both' | 'tier' | 'bolt' | 'link' | 'chart' | 'stack';

function FeatureIcon({ type }: { type: FeatureIconType }) {
  const common = 'size-5 text-violet-300';
  switch (type) {
    case 'both':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'tier':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'bolt':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'link':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M10 13a5 5 0 007.54.54l2-2a5 5 0 00-7.07-7.07l-1.41 1.41M14 11a5 5 0 00-7.54-.54l-2 2a5 5 0 007.07 7.07l1.41-1.41"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M18 20V10M12 20V4M6 20v-6"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      );
    case 'stack':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

const FEATURE_ROWS: { icon: FeatureIconType; titleKey: 'f1_title' | 'f2_title' | 'f3_title' | 'f4_title' | 'f5_title' | 'f6_title'; descKey: 'f1_desc' | 'f2_desc' | 'f3_desc' | 'f4_desc' | 'f5_desc' | 'f6_desc' }[] = [
  { icon: 'both', titleKey: 'f1_title', descKey: 'f1_desc' },
  { icon: 'tier', titleKey: 'f2_title', descKey: 'f2_desc' },
  { icon: 'bolt', titleKey: 'f3_title', descKey: 'f3_desc' },
  { icon: 'link', titleKey: 'f4_title', descKey: 'f4_desc' },
  { icon: 'chart', titleKey: 'f5_title', descKey: 'f5_desc' },
  { icon: 'stack', titleKey: 'f6_title', descKey: 'f6_desc' },
];

export async function AffiliateProgramView(props: Props) {
  const { locale } = props;
  const t = await getTranslations({ locale, namespace: 'AffiliateProgram' });

  const signUpHref = getI18nPath(Routes.auth.signUp, locale);
  const inviteHref = getI18nPath(Routes.dashboard.invite, locale);
  const pricingHref = getI18nPath(Routes.pricing, locale);
  const affiliateProgramHref = getI18nPath(Routes.affiliateProgram, locale);

  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const exampleSignUpUrl = `${baseUrl}${getI18nPath('/sign-up', locale)}?ref=YOUR_CODE`;

  const fullCopyText = t('copy_full', {
    business: REFERRAL_CREDITS_BUSINESS_EMAIL,
    consumer: REFERRAL_CREDITS_CONSUMER_EMAIL,
    days: PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
    cookie: PENDING_REFERRAL_COOKIE,
    example_url: exampleSignUpUrl,
    invite_path: inviteHref,
    affiliate_path: affiliateProgramHref,
    site_url: baseUrl,
  });

  const faqs = [
    { q: t('faq1_q'), a: t('faq1_a') },
    { q: t('faq2_q'), a: t('faq2_a') },
    { q: t('faq3_q'), a: t('faq3_a') },
    { q: t('faq4_q'), a: t('faq4_a') },
    { q: t('faq5_q'), a: t('faq5_a') },
  ];

  return (
    <div className="text-foreground">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/6">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(139,92,246,0.35) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(34,197,94,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
              {t('hero_eyebrow')}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              <span className="text-foreground">{t('hero_title_before')} </span>
              <span className="text-success">{t('hero_title_highlight')}</span>
              <span className="text-foreground"> {t('hero_title_after')}</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {t('hero_subtitle', {
                business: REFERRAL_CREDITS_BUSINESS_EMAIL,
                consumer: REFERRAL_CREDITS_CONSUMER_EMAIL,
              })}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={signUpHref}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-semibold text-[#09080f] transition-opacity hover:opacity-90"
              >
                {t('cta_sign_up')}
              </Link>
              <Link
                href={inviteHref}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-brand/10"
              >
                {t('cta_get_link')}
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg lg:mx-0 lg:max-w-none">
            <div
              className="absolute inset-0 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
              style={{ boxShadow: '0 0 80px -20px rgba(139, 92, 246, 0.4)' }}
            />
            <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8 sm:p-10">
              <div className="flex w-full max-w-sm items-end justify-center gap-3 sm:gap-4">
                <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  <div
                    className="aspect-[4/3] bg-gradient-to-br from-violet-950/80 to-page"
                    style={{ filter: 'blur(6px)' }}
                  />
                  <p className="px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-subtle">
                    {t('demo_before')}
                  </p>
                </div>
                <div className="flex-1 overflow-hidden rounded-xl border border-success/30 bg-black/40 ring-1 ring-success/20">
                  <div className="aspect-[4/3] bg-gradient-to-br from-violet-600/30 via-fuchsia-900/20 to-page" />
                  <p className="px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-success">
                    {t('demo_after')}
                  </p>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-muted">{t('demo_caption')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why grid ── */}
      <section className="border-b border-white/6 bg-page py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t('why_title')}</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {FEATURE_ROWS.map((row) => (
              <div
                key={row.titleKey}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-violet-500/25"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-violet-500/15">
                  <FeatureIcon type={row.icon} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t(row.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(row.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works (numbered) ── */}
      <section className="border-b border-white/6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t('how_title')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted sm:text-base">{t('how_subtitle')}</p>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { n: 1, titleKey: 'how_step1_title', descKey: 'how_step1_desc' },
                { n: 2, titleKey: 'how_step2_title', descKey: 'how_step2_desc' },
                { n: 3, titleKey: 'how_step3_title', descKey: 'how_step3_desc' },
                { n: 4, titleKey: 'how_step4_title', descKey: 'how_step4_desc' },
              ] as const
            ).map((row) => (
              <li
                key={row.n}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 pt-8"
              >
                <span className="absolute -top-3 left-4 flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {row.n}
                </span>
                <h3 className="font-semibold">{t(row.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(row.descKey, {
                    invite_path: inviteHref,
                    days: PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
                    cookie: PENDING_REFERRAL_COOKIE,
                  })}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Program details (quick reference) ── */}
      <section className="border-b border-white/6 bg-page py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{t('detail_title')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted sm:text-base">
            {t('detail_subtitle', {
              business: REFERRAL_CREDITS_BUSINESS_EMAIL,
              consumer: REFERRAL_CREDITS_CONSUMER_EMAIL,
            })}
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { titleKey: 'detail_rewards_title', bodyKey: 'detail_rewards_body' },
                { titleKey: 'detail_tracking_title', bodyKey: 'detail_tracking_body' },
                { titleKey: 'detail_rules_title', bodyKey: 'detail_rules_body' },
                { titleKey: 'detail_where_title', bodyKey: 'detail_where_body' },
              ] as const
            ).map((row) => (
              <div
                key={row.titleKey}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-light">
                  {t(row.titleKey)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t(row.bodyKey, {
                    business: REFERRAL_CREDITS_BUSINESS_EMAIL,
                    consumer: REFERRAL_CREDITS_CONSUMER_EMAIL,
                    days: PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
                    cookie: PENDING_REFERRAL_COOKIE,
                    invite_path: inviteHref,
                    sign_up_path: signUpHref,
                    affiliate_path: affiliateProgramHref,
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Copyable full brief ── */}
      <section className="border-b border-white/6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AffiliateProgramCopyBlock
            text={fullCopyText}
            title={t('copy_block_title')}
            subtitle={t('copy_block_subtitle')}
            copyLabel={t('copy_button')}
            copiedLabel={t('copy_copied')}
          />
        </div>
      </section>

      {/* ── Partner strip (light) ── */}
      <section className="border-b border-white/6 bg-[#f4f2fa] py-16 text-[#120f1e] sm:py-20 lg:py-24 dark:bg-elevated dark:text-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('partner_title')}</h2>
            <p className="mt-4 text-pretty leading-relaxed opacity-90">{t('partner_body')}</p>
            <Link
              href={inviteHref}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#09080f] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-foreground dark:text-[#09080f]"
            >
              {t('partner_cta')}
            </Link>
            <p className="mt-6 text-sm opacity-75">
              <Link href={pricingHref} className="font-medium underline decoration-white/30 underline-offset-4 hover:opacity-100">
                {t('partner_pricing_link')}
              </Link>
            </p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-surface">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  {t('partner_demo_label')}
                </span>
                <span className="rounded-pill bg-success/15 px-3 py-1 text-xs font-bold text-success">
                  {t('partner_badge')}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/[0.04] p-3 dark:bg-white/5">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 to-gray-400 opacity-40 dark:from-gray-700 dark:to-gray-900" />
                </div>
                <div className="rounded-xl bg-violet-500/10 p-3 ring-1 ring-violet-500/20">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-violet-400/40 to-fuchsia-500/30" />
                </div>
              </div>
              <p className="mt-4 text-center text-sm opacity-80">{t('partner_demo_caption')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b border-white/6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight">{t('faq_title')}</h2>
          <div className="mt-10 space-y-2">
            {faqs.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.02] open:border-violet-500/20 open:bg-violet-500/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-medium sm:px-5">
                  <span>{item.q}</span>
                  <span className="shrink-0 text-subtle transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 text-sm leading-relaxed text-muted sm:px-5">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(109,40,217,0.5) 0%, transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('bottom_title')}</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">{t('bottom_subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={signUpHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--gradient-cta)' }}
            >
              {t('bottom_cta')}
            </Link>
            <Link
              href={inviteHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold backdrop-blur-sm hover:border-white/35"
            >
              {t('cta_get_link')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
