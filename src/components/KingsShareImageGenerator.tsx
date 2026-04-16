'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import type { KingsPersonality } from '@/lib/kings/personalities';
import { getKingsTypeMediumImage, getKingsTypeCardImage } from '@/lib/kings/personalities';
import { SHARE_SITE_URL } from '@/lib/site';

export interface KingsShareImageHandle {
  generate: () => void;
}

interface Props {
  personality: KingsPersonality;
  imageUrl?: string;
  dimensionScores?: unknown[]; // accepted but unused — kept for prop compatibility
}

const CARD_WIDTH = 540;
const MAX_H = 4000;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const KINGS_SHARE_URL = SHARE_SITE_URL + 'wtfti/kings/';

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function hexToRgba(hex: string, alpha: number) {
  const n = hex.replace('#', '');
  const v = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const r = Number.parseInt(v.slice(0, 2), 16);
  const g = Number.parseInt(v.slice(2, 4), 16);
  const b = Number.parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, stroke: string, lw = 1) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines?: number) {
  const lines: string[] = [];
  let idx = 0;
  while (idx < text.length && (!maxLines || lines.length < maxLines)) {
    let line = '';
    while (idx < text.length) {
      const char = text[idx];
      if (char === '\n') { idx++; break; }
      const candidate = line + char;
      if (line && ctx.measureText(candidate).width > maxWidth) break;
      line = candidate;
      idx++;
    }
    if (line) lines.push(line.trimStart());
  }
  if (maxLines && idx < text.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    const onLoad = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error(`Load failed: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onError); };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* ok */ }
  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = loadImage(src).catch(e => { imageCache.delete(src); throw e; });
  imageCache.set(src, p);
  return p;
}

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, color: string) {
  const cx = CARD_WIDTH / 2;
  const grad = ctx.createLinearGradient(cx - 90, 0, cx + 90, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.3, color);
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - 90, y);
  ctx.lineTo(cx + 90, y);
  ctx.stroke();
}

async function renderKingsShareImage(personality: KingsPersonality, imageUrl?: string) {
  // Try new card image first, fall back to medium, then to prop
  const cardImageUrl = getKingsTypeCardImage(personality.slug);
  const mediumUrl = getKingsTypeMediumImage(personality.slug);
  const [cardImage, qrImage] = await Promise.all([
    getCachedImage(cardImageUrl)
      .catch(() => getCachedImage(mediumUrl))
      .catch(() => imageUrl ? getCachedImage(imageUrl) : null)
      .catch(() => null),
    toQrDataUrl(KINGS_SHARE_URL, {
      width: 200, margin: 1,
      color: { dark: '#1a1510', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(url => getCachedImage(url)).catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = MAX_H * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  const BG = '#FFF8F0';
  const DARK = '#1a1510';
  const MED = '#6d5f52';
  const LIGHT = '#a89888';
  const accent = personality.color;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  // Subtle radial wash
  const wash = ctx.createRadialGradient(270, 300, 0, 270, 300, 320);
  wash.addColorStop(0, hexToRgba(accent, 0.08));
  wash.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 600);

  let y = 40;

  // ── Header ──
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = `700 12px ${FONT_MONO}`;
  ctx.fillText('王者TI · 峡谷人格图鉴', CARD_WIDTH / 2, y);
  y += 24;

  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('我在峡谷居然是这种人？', CARD_WIDTH / 2, y);
  y += 28;

  // ── Card Image ──
  const imgW = CARD_WIDTH - 60;
  const imgH = Math.round(imgW * 4 / 3); // 3:4 aspect
  const imgX = 30;

  if (cardImage) {
    // Rounded clip for card image
    ctx.save();
    roundRectPath(ctx, imgX, y, imgW, imgH, 20);
    ctx.clip();
    drawImageCover(ctx, cardImage, imgX, y, imgW, imgH);
    ctx.restore();
    // Border
    strokeRoundedRect(ctx, imgX, y, imgW, imgH, 20, hexToRgba(accent, 0.25), 2);
  } else {
    // Fallback: emoji placeholder
    fillRoundedRect(ctx, imgX, y, imgW, imgH, 20, hexToRgba(accent, 0.08));
    strokeRoundedRect(ctx, imgX, y, imgW, imgH, 20, hexToRgba(accent, 0.2));
    ctx.fillStyle = DARK;
    ctx.font = `100px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(personality.emoji, CARD_WIDTH / 2, y + imgH / 2 - 50);
    ctx.textAlign = 'left';
  }
  y += imgH + 20;

  // ── Name + Code ──
  ctx.textAlign = 'center';
  ctx.fillStyle = DARK;
  ctx.font = `900 36px ${FONT_SANS}`;
  ctx.fillText(personality.heroName, CARD_WIDTH / 2, y);
  y += 44;

  ctx.fillStyle = accent;
  ctx.font = `700 16px ${FONT_MONO}`;
  const codeText = `${personality.code}  (${personality.heroRef})`;
  ctx.fillText(codeText, CARD_WIDTH / 2, y);
  y += 28;

  // Tagline pill
  const tagText = `你总是……${personality.tagline}`;
  ctx.font = `600 14px ${FONT_SANS}`;
  const tagW = ctx.measureText(tagText).width + 32;
  const tagX = (CARD_WIDTH - tagW) / 2;
  fillRoundedRect(ctx, tagX, y, tagW, 30, 15, hexToRgba(accent, 0.1));
  strokeRoundedRect(ctx, tagX, y, tagW, 30, 15, hexToRgba(accent, 0.25));
  ctx.fillStyle = accent;
  ctx.fillText(tagText, CARD_WIDTH / 2, y + 7);
  y += 44;

  // ── Description divider ──
  drawDivider(ctx, y, hexToRgba(accent, 0.3));
  y += 16;
  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('CANYON TRANSLATION', CARD_WIDTH / 2, y);
  y += 20;

  // ── Description text (wtfHit) ──
  ctx.textAlign = 'left';
  ctx.fillStyle = DARK;
  ctx.font = `14px ${FONT_SANS}`;
  const descLines = wrapText(ctx, personality.copy.wtfHit, CARD_WIDTH - 80, 6);
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], 40, y);
    y += 22;
  }
  y += 12;

  // ── Symptom tags ──
  drawDivider(ctx, y, hexToRgba(accent, 0.3));
  y += 16;
  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('峡谷症状', CARD_WIDTH / 2, y);
  y += 22;

  const symptoms = personality.copy.symptoms.slice(0, 3);
  const tagGap = 8;
  ctx.font = `600 12px ${FONT_SANS}`;
  // Calculate widths
  const tagWidths = symptoms.map(s => ctx.measureText(s).width + 24);
  const totalTagW = tagWidths.reduce((a, b) => a + b, 0) + tagGap * (symptoms.length - 1);
  let tagStartX = (CARD_WIDTH - totalTagW) / 2;

  symptoms.forEach((symptom, i) => {
    const tw = tagWidths[i];
    fillRoundedRect(ctx, tagStartX, y, tw, 28, 14, hexToRgba(accent, 0.1));
    strokeRoundedRect(ctx, tagStartX, y, tw, 28, 14, hexToRgba(accent, 0.25));
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.fillText(symptom, tagStartX + tw / 2, y + 7);
    tagStartX += tw + tagGap;
  });
  ctx.textAlign = 'left';
  y += 44;

  // ── Quote ──
  const quoteText = personality.quote;
  ctx.font = `600 14px ${FONT_SANS}`;
  const quoteLines = wrapText(ctx, quoteText, CARD_WIDTH - 80, 3);
  const quoteH = Math.max(50, quoteLines.length * 22 + 20);
  fillRoundedRect(ctx, 36, y, CARD_WIDTH - 72, quoteH, 14, hexToRgba(accent, 0.85));
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  quoteLines.forEach((line, i) => {
    ctx.fillText(line, CARD_WIDTH / 2, y + 10 + i * 22);
  });
  ctx.textAlign = 'left';
  y += quoteH + 20;

  // ── Closing divider ──
  drawDivider(ctx, y, hexToRgba(accent, 0.2));
  y += 28;

  // ── Footer ──
  const CARD_HEIGHT = y + 80;
  const footerY = CARD_HEIGHT - 80;

  ctx.strokeStyle = hexToRgba(accent, 0.15);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(CARD_WIDTH - 36, footerY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.fillText('测测你的王者TI →', 36, footerY + 12);
  ctx.fillStyle = accent;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(KINGS_SHARE_URL, 36, footerY + 34);

  fillRoundedRect(ctx, CARD_WIDTH - 96, footerY + 4, 60, 60, 10, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_WIDTH - 92, footerY + 8, 52, 52);
  } else {
    fillRoundedRect(ctx, CARD_WIDTH - 92, footerY + 12, 44, 44, 6, hexToRgba(accent, 0.1));
  }

  // ── Crop & decorative border ──
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = CARD_WIDTH * CARD_SCALE;
  croppedCanvas.height = CARD_HEIGHT * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas context unavailable');
  cctx.drawImage(canvas, 0, 0);
  cctx.scale(CARD_SCALE, CARD_SCALE);

  // Decorative outer border
  strokeRoundedRect(cctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 20, hexToRgba(accent, 0.2), 2);
  strokeRoundedRect(cctx, 20, 20, CARD_WIDTH - 40, CARD_HEIGHT - 40, 16, hexToRgba(accent, 0.06), 1);

  // Corner accents
  cctx.fillStyle = hexToRgba(accent, 0.3);
  cctx.font = `12px ${FONT_SANS}`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'top';
  cctx.fillText('⚔', 34, 26);
  cctx.fillText('⚔', CARD_WIDTH - 34, 26);
  cctx.fillText('⚔', 34, CARD_HEIGHT - 40);
  cctx.fillText('⚔', CARD_WIDTH - 34, CARD_HEIGHT - 40);

  return croppedCanvas.toDataURL('image/png');
}

