import type { BillingSubscriptionWebhookEvent } from '@clerk/backend';
import { db } from '@/libs/core/DB';
import { Env } from '@/libs/core/Env';
import { logger } from '@/libs/core/Logger';
import { billingPayerUserIdOrNull } from '@/libs/persistence/billing/billingPayerUserIdOrNull';
import { clerkUnixToDate } from '@/libs/persistence/billing/clerkBillingDates';
import { syncBillingPlansFromClerk } from '@/libs/persistence/billing/syncBillingPlansFromClerk';
import { syncUserEntitlementsFromSubscription } from '@/libs/persistence/billing/syncUserEntitlementsFromSubscription';
import { syncBillingSubscriptionItemsFromSubscriptionWebhook } from '@/libs/persistence/billing/upsertBillingSubscriptionItemFromWebhook';
import { subscriptions } from '@/models/Schema';

type SubscriptionData = BillingSubscriptionWebhookEvent['data'];

/**
 * Upsert a row from `subscription.created` | `subscription.updated` | `subscription.active` | `subscription.pastDue`.
 * @param data - Clerk `subscription.*` webhook `data` object.
 * @param eventType - Clerk webhook `type` string (e.g. `subscription.active`).
 */
export async function upsertBillingSubscriptionFromWebhook(
  data: SubscriptionData,
  eventType: string,
): Promise<void> {
  const rawPayerUserId = data.payer?.user_id ?? null;
  const payerUserId = await billingPayerUserIdOrNull(rawPayerUserId);
  const rawOrgId = data.payer?.organization_id;
  const payerOrganizationId =
    rawOrgId != null && rawOrgId !== '' ? rawOrgId : null;
  const items = Array.isArray(data.items) ? data.items : [];

  await db
    .insert(subscriptions)
    .values({
      id: data.id,
      status: data.status,
      payerId: data.payer_id,
      payerUserId: payerUserId ?? null,
      payerOrganizationId,
      latestPaymentId: data.latest_payment_id ?? null,
      paymentSourceId: data.payment_source_id ?? null,
      items,
      payload: data as unknown as Record<string, unknown>,
      lastEventType: eventType,
      clerkCreatedAt: clerkUnixToDate(data.created_at),
      clerkUpdatedAt: clerkUnixToDate(data.updated_at),
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: data.status,
        payerId: data.payer_id,
        payerUserId: payerUserId ?? null,
        payerOrganizationId,
        latestPaymentId: data.latest_payment_id ?? null,
        paymentSourceId: data.payment_source_id ?? null,
        items,
        payload: data as unknown as Record<string, unknown>,
        lastEventType: eventType,
        clerkCreatedAt: clerkUnixToDate(data.created_at),
        clerkUpdatedAt: clerkUnixToDate(data.updated_at),
        updatedAt: new Date(),
      },
    });

  await syncBillingSubscriptionItemsFromSubscriptionWebhook(data, eventType);

  if (!Env.BILLING_DISABLE_CLERK_PLAN_SYNC_ON_SUBSCRIPTION_WEBHOOK) {
    try {
      await syncBillingPlansFromClerk(db);
    } catch (error) {
      logger.warn('Clerk plan catalog sync failed; using existing plans rows', {
        error,
        subscriptionId: data.id,
      });
    }
  }

  await syncUserEntitlementsFromSubscription(data);
}
