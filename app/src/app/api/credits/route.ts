/**
 * GET /api/credits — current user's `users.credit_balance`.
 */
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserCreditBalance } from '@/libs/persistence/users/getUserCreditBalance';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureAppUserFromCurrentClerkUser();
  const balance = await getUserCreditBalance(userId);

  return NextResponse.json({ balance });
}
