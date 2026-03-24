/**
 * GET /api/enhancer-image/history
 *
 * Lists **successful** Enhancer jobs (`done`), including **soft-deleted** rows (`deletedAt` set).
 * Body matches `PaginatedListResponse` (cursor or page).
 * Query: `limit` (1–100, default 30), `cursor` (opaque) **or** `page` (1-based; page-number mode).
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { decodeKeysetCursor, parseLimitParam } from '@/libs/pagination/apiPagination';
import { parsePageParam } from '@/libs/pagination/listPageQuery';
import { getEnhancerHistoryListResponse } from '@/libs/persistence/enhancer-image/enhancerHistoryList';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = parseLimitParam(req.nextUrl.searchParams.get('limit'), 30);
  const pageRaw = req.nextUrl.searchParams.get('page');

  if (pageRaw != null && pageRaw !== '') {
    const page = parsePageParam(pageRaw, 1);
    const body = await getEnhancerHistoryListResponse(userId, limit, null, page);
    return NextResponse.json(body);
  }

  const cursorRaw = req.nextUrl.searchParams.get('cursor');
  const cursor = decodeKeysetCursor(cursorRaw);
  if (cursorRaw != null && cursorRaw !== '' && cursor == null) {
    return NextResponse.json(
      { error: 'Invalid cursor', details: [{ field: 'cursor', message: 'Malformed or expired' }] },
      { status: 422 },
    );
  }

  const body = await getEnhancerHistoryListResponse(userId, limit, cursor);
  return NextResponse.json(body);
}
