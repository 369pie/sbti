/**
 * Admin review list (E-05) — GET /api/admin/creator-review
 *
 * Returns all creator_universes in status='review'. Admin gate via
 * ADMIN_USER_IDS env var (comma-separated Supabase user IDs). This keeps
 * things simple until we add a proper roles table.
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { ADMIN_USER_IDS_ENV, hasConfiguredAdminUsers, isAdminUserId } from '@/lib/admin/roles';

export async function GET() {
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

  const { data, error } = await adminSupabase
    .from('creator_universes')
    .select('id, slug, name, emoji, description, status, submitted_at, updated_at, creator_id, primary_color, review_note, creators(name)')
    .eq('status', 'review')
    .order('submitted_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const universes = (data ?? []).map((row) => {
    const creator = row.creators as unknown as { name?: string } | null;
    return {
      ...row,
      creator_name: creator?.name ?? '匿名创作者',
    };
  });

  return NextResponse.json({ universes, isAdmin: true });
}
