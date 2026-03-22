/**
 * POST /api/billing/sync-plans-from-clerk
 *
 * Pull Clerk Billing plans (`billing.getPlanList`) into `plans` + `plan_features`.
 *
 * Headers: `Authorization: Bearer <BILLING_PLAN_SYNC_SECRET>`
 */
import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Env } from '@/libs/core/Env';
import { logger } from '@/libs/core/Logger';
import { syncBillingPlansFromClerk } from '@/libs/persistence/billing/syncBillingPlansFromClerk';

function bearerToken(authHeader: string | null): string | null {
  if (authHeader == null || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const t = authHeader.slice(7).trim();
  return t.length > 0 ? t : null;
}

function timingSafeStringEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  const secret = Env.BILLING_PLAN_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'BILLING_PLAN_SYNC_SECRET is not configured' },
      { status: 503 },
    );
  }

  const token = bearerToken(req.headers.get('authorization'));
  if (token == null || !timingSafeStringEq(token, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncBillingPlansFromClerk();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logger.error('POST /api/billing/sync-plans-from-clerk failed', { error });
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
