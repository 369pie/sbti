'use client';

/* eslint-disable @next/next/no-img-element -- APIMart returns temporary external URLs and uploads use browser data URLs. */

import { pausedNote, usePaymentPause } from '@/lib/payment/use-payment-pause';
import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { useRef, useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { recordMirrorResult } from '@/lib/wtf-card';
import { buildChallengeUrl, type ChallengeData } from '@/lib/mirror/challenge';
import {
  addToHistory,
  clearHistory,
  getHistory,
  type MirrorHistoryRecord,
  getTopUpOptions,
} from '@/lib/mirror/credits';
import {
  consumeBySku,
  getBalance,
  SKU_COSTS,
  topUp,
} from '@/lib/wallet/ling-bi';

type FlowState = 'idle' | 'submitting' | 'polling' | 'completed' | 'failed';
type MirrorMode = 'beauty' | 'fortune' | 'color' | 'compare';
type BeautyReportType = 'comprehensive' | 'hairstyle' | 'makeup' | 'fashion';

interface ReportSection {
  title: string;
  body: string;
}

interface PreviewReport {
  palette: string[];
  sections: ReportSection[];
}

interface MirrorApiResponse {
  ok?: boolean;
  status?: FlowState | 'submitted' | 'pending' | 'processing' | 'in_progress' | 'cancelled';
  taskId?: string;
  progress?: number;
  imageUrl?: string | null;
  expiresAt?: number | null;
  stub?: boolean;
  report?: PreviewReport;
  promptPreview?: string;
  error?: string;
  reason?: 'insufficient' | 'invalid-cost' | 'transaction-failed' | 'under18_garment_blocked' | 'try_on_quota_exhausted' | 'missing_spend_id';
  balance?: number;
  required?: number;
  refunded?: boolean;
  serverWalletDebited?: boolean;
  serverBalance?: number | null;
  tryOnFree?: { applied?: boolean; remaining?: number; cap?: number } | null;
}

type WalletSource = 'local' | 'server';

interface MirrorResult {
  imageUrl: string | null;
  expiresAt: number | null;
  stub: boolean;
  report: PreviewReport | null;
  promptPreview: string | null;
  mode: MirrorMode;
}

interface MirrorPaymentVerifyResponse {
  status?: string;
  credits?: number;
  serverWalletCredited?: boolean;
  serverBalance?: number | null;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_DATA_URI_BYTES = 3_000_000;
const MAX_CANVAS_SIDE = 1600;

const VIBE_OPTIONS = ['原生自然', '清冷通勤', '约会玫瑰', '暗黑辣妹'];
const HAIR_OPTIONS = ['可剪可染', '只改造型', '保留长发', '保留短发'];
const COLOR_SEASON_HINTS = ['自动判断', '偏春季型', '偏夏季型', '偏秋季型', '偏冬季型'];
const COLOR_DEPTHS = ['完整报告', '快速诊断'];
const COMPARE_STYLE_OPTIONS = ['原生自然', '清冷通勤', '约会玫瑰', '暗黑辣妹', '泳装度假', '轻奢内衣风'] as const;
const ADULT_ONLY_COMPARE_STYLES = new Set(['泳装度假', '轻奢内衣风']);
const BEAUTY_REPORT_TYPES: { value: BeautyReportType; label: string; desc: string }[] = [
  { value: 'comprehensive', label: '三页诊断卡', desc: '色彩 + 妆发 + 穿搭一次成档' },
  { value: 'hairstyle', label: '发型专项', desc: '1 灵币轻体验' },
  { value: 'makeup', label: '妆容专项', desc: '1 灵币轻体验' },
  { value: 'fashion', label: '穿搭专项', desc: '1 灵币轻体验' },
];
const LOCAL_PAYMENT_APPLIED_KEY = 'mirror-payment-applied-v1';

function loadAppliedLocalPaymentIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_PAYMENT_APPLIED_KEY) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function rememberAppliedLocalPaymentId(orderId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = loadAppliedLocalPaymentIds().filter((id) => id !== orderId);
    ids.push(orderId);
    window.localStorage.setItem(LOCAL_PAYMENT_APPLIED_KEY, JSON.stringify(ids.slice(-50)));
  } catch {
    // localStorage can be unavailable in private browsing; the wallet write still succeeds when possible.
  }
}

function getCreditsForTopUpPack(pack: string | null): number | null {
  if (!pack) return null;
  return getTopUpOptions().find((option) => option.pack === pack)?.credits ?? null;
}

function applyLocalTopUpOnce(orderId: string, credits: number, note: string): boolean {
  if (!orderId || !Number.isFinite(credits) || credits <= 0) return false;
  if (loadAppliedLocalPaymentIds().includes(orderId)) return true;

  const result = topUp(credits, { orderId, note });
  if (!result.ok) return false;
  rememberAppliedLocalPaymentId(orderId);
  return true;
}

function sleep(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('图片读取失败'));
    };
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片解析失败'));
    if (dataUrl.startsWith('http')) {
      image.crossOrigin = 'anonymous';
    }
    image.src = dataUrl;
  });
}

function dataUriBytes(dataUri: string): number {
  const comma = dataUri.indexOf(',');
  if (comma < 0) return Number.POSITIVE_INFINITY;
  return Math.ceil((dataUri.length - comma - 1) * 0.75);
}

async function fileToMirrorDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请上传 JPG、PNG 或 WebP 图片');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error('原图请控制在 10MB 以内');
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(rawDataUrl);
  const scale = Math.min(1, MAX_CANVAS_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('图片压缩失败');
  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.88;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUriBytes(dataUrl) > MAX_DATA_URI_BYTES && quality > 0.58) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  if (dataUriBytes(dataUrl) > MAX_DATA_URI_BYTES) {
    throw new Error('图片仍然过大，请换一张更小的照片');
  }

  return dataUrl;
}

