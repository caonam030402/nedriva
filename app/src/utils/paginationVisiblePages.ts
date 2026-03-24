/**
 * Page numbers to render with optional ellipsis (1-based).
 * @param currentPage
 * @param totalPages
 */
export function buildVisiblePageItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= 0) {
    return [];
  }
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  for (let d = -1; d <= 1; d++) {
    const p = currentPage + d;
    if (p >= 1 && p <= totalPages) {
      pages.add(p);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | 'ellipsis'> = [];

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]!;
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (p - prev > 1) {
        out.push('ellipsis');
      }
    }
    out.push(p);
  }

  return out;
}
