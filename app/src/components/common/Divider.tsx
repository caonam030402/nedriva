'use client';

/* ═══════════════════════════════════════════════════════════════
   Divider — Horizontal divider line.
   ═══════════════════════════════════════════════════════════════ */

type DividerProps = {
  className?: string;
  gradient?: boolean;
};

export const Divider = (props: DividerProps) => (
  <div
    className={`h-px w-full bg-white/[0.06] ${props.className ?? ''}`}
    style={
      props.gradient
        ? { background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }
        : undefined
    }
  />
);
