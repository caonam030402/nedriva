import type { BillingPaymentAttemptWebhookEvent } from '@clerk/backend';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import {
  planPayerTypeFromClerkBillingPayer,
  resolveBillingSlugsFromLineItems,
  totalCreditsForPaymentLineItemsDbWithPayerFallback,
} from '@/libs/persistence/billing/planCatalog';
import { paymentAttempts, users } from '@/models/Schema';

type PaymentData = BillingPaymentAttemptWebhookEvent['data'];

/**
 * On `paymentAttempt.*` with `status: paid`, add credits once per `(instance_id, payment_id)`.
 * Features come from `syncUserEntitlementsFromSubscription` (subscription active), not here — avoids double work.
 * @param data - Clerk `paymentAttempt.*` webhook `data` object.
 */
export async function applyPaidPaymentAttemptCreditsIfNeeded(data: PaymentData): Promise<void> {
  if (data.status !== 'paid') {
    return;
  }

  const payerType = planPayerTypeFromClerkBillingPayer(data.payer);

  await db.transaction(async tx => {
    const slugs = await resolveBillingSlugsFromLineItems(tx, data.subscription_items ?? []);
    const credits = await totalCreditsForPaymentLineItemsDbWithPayerFallback(tx, slugs, payerType);
    const [claimed] = await tx
      .update(paymentAttempts)
      .set({ benefitsAppliedAt: new Date() })
      .where(
        and(
          eq(paymentAttempts.instanceId, data.instance_id),
          eq(paymentAttempts.paymentId, data.payment_id),
          eq(paymentAttempts.status, 'paid'),
          isNull(paymentAttempts.benefitsAppliedAt),
        ),
      )
      .returning({ id: paymentAttempts.id });

    if (!claimed) {
      return;
    }

    const userId = data.payer?.user_id;
    if (!userId) {
      logger.warn('Clerk payment paid without payer.user_id — cannot grant credits', {
        paymentId: data.payment_id,
      });
      await tx
        .update(paymentAttempts)
        .set({ benefitsAppliedAt: null })
        .where(eq(paymentAttempts.id, claimed.id));
      return;
    }

    const [userRow] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRow) {
      logger.warn('Clerk payment paid for unknown users row — skip credits (will retry after user sync)', {
        userId,
        paymentId: data.payment_id,
      });
      await tx
        .update(paymentAttempts)
        .set({ benefitsAppliedAt: null })
        .where(eq(paymentAttempts.id, claimed.id));
      return;
    }

    if (credits > 0) {
      await tx
        .update(users)
        .set({ creditBalance: sql`${users.creditBalance} + ${credits}` })
        .where(eq(users.id, userId));
    } else if (slugs.length > 0) {
      logger.warn('Paid payment: no credits for slugs — check plans seed (clerk_slug + payer_type)', {
        slugs,
        payerType,
        paymentId: data.payment_id,
      });
    }
  });
}
