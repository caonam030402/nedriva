'use client';

/**
 * Chip — Pill-shaped header / toolbar chip.
 *
 * Usage:
 *   <Chip variant="idle" size="md">Default</Chip>
 *   <Chip variant="accent" icon={<Icon />} size="md">With icon</Chip>
 *   <Chip variant="warning" href="/route" size="md">Link variant</Chip>
 */

import type { ReactNode } from 'react';
import { Link } from '@/libs/i18n/I18nNavigation';

// ── Shared sizing ───────────────────────────────────────────────

const SIZE: Record<string, string> = {
  sm: 'h-8 min-h-8 px-2.5 text-[11px]',
  md: 'h-9 min-h-9 px-3 text-xs',
};

// ── Variant styles ─────────────────────────────────────────────

const VARIANT = {
  idle: [
    // border / bg / text
    'border-white/[0.10] bg-white/[0.04] text-zinc-200',
    // hover
    'hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white',
  ],
  accent: [
    // same base as idle — colored icon carries the personality
    'border-white/[0.10] bg-white/[0.04] text-zinc-200',
    'hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white',
  ],
  warning: [
    // depleted credits — amber, not alarming
    'border-amber-500/22 bg-amber-950/35 text-amber-50',
    'hover:border-amber-400/32 hover:bg-amber-950/50',
  ],
} as const;

type Variant = keyof typeof VARIANT;
type Size = keyof typeof SIZE;

// ── Props ───────────────────────────────────────────────────────

type Props = {
  /** Visual tone */
  variant?: Variant;
  /** Height */
  size?: Size;
  /** Optional route — renders as `<Link>` */
  href?: string;
  /** Icon placed before children; color is controlled via `iconClassName` */
  icon?: ReactNode;
  /** Additional classes for the icon wrapper (`<span>`) */
  iconClassName?: string;
  /** Additional classes for the chip root */
  className?: string;
  children: ReactNode;
};

// ── Component ───────────────────────────────────────────────────

const ChipIcon = (props: { icon: ReactNode; className?: string }) => (
  <span className={`size-3.5 flex shrink-0 items-center justify-center ${props.className ?? ''}`}>
    {props.icon}
  </span>
);

export const Chip = (props: Props) => {
  const {
    variant = 'idle',
    size = 'md',
    href,
    icon,
    iconClassName,
    className,
    children,
  } = props;

  const base = [
    // layout
    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border font-medium tabular-nums',
    // transition
    'transition-[background-color,border-color,color] duration-200',
    // size
    SIZE[size],
    // variant
    ...VARIANT[variant],
  ].join(' ');

  const root = `${base} ${className ?? ''}`;

  const content = (
    <>
      {icon && <ChipIcon icon={icon} className={iconClassName} />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={root}>
        {content}
      </Link>
    );
  }

  return <span className={root}>{content}</span>;
};
