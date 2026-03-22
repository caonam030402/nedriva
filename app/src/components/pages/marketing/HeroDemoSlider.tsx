'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

export const HeroDemoSlider = () => {
  const [position, setPosition] = useState(52);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(clientX - rect.left, rect.width - 8));
    setPosition((x / rect.width) * 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full cursor-col-resize overflow-hidden rounded-card select-none"
      onMouseMove={e => handleMove(e.clientX)}
      onTouchMove={e => handleMove(e.touches[0]!.clientX)}
    >
      {/* ── After (enhanced) — full width underneath ── */}
      <img
        src="https://picsum.photos/seed/pixelai/1200/675"
        alt="After — enhanced"
        className="absolute inset-0 size-full object-cover"
        draggable={false}
      />

      {/* ── Before (original) — clipped left portion ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src="https://picsum.photos/seed/pixelai/1200/675"
          alt="Before — original"
          className="size-full object-cover"
          style={{
            width: `${(100 / position) * 100}%`,
            maxWidth: 'none',
            filter: 'grayscale(0.65) blur(1.5px) brightness(0.85)',
          }}
          draggable={false}
        />
        {/* "Before" label */}
        <span className="absolute top-3 left-3 rounded-pill bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          Before
        </span>
      </div>

      {/* ── After label ── */}
      <span className="absolute top-3 right-3 rounded-pill bg-brand/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        After · Enhanced
      </span>

      {/* ── Divider line ── */}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
        style={{ left: `${position}%` }}
      />

      {/* ── Drag handle ── */}
      <motion.div
        className="absolute top-1/2 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg"
        style={{ left: `${position}%` }}
        whileHover={{ scale: 1.1 }}
      >
        <svg className="size-4 text-brand" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
        </svg>
      </motion.div>

      {/* ── Upscale badge ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1.5 rounded-pill border border-brand/30 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-success" />
          <span className="text-xs font-medium text-white">Upscaled 4× · 512MP</span>
        </div>
      </div>
    </div>
  );
};
