import type {
  EBgType,
  EMoreModel,
  EQueueStatus,
  EScaleFactor,
  ESizeMode,
  EUpscaleModel,
} from '@/enums/enhancer';

export type QueueItem = {
  id: string;
  file: File;
  preview: string;
  status: EQueueStatus;
  width?: number;
  height?: number;
  outputUrl?: string; // set when status === Done
  /** Actual pixel size of downloaded output (from server); UI should prefer over estimate */
  outputWidth?: number;
  outputHeight?: number;
  error?: string; // set when status === Error
};

export type OpsState = {
  upscaleEnabled: boolean;
  upscaleModel: EUpscaleModel;
  moreModel: EMoreModel;
  sizeMode: ESizeMode;
  scaleFactor: EScaleFactor;
  customWidth: number;
  customHeight: number;
  lightAIEnabled: boolean;
  lightAIIntensity: number;
  removeBgEnabled: boolean;
  bgType: EBgType;
  clipToObject: boolean;
};
