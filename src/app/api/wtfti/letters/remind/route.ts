/**
 * Letter Reminder Cron · GET /api/wtfti/letters/remind
 *
 * Phase B 触达通道（调研文档 §4.3）：D30 星尘信到期邮件提醒。
 * Vercel Cron 每日一次（vercel.json，22:45 北京时间）。
 *
 * Pipeline:
 *   1. 取起到期（due_at <= now，14 天内）且未发送、未取消、失败 < 5 次的提醒
 *   2. 校验信件仍存在且未拆封（已拆/已删 → 静默消费 / 取消）
 *   3. Resend 发信（未配置 RESEND_API_KEY 时仅打日志，dev 安全）
 *   4. 盖 sent_at 或 failure_count++
 *
 * Auth: Authorization: Bearer ${WTFTI_LETTER_CRON_SECRET ?? SOUL_LETTER_CRON_SECRET ?? CRON_SECRET}
 */

import { NextResponse, type NextRequest } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ReminderRow {
  id: string;
  letter_id: string;
  email: string;
  due_at: string;
  failure_count: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const LETTERS_URL = 'https://www.wtfti.com/wtfti/letters/?utm_source=letter-reminder&utm_medium=email';

async function sendEmail(to: string): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WTFTI_LETTER_FROM ?? 'WTFTI <hello@wtfti.com>';

  const subject = '你 30 天前封缄的信，今天可以拆了 ✦';
  const html = `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#14102A;font-family:Georgia,'Noto Serif SC',serif;color:#F5F0E8;">
  <div style="max-width:560px;margin:0 auto;background:#1A1530;border:1px solid rgba(201,166,118,0.35);border-radius:18px;padding:36px 30px;">
    <p style="font-size:10px;letter-spacing:0.42em;text-transform:uppercase;color:#C9A676;margin:0 0 22px;">✦ WTFTI · Stardust Letters</p>
    <p style="font-size:17px;line-height:1.8;margin:0 0 14px;">30 天前的你，把一封信封上金色的火漆，指定在今天交还。</p>
    <p style="font-size:14px;line-height:2;color:rgba(245,240,232,0.75);margin:0 0 14px;">它一直替你记着那一刻的心事。现在，到期了。</p>
    <p style="margin:22px 0;"><a href="${LETTERS_URL}" style="display:inline-block;padding:13px 26px;border-radius:999px;background:linear-gradient(120deg,#C07A8E,#C9A676);color:#1A1530;text-decoration:none;font-size:13.5px;font-weight:600;letter-spacing:0.08em;">回神域拆信 →</a></p>
    <p style="font-size:12px;line-height:1.9;color:rgba(245,240,232,0.45);margin:18px 0 0;">拆开后，也可以再封一封新的——写给下一个月的自己。</p>
  </div></body></html>`;
  const text = `30 天前你封缄的一封信今天到期了。回神域拆信：${LETTERS_URL}`;

  if (!apiKey) {
    // Dev / preview mode — log only so we don't accidentally email anyone.
    console.info('[letter-reminder] would send', { to, subject });
    return { ok: true, reason: 'noop_no_resend' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, reason: `resend_${res.status}_${body.slice(0, 120)}` };
  }
  return { ok: true };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const expected =
    process.env.WTFTI_LETTER_CRON_SECRET ??
    process.env.SOUL_LETTER_CRON_SECRET ??
    process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let admin: ReturnType<typeof createAdminSupabaseClient>;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return NextResponse.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });
  }

  const now = new Date();
  const floor = new Date(now.getTime() - 14 * DAY_MS).toISOString();

  const { data: reminders, error } = await admin
    .from('wtfti_letter_reminders')
    .select('id, letter_id, email, due_at, failure_count')
    .is('sent_at', null)
    .eq('cancelled', false)
    .lt('failure_count', 5)
    .lte('due_at', now.toISOString())
    .gte('due_at', floor)
    .order('due_at', { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: false, error: `list_failed: ${error.message}` }, { status: 502 });
  }

  const summary = { processed: 0, sent: 0, consumed: 0, cancelled: 0, failed: 0 };

  for (const reminder of (reminders ?? []) as ReminderRow[]) {
    summary.processed++;

    // 信件仍存在且未拆封才发信
    const { data: letter } = await admin
      .from('wtfti_letters')
      .select('id, opened')
      .eq('id', reminder.letter_id)
      .maybeSingle();

    if (!letter) {
      // 信件已删除（跨端删除传播）→ 取消提醒
      await admin.from('wtfti_letter_reminders').update({ cancelled: true }).eq('id', reminder.id);
      summary.cancelled++;
      continue;
    }
    if (letter.opened) {
      // 用户已主动拆过 → 静默消费，不再打扰
      await admin
        .from('wtfti_letter_reminders')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', reminder.id);
      summary.consumed++;
      continue;
    }

    const send = await sendEmail(reminder.email);
    const patch = send.ok
      ? { sent_at: new Date().toISOString(), last_error: null }
      : { last_error: send.reason ?? 'unknown', failure_count: reminder.failure_count + 1 };
    const { error: patchError } = await admin.from('wtfti_letter_reminders').update(patch).eq('id', reminder.id);
    if (patchError) {
      console.warn('[letter-reminder] stamp failed', reminder.id, patchError.message);
    }
    if (send.ok) summary.sent++;
    else summary.failed++;
  }

  return NextResponse.json({ ok: true, summary });
}
