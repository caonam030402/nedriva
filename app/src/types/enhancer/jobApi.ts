/** JSON body from GET `/api/jobs/[jobId]` (Python proxy) — snake_case matches the wire format. */
export type EnhancerJobStatusBody = {
  status: 'queued' | 'processing' | 'done' | 'error';
  output_url: string | null;
  outputs: string[] | null;
  output_width: number | null;
  output_height: number | null;
  error: string | null;
  processing_ms: number | null;
};
