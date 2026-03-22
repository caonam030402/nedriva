import { eq, sql } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { affiliates, users } from '@/models/Schema';

function normalizeRefCode(raw: string): string | null {
  const t = raw.trim().toLowerCase().replaceAll(/[^a-z0-9]/g, '');
  if (t.length < 4 || t.length > 16) {
    return null;
  }
  return t;
}

/** +1 `affiliates` click for the user who owns `referral_code` (sign-up with `?ref=`). */
export async function incrementReferralLinkClickForCode(rawCode: string): Promise<boolean> {
  const code = normalizeRefCode(rawCode);
  if (!code) {
    return false;
  }

  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, code)).limit(1);
  if (!u) {
    return false;
  }

  await db
    .insert(affiliates)
    .values({ userId: u.id, linkClickCount: 1 })
    .onConflictDoUpdate({
      target: affiliates.userId,
      set: {
        linkClickCount: sql`${affiliates.linkClickCount} + 1`,
        updatedAt: new Date(),
      },
    });

  return true;
}
