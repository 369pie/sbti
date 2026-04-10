'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import QRCode from 'qrcode';
import { getTypeImage } from '@/lib/personalities';
import { MODEL_COLORS } from '@/lib/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { CPResult } from '@/lib/cp-matching';
import { getTierColor, getTierEmoji } from '@/lib/cp-matching';

export interface CPShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  cpResult: CPResult;
}

const CARD_WIDTH = 540;
const CARD_HEIGHT = 1020;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';
const imageCache = new Map<string, Promise<HTMLImageElement>>();

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
  radius: number, fillStyle: string | CanvasGradient,
) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number, height: number,
  radius: number, strokeStyle: string, lineWidth = 1,
) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, width: number, height: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(width / sw, height / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    const handleLoad = () => { cleanup(); resolve(); };
    const handleError = () => { cleanup(); reject(new Error(`Image load failed: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', handleLoad); img.removeEventListener('error', handleError); };
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* best-effort */ }
  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const promise = loadImage(src).catch(error => { imageCache.delete(src); throw error; });
  imageCache.set(src, promise);
  return promise;
}

async function createQrImage() {
  const qrDataUrl = await QRCode.toDataURL(SHARE_SITE_URL, {
    width: 200, margin: 1,
    color: { dark: '#000000', light: '#ffffffff' },
    errorCorrectionLevel: 'M',
  });
  return getCachedImage(qrDataUrl);
}

async function renderCPShareImage(result: CPResult) {
  const { typeA, typeB, overall, tier, modelScores, summary } = result;
  const tierColor = getTierColor(tier);
  const tierEmoji = getTierEmoji(tier);

  const [imgA, imgB, qrImage] = await Promise.all([
    getCachedImage(getTypeImage(typeA.slug)).catch(() => null),
    getCachedImage(getTypeImage(typeB.slug)).catch(() => null),
    createQrImage().catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // Background
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Grid
  ctx.strokeStyle = hexToRgba('#292524', 0.38);
  ctx.lineWidth = 1;
  for (let p = 0; p <= CARD_WIDTH; p += 30) { ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, CARD_HEIGHT); ctx.stroke(); }
  for (let p = 0; p <= CARD_HEIGHT; p += 30) { ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(CARD_WIDTH, p); ctx.stroke(); }

  // Dual glow
  const glowA = ctx.createRadialGradient(160, 200, 0, 160, 200, 250);
  glowA.addColorStop(0, hexToRgba(typeA.color, 0.16));
  glowA.addColorStop(1, 'rgba(12,10,9,0)');
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, CARD_WIDTH, 400);

  const glowB = ctx.createRadialGradient(380, 200, 0, 380, 200, 250);
  glowB.addColorStop(0, hexToRgba(typeB.color, 0.16));
  glowB.addColorStop(1, 'rgba(12,10,9,0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, CARD_WIDTH, 400);

  // Header
  ctx.fillStyle = '#78716c';
  ctx.font = `13px ${FONT_MONO}`;
  ctx.fillText('SBTI CP 配对报告 //', 36, 32);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#a8a29e';
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, CARD_WIDTH - 36, 32);
  ctx.textAlign = 'left';

  // Title
  ctx.fillStyle = '#a8a29e';
  ctx.font = `15px ${FONT_SANS}`;
  ctx.fillText('我们的 CP 配对结果', 36, 70);

  // Two personality avatars side by side
  const avatarY = 100;
  const avatarSize = 160;
  const gap = 40;
  const leftX = CARD_WIDTH / 2 - avatarSize - gap / 2;
  const rightX = CARD_WIDTH / 2 + gap / 2;

  // Type A avatar
  fillRoundedRect(ctx, leftX, avatarY, avatarSize, avatarSize, 20, hexToRgba(typeA.color, 0.15));
  strokeRoundedRect(ctx, leftX, avatarY, avatarSize, avatarSize, 20, hexToRgba(typeA.color, 0.3));
  if (imgA) {
    ctx.save();
    roundRectPath(ctx, leftX + 4, avatarY + 4, avatarSize - 8, avatarSize - 8, 16);
    ctx.clip();
    drawImageContain(ctx, imgA, leftX + 4, avatarY + 4, avatarSize - 8, avatarSize - 8);
    ctx.restore();
  } else {
    ctx.fillStyle = '#fafaf9';
    ctx.font = `48px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(typeA.emoji, leftX + avatarSize / 2, avatarY + 18);
    ctx.textAlign = 'left';
  }

  // Type B avatar
  fillRoundedRect(ctx, rightX, avatarY, avatarSize, avatarSize, 20, hexToRgba(typeB.color, 0.15));
  strokeRoundedRect(ctx, rightX, avatarY, avatarSize, avatarSize, 20, hexToRgba(typeB.color, 0.3));
  if (imgB) {
    ctx.save();
    roundRectPath(ctx, rightX + 4, avatarY + 4, avatarSize - 8, avatarSize - 8, 16);
    ctx.clip();
    drawImageContain(ctx, imgB, rightX + 4, avatarY + 4, avatarSize - 8, avatarSize - 8);
    ctx.restore();
  } else {
    ctx.fillStyle = '#fafaf9';
    ctx.font = `48px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(typeB.emoji, rightX + avatarSize / 2, avatarY + 18);
    ctx.textAlign = 'left';
  }

  // Heart/VS between avatars
  ctx.fillStyle = tierColor;
  ctx.font = `28px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('💕', CARD_WIDTH / 2, avatarY + 62);
  ctx.textAlign = 'left';

  // Labels under avatars
  const labelY = avatarY + avatarSize + 10;
  ctx.textAlign = 'center';
  ctx.fillStyle = typeA.color;
  ctx.font = `600 15px ${FONT_MONO}`;
  ctx.fillText(typeA.code, leftX + avatarSize / 2, labelY);
  ctx.fillStyle = '#fafaf9';
  ctx.font = `600 18px ${FONT_SANS}`;
  ctx.fillText(typeA.name, leftX + avatarSize / 2, labelY + 22);

  ctx.fillStyle = typeB.color;
  ctx.font = `600 15px ${FONT_MONO}`;
  ctx.fillText(typeB.code, rightX + avatarSize / 2, labelY);
  ctx.fillStyle = '#fafaf9';
  ctx.font = `600 18px ${FONT_SANS}`;
  ctx.fillText(typeB.name, rightX + avatarSize / 2, labelY + 22);
  ctx.textAlign = 'left';

  // Big score circle
  const scoreY = 360;
  const scoreCenterX = CARD_WIDTH / 2;
  const scoreRadius = 52;

  // Background circle
  ctx.beginPath();
  ctx.arc(scoreCenterX, scoreY + scoreRadius, scoreRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Progress arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (overall / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(scoreCenterX, scoreY + scoreRadius, scoreRadius, startAngle, endAngle);
  ctx.strokeStyle = tierColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Score text
  ctx.textAlign = 'center';
  ctx.fillStyle = tierColor;
  ctx.font = `700 36px ${FONT_MONO}`;
  ctx.fillText(`${overall}%`, scoreCenterX, scoreY + scoreRadius - 20);
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.fillText(`${tierEmoji} ${tier}`, scoreCenterX, scoreY + scoreRadius + 22);
  ctx.textAlign = 'left';

  // Summary text box
  const summaryY = 490;
  const summaryWidth = CARD_WIDTH - 72;
  fillRoundedRect(ctx, 36, summaryY, summaryWidth, 120, 16, 'rgba(255,255,255,0.04)');
  strokeRoundedRect(ctx, 36, summaryY, summaryWidth, 120, 16, 'rgba(255,255,255,0.07)');

  ctx.fillStyle = '#78716c';
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText('配对速写', 56, summaryY + 16);

  ctx.fillStyle = '#d6d3d1';
  ctx.font = `13px ${FONT_SANS}`;
  // Simple text wrap for summary
  const maxWidth = summaryWidth - 40;
  const lines: string[] = [];
  let remaining = summary;
  let safety = 0;
  while (remaining.length > 0 && lines.length < 4 && safety < 100) {
    safety++;
    let line = '';
    let i = 0;
    while (i < remaining.length) {
      const candidate = line + remaining[i];
      if (line && ctx.measureText(candidate).width > maxWidth) break;
      line = candidate;
      i++;
    }
    if (i < remaining.length && lines.length === 3) {
      while (line && ctx.measureText(line + '…').width > maxWidth) line = line.slice(0, -1);
      line += '…';
    }
    lines.push(line);
    remaining = remaining.slice(i);
  }
  lines.forEach((line, idx) => {
    ctx.fillText(line, 56, summaryY + 40 + idx * 20);
  });

  // Model compatibility bars
  const barStartY = 630;
  ctx.fillStyle = '#78716c';
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('五大模型契合度', 36, barStartY);

  modelScores.forEach((ms, index) => {
    const colors = MODEL_COLORS[ms.model];
    const rowY = barStartY + 30 + index * 34;
    const barX = 130;
    const barWidth = 326;
    const progressWidth = Math.max(20, (ms.score / 100) * barWidth);

    ctx.fillStyle = '#a8a29e';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(ms.name, 36, rowY);

    fillRoundedRect(ctx, barX, rowY + 7, barWidth, 8, 999, 'rgba(255,255,255,0.08)');
    fillRoundedRect(ctx, barX, rowY + 7, progressWidth, 8, 999, colors.base);

    ctx.fillStyle = colors.base;
    ctx.font = `600 14px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${ms.score}`, 492, rowY - 1);
    ctx.textAlign = 'left';
  });

  // Dimension highlights
  const highlightY = 818;
  const best = result.comparisons.filter(c => c.compatibility === 100).slice(0, 3);
  const worst = result.comparisons.filter(c => c.compatibility <= 30).slice(0, 3);

  ctx.fillStyle = '#78716c';
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('高度契合', 36, highlightY);

  if (best.length > 0) {
    ctx.fillStyle = '#22c55e';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(best.map(c => c.dimensionName).join('  ·  '), 110, highlightY);
  } else {
    ctx.fillStyle = '#a8a29e';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText('—', 110, highlightY);
  }

  ctx.fillStyle = '#78716c';
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('差异地带', 36, highlightY + 26);

  if (worst.length > 0) {
    ctx.fillStyle = '#ef4444';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(worst.map(c => c.dimensionName).join('  ·  '), 110, highlightY + 26);
  } else {
    ctx.fillStyle = '#a8a29e';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText('—', 110, highlightY + 26);
  }

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, 890);
  ctx.lineTo(CARD_WIDTH - 36, 890);
  ctx.stroke();

  // Footer
  const footerY = 910;

  ctx.fillStyle = '#fafaf9';
  ctx.font = `600 18px ${FONT_SANS}`;
  ctx.fillText(`${typeA.code} × ${typeB.code}`, 36, footerY);

  ctx.fillStyle = tierColor;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.fillText(`契合度 ${overall}%`, 36, footerY + 28);

  ctx.fillStyle = '#78716c';
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('来测测你和好友的 CP 值', 36, footerY + 56);

  ctx.fillStyle = '#f59e0b';
  ctx.font = `12px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 36, footerY + 82);

  // QR
  const qrSize = 80;
  const qrX = CARD_WIDTH - 36 - qrSize;
  const qrY = footerY + 10;
  fillRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 12, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, qrX + 4, qrY + 4, qrSize - 8, qrSize - 8);
  }

  return canvas.toDataURL('image/png');
}

export const CPShareImageGenerator = forwardRef<CPShareImageGeneratorHandle, Props>(
  function CPShareImageGenerator({ cpResult }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const prepareAssets = useCallback(async () => {
      await Promise.all([
        getCachedImage(getTypeImage(cpResult.typeA.slug)).catch(() => null),
        getCachedImage(getTypeImage(cpResult.typeB.slug)).catch(() => null),
        createQrImage().catch(() => null),
      ]);
    }, [cpResult.typeA.slug, cpResult.typeB.slug]);

    useEffect(() => { void prepareAssets(); }, [prepareAssets]);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderCPShareImage(cpResult);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate CP share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [cpResult, generating]);

    const fileName = `SBTI-CP-${cpResult.typeA.code}x${cpResult.typeB.code}.png`;

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], fileName, { type: 'image/png' });
    }, [fileName, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: fileName });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
        setSaveHint(
          isWeChatBrowser()
            ? '微信内置浏览器不支持直接弹出保存面板，请长按上方图片保存，或右上角用系统浏览器打开后再保存。'
            : '当前浏览器不能直接弹出保存面板，请长按上方图片保存到相册。',
        );
        return;
      }
      const link = document.createElement('a');
      link.download = fileName;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, fileName, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `${cpResult.typeA.code} × ${cpResult.typeB.code} CP配对` });
        } else {
          await handleDownload();
        }
      } catch { await handleDownload(); }
    }, [createPreviewFile, cpResult.typeA.code, cpResult.typeB.code, handleDownload, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-xl bg-accent text-bg-primary font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              生成中…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              生成 CP 分享图片
            </>
          )}
        </button>

        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          >
            <div
              className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="CP 分享图片" className="w-full" />
              </div>

              <p className="text-center text-xs text-text-muted mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-accent mb-3 px-4 leading-5">
                  {saveHint}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  保存图片
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </button>
              </div>

              <p className="text-center text-xs text-text-muted mt-4">
                点击空白处关闭
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);
