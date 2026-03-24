import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check, Gift, Link2, Scale, Timer } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/common/Badge';
import {
  PENDING_REFERRAL_COOKIE,
  PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
  REFERRAL_CREDITS_BUSINESS_EMAIL,
  REFERRAL_CREDITS_CONSUMER_EMAIL,
  REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
} from '@/constants/referral';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Button } from '@/components/ui/Button';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';
import { Routes } from '@/utils/Routes';
import { AffiliateProgramCopyBlock } from './AffiliateProgramCopyBlock';

/* ═══════════════════════════════════════════════════════════════════
   Shared data
   ═══════════════════════════════════════════════════════════════════ */

const FEATURE_ROWS = [
  {
    iconType: 'both' as const,
    titleKey: 'f1_title' as const,
    descKey: 'f1_desc' as const,
  },
  {
    iconType: 'tier' as const,
    titleKey: 'f2_title' as const,
    descKey: 'f2_desc' as const,
  },
  {
    iconType: 'bolt' as const,
    titleKey: 'f3_title' as const,
    descKey: 'f3_desc' as const,
  },
  {
    iconType: 'link' as const,
    titleKey: 'f4_title' as const,
    descKey: 'f4_desc' as const,
  },
  {
    iconType: 'chart' as const,
    titleKey: 'f5_title' as const,
    descKey: 'f5_desc' as const,
  },
  {
    iconType: 'stack' as const,
    titleKey: 'f6_title' as const,
    descKey: 'f6_desc' as const,
  },
];

const EARN_STEPS_SIGNUP = [
  {
    titleKey: 'earn_signup_step1_title' as const,
    descKey: 'earn_signup_step1_desc' as const,
  },
  {
    titleKey: 'earn_signup_step2_title' as const,
    descKey: 'earn_signup_step2_desc' as const,
  },
  {
    titleKey: 'earn_signup_step3_title' as const,
    descKey: 'earn_signup_step3_desc' as const,
  },
] as const;

const EARN_STEPS_SUBSCRIPTION = [
  {
    titleKey: 'earn_sub_step1_title' as const,
    descKey: 'earn_sub_step1_desc' as const,
  },
  {
    titleKey: 'earn_sub_step2_title' as const,
    descKey: 'earn_sub_step2_desc' as const,
  },
  {
    titleKey: 'earn_sub_step3_title' as const,
    descKey: 'earn_sub_step3_desc' as const,
  },
] as const;

const REFERENCE_ROWS: {
  icon: LucideIcon;
  titleKey:
    | 'detail_rules_title'
    | 'detail_tracking_title'
    | 'detail_where_title'
    | 'detail_cookie_title';
  bodyKey:
    | 'detail_rules_body'
    | 'detail_tracking_body'
    | 'detail_where_body'
    | 'detail_cookie_body';
}[] = [
  { icon: Scale, titleKey: 'detail_rules_title', bodyKey: 'detail_rules_body' },
  { icon: Timer, titleKey: 'detail_tracking_title', bodyKey: 'detail_tracking_body' },
  { icon: Link2, titleKey: 'detail_cookie_title', bodyKey: 'detail_cookie_body' },
  { icon: ArrowRight, titleKey: 'detail_where_title', bodyKey: 'detail_where_body' },
];

/* ═══════════════════════════════════════════════════════════════════
   Feature icon — inline SVG
   ═══════════════════════════════════════════════════════════════════ */

