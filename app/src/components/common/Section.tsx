'use client';

/* ═══════════════════════════════════════════════════════════════
   Section — Section wrapper component.
   ═══════════════════════════════════════════════════════════════ */

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  bg?: 'page' | 'surface' | 'elevated';
  py?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  id?: string;
};

const BG: Record<string, string> = {
  page:     'bg-page',
  surface:  'bg-surface',
  elevated: 'bg-elevated',
};

const PY: Record<string, string> = {
  sm:   'py-10',
  md:   'py-14',
  lg:   'py-20',
  xl:   'py-24',
  '2xl': 'py-28',
};

export const Section = (props: SectionProps) => (
  <section
    id={props.id}
    className={`relative overflow-hidden ${BG[props.bg ?? 'page']} ${PY[props.py ?? 'lg']} ${props.className ?? ''}`}
  >
    {props.children}
  </section>
);
