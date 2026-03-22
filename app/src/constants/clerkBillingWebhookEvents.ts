/**
 * Clerk Billing webhook `type` values we persist to Postgres.
 * @see https://clerk.com/docs/billing/events-webhooks
 */
export const ClerkBillingSubscriptionWebhookEvent = {
  CREATED: 'subscription.created',
  UPDATED: 'subscription.updated',
  ACTIVE: 'subscription.active',
  PAST_DUE: 'subscription.pastDue',
} as const;

export type ClerkBillingSubscriptionWebhookEventType =
  (typeof ClerkBillingSubscriptionWebhookEvent)[keyof typeof ClerkBillingSubscriptionWebhookEvent];

/** Per–subscription-line-item events (plan changes, trial, cancel, …). */
export const ClerkBillingSubscriptionItemWebhookEvent = {
  ABANDONED: 'subscriptionItem.abandoned',
  ACTIVE: 'subscriptionItem.active',
  CANCELED: 'subscriptionItem.canceled',
  CREATED: 'subscriptionItem.created',
  ENDED: 'subscriptionItem.ended',
  FREE_TRIAL_ENDING: 'subscriptionItem.freeTrialEnding',
  INCOMPLETE: 'subscriptionItem.incomplete',
  PAST_DUE: 'subscriptionItem.pastDue',
  UPCOMING: 'subscriptionItem.upcoming',
  UPDATED: 'subscriptionItem.updated',
} as const;

export type ClerkBillingSubscriptionItemWebhookEventType =
  (typeof ClerkBillingSubscriptionItemWebhookEvent)[keyof typeof ClerkBillingSubscriptionItemWebhookEvent];

export const ClerkBillingPaymentAttemptWebhookEvent = {
  CREATED: 'paymentAttempt.created',
  UPDATED: 'paymentAttempt.updated',
} as const;

export type ClerkBillingPaymentAttemptWebhookEventType =
  (typeof ClerkBillingPaymentAttemptWebhookEvent)[keyof typeof ClerkBillingPaymentAttemptWebhookEvent];

const SUBSCRIPTION_TYPES: readonly string[] = Object.values(ClerkBillingSubscriptionWebhookEvent);
const SUBSCRIPTION_ITEM_TYPES: readonly string[] = Object.values(ClerkBillingSubscriptionItemWebhookEvent);
const PAYMENT_TYPES: readonly string[] = Object.values(ClerkBillingPaymentAttemptWebhookEvent);

export function isBillingSubscriptionWebhookType(type: string): boolean {
  return SUBSCRIPTION_TYPES.includes(type);
}

export function isBillingSubscriptionItemWebhookType(type: string): boolean {
  return SUBSCRIPTION_ITEM_TYPES.includes(type);
}

export function isBillingPaymentAttemptWebhookType(type: string): boolean {
  return PAYMENT_TYPES.includes(type);
}
