'use client';

import type { ComponentPropsWithRef } from 'react';
import { Button as HeroButton } from '@heroui/react/button';

type HeroBtn = ComponentPropsWithRef<typeof HeroButton>;

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'tertiary';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  onPress?: HeroBtn['onPress'];
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  /** Preferred */
  'aria-label'?: string;
  /** Backward compat — alias for aria-label */
  ariaLabel?: string;
};

const VARIANT: Record<Variant, string> = {
  primary:
    'rounded-pill border-0 bg-brand font-bold text-inverse shadow-cta transition-transform duration-200 hover:scale-[1.02] hover:bg-brand-light active:scale-[0.99]',
  secondary:
    'rounded-pill border-0 bg-foreground font-bold text-page transition-transform duration-200 hover:scale-[1.02] hover:bg-white active:scale-[0.99]',
  outline:
    'rounded-pill border border-white/25 bg-transparent font-semibold text-foreground hover:border-white/45 hover:bg-white/[0.06]',
  ghost:
    'rounded-pill border-0 bg-transparent font-medium text-muted hover:bg-white/[0.06] hover:text-foreground',
  tertiary:
    'rounded-pill border-0 bg-white/10 font-semibold text-foreground hover:bg-white/20 active:bg-white/15',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 min-h-9 gap-1.5 px-4 text-sm',
  md: 'h-10 min-h-10 px-5 text-sm',
  lg: 'h-12 min-h-12 gap-2 px-8 text-base',
};

export const Button = (props: Props) => {
  const v = props.variant ?? 'ghost';
  const s = props.size ?? 'md';
  const isStyledVariant = (v: Variant) =>
    ['primary', 'secondary', 'outline', 'ghost', 'tertiary'].includes(v);

  return (
    <HeroButton
      variant={isStyledVariant(v) ? 'ghost' : (v as HeroBtn['variant'])}
      size={s}
      fullWidth={props.fullWidth}
      isDisabled={props.isDisabled}
      isIconOnly={props.isIconOnly}
      onPress={props.onPress ?? (props.onClick ? () => props.onClick?.() : undefined)}
      type={props.type}
      className={`${isStyledVariant(v) ? VARIANT[v as Variant] : ''} ${SIZE[s]} ${props.className ?? ''}`}
      style={props.style}
      aria-label={props['aria-label'] ?? props.ariaLabel}
    >
      {props.children}
    </HeroButton>
  );
};
