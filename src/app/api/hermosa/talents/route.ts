/**
 * HERMOSA · 她说·沙龙｜Talent 档案 API
 *
 * GET   /api/hermosa/talents               → 公开名录（前端 talents 页 / 商业索引）
 * POST  /api/hermosa/talents               → 新建档案，返回 { id, edit_token }
 * PATCH /api/hermosa/talents               → 编辑（需要 id + edit_token）
 *
 * 反垃圾：
 * - client_hash 1h ≤ 1 次新建（编辑不限）
 * - handle/pitch 关键词软过滤（与 messages 一致）
 * - 不暴露 contact_email / edit_token / client_hash 给 anon 查询
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { isHermosaUniverse } from '@/lib/hermosa/tags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_HANDLE = 24;
const MAX_PITCH = 140;
const MAX_SKILL = 12;
const MAX_SKILLS = 3;
const MAX_NOTE = 80;
const MAX_EMAIL = 120;
const RATE_LIMIT_PER_HOUR = 1;
/**
 * Salon 准入闸门：必须先在主墙留过至少 N 条留言（基于 client_hash），
 * 否则不能开 Talent 档案。这是"贡献优先"的信任货币。
 */
const ECHO_GATE_MIN_CONTRIBUTIONS = 1;

interface DbRow {
  id: string;
  handle: string;
  pitch: string;
  skills: string[];
  universe: string | null;
  slug: string | null;
  contact_note: string | null;
  is_open_to_collab: boolean;
  curation_status: string;
  created_at: string;
}

interface PublicRow extends DbRow {
  /** 是否预留了联系通道（true 表示项目方可发起 Whisper；不暴露邮箱本身） */
  contactable: boolean;
}

function clientHash(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

function sanitizeOneLine(input: unknown, max: number): string {
  if (typeof input !== 'string') return '';
  return input.replace(/\s+/g, ' ').trim().slice(0, max);
}

function sanitizeSkills(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const v = raw.replace(/\s+/g, '').trim().slice(0, MAX_SKILL);
    if (v && !out.includes(v)) out.push(v);
    if (out.length >= MAX_SKILLS) break;
  }
  return out;
}

function shouldFlag(text: string): boolean {
  return /https?:\/\/|t\.me\/|wechat|微信号|加我|联系我|wxid_/i.test(text);
}

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function tryAdmin() {
  try {
    return createAdminSupabaseClient();
  } catch {
    return null;
  }
}

function publicShape(row: DbRow & { contact_email: string | null }): PublicRow {
  const { contact_email, ...rest } = row;
  return { ...rest, contactable: Boolean(contact_email && contact_email.length > 0) };
}

const PUBLIC_COLS =
  'id,handle,pitch,skills,universe,slug,contact_email,contact_note,is_open_to_collab,curation_status,created_at';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const skill = sp.get('skill')?.trim().slice(0, MAX_SKILL);
  const universe = sp.get('universe');
  const limitRaw = Number(sp.get('limit') ?? '36');
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 36, 1), 60);
  const id = sp.get('id')?.trim().slice(0, 64);
  const editToken = sp.get('edit_token')?.trim().slice(0, 128);

  const admin = tryAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, talents: [] as PublicRow[] });
  }

  // Owner-mode: GET /api/hermosa/talents?id=X&edit_token=Y
  // Returns the full row (no email leak — still stripped) + whisper inbox stats.
  if (id) {
    const { data: row, error: rowErr } = await admin
      .from('hermosa_talents')
      .select(`${PUBLIC_COLS},edit_token,is_published,flagged`)
      .eq('id', id)
      .maybeSingle();
    if (rowErr || !row) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    }
    const owned =
      typeof editToken === 'string' &&
      editToken.length > 0 &&
      (row as { edit_token: string }).edit_token === editToken;

    const publicRow = publicShape(row as DbRow & { contact_email: string | null });

    if (owned) {
      const { count: deliveredCount } = await admin
        .from('hermosa_whispers')
        .select('id', { count: 'exact', head: true })
        .eq('talent_id', id)
        .eq('delivered', true);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: weekCount } = await admin
        .from('hermosa_whispers')
        .select('id', { count: 'exact', head: true })
        .eq('talent_id', id)
        .eq('delivered', true)
        .gte('created_at', oneWeekAgo);
      return NextResponse.json({
        ok: true,
        talent: publicRow,
        stats: { whispers_total: deliveredCount ?? 0, whispers_7d: weekCount ?? 0 },
      });
    }

    // Not owner: still allow public read of basic shape (used by /her-voice/talents/[id])
    if (
      !(row as { is_published: boolean; flagged: boolean }).is_published ||
      (row as { flagged: boolean }).flagged
    ) {
      return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 410 });
    }
    return NextResponse.json({ ok: true, talent: publicRow });
  }

  let q = admin
    .from('hermosa_talents')
    .select(PUBLIC_COLS)
    .eq('is_published', true)
    .eq('flagged', false)
    .eq('is_open_to_collab', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (skill) {
    q = q.contains('skills', [skill]);
  }
  if (universe && isHermosaUniverse(universe)) {
    q = q.eq('universe', universe);
  }

  const { data, error } = await q;
  if (error) {
    console.warn('[hermosa.talents] GET error', error.message);
    return NextResponse.json({ ok: true, talents: [] as PublicRow[] });
  }
  const talents = ((data ?? []) as Array<DbRow & { contact_email: string | null }>).map(publicShape);
  return NextResponse.json({ ok: true, talents });
}

