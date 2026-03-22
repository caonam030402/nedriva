import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import {
  PENDING_REFERRAL_COOKIE,
  referralCreditsPerPersonForEmail,
} from '@/constants/referral';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import {
  tryAwardReferrerFromStoredSubscriptionCapabilities,
} from '@/libs/persistence/users/tryAwardReferrerSubscriptionBonus';
import { users } from '@/models/Schema';

function normalizeRefCode(raw: string): string | null {
  const t = raw.trim().toLowerCase().replaceAll(/[^a-z0-9]/g, '');
  if (t.length < 4 || t.length > 16) {
    return null;
  }
  return t;
}

/**
 * Read `pending_referral_code` cookie; if valid, attach referrer + grant credits (idempotent).
 * Call after the user row exists in `users` (post Clerk upsert).
 *
 * Does **not** clear the cookie — Next.js only allows cookie mutation in Route Handlers / Server Actions.
 * The client calls `POST /api/referrals/clear-pending-cookie` after this runs (see boost layout).
 * @param inviteeUserId - Clerk user id of the new user (invitee).
 */
export async function tryConsumePendingReferralCookie(inviteeUserId: string): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(PENDING_REFERRAL_COOKIE)?.value;
  const code = raw ? normalizeRefCode(raw) : null;
  if (!code) {
    return;
  }

  const [invitee] = await db.select().from(users).where(eq(users.id, inviteeUserId)).limit(1);
  if (!invitee) {
    return;
  }
  if (invitee.referredByUserId != null || invitee.referralBonusAppliedAt != null) {
    return;
  }

  const [referrer] = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
  if (!referrer || referrer.id === inviteeUserId) {
    return;
  }

  const perPerson = referralCreditsPerPersonForEmail(invitee.email);

  let granted = false;
  await db.transaction(async tx => {
    const [again] = await tx.select().from(users).where(eq(users.id, inviteeUserId)).limit(1);
    if (!again || again.referredByUserId != null || again.referralBonusAppliedAt != null) {
      return;
    }

    await tx
      .update(users)
      .set({
        referredByUserId: referrer.id,
        referralBonusAppliedAt: new Date(),
        updatedAt: new Date(),
        creditBalance: sql`${users.creditBalance} + ${perPerson}`,
      })
      .where(eq(users.id, inviteeUserId));

    await tx
      .update(users)
      .set({
        creditBalance: sql`${users.creditBalance} + ${perPerson}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, referrer.id));

    granted = true;
  });

  if (granted) {
    logger.info('Referral bonus applied', {
      inviteeUserId,
      referrerUserId: referrer.id,
      perPerson,
    });
    await tryAwardReferrerFromStoredSubscriptionCapabilities(inviteeUserId);
  }
}
