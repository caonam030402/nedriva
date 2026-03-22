'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/libs/i18n/I18nNavigation';

/* ── Animation variants ──────────────────────────────────────── */

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  }),
};

const headerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const headerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/* ── Data ────────────────────────────────────────────────────── */

type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
  avatarColor: string;
  rating: 4 | 5;
  quote: string;
  tool: string;
  toolColor: string;
  featured?: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah K.',
    role: 'Etsy Seller',
    avatarInitials: 'SK',
    avatarColor: 'bg-brand/20 text-brand-light',
    rating: 5,
    quote: 'I sell handmade jewelry on Etsy and my iPhone shots were too small for zoom previews. Nedriva upscaled them to 4K without any blurring. Sales went up 40% the next month — I\'m not joking.',
    tool: 'Upscaler',
    toolColor: 'bg-accent/10 text-accent-light border-accent/20',
    featured: true,
  },
  {
    id: '2',
    name: 'James L.',
    role: 'Wedding Photographer',
    avatarInitials: 'JL',
    avatarColor: 'bg-success/15 text-success',
    rating: 5,
    quote: 'Shot an evening reception in low light and 30% of my portraits had visible grain. The denoiser recovered every single shot. The couple never noticed — and neither would you.',
    tool: 'Denoiser',
    toolColor: 'bg-brand/10 text-brand-light border-brand/20',
  },
  {
    id: '3',
    name: 'Maria T.',
    role: 'Family Archivist',
    avatarInitials: 'MT',
    avatarColor: 'bg-warning/15 text-warning',
    rating: 5,
    quote: 'I scanned 60-year-old family photos that were faded and torn. The restorer recovered detail I thought was gone forever. My grandmother saw the results and cried. This tool is magic.',
    tool: 'Photo Restorer',
    toolColor: 'bg-warning/10 text-warning border-warning/20',
    featured: true,
  },
  {
    id: '4',
    name: 'David R.',
    role: 'Real Estate Photographer',
    avatarInitials: 'DR',
    avatarColor: 'bg-info/15 text-info',
    rating: 5,
    quote: 'I process 80–120 images per shoot. The enhance and upscale combo is now a standard step in my Lightroom export workflow. Clients notice the difference immediately.',
    tool: 'Enhancer',
    toolColor: 'bg-info/10 text-info border-info/20',
  },
  {
    id: '5',
    name: 'Aisha M.',
    role: 'Brand Designer',
    avatarInitials: 'AM',
    avatarColor: 'bg-success/15 text-success',
    rating: 5,
    quote: 'Background removal in Photoshop used to eat 20 minutes per image, especially with hair. One click here and the edges are honestly cleaner than what I got manually. I don\'t go back.',
    tool: 'Background Remover',
    toolColor: 'bg-success/10 text-success border-success/20',
  },
  {
    id: '6',
    name: 'Tom H.',
    role: 'Aerial Photographer',
    avatarInitials: 'TH',
    avatarColor: 'bg-accent/15 text-accent-light',
    rating: 5,
    quote: 'My drone shots at max zoom come out slightly soft. The sharpener recovers the detail that\'s buried in the sensor data. Buildings, trees, text on signs — all crisp. Game changer.',
    tool: 'Sharpener',
    toolColor: 'bg-accent/10 text-accent-light border-accent/20',
  },
  {
    id: '7',
    name: 'Priya S.',
    role: 'Product Engineer',
    avatarInitials: 'PS',
    avatarColor: 'bg-brand/20 text-brand-light',
    rating: 5,
    quote: 'We pipe user-uploaded photos through the API before storing them. Integration took an afternoon. Quality is consistently excellent and our infrastructure team loves how simple it is.',
    tool: 'API',
    toolColor: 'bg-brand/10 text-brand-light border-brand/20',
  },
  {
    id: '8',
    name: 'Carlos M.',
    role: 'Portrait Photographer',
    avatarInitials: 'CM',
    avatarColor: 'bg-warning/15 text-warning',
    rating: 5,
    quote: 'The face enhancer is subtle in the best possible way. Clients just think I got lucky with the shot — they can\'t tell anything was touched. That\'s exactly what I needed.',
    tool: 'Face Enhancer',
    toolColor: 'bg-warning/10 text-warning border-warning/20',
  },
  {
    id: '9',
    name: 'Emma L.',
    role: 'Print-on-Demand Creator',
    avatarInitials: 'EL',
    avatarColor: 'bg-info/15 text-info',
    rating: 5,
    quote: 'Tried 4 other AI upscalers. Nedriva is the only one that doesn\'t make fabric textures look like painted plastic. My print supplier said the files were the best they\'d seen from a POD seller.',
    tool: 'Upscaler',
    toolColor: 'bg-accent/10 text-accent-light border-accent/20',
    featured: true,
  },
];

/* ── Stars ───────────────────────────────────────────────────── */

