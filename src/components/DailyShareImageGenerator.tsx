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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = [];
  let idx = 0;
  while (idx < text.length && lines.length < maxLines) {
    let line = '';
    while (idx < text.length) {
      const char = text[idx];
      if (char === '\n') { idx++; break; }
      const candidate = line + char;
      if (line && ctx.measureText(candidate).width > maxWidth) break;
      line = candidate;
      idx++;
    }
    lines.push(line.trimStart());
  }
  if (idx < text.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
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
  const [qrImage, charImage] = await Promise.all([
    QRCode.toDataURL(DAILY_SHARE_URL, {
      width: 200, margin: 1, color: { dark: '#000000', light: '#ffffffff' }, errorCorrectionLevel: 'M',
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

  // Background
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Grid
  ctx.strokeStyle = hexToRgba('#292524', 0.38);
  ctx.lineWidth = 1;
  for (let p = 0; p <= CARD_WIDTH; p += 30) { ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, CARD_HEIGHT); ctx.stroke(); }
  for (let p = 0; p <= CARD_HEIGHT; p += 30) { ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(CARD_WIDTH, p); ctx.stroke(); }

  // Glow — larger, centered on character
  const glow = ctx.createRadialGradient(270, 280, 0, 270, 280, 300);
  glow.addColorStop(0, hexToRgba(status.color, 0.25));
  glow.addColorStop(1, 'rgba(12, 10, 9, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, 560);

  // Date header
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  ctx.fillStyle = '#78716c';
  ctx.font = `13px ${FONT_MONO}`;
  ctx.fillText(`今日状态报告 // ${dateStr}`, 36, 32);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#a8a29e';
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(DAILY_SHARE_URL, CARD_WIDTH - 36, 32);
  ctx.textAlign = 'left';

  // Subtitle
  ctx.fillStyle = '#a8a29e';
  ctx.font = `16px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('今天的我被鉴定为', CARD_WIDTH / 2, 70);

  // ============ HERO CHARACTER IMAGE (dominant visual) ============
  const charAreaY = 100;
  const charAreaH = 320;
  // Colored card behind character
  const cardX = 100;
  const cardW = CARD_WIDTH - 200;
  fillRoundedRect(ctx, cardX, charAreaY, cardW, charAreaH, 28, hexToRgba(status.color, 0.08));
  strokeRoundedRect(ctx, cardX, charAreaY, cardW, charAreaH, 28, hexToRgba(status.color, 0.18));

  if (charImage) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    drawImageContain(ctx, charImage, cardX + 20, charAreaY + 15, cardW - 40, charAreaH - 30);
    ctx.restore();
  } else {
    ctx.font = `160px ${FONT_SANS}`;
    ctx.fillText(status.emoji, CARD_WIDTH / 2, charAreaY + 60);
  }

  // Name — large
  const nameY = charAreaY + charAreaH + 24;
  ctx.fillStyle = '#fafaf9';
  ctx.font = `700 48px ${FONT_SANS}`;
  ctx.fillText(status.name, CARD_WIDTH / 2, nameY);

  // Code
  ctx.fillStyle = status.color;
  ctx.font = `600 18px ${FONT_MONO}`;
  ctx.fillText(status.code, CARD_WIDTH / 2, nameY + 60);
  ctx.textAlign = 'left';

  // Tagline card
  const tagY = nameY + 100;
  const tagW = CARD_WIDTH - 72;
  fillRoundedRect(ctx, 36, tagY, tagW, 50, 16, 'rgba(255,255,255,0.04)');
  strokeRoundedRect(ctx, 36, tagY, tagW, 50, 16, 'rgba(255,255,255,0.07)');
  ctx.fillStyle = status.color;
  ctx.font = `600 15px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(`"${status.tagline}"`, CARD_WIDTH / 2, tagY + 16);
  ctx.textAlign = 'left';

  // Dimension bars (compact)
  const barY = tagY + 72;
  ctx.fillStyle = '#78716c';
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('五维数据', 36, barY);

  dimensionScores.forEach((score, i) => {
    const dim = DAILY_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) return;
    const color = DAILY_MODEL_COLORS[dim.model].base;
    const rowY = barY + 30 + i * 32;
    const barX = 120;
    const barW = 336;
    const pct = ((score.score - 1) / 2);
    const pw = Math.max(36, pct * barW);

    ctx.fillStyle = '#a8a29e';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(dim.name, 36, rowY);

    fillRoundedRect(ctx, barX, rowY + 6, barW, 8, 999, 'rgba(255,255,255,0.08)');
    fillRoundedRect(ctx, barX, rowY + 6, pw, 8, 999, color);

    ctx.fillStyle = color;
    ctx.font = `600 13px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(score.level, 492, rowY);
    ctx.textAlign = 'left';
  });

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(36, 850);
  ctx.lineTo(CARD_WIDTH - 36, 850);
  ctx.stroke();

  // CTA
  ctx.fillStyle = '#fafaf9';
  ctx.font = `600 16px ${FONT_SANS}`;
  ctx.fillText('测测你今天是什么状态？', 36, 870);

  ctx.fillStyle = '#14b8a6';
  ctx.font = `12px ${FONT_MONO}`;
  ctx.fillText(DAILY_SHARE_URL, 36, 900);

  // QR
  fillRoundedRect(ctx, 424, 848, 80, 80, 12, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, 428, 852, 72, 72);
  } else {
    fillRoundedRect(ctx, 432, 856, 64, 64, 8, '#292524');
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
          await navigator.share({ files: [file], title: `我的今日状态：${status.name}` });
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
              className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="分享图片" className="w-full" />
              </div>

              <p className="text-center text-xs text-text-muted mb-3 sm:hidden">
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
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer flex items-center justify-center gap-2"
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
