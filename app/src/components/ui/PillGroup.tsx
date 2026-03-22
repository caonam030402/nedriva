'use client';

import { InfoTooltip } from './InfoTooltip';

type PillOption = {
  id: string | number;
  label: string;
  tooltip?: string;
  previewUrl?: string;
};

type Props = {
  options: PillOption[];
  value: string | number;
  onChange: (id: string | number) => void;
  className?: string;
};

export const PillGroup = (props: Props) => (
  <div className={`flex flex-wrap gap-1.5 ${props.className ?? ''}`}>
    {props.options.map(opt => (
      <button
        key={opt.id}
        type="button"
        onClick={() => props.onChange(opt.id)}
        className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          props.value === opt.id
            ? 'border border-transparent bg-brand text-white'
            : 'border border-white/15 text-muted hover:border-white/30 hover:text-foreground'
        }`}
      >
        {opt.label}
        {opt.tooltip && (
          <InfoTooltip text={opt.tooltip} previewUrl={opt.previewUrl} size={11} />
        )}
      </button>
    ))}
  </div>
);
