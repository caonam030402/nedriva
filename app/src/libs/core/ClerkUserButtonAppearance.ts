import type { Appearance } from '@clerk/types';

const actionHover = {
  color: '#ffffff',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
} as const;

/**
 * Shared `UserButton` popover — default Clerk hover used a dark-on-dark combo with our `color` override; explicit hover keeps label + icon readable.
 */
export const clerkUserButtonPopoverElements = {
  userButtonPopoverCard: {
    background: '#120f1e',
    border: '1px solid rgba(139,92,246,0.2)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  userButtonPopoverActionButton: {
    color: '#d4d4d8',
    backgroundColor: 'transparent',
    '&:hover': actionHover,
    '&:focus-visible': actionHover,
  },
  userButtonPopoverActionButtonText: {
    color: 'inherit',
    '&:hover': { color: '#ffffff' },
  },
  userButtonPopoverActionButtonIcon: {
    color: '#a1a1b5',
    '&:hover': { color: '#ffffff' },
  },
  userButtonPopoverFooter: {
    display: 'none',
  },
} as const satisfies Appearance['elements'];
