/**
 * WTFTI 第 5 轴 · S (Stream) 意识流轴定义
 *
 * 基于 Default Mode Network (Raichle 2001) + 内隐联想 (Greenwald 1998) 的本土化产品实现。
 * 学术与产品口径详见：docs/01-strategy/wtfti-s-axis-whitepaper-2026-04-19.md
 *
 * 与现有 W/T/F/I 4 轴并列，但**不参与主测打分**：
 *   - 主测仅 W/T/F/I（见 src/lib/wtfi/scoring.ts）
 *   - S 轴在主测完成后作为"暗面星球解锁"独立测量（见 ./scoring-s.ts）
 */

export const S_AXIS = 'S' as const;
export type SAxis = typeof S_AXIS;

export interface SAxisDefinition {
  id: SAxis;
  english: string;
  name: string;
  testing: string;
  /** 学术锚点（用于白皮书 / tooltip） */
  anchor: string;
  high: { label: string; description: string };
  low: { label: string; description: string };
  color: string;
}

export const S_AXIS_DEFINITION: SAxisDefinition = {
  id: 'S',
  english: 'Stream',
  name: '意识流',
  testing: '当没有外部任务和情境刺激时，你的大脑默认会跑去哪？',
  anchor: 'Default Mode Network (Raichle 2001) + Implicit Association (Greenwald 1998)',
  high: {
    label: '漂流型 Drift',
    description: '联想跨度大、画面感强、第一反应感性、深夜走神远但回得来。',
  },
  low: {
    label: '锚定型 Anchor',
    description: '联想跨度小、第一反应功能性、走神少、对画面词不敏感。',
  },
  color: '#9C7CFF',
};

/** S 轴 5 个分桶（用于映射到暗面星球卡） */
export type ShadowBucket =
  | 'SHADOW-DRIFT-A'
  | 'SHADOW-DRIFT-B'
  | 'SHADOW-NEUTRAL'
  | 'SHADOW-ANCHOR-B'
  | 'SHADOW-ANCHOR-A';

export interface ShadowBucketMeta {
  bucket: ShadowBucket;
  /** 视觉资产 slug（与 scripts/galaxy-planet-prompts.mjs 中 SHADOW_PLANETS slug 对齐） */
  cardSlug: string;
  name: string;
  headline: string;
  body: string;
  tooltip: string;
  /** S 轴落入 [min, max] 视为本桶（左闭右开，最高桶含 +3） */
  range: [number, number];
}

/**
 * S 轴分桶 → 暗面星球
 * 详见 wtfti-s-axis-whitepaper-2026-04-19.md §5
 */
export const SHADOW_BUCKETS: readonly ShadowBucketMeta[] = [
  {
    bucket: 'SHADOW-ANCHOR-A',
    cardSlug: 'shadow-anchor-a-deep-archive',
    name: '深井档案室',
    headline: '你的脑子是个有秩序的硬盘。',
    body: '你不容易走神。一旦没事做，你的大脑会真的关灯而不是转地下广播。',
    tooltip:
      '在 Default Mode Network 的研究里，这种"低自发联想"的剖面通常对应低反刍、低画面化、高执行控制。',
    range: [-3, -2],
  },
  {
    bucket: 'SHADOW-ANCHOR-B',
    cardSlug: 'shadow-anchor-b-zero-workshop',
    name: '归零工坊',
    headline: '一旦没事做，你的大脑会真的休息。',
    body: '你的潜意识默认是"收工"，不是"开夜班"。别人脑内开会，你是真的关灯。',
    tooltip: '低 DMN 自发活动 + 低内隐联想跨度的组合。',
    range: [-2, -1],
  },
  {
    bucket: 'SHADOW-NEUTRAL',
    cardSlug: 'shadow-neutral-midline-lighthouse',
    name: '中线灯塔',
    headline: '你的潜意识比大多数人安静。',
    body: '你的"无任务态"既不漂得远也不彻底关机，像一座按节奏转的灯塔。',
    tooltip: '中位 DMN 活动；走神模式既不高频也不抑制。',
    range: [-1, 1],
  },
  {
    bucket: 'SHADOW-DRIFT-B',
    cardSlug: 'shadow-drift-b-floating-postoffice',
    name: '漂浮邮局',
    headline: '你白天在场，夜里在飘。',
    body: '你不会一直走神，但夜里独处时脑子像一座漂浮的邮局，所有没回的信都会浮上来。',
    tooltip: '中高 DMN 活动 + 时段相关；典型"夜班大脑"。',
    range: [1, 2],
  },
  {
    bucket: 'SHADOW-DRIFT-A',
    cardSlug: 'shadow-drift-a-nameless-current',
    name: '无名洋流',
    headline: '你的脑子从不真正下班。',
    body: '凌晨 2 点你的大脑在为别人写剧本。你的画面感、跨度、走神频率都属于全员前 15%。',
    tooltip: '高 DMN 自发活动 + 高画面化联想；高想象力人群常见剖面。',
    range: [2, 3],
  },
] as const;

/** 在 S ∈ [-3, +3] 范围内查桶 */
export function pickShadowBucket(s: number): ShadowBucketMeta {
  for (const meta of SHADOW_BUCKETS) {
    const [min, max] = meta.range;
    // 最后一桶含 +3
    if (meta.bucket === 'SHADOW-DRIFT-A' && s >= 2) return meta;
    if (s >= min && s < max) return meta;
  }
  // 兜底
  return SHADOW_BUCKETS[2];
}
