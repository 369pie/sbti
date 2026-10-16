/**
 * HER AURORA · 第二层「接光」｜W4 · E4.2
 *
 * GET  /api/hermosa/echo-thread?parent_id=...   → 取某条留言下的 5-7 条接龙
 * POST /api/hermosa/echo-thread { parent_id, text, signature? } → 写一句"我也"
 *
 * - 不是评论：每条 ≤ 120 字。
 * - 同 client_hash 同 parent 1 小时内最多 1 条；
 * - sigil_hash 由服务端用 client_hash + 'her-voice' salt 派生；
 * - 不允许编辑/删除（与正文保持一致：被听见即留下）。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIGIL_SALT = 'her-voice-sigil-v1';
const FOLD_LIMIT = 7;

const memoryRate = new Map<string, number>(); // key=hash:parent -> ts

function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

function deriveSigilHash(clientHashStr: string): string {
  return createHash('sha256').update(`${SIGIL_SALT}|${clientHashStr}`).digest('hex').slice(0, 24);
}

function tryAdmin() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const parentId = req.nextUrl.searchParams.get('parent_id')?.trim() ?? '';
  if (!/^[0-9a-f-]{8,}$/i.test(parentId)) {
    return NextResponse.json({ ok: false, error: 'invalid_parent_id' }, { status: 400 });
  }
  const admin = tryAdmin();
  if (!admin) return NextResponse.json({ ok: true, rows: [] });
  const { data, error } = await admin
    .from('hermosa_echoes_thread')
    .select('id, parent_id, text, signature, sigil_hash, created_at')
    .eq('parent_id', parentId)
    .eq('is_published', true)
    .eq('flagged', false)
    .order('created_at', { ascending: true })
    .limit(FOLD_LIMIT);
  if (error) {
    console.warn('[hermosa/echo-thread] select err', error.message);
    return NextResponse.json({ ok: false, error: 'select_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, rows: data ?? [], fold_limit: FOLD_LIMIT });
}

export async function POST(req: NextRequest) {
  let body: { parent_id?: string; text?: string; signature?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const parentId = typeof body.parent_id === 'string' ? body.parent_id.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const signature =
    typeof body.signature === 'string' && body.signature.trim().length
      ? body.signature.trim().slice(0, 24)
      : null;

  if (!/^[0-9a-f-]{8,}$/i.test(parentId)) {
    return NextResponse.json({ ok: false, error: 'invalid_parent_id' }, { status: 400 });
  }
  if (text.length < 1 || text.length > 120) {
    return NextResponse.json({ ok: false, error: 'invalid_text' }, { status: 400 });
  }

  const hash = clientHash(req);
  const rateKey = `${hash}:${parentId}`;
  const now = Date.now();
  for (const [k, ts] of memoryRate) {
    if (now - ts > 60 * 60 * 1000) memoryRate.delete(k);
  }
  if (memoryRate.has(rateKey)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const admin = tryAdmin();
  if (!admin) return NextResponse.json({ ok: true, persisted: false });

  const sigilHash = deriveSigilHash(hash);
  const { data, error } = await admin
    .from('hermosa_echoes_thread')
    .insert({
      parent_id: parentId,
      text,
      signature,
      sigil_hash: sigilHash,
      client_hash: hash,
    })
    .select('id, parent_id, text, signature, sigil_hash, created_at')
    .single();

  if (error) {
    console.warn('[hermosa/echo-thread] insert err', error.message);
    return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 502 });
  }

  memoryRate.set(rateKey, now);
  return NextResponse.json({ ok: true, row: data });
}
