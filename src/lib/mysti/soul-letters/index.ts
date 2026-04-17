/**
 * 灵魂信（Soul Letter）— W4 第一批 6 型
 *
 * 选型逻辑（用户已批准代为决策）：
 * - boss   ：高频职场女性自带传播力
 * - mum    ：照顾型 / 长姐 / 牺牲感强 — 戳中 emotional labour
 * - drama  ：戏精 / 高 RP — 创作者本人画像
 * - emo    ：情绪低谷自救 — 与年终焦虑节点共振
 * - love-r ：恋爱脑 / 无限浪漫 — 小红书核心高消费人群
 * - nerd   ：理性自洽 — 反差付费惊喜（"原来连我也被看见"）
 *
 * 内容结构（每封信 5 段）：
 *   1. open       — 一句直接戳中灵魂的开场
 *   2. shadow     — 你的阴影面（被压抑的部分）
 *   3. neuro      — 神经递质 × 行为机制
 *   4. heal       — 修复处方（3 件具体的事）
 *   5. resonance  — 灵魂共振历史人物 / 角色
 *   6. closing    — 写给"你"的告别句
 */

import type { WtftiPersonality } from '@/lib/wtfti-personalities';

export interface SoulLetter {
  slug: string;
  title: string;
  /** 5–7 段长文，每段 100–200 字 */
  open: string;
  shadow: string;
  neuro: string;
  heal: string[];
  resonance: { name: string; reason: string };
  closing: string;
}

import { boss } from './boss';
import { mum } from './mum';
import { drama } from './drama';
import { emo } from './emo';
import { loveR } from './love-r';
import { nerd } from './nerd';

const REGISTRY: Record<string, SoulLetter> = {
  boss,
  mum,
  drama,
  emo,
  'love-r': loveR,
  nerd,
};

export function getSoulLetter(slug: string): SoulLetter | null {
  return REGISTRY[slug] ?? null;
}

export function hasSoulLetter(slug: string): boolean {
  return slug in REGISTRY;
}

export function listSoulLetterSlugs(): string[] {
  return Object.keys(REGISTRY);
}

export type { WtftiPersonality };
