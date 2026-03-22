'use client';

import { Tooltip } from '@heroui/react/tooltip';
import { Info } from 'lucide-react';

type Props = {
  text: string;
  size?: number;
  previewUrl?: string;
};

export const InfoTooltip = (props: Props) => (
  <Tooltip.Root delay={0} closeDelay={0}>
    <Tooltip.Trigger>
      <button
        type="button"
        aria-label="More info"
        className="flex cursor-default items-center text-white/30 transition-colors hover:text-white/60"
      >
        <Info size={props.size ?? 13} />
      </button>
    </Tooltip.Trigger>
    <Tooltip.Content
      showArrow
      className="overflow-hidden rounded-xl bg-white shadow-xl"
      style={{ maxWidth: '240px', padding: 0 }}
    >
      {props.previewUrl && (
        <div className="relative h-36 w-full overflow-hidden">
          <img
            src={props.previewUrl}
            alt="Preview"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 flex items-end">
            <div className="flex w-full justify-between px-2 pb-1.5">
              <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">Before</span>
              <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">After</span>
            </div>
          </div>
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/70" />
        </div>
      )}
      <p className="px-3 py-2.5 text-xs leading-relaxed text-gray-800">
        {props.text}
      </p>
    </Tooltip.Content>
  </Tooltip.Root>
);
