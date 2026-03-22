import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { SubscriptionCapabilities } from '@/constants/billingPlanBenefits';
import type * as schema from '@/models/Schema';
import type { PlanPayerType } from '@/models/Schema';
import { and, eq, inArray } from 'drizzle-orm';
import { subscriptionFeatureFlagsFromCatalogIds } from '@/constants/billingCatalogFeatures';
import {
  FREE_SUBSCRIPTION_CAPABILITIES,
  mergeCapabilities,
  resolveBillingPlanSlug,
  slugCandidatesForBillingLookup,
} from '@/constants/billingPlanBenefits';
import { planBenefits, planFeatures, plans } from '@/models/Schema';

/** Works with both top-level `db` and `tx` inside `db.transaction(...)`. */
type DbExecutor = NodePgDatabase<typeof schema>;

export type PlanWithBenefits = {
  plan: typeof plans.$inferSelect;
  benefits: typeof planBenefits.$inferSelect;
};

/**
 * `organization` when the payer has a real `organization_id`; otherwise `user` catalog.
 * @param payer
 */
export function planPayerTypeFromClerkBillingPayer(payer: {
  organization_id?: string | null;
} | null | undefined): PlanPayerType {
  const o = payer?.organization_id?.trim();
  if (o && o.length > 0) {
    return 'organization';
  }
  return 'user';
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
 * @param executor
 * @param rawSlugs
 * @param payerType
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
    rows.map(r => r.plan.id),
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
 * @param executor
 * @param rawSlugs
 * @param payerType
 */
export async function totalCreditsForPaymentLineItemsDb(
  executor: DbExecutor,
  rawSlugs: string[],
  payerType: PlanPayerType,
): Promise<number> {
  const rows = await fetchBillingPlanRowsForSlugs(executor, rawSlugs, payerType);
  const bySlug = new Map(rows.map(r => [r.plan.clerkSlug, r]));
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