function formatExpiry(expiresAt: number | null): string | null {
  if (!expiresAt) return null;
  return new Date(expiresAt * 1000).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeProgress(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : fallback;
}

function getModeLabel(mode: MirrorMode): string {
  if (mode === 'color') return '色彩诊断';
  if (mode === 'compare') return '风格对比';
  return '灵镜 Atelier';
}

function getMirrorSkuKey(mode: MirrorMode, reportType: BeautyReportType): 'mirror-single' | 'mirror-archive' {
  return mode === 'beauty' && reportType === 'comprehensive'
    ? 'mirror-archive'
    : 'mirror-single';
}

function buildWalletSpendId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Generate a share card as a downloadable image — image-first layout */
async function generateShareCard(
  imageUrl: string | null,
  report: PreviewReport | null,
  mode: MirrorMode,
): Promise<string> {
  const canvas = document.createElement('canvas');
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#FFF5F5');
  bgGrad.addColorStop(0.5, '#FDE8EC');
  bgGrad.addColorStop(1, '#F8DDE4');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative sparkle dots — soft feminine accents
  const sparklePositions = [
    [80, 120], [200, 90], [900, 100], [960, 180],
    [50, 400], [1020, 350], [120, 700], [950, 650],
    [60, 1000], [1000, 950], [180, 1300], [880, 1250],
    [90, 1550], [970, 1500], [300, 1750], [750, 1700],
    [150, 1850], [900, 1820],
  ];
  for (const [sx, sy] of sparklePositions) {
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232, 160, 191, 0.25)';
    ctx.fill();
  }

  // ─── Header (compact: ~100px) ─────────────────────────────────────────
  const modeLabel = mode === 'color' ? 'WTFTI 色彩诊断' : mode === 'compare' ? 'WTFTI 风格对比' : 'WTFTI 灵镜 Atelier';
  ctx.font = '600 22px "Cormorant Garamond", "Noto Serif SC", serif';
  ctx.fillStyle = '#D4789C';
  ctx.textAlign = 'center';
  ctx.fillText(modeLabel, W / 2, 50);

  // Thin rose line
  ctx.strokeStyle = '#E8A0BF';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(60, 70);
  ctx.lineTo(W - 60, 70);
  ctx.stroke();

  // ─── Image area (maximized: y=80 to y=1680) ───────────────────────────
  const IMG_TOP = 80;
  const IMG_BOTTOM = 1680;
  const IMG_MAX_H = IMG_BOTTOM - IMG_TOP;

  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const imgW = W;
      const imgH = (img.naturalHeight / img.naturalWidth) * imgW;
      const drawH = Math.min(imgH, IMG_MAX_H);
      const drawW = (drawH / imgH) * imgW;
      const x = (W - drawW) / 2;
      const y = IMG_TOP + (IMG_MAX_H - drawH) / 2;
      ctx.drawImage(img, x, y, drawW, drawH);
    } catch {
      drawReportFallback(ctx, report, W, IMG_TOP, IMG_MAX_H);
    }
  } else if (report) {
    drawReportFallback(ctx, report, W, IMG_TOP, IMG_MAX_H);
  }

  // ─── Footer (compact: ~240px) ─────────────────────────────────────────
  const FOOTER_Y = H - 240;

  // Rose separator
  ctx.strokeStyle = '#E8A0BF';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(60, FOOTER_Y);
  ctx.lineTo(W - 60, FOOTER_Y);
  ctx.stroke();

  // Report summary (1-2 lines)
  if (report && report.sections.length > 0) {
    ctx.font = '400 18px "Noto Serif SC", serif';
    ctx.fillStyle = 'rgba(90, 60, 75, 0.75)';
    ctx.textAlign = 'center';
    const summary = report.sections[0].body.slice(0, 60);
    ctx.fillText(summary, W / 2, FOOTER_Y + 35);
  }

  // Palette chips
  if (report && report.palette.length > 0) {
    const chipY = FOOTER_Y + 60;
    const chipW = 100;
    const chipH = 32;
    const gap = 12;
    const totalW = Math.min(report.palette.length, 8) * chipW + (Math.min(report.palette.length, 8) - 1) * gap;
    let cx = (W - totalW) / 2;
    for (const color of report.palette.slice(0, 8)) {
      ctx.fillStyle = 'rgba(232, 160, 191, 0.12)';
      roundRect(ctx, cx, chipY, chipW, chipH, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(232, 160, 191, 0.3)';
      ctx.lineWidth = 0.5;
      roundRect(ctx, cx, chipY, chipW, chipH, 16);
      ctx.stroke();
      ctx.font = '400 14px "Noto Serif SC", serif';
      ctx.fillStyle = '#D4789C';
      ctx.textAlign = 'center';
      ctx.fillText(color, cx + chipW / 2, chipY + 21);
      cx += chipW + gap;
    }
  }

  // QR code (bottom-right)
  const qrSize = 100;
  const qrX = W - 60 - qrSize;
  const qrY = H - 60 - qrSize;
  try {
    const qrModule = await import('qrcode');
    if (qrModule && typeof qrModule.toDataURL === 'function') {
      const qrDataUrl = await qrModule.toDataURL('https://wtfti.com', {
        width: qrSize,
        margin: 1,
        color: { dark: '#D4789C', light: '#FFF5F5' },
      });
      if (qrDataUrl && qrDataUrl.startsWith('data:image')) {
        const qrImg = await loadImage(qrDataUrl);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }
    }
  } catch (e) {
    console.warn('QR code generation skipped:', e);
  }

  // Watermark (bottom-left)
  ctx.font = '600 18px "Cormorant Garamond", "Noto Serif SC", serif';
  ctx.fillStyle = '#D4789C';
  ctx.textAlign = 'left';
  ctx.fillText('WTFTI', 60, H - 50);

  ctx.font = '400 14px "Noto Serif SC", serif';
  ctx.fillStyle = 'rgba(90, 60, 75, 0.4)';
  ctx.fillText('AI generated · WTFTI 灵镜 · 审美参考', 60, H - 28);

  return canvas.toDataURL('image/png');
}

/** Draw report sections as styled fallback when no image available */
function drawReportFallback(
  ctx: CanvasRenderingContext2D,
  report: PreviewReport | null,
  W: number,
  top: number,
  maxH: number,
) {
  if (!report) return;

  const padding = 80;
  const cardW = W - padding * 2;
  let y = top + 40;

  ctx.fillStyle = 'rgba(232, 160, 191, 0.08)';
  roundRect(ctx, padding, top, cardW, maxH, 16);
  ctx.fill();

  for (const section of report.sections.slice(0, 6)) {
    if (y > top + maxH - 80) break;

    ctx.font = '600 22px "Noto Serif SC", serif';
    ctx.fillStyle = '#D4789C';
    ctx.textAlign = 'left';
    ctx.fillText(section.title, padding + 30, y);
    y += 36;

    ctx.font = '400 18px "Noto Serif SC", serif';
    ctx.fillStyle = '#6B4055';
    const words = section.body.split('');
    let line = '';
    for (const char of words) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > cardW - 60 && line.length > 0) {
        ctx.fillText(line, padding + 30, y);
        line = char;
        y += 28;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, padding + 30, y);
      y += 28;
    }
    y += 20;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


