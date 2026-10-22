import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { queryXunhupayOrder, readXunhupayConfig } from '@/lib/payment/xunhupay';
import { reconcileMystiOrderFromProvider } from '@/lib/mysti/payment-reconcile';
import type { MystiOrderRow } from '@/lib/mysti/payment-store';
import { classifyXunhupayQuery } from '@/lib/payment/expire-classifier';

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

  // Order by updated_at so skipped rows (we bump updated_at) rotate to the back
  // and never block the queue; created_at is the tiebreak.
  const { data, error } = await db
    .from('mysti_orders')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .order('updated_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true })
    .limit(BATCH);
  if (error) return NextResponse.json({ error: 'query_failed' }, { status: 500 });

  const summary = { scanned: 0, paid: 0, failed: 0, expired: 0, skipped: 0, dry };
  const skipReasons: Record<string, number> = {};
  const now = () => new Date().toISOString();
  const skip = async (row: MystiOrderRow, reason: string) => {
    summary.skipped++;
    skipReasons[reason] = (skipReasons[reason] ?? 0) + 1;
    // Log only a short order-id suffix: no secrets / PII.
    console.log('[expire-pending] skip', String(row.trade_order_id).slice(-6), reason);
    if (!dry) {
      await db.from('mysti_orders').update({ updated_at: now() })
        .eq('trade_order_id', row.trade_order_id).eq('status', 'pending');
    }
  };

  for (const row of (data ?? []) as MystiOrderRow[]) {
    summary.scanned++;
    const cfg = readXunhupayConfig(row.channel);
    if (!cfg) { await skip(row, 'no_config'); continue; }
    let outcome: { status: string } | { error: string };
    try {
      const q = await queryXunhupayOrder(cfg, {
        tradeOrderId: row.trade_order_id,
        openOrderId: row.provider_order_id ?? undefined,
      });
      outcome = { status: q.status };
    } catch (e) {
      outcome = { error: e instanceof Error ? e.message : 'unknown' };
    }
    const { decision, reason } = classifyXunhupayQuery(outcome);
    if (decision === 'skip') { await skip(row, reason); continue; }
    if (decision === 'paid' || decision === 'failed') {
      if (dry) { if (decision === 'paid') summary.paid++; else summary.failed++; continue; }
      // Normal reconcile path: re-queries Xunhupay and only marks paid on OD.
      const next = await reconcileMystiOrderFromProvider(row);
      if (next.status === 'paid') summary.paid++;
      else if (next.status === 'failed') summary.failed++;
      else await skip(row, `reconcile_${next.status}`);
      continue;
    }
    if (!dry) {
      const { error: upErr } = await db
        .from('mysti_orders')
        .update({ status: 'expired', updated_at: now() })
        .eq('trade_order_id', row.trade_order_id)
        .eq('status', 'pending');
      if (upErr) { await skip(row, 'update_failed'); continue; }
    }
    summary.expired++;
  }
  console.log('[expire-pending] summary', JSON.stringify({ ...summary, skipReasons }));
  return NextResponse.json({ ...summary, skipReasons });
}
