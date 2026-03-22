import type { EnhancerHistoryItem } from '@/types/enhancer/historyApi';
import type { EnhancerRunItem } from '@/types/enhancer/runsApi';

/** Strip run-only fields for history / result modal payloads. */
export function enhancerRunToHistoryItem(run: EnhancerRunItem): EnhancerHistoryItem {
  const {
    status: _status,
    errorMessage: _errorMessage,
    effectiveScaleFactor: _effectiveScaleFactor,
    ...history
  } = run;
  return history;
}
