/**
 * HERMOSA · 她说·沙龙｜Whisper 双盲投递
 *
 * POST /api/hermosa/whisper
 * body: { talent_id, sender_email, sender_handle?, brief, budget_band? }
 *
 * 流程：
 *   1. 取出 talent（必须 published & !flagged & is_open_to_collab & contact_email 非空）
 *   2. 限频：同一 client_hash 1h ≤ 3 次；同一 (client_hash, talent_id) 24h ≤ 1 次
 *   3. 软过滤 brief 关键词；命中 => flagged，不发送，但仍记录
 *   4. 通过 Resend 发邮件：to = talent.contact_email（不出现在响应里）
 *      reply_to = sender_email（项目方真实邮箱）
 *   5. 写入 hermosa_whispers（不存正文）
 *
 * 双盲：
 *   - 项目方永远不知道 talent 的邮箱（只知道结果 "已投递"）
 *   - talent 收到邮件后可以直接 reply → 走到 sender_email
 *   - 任何一方拉黑：talent 把档案下线 / 项目方靠常规邮件操作
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BRIEF = 280;
const MAX_HANDLE = 24;
const MAX_EMAIL = 120;
const RATE_HOURLY = 3;
const VALID_BUDGETS = new Set(['free', '<1k', '1k-5k', '5k-20k', '20k+', 'flex']);

function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

function sanitizeOneLine(input: unknown, max: number): string {
  if (typeof input !== 'string') return '';
  return input.replace(/\s+/g, ' ').trim().slice(0, max);
}

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function shouldFlagBrief(text: string): boolean {
  return /https?:\/\/|t\.me\/|wechat|微信号|加我私聊|wxid_|telegram/i.test(text);
}

function tryAdmin() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface PostBody {
  talent_id?: unknown;
  sender_email?: unknown;
  sender_handle?: unknown;
  brief?: unknown;
  budget_band?: unknown;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const talentId = typeof body.talent_id === 'string' ? body.talent_id.slice(0, 64) : '';
  const senderEmailRaw = sanitizeOneLine(body.sender_email, MAX_EMAIL);
  const senderHandle = sanitizeOneLine(body.sender_handle, MAX_HANDLE) || null;
  const brief = sanitizeOneLine(body.brief, MAX_BRIEF);
  const budgetRaw =
    typeof body.budget_band === 'string' ? body.budget_band.trim().toLowerCase() : '';
  const budget = VALID_BUDGETS.has(budgetRaw) ? budgetRaw : null;

  if (!talentId) {
    return NextResponse.json({ ok: false, error: 'missing_talent' }, { status: 400 });
  }
  if (!isLikelyEmail(senderEmailRaw)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }
  if (!brief) {
    return NextResponse.json({ ok: false, error: 'empty_brief' }, { status: 400 });
  }

  const admin = tryAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }

  const cHash = clientHash(req);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // 限频：1h 全局 ≤ 3
  const { count: recentCount } = await admin
    .from('hermosa_whispers')
    .select('id', { count: 'exact', head: true })
    .eq('client_hash', cHash)
    .gte('created_at', oneHourAgo);
  if ((recentCount ?? 0) >= RATE_HOURLY) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  // 限频：24h 同 talent ≤ 1
  const { count: dupCount } = await admin
    .from('hermosa_whispers')
    .select('id', { count: 'exact', head: true })
    .eq('client_hash', cHash)
    .eq('talent_id', talentId)
    .gte('created_at', oneDayAgo);
  if ((dupCount ?? 0) >= 1) {
    return NextResponse.json({ ok: false, error: 'duplicate_recent' }, { status: 429 });
  }

  // 取 talent
  const { data: talent, error: talentErr } = await admin
    .from('hermosa_talents')
    .select('id,handle,pitch,contact_email,is_open_to_collab,is_published,flagged')
    .eq('id', talentId)
    .maybeSingle();
  if (talentErr || !talent) {
    return NextResponse.json({ ok: false, error: 'talent_not_found' }, { status: 404 });
  }
  const t = talent as {
    id: string;
    handle: string;
    pitch: string;
    contact_email: string | null;
    is_open_to_collab: boolean;
    is_published: boolean;
    flagged: boolean;
  };
  if (!t.is_published || t.flagged || !t.is_open_to_collab) {
    return NextResponse.json({ ok: false, error: 'talent_unavailable' }, { status: 410 });
  }
  if (!t.contact_email) {
    return NextResponse.json({ ok: false, error: 'no_contact_channel' }, { status: 410 });
  }

  const flagged = shouldFlagBrief(brief);

  // 投递
  let delivered = false;
  let deliverError: string | null = null;

  if (!flagged) {
    const result = await sendWhisperEmail({
      to: t.contact_email,
      replyTo: senderEmailRaw,
      talentHandle: t.handle,
      senderHandle,
      brief,
      budget,
    });
    delivered = result.ok;
    deliverError = result.ok ? null : result.reason ?? 'unknown';
  } else {
    deliverError = 'flagged_pre_send';
  }

  // 审计写入（不存正文）
  await admin.from('hermosa_whispers').insert({
    talent_id: t.id,
    sender_email: senderEmailRaw,
    sender_handle: senderHandle,
    brief_len: brief.length,
    budget_band: budget,
    client_hash: cHash,
    delivered,
    deliver_error: deliverError,
    flagged,
  });

  if (flagged) {
    return NextResponse.json({ ok: false, error: 'flagged' }, { status: 422 });
  }
  if (!delivered) {
    return NextResponse.json({ ok: false, error: deliverError ?? 'deliver_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

interface SendArgs {
  to: string;
  replyTo: string;
  talentHandle: string;
  senderHandle: string | null;
  brief: string;
  budget: string | null;
}

async function sendWhisperEmail(
  args: SendArgs,
): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.HERMOSA_WHISPER_FROM ?? 'Her Voice · Whisper <hello@wtfti.com>';

  const subject = `「她说·沙龙」有人想找你聊一个项目 · ${args.talentHandle}`;
  const senderLabel = args.senderHandle ? `${args.senderHandle}（${args.replyTo}）` : args.replyTo;
  const budgetLine = args.budget ? `预算意向：${escapeHtml(args.budget)}` : '预算意向：未填';

  const text = [
    '你好，',
    '',
    `有项目方通过「她说·沙龙」找到了你的接单档案（${args.talentHandle}）。`,
    '',
    '一句话需求：',
    args.brief,
    '',
    budgetLine,
    `回复方：${senderLabel}`,
    '',
    '直接回复这封邮件即可联系到对方。',
    '如果不感兴趣，忽略即可；',
    '想从公开名录隐身：到「我的她说档案」把"接单档案"切到 ◯ 暂停接单。',
    '',
    '— Her Voice · 她说·沙龙',
  ].join('\n');

  const html = `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#F5F0E8;font-family:Georgia,'Noto Serif SC',serif;color:#1A1530;">
  <div style="max-width:560px;margin:0 auto;background:#FAF7F2;border-top:3px solid #1A1530;border-bottom:1px solid rgba(26,21,48,0.14);padding:32px 28px;">
    <p style="font-family:ui-monospace,'SF Mono',monospace;font-size:10px;letter-spacing:0.42em;text-transform:uppercase;color:#C0512F;margin:0 0 18px;">§ 她说·沙龙 · WHISPER</p>
    <p style="font-style:italic;font-size:24px;line-height:1.25;margin:0 0 18px;">有人想找你聊一个项目</p>
    <div style="width:48px;height:2px;background:#C0512F;margin:0 0 22px;"></div>

    <p style="font-size:15px;line-height:1.85;margin:0 0 18px;">
      项目方通过沙龙公开名录找到了你的接单档案
      （<strong>${escapeHtml(args.talentHandle)}</strong>）。
    </p>

    <div style="border-left:3px solid #C0512F;padding:6px 0 6px 16px;margin:18px 0;">
      <p style="font-style:italic;font-size:17px;line-height:1.6;margin:0;">「${escapeHtml(args.brief)}」</p>
    </div>

    <dl style="margin:22px 0 0;padding:14px 0 0;border-top:1px dotted rgba(26,21,48,0.14);">
      <div style="display:flex;gap:12px;padding:6px 0;">
        <dt style="font-family:ui-monospace,'SF Mono',monospace;font-size:10px;letter-spacing:0.32em;color:#8A817A;text-transform:uppercase;width:96px;">REPLY TO</dt>
        <dd style="margin:0;font-size:14px;font-style:italic;">${escapeHtml(senderLabel)}</dd>
      </div>
      <div style="display:flex;gap:12px;padding:6px 0;">
        <dt style="font-family:ui-monospace,'SF Mono',monospace;font-size:10px;letter-spacing:0.32em;color:#8A817A;text-transform:uppercase;width:96px;">BUDGET</dt>
        <dd style="margin:0;font-size:14px;font-style:italic;">${args.budget ? escapeHtml(args.budget) : '未填'}</dd>
      </div>
    </dl>

    <p style="font-size:14px;line-height:1.85;margin:24px 0 0;color:#1A1530;opacity:0.78;">
      直接回复这封邮件即可联系到对方 —— 我们不在中间留痕。
      如果不感兴趣，忽略即可；想从公开名录隐身，把档案切到 ◯ 暂停接单。
    </p>

    <p style="font-family:ui-monospace,'SF Mono',monospace;font-size:10px;letter-spacing:0.42em;color:#8A817A;margin:32px 0 0;text-transform:uppercase;">— Her Voice · 她说·沙龙</p>
  </div>
</body></html>`;

  if (!apiKey) {
    console.info('[hermosa.whisper] would send', {
      to: args.to,
      replyTo: args.replyTo,
      subject,
      briefLen: args.brief.length,
    });
    return { ok: true, reason: 'noop_no_resend' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: args.to,
      reply_to: args.replyTo,
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, reason: `resend_${res.status}_${body.slice(0, 120)}` };
  }
  return { ok: true };
}
