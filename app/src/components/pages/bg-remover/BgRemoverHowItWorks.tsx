import type { LucideIcon } from 'lucide-react';
import { Download, Scan, Wand2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type Step = {
  num: string;
  Icon: LucideIcon;
  titleKey: 'how_step1_title' | 'how_step2_title' | 'how_step3_title';
  descKey: 'how_step1_desc' | 'how_step2_desc' | 'how_step3_desc';
};

const STEPS: Step[] = [
  { num: '01', Icon: Scan, titleKey: 'how_step1_title', descKey: 'how_step1_desc' },
  { num: '02', Icon: Wand2, titleKey: 'how_step2_title', descKey: 'how_step2_desc' },
  { num: '03', Icon: Download, titleKey: 'how_step3_title', descKey: 'how_step3_desc' },
];

export async function BgRemoverHowItWorks() {
  const t = await getTranslations('BgRemover');

  return (
    <section className="border-b border-white/10 bg-surface/50 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('how_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t('how_subtitle')}</p>
        </div>

        {/* Steps with numbered connectors */}
        <div className="mt-14">
          {STEPS.map((step, i) => {
            const Icon = step.Icon;
            return (
              <div key={step.num} className="relative flex items-start gap-6">
                {/* Number + Icon column */}
                <div className="relative flex w-20 shrink-0 flex-col items-center">
                  {/* Step number — large, ghost */}
                  <span className="font-display text-[2.5rem] leading-none font-bold text-white/[0.07] tabular-nums">
                    {step.num}
                  </span>
                  {/* Icon circle */}
                  <div className="relative z-10 mt-2 flex size-12 items-center justify-center rounded-full border border-white/15 bg-elevated shadow-[0_0_0_4px_rgba(255,255,255,0.05)]">
                    <Icon className="size-5 text-brand-light" aria-hidden />
                  </div>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute top-14 z-0 w-px flex-1 bg-gradient-to-b from-white/20 to-transparent"
                      style={{ height: 'calc(100% - 1rem)' }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 pt-1 pb-10">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{t(step.titleKey)}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{t(step.descKey)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
