import type { ReactNode } from 'react';

export type PressLogo = {
  name: string;
  svg: ReactNode;
};

/**
 * Logos for “As featured in” / trusted-by strips (marketing pages).
 * Text-based SVG placeholders — replace with brand assets when available.
 */
export const PRESS_LOGOS: PressLogo[] = [
  {
    name: 'Mashable',
    svg: (
      <svg viewBox="0 0 120 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Georgia, serif" fontSize="22" fontWeight="700">
          Mashable
        </text>
      </svg>
    ),
  },
  {
    name: 'The Next Web',
    svg: (
      <svg viewBox="0 0 48 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="900">
          TNW
        </text>
      </svg>
    ),
  },
  {
    name: 'TechCrunch',
    svg: (
      <svg viewBox="0 0 160 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">
          TechCrunch
        </text>
      </svg>
    ),
  },
  {
    name: 'Digital Trends',
    svg: (
      <svg viewBox="0 0 180 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700">
          Digital Trends
        </text>
      </svg>
    ),
  },
  {
    name: 'Product Hunt',
    svg: (
      <svg viewBox="0 0 160 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">
          Product Hunt
        </text>
      </svg>
    ),
  },
  {
    name: 'Wired',
    svg: (
      <svg viewBox="0 0 80 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Georgia, serif" fontSize="22" fontWeight="900">
          WIRED
        </text>
      </svg>
    ),
  },
  {
    name: 'The Verge',
    svg: (
      <svg viewBox="0 0 120 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">
          The Verge
        </text>
      </svg>
    ),
  },
  {
    name: 'VentureBeat',
    svg: (
      <svg viewBox="0 0 148 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">
          VentureBeat
        </text>
      </svg>
    ),
  },
];
