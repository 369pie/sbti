/**
 * CPTI Squad — 4 人闺蜜组分析（v2.0 W4）
 *
 * 输入：4 个 CPTI 人格 slug
 * 输出：
 *   - 6 段两两关系（每段含 relationship + compatibility）
 *   - 1 张组合人格画像（aggregate of 5 dims across members）
 *   - 群体 highlights（谁是 Mama / 谁是 Wildboy / 谁是粘合剂…）
 *
 * 注意：v0 复用既有 `matchRelationship`，把 personality.profile 反推成
 * CptiDimensionScore[]（H=85, M=50, L=15），不引入新评分模型。
 */

import { CPTI_DIMENSIONS, type DimensionLevel } from './dimensions';
import { CPTI_PERSONALITY_TYPES, getCptiPersonalityBySlug, type CptiPersonalityType } from './personalities';
import { matchRelationship } from './relationship-matching';
import type { CptiDimensionScore } from './scoring';
import type { CptiRelationshipType } from './relationships';
import { getRelationshipRarity } from './relationships-rarity';

export interface CptiSquadMember {
  slug: string;
  nickname: string;
}

export interface CptiSquadPair {
  a: CptiPersonalityType;
  b: CptiPersonalityType;
  nicknameA: string;
  nicknameB: string;
  relationship: CptiRelationshipType;
  compatibility: number;
  rarityLabel: string;
}

export interface CptiSquadAggregate {
  /** 平均分 0-100，每个维度 */
  dimensions: { id: string; label: string; score: number; level: DimensionLevel }[];
  /** 组合人格代码：5 维 H/M/L 拼接，例如 HMHLM */
  code: string;
  /** 组合标签 */
  vibeLabel: string;
  /** 一句话调性 */
  tagline: string;
}

export interface CptiSquadHighlight {
  role: string;       // e.g. "Mama"
  memberSlug: string;
  memberNickname: string;
  basis: string;      // 评定依据简述
}

export interface CptiSquadAnalysis {
  members: { personality: CptiPersonalityType; nickname: string }[];
  pairs: CptiSquadPair[];
  aggregate: CptiSquadAggregate;
  highlights: CptiSquadHighlight[];
  /** 平均匹配度，0-100 */
  averageCompatibility: number;
}

const LEVEL_TO_SCORE: Record<DimensionLevel, number> = { L: 15, M: 50, H: 85 };

function profileToDimScores(p: CptiPersonalityType): CptiDimensionScore[] {
  return CPTI_DIMENSIONS.map(d => {
    const lvl: DimensionLevel = (p.profile[d.id] as DimensionLevel) ?? 'M';
    return { id: d.id, score: LEVEL_TO_SCORE[lvl], level: lvl };
  });
}

function toLevel(score: number): DimensionLevel {
  if (score >= 65) return 'H';
  if (score >= 35) return 'M';
  return 'L';
}

const VIBE_RULES: { test: (a: CptiSquadAggregate['dimensions']) => boolean; label: string; tagline: string; code: string }[] = [
  // by dimension id (C1 power / C2 express / C3 conflict / C4 care / C5 fusion)
  { code: 'CHAOS',  label: '混沌四人组',     tagline: '每个人都很有戏，谁也别想统治谁。',
    test: d => d.find(x => x.id === 'C1')!.score >= 65 && d.find(x => x.id === 'C2')!.score >= 60 },
  { code: 'WARM',   label: '人间妈妈团',     tagline: '互相照顾的浓度比奶茶还高。',
    test: d => d.find(x => x.id === 'C4')!.score >= 70 },
  { code: 'COLD',   label: '冷淡乌托邦',     tagline: '我们这群人话不多，但都在线。',
    test: d => d.find(x => x.id === 'C2')!.score <= 35 && d.find(x => x.id === 'C3')!.score <= 40 },
  { code: 'FUSION', label: '黏黏胶水组',     tagline: '一周不见就要发消息确认还活着。',
    test: d => d.find(x => x.id === 'C5')!.score >= 70 },
  { code: 'FREE',   label: '各活各的派',     tagline: '关系健康在于每个人都有自己的生活。',
    test: d => d.find(x => x.id === 'C5')!.score <= 35 },
  { code: 'BOOM',   label: '炸药四人组',     tagline: '点谁的炮仗都炸，但炸完三秒和好。',
    test: d => d.find(x => x.id === 'C3')!.score >= 65 },
];

function classifyAggregate(dims: CptiSquadAggregate['dimensions']): { code: string; label: string; tagline: string } {
  for (const r of VIBE_RULES) if (r.test(dims)) return { code: r.code, label: r.label, tagline: r.tagline };
  return { code: 'MIX', label: '混搭组', tagline: '没什么共性，但凑一起就是好玩。' };
}

