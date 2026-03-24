/** JSON body from GET `/api/jobs/[jobId]` (Python proxy) — snake_case matches the wire format. */
import { EEnhancerStatus } from '@/enums/enhancer-image';

export type EnhancerJobStatusBody = {
  status: EEnhancerStatus;
  output_url: string | null;
  outputs: string[] | null;
  output_width: number | null;
  output_height: number | null;
  error: string | null;
  processing_ms: number | null;
};
