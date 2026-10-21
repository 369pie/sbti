import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { queryXunhupayOrder, readXunhupayConfig } from '@/lib/payment/xunhupay';
import { reconcileMystiOrderFromProvider } from '@/lib/mysti/payment-reconcile';
import type { MystiOrderRow } from '@/lib/mysti/payment-store';

/**
 * Daily cron: close mysti_orders stuck in `pending` for > 24h.
 *  - Xunhupay says paid (OD)     → reconcile marks paid (normal entitlement path).
 *  - Xunhupay says cancelled (CD) → reconcile marks failed.
 *  - Xunhupay answers any other status (e.g. WP, unpaid) → mark `expired`.
 *  - Query errors / missing config → leave untouched (never guess).
 * Never marks paid without Xunhupay confirmation. `?dry=1` reports without writing.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH = 40;

function authorized(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false; // fail closed: this route writes order status
  return (req.headers.get('authorization') ?? '') === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const dry = req.nextUrl.searchParams.get('dry') === '1';
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const db = createAdminSupabaseClient();

  const { data, error } = await db
    .from('mysti_orders')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(BATCH);
  if (error) return NextResponse.json({ error: 'query_failed' }, { status: 500 });

  const summary = { scanned: 0, paid: 0, failed: 0, expired: 0, skipped: 0, dry };
  for (const row of (data ?? []) as MystiOrderRow[]) {
    summary.scanned++;
    const cfg = readXunhupayConfig(row.channel);
    if (!cfg) { summary.skipped++; continue; }
    let status: string;
    try {
      const q = await queryXunhupayOrder(cfg, {
        tradeOrderId: row.trade_order_id,
        openOrderId: row.provider_order_id ?? undefined,
      });
      status = q.status;
    } catch {
      summary.skipped++;
      continue;
    }
    if (status === 'OD' || status === 'CD') {
      if (!dry) {
        const next = await reconcileMystiOrderFromProvider(row);
        if (next.status === 'paid') summary.paid++;
        else if (next.status === 'failed') summary.failed++;
        else summary.skipped++;
      } else if (status === 'OD') summary.paid++;
      else summary.failed++;
      continue;
    }
    if (!dry) {
      const { error: upErr } = await db
        .from('mysti_orders')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('trade_order_id', row.trade_order_id)
        .eq('status', 'pending');
      if (upErr) { summary.skipped++; continue; }
    }
    summary.expired++;
  }
  return NextResponse.json(summary);
}
