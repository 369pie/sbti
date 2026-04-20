/**
 * Soul Letter Cron Dispatcher · GET /api/soulti/soul-letter/dispatch
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E6)
 *
 * Triggered by Vercel Cron (see vercel.json crons array). Runs once per
 * scheduled tick (recommended: every day at 21:30 local; we use 13:30 UTC
 * which corresponds to 21:30 China time).
 *
 * Pipeline:
 *   1. Read all active subscriptions
 *   2. Compute which letter kind is due (d1 / d3 / d7) per row
 *   3. Skip d3/d7 for rows lacking an unlock; instead send a short "preview"
 *      letter pointing to the unlock URL
 *   4. Render via LETTER_RENDERERS, send via Resend (if configured) else log
 *   5. Stamp the corresponding `dN_sent_at` column
 *
 * Auth: requires `Authorization: Bearer ${process.env.SOUL_LETTER_CRON_SECRET}`
 * unless invoked from Vercel Cron (Vercel sends the same header automatically).
 */

import { NextResponse, type NextRequest } from 'next/server';
import {
  LETTER_RENDERERS,
  type LetterKind,
  type LetterPayload,
  renderD3,
  renderD7,
} from '@/lib/soulti/letter-templates';

interface SubscriptionRow {
  id: string;
  email: string;
  slug: string;
  code: string | null;
  tear_rate_percent: number | null;
  opted_extended: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  d1_sent_at: string | null;
  d3_sent_at: string | null;
  d7_sent_at: string | null;
  failure_count: number;
}

interface UnlockRow {
  email: string;
  slug: string;
  expires_at: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dueKind(row: SubscriptionRow, now: Date): LetterKind | null {
  const sub = new Date(row.subscribed_at).getTime();
  const ageDays = (now.getTime() - sub) / DAY_MS;
  if (ageDays >= 7 && !row.d7_sent_at && row.opted_extended) return 'd7';
  if (ageDays >= 3 && !row.d3_sent_at && row.opted_extended) return 'd3';
  if (ageDays >= 1 && !row.d1_sent_at) return 'd1';
  return null;
}

async function isUnlocked(
  url: string,
  serviceKey: string,
  email: string,
  slug: string,
  now: Date,
): Promise<boolean> {
  const params = new URLSearchParams({
    select: 'email,slug,expires_at',
    email: `eq.${email}`,
    slug: `eq.${slug}`,
    limit: '5',
  });
  const res = await fetch(`${url}/rest/v1/soul_letter_unlocks?${params}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) return false;
  const rows = (await res.json().catch(() => [])) as UnlockRow[];
  return rows.some((r) => !r.expires_at || new Date(r.expires_at) > now);
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SOUL_LETTER_FROM ?? 'SoulTI <hello@wtfti.com>';

  if (!apiKey) {
    // Dev / preview mode — log only so we don't accidentally email anyone.
    console.info('[soul-letter/dispatch] would send', { to, subject, length: html.length });
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

function previewLetter(
  kind: 'd3' | 'd7',
  payload: LetterPayload,
  unlockUrl: string,
) {
  // Short, soft "this letter is waiting" mail when user hasn't unlocked yet.
  const which = kind === 'd3' ? '镜像信' : '修复信';
  const day = kind === 'd3' ? '第三天' : '第七天';
  const subject = `「${payload.slug}」· 你的${which}写好了`;
  const html = `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#FAF8F5;font-family:Georgia,'Noto Serif SC',serif;color:#2D2A26;">
  <div style="max-width:560px;margin:0 auto;background:#FDFCFA;border:1px solid rgba(139,115,85,0.18);border-radius:18px;padding:32px 28px;">
    <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8b7355;margin:0 0 18px;">SoulTI · Soul Letter · ${day}</p>
    <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">你的${which}已经写好了。</p>
    <p style="font-size:14px;line-height:2;margin:0 0 14px;">这一封比 D+1 那封更深，需要解锁后才能寄出来。</p>
    <p style="font-size:14px;line-height:2;margin:0 0 18px;">解锁后会立刻收到这一封 + 第七天那一封 + 一份只属于你这一型的修复处方。</p>
    <p style="margin:18px 0;"><a href="${unlockUrl}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#8b7355;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.08em;">¥19.9 · 解锁全部</a></p>
    <p style="font-size:12px;line-height:1.9;color:#7a6a5a;margin:18px 0 0;">不解锁也没关系。这一封我们会替你存着，30 天内随时可以取走。</p>
  </div></body></html>`;
  const text = `你的${which}已经写好了。解锁后会立刻寄到你邮箱。${unlockUrl}`;
  return { subject, html, text };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = process.env.SOUL_LETTER_CRON_SECRET ?? process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });
  }

  // Pull active subs subscribed >= 1 day ago.
  const cutoff = new Date(Date.now() - DAY_MS).toISOString();
  const params = new URLSearchParams({
    select:
      'id,email,slug,code,tear_rate_percent,opted_extended,subscribed_at,unsubscribed_at,d1_sent_at,d3_sent_at,d7_sent_at,failure_count',
    unsubscribed_at: 'is.null',
    subscribed_at: `lte.${cutoff}`,
    failure_count: 'lt.5',
    limit: '500',
  });
  const listRes = await fetch(`${url}/rest/v1/soul_letter_subscriptions?${params}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!listRes.ok) {
    return NextResponse.json(
      { ok: false, error: 'list_failed', status: listRes.status },
      { status: 502 },
    );
  }
  const rows = (await listRes.json()) as SubscriptionRow[];
  const now = new Date();

  const summary = { processed: 0, sent: 0, previews: 0, skipped: 0, failed: 0 };

  for (const row of rows) {
    summary.processed++;
    const kind = dueKind(row, now);
    if (!kind) {
      summary.skipped++;
      continue;
    }
    const payload: LetterPayload = {
      email: row.email,
      slug: row.slug,
      code: row.code ?? '',
      tearRatePercent: row.tear_rate_percent ?? undefined,
    };

    let subject: string;
    let html: string;
    let text: string;

    if (kind === 'd1') {
      const r = LETTER_RENDERERS.d1(payload);
      subject = r.subject;
      html = r.html;
      text = r.text;
    } else {
      const unlocked = await isUnlocked(url, serviceKey, row.email, row.slug, now);
      if (unlocked) {
        const r = (kind === 'd3' ? renderD3 : renderD7)(payload);
        subject = r.subject;
        html = r.html;
        text = r.text;
      } else {
        const unlockUrl = `https://www.wtfti.com/soulti/result/${row.slug}/?unlock=full-report&utm=letter-${kind}`;
        const p = previewLetter(kind, payload, unlockUrl);
        subject = p.subject;
        html = p.html;
        text = p.text;
        summary.previews++;
      }
    }

    const send = await sendEmail(row.email, subject, html, text);

    const stampField =
      kind === 'd1' ? 'd1_sent_at' : kind === 'd3' ? 'd3_sent_at' : 'd7_sent_at';

    const patch = send.ok
      ? { [stampField]: new Date().toISOString(), last_error: null }
      : {
          last_error: send.reason ?? 'unknown',
          failure_count: row.failure_count + 1,
        };

    const patchRes = await fetch(
      `${url}/rest/v1/soul_letter_subscriptions?id=eq.${row.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(patch),
      },
    );
    if (!patchRes.ok) {
      console.warn('[soul-letter/dispatch] stamp failed', row.id, patchRes.status);
    }
    if (send.ok) summary.sent++;
    else summary.failed++;
  }

  return NextResponse.json({ ok: true, summary });
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
