/**
 * GET /api/her/membership — the ONE ¥19/月 membership status.
 * Claimed users: her_profiles. Any visitor: legacy 暮光通行证 on this device
 * (?deviceId=) is honored until expiry.
 */
import { NextRequest, NextResponse } from 'next/server';

import { MEMBERSHIP_BENEFITS, resolveMembership } from '@/lib/her/membership';
import { getAuthUser } from '@/lib/supabase/middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const deviceId = (req.nextUrl.searchParams.get('deviceId') || '').slice(0, 64) || null;
  const { user } = await getAuthUser();
  const claimed = !!user && !user.is_anonymous;
  const status = await resolveMembership({ userId: claimed ? user!.id : null, deviceId });
  return NextResponse.json(
    {
      ok: true,
      claimed,
      ...status,
      priceLabel: '¥19/月',
      benefits: MEMBERSHIP_BENEFITS,
      noAutoRenew: true,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
