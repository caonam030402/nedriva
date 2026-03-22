import { desc } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Mirrors Clerk users — synced via webhook (`user.*`) + lazy upsert on authenticated API calls.
 * `id` is Clerk user id (`user_...`).
 */
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: varchar('email', { length: 320 }),
    firstName: varchar('first_name', { length: 256 }),
    lastName: varchar('last_name', { length: 256 }),
    imageUrl: text('image_url'),
    username: varchar('username', { length: 256 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    /** Soft delete when Clerk fires `user.deleted` */
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
    /** Remaining enhancer credits; new users get `DEFAULT_NEW_USER_CREDIT_BALANCE` on first insert. */
    creditBalance: integer('credit_balance').notNull().default(0),
    /** Stable share code for `?ref=` (lowercase, unique). */
    referralCode: varchar('referral_code', { length: 16 }).notNull(),
    /** Clerk user id of referrer (set once when invitee signs up via link). */
    referredByUserId: text('referred_by_user_id'),
    /** When referral credits were granted (invitee + referrer). */
    referralBonusAppliedAt: timestamp('referral_bonus_applied_at', {
      withTimezone: true,
      mode: 'date',
    }),
  },
  table => [
    foreignKey({
      columns: [table.referredByUserId],
      foreignColumns: [table.id],
    }).onDelete('set null'),
    uniqueIndex('users_referral_code_uidx').on(table.referralCode),
    index('users_referred_by_user_id_idx').on(table.referredByUserId),
  ],
);

/**
 * Affiliate stats / config, 1:1 with `users` (split from `users` for clarity).
 */
