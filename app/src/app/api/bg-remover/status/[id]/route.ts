/**
 * GET /api/bg-remover/status/[id]
 *
 * Get background removal job status.
 * Reads from DB — webhook or Python worker updates the DB row.
 *
 * Auth: required (Clerk session)
 *
 * Returns:
 *   200 { jobId, status, outputUrl, errorMessage, creditCost, ... }
 *   401 { error: "Unauthorized" }
 *   404 { error: "Job not found" }
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/core/DB';
import { bgRemovalJobs } from '@/models/Schema';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [job] = await db
    .select({
      id: bgRemovalJobs.id,
      status: bgRemovalJobs.status,
      inputUrl: bgRemovalJobs.inputUrl,
      outputUrl: bgRemovalJobs.outputUrl,
      errorMessage: bgRemovalJobs.errorMessage,
      creditCost: bgRemovalJobs.creditCost,
      queuedAt: bgRemovalJobs.queuedAt,
      processingStartedAt: bgRemovalJobs.processingStartedAt,
      completedAt: bgRemovalJobs.completedAt,
      createdAt: bgRemovalJobs.createdAt,
    })
    .from(bgRemovalJobs)
    .where(and(eq(bgRemovalJobs.id, id), eq(bgRemovalJobs.userId, userId)))
    .limit(1);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    inputUrl: job.inputUrl,
    outputUrl: job.outputUrl,
    errorMessage: job.errorMessage,
    creditCost: job.creditCost,
    queuedAt: job.queuedAt,
    processingStartedAt: job.processingStartedAt,
    completedAt: job.completedAt,
    createdAt: job.createdAt,
  });
}
