'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { getSoultiRarity, getSoultiResonance, getSoultiPersonalityBySlug, getSoultiTypeMediumImage } from '@/lib/soulti/personalities';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import { SOULTI_DIMENSIONS, SOULTI_MODEL_COLORS } from '@/lib/soulti/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { SoultiDimensionScore } from '@/lib/soulti/scoring';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';

export interface SoultiShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  personality: SoultiPersonalityType;
  dimensionScores: SoultiDimensionScore[];
}

const CARD_WIDTH = 540;
const CARD_SCALE = 2;
const PAD = 40;
const CONTENT_W = CARD_WIDTH - PAD * 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';
const FONT_SERIF = 'Georgia, "Noto Serif SC", "Songti SC", serif';

const SOULTI_SHARE_URL = SHARE_SITE_URL + 'soulti/';

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

/** Wrap text into multi-line, returns array of lines */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  // Split by explicit newlines first
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

/** Draw a thin horizontal divider line */
function drawDivider(ctx: CanvasRenderingContext2D, y: number, color: string, cx = CARD_WIDTH / 2, halfW = 60) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, y);
  ctx.lineTo(cx + halfW, y);
  ctx.stroke();
}

async function renderSoultiShareImage(personality: SoultiPersonalityType, dimensionScores: SoultiDimensionScore[]) {
  const resonance = getSoultiResonance(personality.slug);
  const rarity = getSoultiRarity(personality.slug);
  const mirrorType = resonance ? getSoultiPersonalityBySlug(resonance.mirrorSlug) : undefined;
  const oppositeType = resonance ? getSoultiPersonalityBySlug(resonance.oppositeSlug) : undefined;

  // Parse description sections
  const descSections = personality.description.split(/【(.*?)】/).filter(Boolean);
  const parsedSections: { title: string; content: string }[] = [];
  for (let i = 0; i < descSections.length; i += 2) {
    if (i + 1 < descSections.length) {
      parsedSections.push({ title: descSections[i], content: descSections[i + 1].trim() });
    }
  }

  const qrImage = await toQrDataUrl(SOULTI_SHARE_URL, {
    width: 200, margin: 1, color: { dark: '#000000', light: '#ffffffff' }, errorCorrectionLevel: 'M',
  }).then(url => getCachedImage(url)).catch(() => null);
  const portraitImage = await getCachedImage(getSoultiTypeMediumImage(personality.slug)).catch(() => null);

  const BG = '#FAF8F5';
  const DARK = '#1F1A16';
  const MED = '#5B524B';
  const LIGHT = '#9A908A';
  const DIV_COLOR = hexToRgba(personality.color, 0.15);

  // ── Render to oversized canvas, then crop to actual content height ──
  const MAX_H = 4000;
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = CARD_WIDTH * CARD_SCALE;
  tmpCanvas.height = MAX_H * CARD_SCALE;
  const ctx = tmpCanvas.getContext('2d')!;
  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // Fill background (will be cropped later)
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  // Subtle gradient wash
  const wash = ctx.createRadialGradient(270, 180, 0, 270, 180, 280);
  wash.addColorStop(0, hexToRgba(personality.color, 0.06));
  wash.addColorStop(1, hexToRgba(personality.color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 360);

  let y = 0;

  // ─── HEADER ───
  y += 32;
  ctx.textAlign = 'left';
  ctx.fillStyle = LIGHT;
  ctx.font = `italic 11px ${FONT_SERIF}`;
  ctx.fillText('SoulTI', PAD, y);
  ctx.textAlign = 'right';
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(`${personality.number} / 32`, CARD_WIDTH - PAD, y);
  y += 28;

  ctx.textAlign = 'center';
  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_SERIF}`;
  ctx.fillText('你的自然人格是', CARD_WIDTH / 2, y);
  y += 36;

  // ─── TYPE CODE ───
  const spacedCode = personality.code.split('').join('  ·  ');
  ctx.fillStyle = personality.color;
  ctx.font = `42px ${FONT_SERIF}`;
  ctx.fillText(spacedCode, CARD_WIDTH / 2, y);
  y += 64;

  // ─── PORTRAIT ───
  const portraitSize = 164;
  const portraitX = (CARD_WIDTH - portraitSize) / 2;
  fillRoundedRect(ctx, portraitX, y, portraitSize, portraitSize, 16, hexToRgba(personality.color, 0.08));
  strokeRoundedRect(ctx, portraitX, y, portraitSize, portraitSize, 16, hexToRgba(personality.color, 0.22));
  if (portraitImage) {
    ctx.save();
    roundRectPath(ctx, portraitX, y, portraitSize, portraitSize, 16);
    ctx.clip();
    drawImageContain(ctx, portraitImage, portraitX + 10, y + 10, portraitSize - 20, portraitSize - 20);
    ctx.restore();
  } else {
    ctx.fillStyle = personality.color;
    ctx.font = `56px ${FONT_SERIF}`;
    ctx.fillText(personality.emoji, CARD_WIDTH / 2, y + 48);
  }
  y += portraitSize + 18;

  ctx.fillStyle = hexToRgba(LIGHT, 0.6);
  ctx.font = `italic 10px ${FONT_SERIF}`;
  ctx.fillText('— 向内探索 · 自然人格', CARD_WIDTH / 2, y);
  y += 26;

  // ─── CHINESE NAME ───
  ctx.fillStyle = DARK;
  ctx.font = `28px ${FONT_SERIF}`;
  ctx.fillText(personality.name, CARD_WIDTH / 2, y);
  y += 34;

  // Rarity pill
  const rarityText = `${rarity.tier === 'legendary' ? '✦ ' : rarity.tier === 'epic' ? '◆ ' : ''}${rarity.label} · ${rarity.populationPct}%`;
  ctx.font = `11px ${FONT_SANS}`;
  const rarityW = ctx.measureText(rarityText).width + 22;
  const rarityX = (CARD_WIDTH - rarityW) / 2;
  fillRoundedRect(ctx, rarityX, y, rarityW, 24, 12, hexToRgba(rarity.color, 0.1));
  ctx.fillStyle = rarity.color;
  ctx.fillText(rarityText, CARD_WIDTH / 2, y + 6);
  y += 36;

  // Divider
  drawDivider(ctx, y, DIV_COLOR);
  y += 20;

  // ─── QUOTE ───
  if (resonance) {
    ctx.fillStyle = hexToRgba(DARK, 0.7);
    ctx.font = `italic 15px ${FONT_SERIF}`;
    const quoteLines = wrapText(ctx, `"${resonance.quote}"`, CONTENT_W - 40);
    for (const line of quoteLines) {
      ctx.fillText(line, CARD_WIDTH / 2, y);
      y += 26;
    }
    y += 8;
    ctx.fillStyle = hexToRgba(LIGHT, 0.6);
    ctx.font = `italic 10px ${FONT_SERIF}`;
    ctx.fillText(`— ${resonance.quoteSource}`, CARD_WIDTH / 2, y);
    y += 22;
    y += 16;
    drawDivider(ctx, y, DIV_COLOR);
    y += 20;
  }

  // ─── PERSONA ───
  ctx.textAlign = 'left';
  ctx.fillStyle = hexToRgba(LIGHT, 0.5);
  ctx.font = `10px ${FONT_SERIF}`;
  ctx.fillText('PERSONA', PAD, y);
  y += 28;

  for (const sec of parsedSections) {
    ctx.fillStyle = personality.color;
    ctx.font = `13px ${FONT_SERIF}`;
    ctx.fillText(sec.title, PAD, y);
    y += 22;

    ctx.fillStyle = hexToRgba(DARK, 0.65);
    ctx.font = `13px ${FONT_SANS}`;
    const lines = wrapText(ctx, sec.content, CONTENT_W);
    for (const line of lines) {
      ctx.fillText(line, PAD, y);
      y += 22;
    }
    y += 16;
  }

  // ─── TAGS ───
  if (resonance) {
    y += 4;
    let tagX = PAD;
    ctx.font = `11px ${FONT_SANS}`;
    for (const tag of resonance.tags) {
      const tw = ctx.measureText(tag).width + 16;
      if (tagX + tw > CARD_WIDTH - PAD) { tagX = PAD; y += 28; }
      fillRoundedRect(ctx, tagX, y, tw, 24, 12, hexToRgba(personality.color, 0.06));
      strokeRoundedRect(ctx, tagX, y, tw, 24, 12, hexToRgba(personality.color, 0.2));
      ctx.fillStyle = personality.color;
      ctx.textAlign = 'center';
      ctx.fillText(tag, tagX + tw / 2, y + 6);
      ctx.textAlign = 'left';
      tagX += tw + 8;
    }
    y += 36;
  }

  // ─── SOUL RESONANCE dark card ───
  if (resonance) {
    y += 8;
    const cardX = PAD - 4;
    const cardW = CONTENT_W + 8;
    const cardPad = 24;

    // Measure soul description height
    ctx.font = `12.5px ${FONT_SANS}`;
    const soulLines = wrapText(ctx, resonance.soulOrigin.description, cardW - cardPad * 2);
    const soulCardH = 20 + 32 + 6 + 20 + 16 + 12 + soulLines.length * 22 + 24;

    fillRoundedRect(ctx, cardX, y, cardW, soulCardH, 16, '#1C1B19');

    let sy = y + 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = `9px ${FONT_SERIF}`;
    ctx.fillText('SOUL RESONANCE · 灵魂共振', cardX + cardPad, sy);
    sy += 28;

    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = `22px ${FONT_SERIF}`;
    ctx.fillText(resonance.soulOrigin.name, cardX + cardPad, sy);
    sy += 30;

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = `14px ${FONT_SERIF}`;
    ctx.fillText(resonance.soulOrigin.zhName, cardX + cardPad, sy);
    sy += 22;

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = `italic 10px ${FONT_SERIF}`;
    ctx.fillText(resonance.soulOrigin.era, cardX + cardPad, sy);
    sy += 22;

    ctx.fillStyle = 'rgba(255,255,255,0.48)';
    ctx.font = `12.5px ${FONT_SANS}`;
    for (const line of soulLines) {
      ctx.fillText(line, cardX + cardPad, sy);
      sy += 22;
    }

    y += soulCardH + 20;
  }

  // ─── DIMENSION BARS ───
  ctx.textAlign = 'left';
  ctx.fillStyle = hexToRgba(LIGHT, 0.5);
  ctx.font = `10px ${FONT_SERIF}`;
  ctx.fillText(`${personality.code} · 五轴画像`, PAD, y);
  y += 24;

  for (const score of dimensionScores) {
    const dim = SOULTI_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) continue;
    const color = SOULTI_MODEL_COLORS[dim.model].base;

    ctx.fillStyle = MED;
    ctx.font = `10px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${dim.poleA} ${dim.poleALabel}`, PAD, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${dim.poleBLabel} ${dim.poleB}`, CARD_WIDTH - PAD, y);
    y += 16;

    // Bar bg
    fillRoundedRect(ctx, PAD, y, CONTENT_W, 8, 4, hexToRgba(LIGHT, 0.15));
    // Bar fill
    const pct = ((score.score - 1) / 2);
    fillRoundedRect(ctx, PAD, y, Math.max(28, pct * CONTENT_W), 8, 4, color);
    y += 14;

    ctx.fillStyle = color;
    ctx.font = `10px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText(score.level, PAD + Math.max(28, pct * CONTENT_W), y);
    y += 20;

    ctx.textAlign = 'left';
  }
  y += 8;

  // ─── MIRROR & OPPOSITE ───
  if (mirrorType || oppositeType) {
    const halfW = (CONTENT_W - 12) / 2;
    const cardH = 60;

    if (mirrorType) {
      const cx = PAD;
      fillRoundedRect(ctx, cx, y, halfW, cardH, 12, '#FDFCFA');
      strokeRoundedRect(ctx, cx, y, halfW, cardH, 12, hexToRgba(personality.color, 0.12));
      ctx.fillStyle = hexToRgba(LIGHT, 0.4);
      ctx.font = `8px ${FONT_SERIF}`;
      ctx.textAlign = 'left';
      ctx.fillText('your mirror · 镜像', cx + 14, y + 10);
      ctx.fillStyle = mirrorType.color;
      ctx.font = `12px ${FONT_SERIF}`;
      ctx.fillText(mirrorType.code, cx + 14, y + 28);
      ctx.fillStyle = DARK;
      ctx.font = `13px ${FONT_SERIF}`;
      ctx.fillText(mirrorType.name, cx + 14, y + 42);
    }

    if (oppositeType) {
      const cx = PAD + halfW + 12;
      fillRoundedRect(ctx, cx, y, halfW, cardH, 12, '#FDFCFA');
      strokeRoundedRect(ctx, cx, y, halfW, cardH, 12, hexToRgba(personality.color, 0.12));
      ctx.fillStyle = hexToRgba(LIGHT, 0.4);
      ctx.font = `8px ${FONT_SERIF}`;
      ctx.textAlign = 'left';
      ctx.fillText('your opposite · 反面', cx + 14, y + 10);
      ctx.fillStyle = oppositeType.color;
      ctx.font = `12px ${FONT_SERIF}`;
      ctx.fillText(oppositeType.code, cx + 14, y + 28);
      ctx.fillStyle = DARK;
      ctx.font = `13px ${FONT_SERIF}`;
      ctx.fillText(oppositeType.name, cx + 14, y + 42);
    }
    y += cardH + 20;
  }

  // ─── POETIC CLOSING ───
  ctx.textAlign = 'center';
  drawDivider(ctx, y, DIV_COLOR, CARD_WIDTH / 2, 40);
  y += 12;
  ctx.fillStyle = hexToRgba(LIGHT, 0.5);
  ctx.font = `italic 11px ${FONT_SERIF}`;
  ctx.fillText('探索不是为了改变你，而是让你看见——你已经是了。', CARD_WIDTH / 2, y);
  y += 20;

  // ─── FOOTER ───
  ctx.strokeStyle = hexToRgba(LIGHT, 0.15);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CARD_WIDTH - PAD, y);
  ctx.stroke();
  y += 10;

  const qrSize = 44;
  const qrX = CARD_WIDTH - PAD - qrSize;
  fillRoundedRect(ctx, qrX, y, qrSize, qrSize, 8, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, qrX + 4, y + 4, qrSize - 8, qrSize - 8);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = DARK;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('来探寻你的灵魂人格？', PAD, y + 6);

  ctx.fillStyle = personality.color;
  ctx.font = `10px ${FONT_MONO}`;
  ctx.fillText(SOULTI_SHARE_URL, PAD, y + 26);

  // Final y = bottom of QR + small padding
  y += qrSize + 16;

  // ── Crop: copy rendered content to a correctly-sized canvas ──
  const CARD_HEIGHT = y;
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = CARD_WIDTH * CARD_SCALE;
  finalCanvas.height = CARD_HEIGHT * CARD_SCALE;
  const fCtx = finalCanvas.getContext('2d')!;

  // Copy pixel data from oversized canvas
  fCtx.drawImage(tmpCanvas, 0, 0);

  // Draw border on final canvas (needs correct height)
  fCtx.scale(CARD_SCALE, CARD_SCALE);
  strokeRoundedRect(fCtx, 10, 10, CARD_WIDTH - 20, CARD_HEIGHT - 20, 20, hexToRgba(personality.color, 0.15), 1.5);

  return finalCanvas.toDataURL('image/png');
}

export const SoultiShareImageGenerator = forwardRef<SoultiShareImageGeneratorHandle, Props>(
  function SoultiShareImageGenerator({ personality, dimensionScores }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({
      resourceId: `soulti:${personality.code}`,
      universe: 'soulti',
    });

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderSoultiShareImage(personality, dimensionScores);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#FFF9F2', 'SOULTI');
        setPreviewUrl(finalUrl);
      } catch (e) {
        console.error('Share image generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [generating, personality, dimensionScores, tierCtl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `soulti-${personality.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择“保存到照片”或“存储到文件”。');
            await navigator.share({ files: [file], title: `soulti-${personality.code}.png` });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
        setSaveHint('请长按上方图片保存到相册。');
        return;
      }
      const link = document.createElement('a');
      link.download = `soulti-${personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我的自然人格：${personality.name}` });
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
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-stone-600 to-amber-700 text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          >
            {/* Sticky close button */}
            <div className="flex-none flex justify-end px-4 pt-3 pb-1">
              <button
                onClick={() => setPreviewUrl(null)}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="关闭"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable image area */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-4"
              onClick={e => { if (e.target === e.currentTarget) setPreviewUrl(null); }}
            >
              <div
                className="w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
              >
                <div className={`rounded-2xl overflow-hidden shadow-2xl ${tierCtl.tierTokens.containerClass}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="分享图片" className="w-full" />
                </div>
              </div>
            </div>

            {/* Sticky bottom buttons */}
            <div
              className="flex-none px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] max-w-sm mx-auto w-full"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-center text-xs text-white/50 mb-2 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-amber-400 mb-2 px-4 leading-5">
                  {saveHint}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl border border-white/30 text-sm text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  保存图片
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-stone-600 to-amber-700 text-sm text-white hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  分享给朋友
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
