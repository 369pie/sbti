import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('nickname, avatar_url, headline, identity_stage, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[users/me GET] Failed to fetch profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    const meta = user.user_metadata ?? {};

    return NextResponse.json({
      userId: user.id,
      username: (meta.username as string) || '',
      nickname: profile?.nickname ?? (meta.nickname as string) ?? '',
      displayName: (meta.nickname as string) || (meta.display_name as string) || (meta.username as string) || '旅行者',
      avatarUrl: profile?.avatar_url ?? (meta.avatar_url as string) ?? null,
      headline: profile?.headline ?? (meta.headline as string) ?? '',
      identityStage: profile?.identity_stage ?? 'anonymous',
      createdAt: profile?.created_at ?? user.created_at,
      updatedAt: profile?.updated_at ?? null,
    });
  } catch (error) {
    console.error('[users/me GET] Failed to fetch profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    const body = await req.json();
    const { nickname, headline, avatarUrl } = body as {
      nickname?: string;
      headline?: string;
      avatarUrl?: string;
    };

    const admin = createAdminSupabaseClient();
    const updates: { nickname?: string; headline?: string; avatar_url?: string } = {};
    const metaUpdates: Record<string, unknown> = {};

    if (nickname !== undefined) {
      const trimmed = nickname.trim();
      if (trimmed.length > 32) {
        return NextResponse.json({ error: 'Nickname too long (max 32)' }, { status: 400 });
      }
      updates.nickname = trimmed;
      metaUpdates.nickname = trimmed;
      metaUpdates.display_name = trimmed || (user.user_metadata?.username as string) || '旅行者';
    }

    if (headline !== undefined) {
      updates.headline = headline.trim();
    }

    if (avatarUrl !== undefined) {
      updates.avatar_url = avatarUrl.trim();
      metaUpdates.avatar_url = avatarUrl.trim();
    }

    // Update auth metadata
    if (Object.keys(metaUpdates).length > 0) {
      const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, ...metaUpdates },
      });
      if (authError) {
        console.error('[users/me PATCH] Failed to update auth metadata:', authError);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
    }

    // Update public profile
    if (Object.keys(updates).length > 0) {
      const { error: profileError } = await admin
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('[users/me PATCH] Failed to update user_profiles:', profileError);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
    }

    return NextResponse.json({
      userId: user.id,
      nickname: nickname ?? (user.user_metadata?.nickname as string) ?? '',
      headline: headline ?? (user.user_metadata?.headline as string) ?? '',
      avatarUrl: avatarUrl ?? (user.user_metadata?.avatar_url as string) ?? null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[users/me PATCH] Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
});
