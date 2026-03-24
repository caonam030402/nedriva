import { getTranslations } from 'next-intl/server';

type ExampleDef = {
  id: string;
  thumbClass: string;
  accentClass: string;
};

const EXAMPLES: ExampleDef[] = [
  { id: 'portrait', thumbClass: 'from-amber-800 to-amber-950', accentClass: 'bg-amber-500' },
  { id: 'product', thumbClass: 'from-zinc-700 to-zinc-900', accentClass: 'bg-zinc-400' },
  { id: 'car', thumbClass: 'from-red-900 to-zinc-950', accentClass: 'bg-red-500' },
  { id: 'nature', thumbClass: 'from-green-900 to-zinc-950', accentClass: 'bg-green-500' },
  { id: 'architecture', thumbClass: 'from-blue-900 to-zinc-950', accentClass: 'bg-blue-500' },
];

export async function BgRemoverExamples() {
  const t = await getTranslations('BgRemover');

  return (
    <section className="border-b border-white/10 bg-surface/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('examples_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t('examples_subtitle')}</p>
        </div>

        {/* Gallery grid */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-5">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.id}
              className="group relative flex aspect-square w-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border border-white/[0.08] bg-white/[0.03] transition-all hover:border-white/20 hover:bg-white/[0.06] sm:w-44"
            >
              {/* Subject blob */}
              <div className={`absolute inset-0 bg-gradient-to-br ${ex.thumbClass} opacity-80`} />
              {/* Radial spotlight */}
              <div
                className="absolute inset-0 opacity-80"
                style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.15), transparent 60%)' }}
              />
              {/* Subject silhouette */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`size-16 rounded-full ${ex.accentClass} opacity-60 shadow-lg`} />
                <div className="mt-1 h-6 w-12 rounded-b-full bg-black/40 opacity-80" />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <div className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
