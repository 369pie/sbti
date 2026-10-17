/**
 * Palm reading (P2): photo → structured lines → fixed text bank.
 * Deterministic: same image bytes + hand ⇒ same result (fingerprint seed).
 * Vision (optional) may refine overlay points; readings always from bank.
 * Photos never persisted.
 */

const TEXT_MODEL = process.env.APIMART_VISION_MODEL?.trim() || process.env.APIMART_TEXT_MODEL?.trim() || 'gpt-4o-mini';
const API_BASE = (process.env.APIMART_API_BASE || 'https://api.apimart.ai/v1').replace(/\/$/, '');

export type PalmHand = 'left' | 'right';
export type PalmLineKey = 'life' | 'head' | 'heart' | 'fate';
export type PalmLength = 'short' | 'medium' | 'long';
export type PalmQuality = 'clear' | 'broken' | 'forked' | 'faint';
export type PalmHandShape = 'earth' | 'air' | 'water' | 'fire';

export interface PalmLine {
  key: PalmLineKey;
  label: string;
  points: Array<{ x: number; y: number }>;
  length: PalmLength;
  quality: PalmQuality;
  reading: string;
}

export interface PalmReadingResult {
  hand: PalmHand;
  handShape: PalmHandShape;
  handShapeLabel: string;
  summary: string;
  lines: PalmLine[];
  stub: boolean;
  fingerprint: string;
}

