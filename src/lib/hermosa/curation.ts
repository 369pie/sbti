/**
 * HERMOSA · Sprint 3 内部 AI-辅助策展（无外部 LLM 调用版）
 *
 * 这一版完全是规则 + 关键词 + 词频，不调用任何外部模型，
 * 目的是给编辑提供"草稿"，编辑确认后才会出现在公开界面。
 *
 * 包含：
 * - 主题聚类  clusterContributions
 * - 偏见自查  runBiasChecklist
 * - 编辑总结草稿  buildEditorSummaryDraft
 *
 * 输入统一是 HermosaArtifactRow（已发布、已通过安全过滤的行）。
 * 输出永远只是建议，不会写库。
 */

import type { HermosaArtifactKind, HermosaArtifactRow } from './public-artifacts';

// ─────────────────────────────────────────────────────────────
// 关键词词典：手工维护，便于编辑review
// ─────────────────────────────────────────────────────────────

interface ClusterDef {
  key: string;
  label: string;
  /** 命中任一关键词即归入该簇 */
  keywords: readonly string[];
}

const CLUSTERS: readonly ClusterDef[] = [
  { key: 'choice',        label: '选择权 / 拒绝练习',        keywords: ['选择', '拒绝', '说不', 'no', '边界', '取悦', '讨好'] },
  { key: 'work',          label: '职场 / 收入 / 自雇',        keywords: ['老板', 'offer', '职场', '同事', '会议', '薪', '加班', '离职', '辞职'] },
  { key: 'family',        label: '原生家庭 / 父母',           keywords: ['妈', '爸', '父母', '家人', '亲戚', '催婚', '催生'] },
  { key: 'intimacy',      label: '亲密关系 / 性 / 恋爱',      keywords: ['伴侣', '恋人', '前任', '相亲', '约会', '亲密', '床', '吵架', '分手'] },
  { key: 'body',          label: '身体 / 医疗 / 生育',         keywords: ['月经', '体检', '医生', '生育', '怀孕', '冷冻', '卵子', '产检', '更年'] },
  { key: 'mental',        label: '心理 / 自我陪伴',           keywords: ['咨询', '抑郁', '焦虑', '崩溃', '哭', '日记', '复盘', '冥想', '正念'] },
  { key: 'finance',       label: '金钱 / 财务自主',           keywords: ['钱', '预算', '存款', '消费', '账单', '理财', '保险'] },
  { key: 'motherhood',    label: '母职 / 育儿',                keywords: ['孩子', '宝宝', '育儿', '妈妈', '幼儿园', '作业'] },
  { key: 'ai_tooling',    label: 'AI 当助理 / 翻译 / 复盘',     keywords: ['翻译', '整理', '助理', '草稿', '邮件', 'prompt', '让 ai', '让 chatgpt', '让 claude'] },
  { key: 'ai_practice',   label: 'AI 当陪练 / 角色扮演',       keywords: ['模拟', '扮演', '陪练', '练习', '角色'] },
  { key: 'safety_voice',  label: '愤怒 / 边界 / 反 PUA',        keywords: ['愤怒', 'pua', '羞辱', '被骂', '被训', '情绪化', '装坚强'] },
  { key: 'solidarity',    label: '我也是 / 不是孤例',          keywords: ['我也', '不是一个人', '不止我', '原来不是'] },
];

const FALLBACK_CLUSTER: ClusterDef = {
  key: 'other',
  label: '其它 / 待人工分组',
  keywords: [],
};

// ─────────────────────────────────────────────────────────────
// 内容抽取
// ─────────────────────────────────────────────────────────────

function rowSearchableText(row: HermosaArtifactRow): string {
  const parts: string[] = [row.text];
  const md = row.metadata ?? {};
  if (row.kind === 'book') {
    if (md.book_title) parts.push(md.book_title);
    if (md.book_quote) parts.push(md.book_quote);
    if (md.book_note) parts.push(md.book_note);
  }
  if (row.kind === 'ai_question') {
    if (md.ai_question) parts.push(md.ai_question);
    if (md.ai_context) parts.push(md.ai_context);
  }
  return parts.join(' ').toLowerCase();
}

