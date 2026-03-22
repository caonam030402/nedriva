'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { buildOutputFilename, downloadUrlAsFile } from '@/utils/downloadUrlAsFile';

type Props = {
  outputUrl: string;
  originalFileName: string;
  ariaLabel: string;
  className?: string;
  /** Icon size when `children` is not passed */
  iconSize?: number;
  children?: React.ReactNode;
};

export function EnhancerOutputDownloadButton(props: Props) {
  const {
    outputUrl,
    originalFileName,
    ariaLabel,
    className,
    iconSize = 18,
    children,
  } = props;
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await downloadUrlAsFile(
        outputUrl,
        buildOutputFilename(originalFileName, outputUrl),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={ariaLabel}
      aria-busy={busy}
      className={className}
    >
      {children ?? <Download size={iconSize} />}
    </button>
  );
}
