import type { BillingPaymentAttemptWebhookEvent } from '@clerk/backend';
import { db } from '@/libs/core/DB';
import { applyPaidPaymentAttemptCreditsIfNeeded } from '@/libs/persistence/billing/applyPaidPaymentAttemptCreditsIfNeeded';
import { clerkUnixToDate } from '@/libs/persistence/billing/clerkBillingDates';
import { paymentAttempts } from '@/models/Schema';

type PaymentData = BillingPaymentAttemptWebhookEvent['data'];

/**
 * Upsert from `paymentAttempt.created` | `paymentAttempt.updated`.
 * Conflict on `(instance_id, payment_id)` so `updated` refreshes the same row (status, paid_at, …), not a second insert by `id`.
 * @param data - Clerk `paymentAttempt.*` webhook `data` object.
 * @param eventType - Clerk webhook `type` string.
 */
export async function upsertBillingPaymentAttemptFromWebhook(
  data: PaymentData,
  eventType: string,
): Promise<void> {
  await db
    .insert(paymentAttempts)
    .values({
      id: data.id,
      instanceId: data.instance_id,
      paymentId: data.payment_id,
      statementId: data.statement_id ?? null,
      gatewayExternalId: data.gateway_external_id ?? null,
      status: data.status,
      chargeType: data.charge_type,
      payer: data.payer as unknown as Record<string, unknown>,
      payee: data.payee as unknown as Record<string, unknown>,
      totals: data.totals as unknown as Record<string, unknown>,
      paymentSource: data.payment_source as unknown as Record<string, unknown>,
      subscriptionItems: data.subscription_items ?? null,
      payload: data as unknown as Record<string, unknown>,
      lastEventType: eventType,
      clerkCreatedAt: clerkUnixToDate(data.created_at),
      clerkUpdatedAt: clerkUnixToDate(data.updated_at),
      paidAt: clerkUnixToDate(data.paid_at),
      failedAt: clerkUnixToDate(data.failed_at),
      benefitsAppliedAt: null,
    })
    .onConflictDoUpdate({
      target: [paymentAttempts.instanceId, paymentAttempts.paymentId],
      set: {
        id: data.id,
        instanceId: data.instance_id,
        paymentId: data.payment_id,
        statementId: data.statement_id ?? null,
        gatewayExternalId: data.gateway_external_id ?? null,
        status: data.status,
        chargeType: data.charge_type,
        payer: data.payer as unknown as Record<string, unknown>,
        payee: data.payee as unknown as Record<string, unknown>,
        totals: data.totals as unknown as Record<string, unknown>,
        paymentSource: data.payment_source as unknown as Record<string, unknown>,
        subscriptionItems: data.subscription_items ?? null,
        payload: data as unknown as Record<string, unknown>,
        lastEventType: eventType,
        clerkCreatedAt: clerkUnixToDate(data.created_at),
        clerkUpdatedAt: clerkUnixToDate(data.updated_at),
        paidAt: clerkUnixToDate(data.paid_at),
        failedAt: clerkUnixToDate(data.failed_at),
        updatedAt: new Date(),
      },
    });

  await applyPaidPaymentAttemptCreditsIfNeeded(data);
}