interface PostBody {
  handle?: unknown;
  pitch?: unknown;
  skills?: unknown;
  universe?: unknown;
  slug?: unknown;
  contact_email?: unknown;
  contact_note?: unknown;
  source_msg_id?: unknown;
}

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const handle = sanitizeOneLine(body.handle, MAX_HANDLE);
  const pitch = sanitizeOneLine(body.pitch, MAX_PITCH);
  const skills = sanitizeSkills(body.skills);
  if (!handle) return NextResponse.json({ ok: false, error: 'empty_handle' }, { status: 400 });
  if (!pitch) return NextResponse.json({ ok: false, error: 'empty_pitch' }, { status: 400 });

  const universe =
    typeof body.universe === 'string' && isHermosaUniverse(body.universe) ? body.universe : null;
  const slug =
    typeof body.slug === 'string' && body.slug.trim().length > 0
      ? body.slug.trim().slice(0, 80)
      : null;
  const note = sanitizeOneLine(body.contact_note, MAX_NOTE) || null;
  const emailRaw = sanitizeOneLine(body.contact_email, MAX_EMAIL);
  const contact_email = emailRaw && isLikelyEmail(emailRaw) ? emailRaw : null;
  const sourceMsgId =
    typeof body.source_msg_id === 'string' && body.source_msg_id.length > 0
      ? body.source_msg_id.slice(0, 64)
      : null;

  const flagged = shouldFlag(`${handle} ${pitch} ${note ?? ''}`);
  const cHash = clientHash(req);

  const admin = tryAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }

  // 限频：1h ≤ 1
  const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('hermosa_talents')
    .select('id', { count: 'exact', head: true })
    .eq('client_hash', cHash)
    .gte('created_at', sinceIso);
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  // Echo 准入闸门：source_msg_id 命中且属于本 client_hash 即放行；
  // 否则按 client_hash 上的历史留言数 ≥ ECHO_GATE_MIN_CONTRIBUTIONS 才允许。
  let eligible = false;
  if (sourceMsgId) {
    const { data: srcRow } = await admin
      .from('hermosa_messages')
      .select('id,client_hash,is_published,flagged')
      .eq('id', sourceMsgId)
      .maybeSingle();
    if (
      srcRow &&
      (srcRow as { client_hash: string | null }).client_hash === cHash &&
      (srcRow as { is_published: boolean }).is_published &&
      !(srcRow as { flagged: boolean }).flagged
    ) {
      eligible = true;
    }
  }
  if (!eligible) {
    const { count: contribCount } = await admin
      .from('hermosa_messages')
      .select('id', { count: 'exact', head: true })
      .eq('client_hash', cHash)
      .eq('is_published', true)
      .eq('flagged', false);
    if ((contribCount ?? 0) >= ECHO_GATE_MIN_CONTRIBUTIONS) eligible = true;
  }
  if (!eligible) {
    return NextResponse.json(
      {
        ok: false,
        error: 'not_qualified',
        gate: { min_contributions: ECHO_GATE_MIN_CONTRIBUTIONS },
      },
      { status: 403 },
    );
  }

  const editToken = randomBytes(24).toString('base64url');
  const insertPayload = {
    handle,
    pitch,
    skills,
    universe,
    slug,
    contact_email,
    contact_note: note,
    is_open_to_collab: true,
    is_published: true,
    flagged,
    edit_token: editToken,
    client_hash: cHash,
    source_msg_id: sourceMsgId,
  };
  const { data, error } = await admin
    .from('hermosa_talents')
    .insert(insertPayload)
    .select(`${PUBLIC_COLS},edit_token`)
    .single();
  if (error || !data) {
    console.warn('[hermosa.talents] POST insert error', error?.message);
    return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 });
  }
  const row = data as DbRow & { contact_email: string | null; edit_token: string };
  return NextResponse.json({
    ok: true,
    talent: publicShape(row),
    edit_token: row.edit_token,
  });
}

