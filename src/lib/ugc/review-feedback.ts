export const REVIEW_REASON_OPTIONS = [
  {
    key: 'positioning',
    label: '定位不够清楚',
    hint: '主题表达模糊，用户看不出这个宇宙在测什么。',
  },
  {
    key: 'copy-quality',
    label: '文案完成度不足',
    hint: '题目或结果文案太空，缺少命中感和表达力度。',
  },
  {
    key: 'insufficient-coverage',
    label: '题库/人格数量不足',
    hint: '最小可用骨架还没补齐，暂时不建议上线。',
  },
  {
    key: 'ip-risk',
    label: '版权/IP 风险',
    hint: '可能涉及未授权角色、剧照、品牌元素或命名风险。',
  },
  {
    key: 'compliance',
    label: '合规需修改',
    hint: '需要继续修正文案与表达，确保平台审核标准通过。',
  },
  {
    key: 'other',
    label: '其他原因',
    hint: '不适合归入上面几类的反馈。',
  },
] as const;

export type ReviewReasonKey = typeof REVIEW_REASON_OPTIONS[number]['key'];

const REVIEW_REASON_MAP = new Map<ReviewReasonKey, (typeof REVIEW_REASON_OPTIONS)[number]>(
  REVIEW_REASON_OPTIONS.map((item) => [item.key, item]),
);

export function isReviewReasonKey(value: unknown): value is ReviewReasonKey {
  return typeof value === 'string' && REVIEW_REASON_MAP.has(value as ReviewReasonKey);
}

export function getReviewReasonMeta(reasonKey: ReviewReasonKey) {
  return REVIEW_REASON_MAP.get(reasonKey) ?? REVIEW_REASON_MAP.get('other')!;
}

export function formatReviewFeedback(reasonKey: ReviewReasonKey, note?: string | null): string {
  const normalizedNote = (note ?? '').trim();
  return normalizedNote.length > 0 ? `[${reasonKey}] ${normalizedNote}` : `[${reasonKey}]`;
}

export function parseReviewFeedback(reviewNote?: string | null) {
  const raw = (reviewNote ?? '').trim();
  if (!raw) return null;

  const match = raw.match(/^\[([a-z-]+)\]\s*(.*)$/i);
  if (match && isReviewReasonKey(match[1])) {
    const reasonKey = match[1] as ReviewReasonKey;
    return {
      raw,
      reasonKey,
      reason: getReviewReasonMeta(reasonKey),
      note: match[2]?.trim() ?? '',
    };
  }

  return {
    raw,
    reasonKey: 'other' as ReviewReasonKey,
    reason: getReviewReasonMeta('other'),
    note: raw,
  };
}