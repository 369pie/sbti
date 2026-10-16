/**
 * 命理引擎 · v1 原子工具集
 *
 * W3 · E3.4 ——「自研双层架构」的"工具层"。
 * 这一层只做**确定性、纯函数**的命理运算/查表/格式化，**不调用 LLM**。
 * 后面 v2 的"翻译层"会把这些原子工具暴露给一个工具调用框架，
 * 由编辑部 prompt + LLM 决定调用哪些工具拼一份「她的星图档案」。
 *
 * 第一批共 10 个原子工具，覆盖核心 4 类：
 *   1) 时序  · time / week / sexagenary cycle
 *   2) 紫微  · 主星 / 三方四正 / 流年宫位（v0 已有 getDailyStar，这里给"宫位"维度）
 *   3) 五行  · 干支 → 五行；五行能量分布
 *   4) 翻译  · 把内部坐标 → 编辑部草稿（italic 引子片段，不是完整文章）
 *
 * 设计原则：
 *   - 输入要么是 Date，要么是稳定 hash；不接受自然语言。
 *   - 输出要么是 enum / 数值 / 数组，要么是已审过的预设短句；不输出未审字符串。
 *   - 任何工具都可被独立测试；不依赖运行环境。
 */

import {
  ZIWEI_STARS,
  ZIWEI_STAR_LABEL,
  getStarLines,
  getDailyStar,
  getDailyStarLine,
  type ZiweiMainStar,
} from './engine';

// ─────────────────────────────────────────────────────────────────────────────
// 1. 时序工具
// ─────────────────────────────────────────────────────────────────────────────

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

/** Tool 1 · 给出公历日的天干（仅供"今日色"等极简场景；非排盘级精度） */
export function dayStem(date: Date = new Date()): HeavenlyStem {
  // 简化算法：以 1900-01-01（甲戌日）作为参考起点。
  // 注意：v1 不追求八字真实日柱精度；那是 v2 排盘库的活。
  const REF = Date.UTC(1900, 0, 1); // 周一
  const days = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - REF) / 86400000);
  const index = ((days % 10) + 10) % 10;
  return HEAVENLY_STEMS[index];
}

/** Tool 2 · 给出公历日的地支 */
export function dayBranch(date: Date = new Date()): EarthlyBranch {
  const REF = Date.UTC(1900, 0, 1);
  const days = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - REF) / 86400000);
  const index = ((days % 12) + 12) % 12;
  return EARTHLY_BRANCHES[index];
}

/** Tool 3 · ISO Year-Week, 例 "2026-W19" */
export function isoWeekCode(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 紫微工具
// ─────────────────────────────────────────────────────────────────────────────

const PALACES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫',
] as const;
export type Palace = (typeof PALACES)[number];

/** Tool 4 · 用稳定 hash 派一个"今日命宫位"占位（v1 不是真排盘） */
export function todayPalace(hash: string, date: Date = new Date()): Palace {
  let h = 0;
  const seed = `${hash}|${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return PALACES[Math.abs(h) % PALACES.length];
}

/** Tool 5 · 给出某主星的"三方四正"——v1 用对照表（编辑部审过） */
const TRINE: Record<ZiweiMainStar, ZiweiMainStar[]> = {
  ziwei: ['tianfu', 'wuqu', 'lianzhen'],
  tianji: ['taiyin', 'tianliang', 'jumen'],
  taiyang: ['tianliang', 'taiyin', 'jumen'],
  wuqu: ['tianfu', 'ziwei', 'lianzhen'],
  tiantong: ['taiyin', 'tianji', 'tianliang'],
  lianzhen: ['ziwei', 'wuqu', 'tianfu'],
  tianfu: ['ziwei', 'wuqu', 'lianzhen'],
  taiyin: ['tianji', 'tianliang', 'tiantong'],
  tanlang: ['qisha', 'pojun', 'wuqu'],
  jumen: ['taiyang', 'tianji', 'tianliang'],
  tianxiang: ['ziwei', 'wuqu', 'lianzhen'],
  tianliang: ['tianji', 'taiyin', 'taiyang'],
  qisha: ['pojun', 'tanlang', 'wuqu'],
  pojun: ['qisha', 'tanlang', 'wuqu'],
};

export function trineStars(star: ZiweiMainStar): ZiweiMainStar[] {
  return TRINE[star];
}

/** Tool 6 · 把一组主星合成"组合气场"短标签——编辑部预设，绝不出现在用户面前未经翻译。 */
const COMBO_LABEL: Partial<Record<string, string>> = {
  'ziwei|tianfu': '掌权与建设',
  'ziwei|qisha': '杀伐与决断',
  'taiyin|tianji': '夜光与策动',
  'taiyang|tianliang': '阳光与守护',
  'tanlang|qisha|pojun': '杀破狼 · 改写局面',
  'wuqu|tianfu|ziwei': '建造长期资产',
};
export function comboTag(stars: ZiweiMainStar[]): string {
  const key = [...stars].sort().join('|');
  return COMBO_LABEL[key] ?? '混合气场';
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. 五行工具
// ─────────────────────────────────────────────────────────────────────────────

export type WuXing = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

const STEM_TO_WUXING: Record<HeavenlyStem, WuXing> = {
  甲: 'wood', 乙: 'wood',
  丙: 'fire', 丁: 'fire',
  戊: 'earth', 己: 'earth',
  庚: 'metal', 辛: 'metal',
  壬: 'water', 癸: 'water',
};
const BRANCH_TO_WUXING: Record<EarthlyBranch, WuXing> = {
  寅: 'wood', 卯: 'wood',
  巳: 'fire', 午: 'fire',
  辰: 'earth', 戌: 'earth', 丑: 'earth', 未: 'earth',
  申: 'metal', 酉: 'metal',
  亥: 'water', 子: 'water',
};

/** Tool 7 · 公历日的五行能量分布（仅 stem + branch 两位；v2 接八字四柱） */
export function todayWuxingMix(date: Date = new Date()): Record<WuXing, number> {
  const stem = STEM_TO_WUXING[dayStem(date)];
  const branch = BRANCH_TO_WUXING[dayBranch(date)];
  const out: Record<WuXing, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  out[stem] += 1;
  out[branch] += 1;
  return out;
}

/** Tool 8 · 给出当下"最旺 / 最弱"的两个五行 */
export function wuxingPolarity(mix: Record<WuXing, number>): { strongest: WuXing; weakest: WuXing } {
  const entries = Object.entries(mix) as Array<[WuXing, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return { strongest: entries[0][0], weakest: entries[entries.length - 1][0] };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. 翻译工具
// ─────────────────────────────────────────────────────────────────────────────

export interface TodayBriefing {
  date: string;
  weekCode: string;
  star: ZiweiMainStar;
  starLabel: string;
  starLine: string;
  palace: Palace;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  wuxing: { strongest: WuXing; weakest: WuXing };
  combo: string;
}

/** Tool 9 · 把今天的所有原子坐标合并成一份"内部 briefing"——给翻译层用。 */
export function todayBriefing(hash = 'anonymous', date: Date = new Date()): TodayBriefing {
  const star = getDailyStar(date);
  const { line, starLabel } = getDailyStarLine(date, hash);
  const trine = trineStars(star);
  return {
    date: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`,
    weekCode: isoWeekCode(date),
    star,
    starLabel,
    starLine: line,
    palace: todayPalace(hash, date),
    stem: dayStem(date),
    branch: dayBranch(date),
    wuxing: wuxingPolarity(todayWuxingMix(date)),
    combo: comboTag([star, ...trine.slice(0, 2)]),
  };
}

