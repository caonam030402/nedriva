'use client';

import { useEffect } from 'react';
import {
  PENDING_REFERRAL_COOKIE,
  PENDING_REFERRAL_COOKIE_MAX_AGE_DAYS,
} from '@/constants/referral';
import { normalizeRefCode } from '@/utils/referralLink';

/**
 * Persist `ref` from the URL in a cookie (30 days) so the server can apply it after sign-up / sign-in.
 * @param props
 * @param props.refCode
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
