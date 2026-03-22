'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pagination as HeroPagination } from '@heroui/react/pagination';
import { buildVisiblePageItems } from '@/utils/paginationVisiblePages';

export type PaginationBarProps = {
  /** Current page (1-based). */
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  summary: ReactNode;
  previousLabel: string;
  nextLabel: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Controlled pagination built from HeroUI `Pagination` primitives (summary + page links + prev/next).
 */
export function PaginationBar(props: PaginationBarProps) {
  const {
    page,
    totalItems,
    pageSize,
    onPageChange,
    summary,
    previousLabel,
    nextLabel,
    className,
    size = 'sm',
  } = props;

  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));

  const visible = useMemo(
    () => buildVisiblePageItems(page, totalPages),
    [page, totalPages],
  );

  if (totalItems <= 0 || totalPages <= 1) {
    return null;
  }

  return (
    <HeroPagination
      size={size}
      className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${className ?? ''}`}
    >
      <HeroPagination.Summary className="text-[11px] text-subtle">{summary}</HeroPagination.Summary>
      <HeroPagination.Content className="flex flex-wrap items-center gap-1">
        <HeroPagination.Item>
          <HeroPagination.Previous
            isDisabled={page <= 1}
            onPress={() => onPageChange(page - 1)}
          >
            <HeroPagination.PreviousIcon />
            <span>{previousLabel}</span>
          </HeroPagination.Previous>
        </HeroPagination.Item>

        {visible.map((item, idx) =>
          item === 'ellipsis'
            ? (
                <HeroPagination.Item key={`ellipsis-${idx}`}>
                  <HeroPagination.Ellipsis />
                </HeroPagination.Item>
              )
            : (
                <HeroPagination.Item key={item}>
                  <HeroPagination.Link
                    isActive={item === page}
                    onPress={() => onPageChange(item)}
                  >
                    {item}
                  </HeroPagination.Link>
                </HeroPagination.Item>
              ),
        )}

        <HeroPagination.Item>
          <HeroPagination.Next
            isDisabled={page >= totalPages}
            onPress={() => onPageChange(page + 1)}
          >
            <span>{nextLabel}</span>
            <HeroPagination.NextIcon />
          </HeroPagination.Next>
        </HeroPagination.Item>
      </HeroPagination.Content>
    </HeroPagination>
  );
}
