import { NextResponse, type NextRequest } from 'next/server';
import {
  ApimartImageError,
  buildBeautyMirrorPrompt,
  buildFortuneMirrorPrompt,
  buildColorMirrorPrompt,
  buildCompareMirrorPrompt,
  isApimartConfigured,
  submitMirrorTask,
  type MirrorMode,
  type BeautyReportType,
} from '@/lib/mirror/apimart';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 3_200_000;
const DATA_URI_PATTERN = /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i;

interface MirrorGenerateBody {
  mode?: unknown;
  imageDataUrl?: unknown;
  vibe?: unknown;
  hairConstraint?: unknown;
  reportType?: unknown;
  analysisType?: unknown;
  focusAreas?: unknown;
  seasonHint?: unknown;
  analysisDepth?: unknown;
  compareStyles?: unknown;
  avoid?: unknown;
  consentAccepted?: unknown;
}

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  });
}

function clampString(value: unknown, max: number, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function imageByteSize(dataUri: string): number {
  const comma = dataUri.indexOf(',');
  if (comma < 0) return Number.POSITIVE_INFINITY;
  return Math.ceil((dataUri.length - comma - 1) * 0.75);
}

function validateImageDataUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!DATA_URI_PATTERN.test(normalized)) return null;
  if (imageByteSize(normalized) > MAX_IMAGE_BYTES) return null;
  return normalized;
}

function previewReport(vibe: string, reportType: BeautyReportType = 'comprehensive') {
  if (reportType === 'hairstyle') {
    return {
      palette: ['焦糖棕', '冷茶色', '黑茶色'],
      sections: [
        { title: '方案 A · 法式慵懒锁骨发', body: '长度：锁骨 / 质感：微卷蓬松 / 颜色：焦糖棕 / 刘海：侧分空气刘海' },
        { title: '方案 B · 韩系利落短发', body: '长度：下巴 / 质感：柔顺内扣 / 颜色：冷茶色 / 刘海：空气刘海' },
        { title: '方案 C · 复古港风大波浪', body: '长度：胸部 / 质感：大卷蓬松 / 颜色：黑茶色 / 刘海：中分无刘海' },
      ],
    };
  }

  if (reportType === 'makeup') {
    return {
      palette: ['暖棕', '玫瑰粉', '裸色'],
      sections: [
        { title: '方案 A · 日杂透明感妆', body: '底妆：水光肌 / 眼妆：暖棕单色 / 腮红：蜜桃色颧骨 / 唇妆：水润裸粉' },
        { title: '方案 B · 法式慵懒玫瑰妆', body: '底妆：奶油肌 / 眼妆：玫瑰粉渐变 / 腮红：玫瑰色苹果肌 / 唇妆：哑光玫瑰豆沙' },
        { title: '方案 C · 高级感职场妆', body: '底妆：雾面哑光 / 眼妆：大地色深浅 / 腮红：修容色颧骨下方 / 唇妆：丝绒豆沙' },
      ],
    };
  }

  if (reportType === 'fashion') {
    return {
      palette: ['米白', '驼色', '黑色'],
      sections: [
        { title: '方案 A · 法式通勤', body: '上装：米白真丝衬衫 / 下装：驼色高腰阔腿裤 / 鞋：裸色尖头高跟 / 包：棕色托特包 / 配饰：金色细项链' },
        { title: '方案 B · 韩系约会', body: '上装：奶油色针织开衫 / 下装：碎花半裙 / 鞋：白色玛丽珍 / 包：小巧链条包 / 配饰：珍珠耳钉' },
        { title: '方案 C · 日杂休闲', body: '上装：白色T恤 / 下装：直筒牛仔裤 / 鞋：帆布鞋 / 包：帆布托特 / 配饰：棒球帽' },
      ],
    };
  }

  return {
    palette: ['月白', '烟粉', '乌梅紫', '柔金', '鼠尾草绿'],
    sections: [
      { title: '色彩方向', body: '优先低饱和暖中性色和柔玫瑰调。' },
      { title: '发型方向', body: '锁骨长度微卷、侧分空气刘海、焦糖棕挑染。' },
      { title: '妆容重点', body: '水光底妆 + 暖棕眼影 + 玫瑰豆沙唇。' },
      { title: '变美总结', body: `偏「${vibe}」：从清纯基础款升级为有质感的精致风格。` },
    ],
  };
}

function fortunePreviewReport() {
  return {
    palette: ['暮紫', '金箔', '玫瑰陶土', '米白', '暗面紫'],
    sections: [
      { title: '气质关键词', body: '沉稳中带灵气，外冷内热型。' },
      { title: '五官亮点', body: '眼型偏长、轮廓清晰，适合强调眼妆。' },
      { title: '性格特质', body: '观察力强、审美敏锐。' },
      { title: '适合方向', body: '创意、策划、内容创作领域。' },
      { title: '一句总结', body: '你的面相自带「安静的说服力」。' },
    ],
  };
}

