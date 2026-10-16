/**
 * Daily 「今日卡」email · GET /api/email/daily-dispatch
 * Refocus P0 §6.1. Cron once/day after push. Only her_profiles.email_daily = true.
 * DRY-RUN by default: real sends require EMAIL_DAILY_LIVE=1 AND RESEND_API_KEY.
 * `?dry=1` always forces dry-run.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://www.wtfti.com';

function authorized(req: NextRequest) {
  const expected = process.env.CRON_SECRET ?? process.env.PUSH_CRON_SECRET;
  if (!expected) return true;
  return (req.headers.get('authorization') ?? '') === `Bearer ${expected}`;
}

function render(token: string) {
  const today = `${SITE}/today/?utm_source=email&utm_medium=daily&utm_campaign=daily_card`;
  const unsub = `${SITE}/api/email/unsubscribe/?t=${token}`;
  const html = `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#FBF6EC;font-family:'Noto Sans SC',sans-serif;color:#4A3628;">
<div style="max-width:520px;margin:0 auto;background:#FFFDF8;border:1px solid #E8DCC8;border-radius:6px;padding:32px 28px;">
<p style="font-size:11px;letter-spacing:.32em;color:#8A7362;margin:0 0 12px;">WTFTI · 今日</p>
<h1 style="font-size:24px;margin:0 0 12px;">你的今日卡到了</h1>
<p style="font-size:15px;line-height:1.7;margin:0 0 24px;">今天的运势、穿搭色和一句妆容建议，都在这里。</p>
<a href="${today}" style="display:inline-block;background:#4A3628;color:#FFF8EC;padding:12px 24px;border-radius:999px;text-decoration:none;">看今天的卡</a>
<p style="font-size:12px;color:#8A7362;margin:28px 0 0;">不想再收到？<a href="${unsub}" style="color:#B45C47;">一键退订</a></p>
</div></body></html>`;
  const text = `你的今日卡到了\n${today}\n\n退订：${unsub}`;
  return { subject: '你的今日卡到了', html, text, unsub };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const apiKey = process.env.RESEND_API_KEY;
  const live = process.env.EMAIL_DAILY_LIVE === '1' && !!apiKey && req.nextUrl.searchParams.get('dry') !== '1';

  let admin: ReturnType<typeof createAdminSupabaseClient>;
  try { admin = createAdminSupabaseClient(); } catch {
    return NextResponse.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });
  }

  const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0);
  const { data: rows, error } = await admin
    .from('her_profiles')
    .select('user_id, email_unsub_token')
    .eq('email_daily', true)
    .or(`email_daily_last_sent_at.is.null,email_daily_last_sent_at.lt.${dayStart.toISOString()}`)
    .limit(200);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 502 });

  const summary = { mode: live ? 'live' : 'dry_run', candidates: rows?.length ?? 0, sent: 0, skipped_no_email: 0, failed: 0 };
  const from = process.env.WTFTI_DAILY_FROM ?? process.env.WTFTI_LETTER_FROM ?? 'WTFTI <hello@wtfti.com>';

  for (const row of rows ?? []) {
    const { data: u } = await admin.auth.admin.getUserById(row.user_id);
    const email = u?.user?.email;
    if (!email || email.endsWith('@wtfti.local')) { summary.skipped_no_email++; continue; }
    const msg = render(row.email_unsub_token);
    if (!live) { summary.sent++; continue; }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: email, subject: msg.subject, html: msg.html, text: msg.text,
        headers: { 'List-Unsubscribe': `<${msg.unsub}>` } }),
    });
    if (res.ok) {
      summary.sent++;
      await admin.from('her_profiles').update({ email_daily_last_sent_at: new Date().toISOString() }).eq('user_id', row.user_id);
    } else summary.failed++;
  }
  return NextResponse.json({ ok: true, ...summary });
}
