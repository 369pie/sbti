'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import QRCode from 'qrcode';
import { getLoveTypeImage, getLoveRarity } from '@/lib/love/personalities';
import type { LovePersonalityType } from '@/lib/love/personalities';
import { LOVE_DIMENSIONS, LOVE_MODEL_COLORS } from '@/lib/love/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { LoveDimensionScore } from '@/lib/love/scoring';

export interface LoveShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  personality: LovePersonalityType;
  dimensionScores: LoveDimensionScore[];
}

const CARD_WIDTH = 540;
const CARD_HEIGHT = 1060;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const LOVE_SHARE_URL = SHARE_SITE_URL + 'love/';

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

async function renderLoveShareImage(personality: LovePersonalityType, dimensionScores: LoveDimensionScore[]) {
  const [personalityImage, qrImage] = await Promise.all([
    getCachedImage(getLoveTypeImage(personality.slug)).catch(() => null),
    QRCode.toDataURL(LOVE_SHARE_URL, {
      width: 200, margin: 1, color: { dark: '#000000', light: '#ffffffff' }, errorCorrectionLevel: 'M',
    }).then(url => getCachedImage(url)).catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // ========== Cream background ==========
  const BG = '#FFF9F2';
  const DARK = '#2D2A26';
  const MED = '#6B6560';
  const DIV = '#e8e0d6';

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Subtle color wash
  const wash = ctx.createRadialGradient(270, 280, 0, 270, 280, 300);
  wash.addColorStop(0, hexToRgba(personality.color, 0.08));
  wash.addColorStop(1, hexToRgba(personality.color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 500);

  // Card border
  strokeRoundedRect(ctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(personality.color, 0.25), 2.5);
  strokeRoundedRect(ctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(personality.color, 0.08), 1);

  // Corner ornaments
  ctx.fillStyle = hexToRgba(personality.color, 0.35);
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 28);
  ctx.fillText('✦', CARD_WIDTH - 36, 28);
  ctx.fillText('✦', 36, CARD_HEIGHT - 44);
  ctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  // Header
  ctx.fillStyle = personality.color;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText('LPTI 恋爱人设报告', CARD_WIDTH / 2, 46);

  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('在恋爱人设测试里，我是这一挂', CARD_WIDTH / 2, 68);

  // ============ HERO CHARACTER IMAGE ============
  const avatarX = 60;
  const avatarY = 88;
  const avatarW = CARD_WIDTH - 120;
  const avatarH = 400;
  fillRoundedRect(ctx, avatarX, avatarY, avatarW, avatarH, 24, '#ffffff');
  strokeRoundedRect(ctx, avatarX, avatarY, avatarW, avatarH, 24, hexToRgba(personality.color, 0.25));
  if (personalityImage) {
    ctx.save();
    roundRectPath(ctx, avatarX + 4, avatarY + 4, avatarW - 8, avatarH - 8, 20);
    ctx.clip();
    drawImageContain(ctx, personalityImage, avatarX + 12, avatarY + 8, avatarW - 24, avatarH - 16);
    ctx.restore();
  } else {
    ctx.fillStyle = DARK;
    ctx.font = `140px ${FONT_SANS}`;
    ctx.fillText(personality.emoji, CARD_WIDTH / 2, avatarY + 70);
  }

  // Name
  const nameY = avatarY + avatarH + 16;
  ctx.fillStyle = DARK;
  ctx.font = `700 48px ${FONT_SANS}`;
  ctx.fillText(personality.name, CARD_WIDTH / 2, nameY);

  // Code
  ctx.fillStyle = personality.color;
  ctx.font = `600 18px ${FONT_MONO}`;
  ctx.fillText(personality.code, CARD_WIDTH / 2, nameY + 52);

  // Rarity pill
  const loveRarity = getLoveRarity(personality.slug);
  const rarityText = `${loveRarity.tier === 'legendary' ? '✦ ' : loveRarity.tier === 'epic' ? '◆ ' : ''}${loveRarity.label} · 仅 ${loveRarity.populationPct}% 的人`;
  ctx.font = `600 13px ${FONT_SANS}`;
  const rarityW = ctx.measureText(rarityText).width + 28;
  const rarityX = (CARD_WIDTH - rarityW) / 2;
  const rarityY = nameY + 78;
  fillRoundedRect(ctx, rarityX, rarityY, rarityW, 28, 14, hexToRgba(loveRarity.color, 0.12));
  strokeRoundedRect(ctx, rarityX, rarityY, rarityW, 28, 14, hexToRgba(loveRarity.color, 0.3));
  ctx.fillStyle = loveRarity.color;
  ctx.fillText(rarityText, CARD_WIDTH / 2, rarityY + 7);

  ctx.textAlign = 'left';

  // Tagline card
  const tagY = nameY + 108;
  const tagW = CARD_WIDTH - 72;
  fillRoundedRect(ctx, 36, tagY, tagW, 56, 16, hexToRgba(personality.color, 0.04));
  strokeRoundedRect(ctx, 36, tagY, tagW, 56, 16, hexToRgba(personality.color, 0.10));
  ctx.fillStyle = personality.color;
  ctx.font = `600 15px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(`"${personality.tagline}"`, CARD_WIDTH / 2, tagY + 18);
  ctx.textAlign = 'left';

  // Description
  const descY = tagY + 64;
  ctx.fillStyle = DARK;
  ctx.font = `14px ${FONT_SANS}`;
  const lines = wrapText(ctx, personality.description, CARD_WIDTH - 72, 3);
  lines.forEach((line, i) => ctx.fillText(line, 36, descY + i * 22));

  // Dimension bars
  const barY = descY + lines.length * 22 + 16;
  ctx.fillStyle = MED;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('五维画像', 36, barY);

  dimensionScores.forEach((score, i) => {
    const dim = LOVE_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) return;
    const color = LOVE_MODEL_COLORS[dim.model].base;
    const rowY = barY + 26 + i * 28;
    const barX = 120;
    const barW = 336;
    const pct = ((score.score - 1) / 2);
    const pw = Math.max(36, pct * barW);

    ctx.fillStyle = DARK;
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(dim.name, 36, rowY);

    fillRoundedRect(ctx, barX, rowY + 6, barW, 8, 999, DIV);
    fillRoundedRect(ctx, barX, rowY + 6, pw, 8, 999, color);

    ctx.fillStyle = color;
    ctx.font = `600 13px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(score.level, 492, rowY);
    ctx.textAlign = 'left';
  });

  // Footer (compact, from bottom)
  const footerY = CARD_HEIGHT - 98;
  ctx.strokeStyle = DIV;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(CARD_WIDTH - 36, footerY);
  ctx.stroke();

  // CTA
  ctx.fillStyle = DARK;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.fillText('测测你是哪张恋爱人设？', 36, footerY + 14);

  ctx.fillStyle = personality.color;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(LOVE_SHARE_URL, 36, footerY + 36);

  // QR
  fillRoundedRect(ctx, CARD_WIDTH - 36 - 72, footerY + 4, 72, 72, 12, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_WIDTH - 36 - 68, footerY + 8, 64, 64);
  } else {
    fillRoundedRect(ctx, CARD_WIDTH - 36 - 64, footerY + 12, 56, 56, 8, DIV);
  }

  return canvas.toDataURL('image/png');
}

export const LoveShareImageGenerator = forwardRef<LoveShareImageGeneratorHandle, Props>(
  function LoveShareImageGenerator({ personality, dimensionScores }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderLoveShareImage(personality, dimensionScores);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [dimensionScores, generating, personality]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `LPTI-${personality.code}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `LPTI-${personality.code}.png` });
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
      link.download = `LPTI-${personality.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我的恋爱人设：${personality.name}` });
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
          className="w-full py-3.5 rounded-xl bg-pink-500 text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="flex-1 py-3 rounded-xl bg-pink-500 text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
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
