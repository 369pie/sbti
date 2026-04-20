/**
 * Tonight's Small Action — 今晚的小动作
 *
 * One concrete, doable-tonight action keyed by personality + tear rate level.
 * Free-tier hook: even users who never log in get one specific instruction
 * they can act on right now. This is the JTBD's "give me one small thing
 * I can do tonight" payload.
 *
 * Returned strings are short, second-person, never prescriptive about life,
 * always about the next 60 minutes.
 */

import type { SoultiPersonalityType } from './personalities';

export interface TonightAction {
  /** One-line instruction, ≤ 28 字 */
  instruction: string;
  /** One-line reason, second-person, soft */
  reason: string;
  /** A tag like 喝水 / 写一句 / 锁屏 */
  tag: string;
}

const ACTION_BY_J5: Record<'G' | 'K', TonightAction[]> = {
  // 生型 · 生长后的修复
  G: [
    {
      tag: '写一句',
      instruction: '在备忘录写下今天最想说但没说出口的那一句话。',
      reason: '你需要把它放出去——不一定给别人，先给自己。',
    },
    {
      tag: '一杯水',
      instruction: '现在去倒一杯温水，慢慢喝完它。',
      reason: '你身体里的能量在生长，先给它一点水。',
    },
    {
      tag: '换个房间',
      instruction: '把手机带去另一个房间，待 10 分钟。',
      reason: '换一个空间 = 让脑子里的循环换一个轨道。',
    },
  ],
  // 矿型 · 凝固后的修复
  K: [
    {
      tag: '锁屏 30 分钟',
      instruction: '把手机调静音，朝下放在桌上，30 分钟内不翻它。',
      reason: '你的修复在身体上发生，不在屏幕上。',
    },
    {
      tag: '收一样东西',
      instruction: '收拾一个抽屉、一个角落、一只杯子。',
      reason: '矿型的人需要"收完"的感觉——给自己一个小完结。',
    },
    {
      tag: '不回那条',
      instruction: '今晚不回那条让你心跳加速的消息。明早再说。',
      reason: '把"硬"留到明天用，今晚先让自己安静。',
    },
  ],
};

const TEAR_OVERRIDES = {
  // 撕裂度极高 → 优先建议"今晚先休息"型
  extreme: [
    {
      tag: '盖一条毯子',
      instruction: '现在拿一条毯子盖在腿上，关掉一盏灯。',
      reason: '你的白天和深夜在打架——先让身体停下来。',
    },
    {
      tag: '写一句给明天',
      instruction: '写一句话给明天的自己：「今晚先这样，别再想了」。',
      reason: '撕裂度高的夜里，你需要一个明确的"今晚到此为止"。',
    },
  ],
  // 撕裂度中等 → 镜像观察型
  split: [
    {
      tag: '问自己一句',
      instruction: '问自己：「现在让我累的，是白天的事，还是深夜的我」？',
      reason: '看见就是修复的开始。',
    },
  ],
};

/**
 * Pick a tonight action based on personality code + tear rate level.
 * Deterministic-by-day (uses local date as seed) so the same user sees the
 * same suggestion on the same night, but it rotates day to day.
 */
export function pickTonightAction(
  personality: Pick<SoultiPersonalityType, 'code' | 'slug'>,
  tearLevel?: 'aligned' | 'partial' | 'split' | 'extreme',
): TonightAction {
  const j5 = (personality.code[4] === 'G' ? 'G' : 'K') as 'G' | 'K';

  // High tear rate → use override first half of the time
  if (tearLevel === 'extreme') {
    const pool = TEAR_OVERRIDES.extreme;
    return pool[seedIndex(personality.slug, pool.length)];
  }
  if (tearLevel === 'split') {
    // 50% chance use override, 50% use J5 pool
    const useOverride = seedIndex(personality.slug + 'split', 2) === 0;
    if (useOverride) {
      const pool = TEAR_OVERRIDES.split;
      return pool[0];
    }
  }

  const pool = ACTION_BY_J5[j5];
  return pool[seedIndex(personality.slug, pool.length)];
}

/** Stable index = (slug + today's local date) hash → bucket */
function seedIndex(seed: string, mod: number): number {
  const today = new Date();
  const day = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const key = `${seed}|${day}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}
