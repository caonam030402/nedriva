import { eq, sql } from 'drizzle-orm';
import { fallbackMonthlyCreditAllowanceFromRawSlugs } from '@/constants/billingPlanBenefits';
import { REFERRAL_SUBSCRIPTION_BONUS_PERCENT } from '@/constants/referral';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import { referralSubscriptionBonuses, users, userSubscriptionCapabilities } from '@/models/Schema';

/**
 * When the invitee has a paid plan (monthlyCreditAllowance > 0), pay the referrer once:
 * floor(allowance × REFERRAL_SUBSCRIPTION_BONUS_PERCENT / 100), minimum 1 credit.
 */
/**
 * If the invitee already has subscription capabilities (e.g. subscribed before the referral cookie was applied),
 * grant the referrer bonus using the stored monthly allowance.
 * @param inviteeUserId - Clerk user id of the referred user.
 */
export async function tryAwardReferrerFromStoredSubscriptionCapabilities(inviteeUserId: string): Promise<void> {
  const [capRow] = await db
    .select({
      monthlyCreditAllowance: userSubscriptionCapabilities.monthlyCreditAllowance,
      planSlugSnapshot: userSubscriptionCapabilities.planSlugSnapshot,
    })
    .from(userSubscriptionCapabilities)
    .where(eq(userSubscriptionCapabilities.userId, inviteeUserId))
    .limit(1);
  let allowance = capRow?.monthlyCreditAllowance ?? 0;
  if (allowance === 0 && capRow?.planSlugSnapshot != null && capRow.planSlugSnapshot.trim().length > 0) {
    const parts = capRow.planSlugSnapshot
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    allowance = Math.max(allowance, fallbackMonthlyCreditAllowanceFromRawSlugs(parts));
  }
  await tryAwardReferrerSubscriptionBonus(inviteeUserId, allowance);
}

export async function tryAwardReferrerSubscriptionBonus(
  inviteeUserId: string,
  monthlyCreditAllowance: number,
): Promise<void> {
  if (monthlyCreditAllowance <= 0) {
    return;
  }

  const bonus = Math.max(
    1,
    Math.floor((monthlyCreditAllowance * REFERRAL_SUBSCRIPTION_BONUS_PERCENT) / 100),
  );

  const [invitee] = await db.select().from(users).where(eq(users.id, inviteeUserId)).limit(1);
  const referrerId = invitee?.referredByUserId;
  if (!referrerId || referrerId === inviteeUserId) {
    return;
  }

  try {
    await db.transaction(async tx => {
      const inserted = await tx
        .insert(referralSubscriptionBonuses)
        .values({
          inviteeUserId,
          referrerUserId: referrerId,
          creditsAwarded: bonus,
        })
        .onConflictDoNothing({ target: referralSubscriptionBonuses.inviteeUserId })
        .returning({ inviteeUserId: referralSubscriptionBonuses.inviteeUserId });

      if (inserted.length === 0) {
        return;
      }

      await tx
        .update(users)
        .set({
          creditBalance: sql`${users.creditBalance} + ${bonus}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, referrerId));
    });

    logger.info('Referrer subscription bonus granted', {
      inviteeUserId,
      referrerUserId: referrerId,
      bonus,
      monthlyCreditAllowance,
    });
  } catch (error) {
    logger.warn('tryAwardReferrerSubscriptionBonus failed', { error, inviteeUserId });
  }
}