interface PatchBody {
  id?: unknown;
  edit_token?: unknown;
  handle?: unknown;
  pitch?: unknown;
  skills?: unknown;
  contact_email?: unknown;
  contact_note?: unknown;
  is_open_to_collab?: unknown;
  delete?: unknown;
}

export async function PATCH(req: NextRequest) {
  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const id = typeof body.id === 'string' ? body.id : '';
  const token = typeof body.edit_token === 'string' ? body.edit_token : '';
  if (!id || !token) {
    return NextResponse.json({ ok: false, error: 'missing_credentials' }, { status: 400 });
  }

  const admin = tryAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }

  // 校验 token
  const { data: existing, error: existingErr } = await admin
    .from('hermosa_talents')
    .select('id,edit_token')
    .eq('id', id)
    .maybeSingle();
  if (existingErr || !existing) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  if ((existing as { edit_token: string }).edit_token !== token) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  if (body.delete === true) {
    const { error: delErr } = await admin.from('hermosa_talents').delete().eq('id', id);
    if (delErr) {
      return NextResponse.json({ ok: false, error: 'delete_failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, deleted: true });
  }

  const patch: Record<string, unknown> = {};
  if (body.handle !== undefined) {
    const v = sanitizeOneLine(body.handle, MAX_HANDLE);
    if (!v) return NextResponse.json({ ok: false, error: 'empty_handle' }, { status: 400 });
    patch.handle = v;
  }
  if (body.pitch !== undefined) {
    const v = sanitizeOneLine(body.pitch, MAX_PITCH);
    if (!v) return NextResponse.json({ ok: false, error: 'empty_pitch' }, { status: 400 });
    patch.pitch = v;
  }
  if (body.skills !== undefined) patch.skills = sanitizeSkills(body.skills);
  if (body.contact_email !== undefined) {
    const v = sanitizeOneLine(body.contact_email, MAX_EMAIL);
    patch.contact_email = v && isLikelyEmail(v) ? v : null;
  }
  if (body.contact_note !== undefined) {
    const v = sanitizeOneLine(body.contact_note, MAX_NOTE);
    patch.contact_note = v || null;
  }
  if (typeof body.is_open_to_collab === 'boolean') {
    patch.is_open_to_collab = body.is_open_to_collab;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: 'no_changes' }, { status: 400 });
  }

  // 软过滤：handle/pitch/note 任一命中 => 自动 flagged
  const candidate = `${patch.handle ?? ''} ${patch.pitch ?? ''} ${patch.contact_note ?? ''}`;
  if (candidate.trim() && shouldFlag(candidate)) {
    patch.flagged = true;
  }

  const { data, error } = await admin
    .from('hermosa_talents')
    .update(patch)
    .eq('id', id)
    .select(PUBLIC_COLS)
    .single();
  if (error || !data) {
    console.warn('[hermosa.talents] PATCH update error', error?.message);
    return NextResponse.json({ ok: false, error: 'update_failed' }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    talent: publicShape(data as DbRow & { contact_email: string | null }),
  });
}
