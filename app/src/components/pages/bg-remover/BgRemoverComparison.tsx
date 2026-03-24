import { Check, X } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type FeatureDef = {
  labelKey: 'compare_feat_1' | 'compare_feat_2' | 'compare_feat_3' | 'compare_feat_4' | 'compare_feat_5';
  /** true = Nedriva wins; false = both miss */
  nedrivaWins: boolean;
};

const COMPARISON_FEATURES: FeatureDef[] = [
  { labelKey: 'compare_feat_1', nedrivaWins: true },
  { labelKey: 'compare_feat_2', nedrivaWins: true },
  { labelKey: 'compare_feat_3', nedrivaWins: true },
  { labelKey: 'compare_feat_4', nedrivaWins: true },
  { labelKey: 'compare_feat_5', nedrivaWins: false },
];

export async function BgRemoverComparison() {
  const t = await getTranslations('BgRemover');

  return (
    <section className="border-b border-white/10 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('compare_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t('compare_subtitle')}</p>
        </div>

        <div className="mt-14 flex flex-col overflow-hidden rounded-card border border-white/[0.08]">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-white/10">
            <div className="bg-surface/40 p-4" />
            <div className="border-l border-white/10 bg-surface/40 p-4 text-center">
              <span className="font-display text-sm font-semibold text-muted">
                {t('compare_col_generic')}
              </span>
            </div>
            <div className="border-l border-white/10 bg-brand/5 p-4 text-center">
              <span className="font-display text-sm font-semibold text-brand-light">
                {t('compare_col_us')}
              </span>
            </div>
          </div>

          {/* Feature rows */}
          {COMPARISON_FEATURES.map((feat, i) => (
            <div
              key={feat.labelKey}
              className={`grid grid-cols-[1fr_1fr_1fr] ${i < COMPARISON_FEATURES.length - 1 ? 'border-b border-white/10' : ''}`}
            >
              <div className="flex items-center p-4">
                <span className="text-sm text-muted">{t(feat.labelKey)}</span>
              </div>
              {/* Generic column */}
              <div className="flex items-center justify-center border-l border-white/10 p-4">
                <X className="size-4 text-red-400/60" aria-hidden />
              </div>
              {/* Nedriva column */}
              <div className="flex items-center justify-center border-l border-white/10 bg-brand/5 p-4">
                {feat.nedrivaWins ? (
                  <Check className="size-4 text-emerald-400" aria-hidden />
                ) : (
                  <X className="size-4 text-red-400/60" aria-hidden />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
