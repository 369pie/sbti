/**
 * Pair Gravity · 双人引力 G 引擎
 *
 * 由 docs/01-strategy/wtfti-cosmic-romance-narrative-2026-04-19.md §3 定义。
 *
 * 公式（叙述版，技术层）：
 *   G = 0.5 × similarity(home) + 0.3 × harmony(moons) + 0.2 × resonance(shadow)
 *
 * 三层各自落到 cos 相似度 / 反向距离归一化：
 *   similarity(home)  = cosineSim(homeAxes A, homeAxes B)  ∈ [-1,1] → squashed to [0,1]
 *   harmony(moons)    = avg over matching universeId 的 cos sim
 *   resonance(shadow) = 1 - |Δ shadow.axisScore| / 5      （shadow 缺失 → 退化）
 *
 * 渲染层 **永远** 用命名档 + 文学引语，**不暴露百分比**。
 */

import type { GalaxyResult } from './galaxy-types';
import { STARDUST_LETTERS } from './stardust-letters';

export type GravityBandId =
  | 'tidal' // 引力潮汐 0.85+
  | 'binary' // 稳定双星 0.65–0.85
  | 'distant' // 远程引力 0.45–0.65
  | 'grazing' // 掠星轨道 0.25–0.45
  | 'parallel'; // 平行宇宙 0–0.25

export interface GravityBand {
  id: GravityBandId;
  name: string;
  /** 一句叙述（女性向） */
  narration: string;
  /** 备选文学引语 id（自 stardust-letters 库） */
  quoteId: string;
  /** 主色（用于渲染连接线/G 数值） */
  accent: string;
}

export const GRAVITY_BANDS: Record<GravityBandId, GravityBand> = {
  tidal: {
    id: 'tidal',
    name: '引力潮汐',
    narration:
      '你们之间是月球和潮汐的关系——每 12 小时召回一次。注意，太近了会失重。',
    quoteId: 'petit-prince-tame',
    accent: '#C07A8E',
  },
  binary: {
    id: 'binary',
    name: '稳定双星',
    narration:
      '你们绕着同一个重心转，是并肩的双子神，不是谁的随侍。',
    quoteId: 'rilke-intimate',
    accent: '#D4B58A',
  },
  distant: {
    id: 'distant',
    name: '远程引力',
    narration: '你们隔着 3 光年互相点亮，是慢热但永不熄灭的那种。',
    quoteId: 'libai-altair',
    accent: '#C9A676',
  },
  grazing: {
    id: 'grazing',
    name: '掠星轨道',
    narration:
      '你们的轨道每隔几年才相交一次，像 76 年才回家的哈雷彗星。',
    quoteId: 'eileen-half-moon',
    accent: '#9C7CFF',
  },
  parallel: {
    id: 'parallel',
    name: '平行宇宙',
    narration:
      '你们在同一片夜空，但属于不同的星系。互相敬意，互不打扰。',
    quoteId: 'sushi-shuidiao',
    accent: '#8A7E96',
  },
};

export interface PairGravityResult {
  /** 0–1 的引力数值，仅用于内部排序 / 调试，UI 显示时取 toFixed(2) 表示为 "G = 0.84" */
  G: number;
  band: GravityBand;
  /** 主导贡献轴（W/T/F/I），用于"引力来源解释" */
  leadingAxis: 'W' | 'T' | 'F' | 'I';
  leadingAxisExplain: string;
  /** 抽选的文学引语 */
  quote: { quote: string; author: string };
  /** 子分（debug only，UI 不展示） */
  breakdown: {
    homeSimilarity: number;
    moonHarmony: number;
    shadowResonance: number;
  };
}

const AXIS_NARR: Record<'W' | 'T' | 'F' | 'I', string> = {
  W: '主要由 W 轴引力贡献：你们对外界的反应方式同温。',
  T: '主要由 T 轴引力贡献：你们都在同一片情绪漩涡里。',
  F: '主要由 F 轴引力贡献：你们处理钝痛的方式互相镜像。',
  I: '主要由 I 轴引力贡献：你们的童年印记落在了同一段星轨上。',
};

