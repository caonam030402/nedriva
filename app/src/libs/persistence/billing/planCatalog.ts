import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { SubscriptionCapabilities } from '@/constants/billingPlanBenefits';
import type * as schema from '@/models/Schema';
import { and, eq, inArray } from 'drizzle-orm';
import { subscriptionFeatureFlagsFromCatalogIds } from '@/constants/billingCatalogFeatures';
import {
  FREE_SUBSCRIPTION_CAPABILITIES,
  mergeCapabilities,
  resolveBillingPlanSlug,
  slugCandidatesForBillingLookup,
} from '@/constants/billingPlanBenefits';
import { isOrgCatalogSlug, isUserCatalogSlug, PlanPayerType } from '@/constants/clerkPlanKeys';
import { planBenefits, planFeatures, plans } from '@/models/Schema';

/** Works with both top-level `db` and `tx` inside `db.transaction(...)`. */
type DbExecutor = NodePgDatabase<typeof schema>;

/** Clerk subscription / payment line items — enough to resolve `plans.clerk_slug`. */
export type ClerkBillingLineItemLike = {
  plan?: { id?: string; slug?: string } | null | undefined;
  plan_id?: string | null;
};

/**
 * Build plan slugs for DB lookup: use `plan.slug` when present, else resolve `plan.id` / `plan_id` via `plan_benefits.clerk_plan_id` (after catalog sync).
 * @param executor - DB connection or transaction.
 * @param items - Line items from a Clerk subscription/payment webhook.
 */
export async function resolveBillingSlugsFromLineItems(
  executor: DbExecutor,
  items: ClerkBillingLineItemLike[] | null | undefined,
): Promise<string[]> {
  const list = Array.isArray(items) ? items : [];
  const slugs: string[] = [];
  const clerkPlanIds: string[] = [];
  for (const item of list) {
    const s = item.plan?.slug?.trim();
    if (s) {
      slugs.push(s);
      continue;
    }
    const pid = item.plan?.id ?? item.plan_id ?? null;
    if (pid != null && typeof pid === 'string' && pid.length > 0) {
      clerkPlanIds.push(pid);
    }
  }
  const uniqIds = [...new Set(clerkPlanIds)];
  if (uniqIds.length > 0) {
    const rows = await executor
      .select({ clerkSlug: plans.clerkSlug })
      .from(planBenefits)
      .innerJoin(plans, eq(planBenefits.planId, plans.id))
      .where(and(inArray(planBenefits.clerkPlanId, uniqIds), eq(planBenefits.active, true)));
    for (const r of rows) {
      if (r.clerkSlug) {
        slugs.push(r.clerkSlug);
      }
    }
  }
  return [...new Set(slugs.filter((s) => s.length > 0))];
}

/**
 * If Clerk omits `organization_id` on the payer but line items are org plans (or the reverse), retry with the other payer type.
 * @param executor - DB connection or transaction.
 * @param slugs - Raw plan slugs from Clerk webhook line items.
 * @param payerType - Payer type as determined from the webhook `payer` object.
 */
export async function mergeCapabilitiesFromBillingPlansDbWithPayerFallback(
  executor: DbExecutor,
  slugs: string[],
  payerType: PlanPayerType,
): Promise<{
  caps: SubscriptionCapabilities;
  primaryPlanId: string | null;
  effectivePayerType: PlanPayerType;
}> {
  let merged = await mergeCapabilitiesFromBillingPlansDb(executor, slugs, payerType);
  let effectivePayerType = payerType;
  if (merged.caps.monthlyCreditAllowance > 0 || slugs.length === 0) {
    return { ...merged, effectivePayerType };
  }
  const allOrg = slugs.length > 0 && slugs.every(isOrgCatalogSlug);
  if (payerType === PlanPayerType.User && allOrg) {
    merged = await mergeCapabilitiesFromBillingPlansDb(executor, slugs, PlanPayerType.Organization);
    effectivePayerType = PlanPayerType.Organization;
  } else if (
    payerType === PlanPayerType.Organization &&
    slugs.length > 0 &&
    slugs.every(isUserCatalogSlug)
  ) {
    merged = await mergeCapabilitiesFromBillingPlansDb(executor, slugs, PlanPayerType.User);
    effectivePayerType = PlanPayerType.User;
  }
  return { ...merged, effectivePayerType };
}

/**
 * Sum `credits_per_payment` with the same payer fallback as entitlements.
 * @param executor - DB connection or transaction.
 * @param rawSlugs - Raw plan slugs from Clerk webhook line items.
 * @param payerType - Payer type as determined from the webhook `payer` object.
 */
export async function totalCreditsForPaymentLineItemsDbWithPayerFallback(
  executor: DbExecutor,
  rawSlugs: string[],
  payerType: PlanPayerType,
): Promise<number> {
  let n = await totalCreditsForPaymentLineItemsDb(executor, rawSlugs, payerType);
  if (n > 0 || rawSlugs.length === 0) {
    return n;
  }
  const allOrg = rawSlugs.length > 0 && rawSlugs.every(isOrgCatalogSlug);
  const allUser = rawSlugs.length > 0 && rawSlugs.every(isUserCatalogSlug);
  if (payerType === PlanPayerType.User && allOrg) {
    n = await totalCreditsForPaymentLineItemsDb(executor, rawSlugs, PlanPayerType.Organization);
  } else if (payerType === PlanPayerType.Organization && allUser) {
    n = await totalCreditsForPaymentLineItemsDb(executor, rawSlugs, PlanPayerType.User);
  }
  return n;
}

