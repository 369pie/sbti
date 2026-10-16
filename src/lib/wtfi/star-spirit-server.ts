/**
 * Star Spirit · 服务端读写（用户态 client，RLS owner 生效）
 */
import { createServerSupabaseClient } from '@/lib/supabase/server';

import {
  DAILY_EARN_CAP,
  STAR_DUST_AMOUNT,
  WATER_COST,
  WATER_GROWTH,
  brightnessForStreak,
  hueForPersonality,
  isOnceDailySource,
  stageForGrowth,
  type StarDustSource,
  type StarSpiritState,
} from './star-spirit';

interface SpiritRow {
  user_id: string;
  name: string | null;
  personality_slug: string | null;
  growth: number;
  stardust: number;
  streak_nights: number;
  last_watered_date: string | null;
  earned_date: string | null;
  earned_today: number;
  born_at: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

function toState(row: SpiritRow | null): StarSpiritState {
  if (!row) {
    return {
      exists: false,
      name: null,
      personalitySlug: null,
      growth: 0,
      stardust: 0,
      streakNights: 0,
      canWater: false,
      alreadyWateredToday: false,
      earnedToday: 0,
      earnCap: DAILY_EARN_CAP,
      stage: stageForGrowth(0),
      brightness: 0,
      hue: 'violet',
      bornAt: null,
    };
  }
  const today = todayISO();
  // earned_date 跨天 → 当日获取量归零展示（物理重置发生在下一次 earn）
  const earnedToday = row.earned_date === today ? row.earned_today : 0;
  const alreadyWateredToday = row.last_watered_date === today;
  return {
    exists: true,
    name: row.name,
    personalitySlug: row.personality_slug,
    growth: row.growth,
    stardust: row.stardust,
    streakNights: row.streak_nights,
    canWater: !alreadyWateredToday && row.stardust >= WATER_COST,
    alreadyWateredToday,
    earnedToday,
    earnCap: DAILY_EARN_CAP,
    stage: stageForGrowth(row.growth),
    brightness: brightnessForStreak(row.streak_nights),
    hue: hueForPersonality(row.personality_slug),
    bornAt: row.born_at,
  };
}

export async function getStarSpiritState(userId: string): Promise<StarSpiritState> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('wtfti_star_spirits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return toState((data as SpiritRow | null) ?? null);
}

async function loadRow(userId: string): Promise<SpiritRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('wtfti_star_spirits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as SpiritRow | null) ?? null;
}

export interface EarnResult {
  state: StarSpiritState;
  granted: number;
  reason?: 'cap_reached' | 'once_daily_dedup' | 'invalid_source';
}

export async function earnStarDust(
  userId: string,
  source: StarDustSource,
  opts?: { personalitySlug?: string | null },
): Promise<EarnResult> {
  const supabase = await createServerSupabaseClient();
  const amount = STAR_DUST_AMOUNT[source];
  if (!amount) {
    return { state: await getStarSpiritState(userId), granted: 0, reason: 'invalid_source' };
  }

  const today = todayISO();
  const row = await loadRow(userId);

  // once-daily 来源：今天已领过 → 跳过
  if (row && isOnceDailySource(source)) {
    const { data: existing } = await supabase
      .from('wtfti_star_dust_events')
      .select('id')
      .eq('user_id', userId)
      .eq('source', source)
      .gte('created_at', `${today}T00:00:00Z`)
      .limit(1);
    if (existing && existing.length > 0) {
      return { state: toState(row), granted: 0, reason: 'once_daily_dedup' };
    }
  }

  const earnedToday = row && row.earned_date === today ? row.earned_today : 0;
  const room = DAILY_EARN_CAP - earnedToday;
  if (room <= 0) {
    return { state: toState(row), granted: 0, reason: 'cap_reached' };
  }
  const granted = Math.min(amount, room);

  if (!row) {
    // 首次星尘 → 星灵诞生
    const { error } = await supabase.from('wtfti_star_spirits').insert({
      user_id: userId,
      personality_slug: opts?.personalitySlug ?? null,
      stardust: granted,
      earned_date: today,
      earned_today: granted,
    });
    if (error) throw new Error(`star_spirit_born_failed: ${error.message}`);
  } else {
    const { error } = await supabase
      .from('wtfti_star_spirits')
      .update({
        stardust: row.stardust + granted,
        personality_slug: row.personality_slug ?? opts?.personalitySlug ?? null,
        earned_date: today,
        earned_today: earnedToday + granted,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) throw new Error(`star_dust_earn_failed: ${error.message}`);
  }

  await supabase
    .from('wtfti_star_dust_events')
    .insert({ user_id: userId, source, amount: granted });

  return { state: await getStarSpiritState(userId), granted };
}

export interface WaterResult {
  state: StarSpiritState;
  watered: boolean;
  reason?: 'already_watered' | 'no_stardust' | 'no_spirit';
}

export async function waterStarSpirit(userId: string): Promise<WaterResult> {
  const row = await loadRow(userId);
  if (!row) return { state: toState(null), watered: false, reason: 'no_spirit' };

  const today = todayISO();
  if (row.last_watered_date === today) {
    return { state: toState(row), watered: false, reason: 'already_watered' };
  }
  if (row.stardust < WATER_COST) {
    return { state: toState(row), watered: false, reason: 'no_stardust' };
  }

  const streak = row.last_watered_date === yesterdayISO() ? row.streak_nights + 1 : 1;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('wtfti_star_spirits')
    .update({
      stardust: row.stardust - WATER_COST,
      growth: row.growth + WATER_GROWTH,
      streak_nights: streak,
      last_watered_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  if (error) throw new Error(`star_spirit_water_failed: ${error.message}`);

  return { state: await getStarSpiritState(userId), watered: true };
}

export async function nameStarSpirit(userId: string, name: string): Promise<StarSpiritState> {
  const clean = name.trim().slice(0, 12) || null;
  const supabase = await createServerSupabaseClient();
  const row = await loadRow(userId);
  if (!row) return toState(null);
  const { error } = await supabase
    .from('wtfti_star_spirits')
    .update({ name: clean, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw new Error(`star_spirit_name_failed: ${error.message}`);
  return getStarSpiritState(userId);
}
