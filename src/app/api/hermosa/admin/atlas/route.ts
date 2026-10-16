/**
 * Admin · HER AURORA Atlas 投稿池治理
 *
 * GET   /api/hermosa/admin/atlas?token=...&days=180&status=review&ai_suspected=true
 * PATCH /api/hermosa/admin/atlas?id=...&token=... { status?, slug?, publish_issue?, curator_note?, ... }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { isHermosaTopicWeek } from '@/lib/hermosa/tags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUS_VALUES = ['draft', 'review', 'published', 'rejected'] as const;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type AtlasStatus = (typeof STATUS_VALUES)[number];

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

function isAtlasStatus(value: string): value is AtlasStatus {
  return (STATUS_VALUES as readonly string[]).includes(value);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function defaultPublishIssue(date = new Date()): string {
  const month = date.getUTCMonth() + 1;
  const season = month >= 3 && month <= 5
    ? 'spring'
    : month >= 6 && month <= 8
      ? 'summer'
      : month >= 9 && month <= 11
        ? 'autumn'
        : 'winter';
  return `${date.getUTCFullYear()}-${season}`;
}

async function recordSigilPublishEvent(admin: ReturnType<typeof createAdminSupabaseClient>, row: AtlasRow) {
  if (!row.sigil_hash) return null;

  const { error: sigilError } = await admin
    .from('hermosa_sigils')
    .upsert({ sigil_hash: row.sigil_hash }, { onConflict: 'sigil_hash' });

  if (sigilError) return sigilError.message;

  const { error: eventError } = await admin
    .from('sigil_events')
    .insert({
      sigil_hash: row.sigil_hash,
      event_type: 'atlas_published',
      context_key: row.slug ?? row.id,
      payload: {
        atlas_submission_id: row.id,
        title: row.title,
        slug: row.slug,
        publish_issue: row.publish_issue,
      },
    });

  return eventError?.message ?? null;
}

interface AtlasRow {
  id: string;
  contributor_hash: string;
  sigil_hash: string | null;
  title: string;
  body_md: string;
  excerpt: string | null;
  cover_note: string | null;
  slug: string | null;
  source_topic_week: string | null;
  status: AtlasStatus;
  ai_suspected: boolean;
  curator_note: string | null;
  publish_issue: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLS = 'id,contributor_hash,sigil_hash,title,body_md,excerpt,cover_note,slug,source_topic_week,status,ai_suspected,curator_note,publish_issue,published_at,created_at,updated_at';

export async function GET(req: NextRequest) {
  const denied = unauthorized(req);
  if (denied) return denied;

  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get('days') ?? '180'), 1), 365);
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const status = req.nextUrl.searchParams.get('status');
  const publishIssue = req.nextUrl.searchParams.get('publish_issue')?.trim();
  const aiSuspected = req.nextUrl.searchParams.get('ai_suspected');

  const admin = createAdminSupabaseClient();
  let query = admin
    .from('atlas_submissions')
    .select(SELECT_COLS)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(240);

  if (status && isAtlasStatus(status)) query = query.eq('status', status);
  if (publishIssue) query = query.eq('publish_issue', publishIssue);
  if (aiSuspected === 'true') query = query.eq('ai_suspected', true);
  if (aiSuspected === 'false') query = query.eq('ai_suspected', false);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as AtlasRow[];
  const totalsByStatus = Object.fromEntries(STATUS_VALUES.map((value) => [value, 0])) as Record<AtlasStatus, number>;
  for (const row of rows) totalsByStatus[row.status] += 1;

  return NextResponse.json({
    total: rows.length,
    aiSuspectedTotal: rows.filter((row) => row.ai_suspected).length,
    totalsByStatus,
    rows,
  });
}

interface PatchBody {
  title?: unknown;
  body_md?: unknown;
  excerpt?: unknown;
  cover_note?: unknown;
  slug?: unknown;
  source_topic_week?: unknown;
  status?: unknown;
  ai_suspected?: unknown;
  curator_note?: unknown;
  publish_issue?: unknown;
}

function sanitizePatch(body: PatchBody): { ok: true; patch: Record<string, unknown> } | { ok: false; error: string } {
  const patch: Record<string, unknown> = {};

  if (typeof body.title === 'string') {
    const value = body.title.trim();
    if (!value || value.length > 80) return { ok: false, error: 'title_length' };
    patch.title = value;
  }
  if (typeof body.body_md === 'string') {
    const value = body.body_md.trim();
    if (value.length < 200 || value.length > 4000) return { ok: false, error: 'body_length' };
    patch.body_md = value;
  }
  if ('excerpt' in body) {
    if (body.excerpt == null) {
      patch.excerpt = null;
    } else if (typeof body.excerpt === 'string') {
      const value = body.excerpt.trim();
      if (value.length > 220) return { ok: false, error: 'excerpt_length' };
      patch.excerpt = value || null;
    }
  }
  if ('cover_note' in body) {
    if (body.cover_note == null) {
      patch.cover_note = null;
    } else if (typeof body.cover_note === 'string') {
      const value = body.cover_note.trim();
      if (value.length > 120) return { ok: false, error: 'cover_note_length' };
      patch.cover_note = value || null;
    }
  }
  if ('slug' in body) {
    if (body.slug == null) {
      patch.slug = null;
    } else if (typeof body.slug === 'string') {
      const value = body.slug.trim().toLowerCase();
      if (value && !SLUG_RE.test(value)) return { ok: false, error: 'slug_invalid' };
      patch.slug = value || null;
    }
  }
  if ('source_topic_week' in body) {
    if (body.source_topic_week == null || body.source_topic_week === '') {
      patch.source_topic_week = null;
    } else if (typeof body.source_topic_week === 'string' && isHermosaTopicWeek(body.source_topic_week.trim())) {
      patch.source_topic_week = body.source_topic_week.trim();
    } else {
      return { ok: false, error: 'topic_week_invalid' };
    }
  }
  if (typeof body.status === 'string') {
    if (!isAtlasStatus(body.status)) return { ok: false, error: 'status_invalid' };
    patch.status = body.status;
  }
  if (typeof body.ai_suspected === 'boolean') {
    patch.ai_suspected = body.ai_suspected;
  }
  if ('curator_note' in body) {
    if (body.curator_note == null) {
      patch.curator_note = null;
    } else if (typeof body.curator_note === 'string') {
      patch.curator_note = body.curator_note.trim().slice(0, 600) || null;
    }
  }
  if ('publish_issue' in body) {
    if (body.publish_issue == null) {
      patch.publish_issue = null;
    } else if (typeof body.publish_issue === 'string') {
      patch.publish_issue = body.publish_issue.trim().slice(0, 40) || null;
    }
  }

  return { ok: true, patch };
}

export async function PATCH(req: NextRequest) {
  const denied = unauthorized(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get('id')?.trim() ?? '';
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const sanitized = sanitizePatch(body);
  if (!sanitized.ok) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }
  if (Object.keys(sanitized.patch).length === 0) {
    return NextResponse.json({ error: 'no_changes' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  let current: AtlasRow | null = null;
  if ('status' in sanitized.patch || 'slug' in sanitized.patch || 'publish_issue' in sanitized.patch) {
    const { data: currentRow, error: currentError } = await admin
      .from('atlas_submissions')
      .select(SELECT_COLS)
      .eq('id', id)
      .maybeSingle();
    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 });
    }
    current = (currentRow ?? null) as AtlasRow | null;
    if (!current) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }

  if (sanitized.patch.status === 'published') {
    if (!sanitized.patch.slug) {
      const sourceTitle = typeof sanitized.patch.title === 'string'
        ? sanitized.patch.title
        : current?.title ?? '';
      sanitized.patch.slug = slugify(sourceTitle);
    }
    if (!sanitized.patch.publish_issue) {
      sanitized.patch.publish_issue = current?.publish_issue ?? defaultPublishIssue();
    }
    if (!current?.published_at) {
      sanitized.patch.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await admin
    .from('atlas_submissions')
    .update(sanitized.patch)
    .eq('id', id)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sigilEventError: string | null = null;
  const updated = data as AtlasRow | null;
  if (updated && sanitized.patch.status === 'published' && current?.status !== 'published') {
    sigilEventError = await recordSigilPublishEvent(admin, updated);
  }

  return NextResponse.json({ ok: true, row: data, sigilEventError });
}