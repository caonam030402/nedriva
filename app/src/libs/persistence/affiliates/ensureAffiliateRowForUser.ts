import { db } from '@/libs/core/DB';
import { affiliates } from '@/models/Schema';

/** At most one `affiliates` row per user (link metrics, etc.). */
export async function ensureAffiliateRowForUser(userId: string): Promise<void> {
  await db.insert(affiliates).values({ userId }).onConflictDoNothing({ target: affiliates.userId });
}
