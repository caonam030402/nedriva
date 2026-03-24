/**
 * Unified webhook handler — same pattern for every pipeline.
 *
 * Pattern (same for every pipeline):
 *   1. Validate webhook secret
 *   2. Parse body
 *   3. UPDATE DB row
 *   4. Return 200
 *
 * Note: This handler intentionally does NOT call queryClient.invalidateQueries().
 * The client polls the status route which reads the DB; when the DB is updated
 * by the webhook, the next poll returns fresh data and React Query re-renders the UI.
 * This is the simplest reliable pattern. If you need push notifications later,
 * add a pub/sub layer (Pusher, Ably, Supabase Realtime) on top of this handler.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type WebhookPayload = {
  job_id: string;
  status: 'done' | 'failed';
  output_url?: string | null;
  output_key?: string | null;
  /** Array of output URLs (image enhancer) */
  outputs?: string[] | null;
  /** Output width (image enhancer) */
  output_width?: number | null;
  /** Output height (image enhancer) */
  output_height?: number | null;
  error?: string | null;
  processing_ms?: number | null;
};

export type WebhookUpdateParams = {
  jobId: string;
  status: 'done' | 'failed';
  outputUrl?: string | null;
  outputKey?: string | null;
  errorMessage?: string | null;
  processingMs?: number | null;
  /** Array of output URLs (image enhancer) */
  outputs?: string[] | null;
  /** Output width (image enhancer) */
  outputWidth?: number | null;
  /** Output height (image enhancer) */
  outputHeight?: number | null;
};

export type PipelineWebhookAdapter = {
  updateDb: (params: WebhookUpdateParams) => Promise<void>;
};

/**
 * Verify webhook secret from request headers.
 * @param request - The incoming Next.js request
 * @param secret - The expected webhook secret value
 */
export function verifyWebhookSecret(
  request: NextRequest,
  secret: string | undefined,
): NextResponse | null {
  if (!secret) {
    return null; // no secret configured, skip verification
  }
  const header = request.headers.get('x-webhook-secret');
  if (header !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null; // valid
}

/**
 * Parse webhook body. Returns null on error (caller handles response).
 * @param request - The incoming Next.js request
 */
export async function parseWebhookBody(request: NextRequest): Promise<WebhookPayload | NextResponse> {
  try {
    const body = await request.json() as WebhookPayload;
    return body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

/**
 * Unified webhook handler factory.
 * Returns a Next.js route handler you can use directly in your webhook route.
 *
 * Usage:
 *   const handler = buildWebhookHandler({
 *     updateDb: async ({ jobId, status, outputUrl, errorMessage }) => {
 *       await db.update(bgRemovalJobs).set({ status, outputUrl, errorMessage, completedAt: new Date() })
 *         .where(eq(bgRemovalJobs.id, jobId));
 *     },
 *   });
 *   export async function POST(req: NextRequest) {
 *     return handler(req);
 *   }
 * @param adapter - Pipeline-specific adapter that updates the DB
 */
export function buildWebhookHandler(adapter: PipelineWebhookAdapter) {
  return async function webhookHandler(request: NextRequest) {
    // 1. Verify secret (uses WEBHOOK_SECRET env var by default)
    const secret = process.env.WEBHOOK_SECRET;
    const authError = verifyWebhookSecret(request, secret);
    if (authError) return authError;

    // 2. Parse body
    const body = (await request.json()) as WebhookPayload;
    if (!body.job_id || typeof body.job_id !== 'string') {
      return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
    }

    const validStatuses = new Set(['done', 'failed']);
    if (!validStatuses.has(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status — must be done | failed' },
        { status: 400 },
      );
    }

    // 3. Update DB
    try {
      await adapter.updateDb({
        jobId: body.job_id,
        status: body.status,
        outputUrl: body.output_url ?? null,
        outputKey: body.output_key ?? null,
        errorMessage: body.error ?? null,
        processingMs: body.processing_ms ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: `Update failed: ${msg}` }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  };
}
