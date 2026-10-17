import { NextResponse, type NextRequest } from 'next/server';
import {
  ApimartImageError,
  buildBeautyMirrorPrompt,
  buildColorMirrorPrompt,
  buildCompareMirrorPrompt,
  isApimartConfigured,
  submitMirrorTask,
  type MirrorMode,
  type BeautyReportType,
} from '@/lib/mirror/apimart';
import { maybeCleanup, rateLimit, resolveRateLimitKey } from '@/lib/perf/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  consumeTryOnFreeIfAvailable,
  hasBlockedGarment,
  isUnder18,
  loadBirthYearForUser,
  peekTryOnQuota,
  TRY_ON_FREE_CAP,
} from '@/lib/mirror/try-on-quota';
import { SKU_COSTS } from '@/lib/wallet/ling-bi';
import { applyLingBiTransaction, consumeServerLingBiBySku } from '@/lib/wallet/server';

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
  walletSpendId?: unknown;
}

interface MirrorGenerateDebit {
  userId: string;
  spendId: string;
  skuKey: string;
  mode: MirrorMode;
  reportType?: BeautyReportType;
  balance: number;
  ledgerId?: string;
  applied?: boolean;
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

function getMirrorSkuKey(mode: MirrorMode, reportType?: BeautyReportType): string {
  return mode === 'beauty' && reportType === 'comprehensive'
    ? 'mirror-archive'
    : 'mirror-single';
}

function getModeLabel(mode: MirrorMode): string {
  if (mode === 'color') return '色彩诊断';
  if (mode === 'compare') return '风格对比';
  return '灵镜 Atelier';
}

function parseWalletSpendId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{8,160}$/.test(trimmed) ? trimmed : null;
}

async function getOptionalUser(): Promise<{ id: string; birthYearMeta: number | null; isAnonymous: boolean } | null> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.getClaims().catch(() => null);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    const birthYearMeta =
      typeof user.user_metadata?.birth_year === 'number' ? (user.user_metadata.birth_year as number) : null;
    return { id: user.id, birthYearMeta, isAnonymous: Boolean(user.is_anonymous) };
  } catch {
    return null;
  }
}

async function debitServerWalletForGenerate(params: {
  userId: string;
  spendId: string;
  skuKey: string;
  mode: MirrorMode;
  reportType?: BeautyReportType;
}): Promise<MirrorGenerateDebit | NextResponse> {
  const sku = SKU_COSTS[params.skuKey];
  if (!sku) {
    return json({ ok: false, error: '当前灵镜档案类型暂不可用' }, { status: 400 });
  }

  const result = await consumeServerLingBiBySku(params.userId, params.skuKey, {
    idempotencyKey: `mirror-generate:${params.spendId}`,
    resourceId: `mirror:${params.spendId}`,
    note: `${sku.label} · ${getModeLabel(params.mode)}`,
    metadata: {
      source: 'mirror_generate',
      mode: params.mode,
      reportType: params.reportType ?? null,
      walletSpendId: params.spendId,
    },
  });

  if (!result.ok) {
    return json(
      {
        ok: false,
        error: result.reason === 'insufficient' ? '灵币余额不足，请先充值。' : '灵币扣费失败，请稍后重试。',
        reason: result.reason,
        balance: result.balance,
        required: result.required,
      },
      { status: result.reason === 'insufficient' ? 402 : 400 },
    );
  }

  return {
    userId: params.userId,
    spendId: params.spendId,
    skuKey: params.skuKey,
    mode: params.mode,
    reportType: params.reportType,
    balance: result.balance,
    ledgerId: result.ledgerId,
    applied: result.applied,
  };
}

