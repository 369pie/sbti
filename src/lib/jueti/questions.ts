import { sampleQuestionsByDimension, shuffleArray } from '../question-pool';
import type { JuetiModelType } from './dimensions';

export interface JuetiAnswerOption {
  label: string;
  value: 1 | 2 | 3;
  key: string;
}

export interface JuetiQuestion {
  id: number;
  text: string;
  dimension: string;
  model: JuetiModelType;
  reversed: boolean;
  act: 1 | 2 | 3;
  options: JuetiAnswerOption[];
}

export const JUETI_ACT_NAMES: Record<1 | 2 | 3, string> = {
  1: '白天的你',
  2: '深夜的你',
  3: '梦里的你',
};

export const JUETI_QUESTIONS: JuetiQuestion[] = [
  // ══════════════════════════════════════════════════════════
  //  Act 1 · 白天的你 (Q1–Q7)
  // ══════════════════════════════════════════════════════════

  // ── 潮汐轴 J1 (T/S) ──
  {
    id: 1, text: '工作中来了一个陌生项目需要你对接——', dimension: 'J1', model: 'tide', reversed: false, act: 1,
    options: [
      { value: 3, label: '主动约对方碰一轮，聊完心里就有数了', key: 'A' },
      { value: 2, label: '先看看资料再说，准备好了再联系', key: 'B' },
      { value: 1, label: '等对方来找我吧，被动不代表不上心', key: 'C' },
    ],
  },

  // ── 锚定轴 J2 (R/W) ──
  {
    id: 2, text: '你最近在考虑一个比较大的人生决定——', dimension: 'J2', model: 'root', reversed: false, act: 1,
    options: [
      { value: 3, label: '需要想清楚利弊，有计划才敢迈步', key: 'A' },
      { value: 2, label: '想了一些，但也觉得走一步看一步', key: 'B' },
      { value: 1, label: '想太多不如先试试，错了再调整', key: 'C' },
    ],
  },

  // ── 界限轴 J3 (O/B) ──
  {
    id: 3, text: '一个朋友最近情绪很差，反复找你倾诉——', dimension: 'J3', model: 'edge', reversed: false, act: 1,
    options: [
      { value: 3, label: '每次都认真听，不自觉地也跟着情绪低落', key: 'A' },
      { value: 2, label: '愿意陪，但会提醒自己保持距离', key: 'B' },
      { value: 1, label: '听几次之后会直说"你可能需要专业帮助"', key: 'C' },
    ],
  },

  // ── 火焰轴 J4 (F/E) ──
  {
    id: 4, text: '你对一件事产生了兴趣，通常会——', dimension: 'J4', model: 'spark', reversed: false, act: 1,
    options: [
      { value: 3, label: '每天抽时间研究一点，持续很久', key: 'A' },
      { value: 2, label: '断断续续地看，视状态而定', key: 'B' },
      { value: 1, label: '会突然沉迷几天，然后可能就放下了', key: 'C' },
    ],
  },

  // ── 潮汐轴 J1 ──
  {
    id: 5, text: '一群人里气氛突然冷了下来——', dimension: 'J1', model: 'tide', reversed: false, act: 1,
    options: [
      { value: 3, label: '你会自然地说点什么暖场', key: 'A' },
      { value: 2, label: '看看有没有别人先开口', key: 'B' },
      { value: 1, label: '安静就安静吧，又不是你的责任', key: 'C' },
    ],
  },

  // ── 锚定轴 J2 ──
  {
    id: 6, text: '旅行时你更喜欢——', dimension: 'J2', model: 'root', reversed: false, act: 1,
    options: [
      { value: 3, label: '提前做好攻略，尽量不留遗憾', key: 'A' },
      { value: 2, label: '大方向确定，细节随机应变', key: 'B' },
      { value: 1, label: '不做计划。迷路、错过、偶遇，都是旅行', key: 'C' },
    ],
  },

  // ── 界限轴 J3 ──
  {
    id: 7, text: '有人问你"你最近怎么样"——', dimension: 'J3', model: 'edge', reversed: false, act: 1,
    options: [
      { value: 3, label: '如果关系到了，会比较真实地说出来', key: 'A' },
      { value: 2, label: '"还行吧"——真实但不展开', key: 'B' },
      { value: 1, label: '"挺好的"——哪怕不太好，也不想被看穿', key: 'C' },
    ],
  },
  {
    id: 21, text: '白天的你，突然对一件新东西起了兴趣，通常会——', dimension: 'J4', model: 'spark', reversed: false, act: 1,
    options: [
      { value: 3, label: '先把它排进接下来几天的时间里，慢慢啃', key: 'A' },
      { value: 2, label: '先记下来，等有空再认真碰', key: 'B' },
      { value: 1, label: '当场热一阵，之后可能就被别的事冲走', key: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════════════
  //  Act 2 · 深夜的你 (Q8–Q14)
  // ══════════════════════════════════════════════════════════

  // ── 火焰轴 J4 ──
  {
    id: 8, text: '凌晨一点，你突然很清醒——', dimension: 'J4', model: 'spark', reversed: false, act: 2,
    options: [
      { value: 3, label: '翻出搁置了很久的那件事，开始做', key: 'A' },
      { value: 2, label: '刷一会儿手机，困意来了就停', key: 'B' },
      { value: 1, label: '脑子里涌出很多想法，但天亮后未必还想做', key: 'C' },
    ],
  },

  // ── 潮汐轴 J1 ──
  {
    id: 9, text: '独处一整天之后，到了晚上你——', dimension: 'J1', model: 'tide', reversed: false, act: 2,
    options: [
      { value: 3, label: '开始想找人聊天，或者出门走走', key: 'A' },
      { value: 2, label: '还好，独处也不至于闷', key: 'B' },
      { value: 1, label: '感觉很好。一个人待着反而充电', key: 'C' },
    ],
  },

  // ── 锚定轴 J2 ──
  {
    id: 10, text: '你不确定一段关系还要不要继续——', dimension: 'J2', model: 'root', reversed: false, act: 2,
    options: [
      { value: 3, label: '先想清楚对方值不值得，这段关系有没有未来', key: 'A' },
      { value: 2, label: '给自己一点时间，感觉对了就留，不对就走', key: 'B' },
      { value: 1, label: '不去想"值不值得"，跟着感觉走', key: 'C' },
    ],
  },

  // ── 界限轴 J3 ──
  {
    id: 11, text: '你很在意的人说了一句无心的话伤到了你——', dimension: 'J3', model: 'edge', reversed: false, act: 2,
    options: [
      { value: 3, label: '会直接说出来，即使说的时候在发抖', key: 'A' },
      { value: 2, label: '先消化一下，看看自己是不是太敏感', key: 'B' },
      { value: 1, label: '默默记住，表面上不动声色', key: 'C' },
    ],
  },

  // ── 火焰轴 J4 ──
  {
    id: 12, text: '为了一个目标，你可以坚持多久？', dimension: 'J4', model: 'spark', reversed: false, act: 2,
    options: [
      { value: 3, label: '只要我还想要，就不会停', key: 'A' },
      { value: 2, label: '大部分时候还行，偶尔会怀疑自己', key: 'B' },
      { value: 1, label: '热情来的时候无人能挡，走了连自己也拉不回来', key: 'C' },
    ],
  },

  // ── 潮汐轴 J1 ──
  {
    id: 13, text: '你觉得自己在人群中的存在感——', dimension: 'J1', model: 'tide', reversed: false, act: 2,
    options: [
      { value: 3, label: '挺强的，总有人注意到我', key: 'A' },
      { value: 2, label: '不高不低，看场合', key: 'B' },
      { value: 1, label: '很弱。但我不觉得这有什么不好', key: 'C' },
    ],
  },

  // ── 锚定轴 J2 ──
  {
    id: 14, text: '面对一个不确定的结果——', dimension: 'J2', model: 'root', reversed: false, act: 2,
    options: [
      { value: 3, label: '需要尽快知道答案，等待让我焦虑', key: 'A' },
      { value: 2, label: '有点焦虑但能忍', key: 'B' },
      { value: 1, label: '反而有点期待。不确定性是有趣的', key: 'C' },
    ],
  },
  {
    id: 22, text: '深夜有人忽然发来很长一段情绪，你更像——', dimension: 'J3', model: 'edge', reversed: false, act: 2,
    options: [
      { value: 3, label: '会认真读完，哪怕自己也被一起卷进去', key: 'A' },
      { value: 2, label: '能陪一会儿，但会提醒自己别沉太深', key: 'B' },
      { value: 1, label: '先稳住边界，等我有余力再接这份重量', key: 'C' },
    ],
  },

  // ══════════════════════════════════════════════════════════
  //  Act 3 · 梦里的你 (Q15–Q20)
  // ══════════════════════════════════════════════════════════

  // ── 界限轴 J3 ──
  {
    id: 15, text: '如果你是一栋房子——', dimension: 'J3', model: 'edge', reversed: false, act: 3,
    options: [
      { value: 3, label: '门永远开着，谁来都有一杯茶', key: 'A' },
      { value: 2, label: '门半掩着，认识的人可以推开', key: 'B' },
      { value: 1, label: '只有一把钥匙。我选谁能进', key: 'C' },
    ],
  },

  // ── 火焰轴 J4 ──
  {
    id: 16, text: '你心里有一团火，它更像——', dimension: 'J4', model: 'spark', reversed: false, act: 3,
    options: [
      { value: 3, label: '壁炉里的火。一直在烧，安静但温暖', key: 'A' },
      { value: 2, label: '篝火。有人添柴就旺，没人管就慢慢变小', key: 'B' },
      { value: 1, label: '烟花。绚烂但短暂，每一次都倾尽全力', key: 'C' },
    ],
  },

  // ── 潮汐轴 J1 ──
  {
    id: 17, text: '如果可以选一种自然现象代表你——', dimension: 'J1', model: 'tide', reversed: false, act: 3,
    options: [
      { value: 3, label: '浪。一直在动，一直在来', key: 'A' },
      { value: 2, label: '湖面。大部分时候平静，偶尔起波澜', key: 'B' },
      { value: 1, label: '地下水。在很深的地方流淌，几乎没人知道', key: 'C' },
    ],
  },

  // ── 锚定轴 J2 ──
  {
    id: 18, text: '一个让你安心的画面是——', dimension: 'J2', model: 'root', reversed: false, act: 3,
    options: [
      { value: 3, label: '一个住了很久的房间，每样东西都在它该在的位置', key: 'A' },
      { value: 2, label: '一条走过的路，不一定记得每棵树，但感觉熟悉', key: 'B' },
      { value: 1, label: '一列不知道终点站的火车，窗外风景一直在换', key: 'C' },
    ],
  },

  // ── 界限轴 J3 ──
  {
    id: 19, text: '你觉得"被理解"这件事——', dimension: 'J3', model: 'edge', reversed: false, act: 3,
    options: [
      { value: 3, label: '是你活下去很重要的一部分', key: 'A' },
      { value: 2, label: '好的话当然好，没有也能过', key: 'B' },
      { value: 1, label: '不太需要。你理解自己就够了', key: 'C' },
    ],
  },

  // ── 火焰轴 J4 ──
  {
    id: 20, text: '如果生命有一个底色，你觉得你的是——', dimension: 'J4', model: 'spark', reversed: false, act: 3,
    options: [
      { value: 3, label: '一根持续燃烧的蜡烛。安静、但始终有光', key: 'A' },
      { value: 2, label: '季节更替的树。有繁盛也有枯萎，循环往复', key: 'B' },
      { value: 1, label: '闪电。短暂地照亮整个夜空，然后归于沉默', key: 'C' },
    ],
  },
  {
    id: 23, text: '如果梦里的你要变成一种水，你更像——', dimension: 'J1', model: 'tide', reversed: false, act: 3,
    options: [
      { value: 3, label: '潮水。不断拍岸，不断向外抵达', key: 'A' },
      { value: 2, label: '雨。来时很真，停时也很快', key: 'B' },
      { value: 1, label: '井水。安静地在深处，没人看见也在流', key: 'C' },
    ],
  },
  {
    id: 24, text: '一个让你安心的梦，更接近——', dimension: 'J2', model: 'root', reversed: false, act: 3,
    options: [
      { value: 3, label: '有门牌号的房子，灯是亮的，人也都在', key: 'A' },
      { value: 2, label: '一条熟路，虽然天有点暗，但知道自己会走回去', key: 'B' },
      { value: 1, label: '一张没有终点的船票，风往哪吹就往哪去', key: 'C' },
    ],
  },
];

export function shuffleJuetiQuestions(questions: JuetiQuestion[]): JuetiQuestion[] {
  const sampled = sampleQuestionsByDimension(questions, 5);

  return ([1, 2, 3] as const).flatMap((act) =>
    shuffleArray(sampled.filter((question) => question.act === act)),
  );
}
