import type { BillingSubscriptionWebhookEvent } from '@clerk/backend';
import type { SubscriptionCapabilities } from '@/constants/billingPlanBenefits';
import { FREE_SUBSCRIPTION_CAPABILITIES } from '@/constants/billingPlanBenefits';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import {
  mergeCapabilitiesFromBillingPlansDbWithPayerFallback,
  planPayerTypeFromClerkBillingPayer,
  resolveBillingSlugsFromLineItems,
} from '@/libs/persistence/billing/planCatalog';
import { tryAwardReferrerSubscriptionBonus } from '@/libs/persistence/users/tryAwardReferrerSubscriptionBonus';
import { userSubscriptionCapabilities } from '@/models/Schema';

type SubscriptionData = BillingSubscriptionWebhookEvent['data'];

/**
 * Clerk may keep entitlements during these statuses (not only `active`).
 * `upcoming` / `past_due` still carry paid line items; `incomplete` / `canceled` / … do not.
 */
const SUBSCRIPTION_STATUSES_WITH_PLAN_ENTITLEMENTS = new Set<SubscriptionData['status']>([
  'active',
  'upcoming',
  'past_due',
]);

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

  const items = data.items ?? [];
  const slugs = await resolveBillingSlugsFromLineItems(db, items);
  const shouldMergeEntitlements = SUBSCRIPTION_STATUSES_WITH_PLAN_ENTITLEMENTS.has(data.status);
  const snapshot = slugs.length > 0 ? slugs.join(',') : null;
  const payerType = planPayerTypeFromClerkBillingPayer(data.payer);

  let caps: SubscriptionCapabilities = { ...FREE_SUBSCRIPTION_CAPABILITIES };
  let primaryPlanId: string | null = null;

  if (shouldMergeEntitlements) {
    const merged = await mergeCapabilitiesFromBillingPlansDbWithPayerFallback(db, slugs, payerType);
    caps = merged.caps;
    primaryPlanId = merged.primaryPlanId;
    if (
      merged.effectivePayerType !== payerType
      && slugs.length > 0
      && caps.monthlyCreditAllowance > 0
    ) {
      logger.info('Resolved subscription entitlements using alternate payer_type (Clerk payer mismatch)', {
        subscriptionId: data.id,
        userId,
        webhookPayerType: payerType,
        effectivePayerType: merged.effectivePayerType,
        slugs,
      });
    }
  }

  if (shouldMergeEntitlements && slugs.length > 0 && caps.monthlyCreditAllowance === 0) {
    logger.warn('Subscription with entitlements merge: no matching plans rows — check clerk_slug + payer_type + plan sync', {
      slugs,
      payerType,
      subscriptionId: data.id,
      userId,
      status: data.status,
    });
  }

  const row = capsToRow(
    userId,
    shouldMergeEntitlements ? snapshot : null,
    caps,
    shouldMergeEntitlements ? primaryPlanId : null,
  );
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

  if (shouldMergeEntitlements && caps.monthlyCreditAllowance > 0) {
    await tryAwardReferrerSubscriptionBonus(userId, caps.monthlyCreditAllowance);
  }
}
