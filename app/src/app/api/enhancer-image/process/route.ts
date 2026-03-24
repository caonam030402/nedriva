/**
 * POST /api/enhancer-image/process
 *
 * Receives { fileKey, queueItemId, ops } from the client.
 * FE already uploaded the image to R2 (via shared useUploadToR2 hook).
 * This route only: validates, deducts credits, enqueues Python job.
 *
 * Auth: required (Clerk session)
 *
 * Body: JSON
 * {
 *   fileKey:        string,  // R2 key, e.g. "inputs/{userId}/{queueItemId}/photo.png"
 *   queueItemId:    string,
 *   ops:            OpsState,
 *   inputWidth?:    number,
 *   inputHeight?:   number,
 *   originalFilename?: string,
 * }
 *
 * Returns: 202 { jobId, queueItemId }
 *         400 { error: "..." }
 *         401 { error: "Unauthorized" }
 *         402 { error: "Insufficient credits" }
 *         502 { error: "..." }
 */
import type { NextRequest } from 'next/server';
import type { OpsState } from '@/types/enhancer-image/state';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { calcEnhancerCreditsFromOps } from '@/helpers/enhancer-image/calcCreditsFromOps';
import { insertEnhancerJobOnSubmit } from '@/libs/persistence/enhancer-image/enhancerProcessedRecords';
import { enqueueProcessing } from '@/libs/persistence/enhancer-image/processingClient';
import { getUserCreditBalance } from '@/libs/persistence/users/getUserCreditBalance';
import { refundUserCredits } from '@/libs/persistence/users/refundUserCredits';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { tryDeductUserCredits } from '@/libs/persistence/users/tryDeductUserCredits';
import { publicUrl } from '@/libs/storage/imageStorage';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureAppUserFromCurrentClerkUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const fileKey =
    typeof b.fileKey === 'string' && b.fileKey.trim() !== ''
      ? b.fileKey.trim()
      : null;
  const queueItemId =
    typeof b.queueItemId === 'string' && b.queueItemId.trim() !== ''
      ? b.queueItemId.trim()
      : null;
  const opsRaw = b.ops;
  const inputWidth =
    typeof b.inputWidth === 'number' && b.inputWidth > 0 ? b.inputWidth : null;
  const inputHeight =
    typeof b.inputHeight === 'number' && b.inputHeight > 0 ? b.inputHeight : null;
  const originalFilename =
    typeof b.originalFilename === 'string' ? b.originalFilename : undefined;

  if (!fileKey || !queueItemId || !opsRaw) {
    return NextResponse.json(
      { error: 'Missing fields: fileKey, queueItemId, ops' },
      { status: 400 },
    );
  }

  if (typeof opsRaw !== 'object' || opsRaw === null || Array.isArray(opsRaw)) {
    return NextResponse.json({ error: 'Invalid ops' }, { status: 400 });
  }

  const ops = opsRaw as OpsState;
  const imageUrl = publicUrl(fileKey);

  const creditCost = calcEnhancerCreditsFromOps(ops);
  const deducted = await tryDeductUserCredits(userId, creditCost);

  if (deducted == null) {
    const balance = await getUserCreditBalance(userId);
    return NextResponse.json(
      { error: 'Insufficient credits', required: creditCost, balance },
      { status: 402 },
    );
  }

  try {
    const result = await enqueueProcessing(imageUrl, queueItemId, ops);

    await insertEnhancerJobOnSubmit({
      userId,
      jobId: result.job_id,
      queueItemId,
      inputStorageKey: fileKey,
      originalFilename: originalFilename ?? fileKey,
      inputWidth,
      inputHeight,
      ops,
      creditCost,
    });

    return NextResponse.json({ jobId: result.job_id, queueItemId }, { status: 202 });
  } catch (error) {
    await refundUserCredits(userId, creditCost);
    const message = error instanceof Error ? error.message : 'Processing failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
