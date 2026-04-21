import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { withAuth } from '@/lib/supabase/with-auth';
import { markInviteLoopbacksSeen } from '@/lib/cpti/invite-loopback-server';

export const POST = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  try {
    await markInviteLoopbacksSeen(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[cpti/invite-loopbacks seen POST] Failed:', error);
    return NextResponse.json({ error: 'Failed to mark invite notifications seen' }, { status: 500 });
  }
});