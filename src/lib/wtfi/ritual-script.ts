/**
 * Ritual Quiz Script · WTFTI 主测仪式编排
 *
 * 战略来源：
 *   - docs/01-strategy/wtfti-ritual-quiz-grammar-2026-04-20.md §4 章节流
 *   - docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §7 90 秒情绪编排
 *
 * 设计：
 *   1. 输入：经过 shuffleQuestions(QUESTIONS, 2) 之后的 ~30 题主题库
 *   2. 输出：一份按四章节 + 三道仪式 + 6 道灵魂探针拼装的 ritual 时间线
 *   3. 不破坏 calculateResult() 既有评分（仍然喂入完整问题集 + 完整 answers Map）
 *   4. format hint 仅决定渲染样式，不影响计分
 */

import type { ChapterTone } from '@/components/quiz-formats';
import type { Question } from '@/lib/questions';

export type QuizFormatHint =
  | 'classic-abc'        // 默认 — 三按钮 ABC（最基础）
  | 'either-or-planets'  // F1 双行星
  | 'mirror-slider'      // F3 镜面滑杆
  | 'two-am-text'        // F5 凌晨短信
  | 'tarot-pull'         // F4 塔罗抽牌
  | 'polaroid-stack';    // F2 拍立得堆叠

export interface RitualChapter {
  /** 章节序号 I/II/III/IV */
  numeral: 'I' | 'II' | 'III' | 'IV';
  /** 章节英文 eyebrow */
  eyebrow: string;
  /** 章节中文标题 */
  title: string;
  /** 章节副标题 */
  subtitle?: string;
  /** ChapterShell 调色 */
  tone: ChapterTone;
  /** 主测题占比（0-1）— 用于把 shuffled 主题切片 */
  share: number;
  /** 该章节内每题的 format 选择策略 */
  pickFormat: (questionInChapter: Question, indexInChapter: number) => QuizFormatHint;
}

/**
 * 四章节定义。share 总和必须 === 1。
 */
export const RITUAL_CHAPTERS: RitualChapter[] = [
  {
    numeral: 'I',
    eyebrow: 'PHYSICS · GRAVITY · 引力轴',
    title: '众神先看见你的引力',
    subtitle: '你是被靠近的那种人，还是绕轨而行的那种人？',
    tone: 'rose',
    share: 0.32,
    pickFormat: (_, idx) => {
      if (idx === 0) return 'either-or-planets';
      if (idx === 2) return 'mirror-slider';
      return 'classic-abc';
    },
  },
  {
    numeral: 'II',
    eyebrow: 'PSYCHE · SHADOW · 暗面之井',
    title: '现在召唤你的暗面化身',
    subtitle: '你压在最深处的那道光，是哪一族异能者的？',
    tone: 'twilight',
    share: 0.22,
    pickFormat: (_, idx) => {
      if (idx === 0) return 'two-am-text';
      if (idx === 2) return 'tarot-pull';
      return 'classic-abc';
    },
  },
  {
    numeral: 'III',
    eyebrow: 'MYTH · THREADS · 命运织线',
    title: '你和世界之间的织法',
    subtitle: '你绕着谁公转，又把谁拉进自己的轨道？',
    tone: 'gold',
    share: 0.46,
    pickFormat: (_, idx) => {
      if (idx === 0) return 'polaroid-stack';
      if (idx === 3) return 'mirror-slider';
      return 'classic-abc';
    },
  },
];

/**
 * 把 shuffled 题目集按 share 分成 3 个章节切片。
 * 第 4 章（灵魂探针）由 SoulProbeQuiz 单独处理，不消耗主题库。
 */
export function sliceQuestionsByChapter(questions: Question[]): Question[][] {
  const total = questions.length;
  const slices: Question[][] = [];
  let cursor = 0;
  for (let i = 0; i < RITUAL_CHAPTERS.length; i++) {
    const isLast = i === RITUAL_CHAPTERS.length - 1;
    const len = isLast
      ? total - cursor
      : Math.max(1, Math.round(total * RITUAL_CHAPTERS[i].share));
    slices.push(questions.slice(cursor, cursor + len));
    cursor += len;
  }
  return slices;
}

/**
 * meme 题（§7 第 ④ 节）— 凌晨 3 点你脑里在演哪部电影
 * 这道题不进 calculateResult；仅用于情绪起伏，答案在本地丢弃。
 */
export const MEME_QUESTION = {
  prompt: '凌晨 3 点，你脑子里正在循环播放的，是哪一部电影？',
  hint: '随便选 — 这题不算分，但能告诉我们你的暗面频率。',
  options: [
    { key: 'A', label: '王家卫 · 重庆森林', blurb: '霓虹潮湿，谁都没真的爱过谁。' },
    { key: 'B', label: '周星驰 · 大话西游', blurb: '一万年那么长，但没关系，先笑。' },
    { key: 'C', label: '黑泽明 · 罗生门', blurb: '没有真相，只有四种讲法。' },
    { key: 'D', label: '蔡明亮 · 爱情万岁', blurb: '安静到能听见自己呼吸塌下来。' },
  ],
} as const;
