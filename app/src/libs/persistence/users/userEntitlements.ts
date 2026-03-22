import type { SubscriptionCapabilities } from '@/constants/billingPlanBenefits';
import type { UserSubscriptionCapabilitiesRow } from '@/models/Schema';
import { eq } from 'drizzle-orm';
import { FREE_SUBSCRIPTION_CAPABILITIES } from '@/constants/billingPlanBenefits';
import { db } from '@/libs/core/DB';
import { userSubscriptionCapabilities } from '@/models/Schema';

/** Boolean columns on `user_subscription_capabilities` (pricing-table toggles). */
export type UserPlanFeatureFlagKey = keyof Pick<
  UserSubscriptionCapabilitiesRow,
  | 'featUnusedCreditsRollover'
  | 'featAiArt'
  | 'featRemoveBackground'
  | 'featPriorityEnhancement'
  | 'featChatSupport'
  | 'featEarlyAccess'
  | 'featFlexPlanChange'
  | 'featApiAccess'
>;

const FEATURE_FLAG_KEYS: readonly UserPlanFeatureFlagKey[] = [
  'featUnusedCreditsRollover',
  'featAiArt',
  'featRemoveBackground',
  'featPriorityEnhancement',
  'featChatSupport',
  'featEarlyAccess',
  'featFlexPlanChange',
  'featApiAccess',
] as const;

function rowToCapabilities(row: UserSubscriptionCapabilitiesRow): SubscriptionCapabilities {
  return {
    monthlyCreditAllowance: row.monthlyCreditAllowance,
    maxBankedCredits: row.maxBankedCredits,
    maxOutputMegapixels: row.maxOutputMegapixels,
    cloudStorageMonths: row.cloudStorageMonths,
    maxInputMegapixels: row.maxInputMegapixels,
    maxInputFileMb: row.maxInputFileMb,
    featUnusedCreditsRollover: row.featUnusedCreditsRollover,
    featAiArt: row.featAiArt,
    featRemoveBackground: row.featRemoveBackground,
    featPriorityEnhancement: row.featPriorityEnhancement,
    featChatSupport: row.featChatSupport,
    featEarlyAccess: row.featEarlyAccess,
    featFlexPlanChange: row.featFlexPlanChange,
    featApiAccess: row.featApiAccess,
  };
}

/**
 * Effective caps for API/worker checks. No row ⇒ {@link FREE_SUBSCRIPTION_CAPABILITIES}.
 * @param userId - Clerk `user_...` (same as `users.id`).
 */
export async function getUserSubscriptionCapabilities(
  userId: string,
): Promise<SubscriptionCapabilities> {
  const [row] = await db
    .select()
    .from(userSubscriptionCapabilities)
    .where(eq(userSubscriptionCapabilities.userId, userId))
    .limit(1);
  return row ? rowToCapabilities(row) : { ...FREE_SUBSCRIPTION_CAPABILITIES };
}

/**
 * @param userId - Clerk `user_...` (same as `users.id`).
 * @param flag - Boolean column, e.g. `featRemoveBackground`.
 */
export async function userHasPlanFeatureFlag(
  userId: string,
  flag: UserPlanFeatureFlagKey,
): Promise<boolean> {
  const caps = await getUserSubscriptionCapabilities(userId);
  return Boolean(caps[flag]);
}

/**
 * Feature flags that are `true` (for analytics / UI).
 * @param userId - Clerk `user_...` (same as `users.id`).
 */
export async function listEnabledPlanFeatureFlags(userId: string): Promise<UserPlanFeatureFlagKey[]> {
  const [row] = await db
    .select()
    .from(userSubscriptionCapabilities)
    .where(eq(userSubscriptionCapabilities.userId, userId))
    .limit(1);
  if (!row) {
    return [];
  }
  return FEATURE_FLAG_KEYS.filter(k => row[k]);
}
