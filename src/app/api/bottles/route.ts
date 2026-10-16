/**
 * Drift Bottles · 漂流瓶 API（P1 MVP · wtfti-mass-market-repositioning-2026-08.md §4）
 *
 * GET  /api/bottles  → { eligible, todayThrown, todayPicked, limits, myBottles, pickedToday }
 * POST /api/bottles  { action: 'throw' | 'pick' | 'reply' | 'hug', ... }
 *
 * 规则：
 *  - 扔瓶 3/天、捞瓶 3/天、回复 5/天（服务端频控）
 *  - 捞瓶需完成过测试（wtfti_galaxy_results 有记录 —— Soul 逻辑：测试是入场券）
 *  - 内容安全（生死线）：关键词机器审 pending→approved/rejected；人工抽审后续接入 admin
 *  - 同一瓶同一人只捞一次；每瓶最多被捞 20 次后沉底
 *
 * Auth: withAuth（匿名会话即可）。跨用户读写走 admin client（RLS owner-only）。
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { withAuth } from '@/lib/supabase/with-auth';

export const dynamic = 'force-dynamic';

const THROW_LIMIT = 3;
const PICK_LIMIT = 3;
const REPLY_LIMIT = 5;
const MAX_PICKUPS_PER_BOTTLE = 20;
const BOTTLE_TTL_DAYS = 30;
const CONTENT_MAX = 100;

/** MVP 关键词过滤（粗筛 + 反导流）。人工抽审与更完整词库列 P2。 */
const BLOCKLIST: Array<string | RegExp> = [
  /微信|加微|vx|wx号|扣扣|加qq|qq群/i,
  /刷单|代购|贷款|办证|发票|彩票|赌博|六合彩|博彩/i,
  /毒品|冰毒|大麻|枪支|弹药/i,
  /约炮|一夜情|裸聊|援交|特殊服务/i,
  /自残|自杀方法|轻生方法/i,
];

function moderate(content: string): 'approved' | 'rejected' {
  for (const rule of BLOCKLIST) {
    if (typeof rule === 'string' ? content.includes(rule) : rule.test(content)) {
      return 'rejected';
    }
  }
  return 'approved';
}

function todayStartISO(): string {
  return new Date().toISOString().slice(0, 10) + 'T00:00:00Z';
}

interface BottleRow {
  id: string;
  content: string;
  persona_tag: string | null;
  hug_count: number;
  reply_count: number;
  pickup_count: number;
  status: string;
  created_at: string;
}

function publicBottle(row: BottleRow) {
  return {
    id: row.id,
    content: row.content,
    personaTag: row.persona_tag,
    hugs: row.hug_count,
    replies: row.reply_count,
    createdAt: row.created_at,
  };
}

