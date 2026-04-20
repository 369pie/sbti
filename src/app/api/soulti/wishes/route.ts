/**
 * SoulTI Wishes · 匿名许愿池
 *
 * GET  /api/soulti/wishes?slug=...   → up to 24 most recent published wishes
 * POST /api/soulti/wishes            → submit { slug, text, signature? }
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E10)
 *
 * - Anonymous; no auth required.
 * - Soft rate limit: same `client_hash` (sha256(IP+UA)) cannot post more than
 *   3 wishes per hour. We don't lock the request; we just store the hash and
 *   reject if exceeded.
 * - Length cap (1..240) enforced both at app + DB.
 * - Light profanity / link spam guard (bare-bones; ops triage via `flagged`).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { getSoultiPersonalityBySlug } from '@/lib/soulti/personalities';

const MAX_LEN = 240;
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
  // Very small heuristic: external links or repeated url-shortener patterns.
  return /https?:\/\/|wechat|微信|加我|联系/i.test(text);
}

function sanitize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
}

interface WishRow {
  id: string;
  slug: string;
  text: string;
  signature: string | null;
  created_at: string;
}

function supabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceKey ? { url, serviceKey } : null;
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? '';
  if (!slug || !getSoultiPersonalityBySlug(slug)) {
    return NextResponse.json({ ok: false, error: 'invalid_slug' }, { status: 400 });
  }
  const sb = supabase();
  if (!sb) return NextResponse.json({ ok: true, wishes: [] });

  const params = new URLSearchParams({
    select: 'id,slug,text,signature,created_at',
    slug: `eq.${slug}`,
    is_published: 'is.true',
    flagged: 'is.false',
    order: 'created_at.desc',
    limit: '24',
  });
  const res = await fetch(`${sb.url}/rest/v1/soulti_wishes?${params}`, {
    headers: { apikey: sb.serviceKey, Authorization: `Bearer ${sb.serviceKey}` },
  });
  if (!res.ok) {
    return NextResponse.json({ ok: true, wishes: [] });
  }
  const wishes = (await res.json()) as WishRow[];
  return NextResponse.json({ ok: true, wishes });
}

interface PostBody {
  slug?: string;
  text?: string;
  signature?: string;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const slug = body.slug ?? '';
  if (!slug || !getSoultiPersonalityBySlug(slug)) {
    return NextResponse.json({ ok: false, error: 'invalid_slug' }, { status: 400 });
  }
  const text = sanitize(typeof body.text === 'string' ? body.text : '');
  if (text.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty_text' }, { status: 400 });
  }
  const signature =
    typeof body.signature === 'string'
      ? body.signature.replace(/[\r\n]/g, '').trim().slice(0, MAX_SIG_LEN) || null
      : null;

  const sb = supabase();
  if (!sb) {
    // Dev mode: pretend it worked so the UI can be exercised
    console.info('[soulti/wishes] noop (no supabase)', { slug, text });
    return NextResponse.json({ ok: true, persisted: false });
  }

  const hash = clientHash(req);

  // Rate limit: count this hash's wishes in the last hour.
  const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const countParams = new URLSearchParams({
    select: 'id',
    client_hash: `eq.${hash}`,
    created_at: `gte.${sinceIso}`,
    limit: String(RATE_LIMIT_PER_HOUR + 1),
  });
  const countRes = await fetch(`${sb.url}/rest/v1/soulti_wishes?${countParams}`, {
    headers: {
      apikey: sb.serviceKey,
      Authorization: `Bearer ${sb.serviceKey}`,
      Prefer: 'count=exact',
    },
  });
  if (countRes.ok) {
    const recentRows = (await countRes.json().catch(() => [])) as unknown[];
    if (Array.isArray(recentRows) && recentRows.length >= RATE_LIMIT_PER_HOUR) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }
  }

  const insertRes = await fetch(`${sb.url}/rest/v1/soulti_wishes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: sb.serviceKey,
      Authorization: `Bearer ${sb.serviceKey}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      slug,
      text,
      signature,
      client_hash: hash,
      flagged: shouldFlag(text),
    }),
  });
  if (!insertRes.ok) {
    const err = await insertRes.text().catch(() => '');
    console.warn('[soulti/wishes] insert non-ok', insertRes.status, err.slice(0, 200));
    return NextResponse.json({ ok: false, error: 'persist_failed' }, { status: 502 });
  }
  const inserted = (await insertRes.json()) as WishRow[];
  return NextResponse.json({ ok: true, wish: inserted[0] ?? null });
}

export const dynamic = 'force-dynamic';
