/* ═══════════════════════════════════════════════════════════════
   MediaCard — Rounded media shell (image/video) with optional overlay.
   ═══════════════════════════════════════════════════════════════ */

type Aspect = 'video' | 'square' | 'portrait' | 'landscape';

const ASPECT: Record<Aspect, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[9/16]',
  landscape: 'aspect-[21/9]',
};

type MediaCardProps = {
  children: React.ReactNode;
  aspect?: Aspect;
  className?: string;
  /** e.g. gradient scrim or play icon */
  overlay?: React.ReactNode;
  /** Where to place `overlay` inside the frame */
  overlayPlacement?: 'bottom' | 'center';
  /** Small label above the frame */
  label?: string;
  hoverLift?: boolean;
};

export const MediaCard = (props: MediaCardProps) => {
  const aspect = props.aspect ?? 'video';
  const lift = props.hoverLift ?? true;

  return (
    <div className={`flex flex-col gap-2 ${props.className ?? ''}`}>
      {props.label && (
        <p className="text-[11px] font-semibold tracking-widest text-subtle uppercase">{props.label}</p>
      )}
      <div
        className={`relative overflow-hidden rounded-card border border-white/[0.08] bg-elevated ${ASPECT[aspect]} ${
          lift ? 'card-hover transition-all duration-300' : ''
        }`}
      >
        <div className="absolute inset-0">{props.children}</div>
        {props.overlay && (
          <div
            className={`pointer-events-none absolute inset-0 flex ${
              props.overlayPlacement === 'center'
                ? 'items-center justify-center'
                : 'flex-col justify-end'
            }`}
          >
            {props.overlay}
          </div>
        )}
      </div>
    </div>
  );
};
