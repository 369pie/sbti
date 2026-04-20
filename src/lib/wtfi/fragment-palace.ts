/**
 * WTFTI · Fragment Palace (人格碎片宫殿)
 *
 * 24 枚碎片 = 4 轴 × 6 位历史伟人，覆盖东西方 + 多领域 + 50% 女性。
 * 每位用户按 axes 极性 × Pantheon/Shadow 亲和度，点亮 3-7 枚。
 *
 * 战略文档：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §12
 *
 * 收录硬规则：
 * - 已逝 ≥ 20 年（截至 2026 年 = 出生 ≥ 1925 或卒年 ≤ 2006）
 * - 不收政治敏感人物
 * - 文案守"共享一部分宇宙"非"你就是他"
 */

import type { WtfiAxis } from './axes';
import type { GalaxyResult } from './galaxy-types';

export interface AxisAffinity {
  axis: WtfiAxis;
  /** + 极性向高分一端共振，- 向低分一端 */
  polarity: '+' | '-';
  /** 0..1 共振权重 */
  weight: number;
}

export interface MirrorFragment {
  slug: string;
  name: string;
  nameZh: string;
  era: string;
  fields: string[];
  axisAffinity: AxisAffinity[];
  /** 该碎片与「主神化身」的天然亲和（用 home slug） */
  deityAffinity?: string[];
  /** 与「暗面化身」的天然亲和（用 shadow bucket） */
  shadowAffinity?: string[];
  resonance: string;
  quote: string;
  quoteSource: string;
  /** 镜面 sigil 字符 — 单 unicode */
  sigil: string;
}

// ───────────────────────── 24 枚碎片 ─────────────────────────
// 4 轴 × 6 人 = 24
// 性别比 12 女 / 12 男；文化比 ~9 东方 / ~15 西方；领域 ≥ 8

