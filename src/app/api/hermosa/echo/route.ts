/**
 * HERMOSA · 共鸣 +1（不允许评论，只允许"懂"）
 *
 * POST /api/hermosa/echo  { id }
 *
 * - 调用 increment_hermosa_echo RPC，仅自增 1。
 * - 同 client_hash 同 message id 1 小时内仅记 1 次（软去重）。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const memoryDedupe = new Map<string, number>(); // key -> ts

function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

function tryAdmin() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!/^[0-9a-f-]{8,}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 });
  }

  const hash = clientHash(req);
  const dedupeKey = `${hash}:${id}`;
  const now = Date.now();
  // GC: drop entries older than 1h
  for (const [k, ts] of memoryDedupe) {
    if (now - ts > 60 * 60 * 1000) memoryDedupe.delete(k);
  }
  if (memoryDedupe.has(dedupeKey)) {
    return NextResponse.json({ ok: true, deduped: true });
  }
  memoryDedupe.set(dedupeKey, now);

  const admin = tryAdmin();
  if (!admin) return NextResponse.json({ ok: true, persisted: false });

  const { data, error } = await admin.rpc('increment_hermosa_echo', { message_id: id });
  if (error) {
    console.warn('[hermosa/echo] rpc err', error.message);
    return NextResponse.json({ ok: false, error: 'rpc_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, echo_count: data });
}
