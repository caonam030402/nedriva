import { Button } from '@heroui/react/button';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';
import { HeroDemoSlider } from './HeroDemoSlider';

export const HeroSection = async () => {
  const t = await getTranslations('HomePage');

  const STATS = [
    { value: '50K+', label: t('stat_images_label') },
    { value: '4.9★', label: t('stat_rating_label') },
    { value: '16×', label: t('stat_upscale_label') },
    { value: '<30s', label: t('stat_speed_label') },
  ];

  return (
    <section className="relative overflow-hidden bg-page">

      {/* Gradient mesh backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--gradient-hero)' }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">

        {/* ── Eyebrow badge ── */}
        <div className="flex justify-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-pill border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-light">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-light" />
            {t('eyebrow_badge')}
            <span className="text-brand/50">·</span>
            <span className="text-brand/70">{t('eyebrow_try_free')}</span>
          </span>
        </div>

        {/* ── Headline ── */}
        <h1 className="mx-auto max-w-4xl text-center text-5xl leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {t('headline')}
          {' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'var(--gradient-text)' }}
          >
            {t('headline_gradient')}
          </span>
        </h1>

        {/* ── Subtext ── */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-muted sm:text-xl">
          {t.rich('subtext', {
            bold: chunks => <span className="font-semibold text-foreground">{chunks}</span>,
          })}
        </p>

        {/* ── CTAs ── */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-12 rounded-pill px-8 text-base font-semibold text-white shadow-cta transition-transform hover:scale-[1.03]"
              style={{ background: 'var(--gradient-cta)' }}
            >
              {t('cta_enhance')}
              <svg className="ml-1 size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link href="#demo">
            <Button
              variant="ghost"
              size="lg"
              className="h-12 gap-2 rounded-pill px-6 text-base font-medium text-muted hover:text-foreground"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('cta_see_how')}
            </Button>
          </Link>
        </div>

        {/* ── Stats row ── */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {STATS.map(stat => (
            <div key={stat.value} className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              <span className="text-sm text-subtle">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── Demo slider ── */}
        <div id="demo" className="relative mt-16 sm:mt-20">

          {/* Glow under the card */}
          <div
            className="absolute -inset-x-4 -top-4 -bottom-8 rounded-[32px] opacity-30 blur-3xl"
            style={{ background: 'var(--gradient-brand)' }}
          />

          {/* Demo card */}
          <div className="relative rounded-card border border-brand/25 bg-surface p-2 shadow-card sm:p-3">

            {/* Browser chrome bar */}
            <div className="mb-2 flex items-center gap-1.5 px-2 py-1 sm:mb-3">
              <span className="size-3 rounded-full bg-elevated" />
              <span className="size-3 rounded-full bg-elevated" />
              <span className="size-3 rounded-full bg-elevated" />
              <div className="mx-4 flex-1 rounded-pill bg-elevated px-4 py-1">
                <span className="text-xs text-subtle">{t('demo_browser_url')}</span>
              </div>
            </div>

            <HeroDemoSlider />
          </div>

          {/* Floating chip — left */}
          <div className="absolute top-1/4 -left-4 hidden xl:block">
            <div className="rounded-card border border-brand/20 bg-elevated p-3 shadow-card">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-ui-sm bg-brand/20 text-[16px]">✨</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t('chip_ai_title')}</p>
                  <p className="text-[11px] text-subtle">{t('chip_ai_subtitle')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating chip — right */}
          <div className="absolute top-2/3 -right-4 hidden xl:block">
            <div className="rounded-card border border-success/20 bg-elevated p-3 shadow-card">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-ui-sm bg-success/10 text-[16px]">⚡</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t('chip_done_title')}</p>
                  <p className="text-[11px] text-subtle">{t('chip_done_subtitle')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
