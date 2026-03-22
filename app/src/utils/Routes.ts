/**
 * Centralized route constants for the entire app.
 *
 * Usage:
 *   import { Routes } from '@/utils/Routes';
 *   <Link href={Routes.dashboard.enhance} />
 *   router.push(Routes.auth.signIn);
 */

/* ── Public / marketing ──────────────────────────────────────── */

export const Routes = {
  /* Marketing pages */
  home: '/',
  pricing: '/pricing',
  blog: '/blog',
  about: '/about',
  /** Referral / partner landing (public). */
  affiliateProgram: '/affiliate-program',
  /** @deprecated Use `affiliateProgram` — kept for grep; route redirects. */
  affiliate: '/affiliate-program',
  changelog: '/changelog',

  /* Legal */
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',

  /* Auth */
  auth: {
    signIn: '/sign-in',
    signUp: '/sign-up',
  },

  /* Tool landing pages (public) */
  tools: {
    index: '/tools',
    upscaler: '/tools/upscaler',
    denoiser: '/tools/denoiser',
    sharpener: '/tools/sharpener',
    bgRemover: '/tools/bg-remover',
    restorer: '/tools/restorer',
    faceEnhancer: '/tools/face-enhancer',
  },

  /* API docs */
  apiBusiness: '/api-business',

  /* ── Private / authenticated ─────────────────────────────── */

  dashboard: {
    /** Root = Enhancer tool (default landing after sign-in) */
    index: '/boost',

    /* Core tools */
    enhance: '/boost', // same as index — Enhancer is the home tab
    generate: '/boost/generate',
    chat: '/boost/chat',
    video: '/boost/video',
    upscale: '/boost/upscale',

    /* Account & billing */
    invite: '/boost/invite',
    userProfile: '/boost/user-profile',

    /* History */
    history: '/boost/history',
  },
} as const;

/**
 * All private (auth-required) route prefixes.
 * Add a new entry here whenever a new protected page is created.
 *
 * Usage (runtime check):
 *   import { PRIVATE_ROUTES } from '@/utils/Routes';
 *   const isPrivate = PRIVATE_ROUTES.some(p => pathname.startsWith(p));
 */
export const PRIVATE_ROUTES = [
  Routes.dashboard.index,
  Routes.dashboard.generate,
  Routes.dashboard.chat,
  Routes.dashboard.video,
  Routes.dashboard.upscale,
  Routes.dashboard.invite,
  Routes.dashboard.userProfile,
  Routes.dashboard.history,
] as const;

/**
 * Clerk `createRouteMatcher` patterns derived from PRIVATE_ROUTES.
 * Each route gets a `(.*)` wildcard + a `/:locale` prefixed variant for i18n.
 *
 * Usage (in src/proxy.ts):
 *   import { PRIVATE_ROUTE_PATTERNS } from '@/utils/Routes';
 *   const isProtectedRoute = createRouteMatcher(PRIVATE_ROUTE_PATTERNS);
 */
export const PRIVATE_ROUTE_PATTERNS = PRIVATE_ROUTES.flatMap(r => [
  `${r}(.*)`,
  `/:locale${r}(.*)`,
]) as string[];

/**
 * Returns true when the given pathname belongs to a private (auth-required) route.
 * @param pathname - The current URL pathname.
 */
export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.some(p => pathname.startsWith(p));
}
