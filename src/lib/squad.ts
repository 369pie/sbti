import { PERSONALITY_TYPES, getPersonalityBySlug } from './personalities';
import type { PersonalityType } from './personalities';
import { DIMENSIONS, MODEL_COLORS } from './dimensions';
import type { ModelType, DimensionLevel } from './dimensions';
import { withBasePath } from './site';

// ─── Types ───────────────────────────────────────────────

export interface SquadPersonality {
  code: string;       // e.g. "CHAOS"
  name: string;       // e.g. "混沌联盟"
  tagline: string;    // one-liner
  emoji: string;      // large display emoji
  color: string;      // accent color
  description: string;
}

export interface SquadMember {
  name: string;
  slug: string;
}

export interface SquadMetric {
  label: string;
  value: number;   // 0-100
  emoji: string;
  comment: string;
}

export interface SquadHighlight {
  emoji: string;
  title: string;
  detail: string;
}

export interface SquadAnalysis {
  groupName: string;
  members: (SquadMember & { personality: PersonalityType })[];
  title: string;
  squadPersonality: SquadPersonality;
  metrics: SquadMetric[];
  highlights: SquadHighlight[];
  avgScores: Record<string, number>;  // dimension id → avg 0-100
  modelScores: Record<ModelType, number>;  // model → avg 0-100
}

// ─── Helpers ─────────────────────────────────────────────

const LEVEL_NUM: Record<DimensionLevel, number> = { H: 3, M: 2, L: 1 };

