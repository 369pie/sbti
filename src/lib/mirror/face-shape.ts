/**
 * Face shape + makeup advice (P2).
 * No MediaPipe dep (heavy) — vision LLM when keyed, else rule questionnaire + fixed library.
 * Photos never persisted.
 */

const TEXT_MODEL = process.env.APIMART_VISION_MODEL?.trim() || process.env.APIMART_TEXT_MODEL?.trim() || 'gpt-4o-mini';
const API_BASE = (process.env.APIMART_API_BASE || 'https://api.apimart.ai/v1').replace(/\/$/, '');

export type FaceShapeId = 'oval' | 'round' | 'square' | 'heart' | 'long' | 'diamond';

export type FaceSelfHint = {
  jaw: 'soft' | 'angular' | 'pointed';
  cheek: 'full' | 'flat' | 'high';
  length: 'short' | 'balanced' | 'long';
};

export interface FaceMakeupResult {
  shape: FaceShapeId;
  shapeLabel: string;
  summary: string;
  makeup: string[];
  hair: string[];
  avoid: string[];
  stub: boolean;
}

const LIB: Record<FaceShapeId, Omit<FaceMakeupResult, 'shape' | 'stub'>> = {
  oval: {
    shapeLabel: '鹅蛋脸',
    summary: '比例均衡，大多数妆发都友好——重点是「不要破坏平衡」。',
    makeup: ['腮红点在苹果肌外侧，斜向上轻扫', '唇形可略丰满，避免过尖的唇峰', '眉形自然弧度即可，别画太挑'],
    hair: ['中分或七分均可', '锁骨发与长直发都很衬', '刘海可薄可无'],
    avoid: ['过多的下庭阴影会显脸长', '过度高颅顶造型可能抢戏'],
  },
  round: {
    shapeLabel: '圆脸',
    summary: '柔和饱满，适合用阴影与发型「拉长」视觉中心。',
    makeup: ['修容贴太阳穴与下颌角外侧', '腮红偏上、靠近外眼角方向', '眉峰略抬，增加立体'],
    hair: ['侧分或层次长发', '高马尾 / 半扎发拉长脸型', '避免过于饱满的齐刘海厚重感'],
    avoid: ['大面积腮红打在脸中', '齐耳短发若无层次会更圆'],
  },
  square: {
    shapeLabel: '方脸',
    summary: '下颌有力量感，柔化线条比「削骨感」更重要。',
    makeup: ['下颌角用浅阴影晕开，不要硬边', '腮红圆形扫在苹果肌', '眉形圆润，减少锋利感'],
    hair: ['锁骨卷或大波浪柔化', '侧分刘海遮一点额角', '避免贴头皮的超短寸'],
    avoid: ['过重的下庭高光', '一字眉 + 锋利眼线叠加'],
  },
  heart: {
    shapeLabel: '心形脸',
    summary: '上庭丰、下庭尖，重点是「托住下巴、平衡额头」。',
    makeup: ['下巴两侧轻点高光，视觉拓宽下庭', '腮红位置略低、横向', '眉头不要太宽'],
    hair: ['下巴长度的波波头很友好', '刘海减轻额头宽度', '避免过度头顶增高'],
    avoid: ['过多的上庭高光', '过尖的唇形再强调下巴'],
  },
  long: {
    shapeLabel: '长脸',
    summary: '纵向有余，用横向元素「切短」视觉长度。',
    makeup: ['腮红横向扫，增加宽度感', '避免过长的眼线向外拉', '唇色饱满，焦点放在中庭'],
    hair: ['齐刘海或帘状刘海', '中长发微卷增加侧体积', '避免中分超直长发一通到底'],
    avoid: ['高颅顶紧致马尾', '过尖的下庭修容'],
  },
  diamond: {
    shapeLabel: '菱形脸',
    summary: '颧骨突出、上下收，重点柔化中庭、拓宽额与下颌。',
    makeup: ['颧骨不要再提亮太多', '太阳穴与下颌轻提亮', '眉形平缓，减少锐角'],
    hair: ['额前有软量的空气刘海', '下巴附近的卷度拓宽下庭', '避免把头发全部往后紧束'],
    avoid: ['强调颧骨的高光条', '过尖的下庭阴影'],
  },
};

export function ruleFaceShape(hint: FaceSelfHint): FaceShapeId {
  if (hint.length === 'long' && hint.cheek !== 'full') return 'long';
  if (hint.jaw === 'pointed' && hint.cheek === 'full') return 'heart';
  if (hint.jaw === 'angular' && hint.cheek === 'high') return 'diamond';
  if (hint.jaw === 'angular') return 'square';
  if (hint.cheek === 'full' && hint.length === 'short') return 'round';
  if (hint.length === 'balanced' && hint.jaw === 'soft') return 'oval';
  if (hint.cheek === 'full') return 'round';
  if (hint.jaw === 'pointed') return 'heart';
  return 'oval';
}

export function stubFaceMakeup(hint: FaceSelfHint): FaceMakeupResult {
  const shape = ruleFaceShape(hint);
  return { shape, ...LIB[shape], stub: true };
}

const SYSTEM = `你是 WTFTI 妆容顾问。根据自拍判断脸型：oval/round/square/heart/long/diamond。
只输出 JSON：{"shape":"...","summary":"中文一句"}。闺蜜语气，禁止恐吓。`;

export async function diagnoseFaceMakeup(params: {
  hint: FaceSelfHint;
  imageDataUrl?: string | null;
}): Promise<FaceMakeupResult> {
  const fallback = stubFaceMakeup(params.hint);
  const apiKey = process.env.APIMART_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !params.imageDataUrl) return fallback;

  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: TEXT_MODEL,
        temperature: 0.2,
        max_tokens: 180,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `自述：下颌=${params.hint.jaw}，颧骨=${params.hint.cheek}，脸长=${params.hint.length}`,
              },
              { type: 'image_url', image_url: { url: params.imageDataUrl } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(40_000),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = (data.choices?.[0]?.message?.content ?? '').trim();
    if (!text) return fallback;
    const parsed = JSON.parse(text) as { shape?: string; summary?: string };
    const shapes = Object.keys(LIB) as FaceShapeId[];
    if (!parsed.shape || !shapes.includes(parsed.shape as FaceShapeId)) return fallback;
    const shape = parsed.shape as FaceShapeId;
    return {
      shape,
      ...LIB[shape],
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim()
          ? parsed.summary.trim().slice(0, 120)
          : LIB[shape].summary,
      stub: false,
    };
  } catch (err) {
    console.warn('[face-shape] failed', err instanceof Error ? err.message : err);
    return fallback;
  }
}
