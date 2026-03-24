/* ═══════════════════════════════════════════════════════════════
   BrandLogo — Wordmark + gold mark (marketing chrome).
   Wrap with <Link> where navigation is required.
   ═══════════════════════════════════════════════════════════════ */

type BrandLogoProps = {
  className?: string;
  /** Letter inside the mark (default N) */
  mark?: string;
};

export const BrandLogo = (props: BrandLogoProps) => {
  const mark = props.mark ?? 'N';

  return (
    <span className={`inline-flex items-center gap-2.5 ${props.className ?? ''}`}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-ui-md bg-brand text-sm font-bold text-inverse">
        {mark}
      </span>
      <span className="font-bold tracking-tight text-foreground">Nedriva</span>
    </span>
  );
};
