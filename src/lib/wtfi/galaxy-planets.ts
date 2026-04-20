/**
 * Galaxy Planets · 运行时目录（8 主神 + 6 神侍 + 5 暗面化身）
 *
 * 单一来源真值；同时是 GalaxyResult 的人格元数据中心。
 * - 主神 slug 与 constellation-anchors.ts 一一对应
 * - 主神 / 神侍 / 暗面 image 文件位于 public/images/types/galaxy/{slug}.png
 * - prompt 数据见 scripts/galaxy-planet-prompts.mjs（Node 端，构图同步用）
 *
 * 注：内部 MoonPlanetEntry 类型与 moon-* slug 为历史命名，
 * 展示层一律使用"神侍（Companion Deity）"叙事（见 pantheon.ts）。
 *
 * 这一层不直接调 LLM；新增走 PR 评审进 catalog。
 */

import type { ShadowBucket } from './s-axis';
import type { HomePlanetSlug } from './constellation-anchors';

export interface HomePlanetEntry {
  slug: HomePlanetSlug;
  code: `WTFI-${string}`;
  name: string;
  headline: string;
  body: string;
  /** 推荐画面色调，用于卡片 accent */
  accent: string;
  /** UI tag 三连 */
  toneTags: [string, string, string];
  /** Pseudo-axes vector — 用于"画像归类"占位与 pair gravity 演示 */
  defaultAxesVector: { W: number; T: number; F: number; I: number };
  /** 默认卡图位置（生成完会落在这里） */
  cardImageUrl: string;
}

export interface MoonPlanetEntry {
  slug: string;
  code: `MOON-${string}`;
  name: string;
  universeId: 'romance' | 'work' | 'late-night';
  headline: string;
  body: string;
  accent: string;
  cardImageUrl: string;
}

export interface ShadowPlanetEntry {
  slug: string;
  bucket: ShadowBucket;
  name: string;
  headline: string;
  body: string;
  tooltip: string;
  accent: string;
  cardImageUrl: string;
}

