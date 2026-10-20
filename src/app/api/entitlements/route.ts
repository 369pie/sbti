/**
 * GET /api/entitlements/?deviceId= — membership + this month's AI usage/caps.
 * Used by 「我」 member card, /member/, paywalls, and cap counters.
 */
import { NextRequest, NextResponse } from 'next/server';

import { loadFeatureUsage } from '@/lib/entitlements-server';
import { resolveMembership } from '@/lib/her/membership';
import { getAuthUser } from '@/lib/supabase/middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const deviceId = (req.nextUrl.searchParams.get('deviceId') || '').slice(0, 64) || null;
  const { user } = await getAuthUser();
  const claimed = !!user && !user.is_anonymous;
  const mem = await resolveMembership({ userId: claimed ? user!.id : null, deviceId });
  let usage: Awaited<ReturnType<typeof loadFeatureUsage>> = [];
  try {
    usage = await loadFeatureUsage(claimed ? user!.id : null, mem.isMember);
  } catch {
    usage = [];
  }
  return NextResponse.json(
    { ok: true, claimed, isMember: mem.isMember, expiresAt: mem.expiresAt, source: mem.source, usage },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
