import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PENDING_REFERRAL_COOKIE } from '@/constants/referral';

/**
 * Clears `pending_referral_code` after the server has applied the referral in an RSC-safe path.
 * Cookie mutation is only allowed in Route Handlers / Server Actions, not in Server Components.
 */
export async function POST(): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const jar = await cookies();
  jar.delete(PENDING_REFERRAL_COOKIE);
  return NextResponse.json({ ok: true });
}
