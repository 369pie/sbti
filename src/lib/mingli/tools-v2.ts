/**
 * 命理引擎 · v2 推理规则工具栈
 *
 * W5 · E5.3 ——「自研双层架构」的"翻译/推理层"。
 * 在 v1 的原子工具（src/lib/mingli/tools.ts）之上，组合出"行业内部推理技法"。
 * 这一层依旧是**确定性纯函数 + 编辑部审过的预设短语库**，不调用 LLM；
 * 但每个工具都已被组织成"可由 sub-agent 按需调用"的规范形式。
 *
 * 结构：
 *   A. 紫微推理（trine 化忌冲克 / 主辅相位 / 大限流年隐喻）
 *   B. 八字推理（日主旺衰 / 用神方向 / 五行调候）
 *   C. 合参（紫微 + 八字 + 月相 → 三派意见）
 *   D. 翻译（编辑部 italic 引子片段 · 不出现"准确率"/"问事咨询"）
 *   E. 自评 + 多流派合参（sub-agent self-eval scaffold）
 *
 * 不包含：用户名 / 真实生辰 / 命运结论。所有输出都是"维度 + 引子"，
 * 让用户继续往下写——这才是「她的星图档案」的产品姿态。
 */

import {
  dayStem,
  dayBranch,
  todayPalace,
  trineStars,
  todayWuxingMix,
  wuxingPolarity,
  type WuXing,
  type Palace,
  type HeavenlyStem,
  type EarthlyBranch,
} from './tools';
import { ZIWEI_STAR_LABEL, type ZiweiMainStar } from './engine';

// ─────────────────────────────────────────────────────────────────────────────
// A. 紫微推理（10 条）
// ─────────────────────────────────────────────────────────────────────────────

/** A1 · 主星 + 三方四正 → 气场强度（v0：成员中是否含杀破狼） */
export function isAggressivePattern(star: ZiweiMainStar): boolean {
  const trine = trineStars(star);
  const tag = new Set(['qisha', 'pojun', 'tanlang']);
  return tag.has(star) || trine.some((s) => tag.has(s));
}

/** A2 · 主星 + 三方四正 → 是否"建造型"（紫府武） */
export function isBuilderPattern(star: ZiweiMainStar): boolean {
  const trine = trineStars(star);
  const tag = new Set(['ziwei', 'tianfu', 'wuqu']);
  return tag.has(star) || trine.filter((s) => tag.has(s)).length >= 2;
}

/** A3 · 主星 + 今日宫位 → 隐喻位（v0 表） */
const PALACE_HINT: Record<Palace, string> = {
  命宫: '今日的"我"被推到台前，适合自己定调',
  兄弟宫: '同辈关系是今日的镜子',
  夫妻宫: '亲密关系里有未拆开的话',
  子女宫: '创造与延续，今日有续写空间',
  财帛宫: '今日的力气更容易兑换成"看得见的事"',
  疾厄宫: '身体先一步知道，听它的',
  迁移宫: '换个地方/换个动作，今日更顺',
  交友宫: '今日的回声在外人那里',
  事业宫: '把决定留到工作里做',
  田宅宫: '回到熟悉的地方再决定',
  福德宫: '让自己舒服一点，不是浪费',
  父母宫: '上一代的回声今日比平时大',
};
export function palaceHint(palace: Palace): string {
  return PALACE_HINT[palace];
}

