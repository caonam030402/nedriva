'use client';

/**
 * Shared draggable before/after compare (horizontal split).
 * Uses container queries (`100cqw`) so the “before” layer matches full frame width inside a clipped strip.
 */
import { GripVertical } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export type BeforeAfterCompareProps = {
  beforeSrc: string;
  afterSrc: string;
  /** Shown above the compare + used as aria-label for the slider */
  hint: string;
  /** Natural aspect ratio width : height in pixels (e.g. output image size) */
  ratioWidth?: number;
  ratioHeight?: number;
  /** Optional extra classes on the outer wrapper (padding etc.) */
  className?: string;
  /** Max height cap for the compare frame (Tailwind arbitrary or class) */
  frameClassName?: string;
};

export function BeforeAfterCompare(props: BeforeAfterCompareProps) {
  const {
    beforeSrc,
    afterSrc,
    hint,
    className = '',
    ratioWidth,
    ratioHeight,
    frameClassName = 'max-h-[min(70vh,560px)]',
  } = props;

  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);

  const hasRatio
    = ratioWidth != null
      && ratioHeight != null
      && ratioWidth > 0
      && ratioHeight > 0;
  const aspectStyle = hasRatio
    ? { aspectRatio: `${ratioWidth} / ${ratioHeight}` as const }
    : { aspectRatio: '1 / 1' as const };

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    const x = clientX - rect.left;
    const p = Math.round((x / rect.width) * 100);
    setPct(Math.min(100, Math.max(0, p)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = true;
    setDragging(true);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) {
      return;
    }
    setFromClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    dragRef.current = false;
    setDragging(false);
  };

  return (
    <div className={['relative mx-auto w-full max-w-full px-3 pt-3', className].filter(Boolean).join(' ')}>
      <p className="mb-2 text-center text-[10px] text-subtle">{hint}</p>
      <div
        ref={wrapRef}
        className={`[container-type:inline-size] relative mx-auto w-full overflow-hidden rounded-xl bg-black/40 ${frameClassName}`}
        style={aspectStyle}
      >
        <img
          src={afterSrc}
          alt=""
          loading="eager"
          decoding="async"
          className="pointer-events-none absolute inset-0 z-0 size-full object-cover object-center"
          draggable={false}
        />
        <div
          className="absolute inset-y-0 left-0 z-[1] overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <img
            src={beforeSrc}
            alt=""
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute top-0 left-0 h-full w-[100cqw] max-w-none object-cover object-center"
            draggable={false}
          />
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={hint}
          className={`absolute inset-0 z-[15] touch-none outline-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-ew-resize'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              setPct(p => Math.max(0, p - 5));
            }
            if (e.key === 'ArrowRight') {
              setPct(p => Math.min(100, p + 5));
            }
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 z-20 w-0"
          style={{ left: `${pct}%` }}
        >
          <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)]" />
          <div className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/95 text-neutral-800 shadow-lg">
            <GripVertical size={18} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