/** Tool 10 · 把 briefing → 一句"编辑部草稿"。仅用于 dogfood 与 admin 预览。 */
export function briefingToDraft(b: TodayBriefing): string {
  // 100% 用预设组件拼装；不直接生成自然语言。
  const palaceLine = `今天的注意力，可能在「${b.palace}」附近。`;
  const wuxingLine = `偏向${WUXING_LABEL[b.wuxing.strongest]}的一天——${WUXING_HINT[b.wuxing.strongest]}。`;
  return [b.starLine, palaceLine, wuxingLine, `（${b.combo} · ${b.stem}${b.branch}）`].join(' ');
}

const WUXING_LABEL: Record<WuXing, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};
const WUXING_HINT: Record<WuXing, string> = {
  wood: '想长起来，去做一件需要时间的事',
  fire: '想被看见，给一句话留个出口',
  earth: '想稳住，把答应过的事按住',
  metal: '想削掉冗余，决定一件该结束的事',
  water: '想退一步，先把自己照顾好',
};

// ─────────────────────────────────────────────────────────────────────────────
// 工具表 · 给未来的"工具调用框架"用
// ─────────────────────────────────────────────────────────────────────────────

export const MINGLI_TOOLS = {
  dayStem,
  dayBranch,
  isoWeekCode,
  todayPalace,
  trineStars,
  comboTag,
  todayWuxingMix,
  wuxingPolarity,
  todayBriefing,
  briefingToDraft,
} as const;

export type MingliToolName = keyof typeof MINGLI_TOOLS;

/** 给翻译层的元数据，供以后接 LLM tool-calling */
export const MINGLI_TOOL_DESCRIPTIONS: Record<MingliToolName, string> = {
  dayStem: '返回日干（10 天干之一）。输入 Date。',
  dayBranch: '返回日支（12 地支之一）。输入 Date。',
  isoWeekCode: '返回 ISO 周编号 YYYY-Www。输入 Date。',
  todayPalace: '基于稳定哈希派出今日命宫位置。输入 hash + Date。',
  trineStars: '返回某主星的三方四正主星数组。',
  comboTag: '把一组主星合成"组合气场"短标签。',
  todayWuxingMix: '今日五行能量分布。',
  wuxingPolarity: '给出最旺/最弱五行。',
  todayBriefing: '把今天所有坐标合并成 internal briefing。',
  briefingToDraft: '把 briefing → 一句编辑部草稿（仅 dogfood 预览）。',
};

// ─────────────────────────────────────────────────────────────────────────────
// 复用 v0 导出，方便外部一站式 import
// ─────────────────────────────────────────────────────────────────────────────
export { ZIWEI_STARS, ZIWEI_STAR_LABEL, getStarLines };
export type { ZiweiMainStar };