export type PlanWithBenefits = {
  plan: typeof plans.$inferSelect;
  benefits: typeof planBenefits.$inferSelect;
};

/**
 * `organization` when the payer has a real `organization_id`; otherwise `user` catalog.
 * @param payer - Clerk billing payer from a webhook payload.
 */
export function planPayerTypeFromClerkBillingPayer(
  payer:
    | {
        organization_id?: string | null;
      }
    | null
    | undefined,
): PlanPayerType {
  const o = payer?.organization_id?.trim();
  if (o && o.length > 0) {
    return PlanPayerType.Organization;
  }
  return PlanPayerType.User;
}

function billingPlanRowToCapabilities(
  row: PlanWithBenefits,
  featureIdsForPlan: Set<string>,
): SubscriptionCapabilities {
  const flags = subscriptionFeatureFlagsFromCatalogIds(featureIdsForPlan);
  const b = row.benefits;
  return {
    monthlyCreditAllowance: b.monthlyCreditAllowance,
    maxBankedCredits: b.maxBankedCredits,
    maxOutputMegapixels: b.maxOutputMegapixels,
    cloudStorageMonths: b.cloudStorageMonths,
    maxInputMegapixels: b.maxInputMegapixels,
    maxInputFileMb: b.maxInputFileMb,
    ...flags,
  };
}

async function featureIdsByPlanId(
  executor: DbExecutor,
  planIds: string[],
): Promise<Map<string, Set<string>>> {
  const out = new Map<string, Set<string>>();
  if (planIds.length === 0) {
    return out;
  }
  const uniq = [...new Set(planIds)];
  const links = await executor
    .select()
    .from(planFeatures)
    .where(inArray(planFeatures.planId, uniq));
  for (const link of links) {
    let s = out.get(link.planId);
    if (!s) {
      s = new Set();
      out.set(link.planId, s);
    }
    s.add(link.featureId);
  }
  return out;
}

function pickStrongestPlanId(rows: PlanWithBenefits[]): string | null {
  if (rows.length === 0) {
    return null;
  }
  return rows.reduce((a, b) =>
    a.benefits.monthlyCreditAllowance >= b.benefits.monthlyCreditAllowance ? a : b,
  ).plan.id;
}

/**
 * Load `plans` + `plan_benefits` (active) theo slug.
 * @param executor - DB connection or transaction.
 * @param rawSlugs - Plan slugs to look up.
 * @param payerType - Catalog to search — `user` or `organization`.
 */
export async function fetchBillingPlanRowsForSlugs(
  executor: DbExecutor,
  rawSlugs: string[],
  payerType: PlanPayerType,
): Promise<PlanWithBenefits[]> {
  const candidates = slugCandidatesForBillingLookup(rawSlugs);
  if (candidates.length === 0) {
    return [];
  }
  const rowsRaw = await executor
    .select({ plan: plans, benefits: planBenefits })
    .from(plans)
    .innerJoin(planBenefits, eq(plans.id, planBenefits.planId))
    .where(
      and(
        eq(plans.payerType, payerType),
        inArray(plans.clerkSlug, candidates),
        eq(planBenefits.active, true),
      ),
    );
  const byId = new Map<string, PlanWithBenefits>();
  for (const r of rowsRaw) {
    byId.set(r.plan.id, { plan: r.plan, benefits: r.benefits });
  }
  return [...byId.values()];
}

export async function mergeCapabilitiesFromBillingPlansDb(
  executor: DbExecutor,
  rawSlugs: string[],
  payerType: PlanPayerType,
): Promise<{
  caps: SubscriptionCapabilities;
  primaryPlanId: string | null;
}> {
  const rows = await fetchBillingPlanRowsForSlugs(executor, rawSlugs, payerType);
  const featByPlan = await featureIdsByPlanId(
    executor,
    rows.map((r) => r.plan.id),
  );
  let caps: SubscriptionCapabilities | null = null;
  for (const row of rows) {
    const c = billingPlanRowToCapabilities(row, featByPlan.get(row.plan.id) ?? new Set());
    caps = caps ? mergeCapabilities(caps, c) : { ...c };
  }
  return {
    caps: caps ?? { ...FREE_SUBSCRIPTION_CAPABILITIES },
    primaryPlanId: pickStrongestPlanId(rows),
  };
}

/**
 * Total credits per payment line item (same slug repeated → sum).
 * @param executor - DB connection or transaction.
 * @param rawSlugs - Plan slugs from a payment webhook's `subscription_items`.
 * @param payerType - Catalog to search — `user` or `organization`.
 */
export async function totalCreditsForPaymentLineItemsDb(
  executor: DbExecutor,
  rawSlugs: string[],
  payerType: PlanPayerType,
): Promise<number> {
  const rows = await fetchBillingPlanRowsForSlugs(executor, rawSlugs, payerType);
  const bySlug = new Map(rows.map((r) => [r.plan.clerkSlug, r]));
  let sum = 0;
  for (const raw of rawSlugs) {
    const k = resolveBillingPlanSlug(raw);
    if (!k) {
      continue;
    }
    sum += bySlug.get(k)?.benefits.creditsPerPayment ?? 0;
  }
  return sum;
}
