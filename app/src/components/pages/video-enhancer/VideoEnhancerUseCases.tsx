import type { LucideIcon } from 'lucide-react';
import { Film, Layers, Share2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type UseCaseDef = {
  id: string;
  titleKey: 'usecase_1_title' | 'usecase_2_title' | 'usecase_3_title';
  descKey: 'usecase_1_desc' | 'usecase_2_desc' | 'usecase_3_desc';
  Icon: LucideIcon;
};

const USE_CASES: UseCaseDef[] = [
  { id: '1', titleKey: 'usecase_1_title', descKey: 'usecase_1_desc', Icon: Film },
  { id: '2', titleKey: 'usecase_2_title', descKey: 'usecase_2_desc', Icon: Layers },
  { id: '3', titleKey: 'usecase_3_title', descKey: 'usecase_3_desc', Icon: Share2 },
];

export async function VideoEnhancerUseCases() {
  const t = await getTranslations('VideoEnhancer');

  return (
    <section className="border-b border-white/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t('usecases_title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">{t('usecases_subtitle')}</p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map(uc => {
            const Icon = uc.Icon;
            return (
              <article
                key={uc.id}
                className="group flex flex-col overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.02] transition-colors hover:border-white/15"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="size-12 text-white/25 transition-colors group-hover:text-white/35" aria-hidden />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">{t(uc.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t(uc.descKey)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
