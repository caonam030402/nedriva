import type { Appearance } from '@clerk/types';
import { dark } from '@clerk/themes';

/**
 * Tokens mirror design tokens in `src/styles/global.css` (`@theme` block and `:root`).
 * Keep hex values in sync when the design system changes.
 */
const PAGE = '#000000';
const ELEVATED = '#141414';
const INPUT_BG = '#2d333f';
const BORDER_SUBTLE = '1px solid rgba(255,255,255,0.08)';
const BORDER_INPUT = '1px solid rgba(255,255,255,0.1)';
const BORDER_CARD = '1px solid rgba(232, 197, 71, 0.14)';
const BRAND = '#e8c547';
const BRAND_HOVER = '#f5d978';
const TEXT = '#ffffff';
const TEXT_SECONDARY = '#a3a3a3';
const TEXT_SUBTLE = '#737373';
const INVERSE = '#0a0a0a';
const SHADOW_CARD = '0 8px 32px rgb(0 0 0 / 0.55)';
const SHADOW_CTA = '0 4px 28px rgb(232 197 71 / 0.45)';
/**
 * PricingTable feature checkmarks — `color` drives `stroke="currentColor"` on Clerk’s SVGs.
 * Do **not** set `fill: currentColor` here: those icons are stroke-based; forcing fill warps the path into solid wedges.
 */
const FEATURE_CHECK_SVG = {
  color: BRAND,
} as const;

export const clerkAppearance: Appearance = {
  baseTheme: dark,
  /** Omit `cssLayerName`: HeroUI re-imports Tailwind layers and can break layered Clerk CSS on auth pages. */

  variables: {
    colorPrimary: BRAND,
    colorModalBackdrop: '#030308',
    colorBackground: PAGE,
    colorInputBackground: INPUT_BG,
    colorInputText: TEXT,
    colorText: TEXT,
    colorTextSecondary: TEXT_SECONDARY,
    colorDanger: '#ef4444',
    colorSuccess: '#22c55e',
    colorTextOnPrimaryBackground: INVERSE,
    colorNeutral: ELEVATED,
    fontFamily: 'inherit',
    fontSize: '0.9375rem',
    borderRadius: '0.75rem',
    spacingUnit: '1rem',
  },

  elements: {
    rootBox: {
      width: '100%',
    },

    /* ── Card shell (elevated panel on pure black page) ─ */
    card: {
      background: ELEVATED,
      border: BORDER_CARD,
      boxShadow: SHADOW_CARD,
      borderRadius: '1rem',
      padding: '2rem',
    },

    headerTitle: { color: TEXT, fontWeight: '700' },
    headerSubtitle: { color: TEXT_SECONDARY },

    socialButtonsBlockButton: {
      background: INPUT_BG,
      border: BORDER_INPUT,
      color: TEXT,
      borderRadius: '0.625rem',
      transition: 'border-color 0.2s ease, background-color 0.2s ease',
      '&:hover': {
        background: '#343b4a',
        borderColor: 'rgba(232, 197, 71, 0.22)',
      },
    },
    socialButtonsBlockButtonText: { color: TEXT, fontWeight: '500' },

    dividerLine: { background: 'rgba(255,255,255,0.08)' },
    dividerText: { color: TEXT_SUBTLE },

    formFieldLabel: { color: TEXT_SECONDARY, fontWeight: '500' },
    formFieldInput: {
      background: INPUT_BG,
      border: BORDER_INPUT,
      color: TEXT,
      borderRadius: '0.625rem',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '&:focus': {
        borderColor: 'rgba(232, 197, 71, 0.45)',
        boxShadow: '0 0 0 2px rgba(232, 197, 71, 0.2)',
      },
    },
    formFieldInputShowPasswordButton: { color: TEXT_SUBTLE },

    formButtonPrimary: {
      background: BRAND,
      color: INVERSE,
      border: 'none',
      borderRadius: '9999px',
      minHeight: '2.75rem',
      boxShadow: SHADOW_CTA,
      fontWeight: '600',
      letterSpacing: '0.02em',
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        background: BRAND_HOVER,
        boxShadow: '0 6px 32px rgb(232 197 71 / 0.5)',
      },
    },

    footerActionText: { color: TEXT_SUBTLE },
    footerActionLink: {
      color: BRAND_HOVER,
      fontWeight: '600',
    },
    footer: {
      background: `linear-gradient(180deg, rgba(20,20,20,0.98) 0%, rgba(0,0,0,0.96) 100%),
        repeating-linear-gradient(
          -18deg,
          transparent,
          transparent 5px,
          rgba(232, 197, 71, 0.03) 5px,
          rgba(232, 197, 71, 0.03) 6px
        )`,
      borderTop: '1px solid rgba(232, 197, 71, 0.1)',
      borderRadius: '0 0 1rem 1rem',
    },

    identityPreviewText: { color: TEXT },
    identityPreviewEditButton: { color: BRAND_HOVER },

    alertText: { color: '#fca5a5' },
    formFieldErrorText: { color: '#fca5a5' },

    checkbox: { accentColor: BRAND },

    navbar: { background: ELEVATED },
    navbarButton: { color: TEXT_SECONDARY },
    navbarButtonActive: { color: BRAND_HOVER },

    /* ── Clerk Billing ─────────────────────────── */
    pricingTable: { color: '#e4e4e7' },
    pricingTableCard: {
      background: ELEVATED,
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
      background: BRAND,
      color: INVERSE,
      border: 'none',
      boxShadow: SHADOW_CTA,
      fontWeight: '600',
      '&:hover': {
        background: BRAND_HOVER,
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
      background: ELEVATED,
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
      background: ELEVATED,
      borderRadius: '1rem',
    },
    checkoutFormElementsRoot: {
      color: '#e4e4e7',
      background: ELEVATED,
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
      background: ELEVATED,
      border: BORDER_SUBTLE,
    },
    paymentMethodRowText: { color: '#f4f4f5' },
    paymentMethodRowType: { color: '#a1a1b5' },
    paymentMethodRowValue: { color: '#e4e4e7' },

    popoverBox: {
      background: ELEVATED,
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
