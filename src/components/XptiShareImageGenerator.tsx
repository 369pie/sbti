'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { getXptiRarity, getXptiTypeImage } from '@/lib/xpti/personalities';
import type { XptiPersonalityType } from '@/lib/xpti/personalities';
import { XPTI_DIMENSIONS, XPTI_MODEL_COLORS } from '@/lib/xpti/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { XptiDimensionScore } from '@/lib/xpti/scoring';
import { resolveXptiShareCardPreset } from '@/lib/xpti/share-card-presets';
import type { XptiShareCardPresetId } from '@/lib/xpti/share-card-presets';

export interface XptiShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  personality: XptiPersonalityType;
  dimensionScores: XptiDimensionScore[];
  presetId?: XptiShareCardPresetId;
  subTheme?: string;
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

/** Extract the 翻译你的情欲图谱 section from xpti description */
function extractShortDesc(description: string): string {
  const sections = description.split(/【(.*?)】/).filter(Boolean);
  for (let i = 0; i < sections.length; i++) {
    if ((sections[i].includes('翻译你的情欲图谱') || sections[i].includes('翻译你的恋爱DNA')) && sections[i + 1]) {
      return sections[i + 1].trim();
    }
  }
  // Fallback: get early meaningful paragraphs
  const paragraphs = description.split('\n').filter(l => l.trim() && !l.startsWith('【') && !l.startsWith('✓'));
  return paragraphs.slice(0, 4).join('\n');
}

/** Draw a subtle left accent bar inside a panel */
function drawLeftAccent(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + h - 6);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.stroke();
}

