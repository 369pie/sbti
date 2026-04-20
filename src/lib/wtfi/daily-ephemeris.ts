/**
 * Daily Ephemeris · 每日天象签
 *
 * 由 docs/01-strategy/wtfti-cosmic-romance-narrative-2026-04-19.md §4 定义。
 *
 * 用途：
 * - 用户每日打开 → 一张卡：天象事件 + 对应主星颂词 + 一句 Stardust Letter
 * - 7 日内召回（不接 push 渠道，纯 in-app）
 * - 完全确定性：seed = (year * 366 + dayOfYear)，同一天打开同一张
 *
 * 数据池：60 个事件起步（覆盖一年里典型天象 + 通用情绪锚点），
 * 与 8 主星 + 35 stardust 自由组合 → ~14000 种组合，足够 12 周不重复体感。
 */

import {
  HOME_PLANET_CATALOG,
  type HomePlanetEntry,
} from './galaxy-planets';
import {
  CONSTELLATION_ANCHORS,
  type ConstellationAnchor,
} from './constellation-anchors';
import { STARDUST_LETTERS, type StardustLetter, type LetterTone } from './stardust-letters';

export interface EphemerisEvent {
  id: string;
  /** 事件标题（一行 8-14 字） */
  title: string;
  /** 一句话叙述（30-50 字） */
  narration: string;
  /** 推荐配的 stardust tone（用作抽签优先选项） */
  preferredTone: LetterTone;
}

/**
 * 60 条天象事件池
 * 命名约定：
 * - real-* 是真实可查的天象（流星雨、合相、近日点等）
 * - mood-* 是普适情绪锚点（满月、上弦、弦月、节气等）
 * - poetic-* 是文学化的虚构天象（"今夜有人替你许愿"）
 */
