/**
 * Shared polling / retry constants across all processing pipelines
 * (image enhancer, video enhancer, bg-remover).
 */

/** Client-side poll interval (ms). */
export const JOB_POLL_INTERVAL_MS = 2000;

/** Max client-side polls before declaring timeout (960 × 2 s = 32 min — stays in sync with backend JOB_PIPELINE_TIMEOUT_S). */
export const JOB_MAX_POLLS = 960;
