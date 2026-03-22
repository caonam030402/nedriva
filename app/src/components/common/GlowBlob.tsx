'use client';

/* ═══════════════════════════════════════════════════════════════
   GlowBlob — Decorative glow blob.
   ═══════════════════════════════════════════════════════════════ */

type GlowBlobProps = {
  variant?: 'brand' | 'accent' | 'success' | 'warning';
  className?: string;
};

const GLOW: Record<string, string> = {
  brand:   'bg-brand',
  accent:  'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
};

export const GlowBlob = (props: GlowBlobProps) => (
  <div
    className={`pointer-events-none absolute size-64 rounded-full opacity-20 blur-3xl ${GLOW[props.variant ?? 'brand']} ${props.className ?? ''}`}
  />
);
