import type { QueryClientConfig } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        if (failureCount >= 2) {
          return false;
        }
        if (error !== null && typeof error === 'object' && 'status' in error) {
          const status = (error as { status?: number }).status;
          if (typeof status === 'number' && status >= 400 && status < 500) {
            return false;
          }
        }
        return true;
      },
    },
    mutations: {
      retry: false,
    },
  },
};

/** Browser / long-lived client — one instance per tab via `ReactQueryProvider`. */
export function makeQueryClient(): QueryClient {
  return new QueryClient(defaultQueryClientConfig);
}

/**
 * Request-scoped QueryClient for Server Components (prefetch + dehydrate).
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
export const getQueryClient = cache(() => new QueryClient(defaultQueryClientConfig));
