/**
 * Admin · Salon Whispers 审计 API
 *
 * Auth：与 /api/hermosa/admin 共用 ADMIN_HERMOSA_TOKEN（fallback ADMIN_FUNNEL_TOKEN）。
 * 只读 — whisper body 本身从不持久化，这里只能看 metadata（投递成功/失败/flagged）。
 *
 * GET /api/hermosa/admin/whispers?token=…&days=&talent_id=&flagged=&delivered=
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getToken(req: NextRequest): string | null {
  return req.nextUrl.searchParams.get('token') ?? req.headers.get('x-admin-token') ?? null;
}

function getExpectedToken(): string | null {
  return process.env.ADMIN_HERMOSA_TOKEN ?? process.env.ADMIN_FUNNEL_TOKEN ?? null;
}

interface WhisperRow {
  id: string;
  talent_id: string;
  sender_email: string;
  sender_handle: string | null;
  brief_len: number;
  budget_band: string | null;
  client_hash: string | null;
  delivered: boolean;
  deliver_error: string | null;
  flagged: boolean;
  created_at: string;
}

interface TalentMini {
  id: string;
  handle: string;
}

export async function GET(req: NextRequest) {
  const expected = getExpectedToken();
  if (!expected) {
    return NextResponse.json({ error: 'admin_token_not_configured' }, { status: 503 });
  }
  if (getToken(req) !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const days = Math.min(Math.max(Number(sp.get('days') ?? '14'), 1), 90);
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const talentId = sp.get('talent_id');
  const flaggedParam = sp.get('flagged');
  const deliveredParam = sp.get('delivered');

  const admin = createAdminSupabaseClient();
  let q = admin
    .from('hermosa_whispers')
    .select(
      'id,talent_id,sender_email,sender_handle,brief_len,budget_band,client_hash,delivered,deliver_error,flagged,created_at',
    )
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(500);

  if (talentId) q = q.eq('talent_id', talentId);
  if (flaggedParam === 'true') q = q.eq('flagged', true);
  if (deliveredParam === 'true') q = q.eq('delivered', true);
  if (deliveredParam === 'false') q = q.eq('delivered', false);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const rows = (data ?? []) as WhisperRow[];

  // Hydrate talent handles for the listed rows.
  const ids = Array.from(new Set(rows.map((r) => r.talent_id)));
  const handles: Record<string, string> = {};
  if (ids.length > 0) {
    const { data: talents } = await admin
      .from('hermosa_talents')
      .select('id,handle')
      .in('id', ids);
    for (const t of (talents ?? []) as TalentMini[]) {
      handles[t.id] = t.handle;
    }
  }

  let flaggedTotal = 0;
  let deliveredTotal = 0;
  let failedTotal = 0;
  for (const r of rows) {
    if (r.flagged) flaggedTotal += 1;
    if (r.delivered) deliveredTotal += 1;
    else failedTotal += 1;
  }

  return NextResponse.json({
    days,
    sinceIso,
    total: rows.length,
    flaggedTotal,
    deliveredTotal,
    failedTotal,
    rows: rows.map((r) => ({ ...r, talent_handle: handles[r.talent_id] ?? null })),
  });
}
