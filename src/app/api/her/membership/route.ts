/**
 * GET /api/her/membership — claimed-user membership status (her_profiles).
 * Used by /today · /mirror · PremiumPaywall (deep-report 8折).
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { loadHerMembership, MEMBER_TRY_ON_CAP } from '@/lib/her/membership';
import { withClaimedAuth } from '@/lib/supabase/with-auth';

export const dynamic = 'force-dynamic';

export const GET = withClaimedAuth(async (_req: NextRequest, _ctx, user: User) => {
  const status = await loadHerMembership(user.id);
  return NextResponse.json(
    {
      ok: true,
      ...status,
      priceLabel: '¥19/月',
      benefits: [
        '完整今日（穿搭示意 + 更细建议）',
        `美我换装每月 ${MEMBER_TRY_ON_CAP} 次免费额度`,
        '深度报告（含「我和他」）会员价 8 折',
      ],
      noAutoRenew: true,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
});
