import { getTranslations } from 'next-intl/server';
import { FeatureCompareSplit } from './FeatureCompareSplit';

const FEATURE_KEYS = [1, 2, 3] as const;

export async function VideoEnhancerFeatures() {
  const t = await getTranslations('VideoEnhancer');

  return (
    <section className="border-b border-white/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t('features_title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">{t('features_subtitle')}</p>

        <div className="mt-14 flex flex-col gap-16 md:gap-20">
          {FEATURE_KEYS.map((n, index) => {
            const title = t(`feature_${n}_title`);
            const desc = t(`feature_${n}_desc`);
            const isReversed = index % 2 === 1;

            return (
              <div key={n} className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
                <div className={isReversed ? 'md:order-2' : undefined}>
                  <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">{title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{desc}</p>
                </div>
                <div className={isReversed ? 'md:order-1' : undefined}>
                  <FeatureCompareSplit
                    beforeLabel={t('feature_compare_before')}
                    afterLabel={t('feature_compare_after')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