const Stars = (props: { rating: number; label: string }) => (
  <div className="flex items-center gap-0.5" aria-label={props.label}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`size-4 ${i < props.rating ? 'text-warning' : 'text-white/15'}`}
      >
        <path
          fillRule="evenodd"
          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
          clipRule="evenodd"
        />
      </svg>
    ))}
  </div>
);

/* ── Quote icon ──────────────────────────────────────────────── */

const QuoteIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="size-7 text-brand/25">
    <path d="M10 8C6.686 8 4 10.686 4 14v10h10V14H7.5c0-1.38 1.12-2.5 2.5-2.5V8zm14 0c-3.314 0-6 2.686-6 6v10h10V14h-6.5c0-1.38 1.12-2.5 2.5-2.5V8z" />
  </svg>
);

/* ── Card (motion-aware) ─────────────────────────────────────── */

type CardProps = { item: Testimonial; starsLabel: string; verifiedLabel: string };

const TestimonialCard = (props: CardProps) => {
  const { item } = props;
  return (
    <motion.div
      variants={cardVariant}
      className={`relative flex h-full w-full flex-col rounded-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 ${
        item.featured
          ? 'border border-brand/35 bg-surface hover:border-brand/55'
          : 'border border-brand/10 bg-surface hover:border-brand/30'
      }`}
    >
      {/* Featured glow */}
      {item.featured && (
        <div
          className="pointer-events-none absolute inset-0 rounded-card opacity-30"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.15) 0%, transparent 60%)' }}
        />
      )}

      {/* Top row: quote icon + stars */}
      <div className="relative mb-4 flex items-start justify-between">
        <QuoteIcon />
        <Stars rating={item.rating} label={props.starsLabel} />
      </div>

      {/* Quote */}
      <p className="relative mb-5 flex-1 text-[15px] leading-relaxed text-muted">
        &ldquo;
        {item.quote}
        &rdquo;
      </p>

      {/* Tool badge */}
      <span className={`mb-4 inline-flex w-fit rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${item.toolColor}`}>
        {item.tool}
      </span>

      {/* Divider */}
      <div className="mb-4 h-px bg-white/6" />

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.avatarColor}`}>
          {item.avatarInitials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <p className="text-xs text-subtle">{item.role}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] font-medium text-subtle">
          <svg viewBox="0 0 16 16" fill="currentColor" className="size-3 text-success">
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.536 5.47a.75.75 0 00-1.061-1.06l-3.5 3.5-1.5-1.5a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.061-4z" clipRule="evenodd" />
          </svg>
          {props.verifiedLabel}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Section ─────────────────────────────────────────────────── */

export const TestimonialsSection = () => {
  const t = useTranslations('TestimonialsPage');

  return (
    <section className="bg-page py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header — stagger eyebrow → h2 → subtext ── */}
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center"
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.span
            variants={headerItem}
            className="mb-4 inline-flex items-center gap-2 rounded-pill border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-light"
          >
            {t('eyebrow_badge')}
          </motion.span>

          <motion.h2
            variants={headerItem}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            {t('headline')}
            {' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-text)' }}
            >
              {t('headline_gradient')}
            </span>
          </motion.h2>

          <motion.p variants={headerItem} className="mt-4 text-lg text-muted">
            {t('subtext')}
          </motion.p>
        </motion.div>

        {/* ── Desktop — 3-col grid, equal-height rows, stagger per card ── */}
        <div className="hidden gap-5 lg:grid lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={item.id}
              className="flex"
              variants={fadeUp}
              custom={i * 0.06}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <TestimonialCard
                item={item}
                starsLabel={t('stars_label')}
                verifiedLabel={t('verified_label')}
              />
            </motion.div>
          ))}
        </div>

        {/* ── Tablet: 2 columns ── */}
        <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:hidden">
          {TESTIMONIALS.map((item, i) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              custom={i * 0.06}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <TestimonialCard
                item={item}
                starsLabel={t('stars_label')}
                verifiedLabel={t('verified_label')}
              />
            </motion.div>
          ))}
        </div>

        {/* ── Mobile: 1 column, first 4 ── */}
        <div className="flex flex-col gap-5 sm:hidden">
          {TESTIMONIALS.slice(0, 4).map((item, i) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              custom={i * 0.08}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <TestimonialCard
                item={item}
                starsLabel={t('stars_label')}
                verifiedLabel={t('verified_label')}
              />
            </motion.div>
          ))}
        </div>

        {/* ── CTA ── */}
        <motion.div
          className="mt-14 flex flex-col items-center gap-3 text-center"
          variants={fadeUp}
          custom={0.2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2.5 rounded-pill px-8 py-3.5 text-base font-bold text-white shadow-cta transition-transform hover:scale-[1.03]"
            style={{ background: 'var(--gradient-cta)' }}
          >
            {t('cta_join', { count: '50,000+' })}
          </Link>
          <p className="text-sm text-subtle">{t('cta_free')}</p>
        </motion.div>

      </div>
    </section>
  );
};
