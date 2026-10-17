/**
 * Color season lite (P2 stub slice): optional selfie + preference answers
 * → season label. Vision path when key present; otherwise rule/stub.
 * Photos never persisted.
 */

const TEXT_MODEL = process.env.APIMART_VISION_MODEL?.trim() || process.env.APIMART_TEXT_MODEL?.trim() || 'gpt-4o-mini';
const API_BASE = (process.env.APIMART_API_BASE || 'https://api.apimart.ai/v1').replace(/\/$/, '');

export type ColorSeasonId = '暖春' | '冷夏' | '暖秋' | '冷冬';

export interface ColorSeasonResult {
  season: ColorSeasonId;
  seasonEn: string;
  summary: string;
  doColors: string[];
  avoidColors: string[];
  makeupTip: string;
  stub: boolean;
}

const SEASON_META: Record<
  ColorSeasonId,
  Omit<ColorSeasonResult, 'season' | 'stub'>
> = {
  暖春: {
    seasonEn: 'Warm Spring',
    summary: '你偏暖春：肤色带暖意，柔亮的珊瑚、蜜桃、草绿最衬你。',
    doColors: ['蜜桃杏', '珊瑚橘', '暖草绿', '象牙米'],
    avoidColors: ['正黑', '冷灰紫', '冰蓝'],
    makeupTip: '唇色选暖裸粉或杏橘，腮红往苹果肌中间拍。',
  },
  冷夏: {
    seasonEn: 'Cool Summer',
    summary: '你偏冷夏：低饱和冷调最显白，雾霾蓝、豆沙、灰粉是你的朋友。',
    doColors: ['雾霾蓝', '豆沙玫', '薰衣灰紫', '烟灰粉'],
    avoidColors: ['亮橘', '番茄红', '姜黄'],
    makeupTip: '今天试试低饱和豆沙唇，眼线淡一点。',
  },
  暖秋: {
    seasonEn: 'Warm Autumn',
    summary: '你偏暖秋：大地色与焦糖最稳，质感比鲜艳更重要。',
    doColors: ['焦糖棕', '橄榄绿', '南瓜橘', '奶油驼'],
    avoidColors: ['荧光粉', '纯白冷光', '电光蓝'],
    makeupTip: '暖棕眼影扫满眼窝，唇用砖红或裸棕。',
  },
  冷冬: {
    seasonEn: 'Cool Winter',
    summary: '你偏冷冬：高对比冷色更有精神，酒红、正红、墨黑都能镇得住。',
    doColors: ['酒红', '正红', '冷黑', '雪白'],
    avoidColors: ['土橘色', '姜黄', '脏橄榄'],
    makeupTip: '唇可以大胆一点：正红或冷梅，眉形干净利落。',
  },
};

export type VeinTone = 'cool' | 'warm' | 'neutral';
export type ContrastLevel = 'low' | 'mid' | 'high';
export type MetalPref = 'silver' | 'gold' | 'both';

export interface ColorSeasonInput {
  veinTone: VeinTone;
  contrast: ContrastLevel;
  metal: MetalPref;
  imageDataUrl?: string | null;
}

function ruleSeason(input: ColorSeasonInput): ColorSeasonId {
  // Simple rule matrix — deterministic for stub path.
  if (input.veinTone === 'cool') {
    return input.contrast === 'high' ? '冷冬' : '冷夏';
  }
  if (input.veinTone === 'warm') {
    return input.contrast === 'high' || input.metal === 'gold' ? '暖秋' : '暖春';
  }
  // neutral
  if (input.metal === 'silver') return input.contrast === 'high' ? '冷冬' : '冷夏';
  if (input.metal === 'gold') return input.contrast === 'low' ? '暖春' : '暖秋';
  return '冷夏';
}

export function stubColorSeason(input: ColorSeasonInput): ColorSeasonResult {
  const season = ruleSeason(input);
  return { season, ...SEASON_META[season], stub: true };
}

const SYSTEM = `你是 WTFTI「美我·色彩季型」助手。根据用户自拍（可选）与问卷，判断四季型之一：暖春/冷夏/暖秋/冷冬。
只输出 JSON：{"season":"暖春"|"冷夏"|"暖秋"|"冷冬","summary":"中文一句"}。
闺蜜语气，禁止恐吓与玄学恐吓词。看不清就依据问卷。`;

export async function diagnoseColorSeason(input: ColorSeasonInput): Promise<ColorSeasonResult> {
  const fallback = stubColorSeason(input);
  const apiKey = process.env.APIMART_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !input.imageDataUrl) {
    return fallback;
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
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `问卷：血管观感=${input.veinTone}，对比度=${input.contrast}，金属偏好=${input.metal}。请判断季型。`,
              },
              { type: 'image_url', image_url: { url: input.imageDataUrl } },
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
    const parsed = JSON.parse(text) as { season?: string; summary?: string };
    const seasons: ColorSeasonId[] = ['暖春', '冷夏', '暖秋', '冷冬'];
    if (!parsed.season || !seasons.includes(parsed.season as ColorSeasonId)) return fallback;
    const season = parsed.season as ColorSeasonId;
    return {
      season,
      ...SEASON_META[season],
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim()
          ? parsed.summary.trim().slice(0, 120)
          : SEASON_META[season].summary,
      stub: false,
    };
  } catch (err) {
    console.warn('[mirror/color-season] failed', err instanceof Error ? err.message : err);
    return fallback;
  }
}
