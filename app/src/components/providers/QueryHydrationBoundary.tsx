'use client';

import type { DehydratedState } from '@tanstack/react-query';
import { HydrationBoundary } from '@tanstack/react-query';

type Props = {
  state: DehydratedState;
  children: React.ReactNode;
};

/**
 * Applies dehydrated server state to the nearest `QueryClientProvider` (TanStack Query SSR).
 * @param props - Dehydrated state + children
 */
export function QueryHydrationBoundary(props: Props) {
  return (
    <HydrationBoundary state={props.state}>
      {props.children}
    </HydrationBoundary>
  );
}
