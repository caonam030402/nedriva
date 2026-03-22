'use client';

import type { ReactNode } from 'react';
import type { EnhancerHistoryItem } from '@/types/enhancer/historyApi';
import { ChevronLeft, Maximize2, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ActionsDropdown } from '@/components/ui/ActionsDropdown';
import { Button } from '@/components/ui/Button';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useEnhancerHistoryQuery } from '@/hooks/react-query/queries/enhance';
import { usePagination } from '@/hooks/usePagination';
import { Link } from '@/libs/i18n/I18nNavigation';
import { buildOutputFilename, downloadUrlAsFile } from '@/utils/downloadUrlAsFile';
import { Routes } from '@/utils/Routes';
import { ENHANCER_MY_IMAGES_PAGE_SIZE } from '../../../../../constants/enhancerImage';
import { EnhanceResultModal } from '../EnhanceResultModal';

function dimsLabel(
  w: number | null,
  h: number | null,
  format: (values: { w: number; h: number }) => string,
): string {
  if (w != null && h != null) {
    return format({ w, h });
  }
  return '—';
}

/** Same shape + glass for ⋮ menu and View — avoids HeroUI icon default (pill / uneven w×h) looking round vs square. */
const HISTORY_CARD_FAB_CLASS =
  '!size-9 !min-h-9 !min-w-9 !max-h-9 !max-w-9 shrink-0 !rounded-xl bg-white/15 text-white backdrop-blur-sm shadow-none outline-none hover:bg-white/25 data-[pressed]:bg-white/30';

