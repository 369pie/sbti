/**
 * WTFTI · Soul Resonance (S Index)
 *
 * 6 题灵魂探针（音乐/文学/颜色/电影/气味/触觉），独立维度。
 * 不影响单人五轴打分；仅供配对时计算 S = 1/6 × Σ exact_match。
 *
 * 战略文档：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §5
 */

export type SoulProbeId =
  | 'music'
  | 'quote'
  | 'color'
  | 'cinema'
  | 'scent'
  | 'touch';

export interface SoulProbeOption {
  /** 'A' | 'B' | 'C' | 'D' */
  key: 'A' | 'B' | 'C' | 'D';
  label: string;
  /** 描述（非视频流时显示） */
  blurb: string;
  /** 可选媒体 — 后续接入实音/静帧时填 */
  mediaUrl?: string;
}

export interface SoulProbeQuestion {
  id: SoulProbeId;
  /** 章节标题，UI eyebrow */
  eyebrow: string;
  /** 主问 */
  prompt: string;
  /** 副提示（可选） */
  hint?: string;
  options: [SoulProbeOption, SoulProbeOption, SoulProbeOption, SoulProbeOption];
}

export const SOUL_PROBE_QUESTIONS: SoulProbeQuestion[] = [
  {
    id: 'music',
    eyebrow: '✦ Soul Probe · I',
    prompt: '哪段声音最像你心里那个频率？',
    hint: '凭直觉选，不必想清楚为什么。',
    options: [
      { key: 'A', label: '古典室内乐', blurb: '巴赫无伴奏大提琴第一组曲' },
      { key: 'B', label: '清晨民谣', blurb: 'Joni Mitchell 木吉他清弹' },
      { key: 'C', label: '深夜电子', blurb: 'Bonobo 慢节拍合成器' },
      { key: 'D', label: '环境氛围', blurb: 'Brian Eno 机场音乐' },
    ],
  },
  {
    id: 'quote',
    eyebrow: '✦ Soul Probe · II',
    prompt: '今天哪句话最先在你心里亮起？',
    options: [
      { key: 'A', label: '卡尔维诺', blurb: '「在那一刻，我们都是同一颗原子。」' },
      { key: 'B', label: '张爱玲', blurb: '「生命是一袭华美的袍。」' },
      { key: 'C', label: '余华', blurb: '「我们走的弯路，最终都汇成命。」' },
      { key: 'D', label: '普拉斯', blurb: '「我闭上眼，世界就熄灭了。」' },
    ],
  },
  {
    id: 'color',
    eyebrow: '✦ Soul Probe · III',
    prompt: '哪个颜色是你今天的心率？',
    options: [
      { key: 'A', label: '玫瑰陶土', blurb: '#C07A8E · 暖中带血色' },
      { key: 'B', label: '暮紫', blurb: '#5C4A8A · 深而镇定' },
      { key: 'C', label: '苔绿', blurb: '#5A7A5C · 隐忍生长' },
      { key: 'D', label: '灰蓝', blurb: '#7AA3B0 · 海与雾之间' },
    ],
  },
  {
    id: 'cinema',
    eyebrow: '✦ Soul Probe · IV',
    prompt: '凌晨 3 点你脑子里在演哪一帧画面？',
    options: [
      { key: 'A', label: '王家卫', blurb: '镜中人迟到 30 秒的转身' },
      { key: 'B', label: '侯麦', blurb: '夏日午后阳台上的对话' },
      { key: 'C', label: '北野武', blurb: '海边一个不说话的下午' },
      { key: 'D', label: 'David Lynch', blurb: '红窗帘后面没说出口的事' },
    ],
  },
  {
    id: 'scent',
    eyebrow: '✦ Soul Probe · V',
    prompt: '哪种气味让你最先想到「家」？',
    options: [
      { key: 'A', label: '雨后的柏油路', blurb: '夏天 · 微带焦糖味' },
      { key: 'B', label: '旧书页', blurb: '木浆 · 时间味' },
      { key: 'C', label: '海风', blurb: '咸 · 含碘 · 远' },
      { key: 'D', label: '烟草盒', blurb: '干燥 · 甜 · 深沉' },
    ],
  },
  {
    id: 'touch',
    eyebrow: '✦ Soul Probe · VI',
    prompt: '哪种质地让你想立刻闭上眼？',
    options: [
      { key: 'A', label: '丝绒', blurb: '深红 · 贴脸 · 温度恒定' },
      { key: 'B', label: '粗陶', blurb: '哑光 · 微凉 · 有呼吸' },
      { key: 'C', label: '冷玻璃', blurb: '透 · 平 · 可以反光' },
      { key: 'D', label: '旧木头', blurb: '纹路 · 有痕 · 有故事' },
    ],
  },
];

// ───────────────────────── 答案与计算 ─────────────────────────

export type SoulAnswers = Partial<Record<SoulProbeId, 'A' | 'B' | 'C' | 'D' | 'SKIP'>>;

