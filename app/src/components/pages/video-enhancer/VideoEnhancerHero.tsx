import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/common/Badge';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';
import { Button } from '@/components/ui/Button';
import { HeroCompareSlider } from './HeroCompareSlider';

export async function VideoEnhancerHero() {
  const t = await getTranslations('VideoEnhancer');

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-28 lg:px-8 lg:pt-32 lg:pb-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <div className="flex justify-center lg:justify-start">
              <Badge variant="brand" pulse className="mb-6">
                {t('hero_eyebrow_badge')}
                <span className="text-brand/50">·</span>
                <span className="text-brand/70">{t('hero_eyebrow_free')}</span>
              </Badge>
            </div>

            <h1 className="font-display text-5xl leading-[1.08] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {t('hero_headline')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              {t('hero_subtext')}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={Routes.dashboard.video}>
                <Button variant="primary" size="lg" className="gap-1.5">
                  {t('hero_cta')}
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href={Routes.pricing}>
                <Button variant="ghost" size="lg" className="gap-2">
                  {t('hero_cta_secondary')}
                </Button>
              </Link>
            </div>
          </div>

          <HeroCompareSlider
            beforeLabel={t('hero_compare_before')}
            afterLabel={t('hero_compare_after')}
            hint={t('hero_compare_hint')}
          />
        </div>
      </div>
    </section>
  );
}
