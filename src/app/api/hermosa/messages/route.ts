/**
 * HERMOSA · 她的话｜留言读写
 *
 * GET  /api/hermosa/messages?universe=...&slug=...&tag=...&kind=...&limit=24
 * POST /api/hermosa/messages   { universe, slug?, code?, text, signature?, tags?, kind?, metadata? }
 *
 * - 复用 soulti_wishes 模式：service_role 写入 + RLS 兜底。
 * - 限流：同 client_hash 1h ≤3 条。
 * - 长度上限 180 字。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  isHermosaAttributionMode,
  isHermosaCurationStatus,
  isHermosaKind,
  isHermosaSafetyLevel,
  isHermosaTag,
  isHermosaTopicWeek,
  isHermosaUniverse,
  sanitizeContributionMetadata,
  sanitizeTags,
  type HermosaAttributionMode,
  type HermosaCurationStatus,
  type HermosaContributionMetadata,
  type HermosaKind,
  type HermosaSafetyLevel,
  type HermosaTag,
  type HermosaUniverse,
} from '@/lib/hermosa/tags';
import { getCurrentHermosaTopic } from '@/lib/hermosa/topics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LEN = 180;
const MAX_SIG_LEN = 24;
const RATE_LIMIT_PER_HOUR = 3;

function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

function shouldFlag(text: string): boolean {
  return /https?:\/\/|t\.me\/|wechat|微信号|加我|联系我|wxid_/i.test(text);
}

function sanitize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
}

function tryAdmin() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
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
  created_at: string;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const universe = sp.get('universe');
  const slug = sp.get('slug') || undefined;
  const tag = sp.get('tag');
  const kind = sp.get('kind');
  const topicWeek = sp.get('topic_week');
  const curationStatus = sp.get('curation_status');
  const safetyLevel = sp.get('safety_level');
  const consented = sp.get('consented');
  const limitRaw = Number(sp.get('limit') ?? '24');
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 24, 1), 60);

  const admin = tryAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, messages: [] as Row[] });
  }

  let q = admin
    .from('hermosa_messages')
    .select('id,universe,slug,code,kind,text,signature,tags,metadata,topic_week,curation_status,consent_to_feature,attribution_mode,safety_level,echo_count,is_featured,status,lifecycle,inscribed_letter_slug,codex_atlas_slug,created_at')
    .eq('is_published', true)
    .eq('flagged', false)
    .neq('safety_level', 'blocked')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (universe && isHermosaUniverse(universe)) {
    q = q.eq('universe', universe);
  }
  if (slug) {
    q = q.eq('slug', slug);
  }
  if (tag && isHermosaTag(tag)) {
    q = q.contains('tags', [tag] as HermosaTag[]);
  }
  if (kind && isHermosaKind(kind)) {
    q = q.eq('kind', kind);
  }
  if (topicWeek && isHermosaTopicWeek(topicWeek)) {
    q = q.eq('topic_week', topicWeek);
  }
  if (curationStatus && isHermosaCurationStatus(curationStatus)) {
    q = q.eq('curation_status', curationStatus);
  }
  if (safetyLevel && isHermosaSafetyLevel(safetyLevel)) {
    q = q.eq('safety_level', safetyLevel);
  }
  if (consented === 'true') {
    q = q.eq('consent_to_feature', true);
  }

  const { data, error } = await q;
  if (error) {
    console.warn('[hermosa] GET error', error.message);
    return NextResponse.json({ ok: true, messages: [] as Row[] });
  }
  return NextResponse.json({ ok: true, messages: (data ?? []) as Row[] });
}

interface PostBody {
  universe?: string;
  slug?: string;
  code?: string;
  text?: string;
  signature?: string;
  tags?: unknown;
  kind?: unknown;
  metadata?: unknown;
  topic_week?: unknown;
  consent_to_feature?: unknown;
  attribution_mode?: unknown;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const universe = body.universe;
  if (!universe || !isHermosaUniverse(universe)) {
    return NextResponse.json({ ok: false, error: 'invalid_universe' }, { status: 400 });
  }
  const text = sanitize(typeof body.text === 'string' ? body.text : '');
  if (text.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty_text' }, { status: 400 });
  }
  const slug =
    typeof body.slug === 'string' && body.slug.trim().length > 0
      ? body.slug.trim().slice(0, 80)
      : null;
  const code =
    typeof body.code === 'string' && body.code.trim().length > 0
      ? body.code.trim().slice(0, 16)
      : null;
  const signature =
    typeof body.signature === 'string'
      ? body.signature.replace(/[\r\n]/g, '').trim().slice(0, MAX_SIG_LEN) || null
      : null;
  const tags = sanitizeTags(body.tags);
  const kindRaw = body.kind ?? 'voice';
  if (!isHermosaKind(kindRaw)) {
    return NextResponse.json({ ok: false, error: 'invalid_kind' }, { status: 400 });
  }
  const kind = kindRaw;
  const metadata = sanitizeContributionMetadata(kind, body.metadata);
  const topicWeekRaw = body.topic_week ?? getCurrentHermosaTopic().week;
  if (!isHermosaTopicWeek(topicWeekRaw)) {
    return NextResponse.json({ ok: false, error: 'invalid_topic_week' }, { status: 400 });
  }
  const attributionRaw = body.attribution_mode ?? (signature ? 'signature' : 'anonymous');
  if (!isHermosaAttributionMode(attributionRaw)) {
    return NextResponse.json({ ok: false, error: 'invalid_attribution_mode' }, { status: 400 });
  }
  const consentToFeature = body.consent_to_feature === true;
  const flagged = shouldFlag(text) || shouldFlag(Object.values(metadata).join(' '));
  const safetyLevel: HermosaSafetyLevel = flagged ? 'review' : 'safe';

  const admin = tryAdmin();
  if (!admin) {
    console.info('[hermosa] noop (no supabase)', { universe, kind, text });
    return NextResponse.json({
      ok: true,
      persisted: false,
      message: {
        id: 'local-' + Date.now().toString(36),
        universe,
        slug,
        code,
        kind,
        text,
        signature,
        tags,
        metadata,
        topic_week: topicWeekRaw,
        curation_status: 'new',
        consent_to_feature: consentToFeature,
        attribution_mode: attributionRaw,
        safety_level: safetyLevel,
        echo_count: 0,
        is_featured: false,
        status: null,
        created_at: new Date().toISOString(),
      } satisfies Row,
    });
  }

  const hash = clientHash(req);

  // Rate limit
  const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recent } = await admin
    .from('hermosa_messages')
    .select('id')
    .eq('client_hash', hash)
    .gte('created_at', sinceIso)
    .limit(RATE_LIMIT_PER_HOUR + 1);
  if (recent && recent.length >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const insertPayload: Record<string, unknown> = {
    universe: universe as HermosaUniverse,
    slug,
    code,
    text,
    signature,
    tags,
    kind,
    metadata,
    topic_week: topicWeekRaw,
    curation_status: 'new',
    consent_to_feature: consentToFeature,
    attribution_mode: attributionRaw,
    safety_level: safetyLevel,
    client_hash: hash,
    flagged,
  };

  const { data: inserted, error: insertErr } = await admin
    .from('hermosa_messages')
    .insert(insertPayload)
    .select('id,universe,slug,code,kind,text,signature,tags,metadata,topic_week,curation_status,consent_to_feature,attribution_mode,safety_level,echo_count,is_featured,status,lifecycle,inscribed_letter_slug,codex_atlas_slug,created_at')
    .single();

  if (insertErr) {
    console.warn('[hermosa] insert err', insertErr.message);
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, persisted: true, message: inserted as Row });
}
