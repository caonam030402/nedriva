import type { UserCreditsResponse } from '@/types/billing/creditsApi';
import { apiRoutes } from '@/constants/apiRoutes';
import { apiFetch } from '@/libs/apis/httpClient';

/** `GET /api/credits` — Clerk session required. */
export async function fetchUserCreditBalance(): Promise<UserCreditsResponse> {
  return apiFetch<UserCreditsResponse>(apiRoutes.credits);
}
