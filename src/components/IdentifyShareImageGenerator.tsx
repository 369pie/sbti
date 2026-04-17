'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';
import { toQrDataUrl } from '@/lib/qr-code';
import type { IdentifyPersonaType } from '@/lib/identify/personas';
import { getIdentifyTypeImage } from '@/lib/identify/personas';
import { IDENTIFY_DIMENSIONS, IDENTIFY_MODEL_COLORS } from '@/lib/identify/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { IdentifyDimensionScore } from '@/lib/identify/scoring';

export interface IdentifyShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  persona: IdentifyPersonaType;
  dimensionScores: IdentifyDimensionScore[];
  friendName?: string;
}

const CARD_WIDTH = 540;
const MAX_H = 4000;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const IDENTIFY_SHARE_URL = SHARE_SITE_URL + 'identify/';

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

function drawDivider(ctx: CanvasRenderingContext2D, y: number, color: string) {
  const cx = CARD_WIDTH / 2;
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

async function renderIdentifyShareImage(
  persona: IdentifyPersonaType,
  dimensionScores: IdentifyDimensionScore[],
  friendName: string,
) {
  const BG = '#FFF5F7';          // pink-tinted cream
  const DARK = '#2d2236';
  const MED = '#6b6380';
  const LIGHT = '#A8A0B0';
  const DIV = '#f0dde4';
  const ACCENT = '#ec4899';      // pink accent

  const displayName = friendName || 'ta';

  const [qrImage, charImage] = await Promise.all([
    toQrDataUrl(IDENTIFY_SHARE_URL, {
      width: 200, margin: 1, color: { dark: DARK, light: BG + 'ff' }, errorCorrectionLevel: 'M',
    }).then(url => loadImage(url)).catch(() => null),
    loadImage(getIdentifyTypeImage(persona.slug)).catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = MAX_H * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  const wash = ctx.createRadialGradient(CARD_WIDTH / 2, 220, 0, CARD_WIDTH / 2, 220, 300);
  wash.addColorStop(0, hexToRgba(ACCENT, 0.08));
  wash.addColorStop(1, hexToRgba(ACCENT, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 460);

  let y = 44;

  // ── Header: 鉴定书 badge ──
  const badgeText = '🔍 WTF 好友鉴定书';
  ctx.font = `600 13px ${FONT_SANS}`;
  const badgeW = ctx.measureText(badgeText).width + 28;
  const badgeX = (CARD_WIDTH - badgeW) / 2;
  fillRoundedRect(ctx, badgeX, y, badgeW, 28, 14, hexToRgba(ACCENT, 0.08));
  strokeRoundedRect(ctx, badgeX, y, badgeW, 28, 14, hexToRgba(ACCENT, 0.2));
  ctx.fillStyle = ACCENT;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, CARD_WIDTH / 2, y + 6);
  y += 40;

  // ── "被鉴定人" ──
  if (friendName) {
    ctx.fillStyle = MED;
    ctx.font = `12px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(`被鉴定人：${friendName}`, CARD_WIDTH / 2, y);
    y += 24;
  }
  ctx.textAlign = 'left';

  // ── Character image ──
  const imgX = 60;
  const imgW = CARD_WIDTH - 120;
  const imgH = 380;

  fillRoundedRect(ctx, imgX, y, imgW, imgH, 20, '#ffffff');
  strokeRoundedRect(ctx, imgX, y, imgW, imgH, 20, hexToRgba(persona.color, 0.18));

  if (charImage) {
    ctx.save();
    roundRectPath(ctx, imgX + 4, y + 4, imgW - 8, imgH - 8, 16);
    ctx.clip();
    drawImageContain(ctx, charImage, imgX + 8, y + 8, imgW - 16, imgH - 16);
    ctx.restore();
  } else {
    ctx.font = `100px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(persona.emoji, CARD_WIDTH / 2, y + 80);
    ctx.textAlign = 'left';
  }
  y += imgH + 14;

  // ── Name + Code ──
  ctx.textAlign = 'center';
  ctx.fillStyle = DARK;
  ctx.font = `700 38px ${FONT_SANS}`;
  ctx.fillText(persona.name, CARD_WIDTH / 2, y);
  y += 44;

  ctx.fillStyle = persona.color;
  ctx.font = `600 15px ${FONT_MONO}`;
  ctx.fillText(persona.code, CARD_WIDTH / 2, y);
  y += 28;

  // ── Tagline quote ──
  ctx.textAlign = 'left';
  const quoteText = `「${persona.tagline}」`;
  ctx.font = `600 16px ${FONT_SANS}`;
  const quoteW = CARD_WIDTH - 72;
  const quoteLines = wrapText(ctx, quoteText, quoteW - 32);
  const quoteH = Math.max(48, quoteLines.length * 24 + 18);
  fillRoundedRect(ctx, 36, y, quoteW, quoteH, 14, hexToRgba(ACCENT, 0.06));
  strokeRoundedRect(ctx, 36, y, quoteW, quoteH, 14, hexToRgba(ACCENT, 0.15));
  ctx.fillStyle = ACCENT;
  ctx.font = `600 16px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  quoteLines.forEach((line, i) => {
    ctx.fillText(line, CARD_WIDTH / 2, y + 10 + i * 24);
  });
  ctx.textAlign = 'left';
  y += quoteH + 18;

  // ── Symptoms ──
  drawDivider(ctx, y, hexToRgba(ACCENT, 0.3));
  y += 14;

  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(`${displayName}中了几枪？`, CARD_WIDTH / 2, y);
  y += 22;
  ctx.textAlign = 'left';

  persona.symptoms.forEach((symptom) => {
    ctx.fillStyle = ACCENT;
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText('✓', 44, y);

    ctx.fillStyle = DARK;
    ctx.font = `13px ${FONT_SANS}`;

    const symptomLines = wrapText(ctx, symptom, CARD_WIDTH - 120);
    symptomLines.forEach((line, li) => {
      ctx.fillText(line, 66, y + li * 20);
    });
    y += symptomLines.length * 20 + 6;
  });
  y += 8;

  // ── Dimension dots ──
  drawDivider(ctx, y, hexToRgba(ACCENT, 0.3));
  y += 14;

  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('五维鉴定', CARD_WIDTH / 2, y);
  y += 20;

  dimensionScores.forEach((score) => {
    const dim = IDENTIFY_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) return;
    const color = IDENTIFY_MODEL_COLORS[dim.model].base;

    ctx.font = `12px ${FONT_SANS}`;
    ctx.fillStyle = MED;
    ctx.textAlign = 'left';
    ctx.fillText(dim.name, 40, y);

    const dotsX = 155;
    const dotsW = CARD_WIDTH - 310;
    const dotSpacing = dotsW / 4;
    const pct = (score.score - 1) / 2;
    const filledDots = pct >= 0.75 ? 5 : pct >= 0.55 ? 4 : pct >= 0.4 ? 3 : pct >= 0.2 ? 2 : 1;

    for (let d = 0; d < 5; d++) {
      const dx = dotsX + d * dotSpacing;
      const dy = y + 5;
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fillStyle = d < filledDots ? color : DIV;
      ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.font = `600 12px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(score.level, CARD_WIDTH - 40, y);
    ctx.textAlign = 'left';
    y += 28;
  });
  y += 6;

  // ── "被冤枉了？" CTA ──
  drawDivider(ctx, y, hexToRgba(ACCENT, 0.2));
  y += 12;

  ctx.fillStyle = ACCENT;
  ctx.font = `italic 13px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(`被冤枉了？自己来测对比一下 😤`, CARD_WIDTH / 2, y);
  y += 28;
  ctx.textAlign = 'left';

  // ── Footer ──
  const CARD_HEIGHT = y + 80;
  const footerY = CARD_HEIGHT - 80;

  ctx.strokeStyle = DIV;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(CARD_WIDTH - 36, footerY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('鉴定你的好友？', 36, footerY + 12);

  ctx.fillStyle = ACCENT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(IDENTIFY_SHARE_URL, 36, footerY + 34);

  // QR
  fillRoundedRect(ctx, CARD_WIDTH - 36 - 60, footerY + 4, 60, 60, 10, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_WIDTH - 36 - 56, footerY + 8, 52, 52);
  } else {
    fillRoundedRect(ctx, CARD_WIDTH - 36 - 52, footerY + 12, 44, 44, 6, DIV);
  }

  // ── Crop & border ──
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = CARD_WIDTH * CARD_SCALE;
  croppedCanvas.height = CARD_HEIGHT * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas context unavailable');
  cctx.drawImage(canvas, 0, 0);

  cctx.scale(CARD_SCALE, CARD_SCALE);
  strokeRoundedRect(cctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(ACCENT, 0.4), 2.5);
  strokeRoundedRect(cctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(ACCENT, 0.1), 1);

  // Corner ornaments
  cctx.fillStyle = hexToRgba(ACCENT, 0.45);
  cctx.font = `14px ${FONT_SANS}`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'top';
  cctx.fillText('✦', 36, 28);
  cctx.fillText('✦', CARD_WIDTH - 36, 28);
  cctx.fillText('✦', 36, CARD_HEIGHT - 44);
  cctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  return croppedCanvas.toDataURL('image/png');
}

export const IdentifyShareImageGenerator = forwardRef<IdentifyShareImageGeneratorHandle, Props>(
  function IdentifyShareImageGenerator({ persona, dimensionScores, friendName = '' }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({ resourceId: `identify:${persona.code}`, universe: 'identify' });

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderIdentifyShareImage(persona, dimensionScores, friendName);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#FFF1F4', 'IDENTIFY');
        setPreviewUrl(finalUrl);
      } catch (err) {
        console.error('Failed to generate share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [dimensionScores, friendName, generating, persona, tierCtl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `WTF-鉴定书-${persona.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [persona.code, previewUrl, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `WTF-鉴定书-${persona.code}.png` });
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
      link.download = `WTF-鉴定书-${persona.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, persona.code, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `WTF 鉴定书：${persona.name}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, persona.name, previewUrl]);

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
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              生成鉴定书图片
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
                <img src={previewUrl} alt="鉴定书图片" className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-pink-400 mb-3 px-4 leading-5">
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
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  发给 ta
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
