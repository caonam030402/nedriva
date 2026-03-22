import type { Appearance } from '@clerk/types';
import { dark } from '@clerk/themes';

/**
 * Neutral dark surfaces for Clerk only — avoids purple-tinted navy (`#120f1e` / `#1c1830`)
 * that reads as “violet background” on checkout & modals.
 */
const BG = '#101012';
const SURFACE = '#161618';
const INPUT = '#1c1c1f';
const BORDER_SUBTLE = '1px solid rgba(255,255,255,0.08)';
const BORDER_INPUT = '1px solid rgba(255,255,255,0.12)';
/**
 * PricingTable feature checkmarks — `color` drives `stroke="currentColor"` on Clerk’s SVGs.
 * Do **not** set `fill: currentColor` here: those icons are stroke-based; forcing fill warps the path into solid wedges.
 */
const FEATURE_CHECK_SVG = {
  color: '#a78bfa',
} as const;

export const clerkAppearance: Appearance = {
  baseTheme: dark,
  cssLayerName: 'clerk',

  variables: {
    colorPrimary: '#8b5cf6',
    /** Modal/drawer scrim — neutral, not derived from purple `colorNeutral`. */
    colorModalBackdrop: '#030308',
    colorBackground: BG,
    colorInputBackground: INPUT,
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#a1a1b5',
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    colorTextOnPrimaryBackground: '#ffffff',
    /** Muted fills / hovers inside Clerk — neutral zinc, not blue-violet. */
    colorNeutral: SURFACE,
    fontFamily: 'inherit',
    fontSize: '0.9375rem',
    borderRadius: '0.75rem',
    spacingUnit: '1rem',
  },

  elements: {
    /* ── Card shell ─────────────────────────────── */
    card: {
      background: BG,
      border: BORDER_SUBTLE,
      boxShadow: '0 4px 32px rgba(0,0,0,0.55)',
      borderRadius: '1rem',
      padding: '2rem',
    },

    /* ── Header ─────────────────────────────────── */
    headerTitle: { color: '#ffffff', fontWeight: '700' },
    headerSubtitle: { color: '#a1a1b5' },

    /* ── Social OAuth buttons ───────────────────── */
    socialButtonsBlockButton: {
      background: INPUT,
      border: BORDER_INPUT,
      color: '#ffffff',
      transition: 'all 0.2s ease',
    },
    socialButtonsBlockButtonText: { color: '#ffffff', fontWeight: '500' },

    /* ── Divider ────────────────────────────────── */
    dividerLine: { background: 'rgba(255,255,255,0.08)' },
    dividerText: { color: '#6b6b80' },

    /* ── Form fields ────────────────────────────── */
    formFieldLabel: { color: '#a1a1b5', fontWeight: '500' },
    formFieldInput: {
      background: INPUT,
      border: BORDER_INPUT,
      color: '#ffffff',
      borderRadius: '0.625rem',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    formFieldInputShowPasswordButton: { color: '#6b6b80' },

    /* ── Primary submit (sign-in + Billing) */
    formButtonPrimary: {
      background: '#7c3aed',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 14px rgba(124, 58, 237, 0.35)',
      fontWeight: '600',
      letterSpacing: '0.01em',
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        background: '#6d28d9',
        boxShadow: '0 4px 18px rgba(124, 58, 237, 0.42)',
      },
    },

    /* ── Links ──────────────────────────────────── */
    footerActionText: { color: '#6b6b80' },
    footerActionLink: {
      color: '#a78bfa',
      fontWeight: '500',
    },
    footer: {
      background: 'rgba(10, 10, 12, 0.92)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0 0 1rem 1rem',
    },

    /* ── Identity preview (after email step) ────── */
    identityPreviewText: { color: '#ffffff' },
    identityPreviewEditButton: { color: '#a78bfa' },

    /* ── Alert / error box ──────────────────────── */
    alertText: { color: '#fca5a5' },
    formFieldErrorText: { color: '#fca5a5' },

    /* ── Checkbox ───────────────────────────────── */
    checkbox: { accentColor: '#8b5cf6' },

    /* ── Internal nav (multi-step) ──────────────── */
    navbar: { background: BG },
    navbarButton: { color: '#a1a1b5' },
    navbarButtonActive: { color: '#a78bfa' },

    /* ── Clerk Billing ─────────────────────────── */
    pricingTable: { color: '#e4e4e7' },
    pricingTableCard: {
      background: BG,
      border: BORDER_SUBTLE,
      color: '#f4f4f5',
    },
    pricingTableCardHeader: { color: '#ffffff' },
    pricingTableCardTitle: { color: '#ffffff' },
    pricingTableCardDescription: { color: '#a1a1b5' },
    pricingTableCardBody: {
      color: '#e4e4e7',
      '& ul li svg': FEATURE_CHECK_SVG,
      '& li svg': FEATURE_CHECK_SVG,
    },
    pricingTableCardFee: { color: '#ffffff' },
    pricingTableCardFeePeriod: { color: '#a1a1b5' },
    pricingTableCardFeePeriodNotice: { color: '#a1a1b5' },
    pricingTableCardFeatures: {
      color: '#e4e4e7',
      '& svg': FEATURE_CHECK_SVG,
    },
    pricingTableCardFeaturesList: {
      color: '#e4e4e7',
      '& svg': FEATURE_CHECK_SVG,
    },
    pricingTableCardFeaturesListItem: {
      color: '#d4d4d8',
      '& svg': FEATURE_CHECK_SVG,
    },
    pricingTableCardFeaturesListItemTitle: { color: '#f4f4f5' },
    pricingTableCardFeaturesListItemContent: {
      color: '#d4d4d8',
      '& svg': FEATURE_CHECK_SVG,
    },
    pricingTableCardStatus: { color: '#e4e4e7' },
    pricingTableCardFooter: { borderTop: '1px solid rgba(255,255,255,0.08)' },
    pricingTableCardFooterNotice: { color: '#a1a1b5' },
    pricingTableMatrix: { color: '#e4e4e7' },
    pricingTableMatrixTable: {
      color: '#e4e4e7',
      '& svg': FEATURE_CHECK_SVG,
      '& td svg': FEATURE_CHECK_SVG,
    },
    pricingTableMatrixRow: { color: '#e4e4e7' },
    pricingTableMatrixRowBody: {
      color: '#e4e4e7',
      '& svg': FEATURE_CHECK_SVG,
    },
    pricingTableMatrixCell: {
      color: '#d4d4d8',
      '& svg': FEATURE_CHECK_SVG,
    },
    pricingTableCardFooterButton: {
      background: '#7c3aed',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 12px rgba(124, 58, 237, 0.3)',
      fontWeight: '600',
      '&:hover': {
        background: '#6d28d9',
      },
    },

    /* Status chips — neutral gray (no purple wash on “Default”, trial, etc.) */
    badge: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e4e4e7',
      border: '1px solid rgba(255,255,255,0.12)',
      fontWeight: '600',
    },
    statementHeaderBadge: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e4e4e7',
      border: '1px solid rgba(255,255,255,0.12)',
    },
    paymentAttemptHeaderBadge: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e4e4e7',
      border: '1px solid rgba(255,255,255,0.12)',
    },
    planDetailBadge: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e4e4e7',
      border: '1px solid rgba(255,255,255,0.12)',
    },
    paymentMethodRowBadge: {
      background: 'rgba(255,255,255,0.08)',
      color: '#e4e4e7',
      border: '1px solid rgba(255,255,255,0.12)',
    },

    drawerBackdrop: {
      background: 'rgba(3, 3, 6, 0.78)',
      zIndex: 10000,
    },
    /* Full-bleed shell: no solid fill — only `drawerBackdrop` dims the page (avoids second black layer). */
    drawerRoot: {
      background: 'transparent',
      color: '#f4f4f5',
      zIndex: 10001,
    },
    drawerContent: {
      background: BG,
      color: '#f4f4f5',
      zIndex: 10001,
    },
    drawerHeader: {
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      color: '#ffffff',
    },
    drawerTitle: { color: '#ffffff' },
    drawerBody: { color: '#e4e4e7' },
    drawerFooter: {
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'transparent',
    },
    drawerFooterTitle: { color: '#ffffff' },
    drawerFooterDescription: { color: '#a1a1b5' },
    drawerClose: { color: '#a1a1b5' },

    drawerConfirmationBackdrop: {
      background: 'rgba(3, 3, 6, 0.78)',
      zIndex: 10000,
    },
    drawerConfirmationRoot: { background: 'transparent', color: '#f4f4f5', zIndex: 10001 },
    drawerConfirmationTitle: { color: '#ffffff' },
    drawerConfirmationDescription: { color: '#a1a1b5' },

    planDetailTitle: { color: '#ffffff' },
    planDetailDescription: { color: '#a1a1b5' },
    planDetailCaption: { color: '#a1a1b5' },
    planDetailFee: { color: '#ffffff' },
    planDetailFeePeriod: { color: '#a1a1b5' },
    planDetailFeePeriodNotice: { color: '#a1a1b5' },
    planDetailFeatures: {
      color: '#e4e4e7',
      '& svg': FEATURE_CHECK_SVG,
      '& ul li svg': FEATURE_CHECK_SVG,
    },
    planDetailFeaturesListItemTitle: { color: '#f4f4f5' },
    planDetailFeaturesListItemDescription: { color: '#d4d4d8' },
    planDetailFeaturesListItemContent: {
      color: '#d4d4d8',
      '& svg': FEATURE_CHECK_SVG,
    },

    checkoutFormLineItemsRoot: {
      color: '#e4e4e7',
      background: SURFACE,
      borderRadius: '1rem',
    },
    checkoutFormElementsRoot: {
      color: '#e4e4e7',
      background: SURFACE,
      borderRadius: '1rem',
    },
    checkoutSuccessTitle: { color: '#ffffff' },
    checkoutSuccessDescription: { color: '#a1a1b5' },

    statementHeaderTitle: { color: '#ffffff' },
    statementSectionHeaderTitle: { color: '#f4f4f5' },
    statementSectionContentDetailsListItemLabel: { color: '#a1a1b5' },
    statementSectionContentDetailsListItemValue: { color: '#f4f4f5' },
    statementFooterLabel: { color: '#a1a1b5' },
    statementFooterValue: { color: '#ffffff' },

    paymentAttemptHeaderTitle: { color: '#ffffff' },
    paymentAttemptBody: { color: '#e4e4e7' },
    paymentAttemptFooterLabel: { color: '#a1a1b5' },
    paymentAttemptFooterValue: { color: '#ffffff' },

    paymentMethodRow: {
      background: SURFACE,
      border: BORDER_SUBTLE,
    },
    paymentMethodRowText: { color: '#f4f4f5' },
    paymentMethodRowType: { color: '#a1a1b5' },
    paymentMethodRowValue: { color: '#e4e4e7' },

    popoverBox: {
      background: SURFACE,
      color: '#f4f4f5',
      border: BORDER_INPUT,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
      background: 'rgba(3, 3, 6, 0.78)',
      zIndex: 10000,
    },
    modalContent: {
      background: 'transparent',
      color: '#f4f4f5',
      zIndex: 10001,
    },
    modalCloseButton: { color: '#a1a1b5' },
  },
};
