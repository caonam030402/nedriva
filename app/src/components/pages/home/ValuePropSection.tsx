import { getTranslations } from 'next-intl/server';

/* ── Icons ───────────────────────────────────────────────────── */

const DiamondIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const FocusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="size-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XIcon = () => (
  <svg className="size-5 text-error/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ── Value card ──────────────────────────────────────────────── */

type CardProps = {
  eyebrow: string;
  title: string;
  description: string;
  statValue: string;
  statLabel: string;
  icon: React.ReactNode;
  glowClass: string;
  iconBgClass: string;
  borderClass: string;
  eyebrowClass: string;
};

const ValueCard = (props: CardProps) => (
  <div className={`group relative flex flex-col overflow-hidden rounded-card border bg-surface p-7 shadow-card transition-all duration-300 hover:-translate-y-1 ${props.borderClass}`}>

    {/* Subtle gradient glow top-right */}
    <div
      className={`pointer-events-none absolute -top-10 -right-10 size-40 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-35 ${props.glowClass}`}
    />

    {/* Icon */}
    <div className={`relative mb-5 inline-flex size-13 items-center justify-center rounded-ui-md ${props.iconBgClass}`}>
      <span className={props.eyebrowClass}>{props.icon}</span>
    </div>

    {/* Eyebrow */}
    <span className={`mb-1.5 text-xs font-bold tracking-widest uppercase ${props.eyebrowClass}`}>
      {props.eyebrow}
    </span>

    {/* Title */}
    <h3 className="mb-3 text-xl leading-snug font-bold text-foreground">
      {props.title}
    </h3>

    {/* Description */}
    <p className="flex-1 text-sm leading-relaxed text-muted">
      {props.description}
    </p>

    {/* Stat */}
    <div className={`mt-6 flex items-baseline gap-2 border-t pt-5 ${props.borderClass}`}>
      <span className={`text-2xl font-extrabold ${props.eyebrowClass}`}>
        {props.statValue}
      </span>
      <span className="text-sm text-subtle">{props.statLabel}</span>
    </div>
  </div>
);

/* ── Main section ────────────────────────────────────────────── */

export const ValuePropSection = async () => {
  const t = await getTranslations('ValuePropPage');

  const COMPARE_FEATS = [
    t('compare_feat_1'),
    t('compare_feat_2'),
    t('compare_feat_3'),
    t('compare_feat_4'),
    t('compare_feat_5'),
  ] as const;

  const CARDS: CardProps[] = [
    {
      eyebrow: t('card1_eyebrow'),
      title: t('card1_title'),
      description: t('card1_desc'),
      statValue: t('card1_stat_value'),
      statLabel: t('card1_stat_label'),
      icon: <DiamondIcon />,
      glowClass: 'bg-brand',
      iconBgClass: 'bg-brand/20',
      borderClass: 'border-brand/20 hover:border-brand/40',
      eyebrowClass: 'text-brand-light',
    },
    {
      eyebrow: t('card2_eyebrow'),
      title: t('card2_title'),
      description: t('card2_desc'),
      statValue: t('card2_stat_value'),
      statLabel: t('card2_stat_label'),
      icon: <ShieldIcon />,
      glowClass: 'bg-success',
      iconBgClass: 'bg-success/15',
      borderClass: 'border-success/20 hover:border-success/40',
      eyebrowClass: 'text-success',
    },
    {
      eyebrow: t('card3_eyebrow'),
      title: t('card3_title'),
      description: t('card3_desc'),
      statValue: t('card3_stat_value'),
      statLabel: t('card3_stat_label'),
      icon: <FocusIcon />,
      glowClass: 'bg-accent',
      iconBgClass: 'bg-accent/15',
      borderClass: 'border-accent/20 hover:border-accent/40',
      eyebrowClass: 'text-accent-light',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-28">

      {/* Subtle radial gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-x-0 -mt-28 h-96 opacity-25"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(232, 197, 71, 0.22) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/15 px-4 py-1.5 text-sm font-medium text-brand-light">
            {t('eyebrow_badge')}
          </span>
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t('headline')}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-text)' }}
            >
              {t('headline_gradient')}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            {t('subtext')}
          </p>
        </div>

        {/* ── Value cards ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CARDS.map(card => (
            <ValueCard key={card.eyebrow} {...card} />
          ))}
        </div>

        {/* ── Comparison table ── */}
        <div className="mt-14 overflow-hidden rounded-card border border-brand/15 bg-page">

          <div className="grid grid-cols-[1fr_auto_auto] border-b border-white/6 px-6 py-4">
            <p className="text-sm font-semibold text-foreground">{t('compare_heading')}</p>
            <p className="w-28 text-center text-sm font-medium text-subtle">{t('compare_col_generic')}</p>
            <p
              className="w-28 text-center text-sm font-semibold text-brand-light"
              style={{ textShadow: '0 0 14px rgba(232, 197, 71, 0.45)' }}
            >
              {t('compare_col_us')}
            </p>
          </div>

          {COMPARE_FEATS.map((feat, i) => (
            <div
              key={feat}
              className={`grid grid-cols-[1fr_auto_auto] items-center px-6 py-3.5 ${
                i < COMPARE_FEATS.length - 1 ? 'border-b border-white/4' : ''
              }`}
            >
              <span className="text-sm text-muted">{feat}</span>
              <span className="flex w-28 justify-center"><XIcon /></span>
              <span className="flex w-28 justify-center"><CheckIcon /></span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
