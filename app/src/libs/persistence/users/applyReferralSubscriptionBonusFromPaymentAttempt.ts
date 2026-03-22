import type { BillingPaymentAttemptWebhookEvent } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import { computeReferralSubscriptionBonusUsd } from '@/constants/billingPricing';
import { REFERRAL_SUBSCRIPTION_BONUS_PERCENT } from '@/constants/referral';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import { referralSubscriptionBonuses, users } from '@/models/Schema';

function toUsdCents(amount: unknown): number | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }
  return amount > 0 ? amount : null;
}

/**
 * Award referrer a one-time USD bonus based on the invitee's **actual paid invoice amount**
 * (`paymentAttempt.totals.grand_total`), not the catalog monthly price.
 * Idempotent via `referral_subscription_bonuses.inviteeUserId` PK: if the row already exists
 * (e.g. from a prior subscription sync), this call updates it to the real invoice amount.
 * Flow: paymentAttempt.paid webhook → upsertBillingPaymentAttemptFromWebhook →
 *   applyReferralSubscriptionBonusFromPaymentAttempt → upserts referral_subscription_bonuses row.
 * @param data - Clerk `paymentAttempt.*` webhook `data` object.
 */
export async function applyReferralSubscriptionBonusFromPaymentAttempt(
  data: BillingPaymentAttemptWebhookEvent['data'],
): Promise<void> {
  // Idempotency: skip if already processed
  if (data.status !== 'paid') {
    return;
  }

  const payerUserId = data.payer?.user_id;
  if (!payerUserId) {
    return;
  }

  // The invitee (payer) must have a referrer
  const [invitee] = await db
    .select({ referredByUserId: users.referredByUserId, email: users.email })
    .from(users)
    .where(eq(users.id, payerUserId))
    .limit(1);

  const referrerId = invitee?.referredByUserId;
  if (!referrerId || referrerId === payerUserId) {
    return;
  }

  // Extract actual amount paid (in cents, stored as integer in Clerk totals)
  const grandTotalAmount = toUsdCents(data.totals?.grand_total?.amount);
  if (!grandTotalAmount) {
    logger.debug('Referral bonus skipped: no grand_total amount in paymentAttempt', {
      paymentId: data.payment_id,
      userId: payerUserId,
    });
    return;
  }

  // Convert cents to USD
  const paidUsd = grandTotalAmount / 100;

  const bonusUsd = computeReferralSubscriptionBonusUsd(paidUsd, REFERRAL_SUBSCRIPTION_BONUS_PERCENT);
  if (!(bonusUsd > 0)) {
    return;
  }

  try {
    await db
      .insert(referralSubscriptionBonuses)
      .values({
        inviteeUserId: payerUserId,
        referrerUserId: referrerId,
        creditsAwarded: 0,
        bonusAmountUsd: String(bonusUsd),
        inviteePaidTotalUsd: String(paidUsd),
      })
      .onConflictDoUpdate({
        target: referralSubscriptionBonuses.inviteeUserId,
        set: {
          bonusAmountUsd: String(bonusUsd),
          inviteePaidTotalUsd: String(paidUsd),
        },
      });

    logger.info('Referrer subscription bonus granted/updated (from paymentAttempt grand_total)', {
      inviteeUserId: payerUserId,
      referrerUserId: referrerId,
      bonusUsd,
      paidUsd,
      grandTotalCents: grandTotalAmount,
    });
  } catch (error) {
    logger.warn('applyReferralSubscriptionBonusFromPaymentAttempt failed', {
      error,
      paymentId: data.payment_id,
      userId: payerUserId,
    });
  }
}
