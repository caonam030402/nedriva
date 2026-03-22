/**
 * GET /api/videos/:id/result
 *
 * Returns a pre-signed download URL for the enhanced video.
 * If the job is not yet done, returns 202 Accepted with current status.
 * If the job failed, returns 422 Unprocessable Entity.
 *
 * Auth: required (Clerk session)
 *
 * Query params:
 *   jobId?: string — if omitted, uses the most recent job
 *
 * Returns:
 *   200 { downloadUrl, expiresAt }          — job is done
 *   202 { status, progress, stageLabel }   — still processing
 *   401 { error: "Unauthorized" }
 *   404 { error: "Job not found" }
 *   422 { error: "Job failed", reason }    — job ended with failed status
 */
import { desc, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/core/DB';
import { getSignedResultUrl } from '@/libs/helpers/enhancer-video/storage';
import { enhancementJobs, EVideoJobStatus, videos } from '@/models/VideoEnhancementSchema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: videoId } = await params;
  const { searchParams } = req.nextUrl;
  const requestedJobId = searchParams.get('jobId');

  const [video] = await db
    .select({ id: videos.id, userId: videos.userId })
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);

  if (!video || video.userId !== userId) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  const jobRows = await db
    .select()
    .from(enhancementJobs)
    .where(eq(enhancementJobs.videoId, videoId))
    .orderBy(desc(enhancementJobs.createdAt))
    .limit(10);

  const raw = requestedJobId ? jobRows.find((j) => j.id === requestedJobId) : jobRows[0];

  if (!raw) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const job = raw as typeof raw & { outputUrl: string | null };

  if (job.status === EVideoJobStatus.QUEUED || job.status === EVideoJobStatus.PROCESSING) {
    return NextResponse.json(
      { status: job.status, progress: job.progress, stageLabel: job.stageLabel },
      { status: 202 },
    );
  }

  if (job.status === EVideoJobStatus.FAILED) {
    return NextResponse.json({ error: 'Job failed', reason: job.errorMessage }, { status: 422 });
  }

  const outputKey = job.outputUrl ?? '';
  if (!outputKey) {
    return NextResponse.json({ error: 'Output not available yet' }, { status: 422 });
  }

  const downloadUrl = await getSignedResultUrl(outputKey, 3600);
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

  return NextResponse.json({ downloadUrl, expiresAt });
}