export const EPHEMERIS_POOL: EphemerisEvent[] = [
  // 真实天象 (20)
  { id: 'real-quadrantids', title: '象限仪流星雨极大', narration: '北半球第一场流星雨，凌晨向北看，每小时约 60 颗。', preferredTone: 'cosmic' },
  { id: 'real-perihelion', title: '地球到达近日点', narration: '今天我们离太阳最近，但北半球依然冷——爱不靠距离，靠角度。', preferredTone: 'cosmic' },
  { id: 'real-venus-evening', title: '金星西大距', narration: '金星今晚在日落后最亮，去西边看，那是夜里的开场白。', preferredTone: 'feminine' },
  { id: 'real-mars-opposition', title: '火星冲日', narration: '火星正对太阳，今夜整夜可见——你心里那束火也别藏。', preferredTone: 'feminine' },
  { id: 'real-jupiter-saturn', title: '木星合土星', narration: '宇宙最重的两颗星走到了一起，提醒我们：稳定的关系也需要轨道。', preferredTone: 'tender' },
  { id: 'real-sirius-rise', title: '天狼星偕日升', narration: '古埃及的尼罗河泛滥之兆，新的丰年从一颗最亮的星开始。', preferredTone: 'eastern' },
  { id: 'real-vega-zenith', title: '织女星过中天', narration: '织女今夜在你头顶——那个没回的人，今晚也在抬头。', preferredTone: 'eastern' },
  { id: 'real-perseids', title: '英仙座流星雨', narration: '夏夜最盛大的一场，每小时百颗，许愿不要犹豫。', preferredTone: 'tender' },
  { id: 'real-orionids', title: '猎户座流星雨', narration: '哈雷彗星留下的尘埃在燃烧，你也曾被谁点过一次。', preferredTone: 'cosmic' },
  { id: 'real-leonids', title: '狮子座流星雨', narration: '33 年才一次的大爆发周期，错过了就再等一轮。', preferredTone: 'cosmic' },
  { id: 'real-geminids', title: '双子座流星雨', narration: '冬夜最亮的流星雨，火球级流星较多，整夜可见。', preferredTone: 'cosmic' },
  { id: 'real-mercury-retrograde', title: '水星逆行开始', narration: '占星说：旧人会回来。科学说：视运动的错觉。两个都对。', preferredTone: 'feminine' },
  { id: 'real-mercury-direct', title: '水星顺行恢复', narration: '通讯回到正常轨道——那条没发出去的消息，可以发了。', preferredTone: 'tender' },
  { id: 'real-supermoon', title: '超级月亮', narration: '月亮今晚比平时大 14%，潮汐和心情都会涨一格。', preferredTone: 'feminine' },
  { id: 'real-blue-moon', title: '蓝月之夜', narration: '一个月里的第二个满月，罕见——值得为它失眠一次。', preferredTone: 'feminine' },
  { id: 'real-blood-moon', title: '月全食 · 血月', narration: '地球的影子盖住月亮，红色不来自血，来自所有日落。', preferredTone: 'cosmic' },
  { id: 'real-equinox-spring', title: '春分 · 昼夜均分', narration: '世界两端都站直了——你也允许自己今天不偏向任何人。', preferredTone: 'eastern' },
  { id: 'real-equinox-autumn', title: '秋分 · 昼夜均分', narration: '黑夜从今天起开始多一点，给情绪一点合法的空间。', preferredTone: 'eastern' },
  { id: 'real-solstice-summer', title: '夏至 · 至阳之日', narration: '一年里太阳走得最远的一天，向上看，所有阴影都最短。', preferredTone: 'eastern' },
  { id: 'real-solstice-winter', title: '冬至 · 至阴之日', narration: '从今天起白昼一日长一线，世界正在从最深的夜里走出来。', preferredTone: 'eastern' },

  // 月相情绪锚点 (16)
  { id: 'mood-new-moon', title: '新月 · 重启信号', narration: '月亮今夜不见，正适合写下你不打算让任何人看的愿望。', preferredTone: 'feminine' },
  { id: 'mood-waxing-crescent', title: '蛾眉月 · 一线生机', narration: '上弦前的细钩月，提醒你——已经开始了，只是还没显出来。', preferredTone: 'tender' },
  { id: 'mood-first-quarter', title: '上弦月 · 抉择时刻', narration: '半亮半暗的对称提醒你：每一次选择都是放弃另一半。', preferredTone: 'eastern' },
  { id: 'mood-waxing-gibbous', title: '盈凸月 · 蓄势', narration: '月亮正在变满，事情也在变大——再等几天再做决定。', preferredTone: 'tender' },
  { id: 'mood-full-moon', title: '满月 · 显化之夜', narration: '月亮对着你 100% 反射太阳——那个想了很久的人也许今夜就出现。', preferredTone: 'feminine' },
  { id: 'mood-waning-gibbous', title: '亏凸月 · 缓慢释放', narration: '不必赶，宇宙也在让自己慢慢瘦下来。', preferredTone: 'tender' },
  { id: 'mood-last-quarter', title: '下弦月 · 复盘时刻', narration: '半月后退入下半场，回头看——你已经走得比想象远。', preferredTone: 'eastern' },
  { id: 'mood-waning-crescent', title: '残月 · 最后一缕光', narration: '夜里最后一点月光，留给那些你还没原谅自己的事。', preferredTone: 'feminine' },
  { id: 'mood-eclipse-portal', title: '日食通道开启', narration: '神秘学说这是命运的转轨口；天文学说只是太阳被挡了一下。', preferredTone: 'cosmic' },
  { id: 'mood-aurora-active', title: '极光活跃期', narration: '太阳风今夜推到了高纬度——别在窗边错过你的极光时刻。', preferredTone: 'cosmic' },
  { id: 'mood-galactic-center', title: '银河中心升起', narration: '夏夜南方那道发光的带子，正是我们所属的家园核心。', preferredTone: 'cosmic' },
  { id: 'mood-summer-triangle', title: '夏季大三角点亮', narration: '织女、牛郎、天津四在你头顶组成三角——属于夏夜的导航。', preferredTone: 'eastern' },
  { id: 'mood-winter-hexagon', title: '冬季大六边形', narration: '六颗冬夜亮星组成的六边形提醒你：寒冷的季节也有秩序。', preferredTone: 'tender' },
  { id: 'mood-zodiacal-light', title: '黄道光显现', narration: '日落后的黄道带泛着微光——是太阳系尘埃在替你站岗。', preferredTone: 'cosmic' },
  { id: 'mood-noctilucent', title: '夜光云高悬', narration: '中纬度夏夜偶现的银蓝色云——大气最高处也有它的浪漫。', preferredTone: 'feminine' },
  { id: 'mood-iss-overhead', title: '空间站今夜过境', narration: '6 个人正在 408 公里高空看你——你不是一个人在这一夜。', preferredTone: 'tender' },

  // 文学化锚点 (24)
  { id: 'poetic-someone-misses', title: '今夜有人想起你', narration: '统计学保证至少一个——只是 ta 没说出口。', preferredTone: 'tender' },
  { id: 'poetic-letter-arrives', title: '一封迟到的信', narration: '不是真信，是你今天会突然想起的那句话——它就是。', preferredTone: 'feminine' },
  { id: 'poetic-second-chance', title: '宇宙发了第二张牌', narration: '同一件事换一个角度发生第二次——这次别再错过。', preferredTone: 'tender' },
  { id: 'poetic-quiet-permit', title: '允许安静日', narration: '今天你不必回任何消息，也不会失去谁。', preferredTone: 'feminine' },
  { id: 'poetic-mirror-day', title: '镜面日', narration: '今天遇见的人都在反射你——温柔点对自己。', preferredTone: 'feminine' },
  { id: 'poetic-soft-rebellion', title: '柔软叛逆日', narration: '不大声、不破坏、但绝不答应那件你其实不想做的事。', preferredTone: 'feminine' },
  { id: 'poetic-tea-with-self', title: '与自己共饮', narration: '泡一杯热的，对自己说一句白天不会说出口的话。', preferredTone: 'eastern' },
  { id: 'poetic-old-song', title: '一首旧歌找你', narration: '今天会随机听到一首三年前的歌——那是它来报到。', preferredTone: 'tender' },
  { id: 'poetic-cosmic-mail', title: '宇宙寄信日', narration: '把那条想发又删掉的消息发出去——回不回是 ta 的事。', preferredTone: 'feminine' },
  { id: 'poetic-permission-rest', title: '休息许可日', narration: '不需要理由，今天可以累，可以不主动。', preferredTone: 'tender' },
  { id: 'poetic-candle-keep', title: '替谁守灯', narration: '今晚你的存在本身，就是某人精神世界里的一盏不灭灯。', preferredTone: 'tender' },
  { id: 'poetic-galaxy-collide', title: '星系微擦', narration: '今天遇见的某个陌生人，可能是你余生的引力来源。', preferredTone: 'cosmic' },
  { id: 'poetic-time-fold', title: '时间打了个褶', narration: '今天会出现"似曾相识"的瞬间——不是错觉，是回响。', preferredTone: 'cosmic' },
  { id: 'poetic-half-truth', title: '半透明日', narration: '今天你会被一个人看见你藏起来的那一半。', preferredTone: 'feminine' },
  { id: 'poetic-no-armor', title: '卸甲日', narration: '允许自己今天没有"应该"的样子，原貌出门一次。', preferredTone: 'feminine' },
  { id: 'poetic-future-self', title: '未来的你寄信', narration: '今天的某个直觉，是十年后的你逆行寄回来的。', preferredTone: 'cosmic' },
  { id: 'poetic-quiet-gravity', title: '低声引力日', narration: '不必说什么，你只需要在场，引力就完成了它的工作。', preferredTone: 'tender' },
  { id: 'poetic-deep-listen', title: '深听日', narration: '今天注意听你身体而不是脑子说的话——它更老实。', preferredTone: 'feminine' },
  { id: 'poetic-warm-error', title: '温柔出错日', narration: '今天允许做一个不完美的决定，这是给未来的礼物。', preferredTone: 'tender' },
  { id: 'poetic-write-letter', title: '写一封不寄的信', narration: '想象那个人就在桌对面，写一封不会发出的信——你会哭一点。', preferredTone: 'eastern' },
  { id: 'poetic-night-radio', title: '深夜电台日', narration: '今晚 23:00 后的脑子比白天更靠近真相。', preferredTone: 'feminine' },
  { id: 'poetic-anchor-day', title: '锚点日', narration: '今天的你会被某人当成 ta 的"今天还好的理由"。', preferredTone: 'tender' },
  { id: 'poetic-soft-victory', title: '微小胜利日', narration: '允许把"按时吃饭""睡够 7 小时"也当作正经胜利。', preferredTone: 'tender' },
  { id: 'poetic-stardust-pickup', title: '星尘拾取日', narration: '今天捡到的小物——叶子、票根、收据——都不是偶然。', preferredTone: 'feminine' },
];

