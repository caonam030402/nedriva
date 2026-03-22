'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

type Props = {
  /** Plain text to copy (full program brief). */
  text: string;
  title: string;
  subtitle: string;
  copyLabel: string;
  copiedLabel: string;
};

export function AffiliateProgramCopyBlock(props: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-black/25 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{props.title}</h3>
          <p className="mt-1 text-sm text-muted">{props.subtitle}</p>
        </div>
        <Button
          variant="secondary"
          className="shrink-0 border border-white/15 bg-white/5 sm:min-w-[140px]"
          onClick={handleCopy}
        >
          {copied ? props.copiedLabel : props.copyLabel}
        </Button>
      </div>
      <pre
        className="mt-4 max-h-[min(24rem,50vh)] overflow-auto rounded-xl border border-white/10 bg-[#06050a] p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground/85 sm:text-xs"
        tabIndex={0}
      >
        {props.text}
      </pre>
    </div>
  );
}