export const HOME_PLANET_CATALOG: HomePlanetEntry[] = [
  {
    slug: 'home-storm-harbor',
    code: 'WTFI-STH',
    name: '暴雨港湾',
    headline: '你内心一直有海，外表只是港。',
    body: '你看上去稳，但心里有海。别人误读你的安静，是因为他们没在你心里开过船。',
    accent: '#C07A8E',
    toneTags: ['情绪深海', '高密度', '安全感引擎'],
    defaultAxesVector: { W: 1.4, T: -1.8, F: 0.6, I: 2.1 },
    cardImageUrl: '/images/types/galaxy/home-storm-harbor.png',
  },
  {
    slug: 'home-aurora-parlour',
    code: 'WTFI-AUR',
    name: '极光客厅',
    headline: 'ta 把每一次相遇都布置成展览。',
    body: 'ta 的内心常亮着一盏暖灯，所有人路过都觉得自己被记得。',
    accent: '#D4B58A',
    toneTags: ['策展型温柔', '社交气场', '高情商灯塔'],
    defaultAxesVector: { W: 1.1, T: -1.4, F: 0.9, I: 1.6 },
    cardImageUrl: '/images/types/galaxy/home-aurora-parlour.png',
  },
  {
    slug: 'home-gilded-loom',
    code: 'WTFI-GLD',
    name: '镀金缝纫机',
    headline: '你把所有情感都缝成了一件可以穿出门的外套。',
    body: '你不靠激情维持关系，你靠时间。你像每年只见一次但永不分手的牛郎织女。',
    accent: '#C9A676',
    toneTags: ['长情手艺人', '远距离专家', '把日子织出来'],
    defaultAxesVector: { W: -0.8, T: 1.2, F: 1.6, I: -0.4 },
    cardImageUrl: '/images/types/galaxy/home-gilded-loom.png',
  },
  {
    slug: 'home-silent-lighthouse',
    code: 'WTFI-LIT',
    name: '沉默灯塔',
    headline: '你不动，但所有人都用你定位。',
    body: '你不需要发光，你只是恰好在那儿。这世上一定有几个人靠你回家。',
    accent: '#9DC9FF',
    toneTags: ['锚点型', '低话密度', '高在场感'],
    defaultAxesVector: { W: -1.6, T: 0.4, F: 1.8, I: 0.2 },
    cardImageUrl: '/images/types/galaxy/home-silent-lighthouse.png',
  },
  {
    slug: 'home-slow-galaxy',
    code: 'WTFI-SLW',
    name: '慢银河',
    headline: '你说的每句话都比别人晚到三秒，但更准。',
    body: '你的反应慢不是迟钝，是你拒绝把没想清的话脱口而出。',
    accent: '#9C7CFF',
    toneTags: ['慢思考', '高带宽', '像母亲一样的宇宙'],
    defaultAxesVector: { W: -1.2, T: -0.6, F: 0.4, I: 1.2 },
    cardImageUrl: '/images/types/galaxy/home-slow-galaxy.png',
  },
  {
    slug: 'home-drift-glacier',
    code: 'WTFI-DRF',
    name: '漂流冰川',
    headline: '你不是冷，你只是漂在两个海域之间。',
    body: '你心里同时住着两个家，所以谁也不能完全留住你；这是你温柔的形状。',
    accent: '#7AC8E0',
    toneTags: ['温柔漂泊者', '情感游牧', '远方寄信人'],
    defaultAxesVector: { W: 0.6, T: -0.8, F: -0.4, I: 1.8 },
    cardImageUrl: '/images/types/galaxy/home-drift-glacier.png',
  },
  {
    slug: 'home-obsidian-belfry',
    code: 'WTFI-OBS',
    name: '黑曜钟楼',
    headline: 'ta 不响则已，一响就是预言。',
    body: 'ta 的话不多，但每次开口都像敲钟——你没法假装没听见。',
    accent: '#5C4A8A',
    toneTags: ['少话权威', '预言式洞察', '内嵌秩序感'],
    defaultAxesVector: { W: -1.4, T: 1.6, F: 1.2, I: -1.0 },
    cardImageUrl: '/images/types/galaxy/home-obsidian-belfry.png',
  },
  {
    slug: 'home-mars-rose-garden',
    code: 'WTFI-MRS',
    name: '火星玫瑰园',
    headline: '你的爱和怒火本来就是同一个温度。',
    body: '你不擅长冷处理，因为你心里那束火从来没熄过。靠近你的人都得带着护目镜。',
    accent: '#E04E6B',
    toneTags: ['炽热守护者', '爱与战神同体', '不退让的温柔'],
    defaultAxesVector: { W: 2.2, T: 1.4, F: -0.8, I: 0.6 },
    cardImageUrl: '/images/types/galaxy/home-mars-rose-garden.png',
  },
];

export const MOON_PLANET_CATALOG: MoonPlanetEntry[] = [
  {
    slug: 'moon-romance-spring',
    code: 'MOON-ROM-A',
    name: '初春侍神',
    universeId: 'romance',
    headline: '在恋爱里你像一场迟到的春天。',
    body: '你爱得不快，但你能记很久。',
    accent: '#FFB7C5',
    cardImageUrl: '/images/types/galaxy/moon-romance-spring.png',
  },
  {
    slug: 'moon-romance-tide',
    code: 'MOON-ROM-B',
    name: '潮汐侍神',
    universeId: 'romance',
    headline: '在恋爱里你像一段稳定但有起伏的潮。',
    body: '我有节奏，你别误读成距离。',
    accent: '#5A8FFF',
    cardImageUrl: '/images/types/galaxy/moon-romance-tide.png',
  },
  {
    slug: 'moon-work-laser',
    code: 'MOON-WRK-A',
    name: '激光侍神',
    universeId: 'work',
    headline: '在工作里你像一束聚焦到痛的光。',
    body: '别讲故事，告诉我变量。',
    accent: '#3DD6A6',
    cardImageUrl: '/images/types/galaxy/moon-work-laser.png',
  },
  {
    slug: 'moon-work-greenhouse',
    code: 'MOON-WRK-B',
    name: '温室侍神',
    universeId: 'work',
    headline: '在工作里你是那个让团队不窒息的人。',
    body: '我不是没野心，我只是先让大家活着。',
    accent: '#A8D58A',
    cardImageUrl: '/images/types/galaxy/moon-work-greenhouse.png',
  },
  {
    slug: 'moon-late-velvet-radio',
    code: 'MOON-NIT-A',
    name: '丝绒电台侍神',
    universeId: 'late-night',
    headline: '深夜独处时你是个有人收听的电台。',
    body: '半夜的脑子比白天精彩。',
    accent: '#9C7CFF',
    cardImageUrl: '/images/types/galaxy/moon-late-velvet-radio.png',
  },
  {
    slug: 'moon-late-still-water',
    code: 'MOON-NIT-B',
    name: '止水侍神',
    universeId: 'late-night',
    headline: '深夜独处时你比谁都安静。',
    body: '别人脑内开会，我是真的关灯。',
    accent: '#7AA3B0',
    cardImageUrl: '/images/types/galaxy/moon-late-still-water.png',
  },
];

