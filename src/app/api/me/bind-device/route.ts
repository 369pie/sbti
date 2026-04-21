import { NextRequest, NextResponse } from 'next/server';
import { withClaimedAuth } from '@/lib/supabase/with-auth';
import { bindDeviceToUser } from '@/lib/xpti/couple-server';

export const dynamic = 'force-dynamic';

export const POST = withClaimedAuth(async (req: NextRequest, _ctx, user) => {
  let body: { deviceId?: string };
  try {
    body = (await req.json()) as { deviceId?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const deviceId = body.deviceId?.trim();
  if (!deviceId) {
    return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
  }
  const { backfilled } = await bindDeviceToUser(deviceId, user.id);
  return NextResponse.json({ ok: true, backfilled });
});
