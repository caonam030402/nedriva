'use client';

/* ═══════════════════════════════════════════════════════════════
   GridOverlay — Decorative grid background.
   ═══════════════════════════════════════════════════════════════ */

type GridOverlayProps = {
  opacity?: number;
  size?: string;
};

export const GridOverlay = (props: GridOverlayProps) => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.025]"
    style={{
      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
      backgroundSize: props.size ?? '48px 48px',
    }}
  />
);
