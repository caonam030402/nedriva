'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/constants/reactQueryKeys';
import { fetchUserCreditBalance } from '@/libs/apis/user';

/** Same definition as `useUserCreditBalanceQuery` — use with `queryClient.fetchQuery` where hooks are not allowed. */
export const userCreditBalanceQueryOptions = {
  queryKey: reactQueryKeys.user.credits(),
  queryFn: async (): Promise<number> => {
    const { balance } = await fetchUserCreditBalance();
    return balance;
  },
  staleTime: 5_000,
} as const;

type Options = {
  /** From RSC layout — avoids flash before first fetch */
  initialBalance?: number;
};

/**
 * Shared credit balance for Boost header, enhancer UI, etc.
 * Invalidate with `reactQueryKeys.user.credits()` after server-side deductions (e.g. process submit).
 * @param options - optional `initialBalance` from RSC
 */
export function useUserCreditBalanceQuery(options?: Options) {
  const { userId } = useAuth();

  return useQuery({
    ...userCreditBalanceQueryOptions,
    enabled: Boolean(userId),
    // Only pass initialData when we actually have a value from SSR to seed the cache
    ...(options?.initialBalance !== undefined
      ? { initialData: options.initialBalance }
      : {}),
  });
}
