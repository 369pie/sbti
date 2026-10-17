/**
 * Palm reading (P2 · refocus §4.1): photo → vision LLM → structured JSON
 * OR stub-safe deterministic path when API key missing / upstream fails.
 * Photos are never persisted — caller must discard the data URL after the request.
 */

const TEXT_MODEL = process.env.APIMART_VISION_MODEL?.trim() || process.env.APIMART_TEXT_MODEL?.trim() || 'gpt-4o-mini';
const API_BASE = (process.env.APIMART_API_BASE || 'https://api.apimart.ai/v1').replace(/\/$/, '');

export type PalmHand = 'left' | 'right';

export type PalmLineKey = 'life' | 'head' | 'heart' | 'fate';

export interface PalmLine {
  key: PalmLineKey;
  label: string;
  /** Normalized path points 0–1 relative to palm photo box (for SVG overlay). */
  points: Array<{ x: number; y: number }>;
  length: 'short' | 'medium' | 'long';
  quality: 'clear' | 'broken' | 'forked' | 'faint';
  reading: string;
}

export interface PalmReadingResult {
  hand: PalmHand;
  handShape: 'earth' | 'air' | 'water' | 'fire';
  handShapeLabel: string;
  summary: string;
  lines: PalmLine[];
  stub: boolean;
}

const HAND_SHAPE_LABEL: Record<PalmReadingResult['handShape'], string> = {
  earth: '土质手',
  air: '气质手',
  water: '水质手',
  fire: '火质手',
};

const LINE_LABEL: Record<PalmLineKey, string> = {
  life: '生命线',
  head: '智慧线',
  heart: '感情线',
  fate: '命运线',
};

/** Fixed overlay templates (normalized). Vision may nudge; stub uses these. */
const LINE_PATHS: Record<PalmLineKey, Array<{ x: number; y: number }>> = {
  life: [
    { x: 0.42, y: 0.18 },
    { x: 0.28, y: 0.38 },
    { x: 0.22, y: 0.62 },
    { x: 0.26, y: 0.88 },
  ],
  head: [
    { x: 0.22, y: 0.42 },
    { x: 0.48, y: 0.48 },
    { x: 0.72, y: 0.52 },
    { x: 0.88, y: 0.55 },
  ],
  heart: [
    { x: 0.28, y: 0.28 },
    { x: 0.52, y: 0.26 },
    { x: 0.78, y: 0.3 },
    { x: 0.92, y: 0.36 },
  ],
  fate: [
    { x: 0.52, y: 0.92 },
    { x: 0.5, y: 0.68 },
    { x: 0.48, y: 0.42 },
    { x: 0.46, y: 0.22 },
  ],
};

