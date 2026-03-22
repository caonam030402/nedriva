/**
 * GET /api/enhancer/runs
 *
 * `limit` + `page` (1-based) — same contract as browser URL (`listPageQuery` helpers).
 * Response also includes `activeItems` (queued + processing) for polling without a second request.
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ENHANCER_RUNS_DEFAULT_LIMIT } from '@/constants/enhancerHistory';
import { parseLimitParam } from '@/libs/pagination/apiPagination';
import { parsePageParam } from '@/libs/pagination/listPageQuery';
import { getEnhancerRunsListResponse } from '@/libs/persistence/enhancer/enhancerRunsList';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = parseLimitParam(req.nextUrl.searchParams.get('limit'), ENHANCER_RUNS_DEFAULT_LIMIT);
  const page = parsePageParam(req.nextUrl.searchParams.get('page'), 1);
  const body = await getEnhancerRunsListResponse(userId, limit, page);
  return NextResponse.json(body);
}
