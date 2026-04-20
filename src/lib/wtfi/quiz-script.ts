/**
 * quiz-script.ts · 题目 ↔ 题型映射 manifest
 *
 * 让现有 dimension/answer 系统保持不变 — 这里只声明
 * "某题应当用哪种 quiz-format 形式呈现"，由 Quiz 容器读取后切换组件。
 *
 * 默认 fallback 是 'classic'（即现有 ABC 三选一）。
 */

export type QuizFormat =
  | 'classic'
  | 'either-or-planets' // F1
  | 'polaroid-stack' // F2
  | 'mirror-slider' // F3
  | 'tarot-pull' // F4
  | 'two-am-text' // F5
  | 'vinyl-drop' // F6
  | 'color-drip' // F7
  | 'whisper-input'; // F8

export type CeremonyType =
  | 'sanctum-gate' // C1
  | 'sigil-sketching' // C2
  | 'stardust-sealing'; // C3

export interface QuestionFormatHint {
  /** 现有题号 / soul-probe id */
  questionId: number | string;
  format: QuizFormat;
  /** 与原题不同的 ritual 化 prompt 文案（不改打分） */
  ritualPromptOverride?: string;
  /** 自定义参数 — 由具体 format 自己消化 */
  formatProps?: Record<string, unknown>;
}

/**
 * 标准 wtfti / sbti 主测试的题型映射（M1 灰度池）
 * — 只覆盖少量先做迁移的题；其它仍走 classic。
 */
export const STANDARD_QUIZ_SCRIPT: QuestionFormatHint[] = [
  // 示例：把 So1（社交主动性）的两道二元题升到 F1 双行星
  { questionId: 35, format: 'either-or-planets' },
  { questionId: 36, format: 'either-or-planets' },
  // 价值观排序题升到 F2
  { questionId: 12, format: 'polaroid-stack' },
  // 连续光谱题升到 F3
  { questionId: 18, format: 'mirror-slider' },
];

/**
 * Soul Probe 6 题的形式分配
 * — M2 阶段把 music/color 升到 F6/F7
 */
export const SOUL_PROBE_FORMAT: Record<string, QuizFormat> = {
  music: 'vinyl-drop',
  color: 'color-drip',
  quote: 'polaroid-stack',
  cinema: 'either-or-planets',
  scent: 'classic',
  touch: 'classic',
};

/**
 * 章节级仪式编排 — 按测试流程顺序
 */
export interface CeremonyHint {
  /** 在第几题之前插入；0 = 测试最开始；-1 = 全部题之后 */
  beforeQuestionIndex: number | -1;
  type: CeremonyType;
}

export const STANDARD_CEREMONIES: CeremonyHint[] = [
  { beforeQuestionIndex: 0, type: 'sanctum-gate' },
  // 三分之二处插入 Sigil Sketching
  { beforeQuestionIndex: 14, type: 'sigil-sketching' },
  // 末尾封信
  { beforeQuestionIndex: -1, type: 'stardust-sealing' },
];

export function getFormatForQuestion(
  questionId: number | string,
  fallback: QuizFormat = 'classic',
): QuizFormat {
  const hint = STANDARD_QUIZ_SCRIPT.find((h) => h.questionId === questionId);
  return hint?.format ?? fallback;
}

export function getSoulProbeFormat(probeId: string): QuizFormat {
  return SOUL_PROBE_FORMAT[probeId] ?? 'classic';
}
