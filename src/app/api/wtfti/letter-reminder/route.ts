/**
 * POST /api/wtfti/letter-reminder
 * 封缄信件后订阅「到期拆信邮件提醒」（Phase B · 触达通道第一优先场景）。
 *
 * Auth: withAuth（匿名会话即可）。信件归属先经用户态 RLS 校验，
 * 再以 service role 写入 reminders 表（该表无 RLS 策略，同 soul_letter_subscriptions）。
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/supabase/with-auth';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  let body: { letterId?: unknown; email?: unknown };
  try {
    body = (await req.json()) as { letterId?: unknown; email?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const letterId =
    typeof body.letterId === 'string' && body.letterId.trim() ? body.letterId.trim().slice(0, 64) : '';
  const email =
    typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase().slice(0, 120) : '';
  if (!letterId || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }

  // 信件归属校验（用户态 client，RLS 只放行本人的信）
  const supabase = await createServerSupabaseClient();
  const { data: letter, error: letterError } = await supabase
    .from('wtfti_letters')
    .select('id, due_at')
    .eq('user_id', user.id)
    .eq('id', letterId)
    .maybeSingle();

  if (letterError) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  }
  if (!letter) {
    return NextResponse.json({ error: 'letter_not_found' }, { status: 404 });
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from('wtfti_letter_reminders').upsert(
    {
      letter_id: letterId,
      user_id: user.id,
      email,
      due_at: letter.due_at,
      cancelled: false,
    },
    { onConflict: 'letter_id' },
  );

  if (error) {
    return NextResponse.json({ error: 'reminder_store_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, dueAt: letter.due_at });
});
