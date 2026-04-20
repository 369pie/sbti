/**
 * Stardust Letters · 35 张文学/科学语录卡库
 *
 * 由 docs/01-strategy/wtfti-cosmic-romance-narrative-2026-04-19.md §6 定义。
 * 用途：
 * 1) 嵌入主星卡 <details> "本星笔记"
 * 2) 嵌入 Daily Ephemeris 推送
 * 3) 用户长按主星 → 弹出 3 张引语卡轮播 → 选一张发圈
 *
 * 标签维度：
 * - tone: cosmic | feminine | eastern | tender
 * - planet: 可选锚定到某 home planet（不绑定 = 通用卡）
 *
 * 永远确定性，不接 LLM；新卡走 PR 评审入库。
 */

export type LetterTone = 'cosmic' | 'feminine' | 'eastern' | 'tender';

export interface StardustLetter {
  id: string;
  quote: string;
  /** 中文译/转写（英文原句保留在 quote） */
  translation?: string;
  author: string;
  /** 出处年份或文献（小字脚注） */
  source?: string;
  tone: LetterTone;
  /** 可选：与某主星 slug 绑定 */
  planet?: string;
}

export const STARDUST_LETTERS: StardustLetter[] = [
  // ─── COSMIC · 高级感 / 科学性 ──────────────────────────
  {
    id: 'sagan-stardust',
    quote: 'We are made of star-stuff. The cosmos is also within us.',
    translation: '我们由星尘构成。宇宙也在我们之内。',
    author: 'Carl Sagan',
    source: 'Cosmos · 1980',
    tone: 'cosmic',
  },
  {
    id: 'calvino-cosmicomics',
    quote: '在那一刻，我们都是同一颗原子。',
    author: 'Italo Calvino',
    source: 'Cosmicomics · 1965',
    tone: 'cosmic',
  },
  {
    id: 'hawking-no-boundary',
    quote: '宇宙没有边界，正如生活没有彩排。',
    author: 'Stephen Hawking · 改写',
    tone: 'cosmic',
  },
  {
    id: 'lemaitre-day-without-yesterday',
    quote: '万物起源于一个没有昨天的日子。',
    author: 'Georges Lemaître',
    source: 'Primeval Atom · 1931',
    tone: 'cosmic',
  },
  {
    id: 'einstein-deepest-thing',
    quote: '宇宙最难以理解的事，是它居然可以被理解。',
    author: 'Albert Einstein',
    tone: 'cosmic',
  },
  {
    id: 'sagan-pale-blue-dot',
    quote: '我们这颗星球只是悬浮在阳光里的一粒微尘。',
    author: 'Carl Sagan',
    source: 'Pale Blue Dot · 1994',
    tone: 'cosmic',
  },
  {
    id: 'feynman-atoms',
    quote: '我们是宇宙在思考它自己的方式。',
    author: 'Richard Feynman · 改写',
    tone: 'cosmic',
  },
  {
    id: 'tyson-known-universe',
    quote: '我们不是渺小，我们是稀有。',
    author: 'Neil deGrasse Tyson · 改写',
    tone: 'cosmic',
  },

  // ─── FEMININE · 女性性 / 神秘性 ─────────────────────────
  {
    id: 'plath-i-am-vertical',
    quote: 'I would rather be horizontal — close to the things growing in the dark.',
    translation: '我宁愿是水平的 — 紧挨着那些在黑暗里生长的事物。',
    author: 'Sylvia Plath',
    source: 'I Am Vertical · 1961',
    tone: 'feminine',
  },
  {
    id: 'nin-bloom',
    quote: '直到那一天，紧闭的花蕾比绽放更痛苦。',
    author: 'Anaïs Nin',
    source: 'Risk · 1959',
    tone: 'feminine',
  },
  {
    id: 'eileen-half-moon',
    quote: '我看见的月亮都是亿万年前的事，我等的人只是迟到了一会儿。',
    author: '张爱玲 · 改写',
    tone: 'feminine',
  },
  {
    id: 'yangjiang-quiet',
    quote: '我曾如此期盼外界的认可，到最后才知道：世界是自己的，与他人毫无关系。',
    author: '杨绛 · 一百岁感言',
    tone: 'feminine',
  },
  {
    id: 'plath-fig-tree',
    quote: '生活像一棵巨大的无花果树 — 每一颗果实都是一种我没选的人生。',
    author: 'Sylvia Plath · The Bell Jar · 改写',
    tone: 'feminine',
  },
  {
    id: 'nin-courage',
    quote: '生命随我们的勇气大小而扩张或收缩。',
    author: 'Anaïs Nin',
    source: 'The Diary · 1969',
    tone: 'feminine',
  },
  {
    id: 'eileen-low-dust',
    quote: '见了他，她变得很低很低，低到尘埃里，但她心里是欢喜的。',
    author: '张爱玲 · 关于胡兰成',
    tone: 'feminine',
  },
  {
    id: 'sappho-evening-star',
    quote: '黄昏星，你让一切回家 — 让羊回家，让小孩回家，让少女回到母亲身边。',
    author: 'Sappho · 残篇',
    tone: 'feminine',
  },

  // ─── EASTERN · 东方性 / 永恒感 ──────────────────────────
  {
    id: 'libai-night-thoughts',
    quote: '床前明月光，疑是地上霜。',
    author: '李白 · 静夜思',
    tone: 'eastern',
  },
  {
    id: 'libai-altair',
    quote: '我寄愁心与明月，随风直到夜郎西。',
    author: '李白 · 闻王昌龄左迁龙标',
    tone: 'eastern',
    planet: 'home-drift-glacier',
  },
  {
    id: 'sushi-shuidiao',
    quote: '人有悲欢离合，月有阴晴圆缺，此事古难全。',
    author: '苏轼 · 水调歌头',
    tone: 'eastern',
  },
  {
    id: 'gucheng-distance',
    quote: '黑夜给了我黑色的眼睛，我却用它寻找光明。',
    author: '顾城 · 一代人',
    tone: 'eastern',
  },
  {
    id: 'yuguang-when-i-die',
    quote: '蓝墨水的上游，是黄河；黄河的上游，是星河。',
    author: '余光中 · 当我死时',
    tone: 'eastern',
    planet: 'home-gilded-loom',
  },
  {
    id: 'zhengchouyue-error',
    quote: '我达达的马蹄是美丽的错误，我不是归人，是个过客。',
    author: '郑愁予 · 错误',
    tone: 'eastern',
    planet: 'home-storm-harbor',
  },
  {
    id: 'muxin-childhood',
    quote: '从前的日色变得慢，车，马，邮件都慢，一生只够爱一个人。',
    author: '木心 · 从前慢',
    tone: 'eastern',
  },
  {
    id: 'sushi-moon-cycle',
    quote: '但愿人长久，千里共婵娟。',
    author: '苏轼 · 水调歌头',
    tone: 'eastern',
  },

  // ─── TENDER · 温柔治愈 ─────────────────────────────────
  {
    id: 'rilke-questions',
    quote: '请耐心对待你心中所有未解之问 —— 答案会自己长出来。',
    author: 'Rainer Maria Rilke',
    source: 'Letters to a Young Poet · 1903',
    tone: 'tender',
  },
  {
    id: 'petit-prince-tame',
    quote: '正是因为我们彼此驯服，你才对我而言独一无二。',
    author: 'Antoine de Saint-Exupéry',
    source: 'Le Petit Prince · 1943',
    tone: 'tender',
  },
  {
    id: 'petit-prince-essential',
    quote: '真正重要的事物，眼睛是看不见的。',
    author: 'Antoine de Saint-Exupéry',
    source: 'Le Petit Prince · 1943',
    tone: 'tender',
  },
  {
    id: 'rilke-intimate',
    quote: '所有真正的相遇，都是带着一点惊讶发生的。',
    author: 'Rainer Maria Rilke · 改写',
    tone: 'tender',
  },
  {
    id: 'muxin-poem',
    quote: '岁月不饶人，我亦未曾饶过岁月。',
    author: '木心 · 文学回忆录',
    tone: 'tender',
  },
  {
    id: 'rumi-wound',
    quote: '伤口是光进入你的地方。',
    author: 'Rumi · 改写',
    tone: 'tender',
  },
  {
    id: 'kahlil-children',
    quote: '你的孩子并不是你的孩子，他们是生命对自身的渴望。',
    author: 'Kahlil Gibran',
    source: 'The Prophet · 1923',
    tone: 'tender',
  },
  {
    id: 'oliver-wild-soft',
    quote: '只需让你身体里那一只柔软的动物，去爱它所爱。',
    author: 'Mary Oliver',
    source: 'Wild Geese · 1986',
    tone: 'tender',
  },
  {
    id: 'stein-rose',
    quote: 'Rose is a rose is a rose is a rose.',
    translation: '玫瑰是玫瑰是玫瑰是玫瑰。',
    author: 'Gertrude Stein',
    source: 'Sacred Emily · 1913',
    tone: 'tender',
    planet: 'home-mars-rose-garden',
  },
  {
    id: 'lu-xun-walk',
    quote: '其实地上本没有路，走的人多了，也便成了路。',
    author: '鲁迅 · 故乡',
    tone: 'tender',
    planet: 'home-obsidian-belfry',
  },
  {
    id: 'hemingway-broken',
    quote: '我们生而破碎，用活着来修修补补。',
    author: 'Hemingway · 改写',
    tone: 'tender',
    planet: 'home-aurora-parlour',
  },
];

/**
 * 按 home planet 抽 3 张（1 张锚定 + 2 张通用），用于结果页"本星笔记"轮播。
 * 抽签是确定性的：用 slug + dayOfYear 作种子，避免每次刷新重抽。
 */
export function pickLettersForPlanet(
  planetSlug: string,
  seed: number = new Date().getUTCDate(),
): StardustLetter[] {
  const anchored = STARDUST_LETTERS.filter((l) => l.planet === planetSlug);
  const generic = STARDUST_LETTERS.filter((l) => !l.planet);

  const pickFromGeneric = (n: number): StardustLetter[] => {
    const out: StardustLetter[] = [];
    for (let i = 0; i < n; i += 1) {
      const idx = (seed * 7 + i * 13) % generic.length;
      out.push(generic[idx]);
    }
    return out;
  };

  if (anchored.length >= 1) {
    return [anchored[0], ...pickFromGeneric(2)];
  }
  return pickFromGeneric(3);
}

/** 按 tone 维度抽一张（Daily Ephemeris 用） */
export function pickLetterByTone(tone: LetterTone, seed = Date.now()): StardustLetter {
  const pool = STARDUST_LETTERS.filter((l) => l.tone === tone);
  return pool[seed % pool.length];
}