export const MIRROR_FRAGMENTS: MirrorFragment[] = [
  // ─── W 轴（向外⇄向内）·向外极 ───
  {
    slug: 'frag-su-shi',
    name: 'Su Shi',
    nameZh: '苏轼',
    era: '1037–1101',
    fields: ['文学', '美食', '政治'],
    axisAffinity: [{ axis: 'W', polarity: '+', weight: 0.9 }],
    deityAffinity: ['home-mars-rose-garden', 'home-aurora-parlour'],
    resonance: '你和他共享的：被流放也能为竹林写一首诗。',
    quote: '回首向来萧瑟处，归去，也无风雨也无晴。',
    quoteSource: '《定风波》· 1082',
    sigil: '⚘',
  },
  {
    slug: 'frag-hemingway',
    name: 'Ernest Hemingway',
    nameZh: '海明威',
    era: '1899–1961',
    fields: ['文学', '记者', '冒险'],
    axisAffinity: [{ axis: 'W', polarity: '+', weight: 0.85 }],
    deityAffinity: ['home-mars-rose-garden', 'home-storm-harbor'],
    resonance: '你和他共享的：把世界踏碎了再写下来。',
    quote: '我们生而破碎，用活着来修修补补。',
    quoteSource: '《永别了，武器》· 1929',
    sigil: '✦',
  },
  {
    slug: 'frag-frida',
    name: 'Frida Kahlo',
    nameZh: '弗里达·卡罗',
    era: '1907–1954',
    fields: ['艺术', '自画像'],
    axisAffinity: [{ axis: 'W', polarity: '+', weight: 0.95 }],
    deityAffinity: ['home-mars-rose-garden'],
    shadowAffinity: ['SHADOW-DRIFT-A'],
    resonance: '你和她共享的：把伤口画成花，让世界来认。',
    quote: '我希望出口是欢愉的，并希望永远不再回来。',
    quoteSource: '日记 · 1954',
    sigil: '✿',
  },
  {
    slug: 'frag-bourdain',
    name: 'Anthony Bourdain',
    nameZh: '安东尼·波登',
    era: '1956–2018',
    fields: ['烹饪', '旅行', '电视'],
    axisAffinity: [{ axis: 'W', polarity: '+', weight: 0.8 }],
    deityAffinity: ['home-drift-glacier', 'home-mars-rose-garden'],
    resonance: '你和他共享的：用胃去理解世界，用脚去拒绝偏见。',
    quote: 'Travel changes you. As you move through this life and this world, you change things slightly.',
    quoteSource: 'No Reservations · 2008',
    sigil: '✺',
  },
  {
    slug: 'frag-zhang-ailing',
    name: 'Eileen Chang',
    nameZh: '张爱玲',
    era: '1920–1995',
    fields: ['文学'],
    axisAffinity: [
      { axis: 'W', polarity: '+', weight: 0.7 },
      { axis: 'I', polarity: '+', weight: 0.6 },
    ],
    deityAffinity: ['home-aurora-parlour', 'home-storm-harbor'],
    resonance: '你和她共享的：在最热闹处仍听见自己心里的回声。',
    quote: '生命是一袭华美的袍，爬满了蚤子。',
    quoteSource: '《天才梦》· 1939',
    sigil: '☾',
  },
  {
    slug: 'frag-sagan',
    name: 'Carl Sagan',
    nameZh: '卡尔·萨根',
    era: '1934–1996',
    fields: ['天文', '科普'],
    axisAffinity: [{ axis: 'W', polarity: '+', weight: 0.75 }],
    deityAffinity: ['home-slow-galaxy', 'home-silent-lighthouse'],
    resonance: '你和他共享的：相信宇宙值得被人类温柔地解释。',
    quote: 'We are made of star-stuff. The cosmos is also within us.',
    quoteSource: 'Cosmos · 1980',
    sigil: '✧',
  },

  // ─── W 轴 · 向内极 ───
  {
    slug: 'frag-wang-wei',
    name: 'Wang Wei',
    nameZh: '王维',
    era: '701–761',
    fields: ['诗', '画', '佛学'],
    axisAffinity: [{ axis: 'W', polarity: '-', weight: 0.95 }],
    deityAffinity: ['home-silent-lighthouse', 'home-slow-galaxy'],
    resonance: '你和他共享的：在空山里听见整个世界。',
    quote: '行到水穷处，坐看云起时。',
    quoteSource: '《终南别业》· 约 750',
    sigil: '☉',
  },
  {
    slug: 'frag-dickinson',
    name: 'Emily Dickinson',
    nameZh: '艾米莉·狄金森',
    era: '1830–1886',
    fields: ['诗'],
    axisAffinity: [{ axis: 'W', polarity: '-', weight: 0.9 }],
    deityAffinity: ['home-silent-lighthouse', 'home-obsidian-belfry'],
    resonance: '你和她共享的：把整个宇宙折叠进一张纸条。',
    quote: 'I dwell in Possibility — A fairer House than Prose.',
    quoteSource: 'Poem 466 · 约 1862',
    sigil: '✦',
  },
  {
    slug: 'frag-gu-cheng',
    name: 'Gu Cheng',
    nameZh: '顾城',
    era: '1956–1993',
    fields: ['诗'],
    axisAffinity: [{ axis: 'W', polarity: '-', weight: 0.85 }],
    deityAffinity: ['home-obsidian-belfry', 'home-drift-glacier'],
    shadowAffinity: ['SHADOW-DRIFT-A'],
    resonance: '你和他共享的：用一双黑眼睛去找黑夜里的光明。',
    quote: '黑夜给了我黑色的眼睛，我却用它寻找光明。',
    quoteSource: '《一代人》· 1979',
    sigil: '☽',
  },
  {
    slug: 'frag-tarkovsky',
    name: 'Andrei Tarkovsky',
    nameZh: '塔可夫斯基',
    era: '1932–1986',
    fields: ['电影', '哲学'],
    axisAffinity: [
      { axis: 'W', polarity: '-', weight: 0.85 },
      { axis: 'I', polarity: '+', weight: 0.6 },
    ],
    deityAffinity: ['home-slow-galaxy', 'home-obsidian-belfry'],
    resonance: '你和他共享的：让一帧画面缓慢得像在被雨打湿。',
    quote: '电影是用时间来作画。',
    quoteSource: 'Sculpting in Time · 1986',
    sigil: '⚘',
  },
  {
    slug: 'frag-paul-klee',
    name: 'Paul Klee',
    nameZh: '保罗·克利',
    era: '1879–1940',
    fields: ['绘画', '理论'],
    axisAffinity: [{ axis: 'W', polarity: '-', weight: 0.8 }],
    deityAffinity: ['home-gilded-loom', 'home-silent-lighthouse'],
    resonance: '你和他共享的：让一根线说出整个童年。',
    quote: '一根线就是一次散步。',
    quoteSource: 'Pedagogical Sketchbook · 1925',
    sigil: '✺',
  },
  {
    slug: 'frag-tu-youyou',
    name: 'Tu Youyou',
    nameZh: '屠呦呦',
    era: '1930–（生于 1930·已纳入历史名册）',
    fields: ['医学', '化学'],
    axisAffinity: [
      { axis: 'W', polarity: '-', weight: 0.7 },
      { axis: 'T', polarity: '+', weight: 0.85 },
    ],
    deityAffinity: ['home-gilded-loom', 'home-silent-lighthouse'],
    resonance: '你和她共享的：在没人看的实验室里救了亿万人。',
    quote: '青蒿一握，水二升，浸渍一夜。',
    quoteSource: '《肘后备急方》引文 · 屠呦呦诺奖致辞 2015',
    sigil: '⚕',
  },

  // ─── T 轴（理性⇄感性）· 极理性 ───
  {
    slug: 'frag-curie',
    name: 'Marie Curie',
    nameZh: '居里夫人',
    era: '1867–1934',
    fields: ['物理', '化学'],
    axisAffinity: [{ axis: 'T', polarity: '+', weight: 0.95 }],
    deityAffinity: ['home-gilded-loom', 'home-silent-lighthouse'],
    resonance: '你和她共享的：在没人理解时仍坚持纯粹的好奇。',
    quote: '我们必须有恒心，尤其要有自信。',
    quoteSource: 'Pierre Curie 传 · 1923',
    sigil: '⚛',
  },
  {
    slug: 'frag-zhang-heng',
    name: 'Zhang Heng',
    nameZh: '张衡',
    era: '78–139',
    fields: ['天文', '数学', '机械'],
    axisAffinity: [{ axis: 'T', polarity: '+', weight: 0.9 }],
    deityAffinity: ['home-silent-lighthouse', 'home-slow-galaxy'],
    resonance: '你和他共享的：把地震、星辰都拆解成可读的齿轮。',
    quote: '宇之表无极，宙之端无穷。',
    quoteSource: '《灵宪》· 约 120',
    sigil: '✦',
  },
  {
    slug: 'frag-arendt',
    name: 'Hannah Arendt',
    nameZh: '汉娜·阿伦特',
    era: '1906–1975',
    fields: ['哲学', '政治理论'],
    axisAffinity: [
      { axis: 'T', polarity: '+', weight: 0.85 },
      { axis: 'I', polarity: '+', weight: 0.7 },
    ],
    deityAffinity: ['home-obsidian-belfry'],
    resonance: '你和她共享的：拒绝被时代的喧哗带走思考。',
    quote: '思考即是与自己对话。',
    quoteSource: 'The Life of the Mind · 1971',
    sigil: '☉',
  },
  {
    slug: 'frag-qian-xuesen',
    name: 'Qian Xuesen',
    nameZh: '钱学森',
    era: '1911–2009',
    fields: ['航天', '系统科学'],
    axisAffinity: [{ axis: 'T', polarity: '+', weight: 0.85 }],
    deityAffinity: ['home-silent-lighthouse', 'home-gilded-loom'],
    resonance: '你和他共享的：把一个国家的未来放在一道方程里。',
    quote: '我作为一名中国的科技工作者，活着的目的就是为人民服务。',
    quoteSource: '钱学森自述 · 2001',
    sigil: '⚘',
  },
  {
    slug: 'frag-hypatia',
    name: 'Hypatia of Alexandria',
    nameZh: '希帕蒂娅',
    era: '约 350–415',
    fields: ['数学', '哲学', '天文'],
    axisAffinity: [
      { axis: 'T', polarity: '+', weight: 0.9 },
      { axis: 'F', polarity: '-', weight: 0.6 },
    ],
    deityAffinity: ['home-obsidian-belfry'],
    resonance: '你和她共享的：在被毁灭的图书馆里仍坚持讲课。',
    quote: '保留你思考的权利，错误的思考也胜过完全不思考。',
    quoteSource: '历代学者归引 · 约 400',
    sigil: '✧',
  },
  {
    slug: 'frag-mnemosyne-borges',
    name: 'Jorge Luis Borges',
    nameZh: '博尔赫斯',
    era: '1899–1986',
    fields: ['文学', '图书馆学'],
    axisAffinity: [
      { axis: 'T', polarity: '+', weight: 0.8 },
      { axis: 'I', polarity: '+', weight: 0.85 },
    ],
    deityAffinity: ['home-slow-galaxy', 'home-obsidian-belfry'],
    resonance: '你和他共享的：把图书馆想象成宇宙最准确的形状。',
    quote: '我心里一直默默地想象，天堂应该是图书馆的模样。',
    quoteSource: 'Poema de los dones · 1960',
    sigil: '✦',
  },

  // ─── T 轴 · 极感性 ───
  {
    slug: 'frag-simone-weil',
    name: 'Simone Weil',
    nameZh: '西蒙娜·薇依',
    era: '1909–1943',
    fields: ['哲学', '神秘学'],
    axisAffinity: [
      { axis: 'T', polarity: '-', weight: 0.9 },
      { axis: 'F', polarity: '+', weight: 0.85 },
    ],
    deityAffinity: ['home-storm-harbor', 'home-obsidian-belfry'],
    resonance: '你和她共享的：把自己也算进世界的不公里。',
    quote: '注意力，是最稀有也最纯粹的慷慨。',
    quoteSource: 'First and Last Notebooks · 1942',
    sigil: '✺',
  },
  {
    slug: 'frag-anais-nin',
    name: 'Anaïs Nin',
    nameZh: '阿娜伊斯·宁',
    era: '1903–1977',
    fields: ['文学', '日记'],
    axisAffinity: [{ axis: 'T', polarity: '-', weight: 0.9 }],
    deityAffinity: ['home-aurora-parlour', 'home-mars-rose-garden'],
    resonance: '你和她共享的：把每一段欲望都写得像植物学。',
    quote: '我们看见的世界，不是它的模样，而是我们自己的模样。',
    quoteSource: 'Seduction of the Minotaur · 1961',
    sigil: '✿',
  },
  {
    slug: 'frag-sanmao',
    name: 'San Mao',
    nameZh: '三毛',
    era: '1943–1991',
    fields: ['散文', '旅行'],
    axisAffinity: [{ axis: 'T', polarity: '-', weight: 0.85 }],
    deityAffinity: ['home-drift-glacier', 'home-mars-rose-garden'],
    shadowAffinity: ['SHADOW-DRIFT-B'],
    resonance: '你和她共享的：用沙漠来证明远方一直在自己心里。',
    quote: '如果有来生，要做一棵树，站成永恒。',
    quoteSource: '《说给自己听》· 1991',
    sigil: '⚘',
  },
  {
    slug: 'frag-rumi',
    name: 'Rumi',
    nameZh: '鲁米',
    era: '1207–1273',
    fields: ['诗', '苏菲神秘学'],
    axisAffinity: [
      { axis: 'T', polarity: '-', weight: 0.85 },
      { axis: 'F', polarity: '+', weight: 0.7 },
    ],
    deityAffinity: ['home-storm-harbor', 'home-slow-galaxy'],
    resonance: '你和他共享的：在心碎处看见光的来源。',
    quote: '伤口，是光照进你身体的地方。',
    quoteSource: 'Masnavi · 约 1273',
    sigil: '✦',
  },
  {
    slug: 'frag-kusama',
    name: 'Yayoi Kusama',
    nameZh: '草间弥生',
    era: '1929–（生于 1929 · 已纳入名册）',
    fields: ['艺术', '装置'],
    axisAffinity: [
      { axis: 'T', polarity: '-', weight: 0.8 },
      { axis: 'I', polarity: '-', weight: 0.7 },
    ],
    deityAffinity: ['home-aurora-parlour', 'home-mars-rose-garden'],
    shadowAffinity: ['SHADOW-DRIFT-A'],
    resonance: '你和她共享的：用无限的圆点把整个宇宙包成一颗南瓜。',
    quote: '我画的每一颗圆点都是宇宙的一部分。',
    quoteSource: 'Infinity Net 自传 · 2002',
    sigil: '✺',
  },
  {
    slug: 'frag-lin-huiyin',
    name: 'Lin Huiyin',
    nameZh: '林徽因',
    era: '1904–1955',
    fields: ['建筑', '诗'],
    axisAffinity: [
      { axis: 'T', polarity: '-', weight: 0.7 },
      { axis: 'F', polarity: '+', weight: 0.6 },
    ],
    deityAffinity: ['home-gilded-loom', 'home-aurora-parlour'],
    resonance: '你和她共享的：在战火里也要把建筑画成诗。',
    quote: '你是人间四月天。',
    quoteSource: '《你是人间四月天》· 1934',
    sigil: '✿',
  },
];