function pickClusterFor(row: HermosaArtifactRow): ClusterDef {
  const text = rowSearchableText(row);
  for (const c of CLUSTERS) {
    for (const kw of c.keywords) {
      if (text.includes(kw)) return c;
    }
  }
  return FALLBACK_CLUSTER;
}

// ─────────────────────────────────────────────────────────────
// 聚类
// ─────────────────────────────────────────────────────────────

export interface ClusteredGroup {
  key: string;
  label: string;
  rows: HermosaArtifactRow[];
  byKind: Record<HermosaArtifactKind, number>;
  totalEcho: number;
  representative: HermosaArtifactRow | null;
}

export interface ClusterResult {
  topicWeek: string | null;
  total: number;
  groups: ClusteredGroup[];
  byKind: Record<HermosaArtifactKind, number>;
}

const KIND_KEYS: readonly HermosaArtifactKind[] = ['voice', 'book', 'ai_question'];

function emptyByKind(): Record<HermosaArtifactKind, number> {
  return { voice: 0, book: 0, ai_question: 0 };
}

export function clusterContributions(
  rows: readonly HermosaArtifactRow[],
  topicWeek: string | null = null,
): ClusterResult {
  const buckets = new Map<string, ClusteredGroup>();
  const byKind = emptyByKind();

  for (const row of rows) {
    const cluster = pickClusterFor(row);
    let bucket = buckets.get(cluster.key);
    if (!bucket) {
      bucket = {
        key: cluster.key,
        label: cluster.label,
        rows: [],
        byKind: emptyByKind(),
        totalEcho: 0,
        representative: null,
      };
      buckets.set(cluster.key, bucket);
    }
    bucket.rows.push(row);
    if (KIND_KEYS.includes(row.kind)) {
      bucket.byKind[row.kind] += 1;
      byKind[row.kind] += 1;
    }
    bucket.totalEcho += row.echo_count ?? 0;
  }

  const groups = Array.from(buckets.values())
    .map((g) => {
      const sortedRows = [...g.rows].sort((a, b) => {
        const ae = a.is_featured ? 1 : 0;
        const be = b.is_featured ? 1 : 0;
        if (ae !== be) return be - ae;
        return (b.echo_count ?? 0) - (a.echo_count ?? 0);
      });
      return {
        ...g,
        rows: sortedRows,
        representative: sortedRows[0] ?? null,
      };
    })
    .sort((a, b) => b.rows.length - a.rows.length || b.totalEcho - a.totalEcho);

  return {
    topicWeek,
    total: rows.length,
    groups,
    byKind,
  };
}

// ─────────────────────────────────────────────────────────────
// 偏见自查清单
// ─────────────────────────────────────────────────────────────

export type BiasSeverity = 'info' | 'warn' | 'block';

export interface BiasFinding {
  rule: string;
  severity: BiasSeverity;
  message: string;
  hits: Array<{ id: string; text: string }>;
}

interface BiasRule {
  id: string;
  severity: BiasSeverity;
  message: string;
  matches: (text: string) => boolean;
}

const BIAS_RULES: readonly BiasRule[] = [
  {
    id: 'self_blame',
    severity: 'warn',
    message: '出现"我太敏感 / 是不是我有问题"等自责句式，编辑时不要再加额外评判语气。',
    matches: (t) => /(我太敏感|是不是我有问题|怪自己|都是我的错)/.test(t),
  },
  {
    id: 'pua_lite',
    severity: 'warn',
    message: '出现疑似 PUA 受害描述，公开发布前请先标"待复核"或脱敏。',
    matches: (t) => /(他说我|他骂我|他打我|被孤立|被冷暴力)/.test(t),
  },
  {
    id: 'medical_advice',
    severity: 'warn',
    message: '出现具体药名 / 剂量 / 诊断，编辑摘要里不要直接引用，避免被误读为医嘱。',
    matches: (t) => /(mg|毫克|剂量|抗抑郁药|开药|处方)/i.test(t),
  },
  {
    id: 'ai_hype',
    severity: 'info',
    message: '出现 AI 神化措辞（"AI 救了我"），可保留原句，但不要进编辑摘要的标题位。',
    matches: (t) => /(ai\s*救|ai\s*治好|没有 ai 我活不下|ai是神)/i.test(t),
  },
  {
    id: 'gender_essentialism',
    severity: 'warn',
    message: '出现"女人就是 / 男人就是"本质化句式，不适合放进对外标题。',
    matches: (t) => /(女人就是|女生就是|男人就是|男性就是)/.test(t),
  },
  {
    id: 'minor_safety',
    severity: 'block',
    message: '提到未成年人或孩子的具体信息，发布前必须脱敏；若涉及伤害，必须屏蔽。',
    matches: (t) => /(未成年|小孩.*受伤|孩子.*打|学校.*欺)/.test(t),
  },
  {
    id: 'private_handle',
    severity: 'block',
    message: '出现联系方式或私人账号，必须屏蔽。',
    matches: (t) => /(微信号|wxid_|加我|t\.me\/|\b1[3-9]\d{9}\b)/i.test(t),
  },
];

