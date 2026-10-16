/**
 * Admin · Salon Talents 治理 API
 *
 * Auth：与 /api/hermosa/admin 共用 ADMIN_HERMOSA_TOKEN（fallback ADMIN_FUNNEL_TOKEN）。
 *
 * GET  /api/hermosa/admin/talents?token=…&curation_status=&flagged=&days=
 *      返回最近 N 天的 talent 全字段（含 contact_email——仅管理员）+ 各维度计数。
 * PATCH /api/hermosa/admin/talents?id=…&token=…
 *      支持：curation_status / flagged / is_published / is_open_to_collab
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CURATION = new Set(['pending', 'reviewed', 'spotlighted', 'rejected']);

function getToken(req: NextRequest): string | null {
  return req.nextUrl.searchParams.get('token') ?? req.headers.get('x-admin-token') ?? null;
}

function getExpectedToken(): string | null {
  return process.env.ADMIN_HERMOSA_TOKEN ?? process.env.ADMIN_FUNNEL_TOKEN ?? null;
}

interface AdminTalentRow {
  id: string;
  handle: string;
  pitch: string;
  skills: string[];
  universe: string | null;
  slug: string | null;
  contact_email: string | null;
  contact_note: string | null;
  is_open_to_collab: boolean;
  is_published: boolean;
  flagged: boolean;
  curation_status: string;
  source_msg_id: string | null;
  client_hash: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(req: NextRequest) {
  const expected = getExpectedToken();
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_HERMOSA_TOKEN (or ADMIN_FUNNEL_TOKEN) not configured' },
      { status: 503 },
    );
  }
  if (getToken(req) !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const days = Math.min(Math.max(Number(sp.get('days') ?? '30'), 1), 365);
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const curation = sp.get('curation_status');
  const flaggedOnly = sp.get('flagged') === 'true';

  const admin = createAdminSupabaseClient();
  let q = admin
    .from('hermosa_talents')
    .select(
      'id,handle,pitch,skills,universe,slug,contact_email,contact_note,is_open_to_collab,is_published,flagged,curation_status,source_msg_id,client_hash,created_at,updated_at',
    )
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(500);

  if (curation && VALID_CURATION.has(curation)) {
    q = q.eq('curation_status', curation);
  }
  if (flaggedOnly) {
    q = q.eq('flagged', true);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as AdminTalentRow[];

  // Counts per curation_status across the whole table (not just window) for KPI
  const { data: allCuration } = await admin
    .from('hermosa_talents')
    .select('curation_status,flagged,is_published,is_open_to_collab');

  const totalsByCuration: Record<string, number> = {
    pending: 0,
    reviewed: 0,
    spotlighted: 0,
    rejected: 0,
  };
  let flaggedTotal = 0;
  let liveTotal = 0;
  let openTotal = 0;
  for (const r of (allCuration ?? []) as Pick<AdminTalentRow, 'curation_status' | 'flagged' | 'is_published' | 'is_open_to_collab'>[]) {
    if (VALID_CURATION.has(r.curation_status)) totalsByCuration[r.curation_status] += 1;
    if (r.flagged) flaggedTotal += 1;
    if (r.is_published && !r.flagged) liveTotal += 1;
    if (r.is_published && !r.flagged && r.is_open_to_collab) openTotal += 1;
  }

  return NextResponse.json({
    days,
    sinceIso,
    total: rows.length,
    totalsByCuration,
    flaggedTotal,
    liveTotal,
    openTotal,
    rows,
  });
}

interface PatchBody {
  curation_status?: string;
  flagged?: boolean;
  is_published?: boolean;
  is_open_to_collab?: boolean;
}

export async function PATCH(req: NextRequest) {
  const expected = getExpectedToken();
  if (!expected) {
    return NextResponse.json({ error: 'admin_token_not_configured' }, { status: 503 });
  }
  if (getToken(req) !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.curation_status === 'string' && VALID_CURATION.has(body.curation_status)) {
    update.curation_status = body.curation_status;
  }
  if (typeof body.flagged === 'boolean') update.flagged = body.flagged;
  if (typeof body.is_published === 'boolean') update.is_published = body.is_published;
  if (typeof body.is_open_to_collab === 'boolean') update.is_open_to_collab = body.is_open_to_collab;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no_op' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('hermosa_talents')
    .update(update)
    .eq('id', id)
    .select(
      'id,handle,pitch,skills,universe,slug,contact_email,contact_note,is_open_to_collab,is_published,flagged,curation_status,source_msg_id,client_hash,created_at,updated_at',
    )
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, talent: data });
}
