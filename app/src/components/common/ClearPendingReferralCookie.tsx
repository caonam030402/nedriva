'use client';

import { useEffect } from 'react';
import { apiRoutes } from '@/constants/apiRoutes';

/**
 * Clears the pending referral cookie via a Route Handler (RSC cannot mutate cookies).
 */
export function ClearPendingReferralCookie(): null {
  useEffect(() => {
    void fetch(apiRoutes.referralsClearPendingCookie, { method: 'POST', credentials: 'include' });
  }, []);
  return null;
}
