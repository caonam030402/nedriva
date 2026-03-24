/**
 * Hero visual — before | after split.
 * The "after" side uses a checkerboard to show true transparency.
 */
type Props = {
  beforeLabel: string;
  afterLabel: string;
};

export function HeroBgSplit(props: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-card border border-white/[0.08] shadow-[0_0_48px_rgba(0,0,0,0.5)]">
      {/* Checkerboard for transparent BG (8x8 pattern) */}
      <div
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        }}
      />

      {/* After (BG removed) — right half */}
      <div className="relative z-10 aspect-[4/3] w-full">
        {/* Full-frame subject: person silhouette */}
        <div className="absolute inset-0 flex items-end justify-center">
          {/* Body */}
          <div className="relative w-3/5">
            {/* Head */}
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-300" />
            {/* Neck */}
            <div className="mx-auto h-4 w-6 bg-gradient-to-b from-amber-200 to-amber-300" />
            {/* Torso */}
            <div className="mx-auto mt-0.5 h-24 w-24 rounded-t-3xl bg-gradient-to-b from-amber-200 to-zinc-300" />
          </div>
        </div>

        {/* Drop shadow under subject */}
        <div className="absolute bottom-4 left-1/2 h-4 w-2/3 -translate-x-1/2 rounded-full bg-black/30 blur-md" />

        {/* Clean cut glow divider */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-white/70 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

        {/* Labels */}
        <span className="absolute top-3 left-3 rounded-pill bg-black/60 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-zinc-300 uppercase backdrop-blur-sm">
          {props.beforeLabel}
        </span>
        <span className="absolute top-3 right-3 rounded-pill bg-black/60 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-indigo-300 uppercase backdrop-blur-sm">
          {props.afterLabel}
        </span>
      </div>
    </div>
  );
}
