/**
 * ITC 6 类配对模型 (Tension Pairing)
 * ─────────────────────────────────────────────────────────────
 * 基于两个用户的 ITC 签名（control / distance / novelty）
 * 产出 6 类亲密张力配对模型之一 + 解读。
 *
 * 6 类源于 3 张力 × 2 种关系（同向 / 对冲）的组合再做语义聚类。
 */

import type { ItcSignature } from './itc';

export type TensionPairingId =
  | 'mirror'         // 三轴几乎一致 — 「镜像同温」
  | 'magnet'         // 控制 + 距离对冲，新鲜对齐 — 「磁极相吸」
  | 'tide'           // 控制对齐，沉浸/新鲜对冲 — 「潮汐共振」
  | 'fugue'          // 三轴中两轴对冲 — 「赋格对话」
  | 'orbit'          // 一方 NEUTRAL，对方所有信号都被放大 — 「轨道共绕」
  | 'spark';         // 三轴全部对冲 — 「短路火花」

export interface TensionPairing {
  id: TensionPairingId;
  label: string;
  english: string;
  oneLine: string;
  longDescription: string;
  /** 0-100，关系生命力评分（不是「好坏」，是「张力强度」）。 */
  intensity: number;
  /** 适合 / 雷区 / 长期关键 三段建议。 */
  notes: { fit: string; risk: string; longTerm: string };
}

const PAIRINGS: Record<TensionPairingId, Omit<TensionPairing, 'intensity'>> = {
  mirror: {
    id: 'mirror',
    label: '镜像同温',
    english: 'Mirror Pair',
    oneLine: '你们在三条张力上几乎是同一个人。',
    longDescription:
      '默契、舒适、不需要太多解释——你们说一句话对方就能接十句。' +
      '但镜像组合容易陷入「彼此放大」的陷阱：你们的盲区也是一样的，所以谁都不会及时提醒。',
    notes: {
      fit: '日常沟通、共享品味、安静下午、安全感导向。',
      risk: '一起 emo / 一起拖延 / 一起逃避——盲点同步。',
      longTerm: '需要刻意引入第三视角（朋友、咨询、新场景）来打破回声室。',
    },
  },
  magnet: {
    id: 'magnet',
    label: '磁极相吸',
    english: 'Magnet Pair',
    oneLine: '一个掌舵一个交付，一个保留一个沉浸。',
    longDescription:
      '控制 + 距离这两条主轴互补，这是大多数稳定长期关系的张力结构。' +
      '一方负责安排和邀请，一方负责接收和回应——节奏天然咬合。',
    notes: {
      fit: '生活分工、亲密节奏、互相调节情绪。',
      risk: '掌舵方容易过度承担，交付方容易被解读为「不上心」。',
      longTerm: '定期角色互换日（一周一次 / 一月一次）防止结构僵化。',
    },
  },
  tide: {
    id: 'tide',
    label: '潮汐共振',
    english: 'Tide Pair',
    oneLine: '控制对齐，但你们的距离感和新鲜感在拉扯。',
    longDescription:
      '你们对「谁说了算」有一致的偏好，所以决策层面顺畅；' +
      '但一方想要更多沉浸 / 更新鲜，另一方想要更多保留 / 更稳定——' +
      '这种张力像潮汐一样反复涨落，是关系生命力的来源，也是最容易吵的地方。',
    notes: {
      fit: '共同决策、并肩做事、外人看是 power couple。',
      risk: '"我以为我们一样，怎么这事你又不愿意"。',
      longTerm: '把对冲张力做成「我们两个人共同的剧本」，而不是个人 KPI。',
    },
  },
  fugue: {
    id: 'fugue',
    label: '赋格对话',
    english: 'Fugue Pair',
    oneLine: '两条张力对冲，一条对齐——像两个声部追逐。',
    longDescription:
      '不是直接互补，也不是镜像，是更复杂的「轮唱式」关系。' +
      '你们的张力不能简单相加，需要轮流让位、轮流主导。这种关系的好处是从来不无聊；难处是从来不轻松。',
    notes: {
      fit: '彼此挑战、长期成长、智识吸引。',
      risk: '吵架不是因为价值观，是因为节奏永远错半拍。',
      longTerm: '建立「让对方先开口」的轮流规则——结构比情绪更稳定。',
    },
  },
  orbit: {
    id: 'orbit',
    label: '轨道共绕',
    english: 'Orbit Pair',
    oneLine: '一方相对中性，另一方信号强烈——你们绕着对方的张力转。',
    longDescription:
      '中性方提供稳定的引力，强信号方提供运动。这是非常容易出现「一个人主导关系叙事」的结构。' +
      '关系是否健康，取决于中性方是真的从容，还是只是没说。',
    notes: {
      fit: '强信号方有空间释放，中性方有空间观察。',
      risk: '中性方长期沉默 → 突然爆发；强信号方长期被「容忍」→ 觉得不被回应。',
      longTerm: '中性方主动给一次「我也想要」的清单；强信号方给一次「我也可以不要」的清单。',
    },
  },
  spark: {
    id: 'spark',
    label: '短路火花',
    english: 'Spark Pair',
    oneLine: '三条张力全部对冲——剧烈、上瘾、危险。',
    longDescription:
      '所有的好和所有的坏都被放大三倍。这种关系出现时几乎都是命运感很强的瞬间，' +
      '但它的稳定结构是脆弱的——靠的是双方愿不愿意持续校准，而不是默契。',
    notes: {
      fit: '强烈的化学反应、创作能量、互相打开。',
      risk: '每一次冲突都像在拆弹；分不开也合不来。',
      longTerm: '极少数能走长期的火花关系都共享一个外部锚（共同事业 / 共同信念）。',
    },
  },
};

