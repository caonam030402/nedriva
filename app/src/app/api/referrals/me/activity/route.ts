/**
 * GET /api/referrals/me/activity — sign-up credit grants + subscription bonus rows for the current referrer.
 */
import { auth } from '@clerk/nextjs/server';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { computeReferralSubscriptionBonusUsd } from '@/constants/billing/billingPricing';
import {
  REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
  referralCreditsPerPersonForEmail,
} from '@/constants/referral';
import { db } from '@/libs/core/DB';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { referralSubscriptionBonuses, users } from '@/models/Schema';

function toUsdNumber(v: unknown): number | null {
  if (v == null) {
    return null;
  }
  const n = typeof v === 'string' ? Number.parseFloat(v) : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureAppUserFromCurrentClerkUser();

  const inviteeRows = await db
    .select({
      id: users.id,
      email: users.email,
      referralBonusAppliedAt: users.referralBonusAppliedAt,
    })
    .from(users)
    .where(and(eq(users.referredByUserId, userId), isNotNull(users.referralBonusAppliedAt)))
    .orderBy(desc(users.referralBonusAppliedAt));

  const creditGrants = inviteeRows.map((row) => ({
    id: row.id,
    email: row.email ?? '',
    grantedAt: row.referralBonusAppliedAt!.toISOString(),
    /** Credits you earned when they signed up (same tier logic as invitee). */
    creditsYouEarned: referralCreditsPerPersonForEmail(row.email),
  }));

  const bonusRows = await db
    .select({
      inviteeUserId: referralSubscriptionBonuses.inviteeUserId,
      bonusAmountUsd: referralSubscriptionBonuses.bonusAmountUsd,
      inviteePaidTotalUsd: referralSubscriptionBonuses.inviteePaidTotalUsd,
      createdAt: referralSubscriptionBonuses.createdAt,
      email: users.email,
    })
    .from(referralSubscriptionBonuses)
    .innerJoin(users, eq(users.id, referralSubscriptionBonuses.inviteeUserId))
    .where(eq(referralSubscriptionBonuses.referrerUserId, userId))
    .orderBy(desc(referralSubscriptionBonuses.createdAt));

  const paidBonuses = bonusRows.map((row) => {
    const basisUsd = toUsdNumber(row.inviteePaidTotalUsd);
    let bonusUsd = 0;
    if (basisUsd != null) {
      bonusUsd = computeReferralSubscriptionBonusUsd(basisUsd, REFERRAL_SUBSCRIPTION_BONUS_PERCENT);
    } else {
      const storedBonusUsd = toUsdNumber(row.bonusAmountUsd);
      if (storedBonusUsd != null && storedBonusUsd > 0) {
        bonusUsd = storedBonusUsd;
      }
    }

    return {
      id: row.inviteeUserId,
      email: row.email ?? '',
      awardedAt: row.createdAt.toISOString(),
      bonusAmountUsd: bonusUsd,
      inviteePaidTotalUsd: basisUsd,
    };
  });

  return NextResponse.json({ creditGrants, paidBonuses });
}
