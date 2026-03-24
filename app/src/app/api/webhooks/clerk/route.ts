/**
 * POST /api/webhooks/clerk
 *
 * Clerk Dashboard → Webhooks → Endpoint URL (production):
 *   https://<your-domain>/api/webhooks/clerk
 * Subscribe to:
 *   - user.created, user.updated, user.deleted
 *   - subscription.created | .updated | .active | .pastDue
 *   - subscriptionItem.* (optional; parent list still authoritative via subscription.updated)
 *   - paymentAttempt.created | .updated
 * Signing secret: `CLERK_WEBHOOK_SIGNING_SECRET` (set in env; required for verification in production).
 */
import type {
  BillingPaymentAttemptWebhookEvent,
  BillingSubscriptionItemWebhookEvent,
  BillingSubscriptionWebhookEvent,
} from '@clerk/backend';
import type { NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextResponse } from 'next/server';
import {
  isBillingPaymentAttemptWebhookType,
  isBillingSubscriptionItemWebhookType,
  isBillingSubscriptionWebhookType,
} from '@/constants/clerk/clerkBillingWebhookEvents';
import { ClerkUserWebhookEvent } from '@/constants/clerk/clerkUserWebhookEvents';
import { logger } from '@/libs/core/Logger';
import { upsertBillingPaymentAttemptFromWebhook } from '@/libs/persistence/billing/upsertBillingPaymentAttemptFromWebhook';
import { upsertBillingSubscriptionFromWebhook } from '@/libs/persistence/billing/upsertBillingSubscriptionFromWebhook';
import { upsertBillingSubscriptionItemFromWebhook } from '@/libs/persistence/billing/upsertBillingSubscriptionItemFromWebhook';
import {
  softDeleteAppUser,
  upsertAppUserFromClerkUserJson,
} from '@/libs/persistence/users/syncClerkAppUser';

function errMsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req);
  } catch (error) {
    logger.error('Clerk webhook signature verification failed', {
      error: errMsg(error),
    });
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  try {
    const { CREATED, UPDATED, DELETED } = ClerkUserWebhookEvent;
    if (evt.type === CREATED || evt.type === UPDATED) {
      await upsertAppUserFromClerkUserJson(evt.data);
    } else if (evt.type === DELETED) {
      const id = evt.data.id;
      if (id) {
        await softDeleteAppUser(id);
      }
    } else if (isBillingSubscriptionWebhookType(evt.type)) {
      await upsertBillingSubscriptionFromWebhook(
        (evt as BillingSubscriptionWebhookEvent).data,
        evt.type,
      );
    } else if (isBillingSubscriptionItemWebhookType(evt.type)) {
      await upsertBillingSubscriptionItemFromWebhook(
        (evt as BillingSubscriptionItemWebhookEvent).data,
        evt.type,
      );
    } else if (isBillingPaymentAttemptWebhookType(evt.type)) {
      await upsertBillingPaymentAttemptFromWebhook(
        (evt as BillingPaymentAttemptWebhookEvent).data,
        evt.type,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Clerk webhook handler failed', {
      error: errMsg(error),
      eventType: evt.type,
    });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
