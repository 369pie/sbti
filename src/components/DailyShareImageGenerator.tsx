'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import QRCode from 'qrcode';
import type { DailyStatusType } from '@/lib/daily/statuses';
import { getDailyTypeImage } from '@/lib/daily/statuses';
import { DAILY_DIMENSIONS, DAILY_MODEL_COLORS } from '@/lib/daily/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { DailyDimensionScore } from '@/lib/daily/scoring';

export interface DailyShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  status: DailyStatusType;
  dimensionScores: DailyDimensionScore[];
}

const CARD_WIDTH = 540;
const CARD_HEIGHT = 960;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const DAILY_SHARE_URL = SHARE_SITE_URL + 'daily/';

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

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function renderDailyShareImage(status: DailyStatusType, dimensionScores: DailyDimensionScore[]) {
  const BG = '#FFF9F2';
  const DARK = '#2d2236';
  const MED = '#6b6380';
  const DIV = '#e8e0d6';

  const [qrImage, charImage] = await Promise.all([
    QRCode.toDataURL(DAILY_SHARE_URL, {
      width: 200, margin: 1, color: { dark: DARK, light: BG + 'ff' }, errorCorrectionLevel: 'M',
    }).then(url => loadImage(url)).catch(() => null),
    loadImage(getDailyTypeImage(status.slug)).catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // ========== Cream background ==========
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const wash = ctx.createRadialGradient(CARD_WIDTH / 2, 220, 0, CARD_WIDTH / 2, 220, 300);
  wash.addColorStop(0, hexToRgba(status.color, 0.09));
  wash.addColorStop(1, hexToRgba(status.color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 460);

  // Card border
  strokeRoundedRect(ctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(status.color, 0.4), 2.5);
  strokeRoundedRect(ctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(status.color, 0.1), 1);

  // Corner ornaments
  ctx.fillStyle = hexToRgba(status.color, 0.45);
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 28);
  ctx.fillText('✦', CARD_WIDTH - 36, 28);
  ctx.fillText('✦', 36, CARD_HEIGHT - 44);
  ctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  // ========== Header ==========
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  ctx.fillStyle = status.color;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText(`今日模式鉴定 · ${dateStr}`, CARD_WIDTH / 2, 48);

  // ========== Character image ==========
  const imgX = 60;
  const imgY = 68;
  const imgW = CARD_WIDTH - 120;
  const imgH = 420;

  fillRoundedRect(ctx, imgX, imgY, imgW, imgH, 20, '#ffffff');
  strokeRoundedRect(ctx, imgX, imgY, imgW, imgH, 20, hexToRgba(status.color, 0.18));

  if (charImage) {
    ctx.save();
    roundRectPath(ctx, imgX + 4, imgY + 4, imgW - 8, imgH - 8, 16);
    ctx.clip();
    drawImageContain(ctx, charImage, imgX + 8, imgY + 8, imgW - 16, imgH - 16);
    ctx.restore();
  } else {
    ctx.font = `120px ${FONT_SANS}`;
    ctx.fillText(status.emoji, CARD_WIDTH / 2, imgY + 70);
  }

  // ========== Name + Code ==========
  const nameY = imgY + imgH + 14;
  ctx.fillStyle = DARK;
  ctx.font = `700 40px ${FONT_SANS}`;
  ctx.fillText(status.name, CARD_WIDTH / 2, nameY);

  ctx.fillStyle = status.color;
  ctx.font = `600 16px ${FONT_MONO}`;
  ctx.fillText(status.code, CARD_WIDTH / 2, nameY + 44);
  ctx.textAlign = 'left';

  // ========== Tagline ==========
  const tagY = nameY + 72;
  const tagW = CARD_WIDTH - 80;
  fillRoundedRect(ctx, 40, tagY, tagW, 44, 14, hexToRgba(status.color, 0.06));
  strokeRoundedRect(ctx, 40, tagY, tagW, 44, 14, hexToRgba(status.color, 0.15));
  ctx.fillStyle = status.color;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(`「${status.tagline}」`, CARD_WIDTH / 2, tagY + 14);
  ctx.textAlign = 'left';

  // ========== Dimension bars ==========
  const barY = tagY + 52;
  ctx.fillStyle = MED;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText('五维数据', 44, barY);

  dimensionScores.forEach((score, i) => {
    const dim = DAILY_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) return;
    const color = DAILY_MODEL_COLORS[dim.model].base;
    const rowY = barY + 24 + i * 28;
    const barX = 120;
    const barW = 330;
    const pct = ((score.score - 1) / 2);
    const pw = Math.max(36, pct * barW);

    ctx.fillStyle = DARK;
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(dim.name, 44, rowY);

    fillRoundedRect(ctx, barX, rowY + 6, barW, 7, 999, DIV);
    fillRoundedRect(ctx, barX, rowY + 6, pw, 7, 999, color);

    ctx.fillStyle = color;
    ctx.font = `600 12px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(score.level, 488, rowY);
    ctx.textAlign = 'left';
  });

  // ========== Divider ==========
  const footerDivY = CARD_HEIGHT - 96;
  ctx.strokeStyle = DIV;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, footerDivY);
  ctx.lineTo(CARD_WIDTH - 60, footerDivY);
  ctx.stroke();

  // ========== Footer ==========
  const ftY = footerDivY + 14;
  ctx.fillStyle = DARK;
  ctx.font = `600 13px ${FONT_SANS}`;
  ctx.fillText('测测你今天开了什么模式？', 48, ftY);

  ctx.fillStyle = status.color;
  ctx.font = `10px ${FONT_MONO}`;
  ctx.fillText(DAILY_SHARE_URL, 48, ftY + 22);

  // QR
  const qrS = 60;
  const qrX = CARD_WIDTH - 48 - qrS;
  const qrY = ftY - 4;
  fillRoundedRect(ctx, qrX - 3, qrY - 3, qrS + 6, qrS + 6, 10, '#ffffff');
  strokeRoundedRect(ctx, qrX - 3, qrY - 3, qrS + 6, qrS + 6, 10, DIV);
  if (qrImage) {
    drawImageContain(ctx, qrImage, qrX, qrY, qrS, qrS);
  }

  return canvas.toDataURL('image/png');
}

export const DailyShareImageGenerator = forwardRef<DailyShareImageGeneratorHandle, Props>(
  function DailyShareImageGenerator({ status, dimensionScores }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderDailyShareImage(status, dimensionScores);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [dimensionScores, generating, status]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `DAILY-${status.code}.png`, { type: 'image/png' });
    }, [status.code, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `DAILY-${status.code}.png` });
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
      link.download = `DAILY-${status.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, status.code, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我的今日模式：${status.name}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, status.name, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-xl bg-teal-500 text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              生成分享图片
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
                <img src={previewUrl} alt="分享图片" className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-teal-400 mb-3 px-4 leading-5">
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
                  className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
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
