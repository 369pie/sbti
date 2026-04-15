import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase/with-auth';
import type { User } from '@supabase/supabase-js';

// TODO: Fetch/update user profile from Supabase 'users' table

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User
) => {
  try {
    return NextResponse.json({
      userId: user.id,
      nickname: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
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
    const { nickname, avatarUrl } = body as {
      nickname?: string;
      avatarUrl?: string;
    };

    return NextResponse.json({
      userId: user.id,
      nickname: nickname ?? null,
      avatarUrl: avatarUrl ?? null,
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
