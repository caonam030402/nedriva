/**
 * Clerk webhook event `type` strings we handle for user sync.
 * @see https://clerk.com/docs/guides/development/webhooks/overview
 */
export const ClerkUserWebhookEvent = {
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  DELETED: 'user.deleted',
} as const;

export type ClerkUserWebhookEventType
  = (typeof ClerkUserWebhookEvent)[keyof typeof ClerkUserWebhookEvent];