function cosineSim(
  a: { W: number; T: number; F: number; I: number },
  b: { W: number; T: number; F: number; I: number },
): number {
  const keys: Array<keyof typeof a> = ['W', 'T', 'F', 'I'];
  const dot = keys.reduce((s, k) => s + a[k] * b[k], 0);
  const magA = Math.sqrt(keys.reduce((s, k) => s + a[k] ** 2, 0));
  const magB = Math.sqrt(keys.reduce((s, k) => s + b[k] ** 2, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB); // ∈ [-1, 1]
}

/** 把 [-1, 1] 余弦压成 [0, 1]，0.5 = 完全无关 */
const squash01 = (cos: number): number => (cos + 1) / 2;

function pickBand(G: number): GravityBand {
  if (G >= 0.85) return GRAVITY_BANDS.tidal;
  if (G >= 0.65) return GRAVITY_BANDS.binary;
  if (G >= 0.45) return GRAVITY_BANDS.distant;
  if (G >= 0.25) return GRAVITY_BANDS.grazing;
  return GRAVITY_BANDS.parallel;
}

function pickLeadingAxis(
  a: { W: number; T: number; F: number; I: number },
  b: { W: number; T: number; F: number; I: number },
): 'W' | 'T' | 'F' | 'I' {
  const keys: Array<'W' | 'T' | 'F' | 'I'> = ['W', 'T', 'F', 'I'];
  let best: 'W' | 'T' | 'F' | 'I' = 'W';
  let bestScore = -Infinity;
  for (const k of keys) {
    // 共同极性 + 强度 = 该轴的引力贡献
    const sameSign = Math.sign(a[k]) === Math.sign(b[k]) ? 1 : -1;
    const score = sameSign * Math.min(Math.abs(a[k]), Math.abs(b[k]));
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  }
  return best;
}

function getQuote(quoteId: string): { quote: string; author: string } {
  const found = STARDUST_LETTERS.find((l) => l.id === quoteId);
  if (!found) {
    return { quote: '在最深的夜里，人和人都靠引力找到对方。', author: 'WTFTI · 内部抄写' };
  }
  return { quote: found.quote, author: found.author };
}

/**
 * 计算两个人的人格星系引力。
 *
 * @param a 用户 A 的星系结果
 * @param b 用户 B 的星系结果
 */
export function computePairGravity(
  a: GalaxyResult,
  b: GalaxyResult,
): PairGravityResult {
  // 1. Home similarity (权重 0.5)
  const homeSimRaw = cosineSim(a.homePlanet.axesVector, b.homePlanet.axesVector);
  const homeSim = squash01(homeSimRaw);

  // 2. Moon harmony (权重 0.3) — 在同一 universeId 下匹配
  const sharedUniverses: number[] = [];
  for (const mA of a.moons) {
    const mB = b.moons.find((m) => m.universeId === mA.universeId);
    if (mB) {
      // 神侍（moon 层）没有 axesVector，退化为：同 universe 即视作弱共鸣 0.6
      sharedUniverses.push(0.6);
    }
  }
  const moonHarmony =
    sharedUniverses.length > 0
      ? sharedUniverses.reduce((s, v) => s + v, 0) / sharedUniverses.length
      : 0.4;

  // 3. Shadow resonance (权重 0.2)
  const shadowResonance = (() => {
    if (!a.shadow || !b.shadow) return 0.5; // 缺失 → 中性
    return 1 - Math.min(Math.abs(a.shadow.axisScore - b.shadow.axisScore) / 5, 1);
  })();

  const G = +(homeSim * 0.5 + moonHarmony * 0.3 + shadowResonance * 0.2).toFixed(4);

  const band = pickBand(G);
  const leadingAxis = pickLeadingAxis(
    a.homePlanet.axesVector,
    b.homePlanet.axesVector,
  );

  return {
    G,
    band,
    leadingAxis,
    leadingAxisExplain: AXIS_NARR[leadingAxis],
    quote: getQuote(band.quoteId),
    breakdown: {
      homeSimilarity: +homeSim.toFixed(3),
      moonHarmony: +moonHarmony.toFixed(3),
      shadowResonance: +shadowResonance.toFixed(3),
    },
  };
}

/** UI 展示用：把 G 格式化成 "G = 0.84" */
export function formatGravityValue(G: number): string {
  return `G = ${G.toFixed(2)}`;
}
