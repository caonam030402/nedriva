import type { EnhancerHistoryItem } from '@/types/enhancer-image/historyApi';
import type { EnhancerRunItem } from '@/types/enhancer-image/runsApi';

/**
 * Strip run-only fields for history / result modal payloads.
 * @param run
 */
export function enhancerRunToHistoryItem(run: EnhancerRunItem): EnhancerHistoryItem {
  const {
    status: _status,
    errorMessage: _errorMessage,
    effectiveScaleFactor: _effectiveScaleFactor,
    ...history
  } = run;
  return history;
}
