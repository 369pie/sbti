'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';
import { getTypeImage } from '@/lib/personalities';
import type { ComboResult } from '@/lib/combo';
import { getComboPersonalityImage } from '@/lib/combo';
import { SHARE_SITE_URL } from '@/lib/site';

export interface ComboShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  result: ComboResult;
}

const CARD_WIDTH = 540;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';
const imageCache = new Map<string, Promise<HTMLImageElement>>();

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  width: number, height: number, radius: number,
  fillStyle: string | CanvasGradient,
) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  width: number, height: number, radius: number,
  strokeStyle: string, lineWidth = 1,
) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = [];
  let index = 0;
  while (index < text.length && lines.length < maxLines) {
    let line = '';
    while (index < text.length) {
      const char = text[index];
      if (char === '\n') { index += 1; break; }
      const candidate = line + char;
      if (line && ctx.measureText(candidate).width > maxWidth) break;
      line = candidate;
      index += 1;
    }
    lines.push(line.trimStart());
  }
  if (index < text.length && lines.length > 0) {
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
    const handleLoad = () => { cleanup(); resolve(); };
    const handleError = () => { cleanup(); reject(new Error(`Image load failed: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', handleLoad); img.removeEventListener('error', handleError); };
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* best-effort */ }
  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const promise = loadImage(src).catch(error => { imageCache.delete(src); throw error; });
  imageCache.set(src, promise);
  return promise;
}

async function createQrImage() {
  const qrDataUrl = await toQrDataUrl(`${SHARE_SITE_URL}/combo/`, {
    width: 200, margin: 1,
    color: { dark: '#2d2236', light: '#FFF9F2' },
    errorCorrectionLevel: 'M',
  });
  return getCachedImage(qrDataUrl);
}

function drawImageContain(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  x: number, y: number, width: number, height: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(width / sw, height / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
}

async function renderComboShareImage(result: ComboResult) {
  const [typeImage, qrImage, comboImage] = await Promise.all([
    getCachedImage(getTypeImage(result.personality.slug)).catch(() => null),
    createQrImage().catch(() => null),
    getCachedImage(getComboPersonalityImage(result.comboPersonality.code)).catch(() => null),
  ]);

  // ── Pre-compute layout positions for dynamic height ──
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;

  const imgY = 108;
  const imgSize = 200;
  const cpInfoY = imgY + imgSize + 12;
  const easterEggOffset = result.isEasterEgg ? 92 : 66;
  const titleY = cpInfoY + easterEggOffset;

  measureCtx.font = `700 30px ${FONT_SANS}`;
  const titleLines = wrapText(measureCtx, result.title, CARD_WIDTH - 80, 2);
  const subY = titleY + titleLines.length * 40 + 8;
  const roastY = subY + 36;
  const roastW = CARD_WIDTH - 72;
  const lineHeight = 28;
  const roastPaddingY = 20;

  measureCtx.font = `14px ${FONT_SANS}`;
  let totalRoastLines = 0;
  const wrappedRoasts: string[][] = [];
  for (const line of result.roasts) {
    const wrapped = wrapText(measureCtx, `▸ ${line}`, roastW - 48, 3);
    wrappedRoasts.push(wrapped);
    totalRoastLines += wrapped.length;
  }
  const roastH = roastPaddingY * 2 + totalRoastLines * lineHeight + (result.roasts.length - 1) * 8;
  const footerY = roastY + roastH + 16;
  const FOOTER_BOTTOM = 98; // QR(80) + top-gap(4) + bottom padding(14)
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
  const color = result.personality.color;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Color wash
  const wash = ctx.createRadialGradient(270, 240, 0, 270, 240, 280);
  wash.addColorStop(0, hexToRgba(color, 0.08));
  wash.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 480);

  // Card borders
  strokeRoundedRect(ctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(color, 0.25), 2.5);
  strokeRoundedRect(ctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(color, 0.08), 1);

  // Corner ornaments
  ctx.fillStyle = hexToRgba(color, 0.35);
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 28);
  ctx.fillText('✦', CARD_WIDTH - 36, 28);
  ctx.fillText('✦', 36, CARD_HEIGHT - 44);
  ctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  // Header
  ctx.fillStyle = color;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText('SBTI 人格拼盘', CARD_WIDTH / 2, 46);

  // Three badges
  const badgeY = 68;
  ctx.font = `600 12px ${FONT_SANS}`;
  const sbtiTag = `${result.personality.emoji} ${result.personality.code}`;
  const mbtiTag = result.mbti.code;
  const zodiacTag = `${result.zodiac.emoji} ${result.zodiac.name}`;
  const cross = ' × ';

  // Measure total width
  const sbtiW = ctx.measureText(sbtiTag).width + 20;
  const mbtiW = ctx.measureText(mbtiTag).width + 20;
  const zodiacW = ctx.measureText(zodiacTag).width + 20;
  const crossW = ctx.measureText(cross).width;
  const totalW = sbtiW + crossW + mbtiW + crossW + zodiacW;
  let bx = (CARD_WIDTH - totalW) / 2;

  // SBTI pill
  fillRoundedRect(ctx, bx, badgeY, sbtiW, 24, 12, hexToRgba(color, 0.12));
  ctx.fillStyle = color;
  ctx.fillText(sbtiTag, bx + sbtiW / 2, badgeY + 5);
  bx += sbtiW;
  ctx.fillStyle = MED;
  ctx.fillText(cross, bx + crossW / 2, badgeY + 5);
  bx += crossW;
  // MBTI pill
  fillRoundedRect(ctx, bx, badgeY, mbtiW, 24, 12, 'rgba(167,139,250,0.12)');
  ctx.fillStyle = '#a78bfa';
  ctx.fillText(mbtiTag, bx + mbtiW / 2, badgeY + 5);
  bx += mbtiW;
  ctx.fillStyle = MED;
  ctx.fillText(cross, bx + crossW / 2, badgeY + 5);
  bx += crossW;
  // Zodiac pill
  fillRoundedRect(ctx, bx, badgeY, zodiacW, 24, 12, 'rgba(6,182,212,0.12)');
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(zodiacTag, bx + zodiacW / 2, badgeY + 5);

  // Character images — combo personality + SBTI type side by side
  const imgGap = 20;
  const totalImgW = imgSize * 2 + imgGap;
  const imgStartX = (CARD_WIDTH - totalImgW) / 2;
  const cpColor = result.comboPersonality.color;

  // Combo personality image (left)
  fillRoundedRect(ctx, imgStartX, imgY, imgSize, imgSize, 20, hexToRgba(cpColor, 0.08));
  strokeRoundedRect(ctx, imgStartX, imgY, imgSize, imgSize, 20, hexToRgba(cpColor, 0.3), 2);
  if (comboImage) {
    ctx.save();
    roundRectPath(ctx, imgStartX + 4, imgY + 4, imgSize - 8, imgSize - 8, 16);
    ctx.clip();
    drawImageContain(ctx, comboImage, imgStartX + 8, imgY + 8, imgSize - 16, imgSize - 16);
    ctx.restore();
  } else {
    // Emoji fallback
    ctx.fillStyle = cpColor;
    ctx.font = `64px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(result.comboPersonality.emoji, imgStartX + imgSize / 2, imgY + 32);
  }

  // SBTI type image (right)
  const img2X = imgStartX + imgSize + imgGap;
  fillRoundedRect(ctx, img2X, imgY, imgSize, imgSize, 20, hexToRgba(color, 0.08));
  strokeRoundedRect(ctx, img2X, imgY, imgSize, imgSize, 20, hexToRgba(color, 0.3), 2);
  if (typeImage) {
    ctx.save();
    roundRectPath(ctx, img2X + 4, imgY + 4, imgSize - 8, imgSize - 8, 16);
    ctx.clip();
    drawImageContain(ctx, typeImage, img2X + 8, imgY + 8, imgSize - 16, imgSize - 16);
    ctx.restore();
  }

  // Combo personality code + name below images
  ctx.textAlign = 'center';
  ctx.fillStyle = cpColor;
  ctx.font = `800 16px ${FONT_MONO}`;
  ctx.fillText(result.comboPersonality.code, CARD_WIDTH / 2, cpInfoY);

  ctx.fillStyle = DARK;
  ctx.font = `700 15px ${FONT_SANS}`;
  ctx.fillText(result.comboPersonality.name, CARD_WIDTH / 2, cpInfoY + 22);

  ctx.fillStyle = MED;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText(`「${result.comboPersonality.tagline}」`, CARD_WIDTH / 2, cpInfoY + 44);

  // Easter egg badge
  if (result.isEasterEgg) {
    ctx.font = `10px ${FONT_MONO}`;
    const eggText = '🥚 隐藏彩蛋';
    const eggW = ctx.measureText(eggText).width + 16;
    fillRoundedRect(ctx, (CARD_WIDTH - eggW) / 2, cpInfoY + 62, eggW, 20, 10, 'rgba(251,191,36,0.15)');
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText(eggText, CARD_WIDTH / 2, cpInfoY + 67);
  }

  // Combo title
  ctx.textAlign = 'center';

  // Gradient-ish title (draw twice for pseudo-gradient)
  ctx.fillStyle = color;
  ctx.font = `700 30px ${FONT_SANS}`;
  // Wrap title if too long — reuse pre-computed titleLines
  titleLines.forEach((line, i) => {
    ctx.fillText(line, CARD_WIDTH / 2, titleY + i * 40);
  });

  // Sub line
  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText(
    `${result.personality.name} · ${result.mbti.code}（${result.mbti.label}）· ${result.zodiac.name}`,
    CARD_WIDTH / 2,
    subY,
  );

  // Roast card
  const roastX = 36;

  // Roast card — use pre-computed dimensions
  fillRoundedRect(ctx, roastX, roastY, roastW, roastH, 16, hexToRgba(color, 0.04));
  strokeRoundedRect(ctx, roastX, roastY, roastW, roastH, 16, hexToRgba(color, 0.10));

  ctx.fillStyle = DARK;
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'left';
  let ry = roastY + roastPaddingY;
  for (const wrapped of wrappedRoasts) {
    for (const wline of wrapped) {
      ctx.fillText(wline, roastX + 24, ry);
      ry += lineHeight;
    }
    ry += 8;
  }

  // Footer
  ctx.textAlign = 'left';
  ctx.strokeStyle = DIV;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(CARD_WIDTH - 36, footerY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `600 15px ${FONT_SANS}`;
  ctx.fillText('测测你的人格拼盘', 36, footerY + 18);

  ctx.fillStyle = color;
  ctx.font = `12px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 36, footerY + 44);

  // QR
  const qrX = CARD_WIDTH - 120;
  fillRoundedRect(ctx, qrX, footerY + 4, 80, 80, 12, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, qrX + 4, footerY + 8, 72, 72);
  } else {
    fillRoundedRect(ctx, qrX + 8, footerY + 12, 64, 64, 8, DIV);
  }

  return canvas.toDataURL('image/png');
}

export const ComboShareImageGenerator = forwardRef<ComboShareImageGeneratorHandle, Props>(
  function ComboShareImageGenerator({ result }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({ resourceId: 'combo:share', universe: 'combo' });

    const prepareAssets = useCallback(async () => {
      await Promise.all([
        getCachedImage(getTypeImage(result.personality.slug)).catch(() => null),
        getCachedImage(getComboPersonalityImage(result.comboPersonality.code)).catch(() => null),
        createQrImage().catch(() => null),
      ]);
    }, [result.personality.slug, result.comboPersonality.code]);

    useEffect(() => {
      void prepareAssets();
    }, [prepareAssets]);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderComboShareImage(result);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#FFF9F2', 'COMBO');
        setPreviewUrl(finalUrl);
      } catch (err) {
        console.error('Failed to generate combo share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [generating, result, tierCtl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `SBTI-Combo-${result.personality.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [previewUrl, result.personality.code, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `SBTI-Combo-${result.personality.code}.png` });
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
      link.download = `SBTI-Combo-${result.personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, previewUrl, result.personality.code, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我的人格拼盘：${result.title}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, previewUrl, result.title]);

    useImperativeHandle(ref, () => ({
      generate: handleGenerate,
    }), [handleGenerate]);

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
          className="w-full py-3.5 rounded-xl bg-accent text-bg-primary font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              生成中…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              生成人格拼盘图
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
                <img src={previewUrl} alt="人格拼盘图" className="w-full" />
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
      </div>
    );
  },
);
