import { eq } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { users } from '@/models/Schema';

/**
 * Read `credit_balance` from `users` for a Clerk `userId`.
 * @returns `0` if no row exists.
 */
export async function getUserCreditBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ creditBalance: users.creditBalance })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.creditBalance ?? 0;
}
