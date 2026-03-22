import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';

/* ── Tool icons ──────────────────────────────────────────────── */

const DenoiseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-6">
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="6" cy="6" r="0.75" fill="currentColor" />
    <circle cx="18" cy="6" r="0.75" fill="currentColor" />
    <circle cx="6" cy="18" r="0.75" fill="currentColor" />
    <circle cx="18" cy="18" r="0.75" fill="currentColor" />
    <circle cx="12" cy="4" r="0.75" fill="currentColor" />
    <circle cx="12" cy="20" r="0.75" fill="currentColor" />
    <circle cx="4" cy="12" r="0.75" fill="currentColor" />
    <circle cx="20" cy="12" r="0.75" fill="currentColor" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

const UpscaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

const SharpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2" />
  </svg>
);

const BgRemoveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
  </svg>
);

const RestoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FaceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

/* ── Types ───────────────────────────────────────────────────── */

type ToolConfig = {
  id: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderHover: string;
  accentText: string;
  titleKey: 'denoiser_title' | 'upscaler_title' | 'sharpener_title' | 'bg_remover_title' | 'restorer_title' | 'face_title';
  descKey: 'denoiser_desc' | 'upscaler_desc' | 'sharpener_desc' | 'bg_remover_desc' | 'restorer_desc' | 'face_desc';
};

const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: 'denoiser',
    href: '/tools/denoiser',
    icon: <DenoiseIcon />,
    iconBg: 'bg-brand/15',
    iconColor: 'text-brand-light',
    borderHover: 'hover:border-brand/40',
    accentText: 'text-brand-light',
    titleKey: 'denoiser_title',
    descKey: 'denoiser_desc',
  },
  {
    id: 'upscaler',
    href: '/tools/upscaler',
    icon: <UpscaleIcon />,
    iconBg: 'bg-accent/15',
    iconColor: 'text-accent-light',
    borderHover: 'hover:border-accent/40',
    accentText: 'text-accent-light',
    titleKey: 'upscaler_title',
    descKey: 'upscaler_desc',
  },
  {
    id: 'sharpener',
    href: '/tools/sharpener',
    icon: <SharpenIcon />,
    iconBg: 'bg-info/15',
    iconColor: 'text-info',
    borderHover: 'hover:border-info/40',
    accentText: 'text-info',
    titleKey: 'sharpener_title',
    descKey: 'sharpener_desc',
  },
  {
    id: 'bg-remover',
    href: '/tools/bg-remover',
    icon: <BgRemoveIcon />,
    iconBg: 'bg-success/15',
    iconColor: 'text-success',
    borderHover: 'hover:border-success/40',
    accentText: 'text-success',
    titleKey: 'bg_remover_title',
    descKey: 'bg_remover_desc',
  },
  {
    id: 'restorer',
    href: '/tools/restorer',
    icon: <RestoreIcon />,
    iconBg: 'bg-warning/15',
    iconColor: 'text-warning',
    borderHover: 'hover:border-warning/40',
    accentText: 'text-warning',
    titleKey: 'restorer_title',
    descKey: 'restorer_desc',
  },
  {
    id: 'face-enhancer',
    href: '/tools/face-enhancer',
    icon: <FaceIcon />,
    iconBg: 'bg-brand-light/10',
    iconColor: 'text-brand-light',
    borderHover: 'hover:border-brand-light/30',
    accentText: 'text-brand-light',
    titleKey: 'face_title',
    descKey: 'face_desc',
  },
];

/* ── Card ────────────────────────────────────────────────────── */

type ToolCardProps = {
  config: ToolConfig;
  title: string;
  description: string;
  tryLabel: string;
  creditLabel: string;
};

const ToolCard = (props: ToolCardProps) => (
  <Link
    href={props.config.href}
    className={`group relative flex flex-col overflow-hidden rounded-card border border-brand/10 bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:bg-elevated hover:shadow-card ${props.config.borderHover}`}
  >
    {/* Icon */}
    <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-ui-md ${props.config.iconBg} ${props.config.iconColor}`}>
      {props.config.icon}
    </div>

    {/* Title + credit badge */}
    <div className="mb-2 flex items-start justify-between gap-2">
      <h3 className="text-base font-bold text-foreground">{props.title}</h3>
      <span className="shrink-0 rounded-pill border border-white/10 bg-elevated px-2 py-0.5 text-[10px] font-semibold text-subtle">
        {props.creditLabel}
      </span>
    </div>

    {/* Description */}
    <p className="flex-1 text-sm leading-relaxed text-muted">{props.description}</p>

    {/* Try tool link */}
    <div className={`mt-5 flex items-center gap-1.5 text-sm font-semibold ${props.config.accentText}`}>
      {props.tryLabel}
      <ArrowIcon />
    </div>
  </Link>
);

/* ── Section ─────────────────────────────────────────────────── */

export const ToolsSection = async () => {
  const t = await getTranslations('ToolsPage');

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-pill border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-light">
            {t('eyebrow_badge')}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t('headline')}
            {' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-text)' }}
            >
              {t('headline_gradient')}
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted">{t('subtext')}</p>
        </div>

        {/* ── Tools grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_CONFIGS.map(config => (
            <ToolCard
              key={config.id}
              config={config}
              title={t(config.titleKey)}
              description={t(config.descKey)}
              tryLabel={t('try_tool')}
              creditLabel={t('credit_badge')}
            />
          ))}
        </div>

        {/* ── See all CTA ── */}
        <div className="mt-10 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-pill border border-brand/40 bg-brand/10 px-6 py-2.5 text-sm font-semibold text-brand-light transition-all hover:border-brand/70 hover:bg-brand/20"
          >
            {t('cta_all')}
            <ArrowIcon />
          </Link>
        </div>

      </div>
    </section>
  );
};
