/**
 * /api/admin/funnel/route.ts
 * ─────────────────────────────────────────────────────────────
 * Admin-only read of `product_events` to compute light-paywall
 * funnel conversion (W4 plan C2).
 *
 * Auth: shared-secret token via `?token=` or `x-admin-token`
 * header. Token comes from env `ADMIN_FUNNEL_TOKEN`. If env is
 * unset, route refuses to serve (no implicit open access).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Row = {
  module: string;
  event: string;
  slug: string | null;
  ts: string;
  session_id: string | null;
};

const FUNNEL_EVENTS = [
  'home_module_card_click',
  'module_landing_view',
  'quiz_start',
  'quiz_complete',
  'result_view',
  'paywall_view',
  'paywall_click_buy',
  'paywall_pay_success',
  'cross_module_unlock_click',
] as const;

type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_FUNNEL_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_FUNNEL_TOKEN not configured on the server' },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const provided = url.searchParams.get('token') ?? req.headers.get('x-admin-token');
  if (provided !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? '7'), 1), 90);
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('product_events')
    .select('module, event, slug, ts, session_id')
    .gte('ts', sinceIso)
    .in('event', FUNNEL_EVENTS as unknown as string[])
    .order('ts', { ascending: false })
    .limit(50000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];

  // Aggregate: per module → per event → unique session count.
  const perModule: Record<string, Record<FunnelEvent, Set<string>>> = {};
  for (const r of rows) {
    if (!FUNNEL_EVENTS.includes(r.event as FunnelEvent)) continue;
    const m = perModule[r.module] ?? (perModule[r.module] = {} as Record<FunnelEvent, Set<string>>);
    const set = m[r.event as FunnelEvent] ?? (m[r.event as FunnelEvent] = new Set<string>());
    if (r.session_id) set.add(r.session_id);
  }

  const summary = Object.entries(perModule)
    .map(([module, byEvent]) => {
      const counts = {} as Record<FunnelEvent, number>;
      for (const e of FUNNEL_EVENTS) counts[e] = byEvent[e]?.size ?? 0;
      const view = counts.paywall_view;
      const buy = counts.paywall_click_buy;
      const pay = counts.paywall_pay_success;
      return {
        module,
        counts,
        viewToBuy: view ? Math.round((buy / view) * 1000) / 10 : 0,
        buyToPay: buy ? Math.round((pay / buy) * 1000) / 10 : 0,
        viewToPay: view ? Math.round((pay / view) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.counts.paywall_view - a.counts.paywall_view);

  return NextResponse.json({
    days,
    sinceIso,
    totalRows: rows.length,
    summary,
  });
}
