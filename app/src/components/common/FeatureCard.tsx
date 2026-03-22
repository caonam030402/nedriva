'use client';

/**
 * FeatureCard — Card hiển thị value proposition / tính năng nổi bật.
 * Props: eyebrow, title, description, statValue, statLabel, icon, accent (brand|success|accent)
 * Dùng Lucide icons.
 */
import { motion } from 'framer-motion';

type FeatureCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  statValue: string;
  statLabel: string;
  icon: React.ReactNode;
  accent?: 'brand' | 'success' | 'accent';
  index?: number;
};

const ACCENT_CONFIG = {
  brand:   { border: 'border-brand/20 hover:border-brand/40',    glow: 'bg-brand',   iconBg: 'bg-brand/20',   text: 'text-brand-light' },
  success: { border: 'border-success/20 hover:border-success/40', glow: 'bg-success', iconBg: 'bg-success/15', text: 'text-success' },
  accent:  { border: 'border-accent/20 hover:border-accent/40',   glow: 'bg-accent',  iconBg: 'bg-accent/15',  text: 'text-accent-light' },
};

export const FeatureCard = (props: FeatureCardProps) => {
  const accent = props.accent ?? 'brand';
  const cfg = ACCENT_CONFIG[accent];

  return (
    <motion.div
      className={`group relative flex flex-col overflow-hidden rounded-card border bg-surface p-7 shadow-card transition-all duration-300 hover:-translate-y-1 ${cfg.border}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: (props.index ?? 0) * 0.08 }}
    >
      {/* Subtle gradient glow top-right */}
      <div
        className={`pointer-events-none absolute -top-10 -right-10 size-40 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-35 ${cfg.glow}`}
      />

      {/* Icon */}
      <div
        className={`relative mb-5 inline-flex size-12 items-center justify-center rounded-ui-md ${cfg.iconBg} ${cfg.text}`}
      >
        {props.icon}
      </div>

      {/* Eyebrow */}
      <span className={`mb-1.5 text-xs font-bold tracking-widest uppercase ${cfg.text}`}>
        {props.eyebrow}
      </span>

      {/* Title */}
      <h3 className="mb-3 text-xl font-bold leading-snug text-foreground">
        {props.title}
      </h3>

      {/* Description */}
      <p className="flex-1 text-sm leading-relaxed text-muted">
        {props.description}
      </p>

      {/* Stat */}
      <div className={`mt-6 flex items-baseline gap-2 border-t pt-5 ${cfg.border}`}>
        <span className={`text-2xl font-extrabold ${cfg.text}`}>
          {props.statValue}
        </span>
        <span className="text-sm text-subtle">{props.statLabel}</span>
      </div>
    </motion.div>
  );
};
