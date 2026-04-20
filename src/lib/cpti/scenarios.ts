/**
 * CPTI Scenario landing data.
 * ─────────────────────────────────────────────────────────────
 * Sprint 2 (2026-04-19) — long-tail SEO capture for Xiaohongshu autocomplete:
 *   "cpti 情侣"、"cpti 闺蜜"、"cpti 母子"、"cpti 同事"、"cpti 死对头"、"cpti 桃园结义"
 *
 * Each scenario page picks 5–6 of the 25 relationship types that are most
 * relevant to that scenario, and wraps them in scenario-tinted copy.
 */

import type { CptiRelationshipType } from './relationships';
import { CPTI_RELATIONSHIP_TYPES } from './relationships';

export type CptiScenarioSlug = 'lover' | 'bestie' | 'family' | 'work' | 'enemy';

export interface CptiScenarioConfig {
  slug: CptiScenarioSlug;
  emoji: string;
  /** Display name for breadcrumbs / cards */
  name: string;
  /** SEO title (≤ 60 chars best) */
  title: string;
  /** Meta description (≤ 155 chars best) */
  description: string;
  /** Hero headline */
  heroHeadline: string;
  /** Hero kicker / italic line */
  heroSub: string;
  /** Long-form intro on the page (1–2 paragraphs) */
  intro: string;
  /** CTA copy */
  cta: string;
  /** Invite text the user can copy from the result page */
  inviteText: string;
  /** Pinned relationship types for this scenario (subset of 25) */
  featuredSlugs: string[];
  /** Long-tail keyword bag (used for hidden meta keywords) */
  keywords: string[];
  /** Color theme (Tailwind-friendly hex) */
  color: string;
}

