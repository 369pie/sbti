/**
 * WTFTI · Contemporary Deity Layer (v1)
 *
 * 第三层人格神域：当代女性亚文化神祇。
 * 与 8 主神化身（古典神话）+ 5 暗面副形（奇幻原型）并列，作为「明面 · 现世化身」。
 *
 * 设计动机（2026-04-20）：
 * 小红书两条真实反馈表明赛道当前竞赛维度已从「题目精度」转向
 * 「身份锐度 + 评论区暗号密度」。HERTI（精致历史女性）被批评为离普通人太远，
 * SDTI（无孩爱猫女 / 我是女巫）单帖 1.7 万赞证明「咒语化当代身份 + 评论区抱团」
 * 是当下最有效的女性人格分享路径。
 *
 * 本层不修改任何 schema / scoring / slug；仅作为 UI 层的「现世化身」叠加，
 * 通过 home planet slug 决定性映射，可选用 shadow bucket 做 mood 微调。
 *
 * Brand voice 张力处理（参考 ../../../memories/session/plan.md §7）：
 * - 视觉沿用 Editorial Atelier 调色板（玫瑰陶土 / 金箔 / 暮紫底）
 * - 文字层升锐：第一人称、宣言体、≤30 字咒语、可一键复制的 XHS 评论暗号
 *
 * 落地参考：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §1-4 +
 * /memories/session/plan.md（机会 2A + 2B）。
 */

import type { HomePlanetSlug } from './constellation-anchors';

// ───────────────────────── Types ─────────────────────────

export interface ContemporaryDeity {
  /** 唯一 id，与 home planet 一一对应（v1） */
  id: HomePlanetSlug;
  /** 当代身份名（中文，宣言体） */
  name: string;
  /** 拉丁/英文身份签 */
  latinName: string;
  /** 单 token 大写身份标签：分享卡眉头与 XHS hashtag 用 */
  tag: string;
  /** 生活气 emoji（不用神话符号） */
  glyph: string;
  /** ≤30 字咒语：分享卡主标 / 评论区队旗 */
  mantra: string;
  /** 3 条信条（≤30 字，第一人称，宣言体） */
  creed: [string, string, string];
  /** 3 条 XHS 同好暗号（≤25 字，可一键复制到评论区） */
  echoes: [string, string, string];
  /** 与古典主神的承接关系——一句话承接，避免叙事撕裂 */
  bridgeFromDeity: string;
  /** 可选 · 暗面叠加时附加的一句话身份强化（≤24 字，第一人称） */
  shadowEcho?: string;
}

// ───────────────────────── 8 现世化身 ─────────────────────────

