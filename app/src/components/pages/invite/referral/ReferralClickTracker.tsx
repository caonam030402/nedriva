'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { apiRoutes } from '@/constants/apiRoutes';

const storageKeyForCode = (code: string) => `referral_link_click_sent:${code}`;

type Props = {
  refCode: string | null | undefined;
};

/**
 * Fire once per tab (sessionStorage) when `?ref=` is present to count a click for the referrer.
 * Skip when signed in — account holders opening the link are not new prospects.
 * @param props
 */
export function ReferralClickTracker(props: Props) {
  const { refCode } = props;
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined' || !refCode?.trim()) {
      return;
    }
    if (!isLoaded) {
      return;
    }
    if (isSignedIn) {
      return;
    }

    const code = refCode.trim();
    const key = storageKeyForCode(code);
    if (sessionStorage.getItem(key) === '1') {
      return;
    }

    void (async () => {
      try {
        const res = await fetch(apiRoutes.referrals.trackClick, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (res.ok) {
          const data = (await res.json().catch(() => null)) as { skipped?: string } | null;
          if (data?.skipped === 'signed_in') {
            return;
          }
          sessionStorage.setItem(key, '1');
        }
      } catch {
        /* ignore */
      }
    })();
  }, [refCode, isLoaded, isSignedIn]);

  return null;
}
