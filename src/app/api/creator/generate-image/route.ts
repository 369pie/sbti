import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/creator/generate-image — AI personality image generation via RunningHub.
 *
 * Body: { universeId, personalitySlug, personalityName, prompt?, style? }
 *
 * Requires: RUNNINGHUB_API_KEY env var.
 * Rate limit: per-creator, handled via simple in-memory throttle.
 */

const RUNNINGHUB_API_BASE = process.env.RUNNINGHUB_API_BASE || 'https://www.runninghub.cn/openapi/v2';
const RUNNINGHUB_TEXT2IMG_ENDPOINT =
  process.env.RUNNINGHUB_TEXT2IMG_ENDPOINT || '/rhart-image-n-g31-flash-official/text-to-image';

// Simple in-memory rate limiter: max 5 requests per creator per minute
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(creatorId: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(creatorId) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitMap.set(creatorId, timestamps);
  return true;
}

// ─── Style presets ───────────────────────────────────────────────────────────

const STYLE_PRESETS: Record<string, string> = {
  anime: 'anime illustration style, clean lines, vibrant colors, character portrait, white background',
  watercolor: 'watercolor painting style, soft edges, artistic, character portrait, white background',
  chibi: 'chibi style, cute, big eyes, small body, character illustration, white background',
  realistic: 'digital art, semi-realistic style, detailed features, character portrait, soft lighting',
  flat: 'flat design illustration, bold colors, geometric shapes, modern, character portrait',
  ink: 'Chinese ink wash painting style, elegant, minimalist, character portrait, white background',
};

function buildPrompt(personalityName: string, userPrompt?: string, style?: string): string {
  const styleDesc = STYLE_PRESETS[style ?? 'anime'] ?? STYLE_PRESETS.anime;

  if (userPrompt) {
    return `${userPrompt}, ${styleDesc}, high quality, masterpiece`;
  }

  return `A character representing "${personalityName}" personality type, ` +
    `${styleDesc}, high quality, masterpiece, centered composition`;
}

export async function POST(request: Request) {
  const apiKey = process.env.RUNNINGHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: '图像生成服务未配置（RUNNINGHUB_API_KEY）' },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get creator
  const { data: creator } = await supabase
    .from('creators')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!creator) {
    return NextResponse.json({ error: '未找到创作者账户' }, { status: 403 });
  }

  const creatorId = creator.id as string;

  // Rate limit
  if (!checkRateLimit(creatorId)) {
    return NextResponse.json(
      { error: '生成频率过高，请稍后再试（每分钟最多 5 次）' },
      { status: 429 },
    );
  }

  // Parse body
  const body = await request.json().catch(() => null);
  if (!body || !body.universeId || !body.personalitySlug || !body.personalityName) {
    return NextResponse.json(
      { error: '缺少必要参数：universeId, personalitySlug, personalityName' },
      { status: 400 },
    );
  }

  const { universeId, personalitySlug, personalityName, prompt, style } = body;

  // Verify ownership
  const { data: universe } = await supabase
    .from('creator_universes')
    .select('id')
    .eq('id', universeId)
    .eq('creator_id', creatorId)
    .single();

  if (!universe) {
    return NextResponse.json({ error: '宇宙不存在或无权限' }, { status: 404 });
  }

  // Build prompt & call RunningHub
  const fullPrompt = buildPrompt(personalityName, prompt, style);

  try {
    const rhResponse = await fetch(`${RUNNINGHUB_API_BASE}${RUNNINGHUB_TEXT2IMG_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        negative_prompt: 'nsfw, nude, violent, gore, deformed, ugly, blurry, watermark, text',
        resolution: '2k',
        aspect_ratio: '1:1',
        num_images: 1,
      }),
    });

    if (!rhResponse.ok) {
      const errorText = await rhResponse.text().catch(() => 'Unknown error');
      console.error('RunningHub API error:', rhResponse.status, errorText);
      return NextResponse.json(
        { error: `图像生成失败（${rhResponse.status}）` },
        { status: 502 },
      );
    }

    const rhData = await rhResponse.json();

    // RunningHub returns images in various formats
    const imageUrl = rhData.data?.images?.[0]?.url
      ?? rhData.data?.image_url
      ?? rhData.images?.[0]?.url
      ?? rhData.output?.image_url
      ?? null;

    if (!imageUrl) {
      console.error('RunningHub no image URL in response:', JSON.stringify(rhData).slice(0, 500));
      return NextResponse.json({ error: '图像生成返回结果异常' }, { status: 502 });
    }

    // Update personality image_url in database
    const { error: updateError } = await supabase
      .from('creator_personalities')
      .update({ image_url: imageUrl })
      .eq('universe_id', universeId)
      .eq('slug', personalitySlug);

    if (updateError) {
      console.warn('Failed to update personality image_url:', updateError.message);
    }

    return NextResponse.json({
      imageUrl,
      prompt: fullPrompt,
      personalitySlug,
    });
  } catch (err) {
    console.error('RunningHub request failed:', err);
    return NextResponse.json(
      { error: '图像生成请求失败，请稍后重试' },
      { status: 502 },
    );
  }
}