export const affiliates = pgTable('affiliates', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  linkClickCount: integer('link_click_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * One-time bonus for the referrer when the invitee has an active subscription (credits = % of monthly allowance).
 * PK `invitee_user_id` prevents duplicate payouts.
 */
export const referralSubscriptionBonuses = pgTable(
  'referral_subscription_bonuses',
  {
    inviteeUserId: text('invitee_user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    referrerUserId: text('referrer_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    creditsAwarded: integer('credits_awarded').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  table => [index('referral_sub_bonus_referrer_idx').on(table.referrerUserId)],
);

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

/** Aligns with Python worker + GET /api/v1/jobs/{job_id} statuses */
export const enhancerJobStatusEnum = pgEnum('enhancer_job_status', [
  'queued',
  'processing',
  'done',
  'error',
]);

/** Clerk `commerce_subscription` + `commerce_subscription_item` lifecycle (webhook payloads). */
export const billingSubscriptionStatusEnum = pgEnum('billing_subscription_status', [
  'abandoned',
  'active',
  'canceled',
  'ended',
  'expired',
  'incomplete',
  'past_due',
  'upcoming',
]);

/** Clerk `paymentAttempt` status. */
export const billingPaymentAttemptStatusEnum = pgEnum('billing_payment_attempt_status', [
  'pending',
  'paid',
  'failed',
]);

/** Clerk payment attempt `charge_type`. */
export const billingChargeTypeEnum = pgEnum('billing_charge_type', ['checkout', 'recurring']);

/** Billing catalog: `user` = individual, `organization` = org (Clerk org billing). */
export const planPayerTypeEnum = pgEnum('plan_payer_type', ['user', 'organization']);

/**
 * Plan from Clerk: internal uuid + `clerk_slug` + `payer_type` + `name` (synced from `BillingPlan`).
 */
export const plans = pgTable(
  'plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    payerType: planPayerTypeEnum('payer_type').notNull(),
    clerkSlug: text('clerk_slug').notNull(),
    name: varchar('name', { length: 128 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [uniqueIndex('plans_clerk_slug_payer_uidx').on(table.clerkSlug, table.payerType)],
);

/**
 * Credits & numeric limits (1:1 with `plans`). Clerk `BillingPlan.id` → `clerk_plan_id`; JSON snapshot on sync.
 */
export const planBenefits = pgTable('plan_benefits', {
  planId: uuid('plan_id')
    .primaryKey()
    .references(() => plans.id, { onDelete: 'cascade' }),
  creditsPerPayment: integer('credits_per_payment').notNull().default(0),
  monthlyCreditAllowance: integer('monthly_credit_allowance').notNull().default(0),
  maxBankedCredits: integer('max_banked_credits').notNull().default(0),
  maxOutputMegapixels: integer('max_output_megapixels').notNull().default(0),
  cloudStorageMonths: integer('cloud_storage_months').notNull().default(0),
  maxInputMegapixels: integer('max_input_megapixels').notNull().default(64),
  maxInputFileMb: integer('max_input_file_mb').notNull().default(50),
  active: boolean('active').notNull().default(true),
  clerkPlanId: text('clerk_plan_id'),
  clerkPayloadSnapshot: jsonb('clerk_payload_snapshot'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Feature catalog (`features` table). Linked to plans via `plan_features`.
 */
export const planCatalogFeatures = pgTable('features', {
  id: text('id').primaryKey(),
  displayName: varchar('display_name', { length: 128 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Plan ↔ feature (N-N).
 */
export const planFeatures = pgTable(
  'plan_features',
  {
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'cascade' }),
    featureId: text('feature_id')
      .notNull()
      .references(() => planCatalogFeatures.id, { onDelete: 'cascade' }),
  },
  table => [primaryKey({ columns: [table.planId, table.featureId] })],
);

/**
 * One row per user — effective snapshot; `plan_id` points at the strongest catalog tier.
 */
export const userSubscriptionCapabilities = pgTable('user_subscription_capabilities', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').references(() => plans.id, { onDelete: 'set null' }),
  planSlugSnapshot: text('plan_slug_snapshot'),
  monthlyCreditAllowance: integer('monthly_credit_allowance').notNull().default(0),
  maxBankedCredits: integer('max_banked_credits').notNull().default(0),
  maxOutputMegapixels: integer('max_output_megapixels').notNull().default(0),
  cloudStorageMonths: integer('cloud_storage_months').notNull().default(0),
  maxInputMegapixels: integer('max_input_megapixels').notNull().default(64),
  maxInputFileMb: integer('max_input_file_mb').notNull().default(50),
  featUnusedCreditsRollover: boolean('feat_unused_credits_rollover').notNull().default(false),
  featAiArt: boolean('feat_ai_art').notNull().default(false),
  featRemoveBackground: boolean('feat_remove_background').notNull().default(false),
  featPriorityEnhancement: boolean('feat_priority_enhancement').notNull().default(false),
  featChatSupport: boolean('feat_chat_support').notNull().default(false),
  featEarlyAccess: boolean('feat_early_access').notNull().default(false),
  featFlexPlanChange: boolean('feat_flex_plan_change').notNull().default(false),
  featApiAccess: boolean('feat_api_access').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * One row per Enhancer run: durable history + R2 keys/URLs after Redis job TTL expires.
 * Insert when POST /api/process succeeds; update status/outputs when job finishes (webhook or poll worker).
 */
export const enhancerProcessedImages = pgTable(
  'enhancer_processed_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    /** Python arq job id (`uuid.uuid4().hex`, 32 chars) */
    jobId: varchar('job_id', { length: 32 }).notNull().unique(),
    /** Client `queueItemId` from Enhancer UI (correlation only) */
    clientQueueItemId: varchar('client_queue_item_id', { length: 128 }),
    /** R2 object key for the uploaded source, e.g. inputs/{userId}/{queueItemId}/{filename} */
    inputStorageKey: text('input_storage_key').notNull(),
    originalFilename: varchar('original_filename', { length: 512 }).notNull(),
    inputWidth: integer('input_width'),
    inputHeight: integer('input_height'),
    status: enhancerJobStatusEnum('status').notNull().default('queued'),
    /** Primary output public URL (first asset) */
    outputUrl: text('output_url'),
    /** All output URLs when pipeline returns multiple files */
    outputUrls: jsonb('output_urls').$type<string[]>(),
    outputWidth: integer('output_width'),
    outputHeight: integer('output_height'),
    /** Snapshot of OpsState at submit (audit, reproduce) */
    ops: jsonb('ops').$type<Record<string, unknown>>().notNull(),
    errorMessage: text('error_message'),
    processingMs: integer('processing_ms'),
    /** Reserved when billing is wired */
    creditCost: integer('credit_cost'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  table => [
    index('enhancer_processed_images_user_created_idx').on(
      table.userId,
      desc(table.createdAt),
    ),
  ],
);

/**
 * Clerk Billing — `subscription.*` webhooks. `payload` is full `evt.data`; `items` mirrors `data.items`.
 */
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    status: billingSubscriptionStatusEnum('status').notNull(),
    payerId: text('payer_id').notNull(),
    payerUserId: text('payer_user_id').references(() => users.id, { onDelete: 'set null' }),
    payerOrganizationId: text('payer_organization_id'),
    latestPaymentId: text('latest_payment_id'),
    paymentSourceId: text('payment_source_id'),
    items: jsonb('items').$type<unknown[]>().notNull().default([]),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    lastEventType: varchar('last_event_type', { length: 80 }).notNull(),
    clerkCreatedAt: timestamp('clerk_created_at', { withTimezone: true, mode: 'date' }),
    clerkUpdatedAt: timestamp('clerk_updated_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [
    index('subscriptions_payer_user_id_idx').on(table.payerUserId),
    index('subscriptions_payer_organization_id_idx').on(table.payerOrganizationId),
    index('subscriptions_status_idx').on(table.status),
  ],
);

/**
 * Clerk — one row per subscription line item (`subscription.*` / `subscriptionItem.*`).
 */
export const subscriptionItems = pgTable(
  'subscription_items',
  {
    id: text('id').primaryKey(),
    subscriptionId: text('subscription_id').references(() => subscriptions.id, {
      onDelete: 'set null',
    }),
    payerId: text('payer_id'),
    status: billingSubscriptionStatusEnum('status').notNull(),
    planId: text('plan_id'),
    planSlug: text('plan_slug'),
    planPeriod: varchar('plan_period', { length: 8 }),
    credit: jsonb('credit').$type<Record<string, unknown>>(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    lastEventType: varchar('last_event_type', { length: 80 }).notNull(),
    clerkPeriodStart: timestamp('clerk_period_start', { withTimezone: true, mode: 'date' }),
    clerkPeriodEnd: timestamp('clerk_period_end', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [
    index('subscription_items_subscription_id_idx').on(table.subscriptionId),
    index('subscription_items_payer_id_idx').on(table.payerId),
    index('subscription_items_status_idx').on(table.status),
  ],
);

/**
 * Clerk — `paymentAttempt.*` webhooks (card, totals, payer, subscription_items snapshot).
 */
export const paymentAttempts = pgTable(
  'payment_attempts',
  {
    id: text('id').primaryKey(),
    instanceId: text('instance_id').notNull(),
    paymentId: text('payment_id').notNull(),
    statementId: text('statement_id'),
    gatewayExternalId: text('gateway_external_id'),
    status: billingPaymentAttemptStatusEnum('status').notNull(),
    chargeType: billingChargeTypeEnum('charge_type').notNull(),
    payer: jsonb('payer').$type<Record<string, unknown>>(),
    payee: jsonb('payee').$type<Record<string, unknown>>(),
    totals: jsonb('totals').$type<Record<string, unknown>>(),
    paymentSource: jsonb('payment_source').$type<Record<string, unknown>>(),
    subscriptionItems: jsonb('subscription_items').$type<unknown[]>(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    lastEventType: varchar('last_event_type', { length: 80 }).notNull(),
    clerkCreatedAt: timestamp('clerk_created_at', { withTimezone: true, mode: 'date' }),
    clerkUpdatedAt: timestamp('clerk_updated_at', { withTimezone: true, mode: 'date' }),
    paidAt: timestamp('paid_at', { withTimezone: true, mode: 'date' }),
    failedAt: timestamp('failed_at', { withTimezone: true, mode: 'date' }),
    /** Set when credits (and optional ledger) were applied for this paid attempt — idempotency. */
    benefitsAppliedAt: timestamp('benefits_applied_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  table => [
    uniqueIndex('payment_attempts_instance_payment_uidx').on(
      table.instanceId,
      table.paymentId,
    ),
    index('payment_attempts_status_idx').on(table.status),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type UserSubscriptionCapabilitiesRow = typeof userSubscriptionCapabilities.$inferSelect;
export type PlanRow = typeof plans.$inferSelect;
export type PlanBenefitsRow = typeof planBenefits.$inferSelect;
export type PlanCatalogFeatureRow = typeof planCatalogFeatures.$inferSelect;
export type PlanFeatureLinkRow = typeof planFeatures.$inferSelect;
/** @deprecated Prefer {@link PlanRow} */
export type BillingPlanRow = PlanRow;
/** @deprecated Prefer {@link PlanCatalogFeatureRow} */
export type BillingFeatureRow = PlanCatalogFeatureRow;
/** @deprecated Prefer {@link PlanFeatureLinkRow} */
export type BillingPlanFeatureRow = PlanFeatureLinkRow;
export type PlanPayerType = (typeof planPayerTypeEnum.enumValues)[number];
export type EnhancerProcessedImageRow = typeof enhancerProcessedImages.$inferSelect;
export type NewEnhancerProcessedImageRow = typeof enhancerProcessedImages.$inferInsert;
export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type SubscriptionItemRow = typeof subscriptionItems.$inferSelect;
export type PaymentAttemptRow = typeof paymentAttempts.$inferSelect;
/** @deprecated Prefer {@link SubscriptionRow} */
export type BillingSubscriptionRow = SubscriptionRow;
/** @deprecated Prefer {@link SubscriptionItemRow} */
export type BillingSubscriptionItemRow = SubscriptionItemRow;
/** @deprecated Prefer {@link PaymentAttemptRow} */
export type BillingPaymentAttemptRow = PaymentAttemptRow;

export type BillingSubscriptionStatus = (typeof billingSubscriptionStatusEnum.enumValues)[number];
export type BillingPaymentAttemptStatus = (typeof billingPaymentAttemptStatusEnum.enumValues)[number];
export type BillingChargeType = (typeof billingChargeTypeEnum.enumValues)[number];
