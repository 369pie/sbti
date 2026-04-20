/**
 * WTFTI S 轴 12 道意识流投射题
 *
 * 题源：docs/01-strategy/wtfti-s-axis-projection-questions-2026-04-19.md
 *
 * 三种题型：
 *   - association (6) 联想题：给一个锚点（词 / 抽象图 / 音效），3 秒内选第一反应
 *   - latency     (4) 反应时题：5 秒内点最近的"声音/动作/空气/颜色"
 *   - tempo       (2) 节奏排序题：拖拽词卡，记录最终顺序与犹豫次数
 *
 * 每题打分见 ./scoring-s.ts。
 */

export type SQuestionType = 'association' | 'latency' | 'tempo';

export interface SOption {
  key: string;
  label: string;
  /** 该选项给 S 轴贡献的向量（-3..+3，单选项最多 ±3） */
  sVector: number;
}

export interface SAssociationQuestion {
  id: string;
  type: 'association';
  /** 锚点类型（视觉 / 听觉），驱动前端组件渲染策略 */
  anchorKind: 'word' | 'shape' | 'color' | 'sound';
  anchor: string;
  prompt: string;
  /** 倒计时（毫秒） */
  countdownMs: number;
  options: SOption[];
}

export interface SLatencyQuestion {
  id: string;
  type: 'latency';
  prompt: string;
  countdownMs: number;
  options: SOption[];
}

export interface STempoQuestion {
  id: string;
  type: 'tempo';
  prompt: string;
  /** 待排序词条 */
  items: string[];
  /** 预设的"模式 → S 向量"匹配表 */
  patterns: Array<{
    /** 命中条件：把命中函数序列化成可读规则 */
    rule:
      | { kind: 'firstNContains'; n: number; needle: string }
      | { kind: 'firstIs'; needle: string }
      | { kind: 'adjacent'; a: string; b: string; allowBetween: 0 | 1 };
    sVector: number;
  }>;
  /** 高犹豫加成阈值（拖动总次数 ≥ 此值时） */
  highHesitationThreshold: number;
  /** 高犹豫加成 S 向量 */
  highHesitationBonus: number;
}

export type SQuestion = SAssociationQuestion | SLatencyQuestion | STempoQuestion;

// ─────────────────────────────────────────────────────────
// 题库
// ─────────────────────────────────────────────────────────

