import { desc, eq } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { subscriptions } from '@/models/Schema';

/**
 * Resolves parent subscription when `subscriptionItem.*` payloads omit `subscription_id`.
 * Uses the most recently updated row for this Clerk `payer_id` (one active sub per payer is typical).
 * @param payerId
 */
export async function findLatestBillingSubscriptionIdByPayerId(
  payerId: string | null | undefined,
): Promise<string | null> {
  if (!payerId) {
    return null;
  }
  const rows = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.payerId, payerId))
    .orderBy(desc(subscriptions.clerkUpdatedAt), desc(subscriptions.updatedAt))
    .limit(1);
  return rows[0]?.id ?? null;
}
