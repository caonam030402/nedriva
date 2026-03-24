import { Eraser, Maximize2, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';

type ToolDef = {
  titleKey: 'more_tool_1_title' | 'more_tool_2_title' | 'more_tool_3_title';
  descKey: 'more_tool_1_desc' | 'more_tool_2_desc' | 'more_tool_3_desc';
  href: string;
  icon: typeof Maximize2;
};

const MORE_TOOLS: ToolDef[] = [
  {
    titleKey: 'more_tool_1_title',
    descKey: 'more_tool_1_desc',
    href: Routes.tools.upscaler,
    icon: Maximize2,
  },
  {
    titleKey: 'more_tool_2_title',
    descKey: 'more_tool_2_desc',
    href: Routes.bgRemover,
    icon: Eraser,
  },
  {
    titleKey: 'more_tool_3_title',
    descKey: 'more_tool_3_desc',
    href: Routes.dashboard.enhance,
    icon: Sparkles,
  },
];

export async function VideoEnhancerMoreTools() {
  const t = await getTranslations('VideoEnhancer');

  return (
    <section className="border-b border-white/10 bg-surface/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('more_tools_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t('more_tools_subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MORE_TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col rounded-card border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
              >
                <div className="flex size-11 items-center justify-center rounded-ui-md border border-white/10 bg-black/30 text-brand-light transition-colors group-hover:border-brand/30">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{t(tool.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(tool.descKey)}</p>
                <span className="mt-4 text-xs font-semibold text-brand-light">{t('more_tools_cta')} →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
