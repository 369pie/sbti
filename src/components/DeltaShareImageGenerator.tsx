'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';
import type { DeltaPersonality } from '@/lib/delta/personalities';
import type { DimensionScore } from '@/lib/scoring';
import { SHARE_SITE_URL } from '@/lib/site';

export interface DeltaShareImageHandle {
  generate: () => void;
}

interface Props {
  personality: DeltaPersonality;
  imageUrl?: string;
  dimensionScores?: DimensionScore[];
}

const CARD_W = 540;
const CARD_H = 960;
const SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const DARK = '#221d1a';
const MED = '#6d645d';
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

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill: string | CanvasGradient,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  stroke: string, lineWidth = 1,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = [];
  let index = 0;

  while (index < text.length && lines.length < maxLines) {
    let line = '';
    while (index < text.length) {
      const char = text[index];
      if (char === '\n') { index += 1; break; }
      const candidate = line + char;
      if (line && ctx.measureText(candidate).width > maxWidth) break;
      line = candidate;
      index += 1;
    }
    lines.push(line.trimStart());
  }

  if (index < text.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }

  return lines;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    const onLoad = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error(`Image load failed: ${src}`)); };
    const cleanup = () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });

  try { await img.decode(); } catch { /* Best-effort decode */ }
  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const pending = loadImage(src).catch(error => { imageCache.delete(src); throw error; });
  imageCache.set(src, pending);
  return pending;
}

async function createQrImage() {
  const qrDataUrl = await toQrDataUrl(SHARE_SITE_URL, {
    width: 200, margin: 1,
    color: { dark: '#281f1b', light: '#fff7ee' },
    errorCorrectionLevel: 'M',
  });
  return getCachedImage(qrDataUrl);
}

