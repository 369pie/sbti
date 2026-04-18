/**
 * Persona Shard — Traits derivation (deterministic, pure).
 *
 * Takes a (universeId, slug) pair and derives the "personality of the shard":
 * voice, pace, energy, and 3 keyword descriptors.
 *
 * Strategy:
 *  - If standard personality profile exists (15 H/M/L dims), use it directly.
 *  - Else, hash the slug and pick from pools deterministically.
 *
 * Kept dependency-light so it can run on both client and server.
 */

import type { DimensionLevel } from '../dimensions';
import { getPersonalityBySlug } from '../personalities';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShardVoice = 'bold' | 'warm' | 'quiet' | 'sharp' | 'playful' | 'dreamy';
export type ShardPace = 'fast' | 'steady' | 'slow';
export type ShardEnergy = 'radiant' | 'inward' | 'flickering';

export interface ShardTraits {
  voice: ShardVoice;
  pace: ShardPace;
  energy: ShardEnergy;
  keywords: [string, string, string];
  /** 0-1 scalar used by the Orb for breathing amplitude */
  aura: number;
  /** 0-1 scalar used by the Orb for breathing speed */
  tempo: number;
}

// ─── Hash helper ─────────────────────────────────────────────────────────────

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─── Keyword pools ───────────────────────────────────────────────────────────

const VOICE_KEYWORDS: Record<ShardVoice, string[]> = {
  bold:    ['锋利', '直给', '掌控', '主角感', '敢说敢做', '光就是你'],
  warm:    ['松弛', '包容', '暖光', '信得过', '守护感', '安静的亮'],
  quiet:   ['内省', '观察者', '留白', '克制', '深井', '晚风'],
  sharp:   ['毒舌', '清醒', '旁观', '穿刺', '冷叙事', '不解释'],
  playful: ['轻盈', '跳脱', '梗图人', '不严肃', '风里生', '偷偷皮'],
  dreamy:  ['飘忽', '幻觉派', '月光', '非线性', '通感', '云里人'],
};

const PACE_KEYWORDS: Record<ShardPace, string[]> = {
  fast:   ['快', '即兴', '冲动派'],
  steady: ['稳', '节拍器', '续航'],
  slow:   ['慢', '沉淀', '长线'],
};

const ENERGY_KEYWORDS: Record<ShardEnergy, string[]> = {
  radiant:     ['外放', '自带BGM', '在场就暖'],
  inward:      ['内聚', '自给自足', '独处供能'],
  flickering:  ['双面', '忽明忽暗', '情绪海'],
};

// ─── Derivation ──────────────────────────────────────────────────────────────

function deriveFromProfile(profile: Record<string, DimensionLevel>): { voice: ShardVoice; pace: ShardPace; energy: ShardEnergy } {
  const s1 = profile.S1; // 自尊
  const s3 = profile.S3; // 核心价值
  const e1 = profile.E1; // 依恋安全
  const e2 = profile.E2; // 情感投入
  const a1 = profile.A1; // 世界观
  const a2 = profile.A2; // 规则
  const ac2 = profile.Ac2; // 决策
  const ac3 = profile.Ac3; // 执行
  const so1 = profile.So1; // 社交主动
  const so3 = profile.So3; // 表达真实度

  // Voice — which tonal mode dominates
  let voice: ShardVoice;
  if (s1 === 'H' && ac3 === 'H') voice = 'bold';
  else if (e2 === 'H' && e1 === 'H') voice = 'warm';
  else if (so1 === 'L' && so3 === 'H') voice = 'quiet';
  else if (a1 === 'L' && s1 === 'H') voice = 'sharp';
  else if (so1 === 'H' && a2 === 'L') voice = 'playful';
  else if (s3 === 'L' && a1 === 'M') voice = 'dreamy';
  else voice = 'warm';

  // Pace — decision × execution
  let pace: ShardPace;
  if (ac2 === 'H' && ac3 === 'H') pace = 'fast';
  else if (ac2 === 'L' || ac3 === 'L') pace = 'slow';
  else pace = 'steady';

  // Energy — social radiation vs. inward
  let energy: ShardEnergy;
  if (so1 === 'H') energy = 'radiant';
  else if (so1 === 'L') energy = 'inward';
  else energy = 'flickering';

  return { voice, pace, energy };
}

function deriveFromHash(seed: number): { voice: ShardVoice; pace: ShardPace; energy: ShardEnergy } {
  const voices: ShardVoice[] = ['bold', 'warm', 'quiet', 'sharp', 'playful', 'dreamy'];
  const paces: ShardPace[] = ['fast', 'steady', 'slow'];
  const energies: ShardEnergy[] = ['radiant', 'inward', 'flickering'];
  return {
    voice: voices[seed % voices.length],
    pace: paces[(seed >>> 3) % paces.length],
    energy: energies[(seed >>> 7) % energies.length],
  };
}

/**
 * Derive shard traits for a universe+slug pair. Pure and deterministic.
 */
export function deriveShardTraits(universeId: string, slug: string): ShardTraits {
  const seed = hashString(`${universeId}:${slug}`);
  const personality = getPersonalityBySlug(slug);

  const base = personality
    ? deriveFromProfile(personality.profile)
    : deriveFromHash(seed);

  // Pick 3 keywords: 1 from voice, 1 from pace, 1 from energy
  const voicePool = VOICE_KEYWORDS[base.voice];
  const pacePool = PACE_KEYWORDS[base.pace];
  const energyPool = ENERGY_KEYWORDS[base.energy];

  const keywords: [string, string, string] = [
    voicePool[seed % voicePool.length],
    pacePool[(seed >>> 5) % pacePool.length],
    energyPool[(seed >>> 11) % energyPool.length],
  ];

  // Aura / tempo — deterministic within a comfortable range
  const aura = 0.35 + ((seed >>> 2) % 100) / 100 * 0.45;   // 0.35 – 0.80
  const tempo = 0.7 + ((seed >>> 9) % 100) / 100 * 0.8;    // 0.70 – 1.50

  return {
    voice: base.voice,
    pace: base.pace,
    energy: base.energy,
    keywords,
    aura,
    tempo,
  };
}
