'use client';

/* ═══════════════════════════════════════════════════════════════
   Common — Shared UI primitives used across ALL pages.
   Design tokens live in src/styles/global.css.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Marketing Primitives ───────────────────────────────────── */
export { Badge } from '@/components/common/Badge';
export type { BadgeVariant } from '@/components/common/Badge';
export { BrandLogo } from '@/components/common/BrandLogo';
/** @deprecated Use `Button` from `@/components/ui/Button` instead */
export { Button as CommonButton } from '@/components/ui/Button';
export { GradientText } from '@/components/common/GradientText';
export { MediaCard } from '@/components/common/MediaCard';
export { SectionHeader } from '@/components/common/SectionHeader';
export { TagPill } from '@/components/common/TagPill';
