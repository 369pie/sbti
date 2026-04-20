/**
 * Galaxy Result Builder · 从仪式输出构造真实 GalaxyResult
 *
 * 与 galaxy-preview.ts 并列：
 *  - galaxy-preview.ts → 无数据时的 mock
 *  - galaxy-builder.ts → 仪式真做完时的装配
 *
 * 输入：主测 slug、soul answers、S 轴结果（可选）、好友邀请（可选）
 * 输出：完整 GalaxyResult，供 GalaxyPreview / 分享卡渲染。
 */

import { mapPersonalityToHomePlanet } from './galaxy-mapping';
import {
  MOON_PLANET_CATALOG,
  SHADOW_PLANET_CATALOG,
} from './galaxy-planets';
import type {
  GalaxyHomePlanet,
  GalaxyMoon,
  GalaxyResult,
  GalaxyShadow,
} from './galaxy-types';
import type { SScoreResult } from './scoring-s';
import type { ShadowBucket } from './s-axis';

export interface BuildGalaxyInput {
  /** 主测 personality slug（wtfti slug，非 home planet slug） */
  personalitySlug: string;
  /** 主测维度打分，仅用来做 axesVector 回填 */
  axesVector?: { W: number; T: number; F: number; I: number };
  /** S 轴打分（暗面解锁后得到） */
  shadowScore?: SScoreResult;
  /** 显式指定结果 id（仪式侧已生成），否则调用方需外部生成 */
  resultId: string;
  /** 版本标记 */
  testVersion?: string;
}

const UNIVERSE_ORDER: Array<GalaxyMoon['universeId']> = [
  'romance',
  'work',
  'late-night',
];

/** 在同一 universe 内按 slug 挑一个神侍（保证确定性） */
function pickCompanionForUniverse(
  universeId: GalaxyMoon['universeId'],
  seed: string,
): GalaxyMoon | null {
  const pool = MOON_PLANET_CATALOG.filter((m) => m.universeId === universeId);
  if (pool.length === 0) return null;
  // 简单确定性哈希
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % pool.length;
  const m = pool[idx];
  return {
    universeId: m.universeId,
    code: m.code,
    name: m.name,
    slug: m.slug,
    headline: m.headline,
    body: m.body,
    cardImageUrl: m.cardImageUrl,
  };
}

function buildShadowFromScore(score: SScoreResult): GalaxyShadow {
  const bucket: ShadowBucket = score.shadow.bucket;
  const catalog = SHADOW_PLANET_CATALOG.find((s) => s.bucket === bucket);
  const meta = score.shadow;
  return {
    axisScore: score.axisScore,
    bucket,
    slug: catalog?.slug ?? meta.cardSlug,
    name: meta.name,
    headline: meta.headline,
    body: meta.body,
    tooltip: meta.tooltip,
    cardImageUrl:
      catalog?.cardImageUrl ??
      `/images/types/galaxy/${meta.cardSlug}.png`,
  };
}

export function buildGalaxyResult(input: BuildGalaxyInput): GalaxyResult {
  const home = mapPersonalityToHomePlanet(input.personalitySlug);
  const homePlanet: GalaxyHomePlanet = {
    code: home.code,
    name: home.name,
    slug: home.slug,
    axesVector: input.axesVector ?? home.defaultAxesVector,
    headline: home.headline,
    body: home.body,
    cardImageUrl: home.cardImageUrl,
  };

  const moons: GalaxyMoon[] = UNIVERSE_ORDER
    .map((u) => pickCompanionForUniverse(u, input.personalitySlug + u))
    .filter((m): m is GalaxyMoon => m !== null);

  const shadow = input.shadowScore
    ? buildShadowFromScore(input.shadowScore)
    : undefined;

  return {
    homePlanet,
    moons,
    shadow,
    orbit: moons.map((m) => ({
      from: homePlanet.name,
      to: m.name,
      reason: `在${universeLabel(m.universeId)}里，${homePlanet.name}会召唤出${m.name}。`,
    })),
    meta: {
      resultId: input.resultId,
      createdAt: new Date().toISOString(),
      testVersion: input.testVersion ?? 'galaxy-v2-ritual',
    },
  };
}

function universeLabel(u: GalaxyMoon['universeId']): string {
  if (u === 'romance') return '恋爱';
  if (u === 'work') return '工作';
  if (u === 'late-night') return '深夜';
  return '日常';
}
