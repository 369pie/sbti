/**
 * WTFTI · Five-Sense Profile
 *
 * 把 6 道 Soul Probe 答案映射成 5 维「灵魂频率」档案：
 *   听觉 / 视觉 / 嗅觉 / 触觉 / 直觉
 * + 灵魂香水 / 灵魂质地 / 灵魂频率短句
 *
 * 战略：plan §B4 杠杆 #1 五感人格档案
 */

import type { SoulAnswers, SoulProbeId } from './soul-resonance';

/** 5 维档案，每维 1-4 等级（用于雷达半径 0.25 / 0.5 / 0.75 / 1） */
export interface FiveSenseProfile {
  hearing: number;   // 听 — 来自 music
  vision: number;    // 视 — 来自 color × cinema 平均
  smell: number;     // 嗅 — 来自 scent
  touch: number;     // 触 — 来自 touch
  intuition: number; // 直觉 — 来自 quote
}

/** 4 调香水分类学 */
export const PERFUME_FAMILIES = {
  A: {
    name: '木质东方',
    hint: '雪松 + 沉香 + 微烟',
    reference: '像 Maison Margiela By the Fireplace 的开场',
  },
  B: {
    name: '醛香花束',
    hint: '玫瑰 + 茉莉 + 醛香',
    reference: '像 Chanel №5 1921 年的那一版',
  },
  C: {
    name: '海与盐',
    hint: '柚子 + 海藻 + 龙涎香',
    reference: '像 Acqua di Parma Blu Mediterraneo',
  },
  D: {
    name: '甜美东方',
    hint: '香草 + 焦糖 + 麝香',
    reference: '像 Le Labo Santal 33 的尾调',
  },
} as const satisfies Record<'A' | 'B' | 'C' | 'D', { name: string; hint: string; reference: string }>;

export const TEXTURE_FAMILIES = {
  A: { name: '丝绒', verb: '贴脸 · 温度恒定', hex: '#7A1F2E' },
  B: { name: '粗陶', verb: '哑光 · 微凉 · 有呼吸', hex: '#A07A5C' },
  C: { name: '冷玻璃', verb: '透 · 平 · 反光', hex: '#A8C3CC' },
  D: { name: '旧木头', verb: '纹路 · 有痕 · 有故事', hex: '#6B4A2E' },
} as const satisfies Record<'A' | 'B' | 'C' | 'D', { name: string; verb: string; hex: string }>;

const HEARING_DEPTH: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 1.0,  // 古典 — 最深
  B: 0.6,
  C: 0.85,
  D: 0.75,
};

const VISION_DEPTH: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 0.85,
  B: 1.0,  // 暮紫
  C: 0.7,
  D: 0.8,
};

const SMELL_DEPTH: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 0.7,
  B: 0.9,
  C: 0.6,
  D: 1.0,  // 烟草
};

const TOUCH_DEPTH: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 1.0,  // 丝绒
  B: 0.85,
  C: 0.6,
  D: 0.9,
};

const INTUITION_DEPTH: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 0.9,
  B: 0.95,
  C: 0.75,
  D: 1.0,  // 普拉斯
};

function pick(
  ans: SoulAnswers,
  id: SoulProbeId,
  table: Record<'A' | 'B' | 'C' | 'D', number>,
  fallback: number,
): number {
  const k = ans[id];
  if (k && k !== 'SKIP') return table[k];
  return fallback;
}

export function calcFiveSenseProfile(answers: SoulAnswers): FiveSenseProfile {
  const hearing = pick(answers, 'music', HEARING_DEPTH, 0.5);
  const vision = (pick(answers, 'color', VISION_DEPTH, 0.5) +
    pick(answers, 'cinema', VISION_DEPTH, 0.5)) / 2;
  const smell = pick(answers, 'scent', SMELL_DEPTH, 0.5);
  const touch = pick(answers, 'touch', TOUCH_DEPTH, 0.5);
  const intuition = pick(answers, 'quote', INTUITION_DEPTH, 0.5);
  return { hearing, vision, smell, touch, intuition };
}

export function getSoulPerfume(answers: SoulAnswers): (typeof PERFUME_FAMILIES)[keyof typeof PERFUME_FAMILIES] | null {
  const k = answers.scent;
  if (!k || k === 'SKIP') return null;
  return PERFUME_FAMILIES[k];
}

export function getSoulTexture(answers: SoulAnswers): (typeof TEXTURE_FAMILIES)[keyof typeof TEXTURE_FAMILIES] | null {
  const k = answers.touch;
  if (!k || k === 'SKIP') return null;
  return TEXTURE_FAMILIES[k];
}

export function getSoulFrequencyLine(answers: SoulAnswers): string {
  const segments: string[] = [];
  const m = answers.music;
  const c = answers.color;
  const s = answers.scent;
  const t = answers.touch;
  if (m && m !== 'SKIP') {
    segments.push(`听 ${({ A: '古典', B: '民谣', C: '电子', D: '氛围' } as const)[m]}`);
  }
  if (c && c !== 'SKIP') {
    segments.push(`视 ${({ A: '玫瑰', B: '暮紫', C: '苔绿', D: '灰蓝' } as const)[c]}`);
  }
  if (s && s !== 'SKIP') {
    segments.push(`嗅 ${PERFUME_FAMILIES[s].name}`);
  }
  if (t && t !== 'SKIP') {
    segments.push(`触 ${TEXTURE_FAMILIES[t].name}`);
  }
  return segments.length ? segments.join(' · ') : '— 未收集 —';
}
