'use client';

import { useId, useState } from 'react';

type Props = {
  beforeLabel: string;
  afterLabel: string;
};

/**
 * Draggable before/after slider — left = original, right = BG removed.
 * Checkerboard background reveals true transparency on the right side.
 * @param props - Labels for the before/after regions
 * @param props.beforeLabel - Label shown on the original side
 * @param props.afterLabel - Label shown on the BG-removed side
 */
export function HeroCompareSlider(props: Props) {
  const id = useId();
  const [pct, setPct] = useState(50);

  return (
    <div className="relative w-full">
      {/* Slider wrapper */}
      <div
        className="relative overflow-hidden rounded-card border border-white/[0.08] shadow-[0_0_48px_rgba(0,0,0,0.5)]"
        style={{ touchAction: 'none' }}
      >
        {/* Checkerboard base (shows through transparent right side) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #1c1c1c 25%, transparent 25%), linear-gradient(-45deg, #1c1c1c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c1c 75%), linear-gradient(-45deg, transparent 75%, #1c1c1c 75%)',
            backgroundSize: '14px 14px',
            backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
          }}
        />

        {/* After: BG removed (full frame, on top) */}
        <div className="absolute inset-0 z-10 flex items-end justify-center">
          {/* Subject — person silhouette */}
          <div className="relative w-3/5">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-300" />
            <div className="mx-auto h-3 w-5 bg-gradient-to-b from-amber-200 to-amber-300" />
            <div className="mx-auto mt-0.5 h-20 w-20 rounded-t-3xl bg-gradient-to-b from-amber-200 to-zinc-300" />
          </div>
          <span className="absolute top-3 right-3 rounded-pill bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-indigo-300 uppercase backdrop-blur-sm">
            {props.afterLabel}
          </span>
        </div>

        {/* Before: original (clipped) */}
        <div
          className="relative z-20 flex items-end justify-center"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-zinc-800 to-zinc-950" />
          <div className="relative w-3/5">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-300" />
            <div className="mx-auto h-3 w-5 bg-gradient-to-b from-amber-200 to-amber-300" />
            <div className="mx-auto mt-0.5 h-20 w-20 rounded-t-3xl bg-gradient-to-b from-amber-200 to-zinc-300" />
          </div>
          {/* BG overlay for left side */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(80,50,20,0.7),transparent_60%)]" />
          <span className="absolute top-3 left-3 rounded-pill bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-300 uppercase backdrop-blur-sm">
            {props.beforeLabel}
          </span>
        </div>

        {/* Draggable vertical line */}
        <div
          className="absolute inset-y-0 z-30 w-0.5 -translate-x-1/2 cursor-ew-resize bg-white/70 shadow-[0_0_14px_rgba(255,255,255,0.5)]"
          style={{ left: `${pct}%` }}
          aria-hidden
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/60 p-1 backdrop-blur-sm">
            <svg className="size-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* Invisible range input for accessibility */}
        <label htmlFor={id} className="sr-only">{props.beforeLabel} / {props.afterLabel}</label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pct}
          aria-valuetext={`${pct}%`}
          onChange={e => setPct(Number(e.target.value))}
          className="absolute inset-0 z-40 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
