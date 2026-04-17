/**
 * CCI · Cross-Context Consistency Index (跨情境一致性指数)
 *
 * 把同一用户在 N 个不同宇宙的 W-T-F-I 画像合并，计算"你这个人在不同情境下有多稳定"。
 * 高 CCI = 一以贯之；低 CCI = 高度情境化（更"WTF"）。
 *
 * 学术对应：Mischel & Shoda (1995) 的 "if...then..." behavioral signature 一致性。
 *
 * 算法：
 * 1. 对每条轴，收集所有宇宙的得分 [-3..+3]
 * 2. 计算标准差 σ（越小越一致）
 * 3. 把 σ 映射到 0-100 的"一致性分数"（CCI = 100 - σ × scale）
 * 4. 4 条轴求平均 → 总 CCI
 *
 * 显示分档：
 * - >= 80 → 「定海神针」一以贯之
 * - 60-79 → 「主轴清晰」大方向稳，细节会变
 * - 40-59 → 「双面人」明显的情境化分裂
 * - < 40  → 「我有 N 个我」高度 WTF / 万花筒型
 */

import type { WtfiAxis } from './axes';

export interface UniverseProfile {
  universe: string;
  /** 该宇宙的 W/T/F/I 画像（-3..+3） */
  axes: Record<WtfiAxis, number>;
  /** 测试时间 ISO，用于"最近 N 次"窗口 */
  takenAt?: string;
}

export interface CciResult {
  /** 总 CCI 0-100 */
  total: number;
  /** 每条轴的一致性 0-100 */
  perAxis: Record<WtfiAxis, number>;
  /** 每条轴的标准差（debug） */
  perAxisStd: Record<WtfiAxis, number>;
  /** 输入的宇宙数 */
  universeCount: number;
  /** 分档 */
  band: 'anchor' | 'spine' | 'duplex' | 'kaleidoscope';
  bandLabel: string;
  bandTagline: string;
}

const AXES: WtfiAxis[] = ['W', 'T', 'F', 'I'];

/** σ → 0-100 的转换：σ = 0 → 100；σ = 3（最大可能）→ 0 */
function stdToScore(std: number): number {
  // σ 理论最大约 3（极端反差），用线性映射
  const score = 100 - (std / 3) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function bandOf(total: number): CciResult['band'] {
  if (total >= 80) return 'anchor';
  if (total >= 60) return 'spine';
  if (total >= 40) return 'duplex';
  return 'kaleidoscope';
}

const BAND_LABEL: Record<CciResult['band'], string> = {
  anchor: '定海神针',
  spine: '主轴清晰',
  duplex: '双面人',
  kaleidoscope: '万花筒',
};

const BAND_TAGLINE: Record<CciResult['band'], string> = {
  anchor: '在所有情境里你都是同一个你——稳定到外人觉得"性格非常突出"。',
  spine: '主轴清晰，细节会随情境微调。大方向上你"很你"。',
  duplex: '工作 / 恋爱 / 朋友里你会切换出明显不同的版本——不是装，是真不同。',
  kaleidoscope: '高度情境化，每个宇宙都是另一个你。表面 WTF，本质是高弹性。',
};

/**
 * 计算 CCI
 * @param profiles 至少需要 2 个宇宙才有意义；< 2 时返回兜底分 100
 */
export function computeCci(profiles: UniverseProfile[]): CciResult {
  if (profiles.length < 2) {
    return {
      total: 100,
      perAxis: { W: 100, T: 100, F: 100, I: 100 },
      perAxisStd: { W: 0, T: 0, F: 0, I: 0 },
      universeCount: profiles.length,
      band: 'anchor',
      bandLabel: BAND_LABEL.anchor,
      bandTagline: '至少完成 2 个宇宙的测试，才能算出你的跨情境一致性。',
    };
  }

  const perAxisStd: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };
  const perAxis: Record<WtfiAxis, number> = { W: 0, T: 0, F: 0, I: 0 };

  for (const a of AXES) {
    const xs = profiles.map(p => p.axes[a]);
    const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
    const variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length;
    const std = Math.sqrt(variance);
    perAxisStd[a] = Math.round(std * 100) / 100;
    perAxis[a] = stdToScore(std);
  }

  const total = Math.round(
    AXES.reduce((s, a) => s + perAxis[a], 0) / AXES.length,
  );
  const band = bandOf(total);

  return {
    total,
    perAxis,
    perAxisStd,
    universeCount: profiles.length,
    band,
    bandLabel: BAND_LABEL[band],
    bandTagline: BAND_TAGLINE[band],
  };
}

/** localStorage key for cross-universe profile aggregation */
export const CCI_STORAGE_KEY = 'wtfti.cci.profiles.v1';

/** 浏览器侧：把单次测试结果累加到本地 profile 池 */
export function persistUniverseProfile(profile: UniverseProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(CCI_STORAGE_KEY);
    const list: UniverseProfile[] = raw ? JSON.parse(raw) : [];
    // 同一宇宙覆盖最新一次
    const next = [
      ...list.filter(p => p.universe !== profile.universe),
      { ...profile, takenAt: profile.takenAt ?? new Date().toISOString() },
    ];
    window.localStorage.setItem(CCI_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('[cci] persist failed:', e);
  }
}

export function loadUniverseProfiles(): UniverseProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CCI_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UniverseProfile[]) : [];
  } catch {
    return [];
  }
}
