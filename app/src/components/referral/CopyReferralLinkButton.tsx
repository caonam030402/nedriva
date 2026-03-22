'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

type Props = {
  link: string;
  /** Extra Tailwind classes for the CTA (e.g. invite page styling). */
  className?: string;
};

export function CopyReferralLinkButton(props: Props) {
  const t = useTranslations('InvitePage');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.link);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button variant="primary" fullWidth className={props.className} onClick={handleCopy}>
      {copied ? t('copied') : t('copy_share')}
    </Button>
  );
}
