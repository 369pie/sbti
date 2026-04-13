'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { getXptiRarity, getXptiTypeImage } from '@/lib/xpti/personalities';
import type { XptiPersonalityType } from '@/lib/xpti/personalities';
import { XPTI_DIMENSIONS, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { XptiDimensionScore } from '@/lib/xpti/scoring';

export interface XptiShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  personality: XptiPersonalityType;
  dimensionScores: XptiDimensionScore[];
}

const CARD_WIDTH = 540;
const MAX_H = 4000;          // oversized canvas, will be cropped
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const XPTI_SHARE_URL = SHARE_SITE_URL + 'xpti/';

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    const onLoad = () => { cleanup(); resolve(img); };
    const onError = () => { cleanup(); imageCache.delete(src); reject(new Error(`Load failed: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onError); };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(img); }
  });
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

/** Extract the 翻译你的恋爱DNA section from xpti description */
function extractShortDesc(description: string): string {
  const sections = description.split(/【(.*?)】/).filter(Boolean);
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].includes('翻译你的恋爱DNA') && sections[i + 1]) {
      return sections[i + 1].trim();
    }
  }
  // Fallback: get early meaningful paragraphs
  const paragraphs = description.split('\n').filter(l => l.trim() && !l.startsWith('【') && !l.startsWith('✓'));
  return paragraphs.slice(0, 4).join('\n');
}

/** Draw a centered decorative divider */
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

async function renderXptiShareImage(personality: XptiPersonalityType, dimensionScores: XptiDimensionScore[]) {
  const [personalityImage, qrImage] = await Promise.all([
    getCachedImage(getXptiTypeImage(personality.slug)).catch(() => null),
    toQrDataUrl(XPTI_SHARE_URL, {
      width: 200, margin: 1, color: { dark: '#000000', light: '#ffffffff' }, errorCorrectionLevel: 'M',
    }).then(url => getCachedImage(url)).catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = MAX_H * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // ========== Color system ==========
  const BG = '#FFF5F7';
  const DARK = '#2D2236';
  const MED = '#6B5F72';
  const LIGHT = '#A89DB0';
  const DIV = '#e8dce6';

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  // Subtle gradient wash
  const wash = ctx.createRadialGradient(270, 200, 0, 270, 200, 300);
  wash.addColorStop(0, hexToRgba(personality.color, 0.1));
  wash.addColorStop(1, hexToRgba(personality.color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 400);

  // ========== y tracks the current vertical position ==========
  let y = 46;

  // ── Header ──
  ctx.fillStyle = personality.color;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('XPTI 恋爱XP体质报告', CARD_WIDTH / 2, y);
  y += 22;

  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('MBTI测你是什么人，XPTI测你爱上什么人', CARD_WIDTH / 2, y);
  y += 24;
  ctx.textAlign = 'left';

  // ============ HERO CHARACTER IMAGE ============
  const avatarX = 60;
  const avatarW = CARD_WIDTH - 120;
  const avatarH = 400;
  fillRoundedRect(ctx, avatarX, y, avatarW, avatarH, 24, '#ffffff');
  strokeRoundedRect(ctx, avatarX, y, avatarW, avatarH, 24, hexToRgba(personality.color, 0.25));
  if (personalityImage) {
    ctx.save();
    roundRectPath(ctx, avatarX + 4, y + 4, avatarW - 8, avatarH - 8, 20);
    ctx.clip();
    drawImageContain(ctx, personalityImage, avatarX + 12, y + 8, avatarW - 24, avatarH - 16);
    ctx.restore();
  } else {
    ctx.fillStyle = DARK;
    ctx.font = `120px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(personality.emoji, CARD_WIDTH / 2, y + 60);
    ctx.textAlign = 'left';
  }
  y += avatarH + 16;

  // ── Number + Code ──
  ctx.textAlign = 'center';
  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_MONO}`;
  ctx.fillText(personality.number, CARD_WIDTH / 2, y);
  y += 18;

  ctx.fillStyle = personality.color;
  ctx.font = `700 28px ${FONT_MONO}`;
  ctx.fillText(personality.code, CARD_WIDTH / 2, y);
  y += 36;

  // Name
  ctx.fillStyle = DARK;
  ctx.font = `700 42px ${FONT_SANS}`;
  ctx.fillText(personality.name, CARD_WIDTH / 2, y);
  y += 50;

  // Rarity pill
  const rarity = getXptiRarity(personality.slug);
  const rarityText = `${rarity.tier === 'legendary' ? '✦ ' : rarity.tier === 'epic' ? '◆ ' : ''}${rarity.label} · 仅 ${rarity.populationPct}% 的人`;
  ctx.font = `600 13px ${FONT_SANS}`;
  const rarityW = ctx.measureText(rarityText).width + 28;
  const rarityX = (CARD_WIDTH - rarityW) / 2;
  fillRoundedRect(ctx, rarityX, y, rarityW, 28, 14, hexToRgba(rarity.color, 0.12));
  strokeRoundedRect(ctx, rarityX, y, rarityW, 28, 14, hexToRgba(rarity.color, 0.3));
  ctx.fillStyle = rarity.color;
  ctx.fillText(rarityText, CARD_WIDTH / 2, y + 7);
  y += 40;

  // ============ ★ QUOTE CARD (tagline — the social sharing core) ============
  ctx.textAlign = 'left';
  const quoteText = `"${personality.tagline}"`;
  ctx.font = `600 17px ${FONT_SANS}`;
  const quoteW = CARD_WIDTH - 72;
  const quoteLines = wrapText(ctx, quoteText, quoteW - 32);
  const quoteH = Math.max(52, quoteLines.length * 26 + 20);
  fillRoundedRect(ctx, 36, y, quoteW, quoteH, 16, hexToRgba(personality.color, 0.06));
  strokeRoundedRect(ctx, 36, y, quoteW, quoteH, 16, hexToRgba(personality.color, 0.15));
  ctx.fillStyle = personality.color;
  ctx.font = `600 17px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  quoteLines.forEach((line, i) => {
    ctx.fillText(line, CARD_WIDTH / 2, y + 12 + i * 26);
  });
  ctx.textAlign = 'left';
  y += quoteH + 20;

  // ============ ★ DESCRIPTION (warm narrative, not data) ============
  drawDivider(ctx, y, hexToRgba(personality.color, 0.3));
  y += 16;

  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('ABOUT YOU', CARD_WIDTH / 2, y);
  y += 20;
  ctx.textAlign = 'left';

  const shortDesc = extractShortDesc(personality.description);
  ctx.fillStyle = DARK;
  ctx.font = `13.5px ${FONT_SANS}`;
  const descLines = wrapText(ctx, shortDesc, CARD_WIDTH - 80);
  const maxDescLines = Math.min(descLines.length, 8);
  for (let i = 0; i < maxDescLines; i++) {
    ctx.fillText(descLines[i], 40, y);
    y += 21;
  }
  y += 10;

  // ============ ★ COMPACT SPECTRUM (dot-matrix replacing bars) ============
  drawDivider(ctx, y, hexToRgba(personality.color, 0.3));
  y += 16;

  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('XP光谱', CARD_WIDTH / 2, y);
  y += 20;

  dimensionScores.forEach((score) => {
    const dim = XPTI_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) return;
    const color = XPTI_MODEL_COLORS[dim.model].base;

    // Pole labels on left & right
    ctx.font = `11px ${FONT_SANS}`;
    ctx.fillStyle = MED;
    ctx.textAlign = 'left';
    ctx.fillText(dim.poleALabel, 40, y);
    ctx.textAlign = 'right';
    ctx.fillText(dim.poleBLabel, CARD_WIDTH - 40, y);

    // Dot matrix: 5 dots
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

    ctx.textAlign = 'left';
    y += 28;
  });
  y += 8;

  // ============ TAGLINE (warm closing) ============
  drawDivider(ctx, y, hexToRgba(personality.color, 0.2));
  y += 14;

  ctx.fillStyle = MED;
  ctx.font = `italic 12px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(personality.tagline, CARD_WIDTH / 2, y);
  y += 28;
  ctx.textAlign = 'left';

  // ============ FOOTER ============
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
  ctx.fillText('测测你的恋爱XP体质？', 36, footerY + 12);

  ctx.fillStyle = personality.color;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(XPTI_SHARE_URL, 36, footerY + 34);

  // QR
  fillRoundedRect(ctx, CARD_WIDTH - 36 - 60, footerY + 4, 60, 60, 10, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_WIDTH - 36 - 56, footerY + 8, 52, 52);
  } else {
    fillRoundedRect(ctx, CARD_WIDTH - 36 - 52, footerY + 12, 44, 44, 6, DIV);
  }

  // ========== CROP to actual height & draw border ==========
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = CARD_WIDTH * CARD_SCALE;
  croppedCanvas.height = CARD_HEIGHT * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas context unavailable');
  cctx.drawImage(canvas, 0, 0);

  cctx.scale(CARD_SCALE, CARD_SCALE);
  strokeRoundedRect(cctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(personality.color, 0.25), 2.5);
  strokeRoundedRect(cctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(personality.color, 0.08), 1);

  // Corner ornaments
  cctx.fillStyle = hexToRgba(personality.color, 0.35);
  cctx.font = `14px ${FONT_SANS}`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'top';
  cctx.fillText('✦', 36, 28);
  cctx.fillText('✦', CARD_WIDTH - 36, 28);
  cctx.fillText('✦', 36, CARD_HEIGHT - 44);
  cctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  return croppedCanvas.toDataURL('image/png');
}

export const XptiShareImageGenerator = forwardRef<XptiShareImageGeneratorHandle, Props>(
  function XptiShareImageGenerator({ personality, dimensionScores }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderXptiShareImage(personality, dimensionScores);
        setPreviewUrl(dataUrl);
      } catch (e) {
        console.error('Share image generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [dimensionScores, generating, personality]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `XPTI-${personality.code}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `XPTI-${personality.code}.png` });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
        setSaveHint('请长按上方图片保存到相册。');
        return;
      }
      const link = document.createElement('a');
      link.download = `XPTI-${personality.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我的恋爱XP体质：${personality.name}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.name, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              📸 生成分享卡片
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
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
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