const HAND_SHAPE_LABEL: Record<PalmHandShape, string> = {
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

/** Fixed bank: exactly one string per (line × length × quality). */
const BANK: Record<PalmLineKey, Record<PalmLength, Record<PalmQuality, string>>> = {
  life: {
    short: {
      clear: '生命线偏短而清晰：你活得用力，也懂得在关键节点停下来充电。',
      broken: '生命线偏短且有断续：你经历过重启，每次起来都更懂自己的节奏。',
      forked: '生命线偏短有分叉：你常想同时走两条路——先把一条走稳再分岔。',
      faint: '生命线偏短偏淡：别把自己过成别人期待的样子，身体信号更重要。',
    },
    medium: {
      clear: '生命线清晰中等：日常里你比自己以为的更有韧性。',
      broken: '生命线中等有断点：提醒你，休息不是偷懒，是续航。',
      forked: '生命线中等分叉：精力分配是你的课题，学会说「这次只做一件」。',
      faint: '生命线中等偏淡：把力气留给真正养人的人和事。',
    },
    long: {
      clear: '生命线长而清晰：长期主义适合你——慢慢来，比较快。',
      broken: '生命线长但有波折：路远不怕，怕的是不承认自己累。',
      forked: '生命线长且分叉：你有不止一种活法，不必抄标准答案。',
      faint: '生命线长而淡：寿命感是隐喻——请把温柔也留给未来的自己。',
    },
  },
  head: {
    short: {
      clear: '智慧线偏短清晰：决策快；记得给情绪留一点缓冲。',
      broken: '智慧线偏短有断：你换过思维方式，这是成长不是缺陷。',
      forked: '智慧线偏短分叉：直觉与逻辑会打架——先听身体再说。',
      faint: '智慧线偏短偏淡：少分析，多感受，往往更准。',
    },
    medium: {
      clear: '智慧线清楚中等：想明白再行动，也要允许「先试试」。',
      broken: '智慧线中等断续：换赛道时别急着否定过去的自己。',
      forked: '智慧线中等分叉：创意和逻辑你两边都能用。',
      faint: '智慧线中等偏淡：别把简单的事想复杂。',
    },
    long: {
      clear: '智慧线长而清晰：想得深是优点，也记得落地。',
      broken: '智慧线长有断点：大转折后你的判断会更成熟。',
      forked: '智慧线长且分叉：别逼自己只站理性或只站感受。',
      faint: '智慧线长而淡：深度思考需要休息，否则会空转。',
    },
  },
  heart: {
    short: {
      clear: '感情线偏短清晰：你重质不重量；一个人也很好，两个人要很对。',
      broken: '感情线偏短有伤：伤过也学会了边界——这是资产。',
      forked: '感情线偏短分叉：心软与警惕并存，先对自己诚实。',
      faint: '感情线偏短偏淡：亲密里你更需要安全感而不是热闹。',
    },
    medium: {
      clear: '感情线清晰中等：你对关系认真，也值得被认真对待。',
      broken: '感情线中等波折：爱过就好，不必反复自我审判。',
      forked: '感情线中等分叉：你可以爱得克制，但真。',
      faint: '感情线中等偏淡：把共情留给值得的人。',
    },
    long: {
      clear: '感情线长而清晰：共情力强——记得把温柔也留给自己。',
      broken: '感情线长有断：深情过，也更懂什么叫合适。',
      forked: '感情线长且分叉：情感世界丰富，边界要画清楚。',
      faint: '感情线长而淡：敏感是天赋，不是弱点。',
    },
  },
  fate: {
    short: {
      clear: '命运线偏短清晰：近期适合把一件小事做完，而不是规划十年。',
      broken: '命运线偏短断续：路径会拐弯；拐弯不等于迷路。',
      forked: '命运线偏短分叉：你有不止一种成事方式。',
      faint: '命运线偏短偏淡：路是走出来的，不是刻出来的。',
    },
    medium: {
      clear: '命运线清楚中等：你对「要去哪」隐约有底，差的是迈步。',
      broken: '命运线中等断续：节奏在你自己手里。',
      forked: '命运线中等分叉：主线可以换，心意不用丢。',
      faint: '命运线中等偏淡：少比较，按自己的日历走。',
    },
    long: {
      clear: '命运线长而清晰：长期课题适合你慢慢耕。',
      broken: '命运线长有波折：大器可以晚成，别急着证明。',
      forked: '命运线长且分叉：并行人生也可以很美。',
      faint: '命运线长而淡：自由感强——别被「应该」绑住。',
    },
  },
};

const SUMMARIES: Record<PalmHandShape, string> = {
  earth: '土质手：务实、有耐心。掌纹像日记草稿——线不完美，但真诚。娱乐向自照，非命运断言。',
  air: '气质手：思维活、表达欲强。今天先记住：你比掌纹更自由。',
  water: '水质手：敏感、共情深。四条主线只供自照，不必当真预言。',
  fire: '火质手：行动快、热情足。重要的是你愿不愿意对自己温柔一点。',
};

const LINE_KEYS: PalmLineKey[] = ['life', 'head', 'heart', 'fate'];
const LENGTHS: PalmLength[] = ['short', 'medium', 'long'];
const QUALITIES: PalmQuality[] = ['clear', 'broken', 'forked', 'faint'];
const SHAPES: PalmHandShape[] = ['earth', 'air', 'water', 'fire'];

/** Stable fingerprint from image payload (same bytes ⇒ same hex). */
export function fingerprintImageDataUrl(imageDataUrl: string): string {
  const comma = imageDataUrl.indexOf(',');
  const payload = comma >= 0 ? imageDataUrl.slice(comma + 1) : imageDataUrl;
  // FNV-1a over sampled chars for speed + stability
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0x9e3779b9;
  const step = Math.max(1, Math.floor(payload.length / 4096));
  for (let i = 0; i < payload.length; i += step) {
    const c = payload.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= payload.charCodeAt(Math.min(payload.length - 1, i + (step >> 1)));
    h2 = Math.imul(h2, 0x01000193);
  }
  h1 ^= payload.length;
  h2 ^= payload.length << 1;
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromFingerprint(hand: PalmHand, fingerprint: string): number {
  let h = 0x811c9dc5;
  const s = `${hand}|${fingerprint}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function readingFor(key: PalmLineKey, length: PalmLength, quality: PalmQuality): string {
  return BANK[key][length][quality];
}

function buildDeterministicStructure(hand: PalmHand, fingerprint: string): Omit<PalmReadingResult, 'stub'> {
  const rand = mulberry32(seedFromFingerprint(hand, fingerprint));
  const handShape = SHAPES[Math.floor(rand() * SHAPES.length) % SHAPES.length];
  const lines: PalmLine[] = LINE_KEYS.map((key) => {
    const length = LENGTHS[Math.floor(rand() * LENGTHS.length) % LENGTHS.length];
    const quality = QUALITIES[Math.floor(rand() * QUALITIES.length) % QUALITIES.length];
    return {
      key,
      label: LINE_LABEL[key],
      points: LINE_PATHS[key],
      length,
      quality,
      reading: readingFor(key, length, quality),
    };
  });
  return {
    hand,
    handShape,
    handShapeLabel: HAND_SHAPE_LABEL[handShape],
    summary: SUMMARIES[handShape],
    lines,
    fingerprint,
  };
}

function isLength(v: unknown): v is PalmLength {
  return v === 'short' || v === 'medium' || v === 'long';
}
function isQuality(v: unknown): v is PalmQuality {
  return v === 'clear' || v === 'broken' || v === 'forked' || v === 'faint';
}
function isShape(v: unknown): v is PalmHandShape {
  return v === 'earth' || v === 'air' || v === 'water' || v === 'fire';
}
function isKey(v: unknown): v is PalmLineKey {
  return v === 'life' || v === 'head' || v === 'heart' || v === 'fate';
}

/** Map any structured attrs through fixed bank (readings never free-form). */
export function mapThroughFixedBank(
  hand: PalmHand,
  fingerprint: string,
  partial: {
    handShape?: PalmHandShape;
    lines?: Array<{
      key: PalmLineKey;
      length: PalmLength;
      quality: PalmQuality;
      points?: Array<{ x: number; y: number }>;
    }>;
  },
  stub: boolean,
): PalmReadingResult {
  const fallback = buildDeterministicStructure(hand, fingerprint);
  const handShape = partial.handShape && isShape(partial.handShape) ? partial.handShape : fallback.handShape;
  const byKey = new Map(partial.lines?.map((l) => [l.key, l]) ?? []);
  const lines = LINE_KEYS.map((key, i) => {
    const src = byKey.get(key);
    const length = src && isLength(src.length) ? src.length : fallback.lines[i].length;
    const quality = src && isQuality(src.quality) ? src.quality : fallback.lines[i].quality;
    let points = LINE_PATHS[key];
    if (src?.points && src.points.length >= 2) {
      points = src.points.map((p) => ({
        x: Math.min(1, Math.max(0, p.x)),
        y: Math.min(1, Math.max(0, p.y)),
      }));
    }
    return {
      key,
      label: LINE_LABEL[key],
      points,
      length,
      quality,
      reading: readingFor(key, length, quality),
    };
  });
  return {
    hand,
    handShape,
    handShapeLabel: HAND_SHAPE_LABEL[handShape],
    summary: SUMMARIES[handShape],
    lines,
    stub,
    fingerprint,
  };
}

const SYSTEM = `你是掌纹结构标注器。只输出 JSON（不要 markdown）：
{"handShape":"earth"|"air"|"water"|"fire","lines":[{"key":"life"|"head"|"heart"|"fate","length":"short"|"medium"|"long","quality":"clear"|"broken"|"forked"|"faint","points":[{"x":0-1,"y":0-1},...]}]}
必须含四条线。不要写解读文案。看不清则 quality=faint。`;

async function visionStructure(
  imageDataUrl: string,
  hand: PalmHand,
): Promise<{
  handShape?: PalmHandShape;
  lines?: Array<{ key: PalmLineKey; length: PalmLength; quality: PalmQuality; points?: Array<{ x: number; y: number }> }>;
} | null> {
  const apiKey = process.env.APIMART_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: TEXT_MODEL,
        temperature: 0,
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: [
              { type: 'text', text: `${hand === 'left' ? '左' : '右'}手掌。只输出结构 JSON。` },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = (data.choices?.[0]?.message?.content ?? '').trim();
    if (!text) return null;
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const linesRaw = Array.isArray(parsed.lines) ? parsed.lines : [];
    const lines: Array<{
      key: PalmLineKey;
      length: PalmLength;
      quality: PalmQuality;
      points?: Array<{ x: number; y: number }>;
    }> = [];
    for (const item of linesRaw) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      if (!isKey(row.key) || !isLength(row.length) || !isQuality(row.quality)) continue;
      let points: Array<{ x: number; y: number }> | undefined;
      if (Array.isArray(row.points)) {
        points = row.points
          .map((p) => {
            if (!p || typeof p !== 'object') return null;
            const pt = p as Record<string, unknown>;
            if (typeof pt.x !== 'number' || typeof pt.y !== 'number') return null;
            return { x: pt.x, y: pt.y };
          })
          .filter((p): p is { x: number; y: number } => !!p);
      }
      lines.push({ key: row.key, length: row.length, quality: row.quality, points });
    }
    return {
      handShape: isShape(parsed.handShape) ? parsed.handShape : undefined,
      lines: lines.length ? lines : undefined,
    };
  } catch (err) {
    console.warn('[palm-reading] vision failed', err instanceof Error ? err.message : err);
    return null;
  }
}

export function stubPalmReading(hand: PalmHand, imageDataUrl: string): PalmReadingResult {
  const fingerprint = fingerprintImageDataUrl(imageDataUrl);
  return { ...buildDeterministicStructure(hand, fingerprint), stub: true };
}

export async function analyzePalmFromImage(params: {
  imageDataUrl: string;
  hand: PalmHand;
}): Promise<PalmReadingResult> {
  const fingerprint = fingerprintImageDataUrl(params.imageDataUrl);
  const vision = await visionStructure(params.imageDataUrl, params.hand);
  if (!vision) {
    return { ...buildDeterministicStructure(params.hand, fingerprint), stub: true };
  }
  // Structure may come from vision, but readings always fixed-bank; for same-hand
  // consistency across re-uploads of identical bytes, prefer fingerprint structure
  // for length/quality/shape, and only take vision points for overlay.
  const deterministic = buildDeterministicStructure(params.hand, fingerprint);
  const visionByKey = new Map(vision.lines?.map((l) => [l.key, l]) ?? []);
  const mergedLines = deterministic.lines.map((line) => {
    const v = visionByKey.get(line.key);
    if (v?.points && v.points.length >= 2) {
      return {
        ...line,
        points: v.points.map((p) => ({
          x: Math.min(1, Math.max(0, p.x)),
          y: Math.min(1, Math.max(0, p.y)),
        })),
      };
    }
    return line;
  });
  return {
    ...deterministic,
    lines: mergedLines,
    stub: false,
  };
}

export function serializePalmSummary(reading: PalmReadingResult): Record<string, unknown> {
  return {
    fingerprint: reading.fingerprint,
    hand: reading.hand,
    handShape: reading.handShape,
    summary: reading.summary,
    stub: reading.stub,
    lines: reading.lines.map((l) => ({
      key: l.key,
      length: l.length,
      quality: l.quality,
      reading: l.reading,
      points: l.points,
    })),
    savedAt: new Date().toISOString(),
  };
}

export function readingFromStoredSummary(
  stored: Record<string, unknown>,
  hand: PalmHand,
  fingerprint: string,
): PalmReadingResult | null {
  if (stored.fingerprint !== fingerprint || stored.hand !== hand) return null;
  if (!Array.isArray(stored.lines)) return null;
  const handShape = isShape(stored.handShape) ? stored.handShape : 'water';
  const lines: PalmLine[] = [];
  for (const key of LINE_KEYS) {
    const row = (stored.lines as Array<Record<string, unknown>>).find((l) => l.key === key);
    const length = row && isLength(row.length) ? row.length : 'medium';
    const quality = row && isQuality(row.quality) ? row.quality : 'clear';
    let points = LINE_PATHS[key];
    if (Array.isArray(row?.points) && row.points.length >= 2) {
      points = (row.points as Array<{ x: number; y: number }>).map((p) => ({
        x: Math.min(1, Math.max(0, Number(p.x) || 0)),
        y: Math.min(1, Math.max(0, Number(p.y) || 0)),
      }));
    }
    lines.push({
      key,
      label: LINE_LABEL[key],
      points,
      length,
      quality,
      reading: readingFor(key, length, quality),
    });
  }
  return {
    hand,
    handShape,
    handShapeLabel: HAND_SHAPE_LABEL[handShape],
    summary: typeof stored.summary === 'string' ? stored.summary : SUMMARIES[handShape],
    lines,
    stub: Boolean(stored.stub),
    fingerprint,
  };
}
