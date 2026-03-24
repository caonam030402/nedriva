/**
 * Unified job submit helper — same pattern for every pipeline.
 *
 * Pattern (same for every pipeline):
 *   1. Auth (Clerk session)
 *   2. Ensure app user from Clerk
 *   3. Validate request body
 *   4. Check credit balance
 *   5. Deduct credits
 *   6. Insert job record to DB
 *   7. Call Python service
 *   8. On Python error: refund credits + rollback DB
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { getUserCreditBalance } from '@/libs/persistence/users/getUserCreditBalance';
import { refundUserCredits } from '@/libs/persistence/users/refundUserCredits';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { tryDeductUserCredits } from '@/libs/persistence/users/tryDeductUserCredits';

/* ── Pipeline adapters ──────────────────────────────────────── */

export type EnqueueResult = { job_id: string };

export type PipelineSubmitAdapter = {
  /** Insert job record into DB. Throw on failure. */
  insertJob: (params: {
    userId: string;
    jobId: string;
    creditCost: number;
    extraFields?: Record<string, unknown>;
  }) => Promise<unknown>;
  /** Call Python service to enqueue the job. Throw on failure. */
  enqueue: (params: {
    jobId: string;
    inputUrl: string;
    extraFields?: Record<string, unknown>;
  }) => Promise<EnqueueResult>;
  /** Delete job record from DB (for rollback). */
  deleteJob: (jobId: string) => Promise<void>;
  /** Credit cost for this pipeline. */
  creditCost: number;
};

export type SubmitOptions = {
  request: NextRequest;
  adapter: PipelineSubmitAdapter;
  /** Extra fields to pass to insertJob and enqueue. */
  extraFields?: Record<string, unknown>;
};

/**
 * Unified submit — same logic for every pipeline.
 *
 * Returns { authorized: false } when auth fails (caller sends 401).
 * On success returns { jobId } — caller sends 201/202.
 * On Python error returns { error: string } — caller sends 502.
 * @param options - The submit options including request and pipeline adapter
 */
export async function submitJob(
  options: SubmitOptions,
): Promise<
  { authorized: false } | { jobId: string } | { error: string; statusCode: 400 | 402 | 500 | 502 }
> {
  const { request, adapter, extraFields } = options;

  // 1. Auth
  const { userId } = await auth();
  if (!userId) {
    return { authorized: false };
  }

  // 2. Sync app user
  await ensureAppUserFromCurrentClerkUser();

  // 3. Validate body
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return { error: 'Invalid JSON body', statusCode: 400 };
  }

  if (!body || typeof body !== 'object') {
    return { error: 'Invalid body', statusCode: 400 };
  }

  // 4. Credit check
  const balance = await getUserCreditBalance(userId);
  if (balance < adapter.creditCost) {
    return {
      error: 'Insufficient credits',
      statusCode: 402,
    };
  }

  // 5. Deduct credits
  const deducted = await tryDeductUserCredits(userId, adapter.creditCost);
  if (!deducted) {
    return {
      error: 'Failed to deduct credits — try again',
      statusCode: 402,
    };
  }

  // 6. Generate job ID
  const jobId = crypto.randomUUID().replace(/-/g, '').slice(0, 24);

  // 7. Insert job to DB
  try {
    await adapter.insertJob({ userId, jobId, creditCost: adapter.creditCost, extraFields });
  } catch (err) {
    await refundUserCredits(userId, adapter.creditCost);
    const msg = err instanceof Error ? err.message : 'Failed to create job';
    return { error: msg, statusCode: 500 };
  }

  // 8. Call Python service
  try {
    await adapter.enqueue({
      jobId,
      inputUrl: (extraFields?.inputUrl as string) ?? '',
      extraFields,
    });
  } catch (err) {
    await refundUserCredits(userId, adapter.creditCost);
    await adapter.deleteJob(jobId);
    const msg = err instanceof Error ? err.message : 'Processing service unavailable';
    return { error: msg, statusCode: 502 };
  }

  return { jobId };
}
