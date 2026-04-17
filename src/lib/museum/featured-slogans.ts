/**
 * Featured slogans — manually authored "荒诞文学" copy for hand-picked
 * museum cards. Used by the Wave 1 cover hero + drawer copy.
 *
 * Style guide:
 *  - Open with absurd hook ("恭喜您…", "今天的您…")
 *  - 2 short sentences, ≤ 60 chars each
 *  - 您 (formal, comedic), no life advice
 *  - End with a question or open beat (no period)
 *
 * Schema: `${tabId}:${slug}` → { headline, kicker, sloganLong }
 *  - headline: ≤ 16 chars, magazine-cover sized
 *  - kicker: ≤ 24 chars, deck below headline
 *  - sloganLong: 1-2 sentence inside drawer
 *
 * Falls back to gallery item.tagline if a slug is not in this table.
 */

export interface FeaturedCopy {
  headline: string;
  kicker: string;
  sloganLong: string;
}

export const FEATURED_COPY: Record<string, FeaturedCopy> = {
  // ── 本周特辑候选 (Wave 1 hand-picked) ──────────────────────────────
  'wtfti:atm-er': {
    headline: '送钱者 ATM-er',
    kicker: '把心当零钱花的资深玩家',
    sloganLong:
      '恭喜您，今天的您依然在用余额表达爱意。下一笔，是给自己买杯咖啡，还是给 ta 充会员',
  },
  'soulti:moonwalker': {
    headline: '夜行者 Moonwalker',
    kicker: '凌晨三点的精神股东',
    sloganLong:
      '您这一路走来，发现真正的安静不在白天。月亮刚刚私信您，问您有没有空',
  },
  'cpti:plastic': {
    headline: '塑料姐妹 Plastic',
    kicker: '一年合影八次，朋友圈互相取关',
    sloganLong:
      '恭喜您，您的友谊像便利店的塑料袋。结实、便宜、随时备用、却也容易破',
  },
  'flower:peony': {
    headline: '牡丹小姐 Peony',
    kicker: '不取悦不解释不让步',
    sloganLong:
      '今天的您依然占据全场视线。请放心，您不是在抢戏，您本来就是戏',
  },
  'xpti:caretaker': {
    headline: '照顾型 Caretaker',
    kicker: '把对方的胃口背得比自己生日还熟',
    sloganLong:
      '您把"我没事"翻译成八国语言，却没人帮您翻译您的"我有点累"',
  },
  'banti:dior-s': {
    headline: '装满美 Dior-s',
    kicker: '通勤包里 70% 是粉饼',
    sloganLong:
      '恭喜您，您的工位比 ta 的脸还干净。下一份 KPI 是把同事的口红色号都背下来',
  },
  'kings:love-r': {
    headline: '心动绝缘体 Love-r',
    kicker: '把暧昧当 daily mission 的英雄',
    sloganLong:
      '您每天上线就被自动匹配进感情局。胜负不重要，重要的是有没有人来 carry 您',
  },
  'bird:owl': {
    headline: '猫头鹰小姐 Owl',
    kicker: '别人睡的时候才开始活',
    sloganLong:
      '凌晨两点的您，是最清醒的版本。世界关机了，您才刚开机',
  },
  'wtfti:emo': {
    headline: 'emo 怪 Emo',
    kicker: '一首歌就能哭半小时的资深选手',
    sloganLong:
      '恭喜您解锁了"今天又难过了一下"的成就。下一项任务：在朋友圈发个省略号',
  },
  'soulti:keeper': {
    headline: '守心人 Keeper',
    kicker: '把秘密锁在抽屉最里层',
    sloganLong:
      '您把所有人的心事都收下了，却不肯给自己留一个抽屉',
  },
  'cpti:soul': {
    headline: '灵魂搭子 Soul',
    kicker: '聊一句就能脑补一万字',
    sloganLong:
      '您和 ta 之间的频率，连 wifi 信号都羡慕',
  },
  'love:love-bomb': {
    headline: '爱意轰炸机 Love-bomb',
    kicker: '一爱起来就是空袭级',
    sloganLong:
      '今天的您依然把"喜欢"当 emoji 一样高频使用。请爱惜爆点',
  },
};

/**
 * Pool of slugs eligible for "今日精选" rotation. These have hand-written
 * copy in FEATURED_COPY above. Picked deterministically by date.
 */
export const FEATURED_POOL: string[] = Object.keys(FEATURED_COPY);

export function getFeaturedCopy(tabId: string, slug: string): FeaturedCopy | undefined {
  return FEATURED_COPY[`${tabId}:${slug}`];
}
