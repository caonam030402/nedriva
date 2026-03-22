'use client';

/* ═══════════════════════════════════════════════════════════════
   GradientText — Text with gradient background.
   ═══════════════════════════════════════════════════════════════ */

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  gradient?: 'text' | 'cta' | 'brand';
};

const GRAD: Record<string, string> = {
  text:  'var(--gradient-text)',
  cta:   'var(--gradient-cta)',
  brand: 'var(--gradient-brand)',
};

export const GradientText = (props: GradientTextProps) => (
  <span
    className={`bg-clip-text text-transparent ${props.className ?? ''}`}
    style={{ backgroundImage: GRAD[props.gradient ?? 'text'] }}
  >
    {props.children}
  </span>
);
