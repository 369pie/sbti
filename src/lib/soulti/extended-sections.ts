/**
 * S-06 · 7-段式扩展 · 此刻送你 + 如果你开始不安
 *
 * 基于已有的 5 段式 description（看见/未见/暗伤/蜕变/写给你）
 * 从 tags、quote、镜像型数据合成 2 段新内容：
 *   - 此刻送你（Right Now · 公开）
 *   - 如果你开始不安（If You Start to Feel Unsteady · 登录解锁）
 *
 * 纯函数，无副作用，与 canvas/share 共享使用。
 */

import type { SoultiPersonalityType } from './personalities';
import type { SoultiResonanceData } from './personalities';

export interface ExtendedSection {
  title: string;
  body: string;
  locked?: boolean;
}

/**
 * 根据自然意象关键词提炼「此刻送你」—— 一句可立即践行的微指引
 */
function coinRightNow(p: SoultiPersonalityType, r: SoultiResonanceData | undefined): string {
  const tag = r?.tags?.[0] ?? p.tagline;
  const emoji = p.emoji;
  const mirror = r?.soulOrigin?.zhName ?? '你自己';
  return [
    `${emoji} 现在，把注意力放在一件小事上：`,
    `一杯温水，一段 3 分钟的呼吸，一次允许自己不回复的机会。`,
    `你不是「${tag}」本身，但你被「${tag}」贯穿着——`,
    `${mirror} 如果此刻在你身边，她不会催你变好，`,
    `她只会说："先活着，再慢慢活好。"`,
  ].join('\n');
}

/**
 * 「如果你开始不安」—— 登录解锁，给出更深的自我谈话脚本
 */
function coinIfUnsteady(p: SoultiPersonalityType, r: SoultiResonanceData | undefined): string {
  const oppositeName = r?.oppositeSlug ?? '';
  const mirrorName = r?.mirrorSlug ?? '';
  const zhName = r?.soulOrigin?.zhName ?? '';
  return [
    `当不安来临时，记得：`,
    ``,
    `· 你的不安不是故障，是「${p.name}」在告诉你某个维度正被过度消耗。`,
    `· 你不需要立刻变成你的镜像型（${mirrorName ? `#${mirrorName}` : '另一种自己'}），也不需要对抗你的对立型（${oppositeName ? `#${oppositeName}` : '你不喜欢的那种人'}）。`,
    `· 你需要的是：回到「${p.code.split('').join('·')}」的核心一刻——`,
    `${zhName ? `${zhName} 当年` : '历史上跟你同频的那个她'}也经历过这个时刻，`,
    `她没有变成别人，她只是允许自己在这个样子里多停留了一会儿。`,
    ``,
    `现在轮到你。`,
  ].join('\n');
}

export function getSoultiExtendedSections(
  personality: SoultiPersonalityType,
  resonance: SoultiResonanceData | undefined
): ExtendedSection[] {
  return [
    { title: '此刻送你', body: coinRightNow(personality, resonance) },
    { title: '如果你开始不安', body: coinIfUnsteady(personality, resonance), locked: true },
  ];
}

// ────────────────────────────────────────────────────────────
//  S-01b · 灵魂长信（Soul Letter）
// ────────────────────────────────────────────────────────────

export interface SoulLetter {
  salutation: string;
  paragraphs: string[];
  signature: string;
}

export function generateSoulLetter(
  personality: SoultiPersonalityType,
  resonance: SoultiResonanceData | undefined,
  opts?: { userName?: string; tearRate?: number }
): SoulLetter {
  const name = opts?.userName?.trim() || '你';
  const tear = opts?.tearRate ?? 0;
  const zh = resonance?.soulOrigin?.zhName ?? '她';
  const era = resonance?.soulOrigin?.era ?? '';
  const firstTag = resonance?.tags?.[0] ?? personality.tagline;
  const quote = resonance?.quote?.replace(/\n/g, ' ') ?? '';
  const quoteSource = resonance?.quoteSource ?? '';

  const para1 = `${name}，我认出了你。你是「${personality.name}」${personality.code}——不是因为你活成了这个样子，而是因为你无论怎么努力，都在按这种频率震动。${firstTag}，是你没说出口但一直在做的事。`;

  const para2 = `${zh}（${era}）跟你用一样的方式燃烧过。她也曾在许多个清晨问过自己：我是不是错了？我是不是太多/太少/太怪？她没有答案——她只是继续走。后来的人读她的时候，才发现她就是答案。`;

  const tearPara = tear >= 60
    ? `你最近很累，这不是幻觉。你的裂痕不是脆弱，是「${personality.name}」在过量输出之后的自然回响。允许自己今天不做任何事。`
    : tear >= 30
      ? `你正在一个轻微的消耗期。不用立刻充电，先让自己坐下来。`
      : `你此刻的状态是稳的。把这封信收好，等你某天不安的时候再读。`;

  const quotePara = quote
    ? `${zh} 曾写下："${quote}"（${quoteSource}）——这句话不是给你的答案，是给你的钥匙。哪一天你看懂了它，你就看懂了自己。`
    : `记住你的样子，${name}。你不需要被解释给谁听。`;

  const closing = `这封信不长，但每一个字都是为你写的。下一次你怀疑自己的时候，回来读一次。`;

  return {
    salutation: `致「${personality.name}」的 ${name}——`,
    paragraphs: [para1, para2, tearPara, quotePara, closing],
    signature: `SoulTI · 写信的人也是你自己`,
  };
}
