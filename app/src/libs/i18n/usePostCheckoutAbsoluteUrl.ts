'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { Env } from '@/libs/core/Env';
import { getPostCheckoutAbsoluteUrl } from '@/libs/i18n/postCheckoutRedirectUrl';

/**
 * Client-safe absolute redirect URL after Clerk Billing checkout (locale-aware).
 */
export function usePostCheckoutAbsoluteUrl(path: string) {
  const locale = useLocale();
  return useMemo(() => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : (Env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? null);
    return getPostCheckoutAbsoluteUrl(path, locale, origin);
  }, [path, locale]);
}
