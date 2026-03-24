type FeatureCompareSplitProps = {
  beforeLabel: string;
  afterLabel: string;
};

/**
 * Static before | after split for feature rows (non-interactive).
 * @param props - Region labels
 * @param props.beforeLabel - Muted / source side caption
 * @param props.afterLabel - Enhanced side caption
 */
export function FeatureCompareSplit(props: FeatureCompareSplitProps) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card border border-white/[0.08]">
      <div className="absolute inset-0 flex">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-900">
          <span className="absolute top-2 left-2 rounded-pill bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300 uppercase backdrop-blur-sm">
            {props.beforeLabel}
          </span>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-emerald-900/35 via-zinc-900 to-zinc-950">
          <span className="absolute top-2 right-2 rounded-pill bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-200/90 uppercase backdrop-blur-sm">
            {props.afterLabel}
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-white/35" />
    </div>
  );
}
