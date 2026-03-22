'use client';

/**
 * TestimonialCard — Card hiển thị testimonial/feedback từ người dùng.
 */
import { motion } from 'framer-motion';
import { Star, Quote, Check } from 'lucide-react';

/* ─── Stars Rating ─────────────────────────────────────────── */
type StarsSize = 'sm' | 'md' | 'lg';
const STAR_SIZE_CLASS: Record<StarsSize, string> = { sm: 'size-3', md: 'size-4', lg: 'size-5' };

const Stars = ({
  rating,
  label,
  size = 'md',
  className = '',
}: {
  rating: 4 | 5;
  label?: string;
  size?: StarsSize;
  className?: string;
}) => (
  <div className={`flex items-center gap-0.5 ${className}`} aria-label={label}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${STAR_SIZE_CLASS[size]} ${
          i < rating ? 'fill-warning text-warning' : 'text-white/15'
        }`}
      />
    ))}
  </div>
);

/* ─── Quote Icon ──────────────────────────────────────────── */
const QuoteIcon = ({ className = 'size-7' }: { className?: string }) => (
  <Quote className={`text-brand/25 ${className}`} />
);

/* ─── Card Props ──────────────────────────────────────────── */
type TestimonialCardProps = {
  name: string;
  role: string;
  avatarInitials: string;
  avatarColor?: string;
  rating: 4 | 5;
  quote: string;
  tool?: string;
  toolColor?: string;
  featured?: boolean;
  starsLabel?: string;
  verifiedLabel?: string;
  index?: number;
};

export const TestimonialCard = (props: TestimonialCardProps) => {
  const avatarColor = props.avatarColor ?? 'bg-brand/20 text-brand-light';

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`relative flex h-full w-full flex-col rounded-card border bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 ${
        props.featured
          ? 'border-brand/35 hover:border-brand/55'
          : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      {props.featured && (
        <div
          className="pointer-events-none absolute inset-0 rounded-card opacity-30"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.15) 0%, transparent 60%)' }}
        />
      )}

      <div className="relative mb-4 flex items-start justify-between">
        <QuoteIcon className="size-7 text-brand/25" />
        <Stars rating={props.rating} label={props.starsLabel} size="sm" />
      </div>

      <p className="relative mb-5 flex-1 text-[15px] leading-relaxed text-muted">
        &ldquo;{props.quote}&rdquo;
      </p>

      {props.tool && (
        <span
          className={`mb-4 inline-flex w-fit rounded-pill border px-2.5 py-0.5 text-[11px] font-semibold ${
            props.toolColor ?? 'bg-brand/10 text-brand-light border-brand/20'
          }`}
        >
          {props.tool}
        </span>
      )}

      <div className="mb-4 h-px bg-white/[0.06]" />

      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor}`}
        >
          {props.avatarInitials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{props.name}</p>
          <p className="text-xs text-subtle">{props.role}</p>
        </div>
        {props.verifiedLabel && (
          <div className="ml-auto flex items-center gap-1 text-[10px] font-medium text-subtle">
            <Check className="size-3 text-success" />
            {props.verifiedLabel}
          </div>
        )}
      </div>
    </motion.div>
  );
};
