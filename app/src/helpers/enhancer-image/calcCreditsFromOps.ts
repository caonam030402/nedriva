import type { OpsState } from '@/types/enhancer-image/state';
import { EUpscaleModel } from '@/enums/enhancer-image';

/**
 * Credit cost for one enhancer run — **must match** UI (`calcCredits` in boost constants) and `POST /api/process`.
 * @param ops
 */
export function calcEnhancerCreditsFromOps(ops: OpsState): number {
  if (ops.upscaleEnabled && ops.upscaleModel === EUpscaleModel.TryAll) {
    return 3;
  }

  let c = 0;
  if (ops.upscaleEnabled) {
    c += 2;
  }
  if (ops.lightAIEnabled) {
    c += 1;
  }
  if (ops.removeBgEnabled) {
    c += 2;
  }
  return c;
}
