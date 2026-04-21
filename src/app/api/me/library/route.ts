import { NextRequest, NextResponse } from 'next/server';
import { withClaimedAuth } from '@/lib/supabase/with-auth';
import { getMyLibrary } from '@/lib/me/library';

export const dynamic = 'force-dynamic';

export const GET = withClaimedAuth(async (_req: NextRequest, _ctx, user) => {
  const payload = await getMyLibrary(user.id);
  return NextResponse.json(payload);
});
