import { eq, sql } from 'drizzle-orm';
import { REFERRAL_SUBSCRIPTION_BONUS_PERCENT } from '@/constants/referral';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import { referralSubscriptionBonuses, users } from '@/models/Schema';

/**
 * When the invitee has a paid plan (monthlyCreditAllowance > 0), pay the referrer once:
 * floor(allowance × REFERRAL_SUBSCRIPTION_BONUS_PERCENT / 100), minimum 1 credit.
 */
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
