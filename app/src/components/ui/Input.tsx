'use client';

import { Input as HeroInput } from '@heroui/react/input';

type Props = {
  id?: string;
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
  className?: string;
};

export const Input = (props: Props) => (
  <div className={`flex flex-col gap-1 ${props.className ?? ''}`}>
    {props.label && (
      <label
        htmlFor={props.id}
        className="text-[10px] font-medium tracking-wide text-subtle uppercase"
      >
        {props.label}
      </label>
    )}
    <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
      <HeroInput
        id={props.id}
        type={props.type ?? 'text'}
        value={String(props.value)}
        min={props.min}
        max={props.max}
        step={props.step}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={e => props.onChange(e.target.value)}
        // eslint-disable-next-line tailwindcss/classnames-order
        className="w-full bg-transparent text-xs font-medium text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {props.suffix && (
        <span className="shrink-0 text-[10px] text-subtle">{props.suffix}</span>
      )}
    </div>
  </div>
);
