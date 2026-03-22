import type { BillingSubscriptionWebhookEvent } from '@clerk/backend';
import type { SubscriptionCapabilities } from '@/constants/billingPlanBenefits';
import { FREE_SUBSCRIPTION_CAPABILITIES } from '@/constants/billingPlanBenefits';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import {
  mergeCapabilitiesFromBillingPlansDb,
  planPayerTypeFromClerkBillingPayer,
} from '@/libs/persistence/billing/planCatalog';
import { tryAwardReferrerSubscriptionBonus } from '@/libs/persistence/users/tryAwardReferrerSubscriptionBonus';
import { userSubscriptionCapabilities } from '@/models/Schema';

type SubscriptionData = BillingSubscriptionWebhookEvent['data'];

function planSlugsFromSubscription(data: SubscriptionData): string[] {
  const items = data.items ?? [];
  return items.map((item) => item.plan?.slug ?? item.plan_id ?? '').filter(s => s.length > 0);
}

function capsToRow(
  userId: string,
  snapshot: string | null,
  caps: SubscriptionCapabilities,
  planId: string | null,
) {
  return {
    userId,
    planId,
    planSlugSnapshot: snapshot,
    monthlyCreditAllowance: caps.monthlyCreditAllowance,
    maxBankedCredits: caps.maxBankedCredits,
    maxOutputMegapixels: caps.maxOutputMegapixels,
    cloudStorageMonths: caps.cloudStorageMonths,
    maxInputMegapixels: caps.maxInputMegapixels,
    maxInputFileMb: caps.maxInputFileMb,
    featUnusedCreditsRollover: caps.featUnusedCreditsRollover,
    featAiArt: caps.featAiArt,
    featRemoveBackground: caps.featRemoveBackground,
    featPriorityEnhancement: caps.featPriorityEnhancement,
    featChatSupport: caps.featChatSupport,
    featEarlyAccess: caps.featEarlyAccess,
    featFlexPlanChange: caps.featFlexPlanChange,
    featApiAccess: caps.featApiAccess,
  };
}

/**
 * Upsert `user_subscription_capabilities` from Clerk `subscription.*` (resolve `plans` by payer user vs org).
 * @param data - Clerk `subscription.*` webhook `data` object.
 */
export async function syncUserEntitlementsFromSubscription(data: SubscriptionData): Promise<void> {
  const userId = data.payer?.user_id;
  if (!userId) {
    return;
  }

  const slugs = planSlugsFromSubscription(data);
  const active = data.status === 'active';
  const snapshot = slugs.length > 0 ? slugs.join(',') : null;
  const payerType = planPayerTypeFromClerkBillingPayer(data.payer);

  let caps: SubscriptionCapabilities = { ...FREE_SUBSCRIPTION_CAPABILITIES };
  let primaryPlanId: string | null = null;

  if (active) {
    const merged = await mergeCapabilitiesFromBillingPlansDb(db, slugs, payerType);
    caps = merged.caps;
    primaryPlanId = merged.primaryPlanId;
  }

  if (active && slugs.length > 0 && caps.monthlyCreditAllowance === 0) {
    logger.warn('Active subscription: no matching plans rows — check clerk_slug + payer_type seed', {
      slugs,
      payerType,
      subscriptionId: data.id,
      userId,
    });
  }

  const row = capsToRow(userId, active ? snapshot : null, caps, active ? primaryPlanId : null);
  const { userId: _pk, ...updates } = row;
  void _pk;

  await db
    .insert(userSubscriptionCapabilities)
    .values(row)
    .onConflictDoUpdate({
      target: userSubscriptionCapabilities.userId,
      set: {
        ...updates,
        updatedAt: new Date(),
      },
    });

  if (active && caps.monthlyCreditAllowance > 0) {
    await tryAwardReferrerSubscriptionBonus(userId, caps.monthlyCreditAllowance);
  }
}
