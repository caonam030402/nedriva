/** Backend DB status for background remover — aligns with `bgRemovalJobStatusEnum` in Schema */
export enum EBgRemovalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}
