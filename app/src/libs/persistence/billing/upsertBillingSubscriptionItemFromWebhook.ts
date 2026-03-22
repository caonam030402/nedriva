import type {
  BillingSubscriptionItemWebhookEvent,
  BillingSubscriptionWebhookEvent,
} from '@clerk/backend';
import { and, eq, notInArray } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { clerkUnixToDate } from '@/libs/persistence/billing/clerkBillingDates';
import { findLatestBillingSubscriptionIdByPayerId } from '@/libs/persistence/billing/findLatestBillingSubscriptionIdByPayerId';
import { subscriptionItems } from '@/models/Schema';

type SubscriptionData = BillingSubscriptionWebhookEvent['data'];
type ItemData = BillingSubscriptionItemWebhookEvent['data'];

/**
 * Commerce subscription snapshots use `interval`; typed webhooks use `plan_period`.
 * @param data - Line item from a subscription or `subscriptionItem.*` payload.
 */
function planPeriodFromItem(data: ItemData): string | null {
  const ext = data as ItemData & { interval?: string | null };
  return ext.plan_period ?? ext.interval ?? null;
}

function itemPayerId(data: ItemData, payerIdFallback?: string | null): string | null {
  return data.payer?.id ?? payerIdFallback ?? null;
}

function creditSnapshot(data: ItemData): Record<string, unknown> | null {
  return data.credit != null ? (data.credit as unknown as Record<string, unknown>) : null;
}

async function upsertBillingSubscriptionItemRow(
  data: ItemData,
  eventType: string,
  opts: { subscriptionId: string | null; payerIdFallback?: string | null },
): Promise<void> {
  const payerId = itemPayerId(data, opts.payerIdFallback);
  const credit = creditSnapshot(data);

  await db
    .insert(subscriptionItems)
    .values({
      id: data.id,
      subscriptionId: opts.subscriptionId,
      payerId,
      status: data.status,
      planId: data.plan_id ?? data.plan?.id ?? null,
      planSlug: data.plan?.slug ?? null,
      planPeriod: planPeriodFromItem(data),
      credit,
      payload: data as unknown as Record<string, unknown>,
      lastEventType: eventType,
      clerkPeriodStart: clerkUnixToDate(data.period_start),
      clerkPeriodEnd: clerkUnixToDate(data.period_end),
    })
    .onConflictDoUpdate({
      target: subscriptionItems.id,
      set: {
        subscriptionId: opts.subscriptionId,
        payerId,
        status: data.status,
        planId: data.plan_id ?? data.plan?.id ?? null,
        planSlug: data.plan?.slug ?? null,
        planPeriod: planPeriodFromItem(data),
        credit,
        payload: data as unknown as Record<string, unknown>,
        lastEventType: eventType,
        clerkPeriodStart: clerkUnixToDate(data.period_start),
        clerkPeriodEnd: clerkUnixToDate(data.period_end),
        updatedAt: new Date(),
      },
    });
}

/**
 * `subscriptionItem.*` — link to parent via `payer.id` → latest `subscriptions` row.
 * @param data - Clerk `subscriptionItem.*` webhook `data` object.
 * @param eventType - Clerk webhook `type` string.
 */
export async function upsertBillingSubscriptionItemFromWebhook(
  data: ItemData,
  eventType: string,
): Promise<void> {
  const payerId = itemPayerId(data, null);
  const subscriptionId = await findLatestBillingSubscriptionIdByPayerId(payerId);

  await upsertBillingSubscriptionItemRow(data, eventType, {
    subscriptionId,
    payerIdFallback: payerId,
  });
}

/**
 * After `subscription.*`, mirror `data.items` into rows and drop lines removed from the snapshot.
 * @param data - Clerk `subscription.*` webhook `data` object.
 * @param eventType - Clerk webhook `type` string.
 */
export async function syncBillingSubscriptionItemsFromSubscriptionWebhook(
  data: SubscriptionData,
  eventType: string,
): Promise<void> {
  const items = Array.isArray(data.items) ? data.items : [];
  const payerFallback = data.payer_id;

  for (const item of items) {
    await upsertBillingSubscriptionItemRow(item as ItemData, eventType, {
      subscriptionId: data.id,
      payerIdFallback: payerFallback,
    });
  }

  const ids = items.map(i => i.id).filter((id): id is string => Boolean(id));
  if (ids.length > 0) {
    await db
      .delete(subscriptionItems)
      .where(
        and(
          eq(subscriptionItems.subscriptionId, data.id),
          notInArray(subscriptionItems.id, ids),
        ),
      );
  }
}
