import type { SubscriptionCapabilities } from '@/constants/billing/billingPlanBenefits';

/** Row id in `features` / `plan_features.feature_id`. */
export const BILLING_CATALOG_FEATURE_IDS = [
  'unused_credits_rollover',
  'ai_art',
  'remove_background',
  'priority_enhancement',
  'chat_support',
  'early_access',
  'flex_plan_change',
  'api_access',
] as const;

export type BillingCatalogFeatureId = (typeof BILLING_CATALOG_FEATURE_IDS)[number];

/**
 * Seed `features` (matches migration 0012). Run before inserting `plan_features` on a fresh DB / incomplete migrations.
 */
export const PLAN_CATALOG_FEATURE_SEED: ReadonlyArray<{
  id: BillingCatalogFeatureId;
  displayName: string;
  sortOrder: number;
}> = [
  { id: 'unused_credits_rollover', displayName: 'Unused credits roll over', sortOrder: 10 },
  { id: 'ai_art', displayName: 'AI art', sortOrder: 20 },
  { id: 'remove_background', displayName: 'Remove background', sortOrder: 30 },
  { id: 'priority_enhancement', displayName: 'Priority enhancement', sortOrder: 40 },
  { id: 'chat_support', displayName: 'Chat support', sortOrder: 50 },
  { id: 'early_access', displayName: 'Early access', sortOrder: 60 },
  { id: 'flex_plan_change', displayName: 'Flexible plan change', sortOrder: 70 },
  { id: 'api_access', displayName: 'API access', sortOrder: 80 },
];

const KNOWN_FEATURE_ID_SET = new Set<string>(BILLING_CATALOG_FEATURE_IDS);

/** Alias slug from Clerk Dashboard → `features.id`. */
const CLERK_FEATURE_SLUG_ALIASES: Record<string, BillingCatalogFeatureId> = {
  'unused-credits-rollover': 'unused_credits_rollover',
  unused_credits_roll_over: 'unused_credits_rollover',
  'ai-art': 'ai_art',
  'remove-background': 'remove_background',
  'priority-enhancement': 'priority_enhancement',
  priority_queue: 'priority_enhancement',
  'chat-support': 'chat_support',
  'early-access': 'early_access',
  'flex-plan-change': 'flex_plan_change',
  'flexible-plan-change': 'flex_plan_change',
  'api-access': 'api_access',
};

/**
 * Map Clerk Billing `Feature.slug` → id in `features` (skip if no match).
 * @param slug
 */
export function catalogFeatureIdFromClerkFeatureSlug(slug: string): BillingCatalogFeatureId | null {
  const raw = slug.trim().toLowerCase();
  if (raw.length === 0) {
    return null;
  }
  const underscored = raw.replaceAll('-', '_');
  if (KNOWN_FEATURE_ID_SET.has(underscored)) {
    return underscored as BillingCatalogFeatureId;
  }
  return CLERK_FEATURE_SLUG_ALIASES[raw] ?? CLERK_FEATURE_SLUG_ALIASES[underscored] ?? null;
}

/**
 * Map feature catalog → booleans on `SubscriptionCapabilities` (when merging from DB).
 * @param featureIds
 */
export function subscriptionFeatureFlagsFromCatalogIds(
  featureIds: Iterable<string>,
): Pick<
  SubscriptionCapabilities,
  | 'featUnusedCreditsRollover'
  | 'featAiArt'
  | 'featRemoveBackground'
  | 'featPriorityEnhancement'
  | 'featChatSupport'
  | 'featEarlyAccess'
  | 'featFlexPlanChange'
  | 'featApiAccess'
> {
  const set = featureIds instanceof Set ? featureIds : new Set(featureIds);
  return {
    featUnusedCreditsRollover: set.has('unused_credits_rollover'),
    featAiArt: set.has('ai_art'),
    featRemoveBackground: set.has('remove_background'),
    featPriorityEnhancement: set.has('priority_enhancement'),
    featChatSupport: set.has('chat_support'),
    featEarlyAccess: set.has('early_access'),
    featFlexPlanChange: set.has('flex_plan_change'),
    featApiAccess: set.has('api_access'),
  };
}
