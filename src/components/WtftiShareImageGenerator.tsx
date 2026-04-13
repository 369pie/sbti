'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import type { WtftiPersonality } from '@/lib/wtfti-personalities';
import type { DimensionScore } from '@/lib/scoring';
import { SHARE_SITE_URL } from '@/lib/site';

export interface WtftiShareImageHandle {
  generate: () => void;
}

interface Props {
  personality: WtftiPersonality;
  /** 人格图鉴图 URL */
  imageUrl?: string;
  dimensionScores?: DimensionScore[];
}

// ─── 设计 Token（与原版 ShareImageGenerator 一致）───
const CARD_W = 540;
const MAX_H = 4000;          // oversized canvas, will be cropped
const SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

// 暖色系（与现有站点一致）
const BG = '#FFF9F2';
const DARK = '#2D2A26';
const MED = '#6B6560';
const DIV = '#e8e0d6';

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
    ? normalized.split('').map(c => c + c).join('')
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
  x: number, y: number, w: number, h: number,
  r: number, fill: string | CanvasGradient,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, stroke: string, lineWidth = 1,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

/** Wrap text within maxWidth, respecting newlines */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph.trim()) { lines.push(''); continue; }
    let current = '';
    for (const char of paragraph) {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

/** Draw a centered decorative divider */
function drawDivider(ctx: CanvasRenderingContext2D, y: number, color: string) {
  const cx = CARD_W / 2;
  ctx.lineWidth = 0.8;
  const grad = ctx.createLinearGradient(cx - 90, 0, cx + 90, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.3, color);
  grad.addColorStop(0.5, color);
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - 90, y);
  ctx.lineTo(cx + 90, y);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = `8px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('·', cx, y - 4);
  ctx.textAlign = 'left';
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    const onLoad = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error(`Image load failed: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onErr); };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onErr);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* best-effort */ }
  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = loadImage(src).catch(e => { imageCache.delete(src); throw e; });
  imageCache.set(src, p);
  return p;
}

