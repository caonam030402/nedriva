import { getTranslations } from 'next-intl/server';

type FailureExample = {
  id: string;
  thumbGradient: string;
  issueLabel: string;
  issueColor: string;
};

const FAILURE_EXAMPLES: FailureExample[] = [
  {
    id: 'fuzzy',
    thumbGradient: 'from-red-900/60 to-zinc-950',
    issueLabel: 'Complex BG',
    issueColor: 'text-amber-300',
  },
  {
    id: 'artifact',
    thumbGradient: 'from-orange-900/60 to-zinc-950',
    issueLabel: 'Motion blur',
    issueColor: 'text-orange-300',
  },
  {
    id: 'halo',
    thumbGradient: 'from-yellow-900/60 to-zinc-950',
    issueLabel: 'Hair edge',
    issueColor: 'text-yellow-200',
  },
  {
    id: 'color_bleed',
    thumbGradient: 'from-purple-900/60 to-zinc-950',
    issueLabel: 'Color bleed',
    issueColor: 'text-purple-300',
  },
];

export async function BgRemoverEdgeCases() {
  const t = await getTranslations('BgRemover');

  return (
    <section className="border-b border-white/10 bg-surface/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('edge_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t('edge_subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[5fr_4fr] lg:items-start">
          {/* ── Left: 2×2 failure example grid ── */}
          <div className="grid grid-cols-2 gap-3">
            {FAILURE_EXAMPLES.map(ex => (
              <div
                key={ex.id}
                className="group relative aspect-square overflow-hidden rounded-card border border-white/[0.07] bg-black/30"
              >
                {/* Thumb */}
                <div className={`absolute inset-0 bg-gradient-to-br ${ex.thumbGradient}`} />
                {/* Center subject */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="size-12 rounded-full bg-white/20" />
                    <div className="absolute inset-0 flex items-end justify-center">
                      <div className="h-10 w-8 rounded-b-full bg-white/15" />
                    </div>
                  </div>
                </div>
                {/* AI mask edge artifact hint */}
                <div className="absolute inset-0 ring-1 ring-white/10 ring-inset" />
                {/* Issue label */}
                <div className="absolute bottom-2 left-2">
                  <span className={`rounded-pill border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${ex.issueColor} backdrop-blur-sm`}>
                    {ex.issueLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: text content ── */}
          <div className="flex flex-col gap-5 lg:pt-2">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {t('edge_right_title')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t('edge_right_desc_1')}
              </p>
            </div>

            <div className="rounded-card border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold tracking-widest text-subtle uppercase">
                {t('edge_tips_label')}
              </p>
              <ul className="mt-3 space-y-2">
                {(
                  [
                    'edge_tip_1',
                    'edge_tip_2',
                    'edge_tip_3',
                  ] as const
                ).map(key => (
                  <li key={key} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-light" aria-hidden />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm leading-relaxed text-muted">
              {t('edge_right_desc_2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