export const SHADOW_PLANET_CATALOG: ShadowPlanetEntry[] = [
  {
    slug: 'shadow-drift-a-nameless-current',
    bucket: 'SHADOW-DRIFT-A',
    name: '无名洋流',
    headline: '你的脑子从不真正下班。',
    body: '凌晨 2 点你的大脑在为别人写剧本。',
    tooltip:
      '在 Default Mode Network 的研究里，这种"高自发联想 + 高画面化"的剖面常出现于高想象力人群。',
    accent: '#FF6FA3',
    cardImageUrl: '/images/types/galaxy/shadow-drift-a-nameless-current.png',
  },
  {
    slug: 'shadow-drift-b-floating-postoffice',
    bucket: 'SHADOW-DRIFT-B',
    name: '漂浮邮局',
    headline: '你白天在场，夜里在飘。',
    body: '我没忘，我只是夜里才回。',
    tooltip: '高延迟回信常与 DMN 高活跃 + 低 IAT 反应速度并存。',
    accent: '#C9B6FF',
    cardImageUrl: '/images/types/galaxy/shadow-drift-b-floating-postoffice.png',
  },
  {
    slug: 'shadow-neutral-midline-lighthouse',
    bucket: 'SHADOW-NEUTRAL',
    name: '中线灯塔',
    headline: '你的潜意识比大多数人安静。',
    body: '我没有特别想说的，也没什么不想说的。',
    tooltip: 'S 轴接近 0 的中位人群往往是关系系统的稳定器。',
    accent: '#B6CFD6',
    cardImageUrl: '/images/types/galaxy/shadow-neutral-midline-lighthouse.png',
  },
  {
    slug: 'shadow-anchor-b-zero-workshop',
    bucket: 'SHADOW-ANCHOR-B',
    name: '归零工坊',
    headline: '一旦没事做，你的大脑会真的休息。',
    body: '我不是麻木，我是真的会下班。',
    tooltip: '低 DMN 自发激活通常对应高执行力 + 低反刍。',
    accent: '#9FB69E',
    cardImageUrl: '/images/types/galaxy/shadow-anchor-b-zero-workshop.png',
  },
  {
    slug: 'shadow-anchor-a-deep-archive',
    bucket: 'SHADOW-ANCHOR-A',
    name: '深井档案室',
    headline: '你的脑子是个有秩序的硬盘。',
    body: '别问我感觉，我先给你版本号。',
    tooltip: '结构化潜意识与高工作记忆容量正相关。',
    accent: '#5C6675',
    cardImageUrl: '/images/types/galaxy/shadow-anchor-a-deep-archive.png',
  },
];

// ───────────────────────── Convenience getters ─────────────────────────

const HOME_BY_SLUG = new Map(HOME_PLANET_CATALOG.map((p) => [p.slug, p]));
const MOON_BY_SLUG = new Map(MOON_PLANET_CATALOG.map((p) => [p.slug, p]));
const SHADOW_BY_BUCKET = new Map(SHADOW_PLANET_CATALOG.map((p) => [p.bucket, p]));

export function getHomePlanet(slug: string): HomePlanetEntry | null {
  return HOME_BY_SLUG.get(slug as HomePlanetSlug) ?? null;
}

export function getMoonPlanet(slug: string): MoonPlanetEntry | null {
  return MOON_BY_SLUG.get(slug) ?? null;
}

export function getShadowPlanet(bucket: ShadowBucket): ShadowPlanetEntry | null {
  return SHADOW_BY_BUCKET.get(bucket) ?? null;
}

export function listHomePlanets(): HomePlanetEntry[] {
  return HOME_PLANET_CATALOG;
}

export function listMoonsByUniverse(universeId: MoonPlanetEntry['universeId']) {
  return MOON_PLANET_CATALOG.filter((m) => m.universeId === universeId);
}
