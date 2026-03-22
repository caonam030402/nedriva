import type { BillingPlan } from '@clerk/backend';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { BillingCatalogFeatureId } from '@/constants/billingCatalogFeatures';
import type * as schema from '@/models/Schema';
import { randomUUID } from 'node:crypto';

import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import {
  catalogFeatureIdFromClerkFeatureSlug,
  PLAN_CATALOG_FEATURE_SEED,
} from '@/constants/billingCatalogFeatures';
import { resolveBillingPlanSlug } from '@/constants/billingPlanBenefits';
import { PlanPayerType } from '@/constants/clerkPlanKeys';
import { db } from '@/libs/core/DB';
import { logger } from '@/libs/core/Logger';
import { planBenefits, planCatalogFeatures, planFeatures, plans } from '@/models/Schema';

type DbExecutor = NodePgDatabase<typeof schema>;

export type SyncBillingPlansFromClerkResult = {
  userPlanCount: number;
  organizationPlanCount: number;
  upserted: number;
  errors: string[];
};

function normalizeClerkPlanSlugForDb(slug: string): string {
  return resolveBillingPlanSlug(slug) ?? slug.trim().toLowerCase();
}

function payerTypeFromClerkPlan(plan: BillingPlan): PlanPayerType {
  return plan.forPayerType === 'org' ? PlanPayerType.Organization : PlanPayerType.User;
}

function planToSnapshot(plan: BillingPlan): Record<string, unknown> {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    forPayerType: plan.forPayerType,
    description: plan.description,
    isDefault: plan.isDefault,
    isRecurring: plan.isRecurring,
    hasBaseFee: plan.hasBaseFee,
    publiclyVisible: plan.publiclyVisible,
    features: (plan.features ?? []).map((f: { id: string; slug: string; name: string; description?: string | null }) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      description: f.description,
    })),
  };
}

async function fetchAllPlansForPayerType(
  client: Awaited<ReturnType<typeof clerkClient>>,
  payerType: PlanPayerType,
): Promise<BillingPlan[]> {
  const out: BillingPlan[] = [];
  let offset = 0;
  const limit = 100;
  const clerkPayerType = payerType === PlanPayerType.Organization ? 'org' : 'user';
  for (;;) {
    const res = await client.billing.getPlanList({ payerType: clerkPayerType, limit, offset });
    out.push(...res.data);
    if (res.data.length === 0) {
      break;
    }
    offset += limit;
    if (offset >= res.totalCount) {
      break;
    }
  }
  return out;
}

/**
 * Ensure FK `plan_features.feature_id` → `features.id`: `features` has all catalog rows.
 * @param executor - DB connection or transaction.
 */
async function ensurePlanCatalogFeatureRows(executor: DbExecutor): Promise<void> {
  for (const row of PLAN_CATALOG_FEATURE_SEED) {
    await executor
      .insert(planCatalogFeatures)
      .values({
        id: row.id,
        displayName: row.displayName,
        sortOrder: row.sortOrder,
      })
      .onConflictDoNothing({ target: planCatalogFeatures.id });
  }
}

function catalogFeatureIdsFromClerkPlan(plan: BillingPlan): BillingCatalogFeatureId[] {
  const raw = plan.features ?? [];
  const matched: BillingCatalogFeatureId[] = raw
    .map((f: { slug: string }) => catalogFeatureIdFromClerkFeatureSlug(f.slug))
    .filter((x: BillingCatalogFeatureId | null): x is BillingCatalogFeatureId => x != null);
  return [...new Set<BillingCatalogFeatureId>(matched)];
}

async function upsertOneClerkPlan(executor: DbExecutor, plan: BillingPlan): Promise<void> {
  const payerType = payerTypeFromClerkPlan(plan);
  const clerkSlug = normalizeClerkPlanSlugForDb(plan.slug);
  const name = plan.name.slice(0, 128);
  const snapshot = planToSnapshot(plan);
  const featureIds = catalogFeatureIdsFromClerkPlan(plan);

  // Extract prices (amount from Clerk is in cents; store in USD)
  const monthlyPriceUsd =
    plan.fee?.currency === 'USD' ? Number((plan.fee.amount / 100).toFixed(2)) : null;
  const annualPriceUsd =
    plan.annualFee?.currency === 'USD' ? Number((plan.annualFee.amount / 100).toFixed(2)) : null;

  for (const f of plan.features ?? []) {
    if (catalogFeatureIdFromClerkFeatureSlug(f.slug) == null) {
      logger.debug('Clerk plan feature slug not mapped to features catalog', {
        planSlug: plan.slug,
        featureSlug: f.slug,
        featureName: f.name,
      });
    }
  }

  await executor.transaction(async (tx) => {
    const [row] = await tx
      .insert(plans)
      .values({
        id: randomUUID(),
        payerType,
        clerkSlug,
        name,
        monthlyPriceUsd,
        annualPriceUsd,
      })
      .onConflictDoUpdate({
        target: [plans.clerkSlug, plans.payerType],
        set: {
          name,
          monthlyPriceUsd,
          annualPriceUsd,
          updatedAt: new Date(),
        },
      })
      .returning({ id: plans.id });

    if (!row) {
      throw new Error('plans upsert returned no row');
    }

    const planId = row.id;

    await tx
      .insert(planBenefits)
      .values({
        planId,
        clerkPlanId: plan.id,
        clerkPayloadSnapshot: snapshot,
        creditsPerPayment: 0,
        monthlyCreditAllowance: 0,
        maxBankedCredits: 0,
        maxOutputMegapixels: 0,
        cloudStorageMonths: 0,
        maxInputMegapixels: 64,
        maxInputFileMb: 50,
        active: true,
      })
      .onConflictDoUpdate({
        target: planBenefits.planId,
        set: {
          clerkPlanId: plan.id,
          clerkPayloadSnapshot: snapshot,
          updatedAt: new Date(),
        },
      });

    await tx.delete(planFeatures).where(eq(planFeatures.planId, planId));

    if (featureIds.length > 0) {
      await tx.insert(planFeatures).values(
        featureIds.map((featureId) => ({
          planId,
          featureId,
        })),
      );
    }
  });
}

/**
 * Pull Clerk Billing (`billing.getPlanList` × user + org) → `plans` + `plan_benefits` + `plan_features`.
 * When a plan already exists, keep `plan_benefits` credits/limits; update `clerk_plan_id` + snapshot; prices live on `plans`.
 * @param executor - DB or transaction for catalog writes.
 */
export async function syncBillingPlansFromClerk(
  executor: DbExecutor = db,
): Promise<SyncBillingPlansFromClerkResult> {
  const errors: string[] = [];
  await ensurePlanCatalogFeatureRows(executor);

  const client = await clerkClient();
  const userPlans = await fetchAllPlansForPayerType(client, PlanPayerType.User);
  const orgPlans = await fetchAllPlansForPayerType(client, PlanPayerType.Organization);
  const combined = [...userPlans, ...orgPlans];

  for (const plan of combined) {
    try {
      await upsertOneClerkPlan(executor, plan);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${plan.slug}: ${msg}`);
      logger.error('syncBillingPlansFromClerk: plan upsert failed', {
        slug: plan.slug,
        clerkPlanId: plan.id,
        error,
      });
    }
  }

  logger.info('syncBillingPlansFromClerk completed', {
    userPlanCount: userPlans.length,
    organizationPlanCount: orgPlans.length,
    upserted: combined.length - errors.length,
    errorCount: errors.length,
  });

  return {
    userPlanCount: userPlans.length,
    organizationPlanCount: orgPlans.length,
    upserted: combined.length - errors.length,
    errors,
  };
}