async function refundServerWalletForGenerate(
  debit: MirrorGenerateDebit | null,
  reason: string,
) {
  if (!debit) return null;
  const sku = SKU_COSTS[debit.skuKey];
  if (!sku) return null;

  try {
    return await applyLingBiTransaction(debit.userId, {
      delta: sku.cost,
      source: 'refund',
      idempotencyKey: `mirror-generate-refund:${debit.spendId}`,
      resourceId: `mirror:${debit.spendId}`,
      note: `${sku.label} · 生成失败退回`,
      metadata: {
        source: 'mirror_generate_refund',
        reason,
        debitLedgerId: debit.ledgerId ?? null,
        debitApplied: debit.applied ?? null,
        mode: debit.mode,
        reportType: debit.reportType ?? null,
        walletSpendId: debit.spendId,
      },
    });
  } catch (error) {
    console.error('[mirror-generate] wallet refund failed', {
      spendId: debit.spendId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
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
  if (mode === 'fortune') {
    return json(
      { ok: false, error: '命纹能力已迁移到灵鉴命书馆，请前往 /mysti/destiny/' },
      { status: 410 },
    );
  }
  if (!['beauty', 'color', 'compare'].includes(mode)) {
    return json({ ok: false, error: '不支持的模式，可选 beauty / color / compare' }, { status: 400 });
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
  let reportType: BeautyReportType | undefined;

  switch (mode) {
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
      reportType = (typeof body.reportType === 'string' ? body.reportType : 'comprehensive') as BeautyReportType;
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

  const sessionUser = await getOptionalUser();
  const userId = sessionUser?.id ?? null;
  let walletDebit: MirrorGenerateDebit | null = null;
  let tryOnFree: { applied: boolean; remaining: number; cap: number } | null = null;

  // Under-18: block swimsuit/lingerie style keywords (plan §8)
  if (mode === 'compare' && userId) {
    const birthYear =
      (await loadBirthYearForUser(userId)) ?? sessionUser?.birthYearMeta ?? null;
    const styleText = `${clampString(body.compareStyles, 120, '')} ${clampString(body.avoid, 80, '')} ${clampString(body.vibe, 80, '')}`;
    if (isUnder18(birthYear) && hasBlockedGarment(styleText)) {
      return json(
        {
          ok: false,
          error: '未满 18 岁不能使用泳装/内衣类换装。换一套日常风格再试吧。',
          reason: 'under18_garment_blocked',
        },
        { status: 403 },
      );
    }
  }

  let pendingFreeTryOn = false;
  if (userId && mode === 'compare' && !sessionUser?.isAnonymous) {
    const quota = await peekTryOnQuota(userId);
    if (quota.remaining > 0) {
      pendingFreeTryOn = true;
      tryOnFree = { applied: true, remaining: quota.remaining - 1, cap: TRY_ON_FREE_CAP };
    } else {
      tryOnFree = { applied: false, remaining: 0, cap: TRY_ON_FREE_CAP };
    }
  }

  const skipWallet = pendingFreeTryOn;

  if (userId && !skipWallet) {
    const spendId = parseWalletSpendId(body.walletSpendId);
    if (!spendId) {
      return json(
        {
          ok: false,
          error:
            mode === 'compare'
              ? '本月免费换装次数已用完，请充值灵币或换个账号月额度。'
              : '缺少有效的灵币扣费凭证，请刷新页面后重试。',
          reason: mode === 'compare' ? 'try_on_quota_exhausted' : 'missing_spend_id',
          tryOnFree,
        },
        { status: 400 },
      );
    }

    const debit = await debitServerWalletForGenerate({
      userId,
      spendId,
      skuKey: getMirrorSkuKey(mode, reportType),
      mode,
      reportType,
    });
    if (debit instanceof NextResponse) return debit;
    walletDebit = debit;
  }


  async function finalizeTryOnFree(): Promise<{ applied: boolean; remaining: number; cap: number } | null> {
    if (!pendingFreeTryOn || !userId) return tryOnFree;
    const consumed = await consumeTryOnFreeIfAvailable(userId);
    return {
      applied: consumed.freeApplied,
      remaining: consumed.remaining,
      cap: TRY_ON_FREE_CAP,
    };
  }

  if (!isApimartConfigured()) {
    let report;
    switch (mode) {
      case 'color': report = colorPreviewReport(); break;
      case 'compare': report = comparePreviewReport(); break;
      default: {
        const rt = (typeof body.reportType === 'string' ? body.reportType : 'comprehensive') as BeautyReportType;
        report = previewReport(input.vibe || '原生自然', rt);
        break;
      }
    }

    const freeMeta = await finalizeTryOnFree();
    return json({
      ok: true,
      status: 'completed',
      progress: 100,
      stub: true,
      imageUrl: null,
      report,
      promptPreview: prompt.slice(0, 520),
      serverWalletDebited: Boolean(walletDebit),
      serverBalance: walletDebit?.balance ?? null,
      tryOnFree: freeMeta,
    });
  }

  try {
    const task = await submitMirrorTask(mode, input);
    const freeMeta = await finalizeTryOnFree();
    return json({
      ok: true,
      status: task.status,
      taskId: task.taskId,
      progress: task.status === 'submitted' ? 4 : 8,
      promptPreview: task.prompt.slice(0, 520),
      serverWalletDebited: Boolean(walletDebit),
      serverBalance: walletDebit?.balance ?? null,
      tryOnFree: freeMeta,
    });
  } catch (error) {
    const refund = await refundServerWalletForGenerate(
      walletDebit,
      error instanceof Error ? error.message : 'submit_failed',
    );

    if (error instanceof ApimartImageError) {
      return json(
        {
          ok: false,
          error: `图像任务提交失败：${error.message}`,
          refunded: Boolean(refund?.ok),
          serverBalance: refund?.balance ?? walletDebit?.balance ?? null,
        },
        { status: error.statusCode },
      );
    }

    return json({
      ok: false,
      error: '图像任务提交失败，请稍后重试',
      refunded: Boolean(refund?.ok),
      serverBalance: refund?.balance ?? walletDebit?.balance ?? null,
    }, { status: 502 });
  }
}
