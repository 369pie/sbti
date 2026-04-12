import type { AnswerOption } from './questions';

/**
 * 修仙 2.0 题库草案
 *
 * 目标：
 * 1. 不改原有 30 题维度映射和计分逻辑
 * 2. 强化女性向的情绪/关系/社交场景
 * 3. 用仙门语言包装当代自嘲和关系瞬间
 *
 * 注意：当前文件是草案，尚未接入正式测试流程。
 */

export interface XiuxianQuestionSkinV2 {
  id: number;
  text: string;
  options?: AnswerOption[];
}

export const XIUXIAN_V2_DEFAULT_OPTIONS: AnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '说不好', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const XIUXIAN_V2_QUESTION_SKINS: Record<number, XiuxianQuestionSkinV2> = {
  // ══════════════════════════════════════
  // 心境 · Self
  // ══════════════════════════════════════

  1: {
    id: 1,
    text: '宗门群里在夸别人渡劫成功，你却还在后山给灵宠铲屎。此刻你更像？',
    options: [
      { value: 3, label: '心态炸了，我果然是修仙界背景板。', key: 'A' },
      { value: 2, label: '有点酸，但又安慰自己每个人命盘不一样。', key: 'B' },
      { value: 1, label: '这有啥，我的节奏本来就不跟他们对表。', key: 'C' },
    ],
  },
  2: {
    id: 2,
    text: '坊市里有人阴阳你「就你这点修为，还挺敢说」——你内心更接近？',
    options: [
      { value: 1, label: '当场嘴硬，回洞府后反复复盘一晚上。', key: 'A' },
      { value: 2, label: '看是谁说的，杂鱼的话我懒得全信。', key: 'B' },
      { value: 3, label: '哦，说完了？说完我继续忙了。', key: 'C' },
    ],
  },

  3: {
    id: 3,
    text: '如果一定要你说清楚自己修的是什么道，你现在的状态更像？',
    options: [
      { value: 1, label: '别问，问就是我连自己在修什么都还没整明白。', key: 'A' },
      { value: 2, label: '大概有个方向，但还没准到能说服别人。', key: 'B' },
      { value: 3, label: '很清楚，我知道自己要成为什么样的修士。', key: 'C' },
    ],
  },
  4: {
    id: 4,
    text: '闺蜜让你用一句话形容「你到底是个什么样的人」——',
    options: [
      { value: 1, label: '我得先闭关想想，可能想半天也形容不明白。', key: 'A' },
      { value: 2, label: '能说几句，但总感觉还差那么一点准头。', key: 'B' },
      { value: 3, label: '这题我会，我甚至能顺手给自己写段人物介绍。', key: 'C' },
    ],
  },

  5: {
    id: 5,
    text: '你心里有没有一件值得你熬夜画符、挨雷也想守住的事？',
    options: [
      { value: 1, label: '活着就行，暂时没有非守不可的东西。', key: 'A' },
      { value: 2, label: '有一点，但没到把命都押上去的程度。', key: 'B' },
      { value: 3, label: '有，而且我知道自己愿意为它吃苦。', key: 'C' },
    ],
  },
  6: {
    id: 6,
    text: '宗门最近又开始卷修为、卷排名、卷成果，你通常会？',
    options: [
      { value: 1, label: '卷不了一点，我先活着再说。', key: 'A' },
      { value: 2, label: '看状态，今天能卷就卷，明天再摆。', key: 'B' },
      { value: 3, label: '会被点燃，不往上冲我浑身难受。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  // 情劫 · Emotion
  // ══════════════════════════════════════

  7: {
    id: 7,
    text: '暧昧对象说自己去闭关，八个时辰没回你传音符。你第一反应更像？',
    options: [
      { value: 1, label: '闭关这么久？ta 该不会在陪别人历练吧。', key: 'A' },
      { value: 2, label: '一半相信一半怀疑，已经开始小幅脑补。', key: 'B' },
      { value: 3, label: '闭关本来就不方便，等 ta 出关再说。', key: 'C' },
    ],
  },
  8: {
    id: 8,
    text: '关系一稳定下来，你反而会暗暗怕哪天对方突然解契。',
    options: [
      { value: 3, label: '是的，ta 一冷淡我脑内已经演到分道扬镳。', key: 'A' },
      { value: 2, label: '偶尔会闪过这种念头，但不至于天天有。', key: 'B' },
      { value: 1, label: '不会，我对关系基本还是有底的。', key: 'C' },
    ],
  },

  9: {
    id: 9,
    text: '每次动心，你都觉得自己是认真的，不是在随便上头。',
    options: [
      { value: 1, label: '那倒也没有，我还是会给自己留点余地。', key: 'A' },
      { value: 2, label: '大部分时候是认真，但偶尔也会热得快冷得快。', key: 'B' },
      { value: 3, label: '是的，我一旦动心基本就是全情投入。', key: 'C' },
    ],
  },
  10: {
    id: 10,
    text: '你遇到一个很温柔、很体面、对你还特别上心的同修——',
    options: [
      { value: 1, label: '再好我也会先压住，不想陷太深。', key: 'A' },
      { value: 2, label: '会心动，但我会努力保持一点清醒。', key: 'B' },
      { value: 3, label: '基本完蛋，我会忍不住越陷越深。', key: 'C' },
    ],
  },

  11: {
    id: 11,
    text: '喜欢的人想和你共享洞府、共享日程、共享所有情绪，你会？',
    options: [
      { value: 1, label: '好耶，我也想整天黏在一起。', key: 'A' },
      { value: 2, label: '看状态吧，黏一点也不是不行。', key: 'B' },
      { value: 3, label: '先等等，我还是需要一点自己的结界。', key: 'C' },
    ],
  },
  12: {
    id: 12,
    text: '不管和谁关系多近，你都需要一段谁都别进来的独处时间。',
    options: [
      { value: 1, label: '我更喜欢有人陪着，独处太久反而空。', key: 'A' },
      { value: 2, label: '分人分时段，不是每天都需要。', key: 'B' },
      { value: 3, label: '非常需要，谁来也别碰我今天的结界。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  // 道心 · Attitude
  // ══════════════════════════════════════

  13: {
    id: 13,
    text: '你对修仙界大多数人的默认看法更像？',
    options: [
      { value: 1, label: '先保留怀疑，修仙界坏人只会比我想得更多。', key: 'A' },
      { value: 2, label: '不好不坏吧，我一般先观望。', key: 'B' },
      { value: 3, label: '我还是愿意相信大多数人没那么坏。', key: 'C' },
    ],
  },
  14: {
    id: 14,
    text: '仙市上，一个看起来很可爱的小师妹突然塞给你一张护心符。你会？',
    options: [
      { value: 1, label: '第一反应：这不会是什么新型骗术吧。', key: 'A' },
      { value: 2, label: '先愣一下，再决定要不要收。', key: 'B' },
      { value: 3, label: '呜呜她也太好了吧，我会认真收下。', key: 'C' },
    ],
  },

  15: {
    id: 15,
    text: '明天就是宗门大比，今晚本该闭关。结果闺蜜约你去仙市吃甜汤顺便看帅哥。你更像？',
    options: [
      { value: 3, label: '走！大比年年有，今晚这局错过就没了。', key: 'A' },
      { value: 2, label: '先想办法请个假，尽量两边都不耽误。', key: 'B' },
      { value: 1, label: '不去，既然定了闭关就闭到底。', key: 'C' },
    ],
  },
  16: {
    id: 16,
    text: '你给自己列了一张修炼清单，后续通常会？',
    options: [
      { value: 1, label: '列完就列完了，执行与我无关。', key: 'A' },
      { value: 2, label: '做一半已经算我状态很好。', key: 'B' },
      { value: 3, label: '我很依赖计划，被打乱会有点烦。', key: 'C' },
    ],
  },

  17: {
    id: 17,
    text: '你偶尔会觉得，修仙、上班、恋爱、做人，本质上都是在硬撑。',
    options: [
      { value: 3, label: '是的，我经常被这种念头精准击中。', key: 'A' },
      { value: 2, label: '偶尔会这么想，但也不至于完全认命。', key: 'B' },
      { value: 1, label: '没有，我还是觉得很多事挺值得的。', key: 'C' },
    ],
  },
  18: {
    id: 18,
    text: '你觉得人活着，总得修成点什么，或者去到某个自己想去的地方。',
    options: [
      { value: 1, label: '先把今天混过去再说，别给我上价值。', key: 'A' },
      { value: 2, label: '有的话更好，没有也不是活不了。', key: 'B' },
      { value: 3, label: '认同，我还是需要一个想奔去的方向。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  // 行功 · Action
  // ══════════════════════════════════════

  19: {
    id: 19,
    text: '你接宗门任务时，更接近哪种内驱力？',
    options: [
      { value: 1, label: '主要是别挨骂、别扣分、别出事。', key: 'A' },
      { value: 2, label: '一半为了推进自己，一半为了少点麻烦。', key: 'B' },
      { value: 3, label: '我更想靠做成事让自己往上走。', key: 'C' },
    ],
  },
  20: {
    id: 20,
    text: '看到同门又突破、又出成绩、又被夸上天，你第一反应更像？',
    options: [
      { value: 1, label: '关我什么事，我先把自己今天活完。', key: 'A' },
      { value: 2, label: '会酸一下，但也会佩服一下。', key: 'B' },
      { value: 3, label: '会被点燃，我也想狠狠干一把。', key: 'C' },
    ],
  },

  21: {
    id: 21,
    text: '面前有三条秘境路线，大家都在等你拍板。你通常会？',
    options: [
      { value: 1, label: '我能纠结到秘境自己关门。', key: 'A' },
      { value: 2, label: '小事随便，大事会多想一会儿。', key: 'B' },
      { value: 3, label: '选一个就走，不想在原地磨太久。', key: 'C' },
    ],
  },
  22: {
    id: 22,
    text: '此题没有题目，请凭直觉和一点点天意盲选。',
    options: [
      { value: 1, label: '等等，我得先想想出题人到底想测什么。', key: 'A' },
      { value: 2, label: '那就先选个中间位，出事概率低一点。', key: 'B' },
      { value: 3, label: '别想了，顺手就点这个。', key: 'C' },
    ],
  },

  23: {
    id: 23,
    text: '你一旦认定一件事该推进，通常会？',
    options: [
      { value: 1, label: '认定归认定，真正动手可能得等情绪到位。', key: 'A' },
      { value: 2, label: '会做，但节奏不一定很快。', key: 'B' },
      { value: 3, label: '不做完我心里像卡了根刺。', key: 'C' },
    ],
  },
  24: {
    id: 24,
    text: '你熬夜给自己炼驻颜丹，结果直接炸炉。满屋黑烟时你更像？',
    options: [
      { value: 1, label: '先坐着发呆，等烟自己散。', key: 'A' },
      { value: 2, label: '一边骂炉子一边给闺蜜发语音吐槽。', key: 'B' },
      { value: 3, label: '立刻开窗、换备用炉、重来。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  // 缘法 · Social
  // ══════════════════════════════════════

  25: {
    id: 25,
    text: '闺蜜带了她别的朋友一起逛仙市、吃甜汤。你的默认状态更像？',
    options: [
      { value: 1, label: '先礼貌微笑，别的等我缓缓。', key: 'A' },
      { value: 2, label: '看对方气场，聊得来就自然能聊。', key: 'B' },
      { value: 3, label: '闺蜜的朋友就是我朋友，来都来了快一起玩。', key: 'C' },
    ],
  },
  26: {
    id: 26,
    text: '你在论道群里认识了一些聊得来的人，大家约线下茶会。你会？',
    options: [
      { value: 1, label: '线上嘴炮可以，真见面我得提前紧张三天。', key: 'A' },
      { value: 2, label: '可以去，谁来跟我说话我就接一下。', key: 'B' },
      { value: 3, label: '认真挑衣服，甚至会提前想聊天话题。', key: 'C' },
    ],
  },

  27: {
    id: 27,
    text: '你和人相处是不是有点像自带电子围栏，靠太近就会警觉？',
    options: [
      { value: 1, label: '不会，我熟起来边界其实挺低的。', key: 'A' },
      { value: 2, label: '分人，舒服的人靠近一点也没事。', key: 'B' },
      { value: 3, label: '是的，我需要一点安全距离感。', key: 'C' },
    ],
  },
  28: {
    id: 28,
    text: '一旦确认是自己人，你会很容易把对方划进亲近范围。',
    options: [
      { value: 1, label: '不会，我熟得很慢。', key: 'A' },
      { value: 2, label: '看缘分，有的人快一点有的人慢一点。', key: 'B' },
      { value: 3, label: '会，熟起来像失散多年的同门。', key: 'C' },
    ],
  },

  29: {
    id: 29,
    text: '你在师尊面前、在喜欢的人面前、在闺蜜群里，像三套不同系统。',
    options: [
      { value: 3, label: '非常像，我切换社交面具比换法袍还快。', key: 'A' },
      { value: 2, label: '会微调，但核心那个我还在。', key: 'B' },
      { value: 1, label: '没那么夸张，我大体上还是一个样。', key: 'C' },
    ],
  },
  30: {
    id: 30,
    text: '你明明对某条宗门群公告很无语，最后却没发言。更多时候是因为？',
    options: [
      { value: 3, label: '不想让人知道我脑子里的真实吐槽有多阴暗。', key: 'A' },
      { value: 2, label: '主要是不想惹事，毕竟还得在这个群里混。', key: 'B' },
      { value: 1, label: '这种情况不多，我一般忍不了太久。', key: 'C' },
    ],
  },

  31: {
    id: 31,
    text: '你闭关之外最容易让自己上头的爱好是？',
    options: [
      { value: 1, label: '吃灵果、晒太阳、逗灵宠，主打一个活着。', key: 'A' },
      { value: 2, label: '画符、炼体、弹琴、手作，怎么舒服怎么来。', key: 'B' },
      { value: 3, label: '喝酒，必须喝点，灵魂才算真正下班。', key: 'C' },
    ],
  },
  32: {
    id: 32,
    text: '灵酒下肚之后，你会不会像换了个人设？',
    options: [
      { value: 3, label: '会，酒后那个我比清醒的我敢活太多。', key: 'A' },
      { value: 2, label: '会松一点，但本质还是那个我。', key: 'B' },
      { value: 1, label: '不会，喝不喝都差不多，顶多更诚实。', key: 'C' },
    ],
  },
};