export const CPTI_SCENARIOS: CptiScenarioConfig[] = [
  {
    slug: 'lover',
    emoji: '👫',
    name: '情侣',
    title: 'CPTI 情侣关系测试 — 25 种 CP 关系图鉴',
    description:
      'CPTI 情侣测试：3 分钟测出你和对象在 25 种 CP 关系里是哪一种 —— 灵魂伴侣 / 老夫老妻 / 欢喜冤家 / 相爱相杀，你们是 SOUL 还是 RIVALS？',
    heroHeadline: '你和对象\n是哪一种 CP？',
    heroSub: '灵魂伴侣 · 老夫老妻 · 欢喜冤家 · 相爱相杀',
    intro:
      'CPTI 不只是"你是 ENFP 我是 INFJ"那种个体测试，它会从 5 个关系维度（主导力、表达力、冲突力、付出力、融合度）出发，把你们俩组合成 25 种 CP 关系类型里的一种。比 MBTI 配对更具体，比塔罗更可解释。3 分钟一对，发个链接给 ta，立即解锁你们的关系命名。',
    cta: '测测我俩是哪一种 CP →',
    inviteText: '测测我俩在 25 种 CP 关系里是哪一种 →',
    featuredSlugs: ['soul', 'settled', 'lovers', 'rivals', 'sync', 'glued', 'mirror', 'volcano'],
    keywords: ['cpti 情侣', 'cpti 测试', 'cpti 灵魂伴侣', 'cpti 老夫老妻', 'cp 关系测试', '情侣人格测试'],
    color: '#e11d48',
  },
  {
    slug: 'bestie',
    emoji: '👯',
    name: '闺蜜',
    title: 'CPTI 闺蜜测试 — 你和闺蜜是塑料姐妹还是灵魂伴侣',
    description:
      'CPTI 闺蜜版：测测你和闺蜜在 25 种关系里是哪一种 —— 塑料姐妹（PLASTIC）/ 双子星（TWINS）/ 怪咖联盟（WEIRDOS）/ 自由联邦（FREE），3 分钟出结果。',
    heroHeadline: '你和闺蜜\n是塑料还是真金？',
    heroSub: '塑料姐妹 · 双子星 · 怪咖联盟 · 自由联邦',
    intro:
      '别人测姐妹用的是星座配对，我们测的是关系动力。CPTI 看的是你们 5 个关系切面的组合 —— 谁是主导、谁更黏、谁照顾谁、吵架谁先低头。25 种关系类型里，闺蜜出现频率最高的是 PLASTIC（塑料姐妹）、TWINS（双子星）、SYNC（心灵同步）和 WEIRDOS（怪咖联盟）。把链接发给闺蜜测一下，你们大概率会笑出声。',
    cta: '测测我俩闺蜜浓度 →',
    inviteText: '快来测测我们是塑料姐妹还是灵魂伴侣 →',
    featuredSlugs: ['plastic', 'twins', 'sync', 'weirdos', 'allies', 'free', 'homies', 'keeper'],
    keywords: ['cpti 闺蜜', 'cpti 姐妹', '塑料姐妹测试', '闺蜜关系测试', 'cpti 死党'],
    color: '#ec4899',
  },
  {
    slug: 'family',
    emoji: '👨‍👩‍👧',
    name: '家人 · 母子 · 母女',
    title: 'CPTI 家人测试 — 你和妈/爸/兄弟姐妹是哪种关系',
    description:
      'CPTI 家人/母子/母女版：3 分钟测你和家人在 25 种关系里是哪一种 —— 妈系恋人（PARENT）/ 命运共同体（UNITED）/ 铜墙铁壁（SHIELD）/ 自由联邦（FREE）。',
    heroHeadline: '你和妈\n是哪一种关系？',
    heroSub: '妈系 · 命运共同体 · 铜墙铁壁 · 自由联邦',
    intro:
      '小红书上"cpti 母子""cpti 母女"已经是高频搜索词，因为家人之间的关系比恋爱更难命名 —— 既亲近又有距离，既感激又会窒息。CPTI 把这些复杂的家人动力归纳到 25 种关系类型里，用一段 3 分钟测试帮你给和家人的关系起一个准到笑出来的名字。把链接发给爸妈或兄弟姐妹，你会得到一个可以贴在朋友圈的称号。',
    cta: '测测我和家人是哪一种关系 →',
    inviteText: '我俩是 25 种关系里的哪一种？妈，来测一下 →',
    featuredSlugs: ['parent', 'united', 'shield', 'mentor', 'free', 'twins', 'glued', 'iceberg'],
    keywords: ['cpti 母子', 'cpti 母女', 'cpti 家人', 'cpti 父女', '家庭关系测试', '亲子关系测试'],
    color: '#f59e0b',
  },
  {
    slug: 'work',
    emoji: '💼',
    name: '同事 · 队友',
    title: 'CPTI 同事/队友测试 — 你和同事是战略同盟还是塑料死敌',
    description:
      'CPTI 职场版：测测你和同事/老板/队友在 25 种关系里是哪一种 —— 战略同盟（ALLIES）/ 狱友（INMATE）/ 铁磁兄弟（HOMIES）/ 塑料死敌（ENEMIES），打工人必测。',
    heroHeadline: '你和同事\n是同盟还是死敌？',
    heroSub: '战略同盟 · 狱友 · 铁磁兄弟 · 塑料死敌',
    intro:
      'CPTI 不只是恋爱测试 —— 在职场里，你和同事的关系也是高强度的关系动力学。一起骂老板的是 INMATE（狱友），互相 cover 的是 ALLIES（战略同盟），表面客气背后较劲的可能是 ENEMIES（塑料死敌）。把链接丢到工作群里，让大家给彼此的关系起一个新名字 —— 比团建有用。',
    cta: '测测我和同事是哪一种关系 →',
    inviteText: '测测我们的合作关系（25 种里挑一个） →',
    featuredSlugs: ['allies', 'inmate', 'homies', 'enemies', 'mentor', 'shield', 'rookie', 'iceberg'],
    keywords: ['cpti 同事', 'cpti 老板', 'cpti 队友', '职场关系测试', 'cpti 工作'],
    color: '#0ea5e9',
  },
  {
    slug: 'enemy',
    emoji: '⚔️',
    name: '死对头 · 桃园结义',
    title: 'CPTI 死对头测试 — 桃园结义还是相爱相杀',
    description:
      'CPTI 死对头版：测测你和死对头在 25 种关系里是哪一种 —— 桃园结义般的灵魂伴侣（SOUL）？相爱相杀（RIVALS）？欢喜冤家（LOVERS）？还是塑料死敌（ENEMIES）？',
    heroHeadline: '你和死对头\n到底是谁离不开谁？',
    heroSub: '相爱相杀 · 欢喜冤家 · 塑料死敌 · 桃园结义',
    intro:
      '小红书上"cpti 桃园结义"是火爆的搜索词，因为最有梗的关系往往不是恋爱，而是那个"我恨你但我天天找你"的死对头。CPTI 把这种复杂的爱恨纠缠精准归纳到 25 种关系类型里 —— RIVALS（相爱相杀）、LOVERS（欢喜冤家）、ENEMIES（塑料死敌）、VOLCANO（活火山组合）每一种都准到笑出声。把链接发给那个让你又爱又恨的人，看看到底谁先服软。',
    cta: '测测我俩到底是哪一种 →',
    inviteText: '看看 25 种关系里我俩到底是哪一种 →',
    featuredSlugs: ['rivals', 'lovers', 'enemies', 'volcano', 'soul', 'paradox', 'mirror', 'iceberg'],
    keywords: ['cpti 死对头', 'cpti 桃园结义', 'cpti 相爱相杀', 'cpti 欢喜冤家', '死对头测试'],
    color: '#dc2626',
  },
];

export function getCptiScenarioBySlug(slug: string): CptiScenarioConfig | undefined {
  return CPTI_SCENARIOS.find((s) => s.slug === slug);
}

export function getAllCptiScenarioSlugs(): CptiScenarioSlug[] {
  return CPTI_SCENARIOS.map((s) => s.slug);
}

export function getFeaturedRelationshipsForScenario(slug: string): CptiRelationshipType[] {
  const scenario = getCptiScenarioBySlug(slug);
  if (!scenario) return [];
  return scenario.featuredSlugs
    .map((s) => CPTI_RELATIONSHIP_TYPES.find((r) => r.slug === s))
    .filter((r): r is CptiRelationshipType => Boolean(r));
}
