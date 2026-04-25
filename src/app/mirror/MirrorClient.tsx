'use client';

/* eslint-disable @next/next/no-img-element -- APIMart returns temporary external URLs and uploads use browser data URLs. */

import { useRef, useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { recordMirrorResult } from '@/lib/wtf-card';
import { buildChallengeUrl, type ChallengeData } from '@/lib/mirror/challenge';
import {
  checkPaywall,
  consumeCredit,
  hasCredits,
  getFreeCreditsRemaining,
  addCredits,
  getTopUpOptions,
  addToHistory,
  getHistory,
  type MirrorHistoryRecord,
  type PaywallResult,
} from '@/lib/mirror/credits';

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
}

interface MirrorResult {
  imageUrl: string | null;
  expiresAt: number | null;
  stub: boolean;
  report: PreviewReport | null;
  promptPreview: string | null;
  mode: MirrorMode;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_DATA_URI_BYTES = 3_000_000;
const MAX_CANVAS_SIDE = 1600;

const VIBE_OPTIONS = ['原生自然', '清冷通勤', '约会玫瑰', '暗黑辣妹'];
const HAIR_OPTIONS = ['可剪可染', '只改造型', '保留长发', '保留短发'];
const FORTUNE_ANALYSIS_TYPES = ['面相气质分析', '五官亮点标注', '风格命格解读', '掌纹命理分析'];
const FORTUNE_FOCUS_AREAS = ['五官比例', '脸型轮廓', '气场特质', '眼神解读'];
const COLOR_SEASON_HINTS = ['自动判断', '偏春季型', '偏夏季型', '偏秋季型', '偏冬季型'];
const COLOR_DEPTHS = ['完整报告', '快速诊断'];
const COMPARE_STYLE_OPTIONS = ['原生自然', '清冷通勤', '约会玫瑰', '暗黑辣妹'];
const BEAUTY_REPORT_TYPES: { value: BeautyReportType; label: string; desc: string }[] = [
  { value: 'comprehensive', label: '综合变美', desc: '发型+色彩+妆容全览' },
  { value: 'hairstyle', label: '发型专项', desc: '3 套发型改造方案' },
  { value: 'makeup', label: '妆容专项', desc: '3 套妆容教学方案' },
  { value: 'fashion', label: '服饰配饰', desc: '3 套穿搭推荐方案' },
];

const PRODUCT_LAYERS = [
  { label: '免费引流图', value: '3 个结论 + 水印分享卡' },
  { label: '完整报告', value: '发型三案 + 色卡九宫格 + 妆容动线' },
  { label: '长期档案', value: 'WTFTI 主神人格 × 风格资产库' },
];

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
    // Set crossOrigin for external URLs to avoid canvas tainting
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
  const modeLabel = mode === 'fortune' ? 'WTFTI 灵镜命纹' : mode === 'color' ? 'WTFTI 色彩诊断' : mode === 'compare' ? 'WTFTI 风格对比' : 'WTFTI 灵镜实验室';
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
  const IMG_MAX_H = IMG_BOTTOM - IMG_TOP; // 1600px

  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const imgW = W;
      const imgH = (img.naturalHeight / img.naturalWidth) * imgW;
      const drawH = Math.min(imgH, IMG_MAX_H);
      const drawW = (drawH / imgH) * imgW;
      const x = (W - drawW) / 2;
      const y = IMG_TOP + (IMG_MAX_H - drawH) / 2; // center vertically
      ctx.drawImage(img, x, y, drawW, drawH);
    } catch {
      // Fallback: draw report as styled text
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
  let qrDrawn = false;
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
        qrDrawn = true;
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
  ctx.fillText('wtfti.com · 仅供娱乐', 60, H - 28);

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
    // Simple text wrap
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const chars = text.split('');
  let line = '';
  let currentY = y;

  for (const char of chars) {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
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
  const [vibe, setVibe] = useState(VIBE_OPTIONS[0]);
  const [hairConstraint, setHairConstraint] = useState(HAIR_OPTIONS[0]);
  const [analysisType, setAnalysisType] = useState(FORTUNE_ANALYSIS_TYPES[0]);
  const [focusAreas, setFocusAreas] = useState(FORTUNE_FOCUS_AREAS[0]);
  const [seasonHint, setSeasonHint] = useState(COLOR_SEASON_HINTS[0]);
  const [analysisDepth, setAnalysisDepth] = useState(COLOR_DEPTHS[0]);
  const [compareStyles, setCompareStyles] = useState<string[]>(['原生自然', '暗黑辣妹']);
  const [beautyReportType, setBeautyReportType] = useState<BeautyReportType>('comprehensive');
  const [savedToCard, setSavedToCard] = useState(false);
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [paywall, setPaywall] = useState<PaywallResult>({
    allowed: true,
    reason: 'free',
    remaining: 2,
    message: '免费次数剩余 2 次',
  });
  const [showTopUp, setShowTopUp] = useState(false);
  const [history, setHistory] = useState<MirrorHistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [avoid, setAvoid] = useState('厚重黑发贴脸、荧光色、过度滤镜');

  // Hydrate from localStorage after mount
  useEffect(() => {
    setPaywall(checkPaywall());
    setHistory(getHistory());
    setHydrated(true);
  }, []);
  const [consentAccepted, setConsentAccepted] = useState(false);
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
        // Record to history
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

    // Check paywall
    const pw = checkPaywall();
    if (!pw.allowed) {
      setPaywall(pw);
      setShowTopUp(true);
      return;
    }

    // Consume credit
    const creditResult = consumeCredit();
    if (!creditResult.success) {
      setError('扣费失败，请重试');
      return;
    }
    setPaywall(checkPaywall());

    const runId = Date.now();
    pollRunRef.current = runId;
    setError(null);
    setResult(null);
    setTaskId(null);
    setShareCardUrl(null);
    setState('submitting');
    setProgress(4);

    try {
      const body: Record<string, unknown> = {
        mode,
        imageDataUrl,
        avoid,
        consentAccepted,
      };

      if (mode === 'beauty') {
        body.vibe = vibe;
        body.hairConstraint = hairConstraint;
        body.reportType = beautyReportType;
      } else if (mode === 'fortune') {
        body.analysisType = analysisType;
        body.focusAreas = focusAreas;
      } else if (mode === 'color') {
        body.seasonHint = seasonHint;
        body.analysisDepth = analysisDepth;
      } else if (mode === 'compare') {
        body.compareStyles = compareStyles.join(',');
      }

      const response = await fetch('/api/mirror/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => ({}))) as MirrorApiResponse;

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || '图像任务提交失败');
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
        // Record to history
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
    const prefix = mode === 'fortune' ? 'WTFTI-灵镜命纹' : mode === 'color' ? 'WTFTI-色彩诊断' : mode === 'compare' ? 'WTFTI-风格对比' : 'WTFTI-灵镜报告';
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

  const expiryLabel = result ? formatExpiry(result.expiresAt) : null;

  return (
    <div className="wtfti-site-shell">
      <section className="wtfti-section pt-16 sm:pt-24">
        <div className="wtfti-wide-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4">
              <span className="serial-number text-sm">Mirror 01</span>
              <span className="editorial-rule w-20" />
              <span className="eyebrow">AI Style Lab</span>
            </div>

            <h1 className="wtfti-display mt-8 text-5xl sm:text-7xl">
              灵镜实验室
              <span className="block text-[0.62em] text-text-secondary">
                发型 · 色彩 · 妆容 · 命纹
              </span>
            </h1>

            <p className="wtfti-copy mt-8 max-w-xl">
              上传一张清晰正面照，选择变美灵镜或命纹灵镜。变美灵镜生成风格报告图，命纹灵镜用面相学做趣味性格解读。
            </p>

            <div className="mt-10 grid gap-px overflow-hidden rounded-[24px] border border-border-subtle bg-border-subtle sm:grid-cols-3">
              {PRODUCT_LAYERS.map(item => (
                <div key={item.label} className="bg-bg-elevated/85 p-5">
                  <p className="eyebrow text-[0.58rem]">{item.label}</p>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#mirror-tool" className="btn btn-rose">
                开始生成
                <span className="opacity-70">→</span>
              </a>
              <Link href="/wtfti/" className="btn btn-ghost" prefetch={false}>
                返回人格神域
              </Link>
            </div>
          </div>

          <form
            id="mirror-tool"
            onSubmit={handleGenerate}
            className="wtfti-panel rounded-[28px] p-5 sm:p-7"
          >
            <div className="grid gap-5 xl:grid-cols-[0.98fr_1.02fr]">
              <label
                className="group relative flex min-h-[360px] cursor-pointer items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-border bg-bg-elevated/70 transition-colors hover:border-text-muted"
              >
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
                    className="h-full max-h-[520px] w-full object-cover"
                  />
                ) : (
                  <span className="px-8 text-center">
                    <span className="eyebrow block">Portrait</span>
                    <span className="mt-5 block text-2xl text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                      上传正面半身照
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-text-muted">
                      JPG / PNG / WebP，推荐自然光、无遮挡
                    </span>
                  </span>
                )}
                {fileName && (
                  <span className="absolute bottom-4 left-4 right-4 truncate rounded-full border border-border-subtle bg-bg-elevated/90 px-4 py-2 text-xs text-text-muted backdrop-blur">
                    {fileName}
                  </span>
                )}
              </label>

              <div className="space-y-5">
                {/* Credits display */}
                <div className="flex items-center justify-between p-3 rounded-[18px] border border-border-subtle bg-bg-elevated/55">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔮</span>
                    <span className="text-sm text-text-secondary">
                      余额：<span className="font-medium text-text-primary">{paywall.remaining}</span> 次
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                      历史
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTopUp(true)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                      style={{ background: 'var(--color-gold-leaf)', color: '#1a1530' }}
                    >
                      充值
                    </button>
                  </div>
                </div>

                {/* Mode selector */}
                <div>
                  <p className="eyebrow mb-3">Product Mode</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setMode('beauty'); setAvoid('厚重黑发贴脸、荧光色、过度滤镜'); }}
                      disabled={isBusy}
                      className={`rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
                        mode === 'beauty'
                          ? 'border-rose-deep bg-rose-deep text-bg-primary'
                          : 'border-border-subtle bg-bg-elevated/50 text-text-muted hover:border-text-muted'
                      }`}
                    >
                      变美灵镜
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('fortune'); setAvoid('负面定论、恐吓性预言'); }}
                      disabled={isBusy}
                      className={`rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
                        mode === 'fortune'
                          ? 'border-accent bg-accent text-bg-primary'
                          : 'border-border-subtle bg-bg-elevated/50 text-text-muted hover:border-text-muted'
                      }`}
                    >
                      命纹灵镜 ✦
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('color'); setAvoid('刻板印象、种族偏见'); }}
                      disabled={isBusy}
                      className={`rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
                        mode === 'color'
                          ? 'border-gold bg-gold text-text-primary'
                          : 'border-border-subtle bg-bg-elevated/50 text-text-muted hover:border-text-muted'
                      }`}
                    >
                      色彩诊断 🎨
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('compare'); setAvoid('过度滤镜、身份特征改变'); }}
                      disabled={isBusy}
                      className={`rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
                        mode === 'compare'
                          ? 'border-accent bg-accent text-bg-primary'
                          : 'border-border-subtle bg-bg-elevated/50 text-text-muted hover:border-text-muted'
                      }`}
                    >
                      风格对比 ⚡
                    </button>
                  </div>
                </div>

                {/* Beauty-specific options */}
                {mode === 'beauty' && (
                  <>
                    <div>
                      <p className="eyebrow mb-3">Vibe</p>
                      <div className="grid grid-cols-2 gap-2">
                        {VIBE_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setVibe(option)}
                            disabled={isBusy}
                            className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                              vibe === option
                                ? 'border-rose-deep bg-rose-deep text-bg-primary'
                                : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="eyebrow mb-3">Hair Boundary</p>
                      <div className="grid grid-cols-2 gap-2">
                        {HAIR_OPTIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setHairConstraint(option)}
                            disabled={isBusy}
                            className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                              hairConstraint === option
                                ? 'border-gold-leaf bg-gold-leaf text-text-primary'
                                : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Beauty report type selector */}
                {mode === 'beauty' && (
                  <div>
                    <p className="eyebrow mb-3">Report Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {BEAUTY_REPORT_TYPES.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setBeautyReportType(option.value)}
                          disabled={isBusy}
                          className={`rounded-full border px-4 py-3 text-sm transition-colors text-left ${
                            beautyReportType === option.value
                              ? 'border-rose-deep bg-rose-deep/15 text-rose-deep'
                              : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                          }`}
                        >
                          <span className="block font-medium">{option.label}</span>
                          <span className="block text-xs opacity-70 mt-0.5">{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fortune-specific options */}
                {mode === 'fortune' && (
                  <>
                    <div>
                      <p className="eyebrow mb-3">Analysis Type</p>
                      <div className="grid grid-cols-1 gap-2">
                        {FORTUNE_ANALYSIS_TYPES.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setAnalysisType(option)}
                            disabled={isBusy}
                            className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                              analysisType === option
                                ? 'border-accent bg-accent/15 text-accent'
                                : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="eyebrow mb-3">Focus Areas</p>
                      <div className="grid grid-cols-2 gap-2">
                        {FORTUNE_FOCUS_AREAS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFocusAreas(option)}
                            disabled={isBusy}
                            className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                              focusAreas === option
                                ? 'border-gold-leaf bg-gold-leaf/15 text-gold-leaf'
                                : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Color-specific options */}
                {mode === 'color' && (
                  <>
                    <div>
                      <p className="eyebrow mb-3">Season Hint</p>
                      <div className="grid grid-cols-2 gap-2">
                        {COLOR_SEASON_HINTS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSeasonHint(option)}
                            disabled={isBusy}
                            className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                              seasonHint === option
                                ? 'border-gold bg-gold/15 text-gold'
                                : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="eyebrow mb-3">Analysis Depth</p>
                      <div className="grid grid-cols-2 gap-2">
                        {COLOR_DEPTHS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setAnalysisDepth(option)}
                            disabled={isBusy}
                            className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                              analysisDepth === option
                                ? 'border-gold-leaf bg-gold-leaf/15 text-gold-leaf'
                                : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Compare-specific options */}
                {mode === 'compare' && (
                  <div>
                    <p className="eyebrow mb-3">Compare Styles (选 2-3 个)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPARE_STYLE_OPTIONS.map(option => {
                        const selected = compareStyles.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setCompareStyles(prev => {
                                if (prev.includes(option)) {
                                  return prev.filter(s => s !== option);
                                }
                                if (prev.length >= 3) return prev;
                                return [...prev, option];
                              });
                            }}
                            disabled={isBusy}
                            className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                              selected
                                ? 'border-accent bg-accent/15 text-accent'
                                : 'border-border-subtle bg-bg-elevated/65 text-text-secondary hover:border-text-muted'
                            }`}
                          >
                            {selected ? '✓ ' : ''}{option}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-text-muted">
                      已选 {compareStyles.length}/3：{compareStyles.join(' vs ')}
                    </p>
                  </div>
                )}

                <label className="block">
                  <span className="eyebrow mb-3 block">Avoid</span>
                  <textarea
                    value={avoid}
                    onChange={event => setAvoid(event.target.value)}
                    disabled={isBusy}
                    rows={3}
                    maxLength={80}
                    className="w-full resize-none rounded-[18px] border border-border-subtle bg-bg-elevated/80 px-4 py-3 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-text-muted"
                  />
                </label>

                <label className="flex items-start gap-3 rounded-[18px] border border-border-subtle bg-bg-elevated/55 p-4 text-sm leading-6 text-text-secondary">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={event => setConsentAccepted(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--color-rose-deep)]"
                    disabled={isBusy}
                  />
                  <span>
                    我确认拥有照片使用权，并同意本次照片发送至 APIMart GPT-Image-2 生成风格报告；结果仅作审美/娱乐建议，不构成专业诊断。
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  data-pending={isBusy ? 'true' : undefined}
                  className={`btn w-full ${
                    mode === 'fortune' ? 'btn-ink' : 'btn-rose'
                  }`}
                  aria-busy={isBusy}
                >
                  {state === 'submitting'
                    ? '提交任务中'
                    : state === 'polling'
                      ? '生成报告中'
                      : mode === 'fortune'
                        ? '生成命纹报告'
                        : mode === 'color'
                          ? '生成色彩诊断'
                          : mode === 'compare'
                            ? '生成风格对比'
                            : '生成灵镜报告'}
                </button>

                {isBusy && (
                  <div className="rounded-full border border-border-subtle bg-bg-elevated/55 p-1">
                    <div
                      className="h-2 rounded-full bg-rose-deep transition-[width] duration-500"
                      style={{ width: `${Math.max(8, progress)}%` }}
                    />
                  </div>
                )}

                {taskId && state === 'polling' && (
                  <p className="text-xs leading-5 text-text-muted">
                    任务已提交：{taskId.slice(0, 18)}… APIMart 通常需要 30-60 秒返回图片。
                  </p>
                )}

                {error && (
                  <p className="rounded-[18px] border border-rose-deep/30 bg-rose-dust/20 px-4 py-3 text-sm leading-6 text-rose-deep">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Top-up Modal
         ══════════════════════════════════════════════════════════════════════ */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-[28px] border border-border-subtle p-6 sm:p-8" style={{ background: 'var(--color-bg-primary)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display text-text-primary">充值灵镜次数</h3>
              <button
                type="button"
                onClick={() => setShowTopUp(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 p-4 rounded-[18px] border border-border-subtle bg-bg-elevated/55">
              <p className="text-sm text-text-secondary">
                当前余额：<span className="font-medium text-text-primary text-lg">{paywall.remaining}</span> 次
              </p>
              {getFreeCreditsRemaining() > 0 && (
                <p className="text-xs text-text-muted mt-1">
                  其中免费次数剩余 {getFreeCreditsRemaining()} 次
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {getTopUpOptions().map(option => (
                <button
                  key={option.credits}
                  type="button"
                  onClick={() => {
                    addCredits(option.credits);
                    setPaywall(checkPaywall());
                    setShowTopUp(false);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-[18px] border border-border-subtle hover:border-text-muted transition-colors"
                >
                  <div>
                    <span className="font-medium text-text-primary">{option.label}</span>
                    <span className="block text-xs text-text-muted mt-0.5">¥{option.price / option.credits}/次</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-gold-leaf)' }}>
                    充值 →
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-text-muted text-center">
              单次付费 ¥1/张 · 充值更划算
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          History Panel
         ══════════════════════════════════════════════════════════════════════ */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-[28px] border border-border-subtle p-6 sm:p-8" style={{ background: 'var(--color-bg-primary)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display text-text-primary">灵镜历史</h3>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-text-muted text-center py-8">暂无历史记录</p>
            ) : (
              <div className="space-y-3">
                {history.map(record => (
                  <HistoryCard key={record.id} record={record} />
                ))}
              </div>
            )}

            <p className="text-xs text-text-muted text-center mt-4">
              历史记录保留 3 天，过期自动清除
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Result Section
         ══════════════════════════════════════════════════════════════════════ */}
      {result && (
        <section className="wtfti-section-tight pt-0">
          <div className="wtfti-container">
            <div className="flex items-center gap-4">
              <span className="serial-number text-sm">Result</span>
              <span className="editorial-rule flex-1" />
              <span className="eyebrow">
                {result.stub
                  ? 'Preview Mode'
                  : result.mode === 'fortune'
                    ? '命纹灵镜 · GPT-Image-2'
                    : result.mode === 'color'
                      ? '色彩诊断 · GPT-Image-2'
                      : result.mode === 'compare'
                        ? '风格对比 · GPT-Image-2'
                        : '变美灵镜 · GPT-Image-2'}
              </span>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div>
                <h2 className="wtfti-display text-4xl sm:text-5xl">
                  {result.mode === 'fortune'
                    ? '你的命纹'
                    : result.mode === 'color'
                      ? '你的色彩'
                      : result.mode === 'compare'
                        ? '你的风格'
                        : '你的第一张'}
                  <span className="block text-rose-deep">
                    {result.mode === 'fortune'
                      ? '灵镜解读'
                      : result.mode === 'color'
                        ? '季节诊断'
                        : result.mode === 'compare'
                          ? '对比报告'
                          : '灵镜报告'}
                  </span>
                </h2>
                <p className="wtfti-copy mt-5">
                  {result.stub
                    ? '当前没有检测到 APIMart Key，所以展示本地预览结构；配置后会显示真实生成图。'
                    : result.mode === 'fortune'
                      ? '命纹灵镜通过面相学做趣味性格解读，仅供娱乐与自我观察参考。'
                      : result.mode === 'color'
                        ? '色彩诊断基于肤色、发色、瞳孔色等维度判断最适合的色彩季节，仅供审美参考。'
                        : result.mode === 'compare'
                          ? '风格对比展示同一个人在不同风格下的效果，帮你找到最适合的路线。'
                          : '结果链接由 APIMart 返回，建议尽快转存到自己的对象存储或 CDN。'}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {result.imageUrl && (
                    <a
                      href={result.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ink"
                    >
                      打开结果图
                    </a>
                  )}
                  <button type="button" onClick={() => void handleGenerate()} className="btn btn-ghost">
                    再生成一次
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateShareCard}
                    disabled={generatingCard}
                    className="btn btn-gold"
                  >
                    {generatingCard ? '生成中…' : '生成分享卡片'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToCard}
                    disabled={savedToCard}
                    className={`btn ${savedToCard ? 'btn-ghost opacity-50' : 'btn-ink'}`}
                  >
                    {savedToCard ? '✓ 已存入档案' : '存入 WTF Card'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateChallenge}
                    className="btn btn-ink"
                  >
                    发起挑战 ⚡
                  </button>
                </div>
                {expiryLabel && (
                  <p className="mt-4 text-xs text-text-muted">图片链接预计有效至：{expiryLabel}</p>
                )}
              </div>

              <div className="space-y-6">
                {/* Generated image */}
                <div className="overflow-hidden rounded-[28px] border border-border-subtle bg-bg-elevated/70 p-3">
                  {result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt={result.mode === 'fortune'
                        ? 'GPT-Image-2 生成的命纹灵镜报告'
                        : result.mode === 'color'
                          ? 'GPT-Image-2 生成的色彩诊断报告'
                          : result.mode === 'compare'
                            ? 'GPT-Image-2 生成的风格对比报告'
                            : 'GPT-Image-2 生成的个人风格灵镜报告'}
                      className="w-full rounded-[22px] object-cover"
                    />
                  ) : (
                    <PreviewReportCard report={result.report} mode={result.mode} />
                  )}
                </div>

                {/* Analysis highlights text card */}
                {result.report && (
                  <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/60 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="h-px flex-1" style={{ background: 'var(--color-gold-leaf)', opacity: 0.35 }} />
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em]" style={{ color: 'var(--color-gold-leaf)' }}>
                        Analysis Highlights
                      </span>
                      <span className="h-px flex-1" style={{ background: 'var(--color-gold-leaf)', opacity: 0.35 }} />
                    </div>

                    <div className="space-y-4">
                      {result.report.sections.map((section, index) => (
                        <div key={section.title} className="border-t border-border-subtle pt-4">
                          <p className="font-mono text-[0.68rem] text-text-muted">
                            {String(index + 1).padStart(2, '0')}
                          </p>
                          <h4 className="mt-2 text-lg text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                            {section.title}
                          </h4>
                          <p className="mt-2 text-sm leading-7 text-text-secondary">{section.body}</p>
                        </div>
                      ))}
                    </div>

                    {result.report.palette.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-border-subtle">
                        <p className="eyebrow text-[0.58rem] mb-3">色彩关键词</p>
                        <div className="flex flex-wrap gap-2">
                          {result.report.palette.map(color => (
                            <span
                              key={color}
                              className="rounded-full border px-3 py-1 text-xs"
                              style={{
                                borderColor: 'var(--color-gold-leaf)',
                                color: 'var(--color-gold-leaf)',
                                opacity: 0.85,
                              }}
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="mt-6 pt-4 border-t border-border-subtle">
                      <p className="text-xs leading-5 text-text-muted">
                        {result.mode === 'fortune'
                          ? '✦ 命纹灵镜仅供娱乐与自我观察，不构成专业心理诊断或人生决策依据。'
                          : result.mode === 'color'
                            ? '✦ 色彩诊断仅供审美参考，不构成任何身份判断或健康评估。'
                            : result.mode === 'compare'
                              ? '✦ 风格对比仅供审美参考，不做颜值评分或身份判断。'
                              : '✦ 灵镜报告仅作审美建议参考，不做颜值评分、身份识别或命运判断。'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Share card preview & download */}
                {shareCardUrl && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={() => setShareCardUrl(null)}>
                    <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                      <div className="overflow-hidden rounded-[24px] border border-border-subtle shadow-2xl">
                        <img
                          src={shareCardUrl}
                          alt="灵镜分享卡片"
                          className="w-full object-cover"
                        />
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={handleDownloadShareCard}
                          className="btn btn-gold flex-1"
                        >
                          下载卡片
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareCardUrl(null)}
                          className="btn btn-ghost"
                        >
                          关闭
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-text-muted text-center">
                        1080×1920 · 适合小红书 / 朋友圈 / 微博
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading overlay during card generation */}
                {generatingCard && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                    <div className="text-center">
                      <div className="inline-block w-12 h-12 border-2 border-border-subtle border-t-[var(--color-gold-leaf)] rounded-full animate-spin mb-4" />
                      <p className="text-text-secondary text-sm">生成分享卡片中…</p>
                      <p className="text-text-muted text-xs mt-1">约需 2-3 秒</p>
                    </div>
                  </div>
                )}

                {/* Challenge link */}
                {challengeUrl && (
                  <div className="rounded-[22px] border border-border-subtle bg-bg-elevated/60 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="h-px flex-1" style={{ background: 'var(--color-gold-leaf)', opacity: 0.35 }} />
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em]" style={{ color: 'var(--color-gold-leaf)' }}>
                        Challenge Link
                      </span>
                      <span className="h-px flex-1" style={{ background: 'var(--color-gold-leaf)', opacity: 0.35 }} />
                    </div>

                    <p className="text-sm text-text-secondary mb-4">
                      把这个链接发给好友，邀请 TA 一起做灵镜测试：
                    </p>

                    <div className="rounded-[18px] border border-border-subtle bg-bg-elevated/80 p-4 mb-4">
                      <p className="text-xs font-mono text-text-muted break-all">{challengeUrl}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyChallenge}
                      className="btn btn-gold w-full"
                    >
                      {challengeCopied ? '✓ 已复制' : '复制挑战链接'}
                    </button>

                    <p className="mt-3 text-xs text-text-muted text-center">
                      好友打开链接后可以看到你的结果摘要，并被邀请做测试对比
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Roadmap Section
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="wtfti-section-tight">
        <div className="wtfti-container grid gap-px overflow-hidden rounded-[28px] border border-border-subtle bg-border-subtle md:grid-cols-3">
          {[
            ['P0', '变美灵镜', '先验证上传照 → 生成分享图 → 水印传播 → 完整报告付费。'],
            ['P1', '命纹灵镜', '面相与掌纹仅做娱乐向表达，已完成基础版本，可直接使用。'],
            ['P2', '人格融合', '把发型色彩建议写回 WTFTI 主神档案，做长期复购资产。'],
          ].map(([step, title, body]) => (
            <div key={step} className="bg-bg-elevated/88 p-7 sm:p-8">
              <span className="serial-number text-sm">{step}</span>
              <h3 className="mt-6 text-2xl text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                {title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HistoryCard({ record }: { record: MirrorHistoryRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const modeLabel = record.mode === 'beauty' ? '🌹 变美灵镜' :
    record.mode === 'fortune' ? '✦ 命纹灵镜' :
    record.mode === 'color' ? '🎨 色彩诊断' :
    record.mode === 'compare' ? '⚡ 风格对比' : '🔮 灵镜';

  const reportTypeLabel = record.reportType === 'hairstyle' ? ' · 发型专项' :
    record.reportType === 'makeup' ? ' · 妆容专项' :
    record.reportType === 'fashion' ? ' · 服饰配饰' : '';

  const hasReportData = record.reportSections && record.reportSections.length > 0;
  const hasImage = record.imageUrl && !imgFailed;

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
    <div className="rounded-[18px] border border-border-subtle bg-bg-elevated/55 overflow-hidden">
      {/* Image thumbnail */}
      {hasImage && (
        <div className="relative">
          <img
            src={record.imageUrl!}
            alt={`${modeLabel}结果`}
            className="w-full h-40 object-cover"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
          />
          {!imgLoaded && !imgFailed && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/80">
              <div className="w-6 h-6 border-2 border-border-subtle border-t-[var(--color-gold-leaf)] rounded-full animate-spin" />
            </div>
          )}
          {/* Image overlay buttons */}
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.open(record.imageUrl!, '_blank')}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#F5F0E8', backdropFilter: 'blur(4px)' }}
            >
              查看原图
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{ background: 'rgba(201,166,118,0.8)', color: '#1a1530' }}
            >
              下载
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            {modeLabel}{reportTypeLabel}
          </span>
          <span className="text-xs text-text-muted">
            {new Date(record.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-xs text-text-secondary line-clamp-2">{record.summary}</p>
        <div className="flex items-center gap-3 mt-2">
          {hasReportData && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              {expanded ? '收起报告' : '展开报告'}
            </button>
          )}
          {imgFailed && (
            <span className="text-xs text-text-muted">图片已过期</span>
          )}
          <span className="text-xs text-text-muted ml-auto">
            {Math.max(0, Math.ceil((record.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))} 天后过期
          </span>
        </div>

        {/* Expanded report data */}
        {expanded && hasReportData && (
          <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
            {record.reportSections?.map((section, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-text-primary">{section.title}</p>
                <p className="text-xs text-text-secondary">{section.body}</p>
              </div>
            ))}
            {record.reportPalette && record.reportPalette.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {record.reportPalette.map(color => (
                  <span
                    key={color}
                    className="rounded-full border px-2 py-0.5 text-[10px]"
                    style={{ borderColor: 'var(--color-gold-leaf)', color: 'var(--color-gold-leaf)', opacity: 0.7 }}
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
    <div className="rounded-[22px] bg-[var(--galaxy-ink)] p-6 text-[var(--galaxy-cream)] sm:p-8">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--galaxy-gold)]/50" />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[var(--galaxy-gold)]">
          {mode === 'fortune' ? 'Fortune Preview' : mode === 'color' ? 'Color Preview' : mode === 'compare' ? 'Compare Preview' : 'Mirror Preview'}
        </span>
        <span className="h-px flex-1 bg-[var(--galaxy-gold)]/50" />
      </div>
      <h3 className="mt-8 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
        {mode === 'fortune' ? '命纹灵镜' : mode === 'color' ? '色彩诊断' : mode === 'compare' ? '风格对比' : '个人风格灵镜'}
      </h3>
      <div className="mt-6 flex flex-wrap gap-2">
        {palette.map(color => (
          <span
            key={color}
            className="rounded-full border border-[var(--galaxy-gold)]/35 px-3 py-1 text-xs text-[var(--galaxy-mist)]"
          >
            {color}
          </span>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {sections.map((section, index) => (
          <div key={section.title} className="border-t border-[var(--galaxy-gold)]/25 pt-4">
            <p className="font-mono text-[0.68rem] text-[var(--galaxy-gold)]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h4 className="mt-2 text-xl" style={{ fontFamily: 'var(--font-display)' }}>
              {section.title}
            </h4>
            <p className="mt-2 text-sm leading-7 text-[var(--galaxy-mist)]">{section.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-4 border-t border-[var(--galaxy-gold)]/25">
        <p className="text-xs leading-5 text-[var(--galaxy-mist)]/60">
          {mode === 'fortune'
            ? '✦ 命纹灵镜仅供娱乐与自我观察，不构成专业心理诊断。'
            : mode === 'color'
              ? '✦ 色彩诊断仅供审美参考，不构成任何身份判断。'
              : mode === 'compare'
                ? '✦ 风格对比仅供审美参考，不做颜值评分或身份判断。'
                : '✦ 灵镜报告仅作审美建议参考。'}
        </p>
      </div>
    </div>
  );
}
