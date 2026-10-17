/**
 * 懂我 · 树洞 v1 API（evolve drift_bottles）
 *
 * GET  → { mine, feed, limits }
 * POST { action:
 *   'write'          — private mood + AI reply (+ crisis path)
 *   'request_publish'— queue anonymous public (review-before-publish)
 *   'hug' | 'also_me'— structured reactions only (no free-text DM)
 *   'feed'           — refresh public feed
 *   // legacy: throw/pick/reply kept minimal for old clients
 * }
 */
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withAuth } from '@/lib/supabase/with-auth';
import { generateTreeholeReply } from '@/lib/treehole/ai-reply';
import { crisisPayload } from '@/lib/treehole/crisis';
import { moderateLocal, moderateWithUpstream } from '@/lib/treehole/moderation';

export const dynamic = 'force-dynamic';

const WRITE_LIMIT = 5;
const CONTENT_MAX = 500;
const FEED_LIMIT = 20;

type Visibility = 'private' | 'public_pending' | 'public';

interface BottleRow {
  id: string;
  content: string;
  persona_tag: string | null;
  hug_count: number;
  reply_count: number;
  also_me_count?: number;
  status: string;
  visibility?: Visibility;
  ai_reply?: string | null;
  risk_level?: string;
  created_at: string;
}

function todayStartISO(): string {
  // Asia/Shanghai day boundary ≈ UTC+8
  const now = new Date(Date.now() + 8 * 3600_000);
  const ymd = now.toISOString().slice(0, 10);
  return new Date(`${ymd}T00:00:00+08:00`).toISOString();
}

function publicShape(row: BottleRow, extras?: { mine?: boolean; hugged?: boolean; alsoMe?: boolean }) {
  return {
    id: row.id,
    content: row.content,
    personaTag: row.persona_tag,
    hugs: row.hug_count,
    alsoMe: row.also_me_count ?? 0,
    replies: row.reply_count,
    visibility: (row.visibility ?? 'private') as Visibility,
    aiReply: row.ai_reply ?? null,
    riskLevel: row.risk_level ?? 'ok',
    status: row.status,
    createdAt: row.created_at,
    mine: extras?.mine ?? false,
    hugged: extras?.hugged ?? false,
    iAlsoMe: extras?.alsoMe ?? false,
  };
}


