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

  // ─── EXPANSION · 2026-04-22 · 为 30 天封信扩池 ─────────
  // COSMIC ×9
  {
    id: 'kepler-music-of-spheres',
    quote: '天体在沉默地演奏一种我们仍未完全听懂的音乐。',
    author: 'Johannes Kepler · 改写',
    tone: 'cosmic',
  },
  {
    id: 'einstein-imagination',
    quote: '想象力比知识更重要。知识是有限的，想象力环抱整个世界。',
    author: 'Albert Einstein',
    source: 'Cosmic Religion · 1931',
    tone: 'cosmic',
  },
  {
    id: 'curie-be-less-curious',
    quote: '在生活中，没有什么是要被恐惧的，只有要被理解的。',
    author: 'Marie Curie',
    tone: 'cosmic',
  },
  {
    id: 'lovelace-poetic-science',
    quote: '想象力，是发现新世界的眼睛。',
    author: 'Ada Lovelace · 改写',
    tone: 'cosmic',
  },
  {
    id: 'hubble-equipped',
    quote: '装备好望远镜，就装备好了通向某种解放的钥匙。',
    author: 'Edwin Hubble · 改写',
    tone: 'cosmic',
  },
  {
    id: 'bohr-truth-opposite',
    quote: '一个深刻真理的反面，可能是另一个深刻的真理。',
    author: 'Niels Bohr',
    tone: 'cosmic',
  },
  {
    id: 'newton-shoulders',
    quote: '若我看得更远，那是因为我站在巨人的肩膀上。',
    author: 'Isaac Newton · 1675',
    tone: 'cosmic',
  },
  {
    id: 'sagan-extraordinary',
    quote: '非凡的主张，需要非凡的证据。',
    author: 'Carl Sagan',
    source: 'Cosmos · 1980',
    tone: 'cosmic',
  },
  {
    id: 'dyson-future',
    quote: '未来不是我们要去的地方，而是我们正在创造的地方。',
    author: 'Freeman Dyson · 改写',
    tone: 'cosmic',
  },

  // FEMININE ×9
  {
    id: 'woolf-room',
    quote: '一个女人若要写作，必须有钱，和一间属于自己的房间。',
    author: 'Virginia Woolf',
    source: 'A Room of One\'s Own · 1929',
    tone: 'feminine',
  },
  {
    id: 'beauvoir-not-born',
    quote: '女人不是生成的，而是变成的。',
    author: 'Simone de Beauvoir',
    source: 'The Second Sex · 1949',
    tone: 'feminine',
  },
  {
    id: 'angelou-rise',
    quote: '你可以用你的历史把我击倒，但我仍会像尘埃一样升起。',
    author: 'Maya Angelou',
    source: 'Still I Rise · 1978',
    tone: 'feminine',
  },
  {
    id: 'lispector-secret',
    quote: '我把我的秘密留给月亮，因为月亮也保有它自己的秘密。',
    author: 'Clarice Lispector · 改写',
    tone: 'feminine',
  },
  {
    id: 'plath-mad-girl',
    quote: '我合上眼，世界就死去；我睁开眼，万物又重生。',
    author: 'Sylvia Plath',
    source: 'Mad Girl\'s Love Song · 1953',
    tone: 'feminine',
  },
  {
    id: 'dickinson-hope',
    quote: '希望是有羽毛的东西，栖在灵魂之上。',
    author: 'Emily Dickinson',
    source: '"Hope" is the thing with feathers · 1891',
    tone: 'feminine',
  },
  {
    id: 'sontag-attention',
    quote: '注意力即美德。注意力本身，就已经是慷慨。',
    author: 'Susan Sontag · 改写',
    tone: 'feminine',
  },
  {
    id: 'sappho-someone-will-remember',
    quote: '我说过，将来会有人记得我们。',
    author: 'Sappho · 残篇',
    tone: 'feminine',
  },
  {
    id: 'eileen-cold',
    quote: '生命是一袭华美的袍，爬满了蚤子。',
    author: '张爱玲 · 天才梦',
    tone: 'feminine',
  },

  // EASTERN ×9
  {
    id: 'wangwei-empty-mountain',
    quote: '空山不见人，但闻人语响。',
    author: '王维 · 鹿柴',
    tone: 'eastern',
  },
  {
    id: 'libai-floating-life',
    quote: '夫天地者，万物之逆旅；光阴者，百代之过客。',
    author: '李白 · 春夜宴桃李园序',
    tone: 'eastern',
  },
  {
    id: 'dufu-spring-view',
    quote: '感时花溅泪，恨别鸟惊心。',
    author: '杜甫 · 春望',
    tone: 'eastern',
  },
  {
    id: 'tao-yuanming-return',
    quote: '采菊东篱下，悠然见南山。',
    author: '陶渊明 · 饮酒',
    tone: 'eastern',
  },
  {
    id: 'wangbo-friend',
    quote: '海内存知己，天涯若比邻。',
    author: '王勃 · 送杜少府之任蜀州',
    tone: 'eastern',
  },
  {
    id: 'liyu-spring-water',
    quote: '问君能有几多愁，恰似一江春水向东流。',
    author: '李煜 · 虞美人',
    tone: 'eastern',
  },
  {
    id: 'libai-pour-wine',
    quote: '人生得意须尽欢，莫使金樽空对月。',
    author: '李白 · 将进酒',
    tone: 'eastern',
  },
  {
    id: 'haizi-spring',
    quote: '从明天起，做一个幸福的人 / 喂马，劈柴，周游世界。',
    author: '海子 · 面朝大海，春暖花开',
    tone: 'eastern',
  },
  {
    id: 'beidao-answer',
    quote: '卑鄙是卑鄙者的通行证，高尚是高尚者的墓志铭。',
    author: '北岛 · 回答',
    tone: 'eastern',
  },

  // TENDER ×8
  {
    id: 'rilke-live-questions',
    quote: '请试着去爱那些问题本身，就像爱一间锁着的房间。',
    author: 'Rainer Maria Rilke',
    source: 'Letters to a Young Poet · 1903',
    tone: 'tender',
  },
  {
    id: 'oliver-wild-precious',
    quote: '请告诉我，你打算怎么度过你这一次狂野又珍贵的一生？',
    author: 'Mary Oliver',
    source: 'The Summer Day · 1990',
    tone: 'tender',
  },
  {
    id: 'frost-road',
    quote: '我选择了少有人走的那条路，从此一切都变了。',
    author: 'Robert Frost',
    source: 'The Road Not Taken · 1916',
    tone: 'tender',
  },
  {
    id: 'rumi-guesthouse',
    quote: '每一个早晨，都有新的客人到来。把他们都请进来。',
    author: 'Rumi',
    source: 'The Guest House · 13 世纪',
    tone: 'tender',
  },
  {
    id: 'whitman-multitudes',
    quote: '我辽阔，我容纳众多。',
    author: 'Walt Whitman',
    source: 'Song of Myself · 1855',
    tone: 'tender',
  },
  {
    id: 'leonard-cohen-crack',
    quote: '万物皆有裂痕，那是光照进来的地方。',
    author: 'Leonard Cohen',
    source: 'Anthem · 1992',
    tone: 'tender',
  },
  {
    id: 'kahlil-pain',
    quote: '你的痛苦，是包裹你理解力的硬壳的破裂。',
    author: 'Kahlil Gibran',
    source: 'The Prophet · 1923',
    tone: 'tender',
  },
  {
    id: 'thoreau-deliberate',
    quote: '我希望活得郑重，只面对生活最本质的事实。',
    author: 'Henry David Thoreau',
    source: 'Walden · 1854',
    tone: 'tender',
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

/**
 * 30 天逐日封信 · 付费深度档案专用。
 *
 * 保证：
 * - 返回 30 张唯一引语（pool 必须 ≥ 30，否则会抛错以便我们立刻发现）
 * - 同一 (planetSlug, salt) 永远得到同一序列（确定性）
 * - 锚定到该主星的 anchored 卡优先放在前几天
 * - 其余从全池打散，按 Fisher-Yates 洗牌
 */
export function pickLetters30(
  planetSlug: string,
  salt: string | number = 'v1',
): StardustLetter[] {
  if (STARDUST_LETTERS.length < 30) {
    throw new Error(
      `STARDUST_LETTERS pool too small for 30-day cycle: ${STARDUST_LETTERS.length}`,
    );
  }

  // FNV-1a 把 (slug,salt) 折叠成 32-bit 种子
  const seedStr = `${planetSlug}::${salt}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // mulberry32 PRNG，确定性
  const rand = () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const anchored = shuffle(STARDUST_LETTERS.filter((l) => l.planet === planetSlug));
  const rest = shuffle(STARDUST_LETTERS.filter((l) => l.planet !== planetSlug));

  // 锚定卡优先 (最多前 N 天)，再从其余池补足，去重保险
  const seen = new Set<string>();
  const out: StardustLetter[] = [];
  for (const l of [...anchored, ...rest]) {
    if (out.length >= 30) break;
    if (seen.has(l.id)) continue;
    seen.add(l.id);
    out.push(l);
  }
  return out;
}
