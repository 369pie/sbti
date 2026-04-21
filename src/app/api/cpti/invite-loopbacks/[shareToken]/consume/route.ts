import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { consumeInviteLoopback } from '@/lib/cpti/invite-loopback-server';

export const POST = withAuth(async (
  _req: NextRequest,
  context: { params: Promise<Record<string, string>> },
  user,
) => {
  const { shareToken } = await context.params as { shareToken?: string };
  if (!shareToken) {
    return NextResponse.json({ error: 'share_token_required' }, { status: 400 });
  }

  try {
    const result = await consumeInviteLoopback({
      shareToken,
      openedByUserId: user.id,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[cpti/invite-loopbacks consume POST] Failed:', error);
    return NextResponse.json({ error: 'Failed to consume invite link' }, { status: 500 });
  }
});