function HistoryCard(props: { item: EnhancerHistoryItem; onOpenView: () => void }) {
  const { item, onOpenView } = props;
  const t = useTranslations('Enhancer');
  const url = item.outputUrl ?? item.outputUrls?.[0] ?? null;
  const isSoftDeleted = item.deletedAt != null;

  const onDownload = async () => {
    if (!url) {
      return;
    }
    const name = buildOutputFilename(item.originalFilename, url);
    await downloadUrlAsFile(url, name);
  };

  const before = dimsLabel(item.inputWidth, item.inputHeight, ({ w, h }) =>
    t('history_dimensions_px', { w, h }),
  );
  const after = dimsLabel(item.outputWidth, item.outputHeight, ({ w, h }) =>
    t('history_dimensions_px', { w, h }),
  );

  /** Feedback pill + View — hover only (small screens always on). ⋮ menu stays outside this layer. */
  const hoverExtrasVisible =
    'pointer-events-none opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 max-sm:pointer-events-auto max-sm:opacity-100';

  return (
    <article
      className={`group relative rounded-2xl bg-zinc-900/90 ring-1 ring-white/10${
        isSoftDeleted ? ' opacity-[0.72]' : ''
      }`}
    >
      <div className="relative aspect-square w-full rounded-2xl bg-zinc-950">
        {isSoftDeleted ? (
          <div className="pointer-events-none absolute top-2 left-2 z-20 max-w-[min(100%,11rem)] rounded-md bg-black/60 px-2 py-0.5 text-[9px] leading-tight font-semibold text-white/90 backdrop-blur-[2px]">
            {t('history_soft_deleted')}
          </div>
        ) : null}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {url ? (
            // R2 (or any) public URLs — avoid next/image remote config; lazy thumb only
            // eslint-disable-next-line next/no-img-element -- cross-origin thumbnails
            <img
              src={url}
              alt=""
              className="size-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[11px] text-subtle">
              {item.originalFilename}
            </div>
          )}
        </div>

        {/* Always: ⋮ menu (no hover required). */}
        {url ? (
          <div className="absolute top-2 right-2 z-30">
            <ActionsDropdown
              ariaLabel={t('history_card_menu_aria')}
              icon={<MoreVertical size={17} strokeWidth={2} />}
              triggerClassName={HISTORY_CARD_FAB_CLASS}
              onMenuAction={(id) => {
                if (id === 'view') {
                  onOpenView();
                }
                if (id === 'download') {
                  void onDownload();
                }
              }}
              items={[
                {
                  id: 'view',
                  textValue: t('history_view'),
                  children: t('history_view'),
                },
                {
                  id: 'open-tab',
                  textValue: t('history_open_new_tab'),
                  href: url,
                  children: t('history_open_new_tab'),
                },
                {
                  id: 'download',
                  textValue: t('history_download'),
                  children: t('history_download'),
                },
              ]}
            />
          </div>
        ) : null}

        {/* Always: Before / After / model — readable strip on the image. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-b-2xl bg-linear-to-t from-black/88 via-black/50 to-transparent px-2.5 pt-12 pb-2.5">
          <p className="text-[10px] leading-tight text-white/90 drop-shadow-sm">
            <span className="text-white/65">{t('history_before_label')}</span> {before}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-white/90 drop-shadow-sm">
            <span className="text-white/65">{t('history_after_label')}</span> {after}
          </p>
          <p className="mt-1 line-clamp-2 text-[10px] font-semibold text-white drop-shadow-sm">
            {item.processingLabel}
          </p>
        </div>

        {/* Hover only: question + View. Small screens: always show. */}
        <div className={`absolute inset-0 z-20 rounded-2xl bg-black/40 ${hoverExtrasVisible}`}>
          <p className="absolute top-2.5 left-1/2 max-w-[min(88%,calc(100%-5.5rem))] -translate-x-1/2 rounded-md bg-black/45 px-2.5 py-1 text-center text-[10px] leading-snug font-medium text-white/95 backdrop-blur-[2px]">
            {t('history_result_feedback_prompt')}
          </p>
          {url ? (
            <Button
              isIconOnly
              ariaLabel={t('history_view')}
              onClick={onOpenView}
              variant="ghost"
              size="sm"
              className={`absolute right-2 bottom-2 ${HISTORY_CARD_FAB_CLASS}`}
            >
              <Maximize2 size={18} strokeWidth={2} />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export type EnhancerHistoryMyImagesProps = {
  /** Cards per page; default from `ENHANCER_MY_IMAGES_PAGE_SIZE`. */
  pageSize?: number;
  /**
   * When true (e.g. `/boost/history`), render top bar with back link + title and scrollable body.
   * When false, only the grid + pagination (legacy embed).
   */
  showPageChrome?: boolean;
};

/**
 * “My images” grid — `GET /api/enhancer/history` with `page` + `usePagination`.
 * @param props
 */
export function EnhancerHistoryMyImagesView(props: EnhancerHistoryMyImagesProps = {}) {
  const t = useTranslations('Enhancer');
  const pageSize = props.pageSize ?? ENHANCER_MY_IMAGES_PAGE_SIZE;
  const showPageChrome = props.showPageChrome ?? false;
  /**
   * `usePagination` only handles page index + ranges — it does not fetch.
   * It still needs **global** `totalItems` from the API (`pagination.total`) to know how many
   * pages exist. Per-request `limit` is page size (12 here);
   * API `MAX_LIST_LIMIT` (100) is only the max rows allowed in **one** HTTP request.
   */
  const [totalItems, setTotalItems] = useState(0);

  const pagination = usePagination({ pageSize, totalItems });

  const { data, isPending, isError, refetch, isFetching } = useEnhancerHistoryQuery({
    limit: pageSize,
    page: pagination.page,
  });

  useEffect(() => {
    if (data?.pagination.page != null) {
      setTotalItems(data.pagination.total ?? 0);
    }
  }, [data]);

  const [modalItem, setModalItem] = useState<EnhancerHistoryItem | null>(null);

  const items = data?.items ?? [];

  const modal = (
    <EnhanceResultModal
      payload={modalItem ? { kind: 'history', item: modalItem } : null}
      onClose={() => setModalItem(null)}
    />
  );

  let main: ReactNode;

  if (isPending) {
    main = (
      <div className="flex min-h-32 items-center justify-center">
        <p className="text-[11px] text-subtle">{t('history_loading')}</p>
      </div>
    );
  } else if (isError) {
    main = (
      <div className="flex min-h-32 flex-col items-center justify-center gap-2">
        <p className="text-center text-[11px] text-red-400">{t('history_error')}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-[10px] font-semibold tracking-wide text-foreground uppercase underline-offset-2 hover:underline"
        >
          {t('history_retry')}
        </button>
      </div>
    );
  } else if (items.length === 0 && totalItems === 0) {
    main = (
      <div className="flex min-h-32 items-center justify-center">
        <p className="text-[11px] text-subtle">{t('no_images_yet')}</p>
      </div>
    );
  } else {
    main = (
      <div className="relative">
        {isFetching && !isPending ? (
          <span className="absolute -top-1 right-0 z-10 text-[9px] text-subtle">
            {t('history_refreshing')}
          </span>
        ) : null}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <HistoryCard item={item} onOpenView={() => setModalItem(item)} />
            </li>
          ))}
        </ul>
        <PaginationBar
          className="mt-3"
          page={pagination.page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={pagination.setPage}
          summary={t('pagination_summary', {
            start: pagination.rangeStart,
            end: pagination.rangeEnd,
            total: totalItems,
          })}
          previousLabel={t('pagination_previous')}
          nextLabel={t('pagination_next')}
        />
      </div>
    );
  }

  if (!showPageChrome) {
    return (
      <>
        {modal}
        {main}
      </>
    );
  }

  return (
    <>
      {modal}
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/8 px-4 py-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <Link
              href={Routes.dashboard.enhance}
              className="flex shrink-0 items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              <ChevronLeft size={14} strokeWidth={2} />
              {t('history_back_to_enhancer')}
            </Link>
            <span className="text-[10px] font-bold tracking-widest text-subtle uppercase">
              {t('my_images')}
            </span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{main}</div>
      </div>
    </>
  );
}