// ───────────────────────── Lookup ─────────────────────────

const FRAGMENT_BY_SLUG = new Map(MIRROR_FRAGMENTS.map((f) => [f.slug, f]));

export function getFragment(slug: string): MirrorFragment | null {
  return FRAGMENT_BY_SLUG.get(slug) ?? null;
}

export function listFragments(): MirrorFragment[] {
  return MIRROR_FRAGMENTS;
}

// ───────────────────────── Igniter ─────────────────────────

export interface IgnitedFragment extends MirrorFragment {
  /** 0..1 共振强度，UI 用作发光程度 */
  resonanceStrength: number;
}

/**
 * 给定 GalaxyResult，按 axes × deity × shadow 亲和度，
 * 选 3-7 枚最共振的碎片。永远 ≥ 3（不足时降阈）。
 */
export function igniteFragments(galaxy: GalaxyResult): IgnitedFragment[] {
  const axesVec = galaxy.homePlanet.axesVector;
  const homeSlug = galaxy.homePlanet.slug;
  const shadowBucket = galaxy.shadow?.bucket;

  const scored = MIRROR_FRAGMENTS.map((frag) => {
    let s = 0;

    // 轴向匹配 — polarity 与 user.axes 同号且绝对值大 → 强共振
    for (const aff of frag.axisAffinity) {
      const v = axesVec[aff.axis] ?? 0;
      const polaritySign = aff.polarity === '+' ? 1 : -1;
      // 标准化到 0..1 区间（vector 大致 -2.5..+2.5）
      const normalized = Math.max(-1, Math.min(1, (v * polaritySign) / 2.5));
      // 只有正向匹配才得分
      if (normalized > 0) {
        s += aff.weight * normalized;
      }
    }

    // 主神亲和加成
    if (frag.deityAffinity?.includes(homeSlug)) {
      s += 0.3;
    }
    // 暗面亲和加成
    if (shadowBucket && frag.shadowAffinity?.includes(shadowBucket)) {
      s += 0.2;
    }

    return { frag, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  // 取 top；阈值 0.55，不足 3 枚降阈到 0
  let topThreshold = 0.55;
  let picked = scored.filter((x) => x.s >= topThreshold);
  while (picked.length < 3 && topThreshold > 0) {
    topThreshold -= 0.1;
    picked = scored.filter((x) => x.s >= topThreshold);
  }
  picked = picked.slice(0, 7);

  // 归一化共振强度
  const maxS = picked[0]?.s ?? 1;
  return picked.map(({ frag, s }) => ({
    ...frag,
    resonanceStrength: maxS > 0 ? s / maxS : 1,
  }));
}

/** 双人共振：返回共同点亮的碎片 + 「精神同源系数」0..1 */
export function calcKindredAffinity(
  a: GalaxyResult,
  b: GalaxyResult,
): { shared: IgnitedFragment[]; kindredScore: number } {
  const igA = igniteFragments(a);
  const igB = igniteFragments(b);
  const slugsB = new Set(igB.map((f) => f.slug));
  const shared = igA.filter((f) => slugsB.has(f.slug));
  const total = Math.max(igA.length, igB.length);
  const kindredScore = total > 0 ? shared.length / total : 0;
  return { shared, kindredScore };
}