async function createQrImage() {
  const qrDataUrl = await toQrDataUrl(SHARE_SITE_URL, {
    width: 200,
    margin: 1,
    color: { dark: '#2d2236', light: '#FFF9F2' },
    errorCorrectionLevel: 'M',
  });
  return getCachedImage(qrDataUrl);
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const s = Math.min(w / sw, h / sh);
  const dw = sw * s;
  const dh = sh * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

// ─── 渲染主函数 ───
async function renderWtftiShareImage(p: WtftiPersonality, imgUrl?: string) {
  const [typeImage, qrImage] = await Promise.all([
    imgUrl ? getCachedImage(imgUrl).catch(() => null) : Promise.resolve(null),
    createQrImage().catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W * SCALE;
  canvas.height = MAX_H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = 'top';

  const accent = p.color;
  const LIGHT = '#A8A29E';

  // ========== 1. Cream 背景 ==========
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_W, MAX_H);

  // 微弱色彩晕染
  const wash = ctx.createRadialGradient(270, 280, 0, 270, 280, 300);
  wash.addColorStop(0, hexToRgba(accent, 0.08));
  wash.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_W, 560);

  // ========== y tracks the current vertical position ==========
  let y = 46;

  // ── Header ──
  ctx.fillStyle = accent;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(`WTFTI · WTF ${p.number}`, CARD_W / 2, y);
  y += 22;

  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('在WTFTI人格图鉴中，我被鉴定为', CARD_W / 2, y);
  y += 24;
  ctx.textAlign = 'left';

  // ============ 人格图鉴图 ============
  const imgX = 60;
  const imgW = CARD_W - 120;
  const imgH = 400;

  fillRoundedRect(ctx, imgX, y, imgW, imgH, 24, '#ffffff');
  strokeRoundedRect(ctx, imgX, y, imgW, imgH, 24, hexToRgba(accent, 0.25));

  if (typeImage) {
    ctx.save();
    roundRectPath(ctx, imgX + 4, y + 4, imgW - 8, imgH - 8, 20);
    ctx.clip();
    drawImageContain(ctx, typeImage, imgX + 12, y + 12, imgW - 24, imgH - 24);
    ctx.restore();
  } else {
    ctx.fillStyle = DARK;
    ctx.font = `120px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(p.emoji, CARD_W / 2, y + 110);
    ctx.textAlign = 'left';
  }
  y += imgH + 16;

  // ── Code ──
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = `600 18px ${FONT_MONO}`;
  ctx.fillText(p.code, CARD_W / 2, y);
  y += 28;

  // Name
  ctx.fillStyle = DARK;
  ctx.font = `700 48px ${FONT_SANS}`;
  ctx.fillText(p.wtftiName, CARD_W / 2, y);
  y += 56;

  // ============ ★ QUOTE CARD (wtfHit — the punchy social sharing line) ============
  ctx.textAlign = 'left';
  const quoteText = `"${p.copy.wtfHit}"`;
  ctx.font = `600 17px ${FONT_SANS}`;
  const quoteW = CARD_W - 72;
  const quoteLines = wrapText(ctx, quoteText, quoteW - 32);
  const quoteH = Math.max(52, quoteLines.length * 26 + 20);
  fillRoundedRect(ctx, 36, y, quoteW, quoteH, 16, hexToRgba(accent, 0.04));
  strokeRoundedRect(ctx, 36, y, quoteW, quoteH, 16, hexToRgba(accent, 0.10));
  ctx.fillStyle = accent;
  ctx.font = `600 17px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  quoteLines.forEach((line, i) => {
    ctx.fillText(line, CARD_W / 2, y + 12 + i * 26);
  });
  ctx.textAlign = 'left';
  y += quoteH + 20;

  // ============ ★ CLOSER (warm reflection) ============
  drawDivider(ctx, y, hexToRgba(accent, 0.3));
  y += 16;

  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('ABOUT YOU', CARD_W / 2, y);
  y += 20;
  ctx.textAlign = 'left';

  ctx.fillStyle = DARK;
  ctx.font = `13.5px ${FONT_SANS}`;
  const closerLines = wrapText(ctx, p.copy.closer, CARD_W - 80);
  const maxCloserLines = Math.min(closerLines.length, 8);
  for (let i = 0; i < maxCloserLines; i++) {
    ctx.fillText(closerLines[i], 40, y);
    y += 21;
  }
  y += 10;

  // ============ ★ SYMPTOMS (compact list replacing dimension bars) ============
  drawDivider(ctx, y, hexToRgba(accent, 0.3));
  y += 16;

  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('隐藏症状', CARD_W / 2, y);
  y += 20;
  ctx.textAlign = 'left';

  const symptoms = p.copy.symptoms.slice(0, 4);
  ctx.font = `13px ${FONT_SANS}`;
  symptoms.forEach((s) => {
    ctx.fillStyle = accent;
    ctx.fillText('✓', 40, y);
    ctx.fillStyle = DARK;
    const sLines = wrapText(ctx, s, CARD_W - 100);
    sLines.forEach((line, li) => {
      ctx.fillText(line, 58, y + li * 20);
    });
    y += sLines.length * 20 + 6;
  });
  y += 8;

  // ============ TAGLINE (warm closing) ============
  drawDivider(ctx, y, hexToRgba(accent, 0.2));
  y += 14;

  ctx.fillStyle = MED;
  ctx.font = `italic 12px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(p.tagline, CARD_W / 2, y);
  y += 28;
  ctx.textAlign = 'left';

  // ============ FOOTER ============
  const CARD_H = y + 80;

  const footerY = CARD_H - 80;
  ctx.strokeStyle = DIV;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(CARD_W - 36, footerY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('测测你的 WTF 人格', 36, footerY + 12);

  ctx.fillStyle = accent;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 36, footerY + 34);

  // QR Code
  fillRoundedRect(ctx, CARD_W - 36 - 60, footerY + 4, 60, 60, 10, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_W - 36 - 56, footerY + 8, 52, 52);
  } else {
    fillRoundedRect(ctx, CARD_W - 36 - 52, footerY + 12, 44, 44, 6, DIV);
  }

  // ========== CROP to actual height & draw border ==========
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = CARD_W * SCALE;
  croppedCanvas.height = CARD_H * SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas context unavailable');
  cctx.drawImage(canvas, 0, 0);

  cctx.scale(SCALE, SCALE);
  strokeRoundedRect(cctx, 14, 14, CARD_W - 28, CARD_H - 28, 24, hexToRgba(accent, 0.25), 2.5);
  strokeRoundedRect(cctx, 22, 22, CARD_W - 44, CARD_H - 44, 18, hexToRgba(accent, 0.08), 1);

  // Corner ornaments
  cctx.fillStyle = hexToRgba(accent, 0.35);
  cctx.font = `14px ${FONT_SANS}`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'top';
  cctx.fillText('✦', 36, 28);
  cctx.fillText('✦', CARD_W - 36, 28);
  cctx.fillText('✦', 36, CARD_H - 44);
  cctx.fillText('✦', CARD_W - 36, CARD_H - 44);

  return croppedCanvas.toDataURL('image/png');
}

// ─── React 组件 ───
export const WtftiShareImageGenerator = forwardRef<WtftiShareImageHandle, Props>(
  function WtftiShareImageGenerator({ personality, imageUrl }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

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
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderWtftiShareImage(personality, imageUrl);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate WTFTI share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [generating, imageUrl, personality]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `WTFTI-${personality.code}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `WTFTI-${personality.code}.png` });
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
      link.download = `WTFTI-${personality.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `WTF 我居然是${personality.wtftiName}？？` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.wtftiName, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
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
              生成 WTF 图鉴卡
            </>
          )}
        </button>

        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          >
            <div
              className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute -top-11 -right-1 p-2 text-white/50 hover:text-white transition-colors z-10"
                aria-label="关闭"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={`WTF ${personality.number} · ${personality.wtftiName}`} className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
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
