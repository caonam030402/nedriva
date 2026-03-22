'use client';

import { Switch as HeroSwitch } from '@heroui/react/switch';

type Props = {
  isSelected: boolean;
  onChange: (v: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

export const Switch = (props: Props) => (
  <HeroSwitch
    isSelected={props.isSelected}
    onChange={props.onChange}
    size={props.size ?? 'sm'}
    aria-label={props.label}
  >
    <HeroSwitch.Control>
      <HeroSwitch.Thumb />
    </HeroSwitch.Control>
  </HeroSwitch>
);
