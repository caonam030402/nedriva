/**
 * GET /api/enhancer-image/jobs/[jobId]
 *
 * Returns job status for the image enhancer pipeline.
 * Pattern: on every poll, call Python → sync DB → return status.
 * Keeps the Python service URL and API key server-side.
 *
 * Auth: required (Clerk session)
 */
import type { NextRequest } from 'next/server';
import type { PythonStatus } from '@/libs/persistence/processing/syncJobStatus';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';

import { NextResponse } from 'next/server';
import { db } from '@/libs/core/DB';
import { getJobStatus } from '@/libs/persistence/enhancer-image/processingClient';
import { syncJobStatus } from '@/libs/persistence/processing/syncJobStatus';
import { enhancerProcessedImages } from '@/models/Schema';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await params;

  // 1. Read job from DB (verify ownership)
  const [row] = await db
    .select({
      id: enhancerProcessedImages.jobId,
      userId: enhancerProcessedImages.userId,
      status: enhancerProcessedImages.status,
      outputUrl: enhancerProcessedImages.outputUrl,
      outputUrls: enhancerProcessedImages.outputUrls,
      outputWidth: enhancerProcessedImages.outputWidth,
      outputHeight: enhancerProcessedImages.outputHeight,
      errorMessage: enhancerProcessedImages.errorMessage,
      processingMs: enhancerProcessedImages.processingMs,
      creditCost: enhancerProcessedImages.creditCost,
      createdAt: enhancerProcessedImages.createdAt,
      updatedAt: enhancerProcessedImages.updatedAt,
    })
    .from(enhancerProcessedImages)
    .where(
      and(eq(enhancerProcessedImages.jobId, jobId), eq(enhancerProcessedImages.userId, userId)),
    )
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // 2. Sync with Python → DB → return
  try {
    const result = await syncJobStatus(
      {
        id: row.id,
        userId: row.userId,
        status: row.status,
        outputUrl: row.outputUrl,
        errorMessage: row.errorMessage,
        creditCost: row.creditCost,
        createdAt: row.createdAt,
      },
      {
        fetchPythonStatus: async (id) => {
          const data = await getJobStatus(id);
          return data as PythonStatus;
        },
        updateDb: async ({ jobId: jid, pythonStatus }) => {
          const isFinal = pythonStatus.status === 'done' || pythonStatus.status === 'error';
          if (!isFinal) return;

          await db
            .update(enhancerProcessedImages)
            .set({
              status: pythonStatus.status === 'done' ? 'done' : 'error',
              outputUrl: pythonStatus.output_url ?? null,
              outputUrls: pythonStatus.outputs ?? null,
              outputWidth: pythonStatus.output_width ?? null,
              outputHeight: pythonStatus.output_height ?? null,
              errorMessage: pythonStatus.error ?? null,
              processingMs: pythonStatus.processing_ms ?? null,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(enhancerProcessedImages.jobId, jid),
                eq(enhancerProcessedImages.userId, userId),
              ),
            );
        },
      },
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
