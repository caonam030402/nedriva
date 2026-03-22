'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { makeQueryClient } from '@/libs/react-query/queryClient';

type Props = {
  children: React.ReactNode;
};

/**
 * One `QueryClient` per browser session — required for all `useQuery` / `useMutation` hooks.
 * @param props - React tree
 */
export function ReactQueryProvider(props: Props) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
