'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { getCptiRarity, getCptiTypeThumbnailImage } from '@/lib/cpti/personalities';
import type { CptiPersonalityType } from '@/lib/cpti/personalities';
import { CPTI_DIMENSIONS, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';
import type { CptiDimensionScore } from '@/lib/cpti/scoring';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';

export interface CptiShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  personality: CptiPersonalityType;
  dimensionScores: CptiDimensionScore[];
}

const CARD_WIDTH = 540;
const MAX_H = 4000;
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines?: number) {
  const lines: string[] = [];
  let idx = 0;
  while (idx < text.length && (!maxLines || lines.length < maxLines)) {
    let line = '';
    while (idx < text.length) {
      const char = text[idx];
      if (char === '\n') { idx++; break; }
      const candidate = line + char;
      if (line && ctx.measureText(candidate).width > maxWidth) break;
      line = candidate;
      idx++;
    }
    if (line) lines.push(line.trimStart());
  }
  if (maxLines && idx < text.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

function extractShortDesc(description: string): string {
  const paragraphs = description.split('\n').filter(l => l.trim() && !l.startsWith('【') && !l.startsWith('✓') && !l.startsWith('最佳') && !l.startsWith('最搭') && !l.startsWith('离远'));
  return paragraphs.slice(0, 4).join('\n');
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, color: string) {
  const cx = CARD_WIDTH / 2;
  const grad = ctx.createLinearGradient(cx - 90, 0, cx + 90, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.3, color);
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 0.8;
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

async function renderCptiShareImage(personality: CptiPersonalityType, dimensionScores: CptiDimensionScore[]) {
  const qrImage = await toQrDataUrl(CPTI_SHARE_URL, {
    width: 200, margin: 1, color: { dark: '#000000', light: '#ffffffff' }, errorCorrectionLevel: 'M',
  }).then(url => getCachedImage(url)).catch(() => null);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = MAX_H * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  const BG = '#FAF8F5';
  const DARK = '#1F1A16';
  const MED = '#5B524B';
  const LIGHT = '#9A908A';
  const DIV = '#E3DCD1';

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, MAX_H);

  const wash = ctx.createRadialGradient(270, 200, 0, 270, 200, 280);
  wash.addColorStop(0, hexToRgba(personality.color, 0.1));
  wash.addColorStop(1, hexToRgba(personality.color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 400);

  let y = 46;

  // ── Header ──
  ctx.textAlign = 'center';
  ctx.fillStyle = personality.color;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText('CPTI CP角色鉴定报告', CARD_WIDTH / 2, y);
  y += 22;
  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText('在CP角色鉴定里，我是这一挂', CARD_WIDTH / 2, y);
  y += 28;
  ctx.textAlign = 'left';

  // ── Thumbnail Avatar (try real image first, fallback to emoji) ──
  const avatarSize = 200;
  const avatarX = (CARD_WIDTH - avatarSize) / 2;
  let avatarLoaded = false;
  try {
    const thumbImg = await getCachedImage(getCptiTypeThumbnailImage(personality.slug)).catch(() => null);
    if (thumbImg && thumbImg.naturalWidth > 0) {
      fillRoundedRect(ctx, avatarX, y, avatarSize, avatarSize, 32, hexToRgba(personality.color, 0.08));
      strokeRoundedRect(ctx, avatarX, y, avatarSize, avatarSize, 32, hexToRgba(personality.color, 0.2));
      drawImageContain(ctx, thumbImg, avatarX, y, avatarSize, avatarSize);
      avatarLoaded = true;
    }
  } catch { /* use emoji fallback */ }

  if (!avatarLoaded) {
    fillRoundedRect(ctx, avatarX, y, avatarSize, avatarSize, 32, hexToRgba(personality.color, 0.08));
    strokeRoundedRect(ctx, avatarX, y, avatarSize, avatarSize, 32, hexToRgba(personality.color, 0.2));
    ctx.fillStyle = DARK;
    ctx.font = `120px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(personality.emoji, CARD_WIDTH / 2, y + 30);
    ctx.textAlign = 'left';
  }
  y += avatarSize + 20;

  // ── Name + Code ──
  ctx.textAlign = 'center';
  ctx.fillStyle = DARK;
  ctx.font = `700 48px ${FONT_SANS}`;
  ctx.fillText(personality.name, CARD_WIDTH / 2, y);
  y += 56;

  ctx.fillStyle = personality.color;
  ctx.font = `600 18px ${FONT_MONO}`;
  ctx.fillText(personality.code, CARD_WIDTH / 2, y);
  y += 30;

  // Rarity pill
  const rarity = getCptiRarity(personality.slug);
  const rarityText = `${rarity.tier === 'legendary' ? '✦ ' : rarity.tier === 'epic' ? '◆ ' : ''}${rarity.label} · 仅 ${rarity.populationPct}% 的人`;
  ctx.font = `600 13px ${FONT_SANS}`;
  const rarityW = ctx.measureText(rarityText).width + 28;
  const rarityX = (CARD_WIDTH - rarityW) / 2;
  fillRoundedRect(ctx, rarityX, y, rarityW, 28, 14, hexToRgba(rarity.color, 0.12));
  strokeRoundedRect(ctx, rarityX, y, rarityW, 28, 14, hexToRgba(rarity.color, 0.3));
  ctx.fillStyle = rarity.color;
  ctx.fillText(rarityText, CARD_WIDTH / 2, y + 7);
  y += 40;

  // ── Quote Card ──
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

  // ── Description ──
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

  // ── Compact Spectrum Dots ──
  drawDivider(ctx, y, hexToRgba(personality.color, 0.3));
  y += 16;
  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('关系光谱', CARD_WIDTH / 2, y);
  y += 20;

  dimensionScores.forEach((score) => {
    const dim = CPTI_DIMENSIONS.find(d => d.id === score.id);
    if (!dim) return;
    const color = CPTI_MODEL_COLORS[dim.model].base;

    ctx.font = `11px ${FONT_SANS}`;
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
    ctx.font = `600 11px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(score.level, CARD_WIDTH - 40, y);
    ctx.textAlign = 'left';
    y += 24;
  });
  y += 12;

  // ── Closing divider ──
  drawDivider(ctx, y, hexToRgba(personality.color, 0.2));
  y += 28;

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
  ctx.fillText('测测你是哪种CP角色？', 36, footerY + 12);
  ctx.fillStyle = personality.color;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(CPTI_SHARE_URL, 36, footerY + 34);

  fillRoundedRect(ctx, CARD_WIDTH - 36 - 60, footerY + 4, 60, 60, 10, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, CARD_WIDTH - 36 - 56, footerY + 8, 52, 52);
  } else {
    fillRoundedRect(ctx, CARD_WIDTH - 36 - 52, footerY + 12, 44, 44, 6, DIV);
  }

  // ── Crop & decorative border ──
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = CARD_WIDTH * CARD_SCALE;
  croppedCanvas.height = CARD_HEIGHT * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas context unavailable');
  cctx.drawImage(canvas, 0, 0);
  cctx.scale(CARD_SCALE, CARD_SCALE);
  strokeRoundedRect(cctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(personality.color, 0.25), 2.5);
  strokeRoundedRect(cctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(personality.color, 0.08), 1);
  cctx.fillStyle = hexToRgba(personality.color, 0.35);
  cctx.font = `14px ${FONT_SANS}`;
  cctx.textAlign = 'center';
  cctx.textBaseline = 'top';
  cctx.fillText('♡', 36, 28);
  cctx.fillText('♡', CARD_WIDTH - 36, 28);
  cctx.fillText('♡', 36, CARD_HEIGHT - 44);
  cctx.fillText('♡', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  return croppedCanvas.toDataURL('image/png');
}

export const CptiShareImageGenerator = forwardRef<CptiShareImageGeneratorHandle, Props>(
  function CptiShareImageGenerator({ personality, dimensionScores }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({
      resourceId: `cpti:${personality.code}`,
      universe: 'cpti',
    });

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderCptiShareImage(personality, dimensionScores);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#FFF9F2', 'CPTI');
        setPreviewUrl(finalUrl);
      } catch (err) {
        console.error('Failed to generate share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [dimensionScores, generating, personality, tierCtl]);

    const handleQuickDownload = useCallback(async () => {
      if (!previewUrl) {
        await handleGenerate();
        return;
      }
      const link = document.createElement('a');
      link.download = `CPTI-${personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [handleGenerate, personality.code, previewUrl, tierCtl.fileSuffix]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `CPTI-${personality.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `CPTI-${personality.code}.png` });
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
      link.download = `CPTI-${personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我的CP角色：${personality.name}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.name, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div className="space-y-2.5">
        <ShareTierPicker
          tier={tierCtl.tier}
          setTier={tierCtl.setTier}
          tierUnlocked={tierCtl.tierUnlocked}
          variant="light"
        />
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
              直接下载
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
          <button
            onClick={() => setPreviewUrl(null)}
            className="w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            隐藏预览
          </button>
        )}

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

              <div className={`rounded-2xl overflow-hidden shadow-2xl mb-4 ${tierCtl.tierTokens.containerClass}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="分享图片" className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-rose-400 mb-3 px-4 leading-5">
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
                  保存
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  送给ta
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
