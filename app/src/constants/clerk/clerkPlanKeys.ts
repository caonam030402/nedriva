/**
 * Plan keys / slugs from Clerk Billing (Dashboard). Use for webhooks, entitlements, or comparing `usePlans()` results.
 * If you rename a plan in Clerk, update this file to match.
 */

/** Payer type — mirrors `plans.payer_type` / `plan_payer_type` DB enum. */
export enum PlanPayerType {
  User = 'user',
  Organization = 'organization',
}

/** Personal (User plans) — slug column in Dashboard */
export const CLERK_USER_PLAN_KEY = {
  starter: 'starter',
  pro: 'pro',
  max: 'max',
} as const;

export type ClerkUserPlanKey = (typeof CLERK_USER_PLAN_KEY)[keyof typeof CLERK_USER_PLAN_KEY];

/** Organization plans — key/title as shown in Dashboard (credit tiers) */
export const CLERK_ORGANIZATION_PLAN_KEY = {
  credits1000: '1000',
  credits2500: '2500',
  credits5000: '5000',
} as const;

export type ClerkOrganizationPlanKey =
  (typeof CLERK_ORGANIZATION_PLAN_KEY)[keyof typeof CLERK_ORGANIZATION_PLAN_KEY];

const USER_VALUES = Object.values(CLERK_USER_PLAN_KEY);
const ORG_VALUES = Object.values(CLERK_ORGANIZATION_PLAN_KEY);

export function isClerkUserPlanKey(value: string): value is ClerkUserPlanKey {
  return (USER_VALUES as readonly string[]).includes(value);
}

export function isClerkOrganizationPlanKey(value: string): value is ClerkOrganizationPlanKey {
  return (ORG_VALUES as readonly string[]).includes(value);
}

/** Free-tier plan slugs from Clerk Dashboard (not in paid seed rows). */
export const CLERK_FREE_USER_PLAN_SLUG = 'free_user' as const;
export const CLERK_FREE_ORG_PLAN_SLUG = 'free_org' as const;

export function isClerkFreeUserPlanSlug(value: string): boolean {
  return value === CLERK_FREE_USER_PLAN_SLUG;
}

export function isClerkFreeOrgPlanSlug(value: string): boolean {
  return value === CLERK_FREE_ORG_PLAN_SLUG;
}

/**
 * Slugs that belong to the `user` payer catalog (personal + free).
 * @param value
 */
export function isUserCatalogSlug(value: string): boolean {
  return isClerkUserPlanKey(value) || isClerkFreeUserPlanSlug(value);
}

/**
 * Slugs that belong to the `organization` payer catalog (team tiers + free org).
 * @param value
 */
export function isOrgCatalogSlug(value: string): boolean {
  return isClerkOrganizationPlanKey(value) || isClerkFreeOrgPlanSlug(value);
}
