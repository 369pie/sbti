/**
 * Daily 「今日卡」Web Push dispatcher · GET /api/push/dispatch
 *
 * Refocus P0 §6.1 / §7. Vercel Cron once per day (see vercel.json).
 * Sends at most one notification per subscription per calendar day (UTC date
 * via last_sent_at). Auth: Bearer CRON_SECRET (or VAPID-adjacent cron secrets).
 */

import { NextResponse, type NextRequest } from 'next/server';
import webpush from 'web-push';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type PushRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  failure_count: number;
};

function cronAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? '';
  const expected =
    process.env.PUSH_CRON_SECRET ??
    process.env.WTFTI_LETTER_CRON_SECRET ??
    process.env.SOUL_LETTER_CRON_SECRET ??
    process.env.CRON_SECRET;
  // If no secret is configured (local preview), allow — same pattern as letter remind.
  if (!expected) return true;
  return auth === `Bearer ${expected}`;
}

function configureVapid(): { ok: true } | { ok: false; reason: string } {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:hello@wtfti.com';
  if (!publicKey || !privateKey) {
    return { ok: false, reason: 'vapid_not_configured' };
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { ok: true };
}

export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const vapid = configureVapid();
  if (!vapid.ok) {
    return NextResponse.json({ ok: false, error: vapid.reason }, { status: 503 });
  }

  let admin: ReturnType<typeof createAdminSupabaseClient>;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return NextResponse.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });
  }

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, failure_count')
    .lt('failure_count', 5)
    .or(`last_sent_at.is.null,last_sent_at.lt.${dayStart.toISOString()}`)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: false, error: `list_failed: ${error.message}` }, { status: 502 });
  }

  const payload = JSON.stringify({
    title: '你的今日卡到了',
    body: '今天的运势、穿搭色和一句妆容建议，都在这里。',
    url: '/today/?utm_source=push&utm_medium=webpush&utm_campaign=daily_card',
  });

  const summary = { processed: 0, sent: 0, gone: 0, failed: 0 };

  for (const row of (rows ?? []) as PushRow[]) {
    summary.processed += 1;
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload,
        { TTL: 60 * 60 * 12, urgency: 'normal' },
      );
      await admin
        .from('push_subscriptions')
        .update({ last_sent_at: new Date().toISOString(), failure_count: 0 })
        .eq('id', row.id);
      summary.sent += 1;
    } catch (err) {
      const statusCode =
        err && typeof err === 'object' && 'statusCode' in err
          ? Number((err as { statusCode?: number }).statusCode)
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('id', row.id);
        summary.gone += 1;
      } else {
        await admin
          .from('push_subscriptions')
          .update({ failure_count: row.failure_count + 1 })
          .eq('id', row.id);
        summary.failed += 1;
        console.error('[api/push/dispatch] send failed', statusCode || err);
      }
    }
  }

  return NextResponse.json({ ok: true, ...summary });
}
