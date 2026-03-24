import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { users } from '@/models/Schema';

/**
 * Atomically subtract credits if balance is sufficient.
 * @param userId
 * @param amount
 * @returns new balance, or `null` if user missing or insufficient credits
 */
export async function tryDeductUserCredits(
  userId: string,
  amount: number,
): Promise<{ newBalance: number } | null> {
  if (amount <= 0) {
    const [row] = await db
      .select({ creditBalance: users.creditBalance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return row != null ? { newBalance: row.creditBalance } : null;
  }

  const [row] = await db
    .update(users)
    .set({
      creditBalance: sql`${users.creditBalance} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, userId), sql`${users.creditBalance} >= ${amount}`))
    .returning({ creditBalance: users.creditBalance });

  return row != null ? { newBalance: row.creditBalance } : null;
}
