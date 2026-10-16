import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type SubscriptionBody = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

// Anonymous sessions are allowed: most users never register, and the reminder is what brings them back.
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  let body: SubscriptionBody;
  try {
    body = (await req.json()) as SubscriptionBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const auth = body.keys?.auth?.trim();
  if (!endpoint?.startsWith('https://') || !p256dh || !auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  const { error } = await createAdminSupabaseClient()
    .from('push_subscriptions')
    .upsert(
      { user_id: user.id, endpoint, p256dh, auth, user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null, failure_count: 0 },
      { onConflict: 'endpoint' },
    );
  if (error) {
    console.error('[api/push/subscribe] upsert failed', error.message);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
});

export const DELETE = withAuth(async (req: NextRequest, _ctx, user) => {
  const endpoint = ((await req.json().catch(() => ({}))) as SubscriptionBody).endpoint?.trim();
  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  await createAdminSupabaseClient().from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id);
  return NextResponse.json({ ok: true });
});