export const GET = withAuth(async (_req: NextRequest, _ctx, user) => {
  const admin = createAdminSupabaseClient();
  const todayStart = todayStartISO();

  const [galaxyRes, thrownRes, pickedRes, myRes, myPickRes] = await Promise.all([
    admin.from('wtfti_galaxy_results').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    admin
      .from('drift_bottles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart),
    admin
      .from('drift_bottle_pickups')
      .select('id', { count: 'exact', head: true })
      .eq('picker_id', user.id)
      .gte('created_at', todayStart),
    admin
      .from('drift_bottles')
      .select('id, content, persona_tag, hug_count, reply_count, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('drift_bottle_pickups')
      .select('bottle_id, liked, drift_bottles(id, content, persona_tag, hug_count, reply_count, created_at)')
      .eq('picker_id', user.id)
      .gte('created_at', todayStart),
  ]);

  const pickedToday = (myPickRes.data ?? [])
    .filter((p) => (p.drift_bottles as unknown as BottleRow | null) != null)
    .map((p) => ({
      ...publicBottle((p.drift_bottles as unknown as BottleRow[])[0] ?? (p.drift_bottles as unknown as BottleRow)),
      hugged: p.liked === true,
      mine: false,
    }));

  return NextResponse.json({
    eligible: (galaxyRes.count ?? 0) > 0,
    todayThrown: thrownRes.count ?? 0,
    throwLimit: THROW_LIMIT,
    todayPicked: pickedRes.count ?? 0,
    pickLimit: PICK_LIMIT,
    myBottles: (myRes.data ?? []).map((row) => ({ ...publicBottle(row as BottleRow), mine: true })),
    pickedToday,
  });
});

export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
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
    if (action === 'throw') {
      const content = typeof body.content === 'string' ? body.content.trim().slice(0, CONTENT_MAX) : '';
      if (!content) return NextResponse.json({ error: 'empty_content' }, { status: 400 });

      const { count } = await admin
        .from('drift_bottles')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart);
      if ((count ?? 0) >= THROW_LIMIT) {
        return NextResponse.json({ error: 'throw_limit_reached' }, { status: 429 });
      }

      const personaTag =
        typeof body.personaTag === 'string' && body.personaTag.trim()
          ? body.personaTag.trim().slice(0, 24)
          : null;
      const status = moderate(content);
      const { error } = await admin.from('drift_bottles').insert({
        user_id: user.id,
        content,
        persona_tag: personaTag,
        status,
        reviewed_at: new Date().toISOString(),
      });
      if (error) throw new Error(`bottle_insert_failed: ${error.message}`);

      return NextResponse.json({ ok: true, status });
    }

    if (action === 'pick') {
      // 资格：测过才能捞（Soul 逻辑）
      const { count: galaxyCount } = await admin
        .from('wtfti_galaxy_results')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if ((galaxyCount ?? 0) === 0) {
        return NextResponse.json({ error: 'need_test_first' }, { status: 403 });
      }

      const { count: pickedToday } = await admin
        .from('drift_bottle_pickups')
        .select('id', { count: 'exact', head: true })
        .eq('picker_id', user.id)
        .gte('created_at', todayStart);
      const remaining = Math.max(0, PICK_LIMIT - (pickedToday ?? 0));
      if (remaining === 0) {
        return NextResponse.json({ error: 'pick_limit_reached', remaining: 0 }, { status: 429 });
      }

      // 候选池：已过审、未沉底、30 天内、不是自己的
      const ttl = new Date(Date.now() - BOTTLE_TTL_DAYS * 86_400_000).toISOString();
      const { data: pool } = await admin
        .from('drift_bottles')
        .select('id, content, persona_tag, hug_count, reply_count, pickup_count, status, created_at')
        .eq('status', 'approved')
        .lt('pickup_count', MAX_PICKUPS_PER_BOTTLE)
        .gte('created_at', ttl)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(60);

      // 排除已捞过的，洗牌取所需
      const { data: alreadyPicked } = await admin
        .from('drift_bottle_pickups')
        .select('bottle_id')
        .eq('picker_id', user.id)
        .limit(500);
      const pickedIds = new Set((alreadyPicked ?? []).map((p) => p.bottle_id as string));
      const candidates = ((pool ?? []) as BottleRow[]).filter((b) => !pickedIds.has(b.id));

      for (let i = candidates.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const chosen = candidates.slice(0, remaining);
      if (chosen.length === 0) {
        return NextResponse.json({ ok: true, bottles: [], empty: true });
      }

      await admin.from('drift_bottle_pickups').insert(
        chosen.map((b) => ({ bottle_id: b.id, picker_id: user.id })),
      );
      await Promise.all(
        chosen.map((b) =>
          admin
            .from('drift_bottles')
            .update({ pickup_count: b.pickup_count + 1 })
            .eq('id', b.id),
        ),
      );

      return NextResponse.json({ ok: true, bottles: chosen.map(publicBottle) });
    }

    if (action === 'reply') {
      const bottleId = typeof body.bottleId === 'string' ? body.bottleId : '';
      const content = typeof body.content === 'string' ? body.content.trim().slice(0, CONTENT_MAX) : '';
      if (!bottleId || !content) return NextResponse.json({ error: 'invalid_params' }, { status: 400 });

      // 必须先捞到这瓶
      const { data: pickup } = await admin
        .from('drift_bottle_pickups')
        .select('id')
        .eq('bottle_id', bottleId)
        .eq('picker_id', user.id)
        .maybeSingle();
      if (!pickup) return NextResponse.json({ error: 'not_picked' }, { status: 403 });

      const { count } = await admin
        .from('drift_bottle_replies')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart);
      if ((count ?? 0) >= REPLY_LIMIT) {
        return NextResponse.json({ error: 'reply_limit_reached' }, { status: 429 });
      }

      const status = moderate(content);
      const { error } = await admin.from('drift_bottle_replies').insert({
        bottle_id: bottleId,
        user_id: user.id,
        content,
        status,
        reviewed_at: new Date().toISOString(),
      });
      if (error) throw new Error(`reply_insert_failed: ${error.message}`);

      if (status === 'approved') {
        const { data: bottle } = await admin
          .from('drift_bottles')
          .select('reply_count')
          .eq('id', bottleId)
          .maybeSingle();
        if (bottle) {
          await admin
            .from('drift_bottles')
            .update({ reply_count: (bottle.reply_count as number) + 1 })
            .eq('id', bottleId);
        }
      }

      return NextResponse.json({ ok: true, status });
    }

    if (action === 'hug') {
      const bottleId = typeof body.bottleId === 'string' ? body.bottleId : '';
      if (!bottleId) return NextResponse.json({ error: 'invalid_params' }, { status: 400 });

      const { data: pickup } = await admin
        .from('drift_bottle_pickups')
        .select('id, liked')
        .eq('bottle_id', bottleId)
        .eq('picker_id', user.id)
        .maybeSingle();
      if (!pickup) return NextResponse.json({ error: 'not_picked' }, { status: 403 });
      if (pickup.liked) return NextResponse.json({ ok: true, already: true });

      await admin.from('drift_bottle_pickups').update({ liked: true }).eq('id', pickup.id);
      const { data: bottle } = await admin
        .from('drift_bottles')
        .select('hug_count')
        .eq('id', bottleId)
        .maybeSingle();
      if (bottle) {
        await admin
          .from('drift_bottles')
          .update({ hug_count: (bottle.hug_count as number) + 1 })
          .eq('id', bottleId);
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: 'bottle_op_failed', message }, { status: 500 });
  }
});
