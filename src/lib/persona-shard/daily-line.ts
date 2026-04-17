/**
 * Persona Shard — Daily line generator.
 *
 * Given a (date, universeId, slug), deterministically pick ONE flavor line
 * from pools indexed by voice × mood.
 *
 * The pools are small & curated; we don't need hundreds of lines per universe
 * since the line rotates daily AND differs per voice/mood, giving each shard
 * a feel of ~90+ effective lines before repetition.
 */

import { hashString, type ShardTraits, type ShardVoice } from './traits';
import type { ShardMood } from './mood';

// ─── Line pools by voice × mood ──────────────────────────────────────────────

type VoiceMoodPools = Record<ShardVoice, Record<ShardMood, string[]>>;

const LINES: VoiceMoodPools = {
  bold: {
    calm: [
      '今天不用证明什么，光已经在你身上。',
      '别人说"稳一点"的时候，你可以直接开始。',
      '不需要共识，你的判断就是判断。',
      '你站着的地方就是中心，不必回头看。',
      '今天允许自己当一次真正的主角。',
      '没有退路这件事，从来是你最喜欢的路况。',
    ],
    spark: [
      '今天的你有点危险——这是好事。',
      '把那个你一直忍着不说的话，说出来。',
      '先冲，再补票。',
      '对，就是现在，不是下周。',
      '那个让你心跳加速的东西在叫你。',
    ],
    shadow: [
      '你不是没力气，你是暂时不想对谁负责。',
      '休息也是你掌控的一部分。',
      '让一切慢下来，你依然是那个人。',
    ],
  },
  warm: {
    calm: [
      '有人正因为你的存在而安心着。',
      '今天把你常给别人的温柔，分一点给自己。',
      '你不必发光，你就是光。',
      '你回应别人的方式，是一种很难得的技能。',
      '允许自己被爱，不欠谁的。',
    ],
    spark: [
      '主动约一个你惦记的人。',
      '说出那句"我想你"，别藏着。',
      '今天会有人因为你笑一下。',
      '把你攒着的好消息讲出来。',
    ],
    shadow: [
      '你也可以什么都不给，只是在那里。',
      '休息吧，世界不会因此松手。',
      '你的沉默也是一种陪伴。',
    ],
  },
  quiet: {
    calm: [
      '今天你观察到的细节，比你以为的多。',
      '话少不是空，是满到不想溢出。',
      '你的安静在别人那里是一种清晰。',
      '独处不是孤独，是在把自己装回来。',
      '留白处，有你真正的回答。',
    ],
    spark: [
      '今天写几句话，只给自己看。',
      '你想了很久的那件事，开始吧。',
      '有个词最近一直回到你耳边——注意它。',
    ],
    shadow: [
      '你不在这里，你只是在更里面。',
      '安静点，深处的你在说话。',
      '今天什么都不用做。',
    ],
  },
  sharp: {
    calm: [
      '他们看不懂你，不是你的问题。',
      '冷不是坏，是节能。',
      '保持你的刻度，不要被稀释。',
      '清醒这件事，从来不便宜。',
      '不解释，就是你最贵的那一层。',
    ],
    spark: [
      '今天可以说一句真话——就一句。',
      '那个让你翻白眼的人，今天不值得你的能量。',
      '把那件早该断的事情断了。',
    ],
    shadow: [
      '你不是冷漠，你只是不再浪费。',
      '今天允许自己谁都不回。',
      '沉默是你今天的答案。',
    ],
  },
  playful: {
    calm: [
      '今天随便来点什么，你都能整出花样。',
      '你是笑话里那个让人反复想起的 punch line。',
      '你最擅长把正经场合变成回忆。',
      '气氛是你带的，BGM是你选的。',
    ],
    spark: [
      '去做那件听起来很蠢但很想做的事。',
      '发那条你改了三遍的朋友圈。',
      '对着镜子笑一下，出门带电。',
    ],
    shadow: [
      '今天不用当气氛组，你也可以当氛围本身。',
      '累了就躺平，小丑也有 off 班的时候。',
    ],
  },
  dreamy: {
    calm: [
      '今天的世界像有一层薄雾，你不必拆穿。',
      '感觉比结论更靠近真相。',
      '你看见的那个画面是真的，别怀疑。',
      '允许自己晃神，那是另一种在场。',
    ],
    spark: [
      '写下那个反复出现在你脑子里的意象。',
      '今天做一件没有理由的事。',
      '追那个让你发呆的人一下。',
    ],
    shadow: [
      '你不是不在，只是在别的频率。',
      '月亮今天替你想事情。',
    ],
  },
};

// ─── Date helpers ────────────────────────────────────────────────────────────

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Main API ────────────────────────────────────────────────────────────────

export interface DailyLineResult {
  line: string;
  index: number;
  pool: string;
}

export function getDailyLine(opts: {
  universeId: string;
  slug: string;
  traits: ShardTraits;
  mood: ShardMood;
  dateKey?: string;
}): DailyLineResult {
  const dateKey = opts.dateKey ?? todayKey();
  const seed = hashString(`${dateKey}|${opts.universeId}|${opts.slug}|${opts.traits.voice}|${opts.mood}`);
  const pool = LINES[opts.traits.voice][opts.mood];
  const index = seed % pool.length;
  return { line: pool[index], index, pool: `${opts.traits.voice}/${opts.mood}` };
}