/** A4 · 主星 → 化禄 / 化权 / 化科 / 化忌 之"今日偏向"（v0 简化轮转） */
const SIHUA = ['禄', '权', '科', '忌'] as const;
export type Sihua = (typeof SIHUA)[number];
export function todaySihua(star: ZiweiMainStar, date: Date = new Date()): Sihua {
  const seed = `${star}|${date.toISOString().slice(0, 10)}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return SIHUA[Math.abs(h) % 4];
}

/** A5 · 化忌冲克：忌的隐喻 */
const SIHUA_HINT: Record<Sihua, string> = {
  禄: '今日有一个"被给到"的小礼物，留心接住',
  权: '今日的话比平时更有重量，慎选要拿来用在哪里',
  科: '今日适合让一件事被看见——文字 / 作品 / 一句承认',
  忌: '今日有一处堵——堵不一定要打通，能绕开也是答案',
};
export function sihuaHint(sihua: Sihua): string {
  return SIHUA_HINT[sihua];
}

/** A6 · 主星 + 化忌 → 今日"不要做的事"短语（编辑部预设） */
const NOT_TODAY: Partial<Record<ZiweiMainStar, string>> = {
  taiyin: '今日不要把决定放到深夜做',
  taiyang: '今日不要把火气当作沟通',
  qisha: '今日不要把"想结束一切"当作结论',
  pojun: '今日不要为"破"而破，停一停',
  jumen: '今日不要在群里把话说清楚——留到 1on1',
  tanlang: '今日不要把"再多一点"当成原则',
  tianxiang: '今日不要替别人把决定也做了',
};
export function todayAvoid(star: ZiweiMainStar): string | null {
  return NOT_TODAY[star] ?? null;
}

/** A7 · 主星组合 → "可以和谁靠近"（编辑部预设） */
const COMPANION: Partial<Record<ZiweiMainStar, string>> = {
  taiyin: '今日可以和"安静而稳"的人坐一会儿',
  tiantong: '今日可以和"懂得照顾自己"的人吃饭',
  tianliang: '今日可以和"长辈感"的朋友聊天',
  tianji: '今日可以和"会问问题"的人散步',
  ziwei: '今日可以和"敢做决定"的人合作',
};
export function todayCompanion(star: ZiweiMainStar): string | null {
  return COMPANION[star] ?? null;
}

/** A8 · 月相进度（v0 用日期模 30）→ "本月情绪节拍"标签 */
export function moonPhaseLabel(date: Date = new Date()): string {
  const d = date.getUTCDate();
  if (d <= 5) return '初月 · 朔';
  if (d <= 12) return '上弦 · 望前';
  if (d <= 18) return '满月 · 望';
  if (d <= 24) return '下弦 · 缺始';
  return '残月 · 缺末';
}

/** A9 · 主星 + 月相 → 给本月一个"主题动词" */
const MONTHLY_VERB: Partial<Record<string, string>> = {
  'taiyin|初月 · 朔': '收纳',
  'taiyang|满月 · 望': '宣告',
  'qisha|残月 · 缺末': '收尾',
  'pojun|上弦 · 望前': '改写',
  'tianxiang|满月 · 望': '主持',
  'tianji|初月 · 朔': '策动',
};
export function monthlyVerb(star: ZiweiMainStar, date: Date = new Date()): string {
  const moon = moonPhaseLabel(date);
  return MONTHLY_VERB[`${star}|${moon}`] ?? '观察';
}

/** A10 · 主星 → 三方四正中文短描述 */
export function trineNarrative(star: ZiweiMainStar): string {
  const trine = trineStars(star);
  const names = [star, ...trine].map((s) => ZIWEI_STAR_LABEL[s]).join(' · ');
  return `${names}（合参成组）`;
}

// ─────────────────────────────────────────────────────────────────────────────
// B. 八字推理（5 条 · v0 简化）
// ─────────────────────────────────────────────────────────────────────────────

/** 干 → 五行 */
const STEM_WUXING: Record<HeavenlyStem, WuXing> = {
  甲: 'wood',
  乙: 'wood',
  丙: 'fire',
  丁: 'fire',
  戊: 'earth',
  己: 'earth',
  庚: 'metal',
  辛: 'metal',
  壬: 'water',
  癸: 'water',
};

/** 支 → 五行（地支主气） */
const BRANCH_WUXING: Record<EarthlyBranch, WuXing> = {
  子: 'water',
  丑: 'earth',
  寅: 'wood',
  卯: 'wood',
  辰: 'earth',
  巳: 'fire',
  午: 'fire',
  未: 'earth',
  申: 'metal',
  酉: 'metal',
  戌: 'earth',
  亥: 'water',
};

/** B1 · 公历日主五行（v0 简化：日干五行） */
export function dayMasterWuxing(date: Date = new Date()): WuXing {
  return STEM_WUXING[dayStem(date)];
}

/** B2 · 用神方向：日主与今日五行最盛者的相生/相克 → 一个方向词 */
export function favorableDirection(date: Date = new Date()): string {
  const master = dayMasterWuxing(date);
  const mix = todayWuxingMix(date);
  const { strongest } = wuxingPolarity(mix);
  if (strongest === master) return '今日同我，宜守不宜出';
  if (RELATION[master]?.generates === strongest) return '我生之物当令，宜把力气放在"产出"';
  if (RELATION[strongest]?.generates === master) return '生我之物当令，宜接受、求助、被滋养';
  if (RELATION[master]?.controls === strongest) return '我克之物当令，宜主动、设定边界';
  if (RELATION[strongest]?.controls === master) return '克我之物当令，宜避锋、暂缓、休养';
  return '今日五行平和，宜按计划行事';
}

const RELATION: Record<WuXing, { generates: WuXing; controls: WuXing }> = {
  wood: { generates: 'fire', controls: 'earth' },
  fire: { generates: 'earth', controls: 'metal' },
  earth: { generates: 'metal', controls: 'water' },
  metal: { generates: 'water', controls: 'wood' },
  water: { generates: 'wood', controls: 'fire' },
};

/** B3 · 调候建议：根据缺位五行给生活动作 */
const TUNING: Record<WuXing, string> = {
  wood: '今日缺木：见绿色 / 翻一本书 / 走到树下',
  fire: '今日缺火：晒一会儿太阳 / 喝热的 / 给一个朋友打电话',
  earth: '今日缺土：吃一顿正经饭 / 整理桌面 / 不做决定',
  metal: '今日缺金：洗澡换衣 / 听一段没有人声的音乐 / 删一些东西',
  water: '今日缺水：泡脚 / 多喝水 / 写一段不发出去的话',
};
export function tuningSuggestion(date: Date = new Date()): string {
  const mix = todayWuxingMix(date);
  const { weakest } = wuxingPolarity(mix);
  return TUNING[weakest];
}

/** B4 · 日柱 → 一句"今日身体的话"（编辑部预设，按支） */
const BRANCH_BODY: Record<EarthlyBranch, string> = {
  子: '今日肾气当令，少熬夜',
  丑: '今日脾胃要被照顾',
  寅: '今日肝胆苏醒，适合做新的事',
  卯: '今日眼睛先累，少看屏幕',
  辰: '今日脾湿，少冷饮',
  巳: '今日心火上行，少争执',
  午: '今日心血最盛，午睡半小时',
  未: '今日脾胃想被宠，吃慢一点',
  申: '今日肺气强，深呼吸有用',
  酉: '今日肺主收，整理一件事',
  戌: '今日心包，照顾情绪',
  亥: '今日肾水回流，早睡',
};
export function bodyVoice(date: Date = new Date()): string {
  return BRANCH_BODY[dayBranch(date)];
}

/** B5 · 日干 + 日支 → "今日格局"短语（合并气） */
export function dayPattern(date: Date = new Date()): string {
  const stemWx = STEM_WUXING[dayStem(date)];
  const branchWx = BRANCH_WUXING[dayBranch(date)];
  if (stemWx === branchWx) return `${WUXING_LABEL[stemWx]}专气日 · 内外一致`;
  if (RELATION[stemWx].generates === branchWx) return `${WUXING_LABEL[stemWx]}生${WUXING_LABEL[branchWx]} · 输出日`;
  if (RELATION[branchWx].generates === stemWx) return `${WUXING_LABEL[branchWx]}养${WUXING_LABEL[stemWx]} · 被托日`;
  if (RELATION[stemWx].controls === branchWx) return `${WUXING_LABEL[stemWx]}克${WUXING_LABEL[branchWx]} · 主动日`;
  return `${WUXING_LABEL[branchWx]}克${WUXING_LABEL[stemWx]} · 隐忍日`;
}

const WUXING_LABEL: Record<WuXing, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// ─────────────────────────────────────────────────────────────────────────────
// C. 合参（紫微 + 八字 + 月相 → 三派意见）
// ─────────────────────────────────────────────────────────────────────────────

export type SchoolOpinion = {
  school: '紫微' | '八字' | '占星 (月相)';
  verdict: string;
  hint: string;
};

export function multiSchoolOpinions(
  star: ZiweiMainStar,
  date: Date = new Date(),
): SchoolOpinion[] {
  const sihua = todaySihua(star, date);
  const verb = monthlyVerb(star, date);
  return [
    {
      school: '紫微',
      verdict: `${ZIWEI_STAR_LABEL[star]}化${sihua}`,
      hint: sihuaHint(sihua),
    },
    {
      school: '八字',
      verdict: dayPattern(date),
      hint: favorableDirection(date),
    },
    {
      school: '占星 (月相)',
      verdict: `${moonPhaseLabel(date)} · 主题动词：${verb}`,
      hint: `本月把"${verb}"放在心里，做选择时回头问一遍`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// D. 翻译（编辑部 italic 引子片段，给「她的星图档案」拼装用）
// ─────────────────────────────────────────────────────────────────────────────

export type ChartDraftV2 = {
  // 内部坐标
  date: string;
  star: ZiweiMainStar;
  starLabel: string;
  palace: Palace;
  pattern: string;
  moon: string;
  // 三派
  opinions: SchoolOpinion[];
  // italic 文本拼装
  opening: string;
  middle: string;
  closing: string;
};

export function buildChartDraft(hash: string, date: Date = new Date()): ChartDraftV2 {
  const star = pickDailyStar(hash, date);
  const palace = todayPalace(hash, date);
  const opinions = multiSchoolOpinions(star, date);
  const tuning = tuningSuggestion(date);
  const body = bodyVoice(date);
  const avoid = todayAvoid(star);
  const companion = todayCompanion(star);

  const opening =
    `${ZIWEI_STAR_LABEL[star]}的女孩，今日落在${palace}。` +
    `${palaceHint(palace)}——${moonPhaseLabel(date)}。`;

  const middle =
    `三派合参：` +
    opinions.map((o) => `${o.school}说"${o.verdict}"——${o.hint}`).join('；') +
    '。';

  const tail = [tuning, body, avoid, companion].filter(Boolean).join(' · ');
  const closing = `今日的小处方：${tail}。`;

  return {
    date: date.toISOString().slice(0, 10),
    star,
    starLabel: ZIWEI_STAR_LABEL[star],
    palace,
    pattern: dayPattern(date),
    moon: moonPhaseLabel(date),
    opinions,
    opening,
    middle,
    closing,
  };
}

// 内部：从 hash 派一颗主星（不污染 v1 公共 API）
function pickDailyStar(hash: string, date: Date): ZiweiMainStar {
  const seed = `${hash}|${date.toISOString().slice(0, 10)}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const STARS: ZiweiMainStar[] = [
    'ziwei',
    'tianji',
    'taiyang',
    'wuqu',
    'tiantong',
    'lianzhen',
    'tianfu',
    'taiyin',
    'tanlang',
    'jumen',
    'tianxiang',
    'tianliang',
    'qisha',
    'pojun',
  ];
  return STARS[Math.abs(h) % STARS.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// E. 自评 scaffold（sub-agent self-eval, 不调 LLM；规则化打分）
// ─────────────────────────────────────────────────────────────────────────────

export type SelfEvalReport = {
  pass: boolean;
  score: number; // 0-100
  reasons: string[];
};

const FORBIDDEN = ['准确率', '问事咨询', 'AI算命师', 'AI 算命师', '保证', '一定会'];

/** 编辑部红线检查：草稿不应出现禁忌词 / 不应过短 / 三派意见缺失 */
export function selfEvalDraft(draft: ChartDraftV2): SelfEvalReport {
  const reasons: string[] = [];
  let score = 100;
  const blob = `${draft.opening}\n${draft.middle}\n${draft.closing}`;

  for (const word of FORBIDDEN) {
    if (blob.includes(word)) {
      score -= 40;
      reasons.push(`包含禁忌词「${word}」`);
    }
  }
  if (blob.length < 60) {
    score -= 20;
    reasons.push('草稿过短，可能未拼装');
  }
  if (draft.opinions.length < 3) {
    score -= 20;
    reasons.push('三派合参不完整');
  }
  if (!/[。！？]/.test(draft.closing)) {
    score -= 5;
    reasons.push('结尾缺标点收束');
  }
  if (score === 100) reasons.push('通过编辑部红线');

  return { pass: score >= 80, score: Math.max(0, score), reasons };
}

// ─────────────────────────────────────────────────────────────────────────────
// F. v2 工具注册表（暴露给 sub-agent）
// ─────────────────────────────────────────────────────────────────────────────

export const MINGLI_TOOLS_V2 = {
  isAggressivePattern,
  isBuilderPattern,
  palaceHint,
  todaySihua,
  sihuaHint,
  todayAvoid,
  todayCompanion,
  moonPhaseLabel,
  monthlyVerb,
  trineNarrative,
  dayMasterWuxing,
  favorableDirection,
  tuningSuggestion,
  bodyVoice,
  dayPattern,
  multiSchoolOpinions,
  buildChartDraft,
  selfEvalDraft,
} as const;

export type MingliToolV2Name = keyof typeof MINGLI_TOOLS_V2;

export const MINGLI_TOOLS_V2_DESCRIPTIONS: Record<MingliToolV2Name, string> = {
  isAggressivePattern: '主星 + 三方四正是否含杀破狼（A1）',
  isBuilderPattern: '主星 + 三方四正是否构成紫府武建造格（A2）',
  palaceHint: '今日宫位 → 一句隐喻短语（A3）',
  todaySihua: '主星 + 日期 → 化禄/化权/化科/化忌（A4）',
  sihuaHint: '化象 → 一句今日提示（A5）',
  todayAvoid: '主星 → "今日不要做的事"（A6）',
  todayCompanion: '主星 → "今日可以和谁靠近"（A7）',
  moonPhaseLabel: '日期 → 月相五段标签（A8）',
  monthlyVerb: '主星 + 月相 → 本月主题动词（A9）',
  trineNarrative: '主星 → 三方四正中文短描述（A10）',
  dayMasterWuxing: '日主五行（B1，v0 简化）',
  favorableDirection: '日主 vs 今日五行最盛 → 用神方向（B2）',
  tuningSuggestion: '调候：缺位五行 → 一句生活动作（B3）',
  bodyVoice: '日支 → 一句"今日身体的话"（B4）',
  dayPattern: '日柱 → "今日格局"短语（B5）',
  multiSchoolOpinions: '紫微 / 八字 / 占星 三派意见合参（C）',
  buildChartDraft: '拼装一份完整的「她的星图档案」草稿 v2（D）',
  selfEvalDraft: '编辑部红线 self-eval：禁忌词 / 长度 / 完整性（E）',
};
