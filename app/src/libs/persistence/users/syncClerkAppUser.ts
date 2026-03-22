/**
 * Upsert `users` row from Clerk — used by webhooks and lazy sync on API calls.
 */
import type { UserJSON } from '@clerk/backend';
import type { User } from '@clerk/nextjs/server';
import type { NewUserRow } from '@/models/Schema';

/** Fields synced from Clerk; `referralCode` is generated on first insert only. */
type ClerkUserUpsertBase = Omit<NewUserRow, 'referralCode'>;
import { DEFAULT_NEW_USER_CREDIT_BALANCE } from '@/constants/userCredits';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import { newReferralCode } from '@/libs/persistence/users/referralCode';
import { ensureAffiliateRowForUser } from '@/libs/persistence/affiliates/ensureAffiliateRowForUser';
import { tryConsumePendingReferralCookie } from '@/libs/persistence/users/tryConsumePendingReferralCookie';
import { users } from '@/models/Schema';

/**
 * Avoid `undefined` in Drizzle values (Clerk JSON may omit fields).
 * @param v - optional string from Clerk
 */
function nullStr(v: string | null | undefined): string | null {
  if (v === undefined || v === null) {
    return null;
  }
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function primaryEmailFromUserJson(data: UserJSON): string | null {
  const pid = data.primary_email_address_id;
  if (pid) {
    const found = data.email_addresses.find((e) => e.id === pid);
    if (found?.email_address) {
      return found.email_address;
    }
  }
  return data.email_addresses[0]?.email_address ?? null;
}

function primaryEmailFromClerkUser(u: User): string | null {
  const pid = u.primaryEmailAddressId;
  if (pid) {
    const found = u.emailAddresses.find((e) => e.id === pid);
    if (found) {
      return found.emailAddress;
    }
  }
  return u.emailAddresses[0]?.emailAddress ?? null;
}

function rowFromUserJson(data: UserJSON): ClerkUserUpsertBase {
  return {
    id: data.id,
    email: nullStr(primaryEmailFromUserJson(data) ?? undefined),
    firstName: nullStr(data.first_name ?? undefined),
    lastName: nullStr(data.last_name ?? undefined),
    imageUrl: nullStr(data.image_url ?? undefined),
    username: nullStr(data.username ?? undefined),
    deletedAt: null,
    creditBalance: DEFAULT_NEW_USER_CREDIT_BALANCE,
  };
}

function rowFromClerkUser(u: User): ClerkUserUpsertBase {
  return {
    id: u.id,
    email: nullStr(primaryEmailFromClerkUser(u) ?? undefined),
    firstName: nullStr(u.firstName ?? undefined),
    lastName: nullStr(u.lastName ?? undefined),
    imageUrl: nullStr(u.imageUrl ?? undefined),
    username: nullStr(u.username ?? undefined),
    deletedAt: null,
    creditBalance: DEFAULT_NEW_USER_CREDIT_BALANCE,
  };
}

export async function upsertAppUserFromClerkUserJson(data: UserJSON): Promise<void> {
  const row = rowFromUserJson(data);
  await db
    .insert(users)
    .values({
      ...row,
      referralCode: newReferralCode(),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        imageUrl: row.imageUrl,
        username: row.username,
        deletedAt: null,
        updatedAt: new Date(),
      },
    });
}

/** Call from server routes after auth so DB always has a row before FK writes (e.g. enhancer). */
export async function ensureAppUserFromCurrentClerkUser(): Promise<void> {
  const u = await currentUser();
  if (!u) {
    return;
  }
  try {
    const row = rowFromClerkUser(u);
    await db
      .insert(users)
      .values({
        ...row,
        referralCode: newReferralCode(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          imageUrl: row.imageUrl,
          username: row.username,
          deletedAt: null,
          updatedAt: new Date(),
        },
      });
    await ensureAffiliateRowForUser(u.id);
    await tryConsumePendingReferralCookie(u.id);
  } catch (error) {
    const msg =
      error instanceof Error
        ? `${error.message}${error.cause != null ? ` | cause: ${String((error as Error & { cause?: unknown }).cause)}` : ''}`
        : String(error);
    logger.error('ensureAppUserFromCurrentClerkUser failed', { error: msg });
    throw error;
  }
}

export async function softDeleteAppUser(clerkUserId: string): Promise<void> {
  if (!clerkUserId) {
    return;
  }
  await db
    .update(users)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, clerkUserId));
}
