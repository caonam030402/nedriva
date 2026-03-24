/**
 * POST /api/bg-remover/create
 *
 * Create a background removal job.
 * 1. Validates input
 * 2. Deducts credits
 * 3. Creates job record (status: pending)
 * 4. Calls Python worker to process
 *
 * Auth: required (Clerk session)
 *
 * Body: JSON
 * {
 *   fileKey: string,  // R2 key from /api/bg-remover/upload-url
 * }
 *
 * Returns:
 *   201 { jobId, status }
 *   400 { error: "..." }
 *   401 { error: "Unauthorized" }
 *   402 { error: "Insufficient credits" }
 *   502 { error: "..." }  // Python service unavailable
 */
import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/core/DB';
import { enqueueBgRemovalProcessing } from '@/libs/persistence/bg-remover/processingClient';
import { getUserCreditBalance } from '@/libs/persistence/users/getUserCreditBalance';
import { refundUserCredits } from '@/libs/persistence/users/refundUserCredits';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { tryDeductUserCredits } from '@/libs/persistence/users/tryDeductUserCredits';
import { bgRemovalJobs, bgRemovalJobStatusEnum } from '@/models/Schema';

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureAppUserFromCurrentClerkUser();

  let body: { fileKey?: string };
  try {
    body = (await req.json()) as { fileKey?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { fileKey } = body;

  if (!fileKey || typeof fileKey !== 'string' || fileKey.trim() === '') {
    return NextResponse.json({ error: 'Missing field: fileKey' }, { status: 400 });
  }

  // ── Credit check ─────────────────────────────────────────────
  const balance = await getUserCreditBalance(userId);
  if (balance < CREDIT_COST) {
    return NextResponse.json(
      { error: 'Insufficient credits', required: CREDIT_COST, balance },
      { status: 402 },
    );
  }

  const deducted = await tryDeductUserCredits(userId, CREDIT_COST);
  if (!deducted) {
    return NextResponse.json(
      { error: 'Failed to deduct credits — try again' },
      { status: 402 },
    );
  }

  // Build the public URL from fileKey
  const baseUrl = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? '';
  const inputUrl = `${baseUrl}/${fileKey}`;

  const jobId = randomUUID().replace(/-/g, '').slice(0, 24);
  const queuedAt = new Date();

  // Create job record
  const [job] = await db
    .insert(bgRemovalJobs)
    .values({
      id: jobId,
      userId,
      inputKey: fileKey,
      inputUrl,
      creditCost: CREDIT_COST,
      status: bgRemovalJobStatusEnum.enumValues[0], // 'pending'
      queuedAt,
    })
    .returning();

  if (!job) {
    await refundUserCredits(userId, CREDIT_COST);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  // Call Python worker
  try {
    await enqueueBgRemovalProcessing(jobId, inputUrl);
  } catch (error) {
    // Rollback: refund credits + delete job
    await refundUserCredits(userId, CREDIT_COST);
    await db.delete(bgRemovalJobs).where(eq(bgRemovalJobs.id, jobId));
    const message = error instanceof Error ? error.message : 'Processing service unavailable';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 201 });
}
