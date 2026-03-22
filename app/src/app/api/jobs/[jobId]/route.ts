/**
 * GET /api/jobs/[jobId]
 *
 * Proxy to the Python service — client polls this endpoint to check job status.
 * Keeps the Python service URL and API key server-side.
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateEnhancerJobFromPoll } from '@/libs/persistence/enhancer/enhancerProcessedRecords';
import { getJobStatus } from '@/libs/persistence/enhancer/processingClient';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await params;

  try {
    const data = await getJobStatus(jobId);
    if (data.status === 'done' || data.status === 'error') {
      await updateEnhancerJobFromPoll({
        userId,
        jobId,
        status: data.status,
        output_url: data.output_url,
        outputs: data.outputs,
        output_width: data.output_width,
        output_height: data.output_height,
        error: data.error,
        processing_ms: data.processing_ms,
      });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
