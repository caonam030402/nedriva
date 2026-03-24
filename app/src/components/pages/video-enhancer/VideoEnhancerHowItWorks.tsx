import type { LucideIcon } from 'lucide-react';
import { MonitorPlay, Settings2, Upload } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type StepDef = {
  id: string;
  labelKey: 'how_step1_label' | 'how_step2_label' | 'how_step3_label';
  titleKey: 'how_step1_title' | 'how_step2_title' | 'how_step3_title';
  descKey: 'how_step1_desc' | 'how_step2_desc' | 'how_step3_desc';
  Icon: LucideIcon;
  variant: 'placeholder' | 'settings';
};

const HOW_STEPS: StepDef[] = [
  {
    id: '1',
    labelKey: 'how_step1_label',
    titleKey: 'how_step1_title',
    descKey: 'how_step1_desc',
    Icon: Upload,
    variant: 'placeholder',
  },
  {
    id: '2',
    labelKey: 'how_step2_label',
    titleKey: 'how_step2_title',
    descKey: 'how_step2_desc',
    Icon: Settings2,
    variant: 'settings',
  },
  {
    id: '3',
    labelKey: 'how_step3_label',
    titleKey: 'how_step3_title',
    descKey: 'how_step3_desc',
    Icon: MonitorPlay,
    variant: 'placeholder',
  },
];

export async function VideoEnhancerHowItWorks() {
  const t = await getTranslations('VideoEnhancer');

  return (
    <section className="border-b border-white/10 bg-surface/50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('how_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t('how_subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {HOW_STEPS.map(step => {
            const Icon = step.Icon;
            return (
              <div
                key={step.id}
                className="flex flex-col rounded-card border border-white/[0.07] bg-white/[0.02] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-widest text-subtle uppercase">
                    {t(step.labelKey)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Icon className="size-5 shrink-0 text-brand-light" aria-hidden />
                  <h3 className="font-display text-lg font-semibold text-foreground">{t(step.titleKey)}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(step.descKey)}</p>

                {step.variant === 'settings' ? (
                  <div className="mt-5 rounded-ui-md border border-white/10 bg-black/30 p-4">
                    <p className="text-[11px] font-semibold tracking-widest text-subtle uppercase">
                      {t('settings_title')}
                    </p>
                    <div className="mt-3">
                      <p className="text-xs text-muted">{t('settings_size_label')}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(
                          [
                            'settings_size_auto',
                            'settings_size_fhd',
                            'settings_size_2k',
                            'settings_size_4k',
                          ] as const
                        ).map((key, idx) => (
                          <span
                            key={key}
                            className={`rounded-pill border px-2 py-0.5 text-[11px] ${
                              idx === 0
                                ? 'border-brand/40 bg-brand/10 text-brand-light'
                                : 'border-white/10 text-muted'
                            }`}
                          >
                            {t(key)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-xs text-muted">{t('settings_format_label')}</span>
                      <span className="text-xs text-foreground">{t('settings_format_value')}</span>
                    </div>
                  </div>
                ) : null}

                {step.variant === 'placeholder' ? (
                  <div className="mt-5 flex-1 rounded-ui-md border border-dashed border-white/15 bg-black/20 p-4">
                    <div className="aspect-video rounded-ui-sm bg-gradient-to-br from-zinc-800/80 to-zinc-950" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
