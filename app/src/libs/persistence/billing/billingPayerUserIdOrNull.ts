import { eq } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { users } from '@/models/Schema';

/**
 * `subscriptions.payer_user_id` FK → `users.id`. Webhook order is not guaranteed:
 * `subscription.*` may arrive before `user.created` / first upsert.
 * Store Clerk `user_id` only when a row exists; a later `subscription.*` will fill it in.
 * @param clerkUserId - Clerk `user_...` from `payer.user_id`, if any.
 */
export async function billingPayerUserIdOrNull(
  clerkUserId: string | null | undefined,
): Promise<string | null> {
  if (clerkUserId == null || clerkUserId === '') {
    return null;
  }
  const row = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, clerkUserId))
    .limit(1);
  return row[0]?.id ?? null;
}
