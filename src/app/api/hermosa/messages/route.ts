/**
 * HERMOSA · 她的话｜留言读写
 *
 * GET  /api/hermosa/messages?universe=...&slug=...&tag=...&limit=24
 * POST /api/hermosa/messages   { universe, slug?, code?, text, signature?, tags? }
 *
 * - 复用 soulti_wishes 模式：service_role 写入 + RLS 兜底。
 * - 限流：同 client_hash 1h ≤3 条。
 * - 长度上限 180 字。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  isHermosaTag,
  isHermosaUniverse,
  sanitizeTags,
  type HermosaTag,
  type HermosaUniverse,
} from '@/lib/hermosa/tags';

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
  text: string;
  signature: string | null;
  tags: string[];
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
  const limitRaw = Number(sp.get('limit') ?? '24');
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 24, 1), 60);

  const admin = tryAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, messages: [] as Row[] });
  }

  let q = admin
    .from('hermosa_messages')
    .select('id,universe,slug,code,text,signature,tags,echo_count,is_featured,status,created_at')
    .eq('is_published', true)
    .eq('flagged', false)
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

  const admin = tryAdmin();
  if (!admin) {
    console.info('[hermosa] noop (no supabase)', { universe, text });
    return NextResponse.json({
      ok: true,
      persisted: false,
      message: {
        id: 'local-' + Date.now().toString(36),
        universe,
        slug,
        code,
        text,
        signature,
        tags,
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
    client_hash: hash,
    flagged: shouldFlag(text),
  };

  const { data: inserted, error: insertErr } = await admin
    .from('hermosa_messages')
    .insert(insertPayload)
    .select('id,universe,slug,code,text,signature,tags,echo_count,is_featured,status,created_at')
    .single();

  if (insertErr) {
    console.warn('[hermosa] insert err', insertErr.message);
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, persisted: true, message: inserted as Row });
}
