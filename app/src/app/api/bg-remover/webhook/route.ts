/**
 * POST /api/bg-remover/webhook
 *
 * Called by the Python worker when background removal completes.
 * Updates the job status in the database.
 *
 * Body: JSON
 * {
 *   job_id: string,
 *   status: "done" | "failed",
 *   output_url?: string,
 *   error?: string,
 * }
 */
import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/libs/core/DB';
import { buildWebhookHandler } from '@/libs/persistence/processing/webhookHandler';
import { bgRemovalJobs } from '@/models/Schema';

const handler = buildWebhookHandler({
  updateDb: async ({ jobId, status, outputUrl, errorMessage }) => {
    await db
      .update(bgRemovalJobs)
      .set({
        status,
        outputUrl: outputUrl ?? null,
        errorMessage: errorMessage ?? null,
        completedAt: new Date(),
        processingStartedAt: new Date(),
      })
      .where(eq(bgRemovalJobs.id, jobId));
  },
});

export async function POST(req: NextRequest) {
  return handler(req);
}
