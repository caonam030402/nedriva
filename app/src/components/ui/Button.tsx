'use client';

/**
 * Button — Common Button component dùng chung toàn web.
 * Sử dụng unified design system với 3 variants: primary, secondary, outline
 * 
 * Sizes: sm / md / lg
 * Tự động wrap Link khi có href
 */
import type { ComponentPropsWithRef } from 'react';
import { Link } from '@/libs/i18n/I18nNavigation';

type Variant = 'primary' | 'secondary' | 'outline';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  isDisabled?: boolean; // HeroUI-style alias
  href?: string;
  onClick?: () => void;
  onPress?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ariaLabel?: string;
  style?: React.CSSProperties;
};

// Size classes
const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-8 text-base',
};

// Base classes
const BASE = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 cursor-pointer';

// Variant classes
const VARIANT: Record<Variant, string> = {
  primary: 'rounded-full text-white shadow-[0_4px_24px_rgba(139,92,246,0.5)] hover:scale-[1.03] active:scale-[0.98]',
  secondary:
    'rounded-xl text-[#a1a1b5] hover:bg-white/5 hover:text-white font-medium',
  outline:
    'rounded-full border border-white/10 text-[#a1a1b5] hover:text-white hover:border-white/20',
};

// Primary gradient
const PRIMARY_STYLE = { 
  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)',
  boxShadow: '0 4px 24px rgba(139, 92, 246, 0.5)',
};

export const Button = (props: ButtonProps) => {
  const variant = props.variant ?? 'secondary';
  const size = props.size ?? 'md';
  const isPrimary = variant === 'primary';

  const cls = [
    BASE,
    !isPrimary ? '' : SIZE[size],
    VARIANT[variant],
    props.fullWidth ? 'w-full' : '',
    props.className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {props.leftIcon && <span className="flex items-center">{props.leftIcon}</span>}
      {props.children}
      {props.rightIcon && <span className="flex items-center">{props.rightIcon}</span>}
    </>
  );

  const mergedStyle = isPrimary ? { ...PRIMARY_STYLE, ...(props.style ?? {}) } : props.style;

  // Support both HeroUI-style (isDisabled/onPress) and plain (disabled/onClick)
  const disabled = props.disabled ?? props.isDisabled;
  const handleClick = props.onClick ?? (props.onPress ? () => props.onPress?.() : undefined);

  const btn = (
    <button
      type={props.type ?? 'button'}
      disabled={disabled}
      onClick={handleClick}
      className={cls}
      aria-label={props.ariaLabel}
      style={mergedStyle}
    >
      {content}
    </button>
  );

  if (props.href) {
    return (
      <Link href={props.href} className={cls} aria-label={props.ariaLabel} style={mergedStyle}>
        {content}
      </Link>
    );
  }

  return btn;
};
