'use client';

import { useEffect } from 'react';
import {
  PENDING_REFERRAL_COOKIE,
  PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
} from '@/constants/referral';

function normalizeRefCode(raw: string): string | null {
  const t = raw.trim().toLowerCase().replaceAll(/[^a-z0-9]/g, '');
  if (t.length < 4 || t.length > 16) {
    return null;
  }
  return t;
}

/**
 * Persist `ref` from the URL in a cookie (30 days) so the server can apply it after sign-up / sign-in.
 */
export function PendingReferralCookieSetter(props: { refCode: string | null }) {
  useEffect(() => {
    if (props.refCode == null) {
      return;
    }
    const code = normalizeRefCode(props.refCode);
    if (!code) {
      return;
    }
    const maxAge = 60 * 60 * 24 * PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${PENDING_REFERRAL_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  }, [props.refCode]);

  return null;
}
