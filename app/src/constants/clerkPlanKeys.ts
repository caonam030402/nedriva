/**
 * Plan keys / slugs from Clerk Billing (Dashboard). Use for webhooks, entitlements, or comparing `usePlans()` results.
 * If you rename a plan in Clerk, update this file to match.
 */

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
