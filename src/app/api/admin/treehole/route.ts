/**
 * 树洞审核列表 — GET /api/admin/treehole/
 *
 * 返回 visibility='public_pending' 的 drift_bottles。
 * 鉴权与 creator-review 一致：登录用户且在 ADMIN_USER_IDS 内。
 */

import { NextResponse } from 'next/server';

import { ADMIN_USER_IDS_ENV, hasConfiguredAdminUsers, isAdminUserId } from '@/lib/admin/roles';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!hasConfiguredAdminUsers()) {
    return NextResponse.json({ error: `Missing ${ADMIN_USER_IDS_ENV}` }, { status: 500 });
  }

  if (!isAdminUserId(user.id)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('drift_bottles')
    .select('id, content, risk_level, visibility, status, persona_tag, created_at, ai_reply')
    .eq('visibility', 'public_pending')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posts = (data ?? []).map((row) => ({
    id: row.id as string,
    content: row.content as string,
    riskLevel: (row.risk_level as string) ?? 'ok',
    visibility: row.visibility as string,
    status: row.status as string,
    personaTag: (row.persona_tag as string | null) ?? null,
    aiReply: (row.ai_reply as string | null) ?? null,
    createdAt: row.created_at as string,
  }));

  return NextResponse.json({ ok: true, posts, isAdmin: true });
}