export const S_AXIS_QUESTIONS: readonly SQuestion[] = [
  // ── 题型 A · 联想题（6 题） ─────────────────────────────
  {
    id: 'S-Q1',
    type: 'association',
    anchorKind: 'word',
    anchor: '窗',
    prompt: '你脑子里第一个冒出来的画面是？',
    countdownMs: 3000,
    options: [
      { key: 'A', label: '凌晨没拉的窗帘', sVector: 3 },
      { key: 'B', label: '飞机舷窗外的云', sVector: 2 },
      { key: 'C', label: '朋友家厨房的小窗', sVector: 1 },
      { key: 'D', label: '一个没有特别画面的窗', sVector: -2 },
    ],
  },
  {
    id: 'S-Q2',
    type: 'association',
    anchorKind: 'color',
    anchor: '#E0303F',
    prompt: '你脑子里第一个冒出来的不是颜色，是什么？',
    countdownMs: 3000,
    options: [
      { key: 'A', label: '一种声音（呼喊 / 心跳 / 警报）', sVector: 3 },
      { key: 'B', label: '一个东西（消防栓 / 红包 / 番茄）', sVector: 1 },
      { key: 'C', label: '一种情绪（生气 / 兴奋 / 喜庆）', sVector: 2 },
      { key: 'D', label: '还是颜色，没别的', sVector: -3 },
    ],
  },
  {
    id: 'S-Q3',
    type: 'association',
    anchorKind: 'shape',
    anchor: 'floating-shape',
    prompt: '屏幕上一个轻轻浮动的形状，你最先联想到的画面是？',
    countdownMs: 3000,
    options: [
      { key: 'A', label: '海上漂着的小船，没人', sVector: 3 },
      { key: 'B', label: '太空里失重的宇航员', sVector: 2 },
      { key: 'C', label: '游泳池里的浮板', sVector: 1 },
      { key: 'D', label: '没什么场景，就一个浮的东西', sVector: -2 },
    ],
  },
  {
    id: 'S-Q4',
    type: 'association',
    anchorKind: 'word',
    anchor: '门',
    prompt: '门后最先出现的是？',
    countdownMs: 3000,
    options: [
      { key: 'A', label: '一段我没经历过的过去', sVector: 3 },
      { key: 'B', label: '一个具体认识的人', sVector: 0 },
      { key: 'C', label: '一个房间，但是空的', sVector: 1 },
      { key: 'D', label: '没多想，门就是门', sVector: -3 },
    ],
  },
  {
    id: 'S-Q5',
    type: 'association',
    anchorKind: 'sound',
    anchor: '📞 铃响了',
    prompt: '你的第一反应是？',
    countdownMs: 3000,
    options: [
      { key: 'A', label: '想象电话那头是谁', sVector: 2 },
      { key: 'B', label: '想象一个不接电话的场景', sVector: 3 },
      { key: 'C', label: '想接，但不知道说什么', sVector: 1 },
      { key: 'D', label: '没什么反应', sVector: -2 },
    ],
  },
  {
    id: 'S-Q6',
    type: 'association',
    anchorKind: 'shape',
    anchor: 'white-room',
    prompt: '你最先想往一个纯白房间里放什么？',
    countdownMs: 3000,
    options: [
      { key: 'A', label: '一个人，但看不清脸', sVector: 3 },
      { key: 'B', label: '一些植物 / 物件', sVector: 1 },
      { key: 'C', label: '不放东西，让它空着', sVector: -1 },
      { key: 'D', label: '想关掉这个房间', sVector: -3 },
    ],
  },

  // ── 题型 B · 反应时题（4 题） ───────────────────────────
  {
    id: 'S-Q7',
    type: 'latency',
    prompt: '5 秒内点一个离你"最近"的声音',
    countdownMs: 5000,
    options: [
      { key: 'A', label: '雨打窗户', sVector: 2 },
      { key: 'B', label: '地铁报站', sVector: -2 },
      { key: 'C', label: '远处吹的风', sVector: 3 },
      { key: 'D', label: '自己心跳的声音', sVector: 1 },
    ],
  },
  {
    id: 'S-Q8',
    type: 'latency',
    prompt: '5 秒内点一个离你"最近"的动作',
    countdownMs: 5000,
    options: [
      { key: 'A', label: '把头埋在被子里', sVector: 2 },
      { key: 'B', label: '划手机划到反应不过来', sVector: 1 },
      { key: 'C', label: '写一行待办划掉', sVector: -3 },
      { key: 'D', label: '站着发呆', sVector: 3 },
    ],
  },
  {
    id: 'S-Q9',
    type: 'latency',
    prompt: '5 秒内点一种离你"最近"的空气',
    countdownMs: 5000,
    options: [
      { key: 'A', label: '半夜的阳台', sVector: 3 },
      { key: 'B', label: '商场中央空调', sVector: -2 },
      { key: 'C', label: '长途车窗外的风', sVector: 2 },
      { key: 'D', label: '办公室打印机旁', sVector: -3 },
    ],
  },
  {
    id: 'S-Q10',
    type: 'latency',
    prompt: '5 秒内点一种离你"最近"的颜色',
    countdownMs: 5000,
    options: [
      { key: 'A', label: '雾蓝', sVector: 3 },
      { key: 'B', label: '暖米', sVector: 0 },
      { key: 'C', label: '深绿', sVector: 1 },
      { key: 'D', label: '中性灰', sVector: -3 },
    ],
  },

  // ── 题型 C · 节奏 / 排序题（2 题） ──────────────────────
  {
    id: 'S-Q11',
    type: 'tempo',
    prompt: '把它们排成你"今晚"的顺序',
    items: [
      '灯灭',
      '一段没听完的歌',
      '想起一件没回的消息',
      '翻一下手机相册',
      '真的睡着',
    ],
    patterns: [
      { rule: { kind: 'firstNContains', n: 2, needle: '想起一件没回的消息' }, sVector: 2 },
      { rule: { kind: 'firstNContains', n: 2, needle: '翻一下手机相册' }, sVector: 1 },
      { rule: { kind: 'adjacent', a: '灯灭', b: '真的睡着', allowBetween: 0 }, sVector: -3 },
    ],
    highHesitationThreshold: 8,
    highHesitationBonus: 1,
  },
  {
    id: 'S-Q12',
    type: 'tempo',
    prompt: '把它们排成你"理想周末"的顺序',
    items: [
      '一个人散步 1 小时',
      '和朋友吃一顿饭',
      '看一部之前一直想看的片',
      '睡到自然醒',
      '写一段不发出去的字',
    ],
    patterns: [
      { rule: { kind: 'firstNContains', n: 3, needle: '写一段不发出去的字' }, sVector: 3 },
      { rule: { kind: 'firstIs', needle: '和朋友吃一顿饭' }, sVector: -2 },
      // 复合：第 1 是"睡到自然醒" + 第 2 是"一个人散步 1 小时"
      { rule: { kind: 'firstIs', needle: '睡到自然醒' }, sVector: 1 },
      { rule: { kind: 'firstNContains', n: 2, needle: '一个人散步 1 小时' }, sVector: 1 },
    ],
    highHesitationThreshold: 8,
    highHesitationBonus: 1,
  },
];

export function getSQuestionById(id: string): SQuestion | undefined {
  return S_AXIS_QUESTIONS.find((q) => q.id === id);
}