const FeatureIcon = ({ type }: { type: (typeof FEATURE_ROWS)[number]['iconType'] }) => {
  const cls = 'size-5 shrink-0 text-brand-light';
  const paths: Record<typeof type, React.ReactNode> = {
    both: (
      <g
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </g>
    ),
    tier: (
      <g stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" fill="none">
        <path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z" />
      </g>
    ),
    bolt: (
      <g
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </g>
    ),
    link: (
      <g stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none">
        <path d="M10 13a5 5 0 007.54.54l2-2a5 5 0 00-7.07-7.07l-1.41 1.41" />
        <path d="M14 11a5 5 0 00-7.54-.54l-2 2a5 5 0 007.07 7.07l1.41-1.41" />
      </g>
    ),
    chart: (
      <g stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" fill="none">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </g>
    ),
    stack: (
      <g
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className={cls} aria-hidden>
      {paths[type]}
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Main view
   ═══════════════════════════════════════════════════════════════════ */

type Props = {
  locale: string;
  exampleMonthlyPlanUsd?: number;
};

export async function AffiliateProgramView(props: Props) {
  const { locale } = props;
  const t = await getTranslations({ locale, namespace: 'AffiliateProgram' });

  const signUpHref = getI18nPath(Routes.auth.signUp, locale);
  const inviteHref = getI18nPath(Routes.dashboard.invite, locale);
  const pricingHref = getI18nPath(Routes.pricing, locale);
  const affiliateProgramHref = getI18nPath(Routes.affiliateProgram, locale);

  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const exampleSignUpUrl = `${baseUrl}${getI18nPath('/sign-up', locale)}?ref=YOUR_CODE`;

  const exampleMonthlyUsd = props.exampleMonthlyPlanUsd ?? 15;
  const exampleCashUsd = exampleMonthlyUsd * (REFERRAL_SUBSCRIPTION_BONUS_PERCENT / 100);
  const exampleCashUsdFormatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(exampleCashUsd);

  const fullCopyText = t('copy_full', {
    bonus_pct: REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
    example_monthly_usd: exampleMonthlyUsd,
    example_cash_usd: exampleCashUsdFormatted,
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
    {
      key: 'faq1',
      q: t('faq1_q'),
      a: t('faq1_a', {
        bonus_pct: REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
        example_monthly_usd: exampleMonthlyUsd,
        example_cash_usd: exampleCashUsdFormatted,
      }),
    },
    { key: 'faq2', q: t('faq2_q'), a: t('faq2_a') },
    { key: 'faq3', q: t('faq3_q'), a: t('faq3_a') },
    { key: 'faq4', q: t('faq4_q'), a: t('faq4_a') },
    { key: 'faq5', q: t('faq5_q'), a: t('faq5_a') },
  ];

  /* Shared interpolation objects */
  const signupInterpolation = {
    days: PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
    cookie: PENDING_REFERRAL_COOKIE,
    invite_path: inviteHref,
    business: REFERRAL_CREDITS_BUSINESS_EMAIL,
    consumer: REFERRAL_CREDITS_CONSUMER_EMAIL,
  } as const;

  const subInterpolation = {
    bonus_pct: REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
    example_monthly_usd: exampleMonthlyUsd,
    example_cash_usd: exampleCashUsdFormatted,
    invite_path: inviteHref,
  } as const;

  const refInterpolation = {
    days: PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
    cookie: PENDING_REFERRAL_COOKIE,
    invite_path: inviteHref,
    sign_up_path: signUpHref,
    affiliate_path: affiliateProgramHref,
  } as const;

  return (
    <div className="text-foreground">
      {/* ══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-28 sm:px-6 sm:pt-28 sm:pb-36 lg:px-8">
          <div className="flex justify-center">
            <Badge variant="brand" pulse>
              {t('hero_eyebrow')}
            </Badge>
          </div>

          <h1 className="mt-6 text-center font-display text-5xl leading-[1.08] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t('hero_title_before')}{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-text)' }}
            >
              {t('hero_title_highlight')}
            </span>{' '}
            {t('hero_title_after')}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-muted sm:text-xl">
            {t('hero_subtitle', {
              bonus_pct: REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
              example_monthly_usd: exampleMonthlyUsd,
              example_cash_usd: exampleCashUsdFormatted,
              business: REFERRAL_CREDITS_BUSINESS_EMAIL,
              consumer: REFERRAL_CREDITS_CONSUMER_EMAIL,
            })}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={signUpHref} className="inline-flex">
              <Button variant="primary" size="lg" className="gap-1.5">
                {t('cta_sign_up')}
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href={inviteHref} className="inline-flex">
              <Button variant="outline" size="lg" className="gap-2">
                {t('cta_get_link')}
              </Button>
            </Link>
          </div>

          {/* Link preview card */}
          <div className="relative mx-auto mt-16 max-w-lg">
            <div
              className="pointer-events-none absolute -inset-4 rounded-card"
              style={{ boxShadow: '0 0 80px -20px rgba(232, 197, 71, 0.35)' }}
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-card border border-white/12 bg-white/3 p-5 backdrop-blur-md">
              <span className="rounded-pill bg-brand/15 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-brand-light uppercase">
                {t('demo_label_tag')}
              </span>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-muted">
                <svg
                  className="size-3.5 shrink-0 text-subtle"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="truncate text-foreground/70">{exampleSignUpUrl}</span>
              </div>
              <p className="mt-3 text-center text-xs text-subtle">{t('demo_caption')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/6 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('why_title')}
          </h2>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_ROWS.map((row) => (
              <div
                key={row.titleKey}
                className="group rounded-card border border-white/7 bg-white/2 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:bg-white/4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand/12 text-brand-light transition-colors group-hover:bg-brand/18">
                  <FeatureIcon type={row.iconType} />
                </div>
                <h3 className="mt-4 text-[17px] leading-snug font-semibold text-white">
                  {t(row.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(row.descKey, { bonus_pct: REFERRAL_SUBSCRIPTION_BONUS_PERCENT })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TWO WAYS TO EARN ════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-t border-white/6 py-20 sm:py-24 lg:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <h2 className="text-center font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('earn_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-muted">
            {t('earn_subtitle')}
          </p>

          {/* Two-column layout */}
          <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:gap-6">
            {/* ── Column 1: Sign-up Credits ── */}
            <div className="flex flex-col rounded-card border border-success/20 bg-gradient-to-b from-success/8 to-transparent p-6 lg:p-7">
              {/* Column header */}
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-success/15 text-success">
                  <Gift className="size-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-success uppercase">
                    {t('earn_signup_eyebrow')}
                  </p>
                  <h3 className="text-xl font-semibold text-white">{t('earn_signup_title')}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t('earn_signup_intro')}</p>

              {/* Reward summary pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <Check className="size-3" strokeWidth={2.5} />
                  {t('earn_signup_pill1', { business: REFERRAL_CREDITS_BUSINESS_EMAIL })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted">
                  {t('earn_signup_pill2', { consumer: REFERRAL_CREDITS_CONSUMER_EMAIL })}
                </span>
              </div>

              {/* Steps */}
              <ol className="mt-6 flex flex-col gap-3">
                {EARN_STEPS_SIGNUP.map((step, i) => (
                  <li key={step.titleKey} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-success/30 bg-success/10 text-[11px] font-bold text-success">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{t(step.titleKey)}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">
                        {t(step.descKey, signupInterpolation)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Column 2: Subscription Cash ── */}
            <div className="flex flex-col rounded-card border border-brand/25 bg-gradient-to-b from-brand/8 to-transparent p-6 lg:p-7">
              {/* Column header */}
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand/15 text-brand-light">
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-brand-light uppercase">
                    {t('earn_sub_eyebrow')}
                  </p>
                  <h3 className="text-xl font-semibold text-white">{t('earn_sub_title')}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t('earn_sub_intro')}</p>

              {/* Earnings example */}
              <div className="mt-5 rounded-xl border border-brand/20 bg-brand/8 p-4">
                <p className="text-[10px] font-semibold tracking-widest text-brand-light/70 uppercase">
                  {t('earn_sub_example_label')}
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-brand-light">
                    {REFERRAL_SUBSCRIPTION_BONUS_PERCENT}%
                  </span>
                  <span className="text-sm text-muted">×</span>
                  <span className="text-lg font-semibold text-white">${exampleMonthlyUsd}/mo</span>
                  <span className="text-sm text-muted">=</span>
                  <span className="text-2xl font-bold text-success">
                    ${exampleCashUsdFormatted}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">{t('earn_sub_example_note')}</p>
              </div>

              {/* Steps */}
              <ol className="mt-6 flex flex-col gap-3">
                {EARN_STEPS_SUBSCRIPTION.map((step, i) => (
                  <li key={step.titleKey} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-[11px] font-bold text-brand-light">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{t(step.titleKey)}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">
                        {t(step.descKey, subInterpolation)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── Program reference strip ── */}
          <div className="mt-10 rounded-card border border-white/7 bg-white/2 p-5">
            <p className="mb-4 text-center text-[10px] font-semibold tracking-widest text-subtle uppercase">
              {t('earn_reference_title')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {REFERENCE_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.titleKey} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-subtle">
                      <Icon className="size-3.5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider text-brand-light uppercase">
                        {t(row.titleKey)}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-muted">
                        {t(row.bodyKey, refInterpolation)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ COPY BRIEF BLOCK ═══════════════════════════════════════ */}
      <section className="border-t border-white/6 py-20 sm:py-24 lg:py-28">
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

      {/* ══ PARTNER CTA ══════════════════════════════════════════ */}
      <section className="border-t border-white/6 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(232, 197, 71, 0.18) 0%, transparent 65%)',
            }}
            aria-hidden
          />
          <div className="relative z-10 grid gap-10 overflow-hidden rounded-card border border-white/10 bg-white/3 p-8 backdrop-blur-md sm:grid-cols-2 sm:items-center sm:p-12 lg:gap-16">
            <div>
              <Badge variant="success" className="mb-5">
                {t('partner_badge')}
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t('partner_title')}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">{t('partner_body')}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={inviteHref} className="inline-flex">
                  <Button variant="primary" size="md" className="gap-1.5">
                    {t('partner_cta')}
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Button>
                </Link>
                <Link href={pricingHref} className="inline-flex">
                  <Button variant="ghost" size="md">
                    {t('partner_pricing_link')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center sm:justify-end">
              <div className="relative w-full max-w-xs">
                <div
                  className="absolute right-3 -bottom-3 size-full rounded-card border border-white/6 bg-white/2"
                  aria-hidden
                />
                <div
                  className="absolute right-1.5 -bottom-1.5 size-full rounded-card border border-white/6 bg-white/2"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-card border border-brand/25 bg-white/3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-widest text-subtle uppercase">
                      {t('partner_demo_label')}
                    </span>
                    <span className="rounded-pill bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success uppercase">
                      +{REFERRAL_SUBSCRIPTION_BONUS_PERCENT}%
                    </span>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <div className="flex-1 rounded-xl border border-white/8 bg-black/40 p-3">
                      <div className="aspect-square rounded-lg bg-linear-to-br from-zinc-700 to-zinc-900 opacity-40" />
                      <p className="mt-2 text-center text-[10px] text-subtle">{t('demo_before')}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-brand/30 bg-brand/8 p-3 ring-1 ring-brand/20">
                      <div className="aspect-square rounded-lg bg-linear-to-br from-amber-400/30 to-yellow-500/20" />
                      <p className="mt-2 text-center text-[10px] font-semibold text-brand-light uppercase">
                        {t('demo_after')}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-xs text-muted">{t('partner_demo_caption')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════ */}
      <section className="border-t border-white/6 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('faq_title')}
          </h2>
          <div className="mt-10 space-y-2">
            {faqs.map((item) => (
              <details
                key={item.key}
                className="group rounded-xl border border-white/7 bg-white/2 open:border-brand/25 open:bg-brand/3"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-white">
                  <span>{item.q}</span>
                  <svg
                    className="size-4 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-white/6 px-5 pt-3 pb-4 text-sm leading-relaxed text-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('bottom_title')}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted">{t('bottom_subtitle')}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={signUpHref} className="inline-flex">
              <Button variant="primary" size="lg" className="gap-1.5">
                {t('bottom_cta')}
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href={inviteHref} className="inline-flex">
              <Button variant="outline" size="lg">
                {t('cta_get_link')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
