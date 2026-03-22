'use client';

import { Checkbox as HeroCheckbox } from '@heroui/react/checkbox';

type Props = {
  isSelected: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
};

export const Checkbox = (props: Props) => (
  <HeroCheckbox isSelected={props.isSelected} onChange={props.onChange}>
    <HeroCheckbox.Control>
      <HeroCheckbox.Indicator />
    </HeroCheckbox.Control>
    {props.children && (
      <HeroCheckbox.Content>{props.children}</HeroCheckbox.Content>
    )}
  </HeroCheckbox>
);