/** S = 1/6 × Σ exact_match · SKIP 计 0 但分母仍然 6 */
export function calcSoulResonance(a: SoulAnswers, b: SoulAnswers): number {
  const ids: SoulProbeId[] = ['music', 'quote', 'color', 'cinema', 'scent', 'touch'];
  let matches = 0;
  for (const id of ids) {
    const va = a[id];
    const vb = b[id];
    if (va && vb && va !== 'SKIP' && vb !== 'SKIP' && va === vb) {
      matches += 1;
    }
  }
  return matches / ids.length;
}

// ───────────────────────── G ⊕ S 双层叙事 ─────────────────────────

export type GSQuadrant =
  | 'soulmate-twin' // 高 G 高 S — 灵魂双星
  | 'cohort-stranger' // 高 G 低 S — 共轨陌生人
  | 'cross-star-recognition' // 低 G 高 S — 隔星相认
  | 'parallel-universe'; // 低 G 低 S — 平行宇宙

export interface GSReading {
  quadrant: GSQuadrant;
  title: string;
  narration: string;
  literaryQuote: string;
  /** 是否罕见（拿来做爆款话术） */
  rare: boolean;
}

export function readGS(g: number, s: number): GSReading {
  const highG = g >= 0.65;
  const highS = s >= 0.5;

  if (highG && highS) {
    return {
      quadrant: 'soulmate-twin',
      title: '灵魂双星 ⚭⚭',
      narration: '你们的人格相似，灵魂频率也共振——这种相遇约 0.3% 的概率。',
      literaryQuote: '「正因为我们不一样，我才知道你是你。」 — Le Petit Prince 改写',
      rare: true,
    };
  }
  if (highG && !highS) {
    return {
      quadrant: 'cohort-stranger',
      title: '共轨陌生人',
      narration:
        '你们看起来像同一种人，但听的歌、爱的句子完全不同——值得深聊，也值得保留各自的暗夜。',
      literaryQuote: '「我们是同一条河里的两块石头，被同一种水冲过。」',
      rare: false,
    };
  }
  if (!highG && highS) {
    return {
      quadrant: 'cross-star-recognition',
      title: '隔星相认',
      narration:
        '你们性格相反，但你们爱的东西惊人地一致。这是最奇怪也最深的连接——一种"我以为只有我懂"的相遇。',
      literaryQuote: '「我隔着银河看见你的灯，知道我们读同一本书。」',
      rare: true,
    };
  }
  return {
    quadrant: 'parallel-universe',
    title: '平行宇宙',
    narration: '你们活在不同的时区。互相敬意，互不打扰。',
    literaryQuote: '「我们只是同一片夜空下的不同星系。」',
    rare: false,
  };
}

/** 给 demo / preview 用的确定性 mock 答案（按 home slug 派生） */
export function mockSoulAnswers(seed: string): SoulAnswers {
  const ids: SoulProbeId[] = ['music', 'quote', 'color', 'cinema', 'scent', 'touch'];
  const keys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const ans: SoulAnswers = {};
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (const id of ids) {
    h = (h * 1103515245 + 12345) >>> 0;
    ans[id] = keys[h % 4];
  }
  return ans;
}

// ───────────────────────── URL 编/解码（6 字符 compact） ─────────────────────────

const SOUL_ORDER: SoulProbeId[] = ['music', 'quote', 'color', 'cinema', 'scent', 'touch'];
const KEY_TO_CHAR = { A: 'A', B: 'B', C: 'C', D: 'D', SKIP: '_' } as const;
const CHAR_TO_KEY: Record<string, 'A' | 'B' | 'C' | 'D' | 'SKIP'> = {
  A: 'A', B: 'B', C: 'C', D: 'D', _: 'SKIP',
};

/**
 * 把 6 题答案编为 6 字符（A-D / _），可塞进 URL。
 * 未答的题位用 '-'，跳过用 '_'。
 */
export function encodeSoulAnswers(answers: SoulAnswers): string {
  return SOUL_ORDER.map((id) => {
    const v = answers[id];
    if (!v) return '-';
    return KEY_TO_CHAR[v];
  }).join('');
}

/** 反向解析。容错：非法字符当作未答。 */
export function decodeSoulAnswers(code: string | undefined | null): SoulAnswers {
  if (!code || code.length === 0) return {};
  const ans: SoulAnswers = {};
  for (let i = 0; i < SOUL_ORDER.length; i += 1) {
    const ch = (code[i] ?? '-').toUpperCase();
    const key = CHAR_TO_KEY[ch];
    if (key) ans[SOUL_ORDER[i]] = key;
  }
  return ans;
}

/** 是否完整答完 6 题（含跳过算已答） */
export function isSoulComplete(answers: SoulAnswers): boolean {
  return SOUL_ORDER.every((id) => Boolean(answers[id]));
}
