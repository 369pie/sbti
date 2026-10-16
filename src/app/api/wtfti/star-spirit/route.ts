/**
 * GET  /api/wtfti/star-spirit → 星灵状态
 * POST /api/wtfti/star-spirit { action: 'water' | 'earn' | 'name', source?, personalitySlug?, name? }
 *
 * Auth: withAuth（匿名会话即可，全站基础身份）。
 */

import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from '@/lib/supabase/with-auth';
import { earnStarDust, getStarSpiritState, nameStarSpirit, waterStarSpirit } from '@/lib/wtfi/star-spirit-server';
import { STAR_DUST_AMOUNT, type StarDustSource } from '@/lib/wtfi/star-spirit';

export const dynamic = 'force-dynamic';

const SOURCES = new Set(Object.keys(STAR_DUST_AMOUNT) as StarDustSource[]);

export const GET = withAuth(async (_req: NextRequest, _ctx, user) => {
  const state = await getStarSpiritState(user.id);
  return NextResponse.json(state);
});

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
  let body: {
    action?: unknown;
    source?: unknown;
    personalitySlug?: unknown;
    name?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const action = typeof body.action === 'string' ? body.action : '';

  try {
    if (action === 'water') {
      const result = await waterStarSpirit(user.id);
      return NextResponse.json(result);
    }
    if (action === 'earn') {
      const source = typeof body.source === 'string' ? (body.source as StarDustSource) : null;
      if (!source || !SOURCES.has(source)) {
        return NextResponse.json({ error: 'invalid_source' }, { status: 400 });
      }
      const personalitySlug =
        typeof body.personalitySlug === 'string' && body.personalitySlug.trim()
          ? body.personalitySlug.trim().slice(0, 64)
          : null;
      const result = await earnStarDust(user.id, source, { personalitySlug });
      return NextResponse.json(result);
    }
    if (action === 'name') {
      const name = typeof body.name === 'string' ? body.name : '';
      const state = await nameStarSpirit(user.id, name);
      return NextResponse.json({ state });
    }
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: 'star_spirit_op_failed', message }, { status: 500 });
  }
});
