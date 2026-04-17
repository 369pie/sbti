/**
 * Admin approve/reject (E-05) — POST /api/admin/creator-review/[id]
 *
 * Body: { action: 'approve' | 'reject', note?: string }
 *   approve → status='live', published_at=now()
 *   reject  → status='draft', review_note=note
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { ADMIN_USER_IDS_ENV, hasConfiguredAdminUsers, isAdminUserId } from '@/lib/admin/roles';
import { formatReviewFeedback, isReviewReasonKey } from '@/lib/ugc/review-feedback';

interface Body { action?: string; note?: string; reasonKey?: string }

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!hasConfiguredAdminUsers()) {
    return NextResponse.json(
      { error: `Missing ${ADMIN_USER_IDS_ENV}` },
      { status: 500 }
    );
  }

  if (!isAdminUserId(user.id)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const adminSupabase = createAdminSupabaseClient();

  let body: Body = {};
  try { body = (await request.json()) as Body; } catch { /* ignore */ }

  const action = body.action;
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  }

  const reasonKey = isReviewReasonKey(body.reasonKey) ? body.reasonKey : 'other';

  const update = action === 'approve'
    ? { status: 'published', published_at: new Date().toISOString(), review_note: null }
    : { status: 'draft', review_note: formatReviewFeedback(reasonKey, (body.note ?? '').slice(0, 500)) };

  const { data, error } = await adminSupabase
    .from('creator_universes')
    .update(update)
    .eq('id', id)
    .eq('status', 'review')
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ universe: data, action });
}
