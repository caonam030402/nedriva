/**
 * POST /api/enhancer-video/enhance
 *
 * 1. Validates credit balance + deducts credits
 * 2. Reads the video record (already uploaded by /api/enhancer-video/upload)
 * 3. Calls the Python video processing service
 * 4. Stores job in DB with queued status
 *
 * Auth: required (Clerk session)
 *
 * Body: JSON
 * {
 *   videoId: string,
 *   options: {
 *     upscaleFactor: "auto" | "2x" | "4x",
 *     denoise: boolean,
 *     deblur: boolean,
 *     faceEnhance: boolean,
 *     style: "cinematic" | "social" | "natural",
 *   }
 * }
 *
 * Returns:
 *   201 { jobId, videoId, status }
 *   400/401/402/404/502
 */
import type { NextRequest } from 'next/server';
import type { VideoEnhancementOptions } from '@/models/Schema';
import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { outputKey } from '@/helpers/enhancer-video/storage';
import { enqueueVideoProcessing } from '@/helpers/enhancer-video/videoProcessingClient';
import { db } from '@/libs/core/DB';
import { getUserCreditBalance } from '@/libs/persistence/users/getUserCreditBalance';
import { refundUserCredits } from '@/libs/persistence/users/refundUserCredits';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { tryDeductUserCredits } from '@/libs/persistence/users/tryDeductUserCredits';
import { EEnhancementStyle, EUpscaleLevel } from '@/enums/enhancer-video';
import {
  EEnhancementStyle as SchemaEnhancementStyle,
  enhancementJobs,
  EUpscaleFactor,
  EVideoJobStatus,
  userVideoUsage,
  videos,
} from '@/models/Schema';

const BASE_CREDIT_COST = 10;
const UPSCALE_4X_BONUS = 5;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureAppUserFromCurrentClerkUser();

  let body: { videoId: string; options: Partial<VideoEnhancementOptions> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { videoId, options } = body;

  if (!videoId || typeof videoId !== 'string') {
    return NextResponse.json({ error: 'Missing field: videoId' }, { status: 400 });
  }

  const VALID_UPSCALE = Object.values(EUpscaleFactor);
  const VALID_STYLE = Object.values(SchemaEnhancementStyle);

  const upscaleRaw = String(options?.upscaleFactor ?? 'auto');
  const styleRaw = String(options?.style ?? 'natural');

  if (!VALID_UPSCALE.includes(upscaleRaw as (typeof VALID_UPSCALE)[number])) {
    return NextResponse.json(
      { error: `Invalid upscaleFactor. Must be one of: ${VALID_UPSCALE.join(', ')}` },
      { status: 400 },
    );
  }
  if (!VALID_STYLE.includes(styleRaw as (typeof VALID_STYLE)[number])) {
    return NextResponse.json(
      { error: `Invalid style. Must be one of: ${VALID_STYLE.join(', ')}` },
      { status: 400 },
    );
  }

  const opts: VideoEnhancementOptions = {
    upscaleFactor: upscaleRaw as VideoEnhancementOptions['upscaleFactor'],
    denoise: Boolean(options?.denoise),
    deblur: Boolean(options?.deblur),
    faceEnhance: Boolean(options?.faceEnhance),
    style: styleRaw as VideoEnhancementOptions['style'],
  };

  const [video] = await db
    .select({ id: videos.id, userId: videos.userId, inputUrl: videos.inputUrl })
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);

  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  if (video.userId !== userId)
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  const creditCost = BASE_CREDIT_COST + (opts.upscaleFactor === '4x' ? UPSCALE_4X_BONUS : 0);
  const balance = await getUserCreditBalance(userId);
  if (balance < creditCost) {
    return NextResponse.json(
      { error: 'Insufficient credits', needed: creditCost, balance },
      { status: 402 },
    );
  }

  const deducted = await tryDeductUserCredits(userId, creditCost);
  if (!deducted) {
    return NextResponse.json({ error: 'Failed to deduct credits — try again' }, { status: 402 });
  }

  const jobId = randomUUID().replace(/-/g, '').slice(0, 24);
  const queuedAt = new Date();

  const [job] = await db
    .insert(enhancementJobs)
    .values({
      id: jobId,
      videoId,
      userId,
      options: opts,
      creditCost,
      status: EVideoJobStatus.QUEUED,
      progress: 0,
      queuedAt,
    })
    .returning();

  if (!job) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  await db.insert(userVideoUsage).values({
    id: randomUUID().replace(/-/g, '').slice(0, 24),
    userId,
    jobId,
    videoId,
    creditsUsed: creditCost,
  });

  const destKey = outputKey(userId, videoId, jobId);

  try {
    await enqueueVideoProcessing(jobId, video.inputUrl, destKey, {
      upscale_factor: opts.upscaleFactor as EUpscaleLevel,
      denoise: opts.denoise,
      deblur: opts.deblur,
      face_enhance: opts.faceEnhance,
      style: opts.style as EEnhancementStyle,
    });
  } catch (err) {
    await refundUserCredits(userId, creditCost);
    await db.delete(enhancementJobs).where(eq(enhancementJobs.id, jobId));
    const message = err instanceof Error ? err.message : 'Processing service unavailable';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ jobId: job.id, videoId, status: job.status }, { status: 201 });
}
