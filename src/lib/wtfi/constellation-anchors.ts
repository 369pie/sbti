/**
 * Constellation Anchors · 8 主星 ↔ IAU 星座 / 神话 / 科学 / 文学 三联映射
 *
 * 由 docs/01-strategy/wtfti-cosmic-romance-narrative-2026-04-19.md §1 定义。
 * 每颗主星挂一段神话（女性向 / 高级感）、一段科学事实（可信度）、一句文学引语（截屏价值）。
 *
 * 不引入 LLM；这层是手写策展，永远确定性。
 */

export type HomePlanetSlug =
  | 'home-storm-harbor' // 暴雨港湾 WTFI-STH
  | 'home-aurora-parlour' // 极光客厅 WTFI-AUR
  | 'home-gilded-loom' // 镀金缝纫机 WTFI-GLD
  | 'home-silent-lighthouse' // 沉默灯塔 WTFI-LIT
  | 'home-slow-galaxy' // 慢银河 WTFI-SLW
  | 'home-drift-glacier' // 漂流冰川 WTFI-DRF
  | 'home-obsidian-belfry' // 黑曜钟楼 WTFI-OBS
  | 'home-mars-rose-garden'; // 火星玫瑰园 WTFI-MRS

export interface ConstellationAnchor {
  slug: HomePlanetSlug;
  /** 中文星座 / 恒星名 */
  constellation: string;
  /** 拉丁/英文学名（IAU 标准） */
  constellationLatin: string;
  /** 一句神话（女性向、高级、不长） */
  myth: string;
  /** 一句科学事实（带数字，可信度锚点） */
  science: string;
  /** 一句文学引语（中文优先，留白即可） */
  literary: { quote: string; author: string };
}

export const CONSTELLATION_ANCHORS: Record<HomePlanetSlug, ConstellationAnchor> = {
  'home-storm-harbor': {
    slug: 'home-storm-harbor',
    constellation: '织女座',
    constellationLatin: 'Lyra · Vega',
    myth: '天上的渡口，等不归人 — 织女隔着银河等待，把港湾留给夜里所有的船。',
    science: '距地球 25 光年的青白色巨星，亮度是太阳的 40 倍，1.2 万年后将取代北极星成为北极。',
    literary: {
      quote: '我达达的马蹄是美丽的错误，我不是归人，是个过客。',
      author: '郑愁予 · 错误',
    },
  },
  'home-aurora-parlour': {
    slug: 'home-aurora-parlour',
    constellation: '仙后座',
    constellationLatin: 'Cassiopeia',
    myth: '自负的王后被钉在天幕成 W 形 — 即使被命运束缚，她依然像极光一样发光。',
    science: '北天最亮的 W 形星座，包含五颗主星，其中谢达星距地球 230 光年。',
    literary: {
      quote: '我们生而破碎，用活着来修修补补。',
      author: 'Hemingway · 改写',
    },
  },
  'home-gilded-loom': {
    slug: 'home-gilded-loom',
    constellation: '牛郎织女',
    constellationLatin: 'Altair × Vega',
    myth: '每年只见一次，但永不分手 — 鹊桥是宇宙最古老的"远距离恋爱"。',
    science: '夏季大三角的两颗顶点：织女 25 光年、牛郎 17 光年，二者真实距离 16 光年。',
    literary: {
      quote: '蓝墨水的上游，是黄河；黄河的上游，是星河。',
      author: '余光中 · 当我死时',
    },
  },
  'home-silent-lighthouse': {
    slug: 'home-silent-lighthouse',
    constellation: '北极星',
    constellationLatin: 'Polaris · Ursa Minor',
    myth: '唯一不动的星 — 千年间所有航海者的锚点；你站在那里，世界绕你转。',
    science: '距地球 433 光年的造父变星，亮度每 4 天周期性变化 0.03 等。',
    literary: {
      quote: '万物由我而出，我又复归于万物。',
      author: '苏轼 · 改写',
    },
  },
  'home-slow-galaxy': {
    slug: 'home-slow-galaxy',
    constellation: '银河',
    constellationLatin: 'Milky Way',
    myth: '天上的乳河 — 神话中的母亲一不小心打翻的乳汁，成了所有人共享的星空。',
    science: '直径约 10 万光年，含 1000–4000 亿颗恒星，太阳系完成一周公转需 2.4 亿年。',
    literary: {
      quote: '我看见的星光都是亿万年前的事，我等的人只是迟到了一会儿。',
      author: '张爱玲 · 改写',
    },
  },
  'home-drift-glacier': {
    slug: 'home-drift-glacier',
    constellation: '海豚座',
    constellationLatin: 'Delphinus',
    myth: '海神波塞冬的信使 — 温柔、漂泊、永远在两个海域之间游走。',
    science: '北天小型菱形星座，主星距地球约 300 光年，是夏夜银河边的一抹亮光。',
    literary: {
      quote: '我寄愁心与明月，随风直到夜郎西。',
      author: '李白 · 闻王昌龄左迁',
    },
  },
  'home-obsidian-belfry': {
    slug: 'home-obsidian-belfry',
    constellation: '天狼星',
    constellationLatin: 'Sirius · Canis Major',
    myth: '古埃及的索蒂斯女神 — 她每年升起一次，预示尼罗河泛滥与新生。',
    science: '全天最亮的恒星，距地球 8.6 光年，实际是双星系统（A + 一颗白矮星 B）。',
    literary: {
      quote: '我必须经过的地方，没人替我去走。',
      author: '鲁迅 · 改写',
    },
  },
  'home-mars-rose-garden': {
    slug: 'home-mars-rose-garden',
    constellation: '玫瑰星云',
    constellationLatin: 'Rosette Nebula · NGC 2237',
    myth: '战神和爱神共用的一片天 — 火与玫瑰本是同一种炽热。',
    science: '麒麟座中的发射星云，直径 130 光年，距地球 5200 光年，正在孕育新恒星。',
    literary: {
      quote: 'Rose is a rose is a rose is a rose.',
      author: 'Gertrude Stein · Sacred Emily',
    },
  },
};

export function getAnchor(slug: string): ConstellationAnchor | null {
  return (CONSTELLATION_ANCHORS as Record<string, ConstellationAnchor>)[slug] ?? null;
}
