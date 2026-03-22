'use client';

/**
 * UseCaseCard — Card hiển thị use-case với before/after image.
 */
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

type UseCaseCardProps = {
  badge: string;
  badgeColor?: string;
  title: string;
  description: string;
  features: string[];
  imageSeed: string;
  beforeFilter?: string;
  beforeLabel?: string;
  afterLabel?: string;
  href?: string;
  index?: number;
};

export const UseCaseCard = (props: UseCaseCardProps) => {
  const badgeColor = props.badgeColor ?? 'text-brand-light bg-brand/10 border-brand/30';

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-card border border-white/[0.06] bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12]"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (props.index ?? 0) * 0.08 }}
    >
      {/* ── Before / After image ── */}
      <div className="relative h-52 overflow-hidden bg-elevated">
        {/* After — underneath, full width */}
        <img
          src={`https://picsum.photos/seed/${props.imageSeed}/800/416`}
          alt={`After — ${props.title}`}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Before — left half with CSS filter */}
        <div className="absolute inset-0 w-1/2 overflow-hidden">
          <img
            src={`https://picsum.photos/seed/${props.imageSeed}/800/416`}
            alt={`Before — ${props.title}`}
            className="size-full object-cover"
            style={{
              width: '200%',
              maxWidth: 'none',
              filter:
                props.beforeFilter ?? 'grayscale(0.4) blur(1.5px) brightness(0.8) contrast(0.85)',
            }}
          />
        </div>

        {/* Divider line */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/60" />

        {/* Before / After labels */}
        <span className="absolute top-2.5 left-2.5 rounded-pill bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {props.beforeLabel ?? 'Before'}
        </span>
        <span className="absolute top-2.5 right-2.5 rounded-pill bg-brand/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {props.afterLabel ?? 'After'}
        </span>

        {/* Operation badge */}
        <span
          className={`absolute bottom-2.5 left-2.5 rounded-pill border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${badgeColor}`}
        >
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
              <Check className="mt-0.5 size-3.5 shrink-0 text-brand-light" />
              {feat}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
