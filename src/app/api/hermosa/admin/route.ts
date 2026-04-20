/**
 * /api/hermosa/admin
 * ─────────────────────────────────────────────
 * 仅产品方使用的看板。
 *
 * Auth: 共享 secret，env `ADMIN_HERMOSA_TOKEN`，未配置则拒绝。
 *       兼容 `ADMIN_FUNNEL_TOKEN`（同一管理员凭证可复用）。
 *
 * GET  /api/hermosa/admin?days=14       → { rows, summary, totalsByTag }
 * PATCH /api/hermosa/admin?id=...&token=... { status, status_note?, is_featured?, is_published?, flagged? }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { HERMOSA_TAGS, type HermosaTag } from '@/lib/hermosa/tags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getToken(req: NextRequest): string | null {
  return (
    req.nextUrl.searchParams.get('token') ??
    req.headers.get('x-admin-token') ??
    null
  );
}

function getExpectedToken(): string | null {
  return (
    process.env.ADMIN_HERMOSA_TOKEN ??
    process.env.ADMIN_FUNNEL_TOKEN ??
    null
  );
}

interface Row {
  id: string;
  universe: string;
  slug: string | null;
  code: string | null;
  text: string;
  signature: string | null;
  tags: string[];
  echo_count: number;
  is_featured: boolean;
  status: string | null;
  status_note: string | null;
  is_published: boolean;
  flagged: boolean;
  created_at: string;
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

  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get('days') ?? '14'), 1), 90);
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('hermosa_messages')
    .select('id,universe,slug,code,text,signature,tags,echo_count,is_featured,status,status_note,is_published,flagged,created_at')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];
  const totalsByTag: Record<HermosaTag, number> = {
    want: 0, feedback: 0, voice: 0, declare: 0, feature: 0, thanks: 0,
  };
  for (const r of rows) {
    for (const t of r.tags ?? []) {
      if ((HERMOSA_TAGS as readonly string[]).includes(t)) {
        totalsByTag[t as HermosaTag] += 1;
      }
    }
  }

  const totalsByUniverse: Record<string, number> = {};
  for (const r of rows) {
    totalsByUniverse[r.universe] = (totalsByUniverse[r.universe] ?? 0) + 1;
  }

  return NextResponse.json({
    days,
    sinceIso,
    total: rows.length,
    totalsByTag,
    totalsByUniverse,
    rows,
  });
}

interface PatchBody {
  status?: string | null;
  status_note?: string;
  is_featured?: boolean;
  is_published?: boolean;
  flagged?: boolean;
  featured_week?: string;
}

const ALLOWED_STATUS = new Set(['heard', 'planned', 'shipped']);

export async function PATCH(req: NextRequest) {
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
  if (body.status === null || (typeof body.status === 'string' && (ALLOWED_STATUS.has(body.status) || body.status === ''))) {
    update.status = body.status === '' ? null : body.status;
  }
  if (typeof body.status_note === 'string') {
    update.status_note = body.status_note.slice(0, 240);
  }
  if (typeof body.is_featured === 'boolean') update.is_featured = body.is_featured;
  if (typeof body.is_published === 'boolean') update.is_published = body.is_published;
  if (typeof body.flagged === 'boolean') update.flagged = body.flagged;
  if (typeof body.featured_week === 'string' && /^\d{4}-W\d{2}$/.test(body.featured_week)) {
    update.featured_week = body.featured_week;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no_changes' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('hermosa_messages')
    .update(update)
    .eq('id', id)
    .select('id,status,status_note,is_featured,is_published,flagged,featured_week')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, row: data });
}