async function renderXptiShareImage(
  personality: XptiPersonalityType,
  dimensionScores: XptiDimensionScore[],
  options?: { presetId?: XptiShareCardPresetId; subTheme?: string },
) {
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
  const preset = resolveXptiShareCardPreset(options);
  const BG = preset.background;
  const DEEP = preset.backgroundDeep;
  const DARK = preset.textStrong;
  const MED = preset.textBody;
  const LIGHT = preset.textMuted;
  const DIV = preset.divider;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  // ========== Sophisticated ambient wash (multiple gradients) ==========
  // Top-centered theme glow
  const washTop = ctx.createRadialGradient(CARD_WIDTH / 2, 220, 0, CARD_WIDTH / 2, 220, 480);
  washTop.addColorStop(0, hexToRgba(personality.color, 0.14));
  washTop.addColorStop(0.5, hexToRgba(personality.color, 0.05));
  washTop.addColorStop(1, hexToRgba(personality.color, 0));
  ctx.fillStyle = washTop;
  ctx.fillRect(0, 0, CARD_WIDTH, 720);

  // Bottom warm ambient glow
  const washBottom = ctx.createRadialGradient(CARD_WIDTH / 2, MAX_H, 0, CARD_WIDTH / 2, MAX_H, 500);
  washBottom.addColorStop(0, hexToRgba(preset.warmGlow, 0.04));
  washBottom.addColorStop(1, hexToRgba(preset.warmGlow, 0));
  ctx.fillStyle = washBottom;
  ctx.fillRect(0, MAX_H - 500, CARD_WIDTH, 500);

  // ========== Decorative top line (warm gold fade) ==========
  const lineY = 36;
  const lineGrad = ctx.createLinearGradient(60, 0, CARD_WIDTH - 60, 0);
  lineGrad.addColorStop(0, 'rgba(255,255,255,0)');
  lineGrad.addColorStop(0.2, hexToRgba(preset.warmGlow, 0.25));
  lineGrad.addColorStop(0.5, hexToRgba(preset.warmGlow, 0.4));
  lineGrad.addColorStop(0.8, hexToRgba(preset.warmGlow, 0.25));
  lineGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, lineY);
  ctx.lineTo(CARD_WIDTH - 60, lineY);
  ctx.stroke();

  let y = 54;

  // ── Magazine Header ──
  ctx.fillStyle = preset.headerTone;
  ctx.font = `500 11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText('XPTI · DESIRE ARCHETYPE', CARD_WIDTH / 2, y);
  ctx.letterSpacing = '0px';
  y += 22;

  // ============ HERO CHARACTER IMAGE (macOS-native layered depth) ============
  const avatarX = 44;
  const avatarW = CARD_WIDTH - 88;
  const avatarH = 460;

  // Outer ring shadow (Raycast-style double-ring containment)
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 1;
  ctx.shadowOffsetY = 0;
  fillRoundedRect(ctx, avatarX, y, avatarW, avatarH, 24, '#0F080C');
  ctx.restore();

  // Inner surface with inset top highlight (glass/metal effect)
  fillRoundedRect(ctx, avatarX + 1, y + 1, avatarW - 2, avatarH - 2, 23, preset.panelSurface);

  // Inset top highlight
  ctx.save();
  roundRectPath(ctx, avatarX + 1, y + 1, avatarW - 2, avatarH - 2, 23);
  ctx.clip();
  const insetGrad = ctx.createLinearGradient(0, y, 0, y + 60);
  insetGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
  insetGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = insetGrad;
  ctx.fillRect(avatarX + 1, y + 1, avatarW - 2, 80);
  ctx.restore();

  // Subtle theme glow behind the image
  ctx.save();
  ctx.shadowColor = hexToRgba(personality.color, 0.28);
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;
  roundRectPath(ctx, avatarX + 4, y + 4, avatarW - 8, avatarH - 8, 20);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fill();
  ctx.restore();

  // Frame stroke
  strokeRoundedRect(ctx, avatarX + 4, y + 4, avatarW - 8, avatarH - 8, 20, hexToRgba(personality.color, 0.35), 1.5);

  // Image clip
  if (personalityImage) {
    ctx.save();
    roundRectPath(ctx, avatarX + 6, y + 6, avatarW - 12, avatarH - 12, 18);
    ctx.clip();
    drawImageContain(ctx, personalityImage, avatarX + 6, y + 6, avatarW - 12, avatarH - 12);
    ctx.restore();
  } else {
    ctx.fillStyle = DARK;
    ctx.font = `140px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(personality.emoji, CARD_WIDTH / 2, y + 100);
    ctx.textAlign = 'left';
  }
  y += avatarH + 30;

  // ── Number ──
  ctx.textAlign = 'center';
  ctx.fillStyle = LIGHT;
  ctx.font = `12px ${FONT_MONO}`;
  ctx.letterSpacing = '1px';
  ctx.fillText(personality.number, CARD_WIDTH / 2, y);
  ctx.letterSpacing = '0px';
  y += 20;

  // ── Code (luxury serial style) ──
  ctx.fillStyle = personality.color;
  ctx.font = `700 34px ${FONT_MONO}`;
  ctx.letterSpacing = '5px';
  ctx.fillText(personality.code, CARD_WIDTH / 2, y);
  ctx.letterSpacing = '0px';
  y += 46;

  // ── Name ──
  ctx.fillStyle = DARK;
  ctx.font = `800 46px ${FONT_SANS}`;
  ctx.fillText(personality.name, CARD_WIDTH / 2, y);
  y += 56;

  // ── Tagline (primary quote, elegant italic) ──
  ctx.fillStyle = MED;
  ctx.font = `italic 16px ${FONT_SANS}`;
  ctx.letterSpacing = '0.3px';
  ctx.fillText(personality.tagline, CARD_WIDTH / 2, y);
  ctx.letterSpacing = '0px';
  y += 34;

  // ── Rarity badge (with glow) ──
  const rarity = getXptiRarity(personality.slug);
  const rarityText = `${rarity.tier === 'legendary' ? '✦ ' : rarity.tier === 'epic' ? '◆ ' : ''}${rarity.label} · 仅 ${rarity.populationPct}%`;
  ctx.font = `600 12px ${FONT_SANS}`;
  const rarityW = ctx.measureText(rarityText).width + 34;
  const rarityX = (CARD_WIDTH - rarityW) / 2;

  // Glow behind badge
  ctx.save();
  ctx.shadowColor = hexToRgba(rarity.color, 0.45);
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 0;
  fillRoundedRect(ctx, rarityX, y, rarityW, 30, 15, hexToRgba(rarity.color, 0.10));
  ctx.restore();

  strokeRoundedRect(ctx, rarityX, y, rarityW, 30, 15, hexToRgba(rarity.color, 0.50), 1.2);
  ctx.fillStyle = rarity.color;
  ctx.fillText(rarityText, CARD_WIDTH / 2, y + 8);
  y += 48;

  // ============ ★ QUOTE CARD (curated narrative with glass depth) ============
  const shortDesc = extractShortDesc(personality.description);
  const descSnippet = shortDesc.split(/\n|\r/).filter(l => l.trim().length > 10).slice(0, 2).join('\n');

  const quoteCardW = CARD_WIDTH - 72;
  ctx.font = `500 14px ${FONT_SANS}`;
  ctx.letterSpacing = '0.2px';
  const quoteLines = wrapText(ctx, descSnippet, quoteCardW - 48);
  ctx.letterSpacing = '0px';
  const quoteH = Math.max(68, quoteLines.length * 25 + 30);

  // Glass panel with subtle depth
  fillRoundedRect(ctx, 36, y, quoteCardW, quoteH, 16, hexToRgba(personality.color, 0.06));
  strokeRoundedRect(ctx, 36, y, quoteCardW, quoteH, 16, hexToRgba(personality.color, 0.20), 1);

  // Inset top highlight on quote card
  ctx.save();
  roundRectPath(ctx, 36, y, quoteCardW, quoteH, 16);
  ctx.clip();
  const cardInset = ctx.createLinearGradient(0, y, 0, y + 40);
  cardInset.addColorStop(0, 'rgba(255,255,255,0.04)');
  cardInset.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = cardInset;
  ctx.fillRect(36, y, quoteCardW, 50);
  ctx.restore();

  drawLeftAccent(ctx, 44, y + 10, quoteH - 20, hexToRgba(personality.color, 0.55));

  // Decorative opening quote
  ctx.fillStyle = hexToRgba(personality.color, 0.22);
  ctx.font = `600 24px ${FONT_SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('“', 56, y + 10);

  ctx.fillStyle = DARK;
  ctx.font = `500 14px ${FONT_SANS}`;
  ctx.letterSpacing = '0.2px';
  ctx.textAlign = 'center';
  quoteLines.forEach((line, i) => {
    ctx.fillText(line, CARD_WIDTH / 2, y + 24 + i * 25);
  });
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
  y += quoteH + 30;

  // ============ ★ PERSONALITY TAG CLOUD (pill badges) ============
  const highDims = dimensionScores
    .filter(s => s.level === 'H' || s.score >= 2.3)
    .slice(0, 4)
    .map(s => {
      const dim = XPTI_DIMENSIONS.find(d => d.id === s.id);
      return dim ? { label: dim.poleHighLabel, color: XPTI_MODEL_COLORS[dim.model].base } : null;
    })
    .filter(Boolean) as { label: string; color: string }[];

  if (highDims.length === 0) {
    const topDims = [...dimensionScores].sort((a, b) => b.score - a.score).slice(0, 3).map(s => {
      const dim = XPTI_DIMENSIONS.find(d => d.id === s.id);
      return dim ? { label: dim.poleHighLabel, color: XPTI_MODEL_COLORS[dim.model].base } : null;
    }).filter(Boolean) as { label: string; color: string }[];
    highDims.push(...topDims);
  }

  const tagHeight = 30;
  const tagGap = 10;
  const tagMaxW = CARD_WIDTH - 80;

  ctx.font = `600 12px ${FONT_SANS}`;
  const tagMetrics = highDims.map(d => {
    const w = ctx.measureText(d.label).width + 28;
    return { ...d, w };
  });

  const tagRows: { w: number; label: string; color: string }[][] = [[]];
  let currentRow = 0;
  let currentRowW = 0;
  for (const t of tagMetrics) {
    if (currentRowW > 0 && currentRowW + tagGap + t.w > tagMaxW) {
      currentRow++;
      tagRows[currentRow] = [];
      currentRowW = 0;
    }
    tagRows[currentRow].push(t);
    currentRowW += (currentRowW > 0 ? tagGap : 0) + t.w;
  }

  // Small label above tags
  ctx.textAlign = 'center';
  ctx.fillStyle = LIGHT;
  ctx.font = `10px ${FONT_MONO}`;
  ctx.letterSpacing = '1px';
  ctx.fillText('XP KEYWORDS', CARD_WIDTH / 2, y);
  ctx.letterSpacing = '0px';
  y += 20;

  let tagRowY = 0;
  for (let r = 0; r < tagRows.length; r++) {
    const row = tagRows[r];
    const rowW = row.reduce((sum, t, i) => sum + t.w + (i > 0 ? tagGap : 0), 0);
    const rowStartX = (CARD_WIDTH - rowW) / 2;
    let cx = rowStartX;
    for (const t of row) {
      // Pill badge with subtle surface
      fillRoundedRect(ctx, cx, y + tagRowY, t.w, tagHeight, 15, hexToRgba(t.color, 0.10));
      strokeRoundedRect(ctx, cx, y + tagRowY, t.w, tagHeight, 15, hexToRgba(t.color, 0.45), 1);
      ctx.fillStyle = t.color;
      ctx.font = `600 12px ${FONT_SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText(t.label, cx + t.w / 2, y + tagRowY + 8);
      cx += t.w + tagGap;
    }
    tagRowY += tagHeight + 10;
  }
  ctx.textAlign = 'left';
  y += tagRowY + 22;

  // ============ FOOTER (compact, elegant) ============
  const FOOTER_H = 86;
  const CARD_HEIGHT = y + FOOTER_H;
  const footerY = CARD_HEIGHT - FOOTER_H;

  // Gradient divider
  const divGrad = ctx.createLinearGradient(36, 0, CARD_WIDTH - 36, 0);
  divGrad.addColorStop(0, 'rgba(255,255,255,0)');
  divGrad.addColorStop(0.15, DIV);
  divGrad.addColorStop(0.85, DIV);
  divGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(36, footerY + 10);
  ctx.lineTo(CARD_WIDTH - 36, footerY + 10);
  ctx.stroke();

  // CTA text
  ctx.fillStyle = DARK;
  ctx.font = `600 13px ${FONT_SANS}`;
  ctx.letterSpacing = '0.2px';
  ctx.fillText('测测你的靠近方式', 36, footerY + 20);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = LIGHT;
  ctx.font = `10px ${FONT_MONO}`;
  ctx.letterSpacing = '0.5px';
  ctx.fillText(XPTI_SHARE_URL, 36, footerY + 36);
  ctx.letterSpacing = '0px';

  // QR
  const qrSize = 54;
  fillRoundedRect(ctx, CARD_WIDTH - 36 - qrSize, footerY + 12, qrSize, qrSize, 10, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_WIDTH - 36 - qrSize + 3, footerY + 15, qrSize - 6, qrSize - 6);
  } else {
    fillRoundedRect(ctx, CARD_WIDTH - 36 - qrSize + 6, footerY + 18, qrSize - 12, qrSize - 12, 6, DIV);
  }

  // ========== CROP to actual height & draw border ==========
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = CARD_WIDTH * CARD_SCALE;
  croppedCanvas.height = CARD_HEIGHT * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas context unavailable');
  cctx.drawImage(canvas, 0, 0);

  cctx.scale(CARD_SCALE, CARD_SCALE);

  // Outer frame: unified warm gold border (not personality green for some types)
  strokeRoundedRect(cctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(preset.warmGlow, 0.45), 2.5);
  // Inner subtle frame
  strokeRoundedRect(cctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(preset.warmGlow, 0.16), 1);

  // Corner ornaments — refined diamonds with warm glow
  cctx.fillStyle = hexToRgba(preset.warmGlow, 0.60);
  cctx.font = `11px ${FONT_SANS}`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'top';
  cctx.fillText('◆', 32, 24);
  cctx.fillText('◆', CARD_WIDTH - 32, 24);
  cctx.textBaseline = 'bottom';
  cctx.fillText('◆', 32, CARD_HEIGHT - 24);
  cctx.fillText('◆', CARD_WIDTH - 32, CARD_HEIGHT - 24);

  return croppedCanvas.toDataURL('image/png');
}

export const XptiShareImageGenerator = forwardRef<XptiShareImageGeneratorHandle, Props>(
  function XptiShareImageGenerator({ personality, dimensionScores, presetId, subTheme }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderXptiShareImage(personality, dimensionScores, { presetId, subTheme });
        setPreviewUrl(dataUrl);
      } catch (e) {
        console.error('Share image generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [dimensionScores, generating, personality, presetId, subTheme]);

    const preset = resolveXptiShareCardPreset({ presetId, subTheme });

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
          await navigator.share({ files: [file], title: `我的 XPTI 结果：${personality.name}` });
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
          className="w-full py-3.5 rounded-xl text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(90deg, ${preset.ctaGradientFrom}, ${preset.ctaGradientTo})` }}
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
                  className="flex-1 py-3 rounded-xl text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(90deg, ${preset.ctaGradientFrom}, ${preset.ctaGradientTo})` }}
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
