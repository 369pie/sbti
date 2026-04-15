'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { getTypeImage } from '@/lib/personalities';
import { SHARE_SITE_URL } from '@/lib/site';
import type { SquadAnalysis } from '@/lib/squad';
import { getSquadPersonalityImage } from '@/lib/squad';

export interface SquadShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  analysis: SquadAnalysis;
}

const CARD_WIDTH = 640;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function isMobile() { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); }
function isWeChatBrowser() { return /MicroMessenger/i.test(navigator.userAgent); }

function hexToRgba(hex: string, alpha: number) {
  const v = hex.replace('#', '');
  const n = v.length === 3 ? v.split('').map(c => c + c).join('') : v;
  return `rgba(${parseInt(n.slice(0, 2), 16)}, ${parseInt(n.slice(2, 4), 16)}, ${parseInt(n.slice(4, 6), 16)}, ${alpha})`;
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

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    const onLoad = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error(`Load failed: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onErr); };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onErr);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* best effort */ }
  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = loadImage(src).catch(err => { imageCache.delete(src); throw err; });
  imageCache.set(src, p);
  return p;
}

async function createQrImage() {
  const url = await toQrDataUrl(SHARE_SITE_URL, {
    width: 200, margin: 1,
    color: { dark: '#2d2236', light: '#FFF9F2' },
    errorCorrectionLevel: 'M',
  });
  return getCachedImage(url);
}

// ─── Main render ─────────────────────────────────────────

async function renderSquadImage(analysis: SquadAnalysis) {
  const memberCount = analysis.members.length;
  const sp = analysis.squadPersonality;

  // Preload all member images + QR + squad personality image
  const [memberImages, qrImage, spImage] = await Promise.all([
    Promise.all(analysis.members.map(m => getCachedImage(getTypeImage(m.slug)).catch(() => null))),
    createQrImage().catch(() => null),
    getCachedImage(getSquadPersonalityImage(sp.code)).catch(() => null),
  ]);

  // ── Pre-compute layout positions for dynamic height ──
  const heroY = 98;
  const imgSize = 240;
  const codeY = heroY + 16 + imgSize + 14;
  const heroBgH = imgSize + 16 + 14 + 28 + 28 + 20 + 16; // img + gaps + code + name + tagline + bottom pad
  const avatarSize = Math.min(48, Math.floor((CARD_WIDTH - 100) / memberCount) - 10);
  const memberY = heroY + heroBgH + 20;
  const divY1 = memberY + avatarSize + 36;
  const metricsY = divY1 + 12;
  const metricRows = Math.ceil(analysis.metrics.length / 2);
  const rowH = 62;
  const descY = metricsY + 24 + metricRows * rowH + 8;

  // Measure description text to know line count
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  measureCtx.font = `13px ${FONT_SANS}`;
  const descMaxWidth = CARD_WIDTH - 84;
  const descLines = wrapText(measureCtx, sp.description, descMaxWidth, 3);

  const footerY = descY + 16 + descLines.length * 22 + 16;
  const FOOTER_BOTTOM = 90; // QR(72) + top-gap(4) + bottom padding(14)
  const CARD_HEIGHT = footerY + FOOTER_BOTTOM;

  // ── Create canvas at computed height ──
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  const BG = '#FFF9F2';
  const DARK = '#2D2A26';
  const MED = '#6B6560';
  const DIV = '#e8e0d6';
  const ACCENT = sp.color;

  // ══════ Background ══════
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Outer border
  strokeRoundedRect(ctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(ACCENT, 0.3), 2.5);
  strokeRoundedRect(ctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(ACCENT, 0.1), 1);

  // Corner ornaments
  ctx.fillStyle = hexToRgba(ACCENT, 0.35);
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 28);
  ctx.fillText('✦', CARD_WIDTH - 36, 28);
  ctx.fillText('✦', 36, CARD_HEIGHT - 44);
  ctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  // ══════ Header: group name ══════
  ctx.fillStyle = hexToRgba(ACCENT, 0.6);
  ctx.font = `600 11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('SBTI SQUAD REPORT', CARD_WIDTH / 2, 44);

  ctx.fillStyle = DARK;
  ctx.font = `700 22px ${FONT_SANS}`;
  ctx.fillText(analysis.groupName, CARD_WIDTH / 2, 64);

  // ══════ Squad Personality Hero ══════

  // Hero background - tinted card
  fillRoundedRect(ctx, 36, heroY, CARD_WIDTH - 72, heroBgH, 20, hexToRgba(ACCENT, 0.06));
  strokeRoundedRect(ctx, 36, heroY, CARD_WIDTH - 72, heroBgH, 20, hexToRgba(ACCENT, 0.15), 1.5);

  // Squad personality illustration or emoji fallback
  const imgX = (CARD_WIDTH - imgSize) / 2;
  const imgY = heroY + 16;

  // Image container with inner padding
  fillRoundedRect(ctx, imgX, imgY, imgSize, imgSize, 24, hexToRgba(ACCENT, 0.08));
  strokeRoundedRect(ctx, imgX, imgY, imgSize, imgSize, 24, hexToRgba(ACCENT, 0.3), 2);
  if (spImage) {
    ctx.save();
    roundRectPath(ctx, imgX + 8, imgY + 8, imgSize - 16, imgSize - 16, 18);
    ctx.clip();
    drawImageContain(ctx, spImage, imgX + 12, imgY + 12, imgSize - 24, imgSize - 24);
    ctx.restore();
  } else {
    ctx.fillStyle = DARK;
    ctx.font = `100px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(sp.emoji, CARD_WIDTH / 2, imgY + 60);
  }

  // Code
  ctx.fillStyle = ACCENT;
  ctx.font = `800 20px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(sp.code, CARD_WIDTH / 2, codeY);

  // Name
  ctx.fillStyle = DARK;
  ctx.font = `700 18px ${FONT_SANS}`;
  ctx.fillText(sp.name, CARD_WIDTH / 2, codeY + 28);

  // Tagline
  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText(`「${sp.tagline}」`, CARD_WIDTH / 2, codeY + 54);

  // ══════ Members row ══════
  const totalWidth = memberCount * avatarSize + (memberCount - 1) * 10;
  let memberX = (CARD_WIDTH - totalWidth) / 2;

  for (let i = 0; i < memberCount; i++) {
    const m = analysis.members[i];
    const img = memberImages[i];

    fillRoundedRect(ctx, memberX, memberY, avatarSize, avatarSize, 12, hexToRgba(m.personality.color, 0.1));
    strokeRoundedRect(ctx, memberX, memberY, avatarSize, avatarSize, 12, hexToRgba(m.personality.color, 0.4), 1.5);

    if (img) {
      ctx.save();
      roundRectPath(ctx, memberX + 2, memberY + 2, avatarSize - 4, avatarSize - 4, 10);
      ctx.clip();
      drawImageContain(ctx, img, memberX + 3, memberY + 3, avatarSize - 6, avatarSize - 6);
      ctx.restore();
    } else {
      ctx.fillStyle = DARK;
      ctx.font = `${avatarSize * 0.5}px ${FONT_SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText(m.personality.emoji, memberX + avatarSize / 2, memberY + avatarSize * 0.15);
    }

    // Name below
    ctx.fillStyle = DARK;
    ctx.font = `600 10px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(m.name, memberX + avatarSize / 2, memberY + avatarSize + 3);

    // Type code
    ctx.fillStyle = m.personality.color;
    ctx.font = `9px ${FONT_MONO}`;
    ctx.fillText(m.personality.code, memberX + avatarSize / 2, memberY + avatarSize + 16);

    memberX += avatarSize + 10;
  }

  // ══════ Divider ══════
  ctx.strokeStyle = DIV;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(42, divY1);
  ctx.lineTo(CARD_WIDTH - 42, divY1);
  ctx.stroke();

  // ══════ Metrics (compact 2×2 grid) ══════
  const barStartX = 42;
  const barEndX = CARD_WIDTH - 42;
  const colW = (barEndX - barStartX - 24) / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = MED;
  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillText('群体指标', barStartX, metricsY);

  analysis.metrics.forEach((metric, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = barStartX + col * (colW + 24);
    const y = metricsY + 24 + row * rowH;

    // Label + emoji
    ctx.fillStyle = DARK;
    ctx.font = `600 13px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${metric.emoji} ${metric.label}`, x, y);

    // Value
    ctx.fillStyle = ACCENT;
    ctx.font = `600 13px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${metric.value}%`, x + colW, y);

    // Bar
    const barY = y + 22;
    const barH = 7;
    fillRoundedRect(ctx, x, barY, colW, barH, 999, DIV);
    const fillW = Math.max(5, (metric.value / 100) * colW);
    fillRoundedRect(ctx, x, barY, fillW, barH, 999, ACCENT);

    // Comment
    ctx.fillStyle = MED;
    ctx.font = `11px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(metric.comment, x, barY + 14);
  });

  // ══════ Description ══════

  ctx.strokeStyle = DIV;
  ctx.beginPath();
  ctx.moveTo(42, descY);
  ctx.lineTo(CARD_WIDTH - 42, descY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.textAlign = 'left';
  // Reuse pre-computed descLines
  descLines.forEach((line, i) => {
    ctx.fillText(line, 42, descY + 16 + i * 22);
  });

  // ══════ Footer ══════

  ctx.strokeStyle = DIV;
  ctx.beginPath();
  ctx.moveTo(42, footerY);
  ctx.lineTo(CARD_WIDTH - 42, footerY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `600 13px ${FONT_SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('一起来组局', 42, footerY + 14);

  ctx.fillStyle = ACCENT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL + 'squad', 42, footerY + 36);

  // QR
  fillRoundedRect(ctx, CARD_WIDTH - 116, footerY + 4, 72, 72, 10, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_WIDTH - 112, footerY + 8, 64, 64);
  }

  return canvas.toDataURL('image/png');
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining && lines.length < maxLines) {
    let end = remaining.length;
    while (ctx.measureText(remaining.slice(0, end)).width > maxWidth && end > 1) {
      end--;
    }
    if (end < remaining.length && lines.length === maxLines - 1) {
      // Last line — add ellipsis
      while (ctx.measureText(remaining.slice(0, end) + '…').width > maxWidth && end > 1) end--;
      lines.push(remaining.slice(0, end) + '…');
    } else {
      lines.push(remaining.slice(0, end));
    }
    remaining = remaining.slice(end);
  }
  return lines;
}

// ─── Component ───────────────────────────────────────────

export const SquadShareImageGenerator = forwardRef<SquadShareImageGeneratorHandle, Props>(
  function SquadShareImageGenerator({ analysis }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    // Preload member images + squad personality image
    useEffect(() => {
      for (const m of analysis.members) {
        getCachedImage(getTypeImage(m.slug)).catch(() => null);
      }
      getCachedImage(getSquadPersonalityImage(analysis.squadPersonality.code)).catch(() => null);
      createQrImage().catch(() => null);
    }, [analysis]);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const url = await renderSquadImage(analysis);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Failed to generate squad image:', err);
      } finally {
        setGenerating(false);
      }
    }, [analysis, generating]);

    const createFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `SBTI-Squad-${analysis.groupName}.png`, { type: 'image/png' });
    }, [analysis.groupName, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `SBTI-Squad-${analysis.groupName}.png` });
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
      link.download = `SBTI-Squad-${analysis.groupName}.png`;
      link.href = previewUrl;
      link.click();
    }, [analysis.groupName, createFile, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `${analysis.groupName} 的 SBTI 组局报告` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [analysis.groupName, createFile, handleDownload, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <>
        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center"
            onClick={() => setPreviewUrl(null)}
          >
            <div
              className="relative w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-3 right-3 rounded-full bg-black/55 p-2 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 z-10 cursor-pointer"
                aria-label="关闭"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="组局分享图" className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-accent mb-3 px-4 leading-5">{saveHint}</p>
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

              <p className="text-center text-xs text-white/60 mt-4">点击空白处关闭</p>
            </div>
          </div>
        )}
      </>
    );
  },
);
