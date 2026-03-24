'use client';

import { useId, useState } from 'react';

type HeroCompareSliderProps = {
  beforeLabel: string;
  afterLabel: string;
  hint: string;
};

const TRACK_CLASS =
  'pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.35)]';

/**
 * Draggable before/after hero visual — no external assets required.
 * @param props - Copy for compare UI
 * @param props.beforeLabel - Lower-resolution side label
 * @param props.afterLabel - Upscaled side label
 * @param props.hint - Instructions for the range control
 */
export function HeroCompareSlider(props: HeroCompareSliderProps) {
  const id = useId();
  const [positionPct, setPositionPct] = useState(52);

  return (
    <div className="relative w-full">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-card border border-white/[0.08] bg-black/40 shadow-card"
        style={{ touchAction: 'none' }}
      >
        {/* After (higher “quality”) — full frame */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-zinc-950"
          aria-hidden
        />
        <div className="absolute bottom-3 left-3 rounded-pill bg-black/50 px-2 py-1 text-[10px] font-semibold tracking-wide text-emerald-200/90 uppercase backdrop-blur-sm">
          {props.afterLabel}
        </div>

        {/* Before — clipped from the left */}
        <div
          className="absolute inset-0 overflow-hidden bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900"
          style={{ clipPath: `inset(0 ${100 - positionPct}% 0 0)` }}
          aria-hidden
        />
        <div className="absolute top-3 left-3 rounded-pill bg-black/50 px-2 py-1 text-[10px] font-semibold tracking-wide text-zinc-300 uppercase backdrop-blur-sm">
          {props.beforeLabel}
        </div>

        <div
          className={TRACK_CLASS}
          style={{ left: `${positionPct}%`, transform: 'translateX(-50%)' }}
          aria-hidden
        />

        <label htmlFor={id} className="sr-only">
          {props.hint}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={positionPct}
          aria-valuetext={`${positionPct}%`}
          onChange={e => setPositionPct(Number(e.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="mt-2 text-center text-xs text-subtle">{props.hint}</p>
    </div>
  );
}
