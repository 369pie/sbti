import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (_req: NextRequest, _ctx, user) => {
  const { data } = await createAdminSupabaseClient().from('her_profiles').select('email_daily').eq('user_id', user.id).maybeSingle();
  const email = user.email && !user.email.endsWith('@wtfti.local') ? user.email : null;
  return NextResponse.json({ on: !!data?.email_daily, hasEmail: !!email });
});

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  const { on } = (await req.json().catch(() => ({}))) as { on?: boolean };
  if (!user.email || user.email.endsWith('@wtfti.local')) {
    return NextResponse.json({ error: 'no_email' }, { status: 400 });
  }
  const { error } = await createAdminSupabaseClient().from('her_profiles').upsert(
    { user_id: user.id, email_daily: !!on, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  return NextResponse.json({ ok: true, on: !!on });
});
