import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Row = {
  event: string;
  step: string | null;
  ts: string;
  session_id: string | null;
  slug: string | null;
};

function getToken(req: NextRequest): string | null {
  return req.nextUrl.searchParams.get('token') ?? req.headers.get('x-admin-token');
}

export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_FUNNEL_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: 'ADMIN_FUNNEL_TOKEN not configured on the server' }, { status: 503 });
  }
  if (getToken(req) !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get('days') ?? '7'), 1), 90);
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('product_events')
    .select('event, step, ts, session_id, slug')
    .eq('module', 'cpti')
    .gte('ts', sinceIso)
    .order('ts', { ascending: false })
    .limit(50_000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];
  const byEvent = new Map<string, Set<string>>();
  const byStep = new Map<string, Set<string>>();

  rows.forEach((row, index) => {
    const sessionKey = row.session_id ?? `row:${index}`;
    const eventSet = byEvent.get(row.event) ?? new Set<string>();
    eventSet.add(sessionKey);
    byEvent.set(row.event, eventSet);
    if (row.step) {
      const stepSet = byStep.get(row.step) ?? new Set<string>();
      stepSet.add(sessionKey);
      byStep.set(row.step, stepSet);
    }
  });

  return NextResponse.json({
    days,
    sinceIso,
    totalRows: rows.length,
    stepSummary: [...byStep.entries()].map(([step, sessions]) => ({ step, sessions: sessions.size })),
    eventSummary: [...byEvent.entries()].map(([event, sessions]) => ({ event, sessions: sessions.size }))
      .sort((a, b) => b.sessions - a.sessions),
    recent: rows.slice(0, 30).map((row) => ({
      ts: row.ts,
      event: row.event,
      step: row.step,
      slug: row.slug,
      sessionId: row.session_id,
    })),
  });
}