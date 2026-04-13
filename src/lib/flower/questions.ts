import { sampleQuestionsByDimension } from '../question-pool';
import type { FlowerModelType } from './dimensions';

export interface FlowerAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface FlowerQuestion {
  id: number;
  text: string;
  dimension: string;
  model: FlowerModelType;
  reversed: boolean;
  options?: FlowerAnswerOption[];
}

export const FLOWER_DEFAULT_OPTIONS: FlowerAnswerOption[] = [
  { value: 1, label: '不认同', key: 'A' },
  { value: 2, label: '中立', key: 'B' },
  { value: 3, label: '认同', key: 'C' },
];

export const FLOWER_QUESTIONS: FlowerQuestion[] = [
  // ══════════════════════════════════════
  //  光合轴 (Photosynthesis) F1 — H(向光) ↔ S(趋暗)
  //  高分 → H(向光/外向), 低分 → S(趋暗/内向)
  // ══════════════════════════════════════
  {
    id: 1, text: '周末到了，你更想：', dimension: 'F1', model: 'photosynthesis', reversed: false,
    options: [
      { value: 3, label: '约上朋友，出门嗨一天——在家待着是浪费青春。', key: 'A' },
      { value: 2, label: '看心情，有约就出去，没约就宅着。', key: 'B' },
      { value: 1, label: '终于可以一个人待着了，手机调静音，世界清净了。', key: 'C' },
    ],
  },
  {
    id: 2, text: '参加一个大部分人你不认识的聚会，你会：', dimension: 'F1', model: 'photosynthesis', reversed: false,
    options: [
      { value: 3, label: '太好了！新朋友！主动出击，聊完一圈加完微信。', key: 'A' },
      { value: 2, label: '先找认识的人待着，可以被介绍，不主动出击。', key: 'B' },
      { value: 1, label: '全程紧贴唯一认识的朋友，或者找个角落玩手机。', key: 'C' },
    ],
  },
  {
    id: 3, text: '连续社交三天后，你的状态是：', dimension: 'F1', model: 'photosynthesis', reversed: false,
    options: [
      { value: 3, label: '精力充沛+意犹未尽，明天还能再来三天。', key: 'A' },
      { value: 2, label: '有点累但挺开心的，休息一天就恢复了。', key: 'B' },
      { value: 1, label: '电量-30%，我需要一个人待三天来回血。', key: 'C' },
    ],
  },
  {
    id: 4, text: '哪种场景更像你的"充电方式"？', dimension: 'F1', model: 'photosynthesis', reversed: false,
    options: [
      { value: 3, label: '和朋友在小酒馆聊到凌晨，越聊越清醒。', key: 'A' },
      { value: 2, label: '要看跟谁——对的人充电，不对的人耗电。', key: 'B' },
      { value: 1, label: '独自散步/泡澡/看书，安安静静才算充电。', key: 'C' },
    ],
  },
  {
    id: 5, text: '如果可以选择一种生活节奏，你选：', dimension: 'F1', model: 'photosynthesis', reversed: false,
    options: [
      { value: 3, label: '永远有约、永远在路上、永远闲不住。', key: 'A' },
      { value: 2, label: '动静结合，该嗨嗨该宅宅。', key: 'B' },
      { value: 1, label: '隐居+偶尔出山。大部分时间和自己相处。', key: 'C' },
    ],
  },
  {
    id: 21, text: '如果接下来一整周都没有任何局、也没人找你聊天，你会？', dimension: 'F1', model: 'photosynthesis', reversed: false,
    options: [
      { value: 3, label: '开始主动约人，不然这一周像没开机。', key: 'A' },
      { value: 2, label: '前两天挺爽，后面会有点想见人。', key: 'B' },
      { value: 1, label: '太好了，这周终于完整属于我自己。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  花期轴 (Bloom) F2 — B(盛放) ↔ L(蓄蕾)
  //  高分 → B(外显表达), 低分 → L(内敛含蓄)
  // ══════════════════════════════════════
  {
    id: 6, text: '你开心的时候，通常是：', dimension: 'F2', model: 'bloom', reversed: false,
    options: [
      { value: 3, label: '笑出声+拍桌子+恨不得告诉所有人！', key: 'A' },
      { value: 2, label: '嘴角上扬，心里美滋滋但不会太夸张。', key: 'B' },
      { value: 1, label: '内心已经放烟花了，但脸上顶多微微一笑。', key: 'C' },
    ],
  },
  {
    id: 7, text: '委屈的时候，你会：', dimension: 'F2', model: 'bloom', reversed: false,
    options: [
      { value: 3, label: '当场就说出来——我不高兴了，你知道吧？', key: 'A' },
      { value: 2, label: '看对方是谁。亲近的人会说，关系一般的忍了。', key: 'B' },
      { value: 1, label: '咽下去。回去可能偷偷哭一场，但绝不让人看到。', key: 'C' },
    ],
  },
  {
    id: 8, text: '朋友送了你一个超棒的生日礼物，你的反应：', dimension: 'F2', model: 'bloom', reversed: false,
    options: [
      { value: 3, label: '啊啊啊啊啊！！当场尖叫+拥抱+发朋友圈。', key: 'A' },
      { value: 2, label: '很开心地说谢谢，脸上看得出真的高兴。', key: 'B' },
      { value: 1, label: '"谢谢。"（内心已经感动到不行了但就是说不出更多的话）', key: 'C' },
    ],
  },
  {
    id: 9, text: '关于你的喜怒哀乐，朋友们通常：', dimension: 'F2', model: 'bloom', reversed: false,
    options: [
      { value: 3, label: '一看就知道——你的情绪就写在脸上。', key: 'A' },
      { value: 2, label: '认真看能看出来，但你不说他们不一定发现。', key: 'B' },
      { value: 1, label: '完全看不出来，经常说"你居然不开心？看不出来啊"。', key: 'C' },
    ],
  },
  {
    id: 10, text: '你觉得哪种描述更像你？', dimension: 'F2', model: 'bloom', reversed: false,
    options: [
      { value: 3, label: '我是一本打开的书——什么情绪都藏不住。', key: 'A' },
      { value: 2, label: '半开半合吧，看心情也看对象。', key: 'B' },
      { value: 1, label: '我是一本上了锁的日记——丰富得很，但你看不到。', key: 'C' },
    ],
  },
  {
    id: 22, text: '情绪上来的时候，我第一反应通常是先压住，不太想让人当场看见。', dimension: 'F2', model: 'bloom', reversed: true,
    options: [
      { value: 3, label: '对，我宁可回去自己消化。', key: 'A' },
      { value: 2, label: '分情况，有时能藏住有时藏不住。', key: 'B' },
      { value: 1, label: '不太对，我脸上和语气都会先出卖我。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  根系轴 (Root) F3 — T(主根/深度) ↔ F(须根/广度)
  //  高分 → T(深度关系), 低分 → F(广度关系)
  // ══════════════════════════════════════
  {
    id: 11, text: '你理想中的朋友圈是：', dimension: 'F3', model: 'root', reversed: false,
    options: [
      { value: 3, label: '三五个掏心窝的，什么都能说的那种。', key: 'A' },
      { value: 2, label: '有几个特别亲的，也有一圈聊得来但没那么深的。', key: 'B' },
      { value: 1, label: '到处都有朋友！什么群都在，什么局都能去。', key: 'C' },
    ],
  },
  {
    id: 12, text: '遇到烦心事，你更倾向于：', dimension: 'F3', model: 'root', reversed: false,
    options: [
      { value: 3, label: '只跟最亲的那一两个人说，别人一句都不提。', key: 'A' },
      { value: 2, label: '看事情大小——小事随便提提，大事找核心朋友。', key: 'B' },
      { value: 1, label: '群里吐槽/发朋友圈/跟好几个人都聊聊。', key: 'C' },
    ],
  },
  {
    id: 13, text: '你和一个人成为"真正的朋友"需要多久？', dimension: 'F3', model: 'root', reversed: false,
    options: [
      { value: 3, label: '很久。经过很多事考验之后才算真朋友。', key: 'A' },
      { value: 2, label: '不好说，看缘分和契合度。', key: 'B' },
      { value: 1, label: '很快！聊得来三天就能叫宝。', key: 'C' },
    ],
  },
  {
    id: 14, text: '关于手机里的群聊，你的状态是：', dimension: 'F3', model: 'root', reversed: false,
    options: [
      { value: 3, label: '主要就那一两个重要的群，其他都免打扰。', key: 'A' },
      { value: 2, label: '有几个活跃的群，偶尔会翻翻其他的。', key: 'B' },
      { value: 1, label: '群多到数不清，每天99+消息是日常。', key: 'C' },
    ],
  },
  {
    id: 15, text: '半年没联系的朋友突然找你，你的反应是：', dimension: 'F3', model: 'root', reversed: false,
    options: [
      { value: 3, label: '"是不是有事找我？"——关系到不了随便聊的程度。', key: 'A' },
      { value: 2, label: '看是谁吧，有些人久了不联系也没关系。', key: 'B' },
      { value: 1, label: '开心！立刻回复+聊一个小时，感觉友谊完全没断。', key: 'C' },
    ],
  },
  {
    id: 23, text: '你更舒服的人际状态是：', dimension: 'F3', model: 'root', reversed: false,
    options: [
      { value: 3, label: '固定几个人，联系不算多，但都很深。', key: 'A' },
      { value: 2, label: '有核心圈，也有不少轻松来往的人。', key: 'B' },
      { value: 1, label: '认识的人越多越安心，到哪都最好有人接得住。', key: 'C' },
    ],
  },

  // ══════════════════════════════════════
  //  铠甲轴 (Armor) F4 — R(带刺) ↔ O(无刺)
  //  高分 → R(强边界), 低分 → O(弱边界/开放)
  // ══════════════════════════════════════
  {
    id: 16, text: '有人对你特别好，但你觉得没那么熟，你会：', dimension: 'F4', model: 'armor', reversed: false,
    options: [
      { value: 3, label: '先保持距离，搞清楚对方目的再说。', key: 'A' },
      { value: 2, label: '礼貌地接受，但心里会留个问号。', key: 'B' },
      { value: 1, label: '开心地接受！有人对我好是好事呀。', key: 'C' },
    ],
  },
  {
    id: 17, text: '朋友想借一笔不小的钱，你：', dimension: 'F4', model: 'armor', reversed: false,
    options: [
      { value: 3, label: '太亲的关系不谈钱，直接拒绝。边界清晰。', key: 'A' },
      { value: 2, label: '看是谁、看金额、看理由，综合判断。', key: 'B' },
      { value: 1, label: '好朋友开口了就借吧，不忍心说不。', key: 'C' },
    ],
  },
  {
    id: 18, text: '你觉得"信任"这个东西：', dimension: 'F4', model: 'armor', reversed: false,
    options: [
      { value: 3, label: '是赚来的。不是默认给的，你得证明你值得。', key: 'A' },
      { value: 2, label: '先给一半，后面看表现追加或收回。', key: 'B' },
      { value: 1, label: '默认先信任，除非被伤害了才收回。', key: 'C' },
    ],
  },
  {
    id: 19, text: '有人在你面前开了一个让你不舒服的玩笑，你：', dimension: 'F4', model: 'armor', reversed: false,
    options: [
      { value: 3, label: '直接说"别这样，我不喜欢。"——不接受冒犯。', key: 'A' },
      { value: 2, label: '给个尴尬的微笑，事后看情况提一下。', key: 'B' },
      { value: 1, label: '笑笑就过了，可能对方也不是故意的。', key: 'C' },
    ],
  },
  {
    id: 20, text: '哪句话更像你的人生准则？', dimension: 'F4', model: 'armor', reversed: false,
    options: [
      { value: 3, label: '"先保护好自己，才有余力对别人好。"', key: 'A' },
      { value: 2, label: '"对好人好，对坏人也别太差。"', key: 'B' },
      { value: 1, label: '"善良不吃亏，世界还是好人多。"', key: 'C' },
    ],
  },
  {
    id: 24, text: '别人一开口求助，我常常还没想好就先答应了。', dimension: 'F4', model: 'armor', reversed: true,
    options: [
      { value: 3, label: '对，不好意思拒绝几乎是本能。', key: 'A' },
      { value: 2, label: '看事情大小，偶尔会先应下来。', key: 'B' },
      { value: 1, label: '不太会，我会先判断自己愿不愿意。', key: 'C' },
    ],
  },
];

export function shuffleFlowerQuestions(questions: FlowerQuestion[]): FlowerQuestion[] {
  return sampleQuestionsByDimension(questions, 5);
}