const READINGS: Record<PalmLineKey, Record<string, string[]>> = {
  life: {
    clear: ['生命线清晰，你对节奏很有数——累了会停，不会硬扛到崩。', '生命线稳，适合把精力花在真正养人的事上。'],
    broken: ['生命线有断续，说明你经历过重启；每次起来都更懂自己。', '生命线不太连贯，提醒你：身体信号比 deadline 更重要。'],
    forked: ['生命线有分叉，你常常同时想很多条路——选一条走完再分岔也行。'],
    faint: ['生命线偏淡，别把自己过成「别人期待的样子」。'],
    short: ['生命线偏短，不代表什么凶——更像是你活得用力、也需要及时充电。'],
    medium: ['生命线中等偏稳，日常里你比自己以为的更有韧性。'],
    long: ['生命线偏长，长期主义适合你：慢慢来，比较快。'],
  },
  head: {
    clear: ['智慧线清楚，你习惯想明白再行动——有时也要允许「先试试」。'],
    broken: ['智慧线有断点，说明你换过思维方式；这是成长，不是缺陷。'],
    forked: ['智慧线分叉，创意和逻辑你两边都能用，别逼自己只站一边。'],
    faint: ['智慧线偏淡，直觉往往比硬分析更靠谱。'],
    short: ['智慧线偏短，决策快；记得给情绪留一点缓冲。'],
    medium: ['智慧线中等，理性与感受能轮流上场。'],
    long: ['智慧线偏长，想得深——但别把简单的事想复杂。'],
  },
  heart: {
    clear: ['感情线清晰，你对关系认真，也值得被认真对待。'],
    broken: ['感情线有波折痕迹，伤过也学会了边界——这是资产。'],
    forked: ['感情线分叉，你容易同时心软又警惕；先对自己诚实就好。'],
    faint: ['感情线偏淡，亲密关系里你更需要安全感而不是热闹。'],
    short: ['感情线偏短，你重质不重量；一个人也很好，两个人要很对。'],
    medium: ['感情线中等，爱得克制但真。'],
    long: ['感情线偏长，共情力强——记得把温柔也留给自己。'],
  },
  fate: {
    clear: ['命运线清楚，你对「自己要去哪」隐约有底，差的是迈步。'],
    broken: ['命运线断续，路径会拐弯；拐弯不等于迷路。'],
    forked: ['命运线分叉，你有不止一种成事方式，不必抄一条标准答案。'],
    faint: ['命运线偏淡，说明你更自由——路是走出来的，不是刻出来的。'],
    short: ['命运线偏短，近期更适合把一件小事做完，而不是规划十年。'],
    medium: ['命运线中等，节奏在你自己手里。'],
    long: ['命运线偏长，长期课题适合你慢慢耕。'],
  },
};

const SUMMARIES = [
  '你的掌纹像一本还在写的日记：线不完美，但真诚。今天先记住一句——你比掌纹更自由。',
  '四条主线告诉我：你敏感、有主见，也需要被接住。这份阅读只供自照，不必当真预言。',
  '手心里的纹路像地图草稿。重要的不是「准不准」，而是你愿不愿意对自己温柔一点。',
];

function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: number, salt: number): T {
  return arr[(seed + salt) % arr.length];
}

function buildLine(key: PalmLineKey, seed: number, index: number): PalmLine {
  const qualities = ['clear', 'broken', 'forked', 'faint'] as const;
  const lengths = ['short', 'medium', 'long'] as const;
  const quality = pick(qualities, seed, index * 17 + 3);
  const length = pick(lengths, seed, index * 31 + 7);
  const bank = READINGS[key];
  const byQuality = bank[quality] ?? bank.clear;
  const byLength = bank[length] ?? bank.medium;
  const reading = index % 2 === 0 ? pick(byQuality, seed, index) : pick(byLength, seed, index + 9);
  return {
    key,
    label: LINE_LABEL[key],
    points: LINE_PATHS[key],
    length,
    quality,
    reading,
  };
}

export function stubPalmReading(hand: PalmHand, seedSource: string): PalmReadingResult {
  const seed = hashStr(`${hand}|${seedSource}`);
  const shapes = ['earth', 'air', 'water', 'fire'] as const;
  const handShape = pick(shapes, seed, 1);
  const keys: PalmLineKey[] = ['life', 'head', 'heart', 'fate'];
  return {
    hand,
    handShape,
    handShapeLabel: HAND_SHAPE_LABEL[handShape],
    summary: pick(SUMMARIES, seed, 5),
    lines: keys.map((k, i) => buildLine(k, seed, i)),
    stub: true,
  };
}

const SYSTEM = `你是 WTFTI「美我·掌纹」助手。用户上传了一张手掌照片（仅本次分析，不入库）。
输出严格 JSON（不要 markdown 围栏），字段：
{
  "handShape": "earth"|"air"|"water"|"fire",
  "summary": "中文 1-2 句，闺蜜语气，禁止宇宙/神域/恐吓",
  "lines": [
    {
      "key": "life"|"head"|"heart"|"fate",
      "length": "short"|"medium"|"long",
      "quality": "clear"|"broken"|"forked"|"faint",
      "reading": "中文一句温柔解读",
      "points": [{"x":0-1,"y":0-1}, ...]  // 4 个点，相对照片框，用于在掌图上画线
    }
  ]
}
必须包含 life/head/heart/fate 四条。points 大致落在掌心区域。若看不清手掌，仍给温和通用解读并 quality 用 faint。`;