function levelToScore100(level: DimensionLevel): number {
  return ((LEVEL_NUM[level] - 1) / 2) * 100;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// ─── URL Encoding ────────────────────────────────────────

export function encodeSquadParams(groupName: string, members: SquadMember[]): string {
  const g = encodeURIComponent(groupName);
  const m = members.map(mem => `${encodeURIComponent(mem.name)}:${mem.slug}`).join(',');
  return `g=${g}&m=${m}`;
}

export function decodeSquadParams(searchParams: URLSearchParams): { groupName: string; members: SquadMember[] } | null {
  const g = searchParams.get('g');
  const m = searchParams.get('m');
  if (!g || !m) return null;

  const members: SquadMember[] = [];
  for (const part of m.split(',')) {
    const colonIdx = part.indexOf(':');
    if (colonIdx < 0) continue;
    const name = decodeURIComponent(part.slice(0, colonIdx));
    const slug = part.slice(colonIdx + 1);
    if (name && slug && getPersonalityBySlug(slug)) {
      members.push({ name, slug });
    }
  }

  if (members.length < 2) return null;
  return { groupName: decodeURIComponent(g), members };
}

// ─── Group Labels ────────────────────────────────────────

const GROUP_TITLE_RULES: { test: (a: SquadAnalysis) => boolean; titles: string[] }[] = [
  {
    test: a => a.metrics.find(m => m.label === '摆烂指数')!.value >= 70,
    titles: ['集体摆烂重灾区', '人均躺平大师', '摆烂合作社', '集体装死现场'],
  },
  {
    test: a => a.metrics.find(m => m.label === '社恐浓度')!.value >= 70,
    titles: ['社恐互助病房', '集体消失实验室', '人群过敏专科', '社交回避联盟'],
  },
  {
    test: a => a.metrics.find(m => m.label === '内耗指数')!.value >= 70,
    titles: ['精神内耗小分队', '情绪过山车VIP', '互相emo互助会', '集体破防现场'],
  },
  {
    test: a => a.metrics.find(m => m.label === '戏精含量')!.value >= 70,
    titles: ['行走的连续剧片场', '集体奥斯卡提名', '全员戏精剧组', '情感大戏摄制组'],
  },
  {
    test: a => {
      const slugSet = new Set(a.members.map(m => m.slug));
      return slugSet.size === 1;
    },
    titles: ['分身术练习现场', '批量出厂同型号', '人格复制粘贴组', '统一出厂设置队'],
  },
  {
    test: a => {
      const slugSet = new Set(a.members.map(m => m.slug));
      return slugSet.size === a.members.length;
    },
    titles: ['一个正常人都没有', '精神病院团建', '人格动物园', '全员不重样展览馆'],
  },
  {
    test: a => a.metrics.find(m => m.label === '摆烂指数')!.value <= 30,
    titles: ['内卷特训营', '人均卷王精英班', '效率怪物集合体', '拼命三郎突击队'],
  },
];

const FALLBACK_TITLES = [
  '抽象全家福', '这群人没法处', '互相折磨小分队',
  '奇葩说选手团', '人格大乱炖', '相爱相杀合伙人',
];

function pickByHash(options: string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return options[Math.abs(hash) % options.length];
}

// ─── Squad Personality Definitions ───────────────────────

const SQUAD_PERSONALITIES: SquadPersonality[] = [
  {
    code: 'CHAOS',
    name: '混沌联盟',
    tagline: '没有最抽象，只有更抽象',
    emoji: '🌀',
    color: '#9333ea',
    description: '又摆又戏，每天都在制造大型社死名场面。你们就是朋友圈里的行为艺术家联盟。',
  },
  {
    code: 'FREEZE',
    name: '冰封小队',
    tagline: '群里安静得像来了个鬼',
    emoji: '🧊',
    color: '#06b6d4',
    description: '内心戏多到爆，嘴上一个字不说。整个小队的气场就是冬天没开暖气的冰窖。',
  },
  {
    code: 'BOOM',
    name: '情绪炸药厂',
    tagline: '三句话就能把天聊炸',
    emoji: '💣',
    color: '#ef4444',
    description: '内耗严重还互相上演心理悬疑剧，成员之间的情绪拉扯堪比八点档。',
  },
  {
    code: 'CHILL',
    name: '集体躺平',
    tagline: '全员精神退休',
    emoji: '🏖️',
    color: '#22c55e',
    description: '不想卷也不想说话，在一起的最大共识就是「别烦我」。你们是真正的精神退休组合。',
  },
  {
    code: 'HYPER',
    name: '打鸡血小队',
    tagline: '能量溢出，活力过剩',
    emoji: '⚡',
    color: '#f59e0b',
    description: '不摆不恐，全员在线。这个小队的能量密度高到可以给整栋楼充电。',
  },
  {
    code: 'DRAMA',
    name: '连续剧剧组',
    tagline: '每天都有新剧情',
    emoji: '🎬',
    color: '#ec4899',
    description: '戏精聚集，但心态稳定不内耗。你们的日常比电视剧精彩，而且每个人都戏份很足。',
  },
  {
    code: 'EMO',
    name: '集体 emo',
    tagline: '虽然很努力，但是好累',
    emoji: '🌧️',
    color: '#6366f1',
    description: '不摆烂但精神内耗极其严重，大家一边拼命一边互相问「你还好吗」。',
  },
  {
    code: 'PARTY',
    name: '气氛组',
    tagline: '有我们在不用担心冷场',
    emoji: '🎉',
    color: '#f97316',
    description: '不怕社交还全员加戏，这个小队走到哪里哪里就是派对现场。',
  },
  {
    code: 'ZEN',
    name: '佛系团',
    tagline: '一切随缘，大家都挺好',
    emoji: '☯️',
    color: '#84cc16',
    description: '没有极端指标，所有维度都很均衡。你们就像一碗温水，温温吞吞但相处舒服。',
  },
  {
    code: 'CLASH',
    name: '相爱相杀',
    tagline: '互补到极致就是互相折磨',
    emoji: '⚔️',
    color: '#dc2626',
    description: '成员之间差异巨大，摆的和卷的、话多的和社恐的全凑一起了。吵完又离不开，经典相爱相杀。',
  },
  {
    code: 'COPY',
    name: '出厂设置',
    tagline: '是不是同一条流水线下来的',
    emoji: '👯',
    color: '#8b5cf6',
    description: '成员人格高度重复，简直像批量复制粘贴。你们是灵魂双胞胎（或多胞胎）无疑了。',
  },
  {
    code: 'ZOO',
    name: '人格动物园',
    tagline: '全员物种都不一样',
    emoji: '🦁',
    color: '#0ea5e9',
    description: '每个人的人格都不重样，像动物园一样物种丰富。虽然各有各的奇葩，但正因如此才有趣。',
  },
];

export function getSquadPersonalityImage(code: string): string {
  return withBasePath(`/images/types/squad-${code.toLowerCase()}.png`);
}

type MetricSet = { baiLan: number; sheKong: number; neiHao: number; xiJing: number };

function classifySquadPersonality(
  metrics: MetricSet,
  members: { slug: string }[],
): SquadPersonality {
  const { baiLan, sheKong, neiHao, xiJing } = metrics;

  // Special structural matches first
  const slugSet = new Set(members.map(m => m.slug));
  if (slugSet.size === 1 && members.length >= 2) {
    return SQUAD_PERSONALITIES.find(p => p.code === 'COPY')!;
  }
  if (slugSet.size === members.length && members.length >= 4) {
    return SQUAD_PERSONALITIES.find(p => p.code === 'ZOO')!;
  }

  // Check for high variance (CLASH) — use metrics spread
  const metricValues = [baiLan, sheKong, neiHao, xiJing];
  const metricMax = Math.max(...metricValues);
  const metricMin = Math.min(...metricValues);
  if (metricMax - metricMin >= 45) {
    return SQUAD_PERSONALITIES.find(p => p.code === 'CLASH')!;
  }

  // Dominant metric combos
  if (xiJing >= 65 && baiLan >= 60) return SQUAD_PERSONALITIES.find(p => p.code === 'CHAOS')!;
  if (sheKong >= 65 && neiHao >= 60) return SQUAD_PERSONALITIES.find(p => p.code === 'FREEZE')!;
  if (neiHao >= 65 && xiJing >= 55)  return SQUAD_PERSONALITIES.find(p => p.code === 'BOOM')!;
  if (baiLan >= 65 && sheKong >= 55) return SQUAD_PERSONALITIES.find(p => p.code === 'CHILL')!;
  if (baiLan <= 35 && sheKong <= 40) return SQUAD_PERSONALITIES.find(p => p.code === 'HYPER')!;
  if (xiJing >= 60 && neiHao <= 40)  return SQUAD_PERSONALITIES.find(p => p.code === 'DRAMA')!;
  if (neiHao >= 60 && baiLan <= 40)  return SQUAD_PERSONALITIES.find(p => p.code === 'EMO')!;
  if (sheKong <= 35 && xiJing >= 55) return SQUAD_PERSONALITIES.find(p => p.code === 'PARTY')!;

  // Fallback — ZEN (all moderate)
  return SQUAD_PERSONALITIES.find(p => p.code === 'ZEN')!;
}

// ─── Analysis ────────────────────────────────────────────

export function analyzeSquad(groupName: string, members: SquadMember[]): SquadAnalysis | null {
  const resolved = members.map(m => {
    const personality = getPersonalityBySlug(m.slug);
    if (!personality) return null;
    return { ...m, personality };
  }).filter((m): m is SquadMember & { personality: PersonalityType } => m !== null);

  if (resolved.length < 2) return null;

  // Calculate average dimension scores
  const avgScores: Record<string, number> = {};
  for (const dim of DIMENSIONS) {
    const scores = resolved.map(m => levelToScore100(m.personality.profile[dim.id] as DimensionLevel));
    avgScores[dim.id] = avg(scores);
  }

  // Calculate model-level averages
  const modelScores: Record<string, number> = {};
  const modelGroups: Record<string, string[]> = {};
  for (const dim of DIMENSIONS) {
    if (!modelGroups[dim.model]) modelGroups[dim.model] = [];
    modelGroups[dim.model].push(dim.id);
  }
  for (const [model, dimIds] of Object.entries(modelGroups)) {
    modelScores[model] = avg(dimIds.map(id => avgScores[id]));
  }

  // ─── Metrics ───────────────────────────────────────────
  const actionAvg = avg(['Ac1', 'Ac2', 'Ac3'].map(id => avgScores[id]));
  const socialAvg = avg(['So1', 'So2', 'So3'].map(id => avgScores[id]));
  const emotionAvg = avg(['E1', 'E2', 'E3'].map(id => avgScores[id]));
  const selfAvg = avg(['S1', 'S2', 'S3'].map(id => avgScores[id]));

  // 摆烂指数 = inverse of action drive (lower action → more 摆烂)
  const baiLanScore = Math.round(100 - actionAvg);
  // 社恐浓度 = inverse of social (lower social → more 社恐)
  const sheKongScore = Math.round(100 - socialAvg);
  // 内耗指数 = emotional instability (low E1 + high E2 + low E3)
  const neiHaoScore = Math.round(
    avg([100 - avgScores.E1, avgScores.E2, 100 - avgScores.E3]),
  );
  // 戏精含量 = emotion + social initiative - self-clarity
  const xiJingScore = Math.round(
    avg([avgScores.E2, avgScores.So1, 100 - avgScores.S2]),
  );

  const metricComment = (label: string, value: number): string => {
    if (label === '摆烂指数') {
      if (value >= 80) return '集体精神已飞升';
      if (value >= 60) return '佛系躺平中';
      if (value >= 40) return '半死不活型';
      return '卷得飞起';
    }
    if (label === '社恐浓度') {
      if (value >= 80) return '建议线上团建';
      if (value >= 60) return '安静得可怕';
      if (value >= 40) return '偶尔能说话';
      return '全员社牛';
    }
    if (label === '内耗指数') {
      if (value >= 80) return '脑内CPU爆炸';
      if (value >= 60) return '反复横跳中';
      if (value >= 40) return '偶尔头疼';
      return '佛系无忧';
    }
    // 戏精含量
    if (value >= 80) return '演技炸裂';
    if (value >= 60) return '戏多但精彩';
    if (value >= 40) return '偶尔加戏';
    return '实力派低调';
  };

  const metrics: SquadMetric[] = [
    { label: '摆烂指数', value: baiLanScore, emoji: '🦥', comment: metricComment('摆烂指数', baiLanScore) },
    { label: '社恐浓度', value: sheKongScore, emoji: '🫣', comment: metricComment('社恐浓度', sheKongScore) },
    { label: '内耗指数', value: neiHaoScore, emoji: '🧠', comment: metricComment('内耗指数', neiHaoScore) },
    { label: '戏精含量', value: xiJingScore, emoji: '🎭', comment: metricComment('戏精含量', xiJingScore) },
  ];

  // ─── Highlights ────────────────────────────────────────
  const highlights: SquadHighlight[] = [];

  // Duplicate types
  const slugCounts = new Map<string, string[]>();
  for (const m of resolved) {
    const names = slugCounts.get(m.slug) ?? [];
    names.push(m.name);
    slugCounts.set(m.slug, names);
  }
  for (const [slug, names] of slugCounts) {
    if (names.length >= 2) {
      const p = getPersonalityBySlug(slug)!;
      highlights.push({
        emoji: p.emoji,
        title: `${p.name}×${names.length}`,
        detail: `${names.join('、')} 撞型了！原来你们是同一个模子刻出来的`,
      });
    }
  }

  // Most extreme metric
  const topMetric = [...metrics].sort((a, b) => b.value - a.value)[0];
  highlights.push({
    emoji: topMetric.emoji,
    title: `${topMetric.label} ${topMetric.value}%`,
    detail: `这群人最突出的特征：${topMetric.comment}`,
  });

  // Special-type count
  const specialCount = resolved.filter(m => m.personality.isSpecial).length;
  if (specialCount > 0) {
    highlights.push({
      emoji: '✨',
      title: `${specialCount} 个隐藏人格`,
      detail: `这个组局里居然有 ${specialCount} 个隐藏款，有点东西`,
    });
  }

  // Self-esteem spread
  const s1Scores = resolved.map(m => LEVEL_NUM[m.personality.profile.S1 as DimensionLevel]);
  const s1Spread = Math.max(...s1Scores) - Math.min(...s1Scores);
  if (s1Spread >= 2) {
    highlights.push({
      emoji: '⚖️',
      title: '自信落差极大',
      detail: '有人自我感觉良好到爆，有人自我怀疑到底，这个组合太刺激了',
    });
  }

  // Build analysis object for title generation
  const squadPersonality = classifySquadPersonality(
    { baiLan: baiLanScore, sheKong: sheKongScore, neiHao: neiHaoScore, xiJing: xiJingScore },
    resolved,
  );

  const analysis: SquadAnalysis = {
    groupName,
    members: resolved,
    title: '', // will be set below
    squadPersonality,
    metrics,
    highlights,
    avgScores,
    modelScores: modelScores as Record<ModelType, number>,
  };

  // Generate title
  const seed = groupName + resolved.map(m => m.slug).sort().join('');
  let title = '';
  for (const rule of GROUP_TITLE_RULES) {
    if (rule.test(analysis)) {
      title = pickByHash(rule.titles, seed);
      break;
    }
  }
  if (!title) {
    title = pickByHash(FALLBACK_TITLES, seed);
  }
  analysis.title = title;

  return analysis;
}

// Re-export for convenience
export { PERSONALITY_TYPES, getPersonalityBySlug, getTypeImage } from './personalities';
export { DIMENSIONS, MODEL_COLORS } from './dimensions';
export type { PersonalityType } from './personalities';
export type { ModelType } from './dimensions';
