import { eq, sql } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { users } from '@/models/Schema';

/** Add credits back (e.g. after a failed submit post-deduction). */
export async function refundUserCredits(userId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    return;
  }
  await db
    .update(users)
    .set({
      creditBalance: sql`${users.creditBalance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