function pickHighlights(members: { personality: CptiPersonalityType; nickname: string }[]): CptiSquadHighlight[] {
  const out: CptiSquadHighlight[] = [];
  // Mama: 最高 C4 (care)
  const mama = [...members].sort((x, y) => LEVEL_TO_SCORE[y.personality.profile.C4 as DimensionLevel] - LEVEL_TO_SCORE[x.personality.profile.C4 as DimensionLevel])[0];
  out.push({ role: '组里的妈', memberSlug: mama.personality.slug, memberNickname: mama.nickname, basis: '关怀维度最高，永远在记别人的胃和体温' });
  // Wildboy: 最高 C2 (express) + 最低 C5 (fusion)
  const wild = [...members].sort((x, y) => {
    const xs = LEVEL_TO_SCORE[x.personality.profile.C2 as DimensionLevel] - LEVEL_TO_SCORE[x.personality.profile.C5 as DimensionLevel];
    const ys = LEVEL_TO_SCORE[y.personality.profile.C2 as DimensionLevel] - LEVEL_TO_SCORE[y.personality.profile.C5 as DimensionLevel];
    return ys - xs;
  })[0];
  if (wild.personality.slug !== mama.personality.slug) {
    out.push({ role: '搞气氛担当', memberSlug: wild.personality.slug, memberNickname: wild.nickname, basis: '表达欲拉满 + 不依附，永远在制造梗' });
  }
  // Glue: 最高 C5 (fusion)
  const glue = [...members].sort((x, y) => LEVEL_TO_SCORE[y.personality.profile.C5 as DimensionLevel] - LEVEL_TO_SCORE[x.personality.profile.C5 as DimensionLevel])[0];
  if (![mama, wild].some(m => m.personality.slug === glue.personality.slug)) {
    out.push({ role: '群粘合剂', memberSlug: glue.personality.slug, memberNickname: glue.nickname, basis: '融合度最高，少了 ta 群里就冷了' });
  }
  // Boss: 最高 C1 (power)
  const boss = [...members].sort((x, y) => LEVEL_TO_SCORE[y.personality.profile.C1 as DimensionLevel] - LEVEL_TO_SCORE[x.personality.profile.C1 as DimensionLevel])[0];
  if (![mama, wild, glue].some(m => m.personality.slug === boss.personality.slug)) {
    out.push({ role: '组里说一不二的那个', memberSlug: boss.personality.slug, memberNickname: boss.nickname, basis: '权力维度最高，吃啥她说了算' });
  }
  return out;
}

export function analyzeCptiSquad(members: CptiSquadMember[]): CptiSquadAnalysis | null {
  const resolved = members
    .map(m => {
      const p = getCptiPersonalityBySlug(m.slug);
      return p ? { personality: p, nickname: m.nickname || p.name } : null;
    })
    .filter((x): x is { personality: CptiPersonalityType; nickname: string } => x !== null);

  if (resolved.length !== 4) return null;

  // pairs
  const pairs: CptiSquadPair[] = [];
  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i].personality;
      const b = resolved[j].personality;
      const r = matchRelationship(profileToDimScores(a), profileToDimScores(b));
      pairs.push({
        a, b,
        nicknameA: resolved[i].nickname,
        nicknameB: resolved[j].nickname,
        relationship: r.relationship,
        compatibility: r.compatibility,
        rarityLabel: getRelationshipRarity(r.relationship.slug).label,
      });
    }
  }

  // aggregate
  const dims = CPTI_DIMENSIONS.map(d => {
    const sum = resolved.reduce((acc, m) => acc + LEVEL_TO_SCORE[(m.personality.profile[d.id] as DimensionLevel) ?? 'M'], 0);
    const score = Math.round(sum / resolved.length);
    return { id: d.id, label: d.name, score, level: toLevel(score) };
  });
  const cls = classifyAggregate(dims);
  const aggregate: CptiSquadAggregate = {
    dimensions: dims,
    code: cls.code,
    vibeLabel: cls.label,
    tagline: cls.tagline,
  };

  const highlights = pickHighlights(resolved);
  const averageCompatibility = Math.round(pairs.reduce((acc, p) => acc + p.compatibility, 0) / Math.max(1, pairs.length));

  return { members: resolved, pairs, aggregate, highlights, averageCompatibility };
}

/** Encode squad to URL params: ?m=slug:nick,slug:nick,... */
export function encodeCptiSquad(members: CptiSquadMember[]): string {
  const m = members
    .filter(x => x.slug)
    .map(x => `${encodeURIComponent(x.slug)}:${encodeURIComponent(x.nickname || '')}`)
    .join(',');
  return m ? `m=${m}` : '';
}

export function decodeCptiSquad(params: URLSearchParams): CptiSquadMember[] {
  const raw = params.get('m');
  if (!raw) return [];
  return raw
    .split(',')
    .map(token => {
      const [slug, nick] = token.split(':');
      return { slug: decodeURIComponent(slug || ''), nickname: decodeURIComponent(nick || '') };
    })
    .filter(x => !!x.slug && !!getCptiPersonalityBySlug(x.slug));
}

export function listSelectablePersonalities(): { slug: string; name: string; emoji: string; color: string }[] {
  return CPTI_PERSONALITY_TYPES.map(p => ({ slug: p.slug, name: p.name, emoji: p.emoji, color: p.color }));
}
