'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import type { CptiRelationshipType } from '@/lib/cpti/relationships';
import {
  getCptiRelationshipTypeImage,
  getCptiRelationshipTypeThumbnailImage,
} from '@/lib/cpti/relationships';
import { SHARE_SITE_URL } from '@/lib/site';

export interface CptiRelationshipShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  relationship: CptiRelationshipType;
  nicknameA?: string;
  nicknameB?: string;
}

const CARD_WIDTH = 540;
const MAX_H = 1600;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const CPTI_SHARE_URL = SHARE_SITE_URL + 'cpti/';

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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines?: number) {
  const lines: string[] = [];
  let idx = 0;
  while (idx < text.length && (!maxLines || lines.length < maxLines)) {
    let line = '';
    while (idx < text.length) {
      const char = text[idx];
      if (char === '\n') { idx++; break; }
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth) break;
      line += char;
      idx++;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function renderCptiRelationshipShareImage(relationship: CptiRelationshipType, nicknameA: string, nicknameB: string) {
  const qrImage = await toQrDataUrl(CPTI_SHARE_URL, {
    width: 200, margin: 1, color: { dark: '#2D2A26', light: '#ffffffff' }, errorCorrectionLevel: 'M',
  }).then(url => getCachedImage(url)).catch(() => null);

  // Try full image first, fallback to thumbnail
  let cardImg: HTMLImageElement | null = null;
  try {
    cardImg = await getCachedImage(getCptiRelationshipTypeImage(relationship.slug));
    if (!cardImg || cardImg.naturalWidth === 0) cardImg = null;
  } catch { /* ignore */ }
  if (!cardImg) {
    try {
      cardImg = await getCachedImage(getCptiRelationshipTypeThumbnailImage(relationship.slug));
      if (!cardImg || cardImg.naturalWidth === 0) cardImg = null;
    } catch { /* ignore */ }
  }

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = MAX_H * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  const BG_TOP = '#FFF8FA';
  const BG_BOT = '#FFF0F3';
  const DARK = '#2D2A26';
  const MED = '#6B5B60';
  const LIGHT = '#A89A9E';
  const DIV = '#E8D5DC';
  const ACCENT = relationship.color;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, MAX_H);
  bgGrad.addColorStop(0, BG_TOP);
  bgGrad.addColorStop(1, BG_BOT);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  // Ambient glow at top
  const glow = ctx.createRadialGradient(CARD_WIDTH / 2, 180, 0, CARD_WIDTH / 2, 180, 320);
  glow.addColorStop(0, hexToRgba(ACCENT, 0.10));
  glow.addColorStop(1, hexToRgba(ACCENT, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, 500);

  let y = 38;

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = hexToRgba(ACCENT, 0.85);
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText('CPTI · 关系鉴定结果', CARD_WIDTH / 2, y);
  y += 34;

  // Relationship card image (hero)
  const cardW = 360;
  const cardH = 480; // 3:4 ratio
  const cardX = (CARD_WIDTH - cardW) / 2;

  // Shadow under card
  fillRoundedRect(ctx, cardX + 4, y + 4, cardW, cardH, 22, 'rgba(0,0,0,0.06)');
  // Card background
  fillRoundedRect(ctx, cardX, y, cardW, cardH, 22, '#FFFFFF');
  // Card border
  strokeRoundedRect(ctx, cardX, y, cardW, cardH, 22, hexToRgba(ACCENT, 0.15), 1);

  if (cardImg) {
    // Clip to rounded rect and draw image
    ctx.save();
    roundRectPath(ctx, cardX + 4, y + 4, cardW - 8, cardH - 8, 18);
    ctx.clip();
    drawImageContain(ctx, cardImg, cardX + 4, y + 4, cardW - 8, cardH - 8);
    ctx.restore();
  } else {
    // Emoji fallback
    ctx.fillStyle = DARK;
    ctx.font = `120px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(relationship.emoji, CARD_WIDTH / 2, y + cardH / 2 - 60);
    ctx.textAlign = 'left';
  }
  y += cardH + 24;

  // Nicknames
  ctx.textAlign = 'center';
  ctx.fillStyle = DARK;
  ctx.font = `600 17px ${FONT_SANS}`;
  ctx.fillText(`${nicknameA || '朋友'} × ${nicknameB || '你'}`, CARD_WIDTH / 2, y);
  y += 28;

  // Relationship name (subtle, since card already has it baked in)
  ctx.fillStyle = ACCENT;
  ctx.font = `700 22px ${FONT_SANS}`;
  ctx.fillText(relationship.name, CARD_WIDTH / 2, y);
  y += 36;

  // 关系速写 description block
  const descText = relationship.description.replace(/\n+/g, ' ').trim();
  if (descText) {
    ctx.fillStyle = MED;
    ctx.font = `13px ${FONT_SANS}`;
    const descLines = wrapText(ctx, descText, CARD_WIDTH - 80, 3);
    const descH = descLines.length * 21 + 24;
    fillRoundedRect(ctx, 36, y, CARD_WIDTH - 72, descH, 12, hexToRgba(ACCENT, 0.05));
    strokeRoundedRect(ctx, 36, y, CARD_WIDTH - 72, descH, 12, hexToRgba(ACCENT, 0.12), 1);
    ctx.textAlign = 'left';
    ctx.fillStyle = DARK;
    ctx.font = `13px ${FONT_SANS}`;
    descLines.forEach((line, i) => {
      ctx.fillText(line, 52, y + 12 + i * 21);
    });
    ctx.textAlign = 'center';
    y += descH + 22;
  }

  // Divider
  const cx = CARD_WIDTH / 2;
  const grad = ctx.createLinearGradient(cx - 120, 0, cx + 120, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.35, hexToRgba(ACCENT, 0.35));
  grad.addColorStop(0.65, hexToRgba(ACCENT, 0.35));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - 120, y);
  ctx.lineTo(cx + 120, y);
  ctx.stroke();
  y += 26;

  // Footer text
  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('测测你们的CP关系类型', CARD_WIDTH / 2, y);
  y += 24;
  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(CPTI_SHARE_URL, CARD_WIDTH / 2, y);
  y += 18;

  // QR code
  const qrSize = 64;
  const qrX = (CARD_WIDTH - qrSize) / 2;
  if (qrImage) {
    fillRoundedRect(ctx, qrX - 4, y - 4, qrSize + 8, qrSize + 8, 10, '#FFFFFF');
    strokeRoundedRect(ctx, qrX - 4, y - 4, qrSize + 8, qrSize + 8, 10, DIV, 1);
    drawImageContain(ctx, qrImage, qrX, y, qrSize, qrSize);
  }
  y += qrSize + 30;

  // Final height
  const CARD_HEIGHT = y + 10;

  // Crop to actual height
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = CARD_WIDTH * CARD_SCALE;
  croppedCanvas.height = CARD_HEIGHT * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas context unavailable');
  cctx.drawImage(canvas, 0, 0);

  // Decorative outer frame
  cctx.scale(CARD_SCALE, CARD_SCALE);
  strokeRoundedRect(cctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(ACCENT, 0.22), 2.5);
  strokeRoundedRect(cctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(ACCENT, 0.08), 1);

  // Corner ornaments
  cctx.fillStyle = hexToRgba(ACCENT, 0.40);
  cctx.font = `13px ${FONT_SANS}`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'top';
  cctx.fillText('♡', 34, 26);
  cctx.fillText('♡', CARD_WIDTH - 34, 26);
  cctx.textBaseline = 'alphabetic';
  cctx.fillText('♡', 34, CARD_HEIGHT - 24);
  cctx.fillText('♡', CARD_WIDTH - 34, CARD_HEIGHT - 24);

  return croppedCanvas.toDataURL('image/png');
}

export const CptiRelationshipShareImageGenerator = forwardRef<CptiRelationshipShareImageGeneratorHandle, Props>(
  function CptiRelationshipShareImageGenerator({ relationship, nicknameA = '朋友', nicknameB = '你' }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderCptiRelationshipShareImage(relationship, nicknameA, nicknameB);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [relationship, nicknameA, nicknameB, generating]);

    const handleQuickDownload = useCallback(async () => {
      if (!previewUrl) {
        await handleGenerate();
        return;
      }
      const link = document.createElement('a');
      link.download = `CPTI-关系-${relationship.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [handleGenerate, relationship.code, previewUrl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `CPTI-关系-${relationship.code}.png`, { type: 'image/png' });
    }, [relationship.code, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"ã');
            await navigator.share({ files: [file], title: `CPTI-关系-${relationship.code}.png` });
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
      link.download = `CPTI-关系-${relationship.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, relationship.code, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我们的CP关系：${relationship.name}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, relationship.name, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div className="space-y-2.5">
        <button
          onClick={handleQuickDownload}
          disabled={generating}
          className="w-full py-3.5 rounded-xl bg-rose-500 text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              下载分享卡
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              生成分享卡片
            </>
          )}
        </button>

        {previewUrl && (
          <>
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
                  className="absolute top-3 right-3 rounded-full bg-black/55 p-2 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 z-10"
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

                {saveHint && (
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3 mb-3">
                    <p className="text-xs text-white/80 text-center leading-relaxed">{saveHint}</p>
                  </div>
                )}

                <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                  ������ 长按上方图片可直接保存到相册
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 rounded-xl border border-white/30 text-sm text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    保存
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-3 rounded-xl border border-white/30 text-sm text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    送给ta
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setPreviewUrl(null)}
              className="w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              隐藏预览
            </button>
          </>
        )}
      </div>
    );
  },
);
