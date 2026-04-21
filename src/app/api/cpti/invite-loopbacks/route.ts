import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { withAuth } from '@/lib/supabase/with-auth';
import {
  createInviteLoopback,
  listPendingInviteLoopbacks,
} from '@/lib/cpti/invite-loopback-server';

function clamp(value: unknown, max = 64): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export const GET = withAuth(async (
  _req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  try {
    const notifications = await listPendingInviteLoopbacks(user.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('[cpti/invite-loopbacks GET] Failed:', error);
    return NextResponse.json({ error: 'Failed to load invite notifications' }, { status: 500 });
  }
});

export const POST = withAuth(async (
  req: NextRequest,
  _context: { params: Promise<Record<string, string>> },
  user: User,
) => {
  let body: { relationshipSlug?: unknown };
  try {
    body = (await req.json()) as { relationshipSlug?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const relationshipSlug = clamp(body.relationshipSlug);
  if (!relationshipSlug) {
    return NextResponse.json({ error: 'relationship_slug_required' }, { status: 400 });
  }

  try {
    const invite = await createInviteLoopback({
      inviterUserId: user.id,
      relationshipSlug,
    });
    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error('[cpti/invite-loopbacks POST] Failed:', error);
    return NextResponse.json({ error: 'Failed to create invite link' }, { status: 500 });
  }
});