import { getTranslations } from 'next-intl/server';
import { MediaCard } from '@/components/common/MediaCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Button } from '@/components/ui/Button';
import { Routes } from '@/utils/Routes';

const PlayDecor = () => (
  <span className="relative z-10 flex size-16 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
    <svg className="ml-1 size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  </span>
);

export const ShowcaseSection = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="relative overflow-hidden bg-page py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 78% 12%, rgba(56, 189, 248, 0.08) 0%, transparent 52%), radial-gradient(ellipse 55% 45% at 10% 72%, rgba(232, 197, 71, 0.09) 0%, transparent 48%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('showcase_badge')}
          title={t('showcase_headline')}
          titleGradient={t('showcase_headline_gradient')}
          subtitle={t('showcase_subtext')}
          align="center"
          action={(
            <Link href={Routes.dashboard.enhance} className="inline-flex">
              <Button variant="outline" size="md" className="gap-2">
                <span aria-hidden>→</span>
                {t('showcase_cta_inline')}
              </Button>
            </Link>
          )}
        />

        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MediaCard aspect="portrait" label={t('showcase_card_1_label')} hoverLift>
            <img
              src="https://picsum.photos/seed/nedriva-show-1/640/960"
              alt=""
              className="size-full object-cover"
            />
          </MediaCard>
          <MediaCard aspect="portrait" label={t('showcase_card_2_label')} hoverLift>
            <img
              src="https://picsum.photos/seed/nedriva-show-2/640/960"
              alt=""
              className="size-full object-cover"
            />
          </MediaCard>
          <MediaCard aspect="portrait" label={t('showcase_card_3_label')} hoverLift>
            <img
              src="https://picsum.photos/seed/nedriva-show-3/640/960"
              alt=""
              className="size-full object-cover"
            />
          </MediaCard>
        </div>

        <div className="mt-20 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-subtle uppercase">
              {t('showcase_feature_kicker')}
            </p>
            <h3 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">
              {t('showcase_feature_title')}
            </h3>
          </div>
          <MediaCard
            aspect="video"
            hoverLift={false}
            overlayPlacement="center"
            overlay={(
              <>
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                <PlayDecor />
              </>
            )}
          >
            <img
              src="https://picsum.photos/seed/nedriva-cinematic/1280/720"
              alt=""
              className="size-full object-cover"
            />
          </MediaCard>
        </div>
      </div>
    </section>
  );
};
