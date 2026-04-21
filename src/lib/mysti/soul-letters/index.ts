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
 * 内容结构（每封信 7 段，对应 5+ 屏阅读节奏）：
 *   1. open           — 一句直接戳中灵魂的开场
 *   2. shadow         — 你的阴影面（被压抑的部分）
 *   3. neuro          — 神经递质 × 行为机制
 *   4. heal           — 修复处方（3 件具体的事）
 *   5. resonance      — 灵魂共振历史人物 / 角色
 *   6. personalLetter — 「为你写的信」拟人段落，用 {name} 插入用户名
 *   7. ritual         — 收尾仪式（一段微仪式 + 3 步动作）
 *   8. closing        — 写给"你"的告别句
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
  /**
   * 「为你写的信」段落（≥ 200 字）。
   * 使用 `{name}` 占位符，渲染时由组件替换为用户的 displayName。
   * 这是支撑 ¥9.9 单点付费的核心情感杠杆——每位用户感觉信是为 TA 一个人写的。
   */
  personalLetter: string;
  /** 微仪式收尾：让用户读完后真的"做一件事"，避免读完即忘 */
  ritual: {
    title: string;
    intro: string;
    steps: string[];
  };
  closing: string;
}

import { boss } from './boss';
import { mum } from './mum';
import { drama } from './drama';
import { emo } from './emo';
import { loveR } from './love-r';
import { nerd } from './nerd';
import { ctrl } from './ctrl';
import { simp } from './simp';
import { solo } from './solo';
import { sleep } from './sleep';
import { gameR } from './game-r';
import { drunk } from './drunk';
import { rebel } from './rebel';
import { ohNo } from './oh-no';
import { thinK } from './thin-k';
import { chill } from './chill';
import { atmEr } from './atm-er';

const REGISTRY: Record<string, SoulLetter> = {
  boss,
  mum,
  drama,
  emo,
  'love-r': loveR,
  nerd,
  ctrl,
  simp,
  solo,
  sleep,
  'game-r': gameR,
  drunk,
  rebel,
  'oh-no': ohNo,
  'thin-k': thinK,
  chill,
  'atm-er': atmEr,
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
