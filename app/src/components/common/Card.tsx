'use client';

/* ═══════════════════════════════════════════════════════════════
   Card — Shared card component.
   ═══════════════════════════════════════════════════════════════ */

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
};

const PAD: Record<string, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export const Card = (props: CardProps) => {
  const p = props.padding ?? 'md';

  return (
    <div
      className={`rounded-card border border-white/[0.06] bg-surface shadow-card ${
        props.hover
          ? 'transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-elevated'
          : ''
      } ${PAD[p]} ${props.className ?? ''}`}
    >
      {props.children}
    </div>
  );
};
