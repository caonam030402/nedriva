import { EMoreModel, ESizeMode, EUpscaleModel } from '@/enums/enhancer-image';

const MORE_LABELS: Record<string, string> = {
  [EMoreModel.Balanced]: 'Balanced',
  [EMoreModel.Ultra]: 'Ultra',
  [EMoreModel.Strong]: 'Strong',
  [EMoreModel.DigiArt]: 'DigiArt',
  [EMoreModel.Magic]: 'Magic',
};

/**
 * Short label for history cards — mirrors main Enhancer model names (English product terms).
 * @param ops - Snapshot from `enhancer_processed_images.ops` (JSON object).
 */
export function formatEnhancerOpsSummary(ops: Record<string, unknown> | null | undefined): string {
  if (ops == null || typeof ops !== 'object') {
    return 'Enhanced';
  }

  const upscale = ops.upscaleModel;
  const more = ops.moreModel;
  const scale = ops.scaleFactor;

  const u = typeof upscale === 'string' ? upscale : '';
  if (u === EUpscaleModel.OldPhoto) {
    return 'Old photo';
  }
  if (u === EUpscaleModel.Prime) {
    return 'Prime';
  }
  if (u === EUpscaleModel.Gentle) {
    return 'Gentle';
  }
  if (u === EUpscaleModel.TryAll) {
    return 'Try all';
  }
  if (u === EUpscaleModel.More) {
    const m = typeof more === 'string' ? more : EMoreModel.Balanced;
    const moreLabel = MORE_LABELS[m] ?? m;
    const s = typeof scale === 'number' && Number.isFinite(scale) ? scale : 4;
    return `${moreLabel} x${s}`;
  }

  return 'Enhanced';
}

/**
 * Effective upscale scale factor from stored `ops` (for output size estimates in the queue table).
 * @param fallback - Used when ops missing or upscale off (e.g. current panel scale).
 */
export function scaleFactorFromStoredOps(
  ops: Record<string, unknown> | null | undefined,
  fallback: number,
): number {
  if (ops == null || typeof ops !== 'object') {
    return fallback;
  }
  if (ops.upscaleEnabled === false) {
    return 1;
  }
  if (
    ops.sizeMode === ESizeMode.Scale &&
    typeof ops.scaleFactor === 'number' &&
    Number.isFinite(ops.scaleFactor)
  ) {
    return ops.scaleFactor;
  }
  return 4;
}
