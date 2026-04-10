import type { ModelType } from './dimensions';

export interface Question {
  id: number;
  text: string;
  dimension: string;
  model: ModelType;
  reversed: boolean;
  isDrinkTrigger?: boolean;
  isDrinkBranch?: boolean;
}

export const QUESTIONS: Question[] = [
  // ── 自我模型 (Self) ──
  { id: 1, text: '照镜子的时候，我觉得自己还挺好看的。', dimension: 'S1', model: 'self', reversed: false },
  { id: 2, text: '就算被当面否定，我也不太会怀疑自己。', dimension: 'S1', model: 'self', reversed: false },
  { id: 3, text: '我很清楚自己讨厌什么样的人。', dimension: 'S2', model: 'self', reversed: false },
  { id: 4, text: '被问"你是什么样的人"时，我不需要想太久。', dimension: 'S2', model: 'self', reversed: false },
  { id: 5, text: '外人的评价对我来说无所吊谓。', dimension: 'S3', model: 'self', reversed: false },
  { id: 6, text: '我经常为了一个目标而主动吃苦。', dimension: 'S3', model: 'self', reversed: false },

  // ── 情感模型 (Emotion) ──
  { id: 7, text: '另一半没回消息，我不会立刻脑补 ta 在做什么。', dimension: 'E1', model: 'emotion', reversed: false },
  { id: 8, text: '恋爱中我几乎不会翻对方手机。', dimension: 'E1', model: 'emotion', reversed: false },
  { id: 9, text: '喜欢一个人的时候，我会毫无保留地对 ta 好。', dimension: 'E2', model: 'emotion', reversed: false },
  { id: 10, text: '我为感情掉过的眼泪，比为工作多得多。', dimension: 'E2', model: 'emotion', reversed: false },
  { id: 11, text: '谈恋爱可以，但别占用我太多个人时间。', dimension: 'E3', model: 'emotion', reversed: false },
  { id: 12, text: '我可以很爱一个人，但绝不会因此失去自己。', dimension: 'E3', model: 'emotion', reversed: false },

  // ── 态度模型 (Attitude) ──
  { id: 13, text: '我相信大部分人心底还是善良的。', dimension: 'A1', model: 'attitude', reversed: false },
  { id: 14, text: '吃亏了也不太往坏处想，可能对方不是故意的。', dimension: 'A1', model: 'attitude', reversed: false },
  { id: 15, text: '排队有人插队，我一定会当场说出来。', dimension: 'A2', model: 'attitude', reversed: false },
  { id: 16, text: '做事之前我喜欢先列个清单。', dimension: 'A2', model: 'attitude', reversed: false },
  { id: 17, text: '我觉得人活着总得有点为之奋斗的东西。', dimension: 'A3', model: 'attitude', reversed: false },
  { id: 18, text: '有时候会突然觉得"活着到底为了什么"。', dimension: 'A3', model: 'attitude', reversed: true },

  // ── 行动驱力模型 (Action) ──
  { id: 19, text: '比起避免翻车，我更想追求极致。', dimension: 'Ac1', model: 'action', reversed: false },
  { id: 20, text: '看到别人做得好，我会被点燃而不是酸。', dimension: 'Ac1', model: 'action', reversed: false },
  { id: 21, text: '做决定的时候我很少犹豫超过三秒。', dimension: 'Ac2', model: 'action', reversed: false },
  { id: 22, text: '点菜的时候我经常翻来覆去拿不定主意。', dimension: 'Ac2', model: 'action', reversed: true },
  { id: 23, text: '说干就干是我的风格。', dimension: 'Ac3', model: 'action', reversed: false },
  { id: 24, text: '事情不做完我会一直惦记着。', dimension: 'Ac3', model: 'action', reversed: false },

  // ── 社交模型 (Social) ──
  { id: 25, text: '聚会的时候，我经常是主动找人聊天的那个。', dimension: 'So1', model: 'social', reversed: false },
  { id: 26, text: '看到有趣的陌生人，我会想主动打招呼。', dimension: 'So1', model: 'social', reversed: false },
  { id: 27, text: '关系再好也不能随便动我东西。', dimension: 'So2', model: 'social', reversed: false },
  { id: 28, text: '能保持距离的关系，反而让我更舒服。', dimension: 'So2', model: 'social', reversed: false },
  { id: 29, text: '在不同人面前，我的性格基本一样。', dimension: 'So3', model: 'social', reversed: false },
  { id: 30, text: '我说话比较直，想到什么说什么。', dimension: 'So3', model: 'social', reversed: false },

  // ── 隐藏触发题 ──
  { id: 31, text: '你平时喝酒吗？', dimension: 'S1', model: 'self', reversed: false, isDrinkTrigger: true },

  // ── 饮酒分支 ──
  { id: 32, text: '喝了酒之后，我会变成完全不同的一个人。', dimension: 'So3', model: 'social', reversed: true, isDrinkBranch: true },
];

export function shuffleQuestions(questions: Question[]): Question[] {
  const main = questions.filter(q => !q.isDrinkBranch);
  const shuffled = [...main];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