export default function MirrorClient() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState<MirrorMode>('beauty');
  const searchParams = useSearchParams();
  useEffect(() => {
    enqueueProductEvent('mirror', 'mirror_view', { step: 'view', props: { feature: 'try_on' } });
  }, []);

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'beauty' || m === 'color' || m === 'compare' || m === 'fortune') {
      setMode(m);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/mirror/try-on-quota/', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          remaining?: number;
          cap?: number;
          under18?: boolean;
        };
        if (cancelled || !data?.ok) return;
        if (typeof data.remaining === 'number') setTryOnRemaining(data.remaining);
        if (typeof data.cap === 'number') setTryOnCap(data.cap);
        setUnder18(Boolean(data.under18));
      } catch {
        /* guest / offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);


  const [vibe, setVibe] = useState(VIBE_OPTIONS[0]);
  const [hairConstraint, setHairConstraint] = useState(HAIR_OPTIONS[0]);
  const [seasonHint, setSeasonHint] = useState(COLOR_SEASON_HINTS[0]);
  const [analysisDepth, setAnalysisDepth] = useState(COLOR_DEPTHS[0]);
  const [compareStyles, setCompareStyles] = useState<string[]>(['原生自然', '暗黑辣妹']);
  const [beautyReportType, setBeautyReportType] = useState<BeautyReportType>('comprehensive');
  const [savedToCard, setSavedToCard] = useState(false);
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [lingBiBalance, setLingBiBalance] = useState(2);
  const [walletSource, setWalletSource] = useState<WalletSource>('local');
  const [showTopUp, setShowTopUp] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<'wechat' | 'alipay'>('wechat');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const paused = usePaymentPause();
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [history, setHistory] = useState<MirrorHistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [avoid, setAvoid] = useState('厚重黑发贴脸、荧光色、过度滤镜');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [tryOnRemaining, setTryOnRemaining] = useState<number | null>(null);
  const [tryOnCap, setTryOnCap] = useState(3);
  const [under18, setUnder18] = useState(false);

  useEffect(() => {
    if (!under18) return;
    setCompareStyles((prev) => prev.filter((s) => !ADULT_ONLY_COMPARE_STYLES.has(s)));
  }, [under18]);
  const [state, setState] = useState<FlowState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<MirrorResult | null>(null);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const pollRunRef = useRef(0);

  const isBusy = state === 'submitting' || state === 'polling';
  const canSubmit = !!imageDataUrl && consentAccepted && !isBusy;
  const currentSku = SKU_COSTS[getMirrorSkuKey(mode, beautyReportType)];
  const compareStyleOptions = COMPARE_STYLE_OPTIONS.filter(
    (s) => !under18 || !ADULT_ONLY_COMPARE_STYLES.has(s),
  );
  const usingFreeTryOn = mode === 'compare' && tryOnRemaining != null && tryOnRemaining > 0;

  const refreshServerWalletBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/ling-bi/?limit=1', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 503) {
          setWalletSource('local');
        }
        return null;
      }
      const data = (await res.json()) as { wallet?: { balance?: number } };
      if (typeof data.wallet?.balance !== 'number') return null;
      setLingBiBalance(data.wallet.balance);
      setWalletSource('server');
      return data.wallet.balance;
    } catch {
      return null;
    }
  }, []);

  const applyVerifiedPayment = useCallback(async (orderId: string, note: string) => {
    const res = await fetch(`/api/mirror/payment/verify?orderId=${encodeURIComponent(orderId)}`, {
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => ({}))) as MirrorPaymentVerifyResponse;
    if (!res.ok) return false;
    if (data.status !== 'paid') return false;

    if (data.serverWalletCredited && typeof data.serverBalance === 'number') {
      setLingBiBalance(data.serverBalance);
      setWalletSource('server');
      return true;
    }

    if (data.credits) {
      applyLocalTopUpOnce(orderId, data.credits, note);
      setLingBiBalance(getBalance());
      setWalletSource('local');
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    refreshServerWalletBalance();
    setHistory(getHistory());
  }, [refreshServerWalletBalance]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('orderId')?.trim() ?? '';
      const pack = params.get('pack')?.trim() ?? null;
      const isStubReturn = params.get('stub') === '1';
      const isPaidReturn = params.get('paid') === '1';
      if (!orderId || (!isStubReturn && !isPaidReturn)) return;

      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
      setPaymentPolling(true);
      setPaymentError(null);

      const finish = () => {
        if (!cancelled) setPaymentPolling(false);
      };

      if (isStubReturn) {
        void (async () => {
          const applied = await applyVerifiedPayment(orderId, `灵镜充值 · ${pack ?? 'stub'}`).catch(() => false);
          if (cancelled) return;

          if (!applied) {
            const credits = getCreditsForTopUpPack(pack);
            if (credits && applyLocalTopUpOnce(orderId, credits, `灵镜充值 · ${pack ?? 'stub'}`)) {
              setLingBiBalance(getBalance());
              setWalletSource('local');
              setShowTopUp(false);
              finish();
              return;
            }
            setPaymentError('本地模拟支付未能确认订单，请重新发起充值。');
            finish();
            return;
          }

          setShowTopUp(false);
          finish();
        })();
        return;
      }

      let attempts = 0;
      const poll = async () => {
        attempts += 1;
        const applied = await applyVerifiedPayment(orderId, '灵镜支付到账').catch(() => false);
        if (cancelled) return;
        if (applied) {
          setShowTopUp(false);
          finish();
          return;
        }
        if (attempts < 15) {
          window.setTimeout(() => void poll(), 2000);
        } else {
          setPaymentError('支付确认超时，如已付款请刷新页面。');
          finish();
        }
      };
      void poll();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [applyVerifiedPayment]);

  // 发起支付
  async function handleTopUp(pack: string) {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      enqueueProductEvent('mirror', 'mirror_pack_checkout_start', { step: 'checkout' });
      const res = await fetch('/api/mirror/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack, paymentType: paymentChannel }),
      });
      const data = await res.json() as {
        ok?: boolean;
        stub?: boolean;
        url?: string;
        error?: string;
        message?: string;
        credits?: number;
      };

      if (!res.ok) {
        setPaymentError(data.message ?? '支付创建失败，请稍后再试。');
        return;
      }

      if (data.stub && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.url) {
        window.open(data.url, '_blank');
        const orderId = new URL(data.url, window.location.origin).searchParams.get('orderId')
          ?? data.url.match(/orderId=([^&]+)/)?.[1];
        if (orderId) {
          setPaymentPolling(true);
          let attempts = 0;
          const poll = async () => {
            attempts++;
            try {
              const applied = await applyVerifiedPayment(orderId, '灵镜支付到账');
              if (applied) {
                setPaymentPolling(false);
                setShowTopUp(false);
                return;
              }
            } catch {}
            if (attempts < 30) {
              setTimeout(poll, 3000);
            } else {
              setPaymentPolling(false);
              setPaymentError('支付确认超时，如已付款请刷新页面。');
            }
          };
          setTimeout(poll, 5000);
        }
      }
    } catch {
      setPaymentError('网络错误，请稍后再试。');
    } finally {
      setPaymentLoading(false);
    }
  }

  const consumeLingBiForGenerate = useCallback(async (
    skuKey: keyof typeof SKU_COSTS,
    note: string,
    spendId: string,
  ) => {
    const sku = SKU_COSTS[skuKey];
    if (!sku) {
      setError('当前档案类型暂不可用');
      return false;
    }

    if (walletSource === 'server') {
      if (lingBiBalance < sku.cost) {
        setError(`灵币余额不足：${sku.label} 需要 ${sku.cost} 灵币，当前 ${lingBiBalance}。`);
        setShowTopUp(true);
        return false;
      }
      return true;
    }

    const serverBalance = await refreshServerWalletBalance();
    if (typeof serverBalance === 'number') {
      if (serverBalance < sku.cost) {
        setError(`灵币余额不足：${sku.label} 需要 ${sku.cost} 灵币，当前 ${serverBalance}。`);
        setShowTopUp(true);
        return false;
      }
      return true;
    }

    const balance = getBalance();
    if (balance < sku.cost) {
      setLingBiBalance(balance);
      setError(`灵币余额不足：${sku.label} 需要 ${sku.cost} 灵币，当前 ${balance}。`);
      setShowTopUp(true);
      return false;
    }

    const spend = consumeBySku(skuKey, { resourceId: `mirror:${spendId}`, note });
    if (!spend.ok) {
      setLingBiBalance(spend.balance);
      setError(spend.reason === 'insufficient' ? '灵币余额不足，请先充值。' : '扣费失败，请重试');
      setShowTopUp(true);
      return false;
    }

    setWalletSource('local');
    setLingBiBalance(spend.balance);
    return true;
  }, [lingBiBalance, refreshServerWalletBalance, walletSource]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setState('idle');
    setProgress(0);
    setShareCardUrl(null);

    try {
      const dataUrl = await fileToMirrorDataUrl(file);
      setImageDataUrl(dataUrl);
      setFileName(file.name);
    } catch (err) {
      setImageDataUrl(null);
      setFileName('');
      setError(err instanceof Error ? err.message : '图片处理失败');
    } finally {
      event.target.value = '';
    }
  }

  async function pollTask(id: string, runId: number, promptPreview: string | null) {
    const startedAt = Date.now();
    let nextDelay = 8_000;

    while (Date.now() - startedAt < 180_000) {
      await sleep(nextDelay);
      nextDelay = 4_000;
      if (pollRunRef.current !== runId) return;

      const response = await fetch(`/api/mirror/task/${encodeURIComponent(id)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await response.json().catch(() => ({}))) as MirrorApiResponse;

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || '图像任务查询失败');
      }

      const nextProgress = normalizeProgress(data.progress, progress);
      setProgress(nextProgress > 0 ? nextProgress : 12);

      if (data.status === 'completed') {
        setResult({
          imageUrl: data.imageUrl ?? null,
          expiresAt: data.expiresAt ?? null,
          stub: false,
          report: null,
          promptPreview,
          mode,
        });
        setProgress(100);
        setState('completed');
        addToHistory({
          mode,
          reportType: mode === 'beauty' ? beautyReportType : undefined,
          summary: promptPreview?.slice(0, 200) || '灵镜报告',
          imageUrl: data.imageUrl ?? null,
        });
        setHistory(getHistory());
        return;
      }
    }

    throw new Error('生成时间过长，稍后可以刷新任务结果');
  }

  async function handleGenerate(event?: FormEvent) {
    event?.preventDefault();
    if (!imageDataUrl || !consentAccepted || isBusy) return;

    const skuKey = getMirrorSkuKey(mode, beautyReportType);
    const sku = SKU_COSTS[skuKey];
    if (!sku) {
      setError('当前档案类型暂不可用');
      return;
    }

    const runId = Date.now();
    const spendId = buildWalletSpendId();
    pollRunRef.current = runId;
    setError(null);
    setResult(null);
    setTaskId(null);
    setShareCardUrl(null);
    setState('submitting');
    setProgress(2);

    let spent = true;
    if (!usingFreeTryOn) {
      spent = await consumeLingBiForGenerate(
        skuKey,
        `${sku.label} · ${getModeLabel(mode)}`,
        spendId,
      );
    }
    if (!spent) {
      if (pollRunRef.current === runId) {
        setState('idle');
        setProgress(0);
      }
      return;
    }

    setProgress(4);

    try {
      const body: Record<string, unknown> = {
        mode,
        imageDataUrl,
        avoid,
        consentAccepted,
        walletSpendId: spendId,
      };

      if (mode === 'beauty') {
        body.vibe = vibe;
        body.hairConstraint = hairConstraint;
        body.reportType = beautyReportType;
      } else if (mode === 'color') {
        body.seasonHint = seasonHint;
        body.analysisDepth = analysisDepth;
      } else if (mode === 'compare') {
        body.compareStyles = compareStyles.join(',');
      }

      enqueueProductEvent('mirror', 'mirror_tryon_submit', { step: 'submit', props: { feature: 'try_on' } });
      const response = await fetch('/api/mirror/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => ({}))) as MirrorApiResponse;

      if (!response.ok || data.ok === false) {
        if (data.reason === 'under18_garment_blocked') {
          throw new Error(data.error || '未满 18 岁不能使用泳装/内衣类换装。');
        }
        if (data.reason === 'try_on_quota_exhausted') {
          setTryOnRemaining(0);
          setShowTopUp(true);
          throw new Error(data.error || '本月免费换装已用完，请充值灵币。');
        }
        if (response.status === 402 || data.reason === 'insufficient') {
          const balance = typeof data.balance === 'number' ? data.balance : lingBiBalance;
          setLingBiBalance(balance);
          setWalletSource('server');
          setShowTopUp(true);
          throw new Error(`灵币余额不足：当前 ${balance}，需要 ${data.required ?? currentSku?.cost ?? 1}。`);
        }
        if (typeof data.serverBalance === 'number') {
          setLingBiBalance(data.serverBalance);
          setWalletSource('server');
        }
        throw new Error(data.error || '图像任务提交失败');
      }

      if (data.tryOnFree && typeof data.tryOnFree.remaining === 'number') {
        setTryOnRemaining(data.tryOnFree.remaining);
        if (typeof data.tryOnFree.cap === 'number') setTryOnCap(data.tryOnFree.cap);
      }

      if (data.serverWalletDebited && typeof data.serverBalance === 'number') {
        setLingBiBalance(data.serverBalance);
        setWalletSource('server');
      }

      if (data.status === 'completed') {
        setResult({
          imageUrl: data.imageUrl ?? null,
          expiresAt: data.expiresAt ?? null,
          stub: !!data.stub,
          report: data.report ?? null,
          promptPreview: data.promptPreview ?? null,
          mode,
        });
        setProgress(100);
        setState('completed');
        addToHistory({
          mode,
          reportType: mode === 'beauty' ? beautyReportType : undefined,
          summary: data.promptPreview?.slice(0, 200) || '灵镜报告',
          imageUrl: data.imageUrl ?? null,
          reportSections: data.report?.sections ?? undefined,
          reportPalette: data.report?.palette ?? undefined,
        });
        setHistory(getHistory());
        return;
      }

      if (!data.taskId) {
        throw new Error('图像服务没有返回任务 ID');
      }

      setTaskId(data.taskId);
      setState('polling');
      setProgress(normalizeProgress(data.progress, 8));
      await pollTask(data.taskId, runId, data.promptPreview ?? null);
    } catch (err) {
      if (pollRunRef.current !== runId) return;
      setState('failed');
      setError(err instanceof Error ? err.message : '生成失败，请稍后再试');
    }
  }

  const handleGenerateShareCard = useCallback(async () => {
    if (!result) return;
    setGeneratingCard(true);
    try {
      const cardDataUrl = await generateShareCard(
        result.imageUrl,
        result.report,
        result.mode,
      );
      setShareCardUrl(cardDataUrl);
    } catch (err) {
      console.error('Share card generation failed:', err);
      setError(`分享卡片生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setGeneratingCard(false);
    }
  }, [result]);

  const handleDownloadShareCard = useCallback(() => {
    if (!shareCardUrl) return;
    const prefix = mode === 'color' ? 'WTFTI-色彩诊断' : mode === 'compare' ? 'WTFTI-风格对比' : 'WTFTI-灵镜档案';
    downloadDataUrl(shareCardUrl, `${prefix}-${Date.now()}.png`);
  }, [shareCardUrl, mode]);

  const handleSaveToCard = useCallback(() => {
    if (!result) return;
    const summary = result.report
      ? result.report.sections.map(s => `${s.title}: ${s.body}`).join(' | ')
      : result.promptPreview || '灵镜报告';
    recordMirrorResult(result.mode, summary.slice(0, 200));
    setSavedToCard(true);
  }, [result]);

  const handleCreateChallenge = useCallback(() => {
    if (!result) return;
    const summary = result.report
      ? result.report.sections.slice(0, 3).map(s => s.body).join(' ')
      : result.promptPreview || '灵镜报告';
    const data: ChallengeData = {
      mode: result.mode,
      summary: summary.slice(0, 150),
      testedAt: new Date().toISOString().slice(0, 10),
    };
    const url = buildChallengeUrl(data);
    setChallengeUrl(url);
  }, [result]);

  const handleCopyChallenge = useCallback(() => {
    if (!challengeUrl) return;
    navigator.clipboard.writeText(challengeUrl).then(() => {
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 2000);
    });
  }, [challengeUrl]);

  const handleClearCurrentResult = useCallback(() => {
    setImageDataUrl(null);
    setFileName('');
    setResult(null);
    setShareCardUrl(null);
    setChallengeUrl(null);
    setChallengeCopied(false);
    setTaskId(null);
    setProgress(0);
    setState('idle');
    setSavedToCard(false);
    setError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const expiryLabel = result ? formatExpiry(result.expiresAt) : null;

  return (
    <div className="mirror-atelier-shell">
      {/* ══════════════════════════════════════════════════════════════════════
          Atmospheric Background
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="mirror-atelier-orb mirror-atelier-orb--rose" aria-hidden="true" />
      <div className="mirror-atelier-orb mirror-atelier-orb--violet" aria-hidden="true" />
      <div className="mirror-atelier-orb mirror-atelier-orb--gold" aria-hidden="true" />
      <div className="mirror-atelier-orbit" aria-hidden="true">
        <div className="mirror-atelier-orbit__ring" />
        <div className="mirror-atelier-orbit__ring" />
        <div className="mirror-atelier-orbit__ring" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Navigation Breadcrumb
         ══════════════════════════════════════════════════════════════════════ */}
      <nav className="relative z-10">
        <div className="wtfti-wide-container flex items-center justify-between py-6">
          <Link href="/mirror/" className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="inline-block transition-transform duration-300 hover:-translate-x-1">←</span>
            <span style={{ fontFamily: 'var(--font-display)' }}>WTFTI</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs tracking-wider transition-colors hover:text-[var(--color-gold)]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              档案历史
            </button>
            <Link href="/mirror/" className="text-xs tracking-wider transition-colors hover:text-[var(--color-gold)]" style={{ color: 'var(--color-text-secondary)' }}>
              灵笺
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          Hero Section
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10">
        <div className="wtfti-wide-container pb-16 pt-8 sm:pb-24 sm:pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mirror-atelier-fade-in flex items-center justify-center gap-3" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent)' }} />
              <span className="text-[0.65rem] uppercase tracking-[0.34em]" style={{ color: 'var(--color-gold)' }}>
                Mirror Atelier · 形象档案馆
              </span>
              <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent)' }} />
            </div>

            <h1 className="mirror-atelier-fade-in mirror-atelier-fade-in-delay-1 mt-8 text-5xl leading-[1.05] sm:text-7xl" style={{ fontFamily: 'var(--font-display)' }}>
              灵镜 <em className="not-italic" style={{ color: 'var(--color-rose)' }}>Atelier</em>
            </h1>

            <p className="mirror-atelier-fade-in mirror-atelier-fade-in-delay-2 mx-auto mt-6 max-w-xl text-base leading-[1.85] sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              上传一张清晰正面照，把模糊的变美焦虑整理成三页式形象档案。
              <br className="hidden sm:block" />
              灵镜只做审美建议与风格实验，不做颜值评分、身份识别或命运判断。
            </p>

            {/* Product Tiers — Roman Numeral Archive Cards */}
            <div className="mirror-atelier-fade-in mirror-atelier-fade-in-delay-3 mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
              {[
                { num: 'I', label: '灵镜单图', value: '1 灵币 · 轻体验与分享', desc: '快速验证你的风格方向' },
                { num: 'II', label: '三页诊断卡', value: '20 灵币 · 色彩 / 妆发 / 穿搭', desc: '核心档案，建立你的风格基线', highlight: true },
                { num: 'III', label: '灵笺回访', value: '写入人生档案，持续复盘', desc: '每次实验都沉淀成长期资产' },
              ].map((tier, i) => (
                <div
                  key={tier.num}
                  className="mirror-atelier-tier mirror-atelier-fade-in"
                  style={{ animationDelay: `${480 + i * 120}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <span className="mirror-atelier-tier__num">{tier.num}</span>
                    {tier.highlight && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider" style={{ background: 'rgba(192,122,142,0.14)', color: 'var(--color-rose)' }}>
                        核心档案
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                    {tier.label}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: 'var(--color-gold)' }}>
                    {tier.value}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {tier.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mirror-atelier-fade-in mt-10 flex flex-wrap justify-center gap-3">
              <a
                href="#mirror-ritual"
                className="mirror-atelier-submit inline-flex items-center gap-2 px-8"
              >
                开始生成
                <span className="opacity-70">→</span>
              </a>
              <Link
                href="/mysti/destiny/"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm transition-all hover:border-[var(--color-rose)] hover:text-[var(--color-rose)]"
                style={{ borderColor: 'rgba(201,166,118,0.22)', color: 'var(--color-text-secondary)' }}
              >
                命书馆 → 灵鉴
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Ritual Station — Upload & Configuration
         ══════════════════════════════════════════════════════════════════════ */}
      <section id="mirror-ritual" className="relative z-10">
        <div className="wtfti-wide-container pb-16 sm:pb-24">
          <div className="mirror-atelier-panel p-5 sm:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="mirror-atelier-rule flex-1">
                <span className="text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                  Ritual Station
                </span>
              </div>
              <div className="mirror-atelier-balance">
                <span style={{ color: 'var(--color-gold)' }}>◆</span>
                <span>{lingBiBalance} 灵币</span>
                <span style={{ color: 'var(--color-text-muted)' }}>·</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{walletSource === 'server' ? '云端' : '本机'}</span>
                <button
                  type="button"
                  onClick={() => setShowTopUp(true)}
                  className="ml-1 text-[10px] uppercase tracking-wider transition-colors hover:text-[var(--color-text-primary)]"
                  style={{ color: 'var(--color-rose)' }}
                >
                  充值
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              {/* Upload Zone */}
              <label className="mirror-atelier-sanctum group relative flex min-h-[380px] cursor-pointer flex-col items-center justify-center overflow-hidden sm:min-h-[460px]">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={handleImageChange}
                  disabled={isBusy}
                />
                {imageDataUrl ? (
                  <img
                    src={imageDataUrl}
                    alt="已上传的人像预览"
                    className="h-full max-h-[560px] w-full object-cover"
                  />
                ) : (
                  <div className="px-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border" style={{ borderColor: 'rgba(201,166,118,0.2)', background: 'color-mix(in oklab, var(--color-bg-elevated) 40%, transparent)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-gold)' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span className="text-[0.65rem] uppercase tracking-[0.34em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                      Portrait Upload
                    </span>
                    <span className="mt-4 block text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                      上传正面半身照
                    </span>
                    <span className="mt-3 block text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      JPG / PNG / WebP，推荐自然光、无遮挡
                    </span>
                  </div>
                )}
                {fileName && (
                  <span className="absolute bottom-4 left-4 right-4 truncate rounded-full border px-4 py-2 text-xs backdrop-blur" style={{ borderColor: 'rgba(201,166,118,0.15)', background: 'color-mix(in oklab, var(--color-bg-elevated) 75%, transparent)', color: 'var(--color-text-secondary)' }}>
                    {fileName}
                  </span>
                )}
              </label>

              {/* Configuration Panel */}
              <div className="space-y-6">
                {/* Mode Selector */}
                <div>
                  <p className="mb-3 text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                    Archive Mode
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setMode('beauty'); setAvoid('厚重黑发贴脸、荧光色、过度滤镜'); }}
                      disabled={isBusy}
                      className="mirror-atelier-badge"
                      data-active={mode === 'beauty'}
                    >
                      变美灵镜
                    </button>
                    <Link
                      href="/mysti/destiny/"
                      className="mirror-atelier-badge flex items-center justify-center gap-1.5"
                      title="命格分析已升级到灵鉴 · 命运缮写室"
                    >
                      <span>命书馆 →</span>
                      <span className="text-[10px] opacity-50">灵鉴</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMode('color'); setAvoid('刻板印象、种族偏见'); }}
                      disabled={isBusy}
                      className="mirror-atelier-badge"
                      data-active={mode === 'color'}
                      data-accent="gold"
                    >
                      色彩诊断 🎨
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('compare'); setAvoid('过度滤镜、身份特征改变'); }}
                      disabled={isBusy}
                      className="mirror-atelier-badge"
                      data-active={mode === 'compare'}
                      data-accent="violet"
                    >
                      风格对比 ⚡
                    </button>
                  </div>
                </div>

                {/* Beauty Options */}
                {mode === 'beauty' && (
                  <>
                    <div>
                      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                        Vibe
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {VIBE_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setVibe(option)}
                            disabled={isBusy}
                            className="mirror-atelier-badge"
                            data-active={vibe === option}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                        Hair Boundary
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {HAIR_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setHairConstraint(option)}
                            disabled={isBusy}
                            className="mirror-atelier-badge"
                            data-active={hairConstraint === option}
                            data-accent="gold"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                        Report Type
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {BEAUTY_REPORT_TYPES.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setBeautyReportType(option.value)}
                            disabled={isBusy}
                            className="mirror-atelier-badge text-left"
                            data-active={beautyReportType === option.value}
                            data-accent={option.value === 'comprehensive' ? 'violet' : undefined}
                          >
                            <span className="block font-medium">{option.label}</span>
                            <span className="block text-[11px] opacity-60 mt-0.5">{option.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Color Options */}
                {mode === 'color' && (
                  <>
                    <div>
                      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                        Season Hint
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {COLOR_SEASON_HINTS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSeasonHint(option)}
                            disabled={isBusy}
                            className="mirror-atelier-badge"
                            data-active={seasonHint === option}
                            data-accent="gold"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                        Analysis Depth
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {COLOR_DEPTHS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setAnalysisDepth(option)}
                            disabled={isBusy}
                            className="mirror-atelier-badge"
                            data-active={analysisDepth === option}
                            data-accent="gold"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Compare Options */}
                {mode === 'compare' && (
                  <div>
                    <p className="mb-3 text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                      Compare Styles（选 2-3 个）
                    </p>
                    {tryOnRemaining != null ? (
                      <p className="mb-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        本月免费换装剩余 <strong style={{ color: 'var(--color-gold)' }}>{tryOnRemaining}</strong> / {tryOnCap}
                        {usingFreeTryOn ? ' · 本次不扣灵币' : ' · 超出后扣灵币'}
                        {under18 ? ' · 未满18岁已隐藏泳装/内衣风' : ''}
                      </p>
                    ) : (
                      <p className="mb-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        登录后每月 {tryOnCap} 次免费静态换装；未满 18 岁不做泳装内衣类。
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2.5">
                      {compareStyleOptions.map(option => {
                        const selected = compareStyles.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setCompareStyles(prev => {
                                if (prev.includes(option)) return prev.filter(s => s !== option);
                                if (prev.length >= 3) return prev;
                                return [...prev, option];
                              });
                            }}
                            disabled={isBusy}
                            className="mirror-atelier-badge"
                            data-active={selected}
                            data-accent="violet"
                          >
                            {selected ? '✓ ' : ''}{option}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      已选 {compareStyles.length}/3：{compareStyles.join(' vs ')}
                    </p>
                  </div>
                )}

                {/* Avoid */}
                <label className="block">
                  <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                    Avoid
                  </span>
                  <textarea
                    value={avoid}
                    onChange={event => setAvoid(event.target.value)}
                    disabled={isBusy}
                    rows={3}
                    maxLength={80}
                    className="mirror-atelier-input"
                    placeholder="输入你想避免的风格元素..."
                  />
                </label>

                {/* Consent */}
                <label className="flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed" style={{ borderColor: 'rgba(201,166,118,0.12)', background: 'color-mix(in oklab, var(--color-bg-elevated) 35%, transparent)' }}>
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={event => setConsentAccepted(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0"
                    style={{ accentColor: 'var(--color-rose)' }}
                    disabled={isBusy}
                  />
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    我确认拥有照片使用权，且本人已满 18 岁或已获得监护人授权；同意本次照片发送至第三方图像模型生成风格报告。WTFTI 不做人脸库、身份识别、颜值评分或医疗皮肤诊断，结果图会标注 AI 生成。
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  data-pending={isBusy ? 'true' : undefined}
                  className="mirror-atelier-submit"
                  aria-busy={isBusy}
                >
                  {state === 'submitting'
                    ? '提交任务中…'
                    : state === 'polling'
                      ? '生成报告中…'
                      : mode === 'color'
                        ? '生成色彩诊断'
                        : mode === 'compare'
                          ? '生成风格对比'
                          : beautyReportType === 'comprehensive'
                            ? '生成三页形象档案'
                            : '生成灵镜单图'}
                </button>

                {/* Progress */}
                {isBusy && (
                  <div className="space-y-2">
                    <div className="mirror-atelier-progress">
                      <div className="mirror-atelier-progress__bar" style={{ width: `${Math.max(6, progress)}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span>{progress}%</span>
                      {taskId && <span>任务 {taskId.slice(0, 14)}…</span>}
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-2xl border px-4 py-3 text-sm leading-relaxed" style={{ borderColor: 'rgba(192,122,142,0.25)', background: 'rgba(192,122,142,0.08)', color: 'var(--color-rose)' }}>
                    {error}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Result Archive Section
         ══════════════════════════════════════════════════════════════════════ */}
      {result && (
        <section className="relative z-10">
          <div className="wtfti-wide-container pb-16 sm:pb-24">
            <div className="mirror-atelier-archive p-5 sm:p-10">
              {/* Result Header */}
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="text-[0.65rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                  Archive Result
                </span>
                <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent)' }} />
                <span className="text-[0.65rem] uppercase tracking-[0.24em]" style={{ color: 'var(--color-text-muted)' }}>
                  {result.stub
                    ? 'Preview Mode'
                    : result.mode === 'color'
                      ? '色彩诊断 · GPT-Image-2'
                      : result.mode === 'compare'
                        ? '风格对比 · GPT-Image-2'
                        : '灵镜 Atelier · GPT-Image-2'}
                </span>
              </div>

              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                {/* Left: Text & Actions */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-4xl leading-[1.08] sm:text-5xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                      {result.mode === 'color'
                        ? '你的色彩季节诊断'
                        : result.mode === 'compare'
                          ? '你的风格对比报告'
                          : result.mode === 'beauty' && beautyReportType === 'comprehensive'
                            ? '你的三页形象档案'
                            : '你的第一张灵镜报告'}
                    </h2>
                    <p className="mt-5 text-sm leading-[1.85] sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                      {result.stub
                        ? '当前没有检测到 APIMart Key，所以展示本地预览结构；配置后会显示真实生成图。'
                        : result.mode === 'color'
                          ? '色彩诊断基于照片中的肤色、发色、瞳孔色与整体气质生成，只作为审美参考。'
                          : result.mode === 'compare'
                            ? '风格对比展示同一个人在不同风格下的表达可能，帮你找到更适合的出现方式。'
                            : '这份灵镜结果已按 AI 生成内容标识处理，可存入 WTF Card 或回到灵笺查看。'}
                    </p>
                  </div>

                  <div className="rounded-full border px-4 py-2 text-xs" style={{ borderColor: 'rgba(201,166,118,0.14)', background: 'color-mix(in oklab, var(--color-bg-elevated) 40%, transparent)', color: 'var(--color-text-muted)' }}>
                    AI generated · WTFTI 灵镜 · 不做颜值评分、身份识别或命运判断
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {result.imageUrl && (
                      <a
                        href={result.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                        style={{ borderColor: 'rgba(201,166,118,0.2)', color: 'var(--color-text-secondary)' }}
                      >
                        打开结果图
                      </a>
                    )}
                    <button type="button" onClick={() => void handleGenerate()} className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm transition-all hover:border-[var(--color-rose)] hover:text-[var(--color-rose)]" style={{ borderColor: 'rgba(201,166,118,0.2)', color: 'var(--color-text-secondary)' }}>
                      再生成一次
                    </button>
                    <button type="button" onClick={handleClearCurrentResult} className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm transition-all hover:border-[var(--color-rose)] hover:text-[var(--color-rose)]" style={{ borderColor: 'rgba(201,166,118,0.2)', color: 'var(--color-text-secondary)' }}>
                      删除本次结果
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateShareCard}
                      disabled={generatingCard}
                      className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] disabled:opacity-40"
                      style={{ borderColor: 'rgba(201,166,118,0.3)', color: 'var(--color-gold)' }}
                    >
                      {generatingCard ? '生成中…' : '生成分享卡片'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveToCard}
                      disabled={savedToCard}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm transition-opacity disabled:opacity-40"
                      style={{ background: 'rgba(201,166,118,0.14)', color: 'var(--color-gold)' }}
                    >
                      {savedToCard ? '✓ 已存入档案' : '存入 WTF Card'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateChallenge}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm transition-opacity hover:opacity-80"
                      style={{ background: 'rgba(156,124,255,0.14)', color: 'var(--color-sage)' }}
                    >
                      发起挑战 ⚡
                    </button>
                  </div>

                  {expiryLabel && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      图片链接预计有效至：{expiryLabel}
                    </p>
                  )}
                </div>

                {/* Right: Image & Report */}
                <div className="space-y-6">
                  {/* Generated Image */}
                  <div className="overflow-hidden rounded-3xl border p-2.5" style={{ borderColor: 'rgba(201,166,118,0.12)', background: 'color-mix(in oklab, var(--color-bg-elevated) 30%, transparent)' }}>
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.mode === 'color'
                          ? 'GPT-Image-2 生成的色彩诊断报告'
                          : result.mode === 'compare'
                            ? 'GPT-Image-2 生成的风格对比报告'
                            : 'GPT-Image-2 生成的个人风格灵镜报告'}
                        className="w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <PreviewReportCard report={result.report} mode={result.mode} />
                    )}
                  </div>

                  {/* Analysis Highlights */}
                  {result.report && (
                    <div className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: 'rgba(201,166,118,0.12)', background: 'color-mix(in oklab, var(--color-bg-elevated) 35%, transparent)' }}>
                      <div className="mirror-atelier-rule mb-6">
                        <span className="text-[0.6rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                          Analysis Highlights
                        </span>
                      </div>

                      <div className="space-y-5">
                        {result.report.sections.map((section, index) => (
                          <div key={section.title} className="border-t pt-5" style={{ borderColor: 'rgba(201,166,118,0.1)' }}>
                            <p className="text-[0.65rem]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                              {String(index + 1).padStart(2, '0')}
                            </p>
                            <h4 className="mt-2 text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                              {section.title}
                            </h4>
                            <p className="mt-2 text-sm leading-[1.8]" style={{ color: 'var(--color-text-secondary)' }}>
                              {section.body}
                            </p>
                          </div>
                        ))}
                      </div>

                      {result.report.palette.length > 0 && (
                        <div className="mt-6 border-t pt-5" style={{ borderColor: 'rgba(201,166,118,0.1)' }}>
                          <p className="mb-3 text-[0.6rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                            色彩关键词
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.report.palette.map(color => (
                              <span
                                key={color}
                                className="rounded-full border px-3.5 py-1.5 text-xs"
                                style={{ borderColor: 'rgba(201,166,118,0.25)', color: 'var(--color-gold)' }}
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 border-t pt-4" style={{ borderColor: 'rgba(201,166,118,0.1)' }}>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                          {result.mode === 'color'
                            ? '色彩诊断仅供审美参考，不构成任何身份判断或健康评估。'
                            : result.mode === 'compare'
                              ? '风格对比仅供审美参考，不做颜值评分或身份判断。'
                              : '灵镜报告仅作审美建议参考，不做颜值评分、身份识别或命运判断。'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Challenge Link */}
                  {challengeUrl && (
                    <div className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: 'rgba(201,166,118,0.12)', background: 'color-mix(in oklab, var(--color-bg-elevated) 35%, transparent)' }}>
                      <div className="mirror-atelier-rule mb-5">
                        <span className="text-[0.6rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                          Challenge Link
                        </span>
                      </div>
                      <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        把这个链接发给好友，邀请 TA 一起做灵镜测试：
                      </p>
                      <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: 'rgba(201,166,118,0.12)', background: 'color-mix(in oklab, var(--color-bg-elevated) 45%, transparent)' }}>
                        <p className="break-all text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                          {challengeUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyChallenge}
                        className="mirror-atelier-submit"
                      >
                        {challengeCopied ? '✓ 已复制' : '复制挑战链接'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Roadmap Section
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10">
        <div className="wtfti-wide-container pb-16 sm:pb-24">
          <div className="mb-10 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent)' }} />
              <span className="text-[0.65rem] uppercase tracking-[0.34em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                Roadmap
              </span>
              <span className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent)' }} />
            </div>
            <h2 className="text-3xl sm:text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
              档案系统正在生长
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: 'P0', title: '三页形象档案', body: '把色彩、妆发、穿搭合成一次可保存的灵镜档案。' },
              { step: 'P1', title: '场景风格包', body: '面试、约会、旅行、年会等场景回到灵镜生成出现方式。' },
              { step: 'P2', title: '灵笺复盘', body: '把每次形象实验沉淀到人生档案，形成长期回访资产。' },
            ].map((item, i) => (
              <div
                key={item.step}
                className="mirror-atelier-tier"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="text-[0.65rem] uppercase tracking-[0.24em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                  {item.step}
                </span>
                <h3 className="mt-5 text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Top-up Modal
         ══════════════════════════════════════════════════════════════════════ */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,11,15,0.75)', backdropFilter: 'blur(12px)' }}>
          <div className="mirror-atelier-drawer w-full max-w-md p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                充值灵币
              </h3>
              <button
                type="button"
                onClick={() => setShowTopUp(false)}
                className="text-2xl leading-none transition-colors hover:text-[var(--color-rose)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div className="mb-6 rounded-2xl border p-5" style={{ borderColor: 'rgba(201,166,118,0.12)', background: 'color-mix(in oklab, var(--color-bg-elevated) 45%, transparent)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                当前灵币：<span className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{lingBiBalance}</span>
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                单图体验 1 灵币 · 三页诊断卡 20 灵币
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>选择支付方式</p>
              <div className="grid grid-cols-2 gap-2">
                {(['wechat', 'alipay'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setPaymentChannel(ch)}
                    className="mirror-atelier-badge justify-center"
                    data-active={paymentChannel === ch}
                  >
                    {ch === 'wechat' ? '微信支付' : '支付宝'}
                  </button>
                ))}
              </div>
            </div>

            {paused ? (
              <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }} data-payment-paused="1">{pausedNote(paused)}</p>
            ) : null}
            <div className="mb-4 space-y-3">
              {getTopUpOptions().map(option => (
                <button
                  key={option.pack}
                  type="button"
                  disabled={paymentLoading || paymentPolling || !!paused}
                  onClick={() => handleTopUp(option.pack)}
                  className="mirror-atelier-tier w-full text-left transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{option.label}</span>
                        {option.highlight && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(192,122,142,0.14)', color: 'var(--color-rose)' }}>
                            核心档案
                          </span>
                        )}
                      </div>
                      <span className="mt-1 block text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {option.subtitle ?? `${option.credits} 灵币 · 约 ¥${option.price / option.credits}/灵币`}
                      </span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-rose)' }}>
                      {paymentLoading ? '创建中…' : `¥${option.price}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {paymentPolling && (
              <div className="mb-4 rounded-xl border p-3 text-center" style={{ borderColor: 'rgba(192,122,142,0.15)', background: 'rgba(192,122,142,0.06)' }}>
                <div className="mx-auto mb-2 h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(192,122,142,0.2)', borderTopColor: 'var(--color-rose)' }} />
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>等待支付确认…</p>
              </div>
            )}

            {paymentError && (
              <p className="mb-4 text-center text-xs" style={{ color: 'var(--color-rose)' }}>{paymentError}</p>
            )}

            <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              支付成功后自动入账 Ling-Bi，可用于灵镜与后续命书馆消费
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          History Drawer
         ══════════════════════════════════════════════════════════════════════ */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,11,15,0.75)', backdropFilter: 'blur(12px)' }}>
          <div className="mirror-atelier-drawer w-full max-w-lg max-h-[82vh] overflow-y-auto p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                灵镜历史
              </h3>
              <div className="flex items-center gap-3">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs transition-colors hover:text-[var(--color-rose)]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    清空
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-2xl leading-none transition-colors hover:text-[var(--color-rose)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="py-10 text-center" style={{ color: 'var(--color-text-muted)' }}>暂无历史记录</p>
            ) : (
              <div className="space-y-3">
                {history.map(record => (
                  <HistoryCard key={record.id} record={record} />
                ))}
              </div>
            )}

            <p className="mt-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              历史记录保留 3 天，可随时清空本地记录；第三方图片链接按服务商有效期自动失效
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Share Card Overlay
         ══════════════════════════════════════════════════════════════════════ */}
      {shareCardUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,11,15,0.8)', backdropFilter: 'blur(14px)' }} onClick={() => setShareCardUrl(null)}>
          <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="overflow-hidden rounded-3xl border shadow-2xl" style={{ borderColor: 'rgba(201,166,118,0.15)' }}>
              <img src={shareCardUrl} alt="灵镜分享卡片" className="w-full object-cover" />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleDownloadShareCard} className="mirror-atelier-submit flex-1">
                下载卡片
              </button>
              <button type="button" onClick={() => setShareCardUrl(null)} className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm transition-colors hover:border-[var(--color-rose)]" style={{ borderColor: 'rgba(201,166,118,0.2)', color: 'var(--color-text-secondary)' }}>
                关闭
              </button>
            </div>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              1080×1920 · 适合小红书 / 朋友圈 / 微博
            </p>
          </div>
        </div>
      )}

      {/* Loading overlay during card generation */}
      {generatingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,11,15,0.6)', backdropFilter: 'blur(10px)' }}>
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(201,166,118,0.15)', borderTopColor: 'var(--color-gold)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>生成分享卡片中…</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>约需 2-3 秒</p>
          </div>
        </div>
      )}
    </div>
  );
}


function HistoryCard({ record }: { record: MirrorHistoryRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const modeLabel = record.mode === 'beauty' ? '🌹 变美灵镜' :
    record.mode === 'fortune' ? '旧命纹记录' :
    record.mode === 'color' ? '🎨 色彩诊断' :
    record.mode === 'compare' ? '⚡ 风格对比' : '🔮 灵镜';

  const reportTypeLabel = record.reportType === 'hairstyle' ? ' · 发型专项' :
    record.reportType === 'makeup' ? ' · 妆容专项' :
    record.reportType === 'fashion' ? ' · 服饰配饰' : '';

  const hasReportData = record.reportSections && record.reportSections.length > 0;
  const hasImage = record.imageUrl && !imgFailed;
  const expiryDays = Math.max(
    0,
    Math.ceil((record.expiresAt - record.timestamp) / (24 * 60 * 60 * 1000)),
  );

  const handleDownload = () => {
    if (!record.imageUrl) return;
    const a = document.createElement('a');
    a.href = record.imageUrl;
    a.download = `WTFTI-${record.mode}-${record.id}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'rgba(201,166,118,0.1)', background: 'color-mix(in oklab, var(--color-bg-elevated) 40%, transparent)' }}>
      {hasImage && (
        <div className="relative">
          <img
            src={record.imageUrl!}
            alt={`${modeLabel}结果`}
            className="h-40 w-full object-cover"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
          />
          {!imgLoaded && !imgFailed && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'color-mix(in oklab, var(--color-bg-elevated) 70%, transparent)' }}>
              <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: 'rgba(201,166,118,0.15)', borderTopColor: 'var(--color-gold)' }} />
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(record.imageUrl!, '_blank')}
              className="rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur transition-opacity hover:opacity-90"
              style={{ background: 'color-mix(in oklab, var(--color-text-primary) 55%, transparent)', color: '#F5F0E8' }}
            >
              查看原图
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur transition-opacity hover:opacity-90"
              style={{ background: 'rgba(201,166,118,0.75)', color: '#1a1530' }}
            >
              下载
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {modeLabel}{reportTypeLabel}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(record.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{record.summary}</p>
        <div className="mt-2 flex items-center gap-3">
          {hasReportData && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs transition-colors hover:text-[var(--color-gold)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {expanded ? '收起报告' : '展开报告'}
            </button>
          )}
          {imgFailed && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>图片已过期</span>
          )}
          <span className="ml-auto text-xs" style={{ color: 'var(--color-text-muted)' }}>
            本地保留约 {expiryDays} 天
          </span>
        </div>

        {expanded && hasReportData && (
          <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: 'rgba(201,166,118,0.08)' }}>
            {record.reportSections?.map((section, i) => (
              <div key={i}>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{section.title}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{section.body}</p>
              </div>
            ))}
            {record.reportPalette && record.reportPalette.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {record.reportPalette.map(color => (
                  <span
                    key={color}
                    className="rounded-full border px-2 py-0.5 text-[10px]"
                    style={{ borderColor: 'rgba(201,166,118,0.2)', color: 'var(--color-gold)' }}
                  >
                    {color}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewReportCard({ report, mode }: { report: PreviewReport | null; mode: MirrorMode }) {
  const sections = report?.sections ?? [];
  const palette = report?.palette ?? [];

  return (
    <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)', color: 'var(--color-text-primary)' }}>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent)' }} />
        <span className="text-[0.6rem] uppercase tracking-[0.32em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
          {mode === 'color' ? 'Color Preview' : mode === 'compare' ? 'Compare Preview' : 'Mirror Preview'}
        </span>
        <span className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold) 50%, transparent)' }} />
      </div>
      <h3 className="mt-8 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
        {mode === 'color' ? '色彩诊断' : mode === 'compare' ? '风格对比' : '个人风格灵镜'}
      </h3>
      <div className="mt-6 flex flex-wrap gap-2">
        {palette.map(color => (
          <span
            key={color}
            className="rounded-full border px-3 py-1 text-xs"
            style={{ borderColor: 'rgba(201,166,118,0.25)', color: 'var(--color-text-secondary)' }}
          >
            {color}
          </span>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {sections.map((section, index) => (
          <div key={section.title} className="border-t pt-4" style={{ borderColor: 'rgba(201,166,118,0.1)' }}>
            <p className="text-[0.65rem]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
              {String(index + 1).padStart(2, '0')}
            </p>
            <h4 className="mt-2 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
              {section.title}
            </h4>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {section.body}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 border-t pt-4" style={{ borderColor: 'rgba(201,166,118,0.1)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {mode === 'color'
            ? '色彩诊断仅供审美参考，不构成任何身份判断。'
            : mode === 'compare'
              ? '风格对比仅供审美参考，不做颜值评分或身份判断。'
              : 'AI generated · 灵镜报告仅作审美建议参考。'}
        </p>
      </div>
    </div>
  );
}
