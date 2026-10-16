/**
 * /api/hermosa/admin
 * ─────────────────────────────────────────────
 * 仅产品方使用的看板。
 *
 * Auth: 共享 secret，env `ADMIN_HERMOSA_TOKEN`，未配置则拒绝。
 *       兼容 `ADMIN_FUNNEL_TOKEN`（同一管理员凭证可复用）。
 *
 * GET  /api/hermosa/admin?days=14       → { rows, summary, totalsByTag, totalsByKind }
 * PATCH /api/hermosa/admin?id=...&token=... { status, curation_status?, safety_level?, ... }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  HERMOSA_CURATION_STATUSES,
  HERMOSA_KINDS,
  HERMOSA_SAFETY_LEVELS,
  HERMOSA_TAGS,
  isHermosaAttributionMode,
  isHermosaCurationStatus,
  isHermosaKind,
  isHermosaSafetyLevel,
  isHermosaTopicWeek,
  type HermosaAttributionMode,
  type HermosaContributionMetadata,
  type HermosaCurationStatus,
  type HermosaKind,
  type HermosaSafetyLevel,
  type HermosaTag,
} from '@/lib/hermosa/tags';

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
  kind: HermosaKind;
  text: string;
  signature: string | null;
  tags: string[];
  metadata: HermosaContributionMetadata;
  topic_week: string | null;
  curation_status: HermosaCurationStatus;
  consent_to_feature: boolean;
  attribution_mode: HermosaAttributionMode;
  safety_level: HermosaSafetyLevel;
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
  const kind = req.nextUrl.searchParams.get('kind');
  const curationStatus = req.nextUrl.searchParams.get('curation_status');
  const safetyLevel = req.nextUrl.searchParams.get('safety_level');
  const topicWeek = req.nextUrl.searchParams.get('topic_week');
  const consented = req.nextUrl.searchParams.get('consented');

  const admin = createAdminSupabaseClient();
  let query = admin
    .from('hermosa_messages')
    .select('id,universe,slug,code,kind,text,signature,tags,metadata,topic_week,curation_status,consent_to_feature,attribution_mode,safety_level,echo_count,is_featured,status,status_note,is_published,flagged,created_at')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(500);

  if (kind && isHermosaKind(kind)) query = query.eq('kind', kind);
  if (curationStatus && isHermosaCurationStatus(curationStatus)) {
    query = query.eq('curation_status', curationStatus);
  }
  if (safetyLevel && isHermosaSafetyLevel(safetyLevel)) query = query.eq('safety_level', safetyLevel);
  if (topicWeek && isHermosaTopicWeek(topicWeek)) query = query.eq('topic_week', topicWeek);
  if (consented === 'true') query = query.eq('consent_to_feature', true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];
  const totalsByTag: Record<HermosaTag, number> = {
    want: 0, feedback: 0, voice: 0, declare: 0, feature: 0, thanks: 0,
    rant: 0, story: 0, solidarity: 0,
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
  const totalsByKind = Object.fromEntries(
    HERMOSA_KINDS.map((k) => [k, 0]),
  ) as Record<HermosaKind, number>;
  const totalsByCurationStatus = Object.fromEntries(
    HERMOSA_CURATION_STATUSES.map((s) => [s, 0]),
  ) as Record<HermosaCurationStatus, number>;
  const totalsBySafetyLevel = Object.fromEntries(
    HERMOSA_SAFETY_LEVELS.map((s) => [s, 0]),
  ) as Record<HermosaSafetyLevel, number>;
  for (const r of rows) {
    if (isHermosaKind(r.kind)) totalsByKind[r.kind] += 1;
    if (isHermosaCurationStatus(r.curation_status)) {
      totalsByCurationStatus[r.curation_status] += 1;
    }
    if (isHermosaSafetyLevel(r.safety_level)) totalsBySafetyLevel[r.safety_level] += 1;
  }

  return NextResponse.json({
    days,
    sinceIso,
    total: rows.length,
    totalsByTag,
    totalsByUniverse,
    totalsByKind,
    totalsByCurationStatus,
    totalsBySafetyLevel,
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
  curation_status?: string;
  consent_to_feature?: boolean;
  attribution_mode?: string;
  safety_level?: string;
  topic_week?: string | null;
  // HER AURORA · W3 · 极光生命周期字段
  lifecycle?: string;
  inscribed_letter_slug?: string | null;
  codex_atlas_slug?: string | null;
}

const ALLOWED_STATUS = new Set(['heard', 'planned', 'shipped']);
const ALLOWED_LIFECYCLE = new Set(['lit', 'caught', 'tended', 'inscribed', 'codex']);

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
  if (typeof body.curation_status === 'string' && isHermosaCurationStatus(body.curation_status)) {
    update.curation_status = body.curation_status;
  }
  if (typeof body.consent_to_feature === 'boolean') {
    update.consent_to_feature = body.consent_to_feature;
  }
  if (typeof body.attribution_mode === 'string' && isHermosaAttributionMode(body.attribution_mode)) {
    update.attribution_mode = body.attribution_mode;
  }
  if (typeof body.safety_level === 'string' && isHermosaSafetyLevel(body.safety_level)) {
    update.safety_level = body.safety_level;
    if (body.safety_level === 'blocked') update.is_published = false;
  }
  if (body.topic_week === null) {
    update.topic_week = null;
  } else if (typeof body.topic_week === 'string' && isHermosaTopicWeek(body.topic_week)) {
    update.topic_week = body.topic_week;
  }
  // HER AURORA · lifecycle 状态机：守光人手动推进一束光从 lit → caught → tended → inscribed → codex
  if (typeof body.lifecycle === 'string' && ALLOWED_LIFECYCLE.has(body.lifecycle)) {
    update.lifecycle = body.lifecycle;
    if (body.lifecycle === 'tended') {
      update.tended_at = new Date().toISOString();
    }
  }
  if (body.inscribed_letter_slug === null) {
    update.inscribed_letter_slug = null;
  } else if (
    typeof body.inscribed_letter_slug === 'string'
    && /^\d{4}-\d{2}$/.test(body.inscribed_letter_slug)
  ) {
    update.inscribed_letter_slug = body.inscribed_letter_slug;
    if (!update.lifecycle) update.lifecycle = 'inscribed';
  }
  if (body.codex_atlas_slug === null) {
    update.codex_atlas_slug = null;
  } else if (
    typeof body.codex_atlas_slug === 'string'
    && /^[a-z0-9-]{1,80}$/.test(body.codex_atlas_slug)
  ) {
    update.codex_atlas_slug = body.codex_atlas_slug;
    if (!update.lifecycle) update.lifecycle = 'codex';
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no_changes' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (update.curation_status === 'published') {
    const { data: current, error: currentError } = await admin
      .from('hermosa_messages')
      .select('consent_to_feature,safety_level,flagged,is_published')
      .eq('id', id)
      .single();

    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 });
    }

    const hasConsent =
      typeof update.consent_to_feature === 'boolean'
        ? update.consent_to_feature
        : Boolean(current?.consent_to_feature);
    const safetyLevel =
      typeof update.safety_level === 'string' ? update.safety_level : current?.safety_level;
    const isFlagged =
      typeof update.flagged === 'boolean' ? update.flagged : Boolean(current?.flagged);

    if (!hasConsent) {
      return NextResponse.json({ error: 'missing_consent' }, { status: 409 });
    }
    if (isFlagged || safetyLevel !== 'safe') {
      return NextResponse.json({ error: 'unsafe_for_publish' }, { status: 409 });
    }
    update.is_published = true;
  }

  const { data, error } = await admin
    .from('hermosa_messages')
    .update(update)
    .eq('id', id)
    .select('id,status,status_note,is_featured,is_published,flagged,featured_week,curation_status,consent_to_feature,attribution_mode,safety_level,topic_week,lifecycle,tended_at,inscribed_letter_slug,codex_atlas_slug')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, row: data });
}
