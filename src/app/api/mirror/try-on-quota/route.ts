/** GET /api/mirror/try-on-quota — peek freemium remaining for static try-on. */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { peekTryOnQuota, TRY_ON_FREE_CAP, isUnder18, loadBirthYearForUser } from '@/lib/mirror/try-on-quota';
import { withClaimedAuth } from '@/lib/supabase/with-auth';

export const dynamic = 'force-dynamic';

export const GET = withClaimedAuth(async (_req: NextRequest, _ctx, user: User) => {
  const quota = await peekTryOnQuota(user.id);
  const birthYear =
    (await loadBirthYearForUser(user.id)) ??
    (typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null);
  return NextResponse.json(
    {
      ok: true,
      cap: TRY_ON_FREE_CAP,
      ...quota,
      under18: isUnder18(birthYear),
      birthYearKnown: birthYear != null,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
});
