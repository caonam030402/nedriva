import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { API_BASE_PATH, API_WEBHOOKS_PREFIX } from '@/constants/apiRoutes';
import arcjet from '@/libs/core/Arcjet';
import { routing } from '@/libs/i18n/I18nRouting';
import { PRIVATE_ROUTE_PATTERNS } from './utils/Routes';

const handleI18nRouting = createMiddleware(routing);

// Patterns are generated from PRIVATE_ROUTE_PATTERNS in src/utils/Routes.ts.
// Add new private pages there — no changes needed here.
const isProtectedRoute = createRouteMatcher(PRIVATE_ROUTE_PATTERNS);

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
]);

const isApiRoute = createRouteMatcher([`${API_BASE_PATH}/(.*)`]);

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent,
) {
  // Inbound webhooks (Clerk Svix, custom secrets) — must not be blocked by bot protection
  if (request.nextUrl.pathname.startsWith(API_WEBHOOKS_PREFIX)) {
    return NextResponse.next();
  }

  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // API routes: run Clerk for auth context, skip i18n entirely
  if (isApiRoute(request)) {
    return clerkMiddleware(async (_auth, _req) => {
      return NextResponse.next();
    })(request, event);
  }

  // Auth pages and protected pages: run Clerk + i18n
  if (isAuthPage(request) || isProtectedRoute(request)) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale = req.nextUrl.pathname.match(/(\/.*)\/boost/)?.at(1) ?? '';

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      return handleI18nRouting(req);
    })(request, event);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};
