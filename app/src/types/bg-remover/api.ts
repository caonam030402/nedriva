/**
 * Types for Background Remover API responses.
 */
import type { EBgRemovalStatus } from '@/enums/bg-remover';

export type BgRemovalUploadResponse = {
  fileKey: string;
  url: string;
};

export type BgRemovalCreateJobResponse = {
  jobId: string;
  status: EBgRemovalStatus;
};

export type BgRemovalJobStatusResponse = {
  jobId: string;
  status: EBgRemovalStatus;
  inputUrl: string | null;
  outputUrl: string | null;
  errorMessage: string | null;
  creditCost: number;
  queuedAt: string | null;
  processingStartedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};
