import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';
import { HeroCompareSlider } from './HeroCompareSlider';

const THUMB_SUBJECTS = [
  { label: 'Portrait', gradient: 'from-amber-800 to-amber-950' },
  { label: 'Product', gradient: 'from-zinc-700 to-zinc-900' },
  { label: 'Car', gradient: 'from-red-900 to-zinc-950' },
  { label: 'Nature', gradient: 'from-green-900 to-zinc-950' },
  { label: 'Architecture', gradient: 'from-blue-900 to-zinc-950' },
];

export async function BgRemoverHero() {
  const t = await getTranslations('BgRemover');

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {/* Gradient mesh backdrop */}
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

      {/* Bottom gradient into next section */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-24 bg-linear-to-t from-page to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        {/* Top row: left copy + right visual */}
        <div className="grid items-center gap-10 lg:grid-cols-[4fr_6fr] lg:gap-16">
          {/* ── Left: copy ── */}
          <div>
            <div className="flex justify-start">
              <Badge variant="brand" pulse className="mb-5">
                {t('hero_eyebrow_badge')}
                <span className="text-brand/50">·</span>
                <span className="text-brand/70">{t('hero_eyebrow_free')}</span>
              </Badge>
            </div>

            <h1 className="font-display text-5xl leading-[1.07] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-[3.75rem]">
              {t('hero_headline')}
            </h1>

            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted sm:text-lg">
              {t('hero_subtext')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={Routes.dashboard.enhance}>
                <Button variant="primary" size="lg" className="gap-1.5">
                  {t('hero_cta')}
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
              <Link href={Routes.pricing}>
                <Button variant="ghost" size="lg">
                  {t('hero_cta_secondary')}
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Right: draggable slider ── */}
          <HeroCompareSlider
            beforeLabel={t('hero_compare_before')}
            afterLabel={t('hero_compare_after')}
          />
        </div>

        {/* ── Thumbnails strip: directly below hero visual ── */}
        <div className="mt-6 grid grid-cols-5 gap-3 lg:mt-8">
          {THUMB_SUBJECTS.map((thumb, i) => (
            <button
              key={thumb.label}
              type="button"
              className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-card border transition-all ${
                i === 0
                  ? 'border-brand/50 bg-brand/10 ring-1 ring-brand/30'
                  : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${thumb.gradient} opacity-80`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.2),transparent_70%)]" />
              <div className="relative z-10 flex flex-col items-center">
                <div className={`size-8 rounded-full ${i === 0 ? 'bg-white/40' : 'bg-white/20'}`} />
                <div className="mt-1 h-2 w-6 rounded-b-full bg-white/20" />
              </div>
              <span
                className={`relative z-10 mt-1.5 text-[10px] font-medium ${
                  i === 0 ? 'text-white' : 'text-white/60'
                }`}
              >
                {thumb.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
