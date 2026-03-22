/**
 * POST /api/referrals/track-click — increment `affiliates.link_click_count` for the user who owns the matching `referral_code`.
 * Called from sign-up when `?ref=` is present (client, sessionStorage dedupe).
 * If the session is signed in, skip (avoid counting existing users opening referral links).
 */
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { incrementReferralLinkClickForCode } from '@/libs/persistence/users/incrementReferralLinkClick';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (userId) {
    return NextResponse.json({ ok: true, skipped: 'signed_in' as const });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const code = typeof body === 'object' && body !== null && 'code' in body
    ? String((body as { code?: unknown }).code ?? '')
    : '';

  if (!code.trim()) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const ok = await incrementReferralLinkClickForCode(code);
  return NextResponse.json({ ok });
}
