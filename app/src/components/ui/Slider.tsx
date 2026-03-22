'use client';

import { Slider as HeroSlider } from '@heroui/react/slider';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
};

export const Slider = (props: Props) => (
  <HeroSlider.Root
    value={props.value}
    onChange={v => props.onChange(Number(v))}
    minValue={props.min ?? 0}
    maxValue={props.max ?? 100}
    step={props.step ?? 1}
  >
    {props.label && (
      <div className="mb-2 flex justify-between">
        <span className="text-xs text-muted">{props.label}</span>
        <div className="flex items-baseline gap-0.5">
          {/* eslint-disable-next-line tailwindcss/classnames-order */}
          <HeroSlider.Output className="text-[11px] tabular-nums text-muted" />
          <span className="text-[10px] text-subtle">%</span>
        </div>
      </div>
    )}
    <HeroSlider.Track className="h-1.5">
      <HeroSlider.Fill />
      <HeroSlider.Thumb className="w-4! [&::after]:h-3.5! [&::after]:w-3.5!" />
    </HeroSlider.Track>
  </HeroSlider.Root>
);