export interface DailyEphemeris {
  date: string; // YYYY-MM-DD
  event: EphemerisEvent;
  homePlanet: HomePlanetEntry;
  constellation: ConstellationAnchor;
  stardust: StardustLetter;
}

/**
 * 计算给定日期的 ephemeris。
 *
 * @param planetSlug 用户的主星 slug（决定该用户每天看到的"本星视角"）
 * @param date 默认 today（UTC date stable）
 */
export function getDailyEphemeris(
  planetSlug: string,
  date: Date = new Date(),
): DailyEphemeris | null {
  const planet = HOME_PLANET_CATALOG.find((p) => p.slug === planetSlug);
  if (!planet) return null;
  const anchor = CONSTELLATION_ANCHORS[planet.slug];

  const dayOfYear = getDayOfYear(date);
  const year = date.getUTCFullYear();
  const seed = year * 366 + dayOfYear;

  const event = EPHEMERIS_POOL[seed % EPHEMERIS_POOL.length];

  // 优先抽与 event.preferredTone 同 tone 的 stardust，落空时回退全库
  const tonedPool = STARDUST_LETTERS.filter((l) => l.tone === event.preferredTone);
  const pool = tonedPool.length > 0 ? tonedPool : STARDUST_LETTERS;
  const stardust = pool[(seed * 11) % pool.length];

  return {
    date: toIsoDate(date),
    event,
    homePlanet: planet,
    constellation: anchor,
    stardust,
  };
}

function getDayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((now - start) / 86_400_000);
}

function toIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