function isPalmKey(v: unknown): v is PalmLineKey {
  return v === 'life' || v === 'head' || v === 'heart' || v === 'fate';
}

function parseVisionResult(raw: unknown, hand: PalmHand): PalmReadingResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const shapes = ['earth', 'air', 'water', 'fire'] as const;
  const handShape = shapes.includes(o.handShape as (typeof shapes)[number])
    ? (o.handShape as (typeof shapes)[number])
    : 'water';
  const summary = typeof o.summary === 'string' && o.summary.trim() ? o.summary.trim().slice(0, 200) : null;
  if (!summary || !Array.isArray(o.lines)) return null;

  const byKey = new Map<PalmLineKey, PalmLine>();
  for (const item of o.lines) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (!isPalmKey(row.key)) continue;
    const length =
      row.length === 'short' || row.length === 'medium' || row.length === 'long' ? row.length : 'medium';
    const quality =
      row.quality === 'clear' || row.quality === 'broken' || row.quality === 'forked' || row.quality === 'faint'
        ? row.quality
        : 'faint';
    let points = LINE_PATHS[row.key];
    if (Array.isArray(row.points) && row.points.length >= 2) {
      const parsed = row.points
        .map((p) => {
          if (!p || typeof p !== 'object') return null;
          const pt = p as Record<string, unknown>;
          const x = typeof pt.x === 'number' ? pt.x : null;
          const y = typeof pt.y === 'number' ? pt.y : null;
          if (x === null || y === null) return null;
          return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
        })
        .filter((p): p is { x: number; y: number } => !!p);
      if (parsed.length >= 2) points = parsed;
    }
    const reading =
      typeof row.reading === 'string' && row.reading.trim()
        ? row.reading.trim().slice(0, 120)
        : buildLine(row.key, 1, 0).reading;
    byKey.set(row.key, {
      key: row.key,
      label: LINE_LABEL[row.key],
      points,
      length,
      quality,
      reading,
    });
  }

  const keys: PalmLineKey[] = ['life', 'head', 'heart', 'fate'];
  const lines = keys.map((k, i) => byKey.get(k) ?? buildLine(k, 42, i));

  return {
    hand,
    handShape,
    handShapeLabel: HAND_SHAPE_LABEL[handShape],
    summary,
    lines,
    stub: false,
  };
}

export async function analyzePalmFromImage(params: {
  imageDataUrl: string;
  hand: PalmHand;
}): Promise<PalmReadingResult> {
  const seedSource = `${params.hand}|${params.imageDataUrl.length}|${params.imageDataUrl.slice(0, 64)}`;
  const apiKey = process.env.APIMART_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return stubPalmReading(params.hand, seedSource);
  }

  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        temperature: 0.4,
        max_tokens: 900,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `这是${params.hand === 'left' ? '左' : '右'}手掌照片。请按 JSON schema 输出掌纹结构化结果。`,
              },
              { type: 'image_url', image_url: { url: params.imageDataUrl } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      console.warn('[mirror/palm-reading] upstream', res.status);
      return stubPalmReading(params.hand, seedSource);
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = (data.choices?.[0]?.message?.content ?? '').trim();
    if (!text) return stubPalmReading(params.hand, seedSource);

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start >= 0 && end > start) parsed = JSON.parse(text.slice(start, end + 1));
      else return stubPalmReading(params.hand, seedSource);
    }

    return parseVisionResult(parsed, params.hand) ?? stubPalmReading(params.hand, seedSource);
  } catch (err) {
    console.warn('[mirror/palm-reading] failed', err instanceof Error ? err.message : err);
    return stubPalmReading(params.hand, seedSource);
  }
}
