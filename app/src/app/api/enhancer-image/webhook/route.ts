import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/libs/core/DB';
import { buildWebhookHandler } from '@/libs/persistence/processing/webhookHandler';
import { enhancerProcessedImages } from '@/models/Schema';

/**
 * Map webhook status (done/failed) → DB status (done/error).
 * @param s - The webhook status value (done | failed)
 */
function mapWebhookStatusToDb(s: 'done' | 'failed'): 'done' | 'error' {
  return s === 'done' ? 'done' : 'error';
}

const handler = buildWebhookHandler({
  updateDb: async ({
    jobId,
    status,
    outputUrl,
    errorMessage,
    processingMs,
    outputs,
    outputWidth,
    outputHeight,
  }) => {
    await db
      .update(enhancerProcessedImages)
      .set({
        status: mapWebhookStatusToDb(status),
        outputUrl: outputUrl ?? null,
        outputUrls: outputs ?? null,
        outputWidth: outputWidth ?? null,
        outputHeight: outputHeight ?? null,
        errorMessage: errorMessage ?? null,
        processingMs: processingMs ?? null,
        updatedAt: new Date(),
      })
      .where(eq(enhancerProcessedImages.jobId, jobId));
  },
});

export async function POST(req: NextRequest) {
  return handler(req);
}