function tierToSign(tier: string): -1 | 0 | 1 {
  if (tier === 'CONTROL' || tier === 'IMMERSION' || tier === 'NOVELTY') return 1;
  if (tier === 'SURRENDER' || tier === 'DISTANCE' || tier === 'REPETITION') return -1;
  return 0;
}

/** 6 类配对模型清单（unordered，仅用于白皮书 / 文档展示）。 */
export const ITC_PAIRINGS_CATALOG: Omit<TensionPairing, 'intensity'>[] =
  Object.values(PAIRINGS);

/** 根据两个 ITC 签名匹配配对模型。 */
export function matchTensionPairing(
  a: ItcSignature,
  b: ItcSignature,
): TensionPairing {
  const aSigns = [tierToSign(a.control), tierToSign(a.distance), tierToSign(a.novelty)];
  const bSigns = [tierToSign(b.control), tierToSign(b.distance), tierToSign(b.novelty)];

  // 中性轴数量
  const aNeutralCount = aSigns.filter((s) => s === 0).length;
  const bNeutralCount = bSigns.filter((s) => s === 0).length;

  // 对冲轴数量（两边都不为 0 且方向相反）
  const opposingCount = aSigns.reduce<number>((acc, s, i) => {
    if (s !== 0 && bSigns[i] !== 0 && s !== bSigns[i]) return acc + 1;
    return acc;
  }, 0);
  // 对齐轴数量（两边都不为 0 且方向相同）
  const alignedCount = aSigns.reduce<number>((acc, s, i) => {
    if (s !== 0 && bSigns[i] !== 0 && s === bSigns[i]) return acc + 1;
    return acc;
  }, 0);

  // 中性方主导 → orbit
  if (aNeutralCount >= 2 || bNeutralCount >= 2) {
    return { ...PAIRINGS.orbit, intensity: 50 };
  }

  // 三轴全对齐 → mirror
  if (alignedCount === 3) {
    return { ...PAIRINGS.mirror, intensity: 60 };
  }
  // 三轴全对冲 → spark
  if (opposingCount === 3) {
    return { ...PAIRINGS.spark, intensity: 95 };
  }
  // 控制 + 距离对冲，新鲜对齐 → magnet（最常见的稳定互补）
  if (
    aSigns[0] !== 0 && aSigns[0] !== bSigns[0] &&
    aSigns[1] !== 0 && aSigns[1] !== bSigns[1] &&
    aSigns[2] !== 0 && aSigns[2] === bSigns[2]
  ) {
    return { ...PAIRINGS.magnet, intensity: 80 };
  }
  // 控制对齐，其它至少一条对冲 → tide
  if (aSigns[0] !== 0 && aSigns[0] === bSigns[0] && opposingCount >= 1) {
    return { ...PAIRINGS.tide, intensity: 72 };
  }
  // 默认：两轴对冲一轴对齐 → fugue
  return { ...PAIRINGS.fugue, intensity: 78 };
}