export const CONTEMPORARY_DEITIES: Record<HomePlanetSlug, ContemporaryDeity> = {
  'home-storm-harbor': {
    id: 'home-storm-harbor',
    name: '港口 sis · 自给型姐姐',
    latinName: 'Harbor Sis',
    tag: 'SIS HARBOR',
    glyph: '⚓',
    mantra: '我可以是港，但今晚我先抱我自己。',
    creed: [
      '别人的风暴，我先收她半小时。',
      '能量不外借，先给她热汤。',
      '我答应你之前先答应我。',
    ],
    echoes: [
      '我也是 sis 港口型，今晚收摊。',
      '本港今日不接客，仅接自己。',
      '+1 sis 准则第一条：先抱自己。',
    ],
    bridgeFromDeity: '湘夫人等不到的那个人，现在由你自己接回。',
    shadowEcho: '我也吞过浪，所以我知道港口要建在哪。',
  },
  'home-aurora-parlour': {
    id: 'home-aurora-parlour',
    name: '玫瑰沙龙主理人',
    latinName: 'Rose Salon Hostess',
    tag: 'SALON HOSTESS',
    glyph: '✿',
    mantra: '美是入场券，不是申请书。',
    creed: [
      '我先把自己款待好，再开门。',
      '被注视不等于被审判。',
      '客人来不来，我都自带光源。',
    ],
    echoes: [
      '我也是沙龙主理人本主理。',
      '美 ≠ 求职，准则成立。',
      '+1 沙龙准则：自己先入座。',
    ],
    bridgeFromDeity: '嫦娥的广寒宫，现在改成你客厅。',
    shadowEcho: '我熄过灯，所以我懂何时点亮。',
  },
  'home-gilded-loom': {
    id: 'home-gilded-loom',
    name: '系统返修女巫',
    latinName: 'Loom Witch',
    tag: 'LOOM WITCH',
    glyph: '✦',
    mantra: '她们写系统，我写反咒。',
    creed: [
      '不能改的规则，我先把它读懂。',
      '修补不是讨好，是不让它再伤别人。',
      '我手里有针，所以我不慌。',
    ],
    echoes: [
      '我是返修女巫本巫，签到。',
      '反咒第一条：先认完整规则。',
      '+1 织梦女巫，针在手里。',
    ],
    bridgeFromDeity: '女娲补天用的五色石，现在叫做 git revert。',
    shadowEcho: '我修过坏掉的，所以我看穿好的。',
  },
  'home-silent-lighthouse': {
    id: 'home-silent-lighthouse',
    name: '反班味姑姑',
    latinName: 'Off-Duty Auntie',
    tag: 'OFF-DUTY',
    glyph: '☉',
    mantra: '下班即神格。',
    creed: [
      '不在场的我，是更完整的我。',
      '你找得到我，是因为我先回来。',
      '不动，是我对世界最大的善意。',
    ],
    echoes: [
      '我是反班味姑姑教派创始人之一。',
      '下班即神格，签收。',
      '+1 班味驱散，准则成立。',
    ],
    bridgeFromDeity: '常羲生十二月，你只想生一个安稳的周末。',
    shadowEcho: '我装过忙，所以我珍惜真闲。',
  },
  'home-slow-galaxy': {
    id: 'home-slow-galaxy',
    name: '无孩爱猫女',
    latinName: 'Cat-Free Galaxy Resident',
    tag: 'CHILDFREE · CAT',
    glyph: '🐈‍⬛',
    mantra: '我家有猫，没有 deadline。',
    creed: [
      '不生不养不解释，宇宙够慢。',
      '猫先吃，我后吃，世界不归我管。',
      '我的延迟是宇宙允许的延迟。',
    ],
    echoes: [
      '我也是无孩爱猫女本女。',
      '准则：猫先于 KPI。',
      '+1 慢宇宙住民，签到。',
    ],
    bridgeFromDeity: '西王母不催蟠桃熟，你也不必催自己的人生。',
    shadowEcho: '我熬过深夜，所以我让猫先睡。',
  },
  'home-drift-glacier': {
    id: 'home-drift-glacier',
    name: 'Childfree 漂流者',
    latinName: 'Childfree Drifter',
    tag: 'CHILD-FREE',
    glyph: '❅',
    mantra: '不生不养不解释，潮汐替我答辩。',
    creed: [
      '我的子嗣是我自己的另一个版本。',
      '亲缘网络不靠血缘续命。',
      '我漂着不是没靠岸，是不属于任何一个港。',
    ],
    echoes: [
      '我也是 childfree by choice。',
      '解释权不归亲戚所有。',
      '+1 漂流者联盟，免答辩。',
    ],
    bridgeFromDeity: '凌波仙子从不停泊，你的人生轨道由潮汐书写。',
    shadowEcho: '我漂过暗流，所以我不再被解释绑架。',
  },
  'home-obsidian-belfry': {
    id: 'home-obsidian-belfry',
    name: '深夜守门女巫',
    latinName: 'Night Witch · Gatekeeper',
    tag: 'NIGHT WITCH',
    glyph: '☽',
    mantra: '我不审判你，我替你计时。',
    creed: [
      '看穿不等于揭穿，我留三分。',
      '我活得久，所以我有耐心等你。',
      '夜不是惩罚，是你终于安静的房间。',
    ],
    echoes: [
      '我是深夜女巫本巫，凌晨值班。',
      '准则：看穿但不揭穿。',
      '+1 守门女巫，时间在我这。',
    ],
    bridgeFromDeity: 'Hecate 的钥匙串，现在挂在你深夜的浏览器收藏夹里。',
    shadowEcho: '我数过别人的秘密，所以我守得住自己的。',
  },
  'home-mars-rose-garden': {
    id: 'home-mars-rose-garden',
    name: '红玫瑰女巫 · 怒爱同源',
    latinName: 'Red Rose Witch',
    tag: 'RED WITCH',
    glyph: '⚭',
    mantra: '我的爱和怒火是一个温度。',
    creed: [
      '不是控制不住，是我选择不冷却。',
      '能拥抱也能划界，两件都是爱。',
      '玫瑰带刺不是缺陷，是说明书。',
    ],
    echoes: [
      '我也是红玫瑰女巫，怒爱同源。',
      '准则：温度统一，不分场。',
      '+1 红巫教，玫瑰带刺。',
    ],
    bridgeFromDeity: 'Venus 与 Mars 共一座园——爱与怒不是对立，是同质。',
    shadowEcho: '我也烧过自己，所以我精确控温。',
  },
};

// ───────────────────────── Convenience ─────────────────────────

/** 由 home planet slug 取得现世化身（v1：决定性映射，无 shadow 变体） */
export function getContemporaryDeity(slug: string): ContemporaryDeity | null {
  return CONTEMPORARY_DEITIES[slug as HomePlanetSlug] ?? null;
}

/** 一行总结：给 OG / share copy 用 */
export function contemporaryShareLine(slug: string): string {
  const d = getContemporaryDeity(slug);
  if (!d) return '';
  return `${d.glyph} ${d.name} · ${d.mantra}`;
}