export const GET = withAuth(async (_req: NextRequest, _ctx, user: User) => {
  const admin = createAdminSupabaseClient();
  const todayStart = todayStartISO();

  const [writtenRes, myRes, feedRes] = await Promise.all([
    admin
      .from('drift_bottles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart),
    admin
      .from('drift_bottles')
      .select(
        'id, content, persona_tag, hug_count, reply_count, also_me_count, status, visibility, ai_reply, risk_level, created_at',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    admin
      .from('drift_bottles')
      .select(
        'id, content, persona_tag, hug_count, reply_count, also_me_count, status, visibility, ai_reply, risk_level, created_at',
      )
      .eq('status', 'approved')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT),
  ]);

  // My reactions on feed items
  const feedIds = (feedRes.data ?? []).map((r) => r.id as string);
  let reactionMap = new Map<string, { liked: boolean; also_me: boolean }>();
  if (feedIds.length > 0) {
    const { data: picks } = await admin
      .from('drift_bottle_pickups')
      .select('bottle_id, liked, also_me')
      .eq('picker_id', user.id)
      .in('bottle_id', feedIds);
    reactionMap = new Map(
      (picks ?? []).map((p) => [p.bottle_id as string, { liked: !!p.liked, also_me: !!p.also_me }]),
    );
  }

  return NextResponse.json({
    ok: true,
    todayWritten: writtenRes.count ?? 0,
    writeLimit: WRITE_LIMIT,
    mine: (myRes.data ?? []).map((row) => publicShape(row as BottleRow, { mine: true })),
    feed: (feedRes.data ?? []).map((row) => {
      const r = reactionMap.get(row.id as string);
      return publicShape(row as BottleRow, {
        mine: false,
        hugged: r?.liked,
        alsoMe: r?.also_me,
      });
    }),
    // Legacy fields for old clients
    eligible: true,
    todayThrown: writtenRes.count ?? 0,
    throwLimit: WRITE_LIMIT,
    todayPicked: 0,
    pickLimit: 0,
    myBottles: (myRes.data ?? []).map((row) => publicShape(row as BottleRow, { mine: true })),
    pickedToday: [],
  });
});

export const POST = withAuth(async (req: NextRequest, _ctx, user: User) => {
  let body: {
    action?: unknown;
    content?: unknown;
    personaTag?: unknown;
    bottleId?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const action = typeof body.action === 'string' ? body.action : '';
  const admin = createAdminSupabaseClient();
  const todayStart = todayStartISO();

  try {
    if (action === 'write' || action === 'throw') {
      const content = typeof body.content === 'string' ? body.content.trim().slice(0, CONTENT_MAX) : '';
      if (!content) return NextResponse.json({ error: 'empty_content' }, { status: 400 });

      const { count } = await admin
        .from('drift_bottles')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart);
      if ((count ?? 0) >= WRITE_LIMIT) {
        return NextResponse.json({ error: 'write_limit_reached' }, { status: 429 });
      }

      const local = moderateLocal(content);
      const mod = await moderateWithUpstream(content, local);

      if (mod.risk === 'blocked') {
        return NextResponse.json({
          ok: false,
          error: 'blocked',
          message: '这句过不了审（涉导流或敏感内容），换一句说说心情吧。',
        }, { status: 400 });
      }

      const isCrisis = mod.risk === 'self_harm';
      const { reply, stub } = await generateTreeholeReply(content, { crisis: isCrisis });

      const personaTag =
        typeof body.personaTag === 'string' && body.personaTag.trim()
          ? body.personaTag.trim().slice(0, 24)
          : null;

      // Always private on write. Crisis never leaves private.
      const insertRow = {
        user_id: user.id,
        content,
        persona_tag: personaTag,
        status: isCrisis ? 'rejected' : 'pending', // pending until optional publish+review
        visibility: 'private' as Visibility,
        ai_reply: reply,
        risk_level: mod.risk,
        reviewed_at: new Date().toISOString(),
      };

      const { data: saved, error } = await admin
        .from('drift_bottles')
        .insert(insertRow)
        .select(
          'id, content, persona_tag, hug_count, reply_count, also_me_count, status, visibility, ai_reply, risk_level, created_at',
        )
        .maybeSingle();

      if (error) throw new Error(`bottle_insert_failed: ${error.message}`);

      return NextResponse.json({
        ok: true,
        status: insertRow.status,
        visibility: 'private',
        stubAi: stub,
        post: saved ? publicShape(saved as BottleRow, { mine: true }) : null,
        crisis: isCrisis ? crisisPayload() : null,
        // legacy
        message: isCrisis ? 'kept_private_crisis' : 'saved_private',
      });
    }

    if (action === 'request_publish') {
      const bottleId = typeof body.bottleId === 'string' ? body.bottleId : '';
      if (!bottleId) return NextResponse.json({ error: 'invalid_params' }, { status: 400 });

      const { data: row } = await admin
        .from('drift_bottles')
        .select('id, user_id, risk_level, visibility, status')
        .eq('id', bottleId)
        .maybeSingle();

      if (!row || row.user_id !== user.id) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      if (row.risk_level === 'self_harm' || row.risk_level === 'blocked') {
        return NextResponse.json({
          ok: false,
          error: 'cannot_publish',
          message: '这条会一直只留给你自己，不公开。',
          crisis: row.risk_level === 'self_harm' ? crisisPayload() : null,
        }, { status: 403 });
      }
      if (row.visibility === 'public') {
        return NextResponse.json({ ok: true, visibility: 'public', already: true });
      }

      const { error } = await admin
        .from('drift_bottles')
        .update({
          visibility: 'public_pending',
          status: 'pending',
          reviewed_at: null,
        })
        .eq('id', bottleId)
        .eq('user_id', user.id);

      if (error) throw new Error(`publish_queue_failed: ${error.message}`);

      return NextResponse.json({
        ok: true,
        visibility: 'public_pending',
        message: '已排队审核，通过后才会匿名出现在树洞里。',
      });
    }

    if (action === 'hug' || action === 'also_me') {
      const bottleId = typeof body.bottleId === 'string' ? body.bottleId : '';
      if (!bottleId) return NextResponse.json({ error: 'invalid_params' }, { status: 400 });

      const { data: bottle } = await admin
        .from('drift_bottles')
        .select('id, user_id, hug_count, also_me_count, visibility, status')
        .eq('id', bottleId)
        .maybeSingle();

      if (!bottle) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      if (bottle.user_id === user.id) {
        return NextResponse.json({ error: 'cannot_react_own' }, { status: 400 });
      }
      if (!(bottle.visibility === 'public' && bottle.status === 'approved')) {
        return NextResponse.json({ error: 'not_public' }, { status: 403 });
      }

      // Upsert pickup row as reaction carrier (no free-text)
      const { data: existing } = await admin
        .from('drift_bottle_pickups')
        .select('id, liked, also_me')
        .eq('bottle_id', bottleId)
        .eq('picker_id', user.id)
        .maybeSingle();

      if (action === 'hug') {
        if (existing?.liked) return NextResponse.json({ ok: true, already: true });
        if (existing) {
          await admin.from('drift_bottle_pickups').update({ liked: true }).eq('id', existing.id);
        } else {
          await admin.from('drift_bottle_pickups').insert({
            bottle_id: bottleId,
            picker_id: user.id,
            liked: true,
            also_me: false,
          });
        }
        await admin
          .from('drift_bottles')
          .update({ hug_count: (bottle.hug_count as number) + 1 })
          .eq('id', bottleId);
        return NextResponse.json({ ok: true, kind: 'hug' });
      }

      // also_me
      if (existing?.also_me) return NextResponse.json({ ok: true, already: true });
      if (existing) {
        await admin.from('drift_bottle_pickups').update({ also_me: true }).eq('id', existing.id);
      } else {
        await admin.from('drift_bottle_pickups').insert({
          bottle_id: bottleId,
          picker_id: user.id,
          liked: false,
          also_me: true,
        });
      }
      await admin
        .from('drift_bottles')
        .update({ also_me_count: ((bottle.also_me_count as number) ?? 0) + 1 })
        .eq('id', bottleId);
      return NextResponse.json({ ok: true, kind: 'also_me' });
    }

    // Legacy pick/reply: disable free-text stranger reply (plan: no DM)
    if (action === 'pick') {
      return NextResponse.json({
        ok: true,
        bottles: [],
        empty: true,
        message: '树洞改版：请在公开列表里抱抱 / 我也是',
      });
    }
    if (action === 'reply') {
      return NextResponse.json({
        error: 'reply_disabled',
        message: '不能再给陌生人发自由文字啦，只能抱抱或点「我也是」。',
      }, { status: 403 });
    }

    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[api/bottles]', message);
    return NextResponse.json({ error: 'bottle_op_failed', message }, { status: 500 });
  }
});

