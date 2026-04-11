import type { DrunkModelType } from './dimensions';

export interface DrunkAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface DrunkQuestion {
  id: number;
  text: string;
  dimension: string;
  model: DrunkModelType;
  reversed: boolean;
  options: DrunkAnswerOption[];
}

export const DRUNK_QUESTIONS: DrunkQuestion[] = [
  // ── Talk (D1) — 6 questions ──
  {
    id: 1, text: '喝了两杯之后，你的嘴巴？', dimension: 'D1', model: 'talk', reversed: false,
    options: [
      { value: 1, label: '跟没喝一样，该沉默还是沉默。', key: 'A' },
      { value: 2, label: '话比平时多一点，笑点也低了。', key: 'B' },
      { value: 3, label: '根本停不下来，全桌最大的BGM就是我。', key: 'C' },
    ],
  },
  {
    id: 2, text: '酒过三巡，你开始？', dimension: 'D1', model: 'talk', reversed: false,
    options: [
      { value: 1, label: '安静地玩手机，偶尔抬头笑笑。', key: 'A' },
      { value: 2, label: '加入聊天，但不会抢话。', key: 'B' },
      { value: 3, label: '打断所有人的话，因为我有更精彩的要说。', key: 'C' },
    ],
  },
  {
    id: 3, text: '喝酒聊天时你最可能？', dimension: 'D1', model: 'talk', reversed: false,
    options: [
      { value: 1, label: '当听众，偶尔点头表示在听。', key: 'A' },
      { value: 2, label: '聊到有兴趣的话题就开口。', key: 'B' },
      { value: 3, label: '讲自己的故事根本收不住，讲到别人插不上嘴。', key: 'C' },
    ],
  },
  {
    id: 4, text: '你的秘密在你喝酒时？', dimension: 'D1', model: 'talk', reversed: false,
    options: [
      { value: 1, label: '守得死死的，铁嘴钢牙。', key: 'A' },
      { value: 2, label: '偶尔漏一两句，说完就后悔。', key: 'B' },
      { value: 3, label: '跟开了闸的洪水一样哗哗往外倒。', key: 'C' },
    ],
  },
  {
    id: 5, text: '喝酒以后你给别人发消息的频率？', dimension: 'D1', model: 'talk', reversed: false,
    options: [
      { value: 1, label: '不发，手机都懒得看。', key: 'A' },
      { value: 2, label: '可能发个朋友圈或回复几条消息。', key: 'B' },
      { value: 3, label: '给通讯录一半的人发了消息，不管认不认识。', key: 'C' },
    ],
  },
  {
    id: 6, text: '朋友形容你酒后最多的一句话是？', dimension: 'D1', model: 'talk', reversed: false,
    options: [
      { value: 1, label: '「你喝了吗？看不出来啊。」', key: 'A' },
      { value: 2, label: '「你今天话多了点哈。」', key: 'B' },
      { value: 3, label: '「你能不能让别人也说两句？」', key: 'C' },
    ],
  },

  // ── Feels (D2) — 6 questions ──
  {
    id: 7, text: '喝完酒你的情绪更像？', dimension: 'D2', model: 'feels', reversed: false,
    options: [
      { value: 1, label: '平静的湖面，毫无波澜。', key: 'A' },
      { value: 2, label: '微风吹过的湖面，有点涟漪。', key: 'B' },
      { value: 3, label: '台风过境的海面，情绪过山车。', key: 'C' },
    ],
  },
  {
    id: 8, text: '酒后你突然想起一件伤心事，你会？', dimension: 'D2', model: 'feels', reversed: false,
    options: [
      { value: 1, label: '想想就过去了，继续喝。', key: 'A' },
      { value: 2, label: '心里酸了一下，但不表现出来。', key: 'B' },
      { value: 3, label: '当场红了眼眶，或者直接哭出来。', key: 'C' },
    ],
  },
  {
    id: 9, text: '有人在酒桌上讲了个感人的故事，你？', dimension: 'D2', model: 'feels', reversed: false,
    options: [
      { value: 1, label: '嗯，然后呢？继续吃菜。', key: 'A' },
      { value: 2, label: '有点感触，举杯敬一个。', key: 'B' },
      { value: 3, label: '当场共情到不行，恨不得抱着对方哭。', key: 'C' },
    ],
  },
  {
    id: 10, text: '喝酒的时候有人开了个你的玩笑，你？', dimension: 'D2', model: 'feels', reversed: false,
    options: [
      { value: 1, label: '一笑而过，完全不在意。', key: 'A' },
      { value: 2, label: '嘴上说没事，心里记小本本了。', key: 'B' },
      { value: 3, label: '当场变脸，喝多了可控制不住。', key: 'C' },
    ],
  },
  {
    id: 11, text: '酒后你的朋友圈画风是？', dimension: 'D2', model: 'feels', reversed: false,
    options: [
      { value: 1, label: '不发朋友圈，我很冷静。', key: 'A' },
      { value: 2, label: '拍个酒杯照，配个"微醺"。', key: 'B' },
      { value: 3, label: '发了三条又删了两条，内容从哈哈哈到人生好难。', key: 'C' },
    ],
  },
  {
    id: 12, text: '酒局结束回到家，你的状态？', dimension: 'D2', model: 'feels', reversed: false,
    options: [
      { value: 1, label: '洗脸刷牙睡觉，毫无情感波动。', key: 'A' },
      { value: 2, label: '有一点小感慨，但很快就过了。', key: 'B' },
      { value: 3, label: '一个人在沙发上坐了半小时，不知道在想什么。', key: 'C' },
    ],
  },

  // ── Chaos (D3) — 6 questions ──
  {
    id: 13, text: '有人递给你一个麦克风让你唱歌，你？', dimension: 'D3', model: 'chaos', reversed: false,
    options: [
      { value: 1, label: '死也不接，我清醒。', key: 'A' },
      { value: 2, label: '哼两句意思一下。', key: 'B' },
      { value: 3, label: '直接站到桌子上，全场都是我的演唱会。', key: 'C' },
    ],
  },
  {
    id: 14, text: '酒后有人提议玩真心话大冒险，你？', dimension: 'D3', model: 'chaos', reversed: false,
    options: [
      { value: 1, label: '不参与，我旁观就好。', key: 'A' },
      { value: 2, label: '参与但只选真心话。', key: 'B' },
      { value: 3, label: '大冒险随便来！什么都不怕！', key: 'C' },
    ],
  },
  {
    id: 15, text: '你喝醉了在路上遇到一只流浪猫，你？', dimension: 'D3', model: 'chaos', reversed: false,
    options: [
      { value: 1, label: '看一眼继续走。', key: 'A' },
      { value: 2, label: '蹲下来撸两下。', key: 'B' },
      { value: 3, label: '跟猫聊了十分钟天还想带它回家。', key: 'C' },
    ],
  },
  {
    id: 16, text: '酒后你的社交边界？', dimension: 'D3', model: 'chaos', reversed: false,
    options: [
      { value: 1, label: '跟平时一样，不越界。', key: 'A' },
      { value: 2, label: '稍微放松了一点，热情了些。', key: 'B' },
      { value: 3, label: '什么边界？全桌都是我的好朋友！不认识的也是！', key: 'C' },
    ],
  },
  {
    id: 17, text: '喝完酒你最可能做的大胆行为是？', dimension: 'D3', model: 'chaos', reversed: false,
    options: [
      { value: 1, label: '最多声音大点，别的没什么。', key: 'A' },
      { value: 2, label: '给暗恋的人发个消息。', key: 'B' },
      { value: 3, label: '当众表白/跳舞/给老板发辞职信，小场面。', key: 'C' },
    ],
  },
  {
    id: 18, text: '第二天醒来看到昨晚的照片/视频，你？', dimension: 'D3', model: 'chaos', reversed: false,
    options: [
      { value: 1, label: '照片里我很正常，看起来没喝醉。', key: 'A' },
      { value: 2, label: '有几张表情有点放飞，但还行。', key: 'B' },
      { value: 3, label: '看完想当场注销社交账号。', key: 'C' },
    ],
  },

  // ── Memory (D4) — 6 questions (reversed: HIGH = remember MORE) ──
  {
    id: 19, text: '昨晚喝的酒，今天早上你还记得？', dimension: 'D4', model: 'memory', reversed: false,
    options: [
      { value: 1, label: '完全不记得，从某个时间点开始就是黑屏。', key: 'A' },
      { value: 2, label: '记得大概流程，细节模糊。', key: 'B' },
      { value: 3, label: '全程高清回放，每个人说了什么我都记得。', key: 'C' },
    ],
  },
  {
    id: 20, text: '朋友提起「你昨晚干了xxx」，你？', dimension: 'D4', model: 'memory', reversed: false,
    options: [
      { value: 1, label: '「我有吗？？你确定是我？？」', key: 'A' },
      { value: 2, label: '「嗯……好像有这么回事。」', key: 'B' },
      { value: 3, label: '「对，我知道，我全记得，你不用提醒。」', key: 'C' },
    ],
  },
  {
    id: 21, text: '你喝完酒发的消息，第二天你？', dimension: 'D4', model: 'memory', reversed: false,
    options: [
      { value: 1, label: '完全不记得自己发过，翻聊天记录才发现。', key: 'A' },
      { value: 2, label: '隐约记得发了什么，但不确定具体内容。', key: 'B' },
      { value: 3, label: '记得清清楚楚，发之前还犹豫了一下（然后还是发了）。', key: 'C' },
    ],
  },
  {
    id: 22, text: '一场酒局结束后，你通常？', dimension: 'D4', model: 'memory', reversed: false,
    options: [
      { value: 1, label: '中途开始就没印象了，怎么回的家都不知道。', key: 'A' },
      { value: 2, label: '记得前半场，后半场有点模糊。', key: 'B' },
      { value: 3, label: '连谁买的单都记得，我永远是第一手情报来源。', key: 'C' },
    ],
  },
  {
    id: 23, text: '你的酒后记忆和闺蜜/兄弟的描述？', dimension: 'D4', model: 'memory', reversed: false,
    options: [
      { value: 1, label: '他们说的跟我记的完全不是一个版本。', key: 'A' },
      { value: 2, label: '大致对得上，个别细节有出入。', key: 'B' },
      { value: 3, label: '我的版本比他们的更详细，我才是记录者。', key: 'C' },
    ],
  },
  {
    id: 24, text: '你觉得自己喝酒断片的频率？', dimension: 'D4', model: 'memory', reversed: false,
    options: [
      { value: 1, label: '几乎每次喝多都断片。', key: 'A' },
      { value: 2, label: '偶尔会，取决于喝了多少。', key: 'B' },
      { value: 3, label: '从来不断片，就算喝多了也清醒得很。', key: 'C' },
    ],
  },

  // ── Thirst (D5) — 6 questions ──
  {
    id: 25, text: '有人说"再来一杯"，你？', dimension: 'D5', model: 'thirst', reversed: false,
    options: [
      { value: 1, label: '不了不了，我够了。', key: 'A' },
      { value: 2, label: '看情况，如果气氛到了就再来一杯。', key: 'B' },
      { value: 3, label: '一杯？十杯都可以！', key: 'C' },
    ],
  },
  {
    id: 26, text: '酒局进行到你觉得"差不多了"的时候？', dimension: 'D5', model: 'thirst', reversed: false,
    options: [
      { value: 1, label: '我很早就觉得差不多了。', key: 'A' },
      { value: 2, label: '中间有个合适的节点就可以结束。', key: 'B' },
      { value: 3, label: '什么叫差不多？我从来不觉得差不多。', key: 'C' },
    ],
  },
  {
    id: 27, text: '别人都说散了吧，你的反应？', dimension: 'D5', model: 'thirst', reversed: false,
    options: [
      { value: 1, label: '终于！我已经想走很久了。', key: 'A' },
      { value: 2, label: '行吧，差不多可以了。', key: 'B' },
      { value: 3, label: '走什么走！再喝一轮！去二场！', key: 'C' },
    ],
  },
  {
    id: 28, text: '你对劝酒的人通常？', dimension: 'D5', model: 'thirst', reversed: false,
    options: [
      { value: 1, label: '坚决拒绝，别想灌我。', key: 'A' },
      { value: 2, label: '看关系，关系好就喝一杯。', key: 'B' },
      { value: 3, label: '不用劝，你还没开口我就自己倒了。', key: 'C' },
    ],
  },
  {
    id: 29, text: '喝完酒回到家，你？', dimension: 'D5', model: 'thirst', reversed: false,
    options: [
      { value: 1, label: '灌一大杯水，发誓下次少喝。', key: 'A' },
      { value: 2, label: '今天喝得刚好，挺开心的。', key: 'B' },
      { value: 3, label: '打开冰箱看看还有没有啤酒。', key: 'C' },
    ],
  },
  {
    id: 30, text: '有人问你"你酒量怎么样"，你最可能说？', dimension: 'D5', model: 'thirst', reversed: false,
    options: [
      { value: 1, label: '「不太行，意思意思就行了。」', key: 'A' },
      { value: 2, label: '「还可以，看喝什么。」', key: 'B' },
      { value: 3, label: '「来啊，谁怕谁。」', key: 'C' },
    ],
  },
];
