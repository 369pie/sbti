/**
 * HER AURORA · 极光星图投稿池
 *
 * GET  /api/hermosa/atlas?limit=24&publish_issue=2026-summer
 * POST /api/hermosa/atlas { title, body_md, excerpt?, cover_note?, source_topic_week? }
 *
 * - 当前是 Q3 前置骨架：允许匿名递交词条草稿，统一进入 review 池。
 * - 投稿不是公开信息流；只有 `published` 才会通过 GET 露出。
 * - contributor_hash / sigil_hash 由服务端派生，不写真实身份。
 */

import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { isHermosaTopicWeek } from '@/lib/hermosa/tags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TITLE_LEN = 80;
const MAX_BODY_LEN = 4000;
const MIN_BODY_LEN = 200;
const MAX_EXCERPT_LEN = 220;
const MAX_COVER_NOTE_LEN = 120;
const RATE_LIMIT_PER_DAY = 2;
const SIGIL_SALT = 'her-voice-sigil-v1';

function tryAdmin() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

function deriveSigilHash(hash: string): string {
  return createHash('sha256').update(`${SIGIL_SALT}|${hash}`).digest('hex').slice(0, 24);
}

function shouldMarkAi(text: string): boolean {
  return /as an ai|作为.?ai|language model|人工智能生成|chatgpt/i.test(text);
}

function cleanOptional(text: unknown, maxLen: number): string | null {
  if (typeof text !== 'string') return null;
  const clean = text.trim();
  return clean ? clean.slice(0, maxLen) : null;
}

export async function GET(req: NextRequest) {
  const admin = tryAdmin();
  if (!admin) return NextResponse.json({ ok: true, rows: [] as unknown[] });

  const publishIssue = req.nextUrl.searchParams.get('publish_issue')?.trim() ?? '';
  const limitRaw = Number(req.nextUrl.searchParams.get('limit') ?? '24');
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 24, 1), 60);

  let query = admin
    .from('atlas_submissions')
    .select('id,title,excerpt,slug,publish_issue,published_at,created_at,source_topic_week')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (publishIssue) query = query.eq('publish_issue', publishIssue);

  const { data, error } = await query;
  if (error) {
    console.warn('[hermosa/atlas] GET error', error.message);
    return NextResponse.json({ ok: true, rows: [] as unknown[] });
  }

  return NextResponse.json({ ok: true, rows: data ?? [] });
}

interface PostBody {
  title?: unknown;
  body_md?: unknown;
  excerpt?: unknown;
  cover_note?: unknown;
  source_topic_week?: unknown;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim().slice(0, MAX_TITLE_LEN) : '';
  const bodyMd = typeof body.body_md === 'string' ? body.body_md.trim().slice(0, MAX_BODY_LEN) : '';
  const excerpt = cleanOptional(body.excerpt, MAX_EXCERPT_LEN);
  const coverNote = cleanOptional(body.cover_note, MAX_COVER_NOTE_LEN);
  const sourceTopicWeek = body.source_topic_week == null
    ? null
    : typeof body.source_topic_week === 'string' && isHermosaTopicWeek(body.source_topic_week.trim())
      ? body.source_topic_week.trim()
      : '__invalid__';

  if (!title) {
    return NextResponse.json({ ok: false, error: 'title_required' }, { status: 400 });
  }
  if (bodyMd.length < MIN_BODY_LEN || bodyMd.length > MAX_BODY_LEN) {
    return NextResponse.json({ ok: false, error: 'body_length' }, { status: 400 });
  }
  if (sourceTopicWeek === '__invalid__') {
    return NextResponse.json({ ok: false, error: 'invalid_topic_week' }, { status: 400 });
  }

  const contributorHash = clientHash(req);
  const sigilHash = deriveSigilHash(contributorHash);
  const aiSuspected = shouldMarkAi(`${title}\n${bodyMd}\n${excerpt ?? ''}\n${coverNote ?? ''}`);
  const admin = tryAdmin();

  if (!admin) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      submission: {
        id: `local-${Date.now().toString(36)}`,
        status: 'review',
        sigil_hash: sigilHash,
      },
    });
  }

  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await admin
    .from('atlas_submissions')
    .select('id')
    .eq('contributor_hash', contributorHash)
    .gte('created_at', sinceIso)
    .limit(RATE_LIMIT_PER_DAY + 1);

  if (recent && recent.length >= RATE_LIMIT_PER_DAY) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const { data, error } = await admin
    .from('atlas_submissions')
    .insert({
      contributor_hash: contributorHash,
      sigil_hash: sigilHash,
      title,
      body_md: bodyMd,
      excerpt,
      cover_note: coverNote,
      source_topic_week: sourceTopicWeek,
      status: 'review',
      ai_suspected: aiSuspected,
    })
    .select('id,status,sigil_hash,created_at')
    .single();

  if (error) {
    console.warn('[hermosa/atlas] POST error', error.message);
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, persisted: true, submission: data });
}