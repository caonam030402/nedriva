'use client';

/* ═══════════════════════════════════════════════════════════════
   Container — Max-width container component.
   ═══════════════════════════════════════════════════════════════ */

export const Container = (props: {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) => {
  const Tag = props.as ?? 'div';

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${props.className ?? ''}`} {...({} as any)}>
      {props.children}
    </Tag>
  );
};
