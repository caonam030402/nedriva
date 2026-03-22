'use client';

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export type UseInfiniteScrollTriggerParams = {
  /** When `false`, the observer is not attached. */
  enabled?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  /**
   * Scroll container (`overflow-y-auto`). When `null` (not mounted yet), no observer;
   * the effect re-runs once the node exists — avoids using the wrong root (viewport).
   */
  scrollRoot: HTMLElement | null;
  rootMargin?: string;
};

/**
 * Sentinel at the list bottom; when it intersects `scrollRoot`, calls `fetchNextPage`.
 */
export function useInfiniteScrollTrigger(
  params: UseInfiniteScrollTriggerParams,
): { sentinelRef: RefObject<HTMLDivElement | null> } {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    enabled = true,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    scrollRoot,
    rootMargin = '160px',
  } = params;

  useEffect(() => {
    if (!enabled || scrollRoot == null) {
      return;
    }
    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        if (hit && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: scrollRoot, rootMargin, threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [enabled, scrollRoot, hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin]);

  return { sentinelRef };
}
