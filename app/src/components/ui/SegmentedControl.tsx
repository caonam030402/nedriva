'use client';

import { Tooltip } from '@heroui/react/tooltip';

type Option = {
  id: string | number;
  label: string;
  disabled?: boolean;
  locked?: boolean;
  lockedTooltip?: React.ReactNode;
};

type Props = {
  options: Option[];
  value: string | number;
  onChange: (id: string | number) => void;
  className?: string;
  /** Light active pill on dark hero (e.g. pricing page). */
  appearance?: 'default' | 'lightOnDark';
};

const LockedButton = (props: { label: string; tooltip: React.ReactNode }) => (
  <Tooltip.Root delay={0} closeDelay={0}>
    <Tooltip.Trigger className="flex flex-1">
      <span className="flex w-full cursor-not-allowed items-center justify-center rounded-md py-1.5 text-xs font-medium text-white/20 select-none">
        {props.label}
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content
      showArrow
      className="max-w-[200px] rounded-xl bg-white shadow-xl"
      style={{ padding: '10px 12px' }}
    >
      {props.tooltip}
    </Tooltip.Content>
  </Tooltip.Root>
);

export const SegmentedControl = (props: Props) => {
  const onDark = props.appearance === 'lightOnDark';
  return (
    <div
      className={
        onDark
          ? `flex gap-0.5 overflow-hidden rounded-xl border border-white/15 bg-white/5 p-1 ${props.className ?? ''}`
          : `flex gap-px overflow-hidden rounded-lg border border-white/10 bg-surface p-0.5 ${props.className ?? ''}`
      }
    >
      {props.options.map(opt =>
        opt.locked
          ? (
              <LockedButton
                key={opt.id}
                label={opt.label}
                tooltip={opt.lockedTooltip ?? 'Requires a paid plan'}
              />
            )
          : (
              <button
                key={opt.id}
                type="button"
                disabled={opt.disabled}
                onClick={() => !opt.disabled && props.onChange(opt.id)}
                className={
                  onDark
                    ? `flex-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                      opt.disabled
                        ? 'cursor-not-allowed text-white/25'
                        : props.value === opt.id
                          ? 'cursor-pointer bg-white text-zinc-900 shadow-md'
                          : 'cursor-pointer text-white/75 hover:bg-white/10 hover:text-white'
                    }`
                    : `flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      opt.disabled
                        ? 'cursor-not-allowed text-white/20'
                        : props.value === opt.id
                          ? 'cursor-pointer bg-brand text-white shadow-sm'
                          : 'cursor-pointer text-muted hover:text-foreground'
                    }`
                }
              >
                {opt.label}
              </button>
            ),
      )}
    </div>
  );
};
