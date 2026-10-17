/**
 * 树洞审核操作 — POST /api/admin/treehole/[id]/
 *
 * Body: { action: 'approve' | 'reject' }
 *   approve → visibility=public, status=approved
 *   reject  → visibility=private, status=rejected（保持私密）
 */

import { NextResponse } from 'next/server';

import { ADMIN_USER_IDS_ENV, hasConfiguredAdminUsers, isAdminUserId } from '@/lib/admin/roles';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface Body {
  action?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    /* ignore */
  }

  const action = body.action;
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const update =
    action === 'approve'
      ? { visibility: 'public', status: 'approved', reviewed_at: now }
      : { visibility: 'private', status: 'rejected', reviewed_at: now };

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from('drift_bottles')
    .update(update)
    .eq('id', id)
    .eq('visibility', 'public_pending')
    .select('id, content, risk_level, visibility, status, created_at, reviewed_at')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'not_found_or_not_pending' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    action,
    post: {
      id: data.id as string,
      content: data.content as string,
      riskLevel: (data.risk_level as string) ?? 'ok',
      visibility: data.visibility as string,
      status: data.status as string,
      createdAt: data.created_at as string,
      reviewedAt: (data.reviewed_at as string | null) ?? null,
    },
  });
}