export const KingsShareImageGenerator = forwardRef<KingsShareImageHandle, Props>(
  function KingsShareImageGenerator({ personality, imageUrl }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderKingsShareImage(personality, imageUrl);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate Kings share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [generating, imageUrl, personality]);

    const handleQuickDownload = useCallback(async () => {
      if (!previewUrl) {
        await handleGenerate();
        return;
      }
      const link = document.createElement('a');
      link.download = `王者TI-${personality.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [handleGenerate, personality.code, previewUrl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `王者TI-${personality.code}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `王者TI-${personality.code}.png` });
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
      link.download = `王者TI-${personality.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `王者TI · 我在峡谷居然是${personality.heroName}？？` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.heroName, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div className="space-y-2.5">
        <button
          onClick={handleQuickDownload}
          disabled={generating}
          className="w-full py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              生成中…
            </>
          ) : previewUrl ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              直接下载
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              生成王者TI图鉴卡
            </>
          )}
        </button>

        {previewUrl && (
          <button
            onClick={() => setPreviewUrl(null)}
            className="w-full py-3 rounded-xl border border-accent/20 bg-accent/5 text-sm text-accent/70 hover:bg-accent/10 transition-all cursor-pointer"
          >
            隐藏预览
          </button>
        )}

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
                <img src={previewUrl} alt={`王者TI ${personality.number} · ${personality.heroName}`} className="w-full" />
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
                  下载图片
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
