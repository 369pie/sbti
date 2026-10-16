/**
 * Admin · HER AURORA 极光时刻主题 CRUD
 *
 * Auth：复用 ADMIN_HERMOSA_TOKEN（fallback ADMIN_FUNNEL_TOKEN）。
 *
 * 数据源：hermosa_topics（见 db/migrations/2026-05-08_hermosa_topics.sql）。
 *
 * GET    /api/hermosa/admin/topics?token=…
 * POST   /api/hermosa/admin/topics?token=…  body: { week_code, title, eyebrow?, prompts?, calendar_tag?, pillar_link?, notes?, is_published? }
 * PATCH  /api/hermosa/admin/topics?token=…&week_code=YYYY-Www  body: 同上
 * DELETE /api/hermosa/admin/topics?token=…&week_code=YYYY-Www
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEEK_CODE_RE = /^[0-9]{4}-W[0-9]{2}$/;

function getToken(req: NextRequest): string | null {
  return req.nextUrl.searchParams.get('token') ?? req.headers.get('x-admin-token') ?? null;
}

function getExpectedToken(): string | null {
  return process.env.ADMIN_HERMOSA_TOKEN ?? process.env.ADMIN_FUNNEL_TOKEN ?? null;
}

function unauthorized(req: NextRequest): NextResponse | null {
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
  return null;
}

interface TopicRow {
  week_code: string;
  title: string;
  eyebrow: string | null;
  prompts: string[] | null;
  calendar_tag: string | null;
  pillar_link: string | null;
  notes: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const SELECT_COLS =
  'week_code,title,eyebrow,prompts,calendar_tag,pillar_link,notes,is_published,created_at,updated_at';

export async function GET(req: NextRequest) {
  const denied = unauthorized(req);
  if (denied) return denied;

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('hermosa_topics')
    .select(SELECT_COLS)
    .order('week_code', { ascending: false })
    .limit(120);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as TopicRow[];
  const publishedCount = rows.filter((r) => r.is_published).length;
  return NextResponse.json({ total: rows.length, publishedCount, rows });
}

interface UpsertBody {
  week_code?: string;
  title?: string;
  eyebrow?: string | null;
  prompts?: string[] | null;
  calendar_tag?: string | null;
  pillar_link?: string | null;
  notes?: string | null;
  is_published?: boolean;
}

function sanitize(body: UpsertBody): {
  ok: true;
  patch: Record<string, unknown>;
} | { ok: false; error: string } {
  const patch: Record<string, unknown> = {};
  if (typeof body.title === 'string') {
    const t = body.title.trim();
    if (!t || t.length > 80) return { ok: false, error: 'title_length' };
    patch.title = t;
  }
  if ('eyebrow' in body) {
    if (body.eyebrow == null) {
      patch.eyebrow = null;
    } else if (typeof body.eyebrow === 'string') {
      const v = body.eyebrow.trim();
      if (v.length > 40) return { ok: false, error: 'eyebrow_length' };
      patch.eyebrow = v.length ? v : null;
    }
  }
  if ('prompts' in body) {
    if (body.prompts == null) {
      patch.prompts = null;
    } else if (Array.isArray(body.prompts)) {
      const cleaned = body.prompts
        .map((p) => (typeof p === 'string' ? p.trim() : ''))
        .filter((p) => p.length > 0 && p.length <= 80)
        .slice(0, 6);
      patch.prompts = cleaned.length ? cleaned : null;
    }
  }
  if ('calendar_tag' in body) {
    patch.calendar_tag = typeof body.calendar_tag === 'string' && body.calendar_tag.trim()
      ? body.calendar_tag.trim().slice(0, 40)
      : null;
  }
  if ('pillar_link' in body) {
    patch.pillar_link = typeof body.pillar_link === 'string' && body.pillar_link.trim()
      ? body.pillar_link.trim().slice(0, 120)
      : null;
  }
  if ('notes' in body) {
    patch.notes = typeof body.notes === 'string' && body.notes.trim()
      ? body.notes.trim().slice(0, 600)
      : null;
  }
  if (typeof body.is_published === 'boolean') {
    patch.is_published = body.is_published;
  }
  return { ok: true, patch };
}

export async function POST(req: NextRequest) {
  const denied = unauthorized(req);
  if (denied) return denied;

  let body: UpsertBody;
  try {
    body = (await req.json()) as UpsertBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const week = typeof body.week_code === 'string' ? body.week_code.trim() : '';
  if (!WEEK_CODE_RE.test(week)) {
    return NextResponse.json({ error: 'week_code_invalid' }, { status: 400 });
  }
  if (typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title_required' }, { status: 400 });
  }
  const sanitized = sanitize(body);
  if (!sanitized.ok) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('hermosa_topics')
    .insert({ week_code: week, ...sanitized.patch })
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, topic: data });
}

export async function PATCH(req: NextRequest) {
  const denied = unauthorized(req);
  if (denied) return denied;

  const week = req.nextUrl.searchParams.get('week_code') ?? '';
  if (!WEEK_CODE_RE.test(week)) {
    return NextResponse.json({ error: 'week_code_invalid' }, { status: 400 });
  }

  let body: UpsertBody;
  try {
    body = (await req.json()) as UpsertBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const sanitized = sanitize(body);
  if (!sanitized.ok) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }
  if (Object.keys(sanitized.patch).length === 0) {
    return NextResponse.json({ error: 'no_op' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('hermosa_topics')
    .update(sanitized.patch)
    .eq('week_code', week)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, topic: data });
}

export async function DELETE(req: NextRequest) {
  const denied = unauthorized(req);
  if (denied) return denied;

  const week = req.nextUrl.searchParams.get('week_code') ?? '';
  if (!WEEK_CODE_RE.test(week)) {
    return NextResponse.json({ error: 'week_code_invalid' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from('hermosa_topics').delete().eq('week_code', week);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
