/* ═══════════════════════════════════════════════════════════════
   TagPill — Small catalog tag (genre, category) on dark UI.
   ═══════════════════════════════════════════════════════════════ */

type TagPillProps = {
  children: React.ReactNode;
  className?: string;
};

export const TagPill = (props: TagPillProps) => (
  <span
    className={`inline-flex items-center rounded-ui-sm border border-white/12 bg-transparent px-2 py-0.5 text-[10px] font-semibold tracking-wider text-subtle uppercase ${props.className ?? ''}`}
  >
    {props.children}
  </span>
);
