/**
 * 命理引擎 v0 · pure functions, 0 LLM, 0 third-party runtime.
 *
 * W2 范围：紫微 14 主星静态查表 + 当日塔罗能量解读（已由 daily-card 提供，
 * 此处只做"翻译层"——把抽到的牌 + 当天主导主星，写成一段 italic "她的语言"）。
 *
 * 设计原则（见 docs/01-strategy/mingli-engine-research-2026-05-08.md）：
 *  - 内核（坐标）≠ 翻译层（语言）。
 *  - 翻译层每个坐标必须有 ≥3 句备选，避免每天千篇一律。
 *  - 不收集姓名 / 身份证 / 出生证号；只接受可选 birthMonth (1-12)。
 *  - 不打"AI 算命师"标签，不展示"准确率"话术。
 *  - 永远以娱乐与自我观察为前提。
 */

/** 紫微斗数 14 主星 · 中州派惯用名 */
export type ZiweiMainStar =
  | 'ziwei'      // 紫微
  | 'tianji'     // 天机
  | 'taiyang'    // 太阳
  | 'wuqu'       // 武曲
  | 'tiantong'   // 天同
  | 'lianzhen'   // 廉贞
  | 'tianfu'     // 天府
  | 'taiyin'     // 太阴
  | 'tanlang'    // 贪狼
  | 'jumen'      // 巨门
  | 'tianxiang'  // 天相
  | 'tianliang'  // 天梁
  | 'qisha'      // 七杀
  | 'pojun';     // 破军

export const ZIWEI_STARS: ZiweiMainStar[] = [
  'ziwei', 'tianji', 'taiyang', 'wuqu', 'tiantong', 'lianzhen', 'tianfu',
  'taiyin', 'tanlang', 'jumen', 'tianxiang', 'tianliang', 'qisha', 'pojun',
];

/** 主星显示名 */
export const ZIWEI_STAR_LABEL: Record<ZiweiMainStar, string> = {
  ziwei: '紫微', tianji: '天机', taiyang: '太阳', wuqu: '武曲',
  tiantong: '天同', lianzhen: '廉贞', tianfu: '天府', taiyin: '太阴',
  tanlang: '贪狼', jumen: '巨门', tianxiang: '天相', tianliang: '天梁',
  qisha: '七杀', pojun: '破军',
};

/**
 * 当日主导主星 · 由日期 deterministic 选出。
 * 这是 v0 的简化：v1 才会真做盘。
 *
 * 公式：YYYYMMDD 字符和 % 14。
 */
export function getDailyStar(date?: Date): ZiweiMainStar {
  const d = date ?? new Date();
  const key = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
  return ZIWEI_STARS[hash % 14];
}

/**
 * 翻译层 · 14 主星 × 3 句 = 42 条编辑部语。
 *
 * 选词规则（编辑部 SOP）：
 *  - 不出现"贵人""化禄""官禄宫"等黑话直出。
 *  - 每句包含一个具体可感的动作或场景。
 *  - 一句话 ≤ 30 字，便于 italic 排版。
 */
const STAR_LINES: Record<ZiweiMainStar, [string, string, string]> = {
  ziwei: [
    '今天适合站在镜子前，把肩膀放平。',
    '把那件你一直没穿的"太郑重"的衣服穿出门。',
    '允许自己做一次决定者，而不是参考者。',
  ],
  tianji: [
    '心里转得太快的那个想法，写下来再判断。',
    '今天的灵感像电梯，错过一班还有下一班。',
    '把"再想想"换成"先做一个小版本"。',
  ],
  taiyang: [
    '把窗帘拉开十厘米，光会自己走进来。',
    '今天适合替别人说一句他没说出口的好话。',
    '允许自己被看见，包括那些没那么完美的部分。',
  ],
  wuqu: [
    '把今天要花的钱列在纸上，三行就够。',
    '该收的尾款，今天发那条消息出去。',
    '一件"差不多算了"的事，做到完工。',
  ],
  tiantong: [
    '给自己留一段不被打扰的二十分钟。',
    '今天可以不回那条让你纠结很久的消息。',
    '把"应该"换成"我想要"，试试看舌头怎么说。',
  ],
  lianzhen: [
    '一段感情里，今天值得问一句"我们还好吗"。',
    '把那条没发出去的诚实，今天发出去。',
    '允许自己心动一次，不必立刻判断对错。',
  ],
  tianfu: [
    '今天先把家里的桌面整理一下，再谈别的。',
    '把那笔小积蓄看一眼，给自己一种踏实感。',
    '该接的好意，今天大方地说"谢谢"。',
  ],
  taiyin: [
    '晚上早一点关灯，月亮在替你做事。',
    '想念的那个人，今天可以用文字告诉她。',
    '允许自己安静一天，不一定要"产出"什么。',
  ],
  tanlang: [
    '今天试一种没吃过的味道，或者走一条新路。',
    '把"喜欢"说出口，不用解释为什么。',
    '允许自己贪心一次，比如多睡半小时。',
  ],
  jumen: [
    '把那句"算了"的话，今天换种方式说出来。',
    '避免在情绪高的时候按"发送"。',
    '今天适合做听众，比说话有力量。',
  ],
  tianxiang: [
    '今天替自己当一回"经纪人"，谈一次条件。',
    '把那份你帮别人写的方案，先用在自己身上。',
    '允许自己得体地拒绝一件事。',
  ],
  tianliang: [
    '今天可以打电话回家，问一句"你最近怎么样"。',
    '把那件"以后再做"的事，挪到今天的清单上。',
    '允许自己被照顾，不一定每次都要当大人。',
  ],
  qisha: [
    '今天适合做一个"砍掉"的决定，而不是"加上"。',
    '把那段拖了太久的关系或合作，今天定个期限。',
    '允许自己说"不"，不必附加冗长的理由。',
  ],
  pojun: [
    '今天可以把抽屉清空一次，哪怕只是一个。',
    '一个旧习惯今天先"暂停"一天看看。',
    '允许自己重新开始，不必先告诉所有人。',
  ],
};

/**
 * 给 daily-card 写一段 italic 引子。
 * @param date 当天日期
 * @param seedSalt 可选盐，用来在同一天为不同用户/卡片产生不同句子（默认按日期）
 */
export function getDailyStarLine(date?: Date, seedSalt = ''): {
  star: ZiweiMainStar;
  starLabel: string;
  line: string;
} {
  const star = getDailyStar(date);
  const lines = STAR_LINES[star];
  const d = date ?? new Date();
  const saltKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${seedSalt}`;
  let hash = 0;
  for (let i = 0; i < saltKey.length; i++) hash += saltKey.charCodeAt(i);
  return {
    star,
    starLabel: ZIWEI_STAR_LABEL[star],
    line: lines[hash % 3],
  };
}

/**
 * 完整翻译层快照（admin 工具或 MingLi-Bench 用）。
 */
export function getStarLines(star: ZiweiMainStar): readonly string[] {
  return STAR_LINES[star];
}