function colorPreviewReport() {
  return {
    palette: ['驼色', '焦糖', '铁锈红', '橄榄绿', '暖米白', '蜜桃金', '肉桂', '暖灰', '深棕'],
    sections: [
      { title: '色彩季节', body: '暖秋型 Warm Autumn：肤色偏暖调，适合低饱和暖色系。' },
      { title: '妆容配色', body: '眼影：暖棕/铜色 / 腮红：蜜桃/砖红 / 唇色：暖豆沙/铁锈' },
      { title: '发色推荐', body: '暖棕、栗子色、焦糖挑染。' },
      { title: '穿搭配色', body: '驼色+白、橄榄+米、铁锈+牛仔蓝。' },
    ],
  };
}

function comparePreviewReport() {
  return {
    palette: ['原生自然', '暗黑辣妹'],
    sections: [
      { title: '原生自然', body: '裸妆感底妆 + 柔顺自然发色 + 空气感碎发 + 裸色唇 + 简约金属细项链 + 白色基础款' },
      { title: '暗黑辣妹', body: '哑光冷白皮 + 黑色长直发 + 烟熏眼妆 + 深色唇 + 银色链条chocker + 黑色皮衣' },
      { title: '最适合你', body: '综合五官气质，推荐「原生自然」作为主打风格，偶尔尝试暗黑辣妹做反差。' },
    ],
  };
}

export async function POST(request: NextRequest) {
  let body: MirrorGenerateBody;
  try {
    body = (await request.json()) as MirrorGenerateBody;
  } catch {
    return json({ ok: false, error: '请求格式不正确' }, { status: 400 });
  }

  const mode = (typeof body.mode === 'string' ? body.mode : 'beauty') as MirrorMode;
  if (!['beauty', 'fortune', 'color', 'compare'].includes(mode)) {
    return json({ ok: false, error: '不支持的模式，可选 beauty / fortune / color / compare' }, { status: 400 });
  }

  if (body.consentAccepted !== true) {
    return json({ ok: false, error: '请先确认照片授权与隐私提示' }, { status: 400 });
  }

  const imageDataUrl = validateImageDataUrl(body.imageDataUrl);
  if (!imageDataUrl) {
    return json(
      { ok: false, error: '请上传小于 3.2MB 的 JPG、PNG 或 WebP 图片' },
      { status: 400 },
    );
  }

  maybeCleanup();
  const limit = rateLimit(`mirror-generate:${resolveRateLimitKey(request)}`, {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!limit.allowed) {
    return json(
      { ok: false, error: '生成过于频繁，请稍后再试' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(limit.resetMs / 1000)) },
      },
    );
  }

  // Build mode-specific input & prompt
  let input;
  let prompt;

  switch (mode) {
    case 'fortune':
      input = {
        imageDataUrl,
        analysisType: clampString(body.analysisType, 80, '面相与气质综合分析'),
        focusAreas: clampString(body.focusAreas, 80, '五官比例、脸型轮廓、气场特质'),
        avoid: clampString(body.avoid, 80, '避免负面定论、恐吓性预言'),
      };
      prompt = buildFortuneMirrorPrompt(input);
      break;

    case 'color':
      input = {
        imageDataUrl,
        seasonHint: clampString(body.seasonHint, 80, '自动判断'),
        analysisDepth: clampString(body.analysisDepth, 80, '完整报告'),
        avoid: clampString(body.avoid, 80, '避免刻板印象'),
      };
      prompt = buildColorMirrorPrompt(input);
      break;

    case 'compare':
      input = {
        imageDataUrl,
        compareStyles: clampString(body.compareStyles, 120, '原生自然,暗黑辣妹'),
        avoid: clampString(body.avoid, 80, '避免过度滤镜'),
      };
      prompt = buildCompareMirrorPrompt(input);
      break;

    default: {
      const reportType = (typeof body.reportType === 'string' ? body.reportType : 'comprehensive') as BeautyReportType;
      input = {
        imageDataUrl,
        vibe: clampString(body.vibe, 80, '原生自然、干净有气色'),
        hairConstraint: clampString(body.hairConstraint, 80, '可微调发型'),
        avoid: clampString(body.avoid, 80, '避免厚重、脏感'),
        reportType,
      };
      prompt = buildBeautyMirrorPrompt(input);
      break;
    }
  }

  if (!isApimartConfigured()) {
    let report;
    switch (mode) {
      case 'fortune': report = fortunePreviewReport(); break;
      case 'color': report = colorPreviewReport(); break;
      case 'compare': report = comparePreviewReport(); break;
      default: {
        const rt = (typeof body.reportType === 'string' ? body.reportType : 'comprehensive') as BeautyReportType;
        report = previewReport(input.vibe || '原生自然', rt);
        break;
      }
    }

    return json({
      ok: true,
      status: 'completed',
      progress: 100,
      stub: true,
      imageUrl: null,
      report,
      promptPreview: prompt.slice(0, 520),
    });
  }

  try {
    const task = await submitMirrorTask(mode, input);
    return json({
      ok: true,
      status: task.status,
      taskId: task.taskId,
      progress: task.status === 'submitted' ? 4 : 8,
      promptPreview: task.prompt.slice(0, 520),
    });
  } catch (error) {
    if (error instanceof ApimartImageError) {
      return json(
        { ok: false, error: `图像任务提交失败：${error.message}` },
        { status: error.statusCode },
      );
    }

    return json({ ok: false, error: '图像任务提交失败，请稍后重试' }, { status: 502 });
  }
}
