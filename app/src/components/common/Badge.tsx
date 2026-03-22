'use client';

/* ═══════════════════════════════════════════════════════════════
   Badge — Shared badge component.
   ═══════════════════════════════════════════════════════════════ */

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'error' | 'info' | 'accent';

const BADGE_STYLES: Record<BadgeVariant, { border: string; bg: string; text: string }> = {
  brand:   { border: 'border-brand/40',   bg: 'bg-brand/10',    text: 'text-brand-light' },
  success: { border: 'border-success/30', bg: 'bg-success/10',  text: 'text-success' },
  warning: { border: 'border-warning/30', bg: 'bg-warning/10',  text: 'text-warning' },
  error:   { border: 'border-error/30',   bg: 'bg-error/10',    text: 'text-error' },
  info:    { border: 'border-info/30',     bg: 'bg-info/10',     text: 'text-info' },
  accent:  { border: 'border-accent/40',  bg: 'bg-accent/10',   text: 'text-accent-light' },
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  pulse?: boolean;
  className?: string;
};

export const Badge = (props: BadgeProps) => {
  const v = props.variant ?? 'brand';
  const s = BADGE_STYLES[v];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-pill border bg-opacity-60 px-4 py-1.5 text-sm font-medium backdrop-blur-sm ${s.border} ${s.bg} ${s.text} ${props.className ?? ''}`}
    >
      {props.pulse && (
        <span
          className={`size-1.5 animate-pulse rounded-full ${
            v === 'brand' ? 'bg-brand-light' : v === 'success' ? 'bg-success' : 'bg-current'
          }`}
        />
      )}
      {props.children}
    </span>
  );
};
