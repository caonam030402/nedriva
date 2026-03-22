/** JSON body from POST `/api/process` (multipart) — successful enqueue response. */
export type SubmitEnhancerProcessResponse = {
  jobId: string;
  queueItemId: string;
};