function drawImageContain(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawImageCover(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function renderDeltaShareImage(personality: DeltaPersonality, imageUrl?: string) {
  const [typeImage, qrImage] = await Promise.all([
    imageUrl ? getCachedImage(imageUrl).catch(() => null) : Promise.resolve(null),
    createQrImage().catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = 'top';
  const accent = personality.color;

  if (typeImage) {
    drawImageCover(ctx, typeImage, 0, 0, CARD_W, CARD_H);
  } else {
    const background = ctx.createLinearGradient(0, 0, 0, CARD_H);
    background.addColorStop(0, '#f0f4e8');
    background.addColorStop(1, '#dde4d0');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = hexToRgba(accent, 0.14);
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.textAlign = 'center';
    ctx.font = `160px ${FONT_SANS}`;
    ctx.fillText(personality.emoji, CARD_W / 2, CARD_H * 0.28);
  }

  // Top gradient overlay
  const topGrad = ctx.createLinearGradient(0, 0, 0, CARD_H * 0.40);
  topGrad.addColorStop(0, 'rgba(240, 244, 232, 0.92)');
  topGrad.addColorStop(0.55, 'rgba(240, 244, 232, 0.72)');
  topGrad.addColorStop(1, 'rgba(240, 244, 232, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, CARD_W, CARD_H * 0.40);

  // Bottom gradient overlay
  const bottomGrad = ctx.createLinearGradient(0, CARD_H * 0.58, 0, CARD_H);
  bottomGrad.addColorStop(0, 'rgba(20, 24, 16, 0)');
  bottomGrad.addColorStop(0.35, 'rgba(20, 24, 16, 0.40)');
  bottomGrad.addColorStop(1, 'rgba(20, 24, 16, 0.75)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, CARD_H * 0.58, CARD_W, CARD_H * 0.42);

  // Badge
  const badgeText = `三角TI · 战区宇宙 · ${personality.number}`;
  ctx.font = `700 11px ${FONT_MONO}`;
  const badgeWidth = ctx.measureText(badgeText).width + 24;
  fillRoundedRect(ctx, 28, 28, badgeWidth, 24, 12, hexToRgba(accent, 0.18));
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, 28 + badgeWidth / 2, 34);

  // Title
  ctx.textAlign = 'left';
  ctx.fillStyle = DARK;
  ctx.font = `900 38px ${FONT_SANS}`;
  const titleLines = wrapText(ctx, personality.heroName, CARD_W - 64, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 32, 68 + index * 44);
  });

  // Code + operator ref
  const codeY = 68 + titleLines.length * 44 + 8;
  ctx.fillStyle = accent;
  ctx.font = `700 18px ${FONT_MONO}`;
  ctx.fillText(personality.code, 32, codeY);

  const refX = 32 + ctx.measureText(personality.code).width + 10;
  ctx.fillStyle = MED;
  ctx.font = `600 11px ${FONT_MONO}`;
  const refLabel = personality.operatorRef.startsWith('行为模式')
    ? ''
    : `(${personality.operatorRef})`;
  if (refLabel) {
    const refLines = wrapText(ctx, refLabel, CARD_W - refX - 32, 2);
    refLines.forEach((line, index) => {
      ctx.fillText(line, refX, codeY + 5 + index * 14);
    });
  }

  // Tagline
  const taglineY = codeY + 36;
  ctx.fillStyle = hexToRgba(DARK, 0.88);
  ctx.font = `600 15px ${FONT_SANS}`;
  const taglineLines = wrapText(ctx, `你总是…${personality.tagline}`, CARD_W - 64, 2);
  taglineLines.forEach((line, index) => {
    ctx.fillText(line, 32, taglineY + index * 22);
  });

  // Bottom: 3 symptom cards
  const cardsY = CARD_H - 206;
  const cardGap = 10;
  const cardW = (CARD_W - 64 - cardGap * 2) / 3;
  const cardH = 82;
  const symptomCards = personality.copy.symptoms.slice(0, 3);

  symptomCards.forEach((symptom, index) => {
    const cardX = 32 + index * (cardW + cardGap);
    fillRoundedRect(ctx, cardX, cardsY, cardW, cardH, 14, 'rgba(255, 255, 255, 0.16)');
    strokeRoundedRect(ctx, cardX, cardsY, cardW, cardH, 14, 'rgba(255, 255, 255, 0.28)', 1);

    ctx.textAlign = 'center';
    ctx.fillStyle = hexToRgba(accent, 0.96);
    ctx.font = `700 10px ${FONT_MONO}`;
    ctx.fillText(`SYMPTOM 0${index + 1}`, cardX + cardW / 2, cardsY + 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = `600 11px ${FONT_SANS}`;
    const symptomLines = wrapText(ctx, symptom, cardW - 14, 3);
    symptomLines.forEach((line, lineIndex) => {
      ctx.fillText(line, cardX + cardW / 2, cardsY + 26 + lineIndex * 15);
    });
  });

  // Quote bar
  const quoteY = cardsY + cardH + 14;
  fillRoundedRect(ctx, 24, quoteY, CARD_W - 48, 54, 14, hexToRgba(accent, 0.88));
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  const quoteLines = wrapText(ctx, personality.quote, CARD_W - 96, 2);
  const quoteOffset = quoteLines.length === 1 ? 17 : 9;
  quoteLines.forEach((line, index) => {
    ctx.fillText(line, CARD_W / 2, quoteY + quoteOffset + index * 20);
  });

  // Footer
  const footerY = CARD_H - 46;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `600 12px ${FONT_SANS}`;
  ctx.fillText('测测你的三角TI →', 32, footerY);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
  ctx.font = `10px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 32, footerY + 18);

  if (qrImage) {
    fillRoundedRect(ctx, CARD_W - 74, footerY - 6, 46, 46, 8, 'rgba(255, 255, 255, 0.92)');
    drawImageContain(ctx, qrImage, CARD_W - 71, footerY - 3, 40, 40);
  }

  return canvas.toDataURL('image/png');
}

export const DeltaShareImageGenerator = forwardRef<DeltaShareImageHandle, Props>(
  function DeltaShareImageGenerator({ personality, imageUrl }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({ resourceId: 'delta:share', universe: 'delta' });

    const prepareAssets = useCallback(async () => {
      await Promise.all([
        imageUrl ? getCachedImage(imageUrl).catch(() => null) : Promise.resolve(null),
        createQrImage().catch(() => null),
      ]);
    }, [imageUrl]);

    useEffect(() => {
      void prepareAssets();
    }, [prepareAssets]);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);

      try {
        const dataUrl = await renderDeltaShareImage(personality, imageUrl);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#FFF9F2', 'DELTA');
        setPreviewUrl(finalUrl);
      } catch (error) {
        console.error('Failed to generate Delta share image:', error);
      } finally {
        setGenerating(false);
      }
    }, [generating, imageUrl, personality, tierCtl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `DeltaTI-${personality.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;

      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `DeltaTI-${personality.code}.png` });
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
      link.download = `DeltaTI-${personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;

      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `三角TI · 我在三角洲居然是${personality.heroName}？？` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.heroName, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
        <ShareTierPicker
          tier={tierCtl.tier}
          setTier={tierCtl.setTier}
          tierUnlocked={tierCtl.tierUnlocked}
          variant="light"
          className="mb-3"
        />
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              生成中…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              生成三角TI图鉴卡
            </>
          )}
        </button>

        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center"
            onClick={() => setPreviewUrl(null)}
          >
            <div
              className="relative w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-200"
              onClick={event => event.stopPropagation()}
            >
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-3 right-3 rounded-full bg-black/55 p-2 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 z-10"
                aria-label="关闭"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={`三角TI ${personality.number} · ${personality.heroName}`} className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-accent mb-3 px-4 leading-5">
                  {saveHint}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl border border-white/30 text-sm text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
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

              <p className="text-center text-xs text-white/60 mt-4">
                点击空白处关闭
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);
