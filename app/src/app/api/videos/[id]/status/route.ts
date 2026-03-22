import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
/**
 * GET /api/videos/:id/status
 *
 * Returns the enhancement job status for a video.
 * Uses two sources:
 *   - Python service → live progress while status is 'processing'
 *   - DB            → authoritative final state (done / failed)
 *
 * Auth: required (Clerk session)
 *
 * Query params:
 *   jobId?: string — if omitted, returns the most recent job for this video
 *
 * Returns:
 *   200 { videoId, jobId, status, progress, stageLabel, options, ... }
 *   401 { error: "Unauthorized" }
 *   404 { error: "Job not found" }
 */
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/core/DB';
import { getVideoJobStatus } from '@/libs/video/videoProcessingClient';
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

  // For in-progress jobs, supplement DB data with live Python status
  if (job.status === EVideoJobStatus.PROCESSING || job.status === EVideoJobStatus.QUEUED) {
    try {
      const pythonStatus = await getVideoJobStatus(job.id);

      if (pythonStatus.status === 'done') {
        await db
          .update(enhancementJobs)
          .set({
            status: EVideoJobStatus.DONE,
            progress: 100,
            stageLabel: 'Done',
            outputUrl: pythonStatus.output_url,
            completedAt: new Date(),
          })
          .where(eq(enhancementJobs.id, job.id));

        return NextResponse.json({
          videoId,
          jobId: job.id,
          status: EVideoJobStatus.DONE,
          progress: 100,
          stageLabel: 'Done',
          outputUrl: pythonStatus.output_url ?? null,
          options: job.options,
          creditCost: job.creditCost,
          errorMessage: null,
          createdAt: job.createdAt?.toISOString(),
          queuedAt: job.queuedAt?.toISOString(),
          processingStartedAt: job.processingStartedAt?.toISOString(),
          completedAt: new Date().toISOString(),
        });
      }

      if (pythonStatus.status === 'failed') {
        await db
          .update(enhancementJobs)
          .set({
            status: EVideoJobStatus.FAILED,
            errorMessage: pythonStatus.error,
            completedAt: new Date(),
          })
          .where(eq(enhancementJobs.id, job.id));

        return NextResponse.json({
          videoId,
          jobId: job.id,
          status: EVideoJobStatus.FAILED,
          progress: job.progress,
          stageLabel: job.stageLabel,
          options: job.options,
          creditCost: job.creditCost,
          errorMessage: pythonStatus.error,
          createdAt: job.createdAt?.toISOString(),
          queuedAt: job.queuedAt?.toISOString(),
          processingStartedAt: job.processingStartedAt?.toISOString(),
          completedAt: new Date().toISOString(),
        });
      }

      // Still processing — merge live progress
      return NextResponse.json({
        videoId,
        jobId: job.id,
        status: pythonStatus.status,
        progress: pythonStatus.progress ?? job.progress,
        stageLabel: pythonStatus.stage_label ?? job.stageLabel,
        options: job.options,
        creditCost: job.creditCost,
        errorMessage: null,
        createdAt: job.createdAt?.toISOString(),
        queuedAt: job.queuedAt?.toISOString(),
        processingStartedAt: job.processingStartedAt?.toISOString(),
        completedAt: null,
      });
    } catch {
      // Python unreachable — fall back to DB state
    }
  }

  // Final states — DB is source of truth
  return NextResponse.json({
    videoId,
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    stageLabel: job.stageLabel,
    options: job.options,
    creditCost: job.creditCost,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt?.toISOString(),
    queuedAt: job.queuedAt?.toISOString(),
    processingStartedAt: job.processingStartedAt?.toISOString(),
    completedAt: job.completedAt?.toISOString(),
  });
}
