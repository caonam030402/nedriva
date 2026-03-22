import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';

type UseCaseBadgeKey = 'ecommerce_badge' | 'portrait_badge' | 'restore_badge' | 'realestate_badge';
type UseCaseTitleKey = 'ecommerce_title' | 'portrait_title' | 'restore_title' | 'realestate_title';
type UseCaseDescKey = 'ecommerce_desc' | 'portrait_desc' | 'restore_desc' | 'realestate_desc';
type UseCaseFeatKey
  = | 'ecommerce_feat_1' | 'ecommerce_feat_2' | 'ecommerce_feat_3'
    | 'portrait_feat_1' | 'portrait_feat_2' | 'portrait_feat_3'
    | 'restore_feat_1' | 'restore_feat_2' | 'restore_feat_3'
    | 'realestate_feat_1' | 'realestate_feat_2' | 'realestate_feat_3';

type UseCaseConfig = {
  id: string;
  badgeKey: UseCaseBadgeKey;
  titleKey: UseCaseTitleKey;
  descKey: UseCaseDescKey;
  featKeys: [UseCaseFeatKey, UseCaseFeatKey, UseCaseFeatKey];
  badgeColor: string;
  imageSeed: string;
  beforeFilter: string;
};

const USE_CASE_CONFIGS: UseCaseConfig[] = [
  {
    id: 'ecommerce',
    badgeKey: 'ecommerce_badge',
    titleKey: 'ecommerce_title',
    descKey: 'ecommerce_desc',
    featKeys: ['ecommerce_feat_1', 'ecommerce_feat_2', 'ecommerce_feat_3'],
    badgeColor: 'text-brand-light bg-brand/10 border-brand/30',
    imageSeed: 'fashion',
    beforeFilter: 'grayscale(0.4) blur(1.5px) brightness(0.8) contrast(0.85)',
  },
  {
    id: 'portrait',
    badgeKey: 'portrait_badge',
    titleKey: 'portrait_title',
    descKey: 'portrait_desc',
    featKeys: ['portrait_feat_1', 'portrait_feat_2', 'portrait_feat_3'],
    badgeColor: 'text-accent-light bg-accent/10 border-accent/30',
    imageSeed: 'portrait',
    beforeFilter: 'grayscale(0.5) blur(2px) brightness(0.75)',
  },
  {
    id: 'restore',
    badgeKey: 'restore_badge',
    titleKey: 'restore_title',
    descKey: 'restore_desc',
    featKeys: ['restore_feat_1', 'restore_feat_2', 'restore_feat_3'],
    badgeColor: 'text-warning bg-warning/10 border-warning/30',
    imageSeed: 'vintage',
    beforeFilter: 'grayscale(0.8) sepia(0.4) blur(1px) brightness(0.7) contrast(0.8)',
  },
  {
    id: 'realestate',
    badgeKey: 'realestate_badge',
    titleKey: 'realestate_title',
    descKey: 'realestate_desc',
    featKeys: ['realestate_feat_1', 'realestate_feat_2', 'realestate_feat_3'],
    badgeColor: 'text-success bg-success/10 border-success/30',
    imageSeed: 'architecture',
    beforeFilter: 'grayscale(0.3) blur(1px) brightness(0.8) saturate(0.6)',
  },
];

const CheckIcon = () => (
  <svg className="mt-0.5 size-3.5 shrink-0 text-brand-light" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

type UseCaseCardProps = {
  config: UseCaseConfig;
  badge: string;
  title: string;
  description: string;
  features: string[];
  beforeLabel: string;
  afterLabel: string;
};

const UseCaseCard = (props: UseCaseCardProps) => (
  <div className="group relative flex flex-col overflow-hidden rounded-card border border-brand/15 bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/35 hover:shadow-card">

    {/* ── Before / After image ── */}
    <div className="relative h-52 overflow-hidden bg-elevated">

      {/* After — underneath, full width */}
      <img
        src={`https://picsum.photos/seed/${props.config.imageSeed}/800/416`}
        alt={`After — ${props.title}`}
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Before — left half with CSS filter */}
      <div className="absolute inset-0 w-1/2 overflow-hidden">
        <img
          src={`https://picsum.photos/seed/${props.config.imageSeed}/800/416`}
          alt={`Before — ${props.title}`}
          className="size-full object-cover"
          style={{
            width: '200%',
            maxWidth: 'none',
            filter: props.config.beforeFilter,
          }}
        />
      </div>

      {/* Divider line */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/60" />

      {/* Before / After labels */}
      <span className="absolute top-2.5 left-2.5 rounded-pill bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        {props.beforeLabel}
      </span>
      <span className="absolute top-2.5 right-2.5 rounded-pill bg-brand/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        {props.afterLabel}
      </span>

      {/* Operation badge */}
      <span className={`absolute bottom-2.5 left-2.5 rounded-pill border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${props.config.badgeColor}`}>
        {props.badge}
      </span>
    </div>

    {/* ── Content ── */}
    <div className="flex flex-1 flex-col p-5">
      <h3 className="text-base font-bold text-foreground">{props.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{props.description}</p>

      <ul className="mt-4 space-y-1.5">
        {props.features.map(feat => (
          <li key={feat} className="flex items-start gap-2 text-sm text-muted">
            <CheckIcon />
            {feat}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export const UseCaseSection = async () => {
  const t = await getTranslations('UseCasePage');

  return (
    <section className="bg-page py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-pill border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-light">
            {t('eyebrow_badge')}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t('heading')}
          </h2>
          <p className="mt-4 text-lg text-muted">
            {t('subtext')}
          </p>
        </div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASE_CONFIGS.map(config => (
            <UseCaseCard
              key={config.id}
              config={config}
              badge={t(config.badgeKey)}
              title={t(config.titleKey)}
              description={t(config.descKey)}
              features={config.featKeys.map(k => t(k))}
              beforeLabel={t('before_label')}
              afterLabel={t('after_label')}
            />
          ))}
        </div>

        {/* ── Bottom CTA strip ── */}
        <div className="mt-12 flex flex-col items-center gap-3 rounded-card border border-brand/20 bg-surface px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-semibold text-foreground">{t('no_use_case_title')}</p>
            <p className="mt-0.5 text-sm text-muted">{t('no_use_case_desc')}</p>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex shrink-0 items-center gap-2 rounded-pill px-6 py-2.5 text-sm font-semibold text-white shadow-cta transition-transform hover:scale-[1.03]"
            style={{ background: 'var(--gradient-cta)' }}
          >
            {t('cta_try_free')}
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
};
