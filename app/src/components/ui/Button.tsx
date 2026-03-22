'use client';

import type { ComponentPropsWithRef } from 'react';
import { Button as HeroButton } from '@heroui/react/button';

type HeroButtonProps = ComponentPropsWithRef<typeof HeroButton>;

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  onPress?: HeroButtonProps['onPress'];
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

export const Button = (props: Props) => (
  <HeroButton
    variant={props.variant ?? 'ghost'}
    size={props.size ?? 'md'}
    fullWidth={props.fullWidth}
    isDisabled={props.isDisabled}
    isIconOnly={props.isIconOnly}
    onPress={props.onPress ?? (props.onClick ? () => props.onClick?.() : undefined)}
    type={props.type}
    className={props.className}
    style={props.style}
    aria-label={props.ariaLabel}
  >
    {props.children}
  </HeroButton>
);
