import {
  CLERK_FREE_ORG_PLAN_SLUG,
  CLERK_FREE_USER_PLAN_SLUG,
  CLERK_ORGANIZATION_PLAN_KEY,
  CLERK_USER_PLAN_KEY,
} from '@/constants/clerk/clerkPlanKeys';

/**
 * Effective snapshot on `user_subscription_capabilities` (merged from `plans` + `plan_features`).
 */
export type SubscriptionCapabilities = {
  monthlyCreditAllowance: number;
  maxBankedCredits: number;
  maxOutputMegapixels: number;
  cloudStorageMonths: number;
  maxInputMegapixels: number;
  maxInputFileMb: number;
  featUnusedCreditsRollover: boolean;
  featAiArt: boolean;
  featRemoveBackground: boolean;
  featPriorityEnhancement: boolean;
  featChatSupport: boolean;
  featEarlyAccess: boolean;
  featFlexPlanChange: boolean;
  featApiAccess: boolean;
};

/** No paid plan — conservative defaults. */
export const FREE_SUBSCRIPTION_CAPABILITIES: SubscriptionCapabilities = {
  monthlyCreditAllowance: 0,
  maxBankedCredits: 0,
  maxOutputMegapixels: 64,
  cloudStorageMonths: 0,
  maxInputMegapixels: 64,
  maxInputFileMb: 50,
  featUnusedCreditsRollover: false,
  featAiArt: false,
  featRemoveBackground: false,
  featPriorityEnhancement: false,
  featChatSupport: false,
  featEarlyAccess: false,
  featFlexPlanChange: false,
  featApiAccess: false,
};

const KNOWN_CANONICAL_SLUGS = new Set<string>([
  CLERK_FREE_USER_PLAN_SLUG,
  CLERK_FREE_ORG_PLAN_SLUG,
  ...Object.values(CLERK_USER_PLAN_KEY),
  ...Object.values(CLERK_ORGANIZATION_PLAN_KEY),
]);

const SLUG_ALIASES: Record<string, string> = {
  'starter-plan': CLERK_USER_PLAN_KEY.starter,
  'pro-plan': CLERK_USER_PLAN_KEY.pro,
  'max-plan': CLERK_USER_PLAN_KEY.max,
};

/**
 * When `plan_benefits.monthly_credit_allowance` is 0 (e.g. Clerk sync inserted defaults only),
 * use the same numbers as `migrations/0011_billing_plans.sql` so entitlements + referral bonus stay correct.
 */
const FALLBACK_MONTHLY_CREDIT_ALLOWANCE_BY_SLUG: Record<string, number> = {
  [CLERK_FREE_USER_PLAN_SLUG]: 0,
  [CLERK_FREE_ORG_PLAN_SLUG]: 0,
  [CLERK_USER_PLAN_KEY.starter]: 100,
  [CLERK_USER_PLAN_KEY.pro]: 300,
  [CLERK_USER_PLAN_KEY.max]: 500,
  [CLERK_ORGANIZATION_PLAN_KEY.credits1000]: 1000,
  [CLERK_ORGANIZATION_PLAN_KEY.credits2500]: 2500,
  [CLERK_ORGANIZATION_PLAN_KEY.credits5000]: 5000,
};

/**
 * Merge multiple line items (numeric = max, boolean = OR).
 * @param a - First capabilities snapshot.
 * @param b - Second capabilities snapshot.
 */
export function mergeCapabilities(
  a: SubscriptionCapabilities,
  b: SubscriptionCapabilities,
): SubscriptionCapabilities {
  return {
    monthlyCreditAllowance: Math.max(a.monthlyCreditAllowance, b.monthlyCreditAllowance),
    maxBankedCredits: Math.max(a.maxBankedCredits, b.maxBankedCredits),
    maxOutputMegapixels: Math.max(a.maxOutputMegapixels, b.maxOutputMegapixels),
    cloudStorageMonths: Math.max(a.cloudStorageMonths, b.cloudStorageMonths),
    maxInputMegapixels: Math.max(a.maxInputMegapixels, b.maxInputMegapixels),
    maxInputFileMb: Math.max(a.maxInputFileMb, b.maxInputFileMb),
    featUnusedCreditsRollover: a.featUnusedCreditsRollover || b.featUnusedCreditsRollover,
    featAiArt: a.featAiArt || b.featAiArt,
    featRemoveBackground: a.featRemoveBackground || b.featRemoveBackground,
    featPriorityEnhancement: a.featPriorityEnhancement || b.featPriorityEnhancement,
    featChatSupport: a.featChatSupport || b.featChatSupport,
    featEarlyAccess: a.featEarlyAccess || b.featEarlyAccess,
    featFlexPlanChange: a.featFlexPlanChange || b.featFlexPlanChange,
    featApiAccess: a.featApiAccess || b.featApiAccess,
  };
}

/**
 * Normalize slug to match `plans.clerk_slug` (and seed migrations).
 * @param slug - `plan.slug` from Clerk (e.g. `pro-plan`, …).
 * @returns Canonical slug or null if not in catalog.
 */
export function resolveBillingPlanSlug(slug: string | null | undefined): string | null {
  if (slug == null) {
    return null;
  }
  const s = slug.trim().toLowerCase();
  if (s.length === 0) {
    return null;
  }
  if (KNOWN_CANONICAL_SLUGS.has(s)) {
    return s;
  }
  const aliased = SLUG_ALIASES[s];
  if (aliased) {
    return aliased;
  }
  const compact = s.replaceAll('-', '');
  if (KNOWN_CANONICAL_SLUGS.has(compact)) {
    return compact;
  }
  return null;
}

/**
 * Slug variants that may appear on webhooks / Clerk API to match `plans.clerk_slug`.
 * @param rawSlugs - Raw slugs from Clerk line items.
 */
export function slugCandidatesForBillingLookup(rawSlugs: string[]): string[] {
  const s = new Set<string>();
  for (const raw of rawSlugs) {
    if (raw == null) {
      continue;
    }
    const t = raw.trim().toLowerCase();
    if (t.length === 0) {
      continue;
    }
    s.add(t);
    const resolved = resolveBillingPlanSlug(raw);
    if (resolved) {
      s.add(resolved);
    }
    const compact = t.replaceAll('-', '');
    if (compact.length > 0) {
      s.add(compact);
    }
  }
  return [...s];
}

/**
 * Max monthly credit allowance implied by raw Clerk line-item slugs, from the static catalog (not DB).
 * Used when DB merge yields 0 but the subscription clearly includes a paid tier slug.
 * @param rawSlugs - Raw slugs from Clerk line items or `plan_slug_snapshot`.
 */
export function fallbackMonthlyCreditAllowanceFromRawSlugs(rawSlugs: string[]): number {
  let max = 0;
  for (const raw of rawSlugs) {
    if (raw == null) {
      continue;
    }
    const resolved = resolveBillingPlanSlug(raw);
    const k = resolved ?? raw.trim().toLowerCase();
    if (k.length === 0) {
      continue;
    }
    max = Math.max(max, FALLBACK_MONTHLY_CREDIT_ALLOWANCE_BY_SLUG[k] ?? 0);
  }
  return max;
}
