import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

/**
 * Public GET endpoints that never depend on the signed-in user.
 * Skipping `updateSession` here removes a redundant Supabase auth roundtrip
 * (the route handler still creates its own anon client when needed).
 */
const PUBLIC_GET_PREFIXES = [
  '/api/cpti/leaderboards',
  '/api/cpti/profiles',
  '/api/creator/leaderboard',
  '/api/creator/universes', // list / detail GET; mutations are POST/PATCH and still hit auth
  '/api/identify/preview',
  '/api/mysti/subscription', // GET-only fetch of public plan info
];

function isPublicGet(request: NextRequest): boolean {
  if (request.method !== 'GET') return false;
  const { pathname } = request.nextUrl;
  return PUBLIC_GET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Endpoints that should never trigger a Supabase session refresh, regardless
 * of HTTP method. RUM beacons fire from every page; running `updateSession`
 * for each one doubles the roundtrip count to us-east-1 for no benefit.
 */
const SESSION_BYPASS_PREFIXES = [
  '/api/perf/report',
];

function isSessionBypass(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return SESSION_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  if (isPublicGet(request) || isSessionBypass(request)) {
    return NextResponse.next({ request });
  }
  return updateSession(request);
}

export const config = {
  // Skip Next internals, static assets, and any non-mutating read paths.
  // We keep API routes inside the matcher so that POST/PATCH/DELETE still
  // refresh the auth cookie via updateSession.
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon\\.ico|favicon\\.svg|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
