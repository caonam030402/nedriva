/**
 * POST /api/process
 *
 * Receives the image file + ops from the client, uploads the image to R2,
 * then enqueues a job in the Python service.
 *
 * Returns { jobId, queueItemId } immediately — client polls /api/jobs/[jobId].
 */

// Increase body size limit for this route handler (image uploads up to 50MB)
import type { NextRequest } from 'next/server';
import type { OpsState } from '@/types/enhancer';
import { Buffer } from 'node:buffer';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { calcEnhancerCreditsFromOps } from '@/libs/helpers/enhancer-image/calcCreditsFromOps';
import { insertEnhancerJobOnSubmit } from '@/libs/persistence/enhancer/enhancerProcessedRecords';
import { enqueueProcessing } from '@/libs/persistence/enhancer/processingClient';
import { getUserCreditBalance } from '@/libs/persistence/users/getUserCreditBalance';
import { refundUserCredits } from '@/libs/persistence/users/refundUserCredits';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { tryDeductUserCredits } from '@/libs/persistence/users/tryDeductUserCredits';

export const maxDuration = 60;

function parseOptionalPositiveInt(raw: FormDataEntryValue | null): number | null {
  if (raw == null || raw === '') {
    return null;
  }
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(req: NextRequest) {
  // Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureAppUserFromCurrentClerkUser();

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const queueItemId = formData.get('queueItemId') as string | null;
  const opsRaw = formData.get('ops') as string | null;

  if (!file || !queueItemId || !opsRaw) {
    return NextResponse.json({ error: 'Missing fields: file, queueItemId, ops' }, { status: 400 });
  }

  const ops: OpsState = JSON.parse(opsRaw);

  const inputWidth = parseOptionalPositiveInt(formData.get('inputWidth'));
  const inputHeight = parseOptionalPositiveInt(formData.get('inputHeight'));

  const creditCost = calcEnhancerCreditsFromOps(ops);
  const deducted = await tryDeductUserCredits(userId, creditCost);
  if (deducted == null) {
    const balance = await getUserCreditBalance(userId);
    return NextResponse.json(
      {
        error: 'Insufficient credits',
        required: creditCost,
        balance,
      },
      { status: 402 },
    );
  }

  try {
    // Upload the source image to R2 first so the Python service can download it
    const { imageUrl, inputStorageKey } = await uploadSourceImage(file, userId, queueItemId);

    // Enqueue job in Python service
    const result = await enqueueProcessing(imageUrl, queueItemId, ops);

    await insertEnhancerJobOnSubmit({
      userId,
      jobId: result.job_id,
      queueItemId,
      inputStorageKey,
      originalFilename: file.name,
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

async function uploadSourceImage(
  file: File,
  userId: string,
  itemId: string,
): Promise<{ imageUrl: string; inputStorageKey: string }> {
  // Upload to Cloudflare R2 via S3 SDK on server
  // TODO: replace with your actual bucket upload — this returns a public URL
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.STORAGE_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY ?? '',
      secretAccessKey: process.env.STORAGE_SECRET_KEY ?? '',
    },
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `inputs/${userId}/${itemId}/${file.name}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    }),
  );

  const base = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? '';
  return { imageUrl: `${base}/${key}`, inputStorageKey: key };
}
