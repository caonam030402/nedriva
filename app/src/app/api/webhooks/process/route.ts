/**
 * POST /api/webhooks/process
 *
 * Called by the Python service when a job finishes.
 * Updates the queue item status so the UI can react in real time.
 *
 * For production, use a proper pub/sub (e.g. Pusher, Ably, Supabase Realtime)
 * instead of polling. This webhook is the insertion point.
 */
import type { NextRequest } from 'next/server';
import type { WebhookProcessBody } from '@/libs/persistence/enhancer/enhancerProcessedRecords';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/core/Logger';
import { updateEnhancerJobFromWebhook } from '@/libs/persistence/enhancer/enhancerProcessedRecords';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json()) as WebhookProcessBody;

  try {
    await updateEnhancerJobFromWebhook(body);
  } catch (error) {
    logger.error('process webhook: failed to update enhancer_processed_images', {
      jobId: body.job_id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  logger.info('process webhook: job updated', { jobId: body.job_id, status: body.status });

  return NextResponse.json({ received: true });
}
