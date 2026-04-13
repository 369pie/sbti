import type { IdentifyModelType } from './dimensions';

export interface IdentifyAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface IdentifyQuestion {
  id: number;
  text: string;
  dimension: string;
  model: IdentifyModelType;
  reversed: boolean;
  options: IdentifyAnswerOption[];
}

export const IDENTIFY_QUESTIONS: IdentifyQuestion[] = [
  // ── Social (D1) — 4 questions ──
  {
    id: 1, text: '聚会的时候，ta 通常？', dimension: 'D1', model: 'social', reversed: false,
    options: [
      { value: 3, label: '全场最大声，走到哪热闹到哪。', key: 'A' },
      { value: 2, label: '跟熟人聊得开心，但不会主动破冰。', key: 'B' },
      { value: 1, label: '角落里玩手机，或者根本不来。', key: 'C' },
    ],
  },
  {
    id: 2, text: '你在群里发了一条消息，ta 的反应？', dimension: 'D1', model: 'social', reversed: false,
    options: [
      { value: 3, label: '秒回+表情包轰炸+追问细节。', key: 'A' },
      { value: 2, label: '看情况回，不紧不慢。', key: 'B' },
      { value: 1, label: '已读不回是常态，偶尔冒个泡。', key: 'C' },
    ],
  },
  {
    id: 3, text: '让 ta 在一群陌生人面前自我介绍？', dimension: 'D1', model: 'social', reversed: false,
    options: [
      { value: 3, label: '立刻变成脱口秀，聊得全场笑。', key: 'A' },
      { value: 2, label: '正常介绍，不卑不亢。', key: 'B' },
      { value: 1, label: 'ta 可能当场装死。', key: 'C' },
    ],
  },
  {
    id: 4, text: '你突然约 ta 出门，ta 的反应？', dimension: 'D1', model: 'social', reversed: false,
    options: [
      { value: 3, label: '来了来了！顺便再叫几个人？', key: 'A' },
      { value: 2, label: '看心情和时间，五五开。', key: 'B' },
      { value: 1, label: '编了三个借口婉拒。', key: 'C' },
    ],
  },

  // ── Emotion (D2) — 4 questions ──
  {
    id: 5, text: 'ta 看一部感人的电影会？', dimension: 'D2', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '哭得稀里哗啦，纸巾用一包。', key: 'A' },
      { value: 2, label: '有点感触，眼眶湿了但忍住了。', key: 'B' },
      { value: 1, label: '面无表情，全程吃零食。', key: 'C' },
    ],
  },
  {
    id: 6, text: 'ta 被人误解了，一般怎么处理？', dimension: 'D2', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '当场爆炸或者回家写三千字小作文。', key: 'A' },
      { value: 2, label: '有点不爽但会消化，可能私下吐槽两句。', key: 'B' },
      { value: 1, label: '无所谓，懒得解释，爱咋想咋想。', key: 'C' },
    ],
  },
  {
    id: 7, text: 'ta 生气了，你能看出来吗？', dimension: 'D2', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '能，因为全世界都能看出来。', key: 'A' },
      { value: 2, label: '仔细看能发现一些微妙变化。', key: 'B' },
      { value: 1, label: '完全看不出来，ta的扑克脸是专业级的。', key: 'C' },
    ],
  },
  {
    id: 8, text: 'ta 开心的时候是什么样的？', dimension: 'D2', model: 'emotion', reversed: false,
    options: [
      { value: 3, label: '开心到发疯，恨不得全世界都知道。', key: 'A' },
      { value: 2, label: '嘴角上扬，心情好但不至于疯。', key: 'B' },
      { value: 1, label: '嗯……表面看不出什么变化。', key: 'C' },
    ],
  },

  // ── Drive (D3) — 4 questions ──
  {
    id: 9, text: 'ta 说"我要减肥/早睡/运动"，结果？', dimension: 'D3', model: 'drive', reversed: false,
    options: [
      { value: 3, label: '立刻行动，一周后你发现ta真的做到了。', key: 'A' },
      { value: 2, label: '坚持了三天，第四天打回原形。', key: 'B' },
      { value: 1, label: '说完就忘了，下次还说。', key: 'C' },
    ],
  },
  {
    id: 10, text: '遇到一件麻烦事，ta 的第一反应？', dimension: 'D3', model: 'drive', reversed: false,
    options: [
      { value: 3, label: '立刻着手解决，边想边干。', key: 'A' },
      { value: 2, label: '先想想对策，然后再动手。', key: 'B' },
      { value: 1, label: '先躺一会再说，说不定问题自己消失了。', key: 'C' },
    ],
  },
  {
    id: 11, text: 'ta 做决定的速度？', dimension: 'D3', model: 'drive', reversed: false,
    options: [
      { value: 3, label: '极快，想到就做，不纠结。', key: 'A' },
      { value: 2, label: '会权衡一下，但不至于太久。', key: 'B' },
      { value: 1, label: '选择困难晚期，吃什么都要想半小时。', key: 'C' },
    ],
  },
  {
    id: 12, text: '你跟 ta 说"走，现在出发旅行"？', dimension: 'D3', model: 'drive', reversed: false,
    options: [
      { value: 3, label: '十分钟内出门，行李都不带。', key: 'A' },
      { value: 2, label: '让ta准备一下，明天走行不行。', key: 'B' },
      { value: 1, label: 'ta开始列攻略、比价、看天气……下周再说吧。', key: 'C' },
    ],
  },

  // ── Vibe (D4) — 4 questions ──
  {
    id: 13, text: '跟 ta 待在一起，你的感受是？', dimension: 'D4', model: 'vibe', reversed: false,
    options: [
      { value: 3, label: '像晒太阳一样舒服，会不自觉笑起来。', key: 'A' },
      { value: 2, label: '正常舒适，相处不累。', key: 'B' },
      { value: 1, label: '有一种微妙的距离感，但也不是讨厌。', key: 'C' },
    ],
  },
  {
    id: 14, text: '初次见到 ta 的人通常觉得 ta？', dimension: 'D4', model: 'vibe', reversed: false,
    options: [
      { value: 3, label: '好可爱/好亲切/好好相处！', key: 'A' },
      { value: 2, label: '看起来还行，正常人。', key: 'B' },
      { value: 1, label: '有点高冷/不太好接近的样子。', key: 'C' },
    ],
  },
  {
    id: 15, text: '当 ta 安慰别人的时候？', dimension: 'D4', model: 'vibe', reversed: false,
    options: [
      { value: 3, label: '超级暖，让人立刻想哭。', key: 'A' },
      { value: 2, label: '会安慰但有点生硬，心意到了。', key: 'B' },
      { value: 1, label: '「别哭了」然后就没有然后了。', key: 'C' },
    ],
  },
  {
    id: 16, text: 'ta 拍照的时候表情一般是？', dimension: 'D4', model: 'vibe', reversed: false,
    options: [
      { value: 3, label: '笑得超灿烂，阳光本光。', key: 'A' },
      { value: 2, label: '微笑，正常好看。', key: 'B' },
      { value: 1, label: '面瘫或者直接躲镜头。', key: 'C' },
    ],
  },

  // ── Loyalty (D5) — 4 questions ──
  {
    id: 17, text: '你半夜三点打电话给 ta 说你不开心？', dimension: 'D5', model: 'loyalty', reversed: false,
    options: [
      { value: 3, label: '秒接，陪你聊到天亮。', key: 'A' },
      { value: 2, label: '会接，聊一阵儿安慰你。', key: 'B' },
      { value: 1, label: '第二天回你：昨晚没看到，你没事吧。', key: 'C' },
    ],
  },
  {
    id: 18, text: '有人当面说你坏话，ta 会？', dimension: 'D5', model: 'loyalty', reversed: false,
    options: [
      { value: 3, label: '当场怼回去，比你还生气。', key: 'A' },
      { value: 2, label: '事后私下告诉你，让你注意。', key: 'B' },
      { value: 1, label: '不太想掺和，各人自扫门前雪。', key: 'C' },
    ],
  },
  {
    id: 19, text: 'ta 有好吃的/好玩的/好消息会？', dimension: 'D5', model: 'loyalty', reversed: false,
    options: [
      { value: 3, label: '第一个跟你分享，生怕你错过。', key: 'A' },
      { value: 2, label: '想起来了会告诉你。', key: 'B' },
      { value: 1, label: '自己享用完毕，不觉得有啥要分享的。', key: 'C' },
    ],
  },
  {
    id: 20, text: '你们闹别扭了，ta 一般？', dimension: 'D5', model: 'loyalty', reversed: false,
    options: [
      { value: 3, label: '过不了两天就主动来找你和好。', key: 'A' },
      { value: 2, label: '各退一步，找个台阶下。', key: 'B' },
      { value: 1, label: '冷处理，不主动找你，等你先开口。', key: 'C' },
    ],
  },
];
