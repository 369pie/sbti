'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import QRCode from 'qrcode';
import { getXptiRarity } from '@/lib/xpti/personalities';
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
const CARD_HEIGHT = 960;
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

async function renderXptiShareImage(personality: XptiPersonalityType, dimensionScores: XptiDimensionScore[]) {
  const qrImage = await QRCode.toDataURL(XPTI_SHARE_URL, {
    width: 200, margin: 1, color: { dark: '#000000', light: '#ffffffff' }, errorCorrectionLevel: 'M',
  }).then(url => getCachedImage(url)).catch(() => null);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // ========== Cream background ==========
  const BG = '#FFF5F7';
  const DARK = '#2D2236';
  const MED = '#6B5F72';
  const DIV = '#e8dce6';

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Subtle gradient wash
  const wash = ctx.createRadialGradient(270, 200, 0, 270, 200, 300);
  wash.addColorStop(0, hexToRgba(personality.color, 0.1));
  wash.addColorStop(1, hexToRgba(personality.color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 400);

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
  ctx.fillText('XPTI 恋爱XP体质报告', CARD_WIDTH / 2, 46);

  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('MBTI测你是什么人，XPTI测你爱上什么人', CARD_WIDTH / 2, 68);

  // ============ BIG EMOJI ============
  ctx.font = `120px ${FONT_SANS}`;
  ctx.fillText(personality.emoji, CARD_WIDTH / 2, 110);

  // Number + Code
  const codeY = 260;
  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_MONO}`;
  ctx.fillText(personality.number, CARD_WIDTH / 2, codeY);

  ctx.fillStyle = personality.color;
  ctx.font = `700 28px ${FONT_MONO}`;
  ctx.fillText(personality.code, CARD_WIDTH / 2, codeY + 22);

  // Name
  ctx.fillStyle = DARK;
  ctx.font = `700 42px ${FONT_SANS}`;
  ctx.fillText(personality.name, CARD_WIDTH / 2, codeY + 62);

  // Rarity pill
  const rarity = getXptiRarity(personality.slug);
  const rarityText = `${rarity.tier === 'legendary' ? '✦ ' : rarity.tier === 'epic' ? '◆ ' : ''}${rarity.label} · 仅 ${rarity.populationPct}% 的人`;
  ctx.font = `600 13px ${FONT_SANS}`;
  const rarityW = ctx.measureText(rarityText).width + 28;
  const rarityX = (CARD_WIDTH - rarityW) / 2;
  const rarityY = codeY + 116;
  fillRoundedRect(ctx, rarityX, rarityY, rarityW, 28, 14, hexToRgba(rarity.color, 0.12));
  strokeRoundedRect(ctx, rarityX, rarityY, rarityW, 28, 14, hexToRgba(rarity.color, 0.3));
  ctx.fillStyle = rarity.color;
  ctx.fillText(rarityText, CARD_WIDTH / 2, rarityY + 7);

  // Tagline card
  const tagY = rarityY + 40;
  const tagW = CARD_WIDTH - 72;
  fillRoundedRect(ctx, 36, tagY, tagW, 52, 16, hexToRgba(personality.color, 0.05));
  strokeRoundedRect(ctx, 36, tagY, tagW, 52, 16, hexToRgba(personality.color, 0.12));
  ctx.fillStyle = personality.color;
  ctx.font = `600 15px ${FONT_SANS}`;
  ctx.fillText(`"${personality.tagline}"`, CARD_WIDTH / 2, tagY + 16);

  ctx.textAlign = 'left';

  // ============ 4-AXIS BARS ============
  const barSectionY = tagY + 68;
  ctx.fillStyle = MED;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('四轴画像', 36, barSectionY);

  dimensionScores.forEach((score, i) => {
    const dim = XPTI_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) return;
    const color = XPTI_MODEL_COLORS[dim.model].base;
    const rowY = barSectionY + 28 + i * 52;

    // Pole labels
    ctx.fillStyle = MED;
    ctx.font = `11px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${dim.poleA} ${dim.poleALabel}`, 36, rowY);
    ctx.textAlign = 'right';
    ctx.fillText(`${dim.poleBLabel} ${dim.poleB}`, CARD_WIDTH - 36, rowY);

    // Bar background
    const barX = 36;
    const barW = CARD_WIDTH - 72;
    const barY = rowY + 20;
    fillRoundedRect(ctx, barX, barY, barW, 10, 5, DIV);

    // Filled bar
    const pct = ((score.score - 1) / 2);
    const pw = Math.max(36, pct * barW);
    fillRoundedRect(ctx, barX, barY, pw, 10, 5, color);

    // Level indicator
    ctx.fillStyle = color;
    ctx.font = `600 11px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText(score.level, barX + pw, barY + 18);

    ctx.textAlign = 'left';
  });

  // ============ FOOTER ============
  const footerY = barSectionY + 28 + dimensionScores.length * 52 + 16;
  ctx.strokeStyle = DIV;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(CARD_WIDTH - 36, footerY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `600 15px ${FONT_SANS}`;
  ctx.fillText('测测你的恋爱XP体质？', 36, footerY + 18);

  ctx.fillStyle = personality.color;
  ctx.font = `12px ${FONT_MONO}`;
  ctx.fillText(XPTI_SHARE_URL, 36, footerY + 46);

  // QR
  fillRoundedRect(ctx, 424, footerY + 8, 80, 80, 12, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, 428, footerY + 12, 72, 72);
  } else {
    fillRoundedRect(ctx, 432, footerY + 16, 64, 64, 8, DIV);
  }

  return canvas;
}

export const XptiShareImageGenerator = forwardRef<XptiShareImageGeneratorHandle, Props>(
  function XptiShareImageGenerator({ personality, dimensionScores }, ref) {
    const [generating, setGenerating] = useState(false);

    const generate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      try {
        const canvas = await renderXptiShareImage(personality, dimensionScores);
        const blob = await new Promise<Blob | null>(resolve =>
          canvas.toBlob(resolve, 'image/png')
        );
        if (!blob) throw new Error('Failed to create image');

        // Try native share on mobile
        if (isMobile() && navigator.share) {
          try {
            const file = new File([blob], `xpti-${personality.code}.png`, { type: 'image/png' });
            await navigator.share({ files: [file] });
            return;
          } catch { /* fallback to download */ }
        }

        // Download fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xpti-${personality.code}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } catch (e) {
        console.error('Share image generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [generating, personality, dimensionScores]);

    useImperativeHandle(ref, () => ({ generate }), [generate]);

    return (
      <button
        onClick={generate}
        disabled={generating}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {generating ? '生成中…' : '📸 生成分享卡片'}
      </button>
    );
  }
);