export function runBiasChecklist(rows: readonly HermosaArtifactRow[]): BiasFinding[] {
  const findings: BiasFinding[] = [];

  for (const rule of BIAS_RULES) {
    const hits: BiasFinding['hits'] = [];
    for (const row of rows) {
      const text = rowSearchableText(row);
      if (rule.matches(text)) {
        hits.push({ id: row.id, text: row.text });
      }
    }
    if (hits.length > 0) {
      findings.push({
        rule: rule.id,
        severity: rule.severity,
        message: rule.message,
        hits,
      });
    }
  }

  return findings;
}

// ─────────────────────────────────────────────────────────────
// 编辑总结草稿
// ─────────────────────────────────────────────────────────────

export interface EditorSummaryDraft {
  topicWeek: string | null;
  totalConsidered: number;
  groups: Array<{
    key: string;
    label: string;
    count: number;
    representative: HermosaArtifactRow | null;
    sampleTexts: string[];
  }>;
  oneSentenceDraft: string;
  paragraphDraft: string;
  /** 仅作编辑参考，不直接发布 */
  warnings: BiasFinding[];
}

function topRepresentativeRows(groups: ClusteredGroup[], maxGroups = 5, maxPerGroup = 3) {
  return groups.slice(0, maxGroups).map((g) => ({
    key: g.key,
    label: g.label,
    count: g.rows.length,
    representative: g.representative,
    sampleTexts: g.rows.slice(0, maxPerGroup).map((r) => r.text),
  }));
}

export function buildEditorSummaryDraft(
  rows: readonly HermosaArtifactRow[],
  options: { topicWeek?: string | null; topicQuestion?: string | null } = {},
): EditorSummaryDraft {
  const cluster = clusterContributions(rows, options.topicWeek ?? null);
  const top = topRepresentativeRows(cluster.groups);
  const totalVoice = cluster.byKind.voice;
  const totalBook = cluster.byKind.book;
  const totalAi = cluster.byKind.ai_question;

  const topLabel = top[0]?.label ?? '尚未浮现主轴';

  const oneSentence = options.topicQuestion
    ? `本周「${options.topicQuestion}」共收到 ${cluster.total} 条共建——最被反复说到的，是关于「${topLabel}」。`
    : `本周共收到 ${cluster.total} 条共建——最被反复说到的，是关于「${topLabel}」。`;

  const paragraphLines: string[] = [];
  paragraphLines.push(oneSentence);
  paragraphLines.push(
    `其中一句话 ${totalVoice} 条 / 她的书 ${totalBook} 条 / AI 问题 ${totalAi} 条。`,
  );
  if (top.length > 0) {
    paragraphLines.push('反复出现的几个关切：');
    top.forEach((g) => {
      const sample = g.representative?.text ? `——例："${g.representative.text}"` : '';
      paragraphLines.push(`· ${g.label}（${g.count} 条）${sample}`);
    });
  }
  paragraphLines.push('（以上为系统从已授权、已策展条目里聚合的草稿，需编辑确认后才能发布。）');

  return {
    topicWeek: options.topicWeek ?? null,
    totalConsidered: rows.length,
    groups: top,
    oneSentenceDraft: oneSentence,
    paragraphDraft: paragraphLines.join('\n'),
    warnings: runBiasChecklist(rows),
  };
}
