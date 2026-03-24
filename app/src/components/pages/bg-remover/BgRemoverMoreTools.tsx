import { ArrowRight, Maximize2, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';

const TOOLS = [
  {
    id: 'upscaler',
    titleKey: 'more_tool_1_title',
    descKey: 'more_tool_1_desc',
    href: Routes.tools.upscaler,
    Icon: Maximize2,
    accentClass: 'text-indigo-400',
    bgClass: 'from-indigo-950/50 to-zinc-950',
  },
  {
    id: 'video',
    titleKey: 'more_tool_2_title',
    descKey: 'more_tool_2_desc',
    href: Routes.videoEnhancer,
    Icon: Sparkles,
    accentClass: 'text-emerald-400',
    bgClass: 'from-emerald-950/50 to-zinc-950',
  },
] as const;

export async function BgRemoverMoreTools() {
  const t = await getTranslations('BgRemover');

  return (
    <section className="border-b border-white/10 bg-surface/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('more_tools_title')}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">{t('more_tools_subtitle')}</p>
        </div>

        {/* Horizontal strip */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {TOOLS.map(tool => {
            const Icon = tool.Icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative flex flex-1 flex-col overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
              >
                {/* Gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgClass} opacity-60`} />
                {/* Content */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/60">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/50" aria-hidden />
                </div>
                <div className="relative z-10 mt-4">
                  <h3 className="font-display text-base font-semibold text-foreground">{t(tool.titleKey)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t(tool.descKey)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
