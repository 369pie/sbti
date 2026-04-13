'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import QRCode from 'qrcode';
import type { PersonalityType } from '@/lib/personalities';
import { getTypeImage, getXiuxianTypeImage, getRarity } from '@/lib/personalities';
import { DIMENSIONS, MODEL_COLORS } from '@/lib/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';

import type { DimensionScore } from '@/lib/scoring';
import { getXiuxianSkin } from '@/lib/xiuxian';

export interface ShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  personality: PersonalityType;
  dimensionScores: DimensionScore[];
  isXiuxian?: boolean;
}

const CARD_WIDTH = 540;
const CARD_HEIGHT = 1040;
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
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient,
) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
  lineWidth = 1,
) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const lines: string[] = [];
  let index = 0;

  while (index < text.length && lines.length < maxLines) {
    let line = '';

    while (index < text.length) {
      const char = text[index];
      if (char === '\n') {
        index += 1;
        break;
      }

      const candidate = line + char;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        break;
      }

      line = candidate;
      index += 1;
    }

    lines.push(line.trimStart());
  }

  if (index < text.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }

  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const lines = wrapText(ctx, text, maxWidth, maxLines);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    const handleLoad = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`Image load failed: ${src}`));
    };
    const cleanup = () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      cleanup();
      resolve();
    }
  });

  try {
    await img.decode();
  } catch {
    // decode() is best-effort; loaded images are still usable if decode is unsupported.
  }

  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const promise = loadImage(src).catch(error => {
    imageCache.delete(src);
    throw error;
  });

  imageCache.set(src, promise);
  return promise;
}

async function createQrImage() {
  const qrDataUrl = await QRCode.toDataURL(SHARE_SITE_URL, {
    width: 200,
    margin: 1,
    color: { dark: '#2d2236', light: '#FFF9F2' },
    errorCorrectionLevel: 'M',
  });

  return getCachedImage(qrDataUrl);
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

async function renderShareImage(personality: PersonalityType, dimensionScores: DimensionScore[], isXiuxian?: boolean) {
  const xiuxianSkin = isXiuxian ? getXiuxianSkin(personality.slug) : undefined;
  const accentColor = xiuxianSkin?.color ?? personality.color;
  const displayName = xiuxianSkin ? `${xiuxianSkin.name} · ${xiuxianSkin.dao}` : personality.name;
  const displayTagline = xiuxianSkin ? xiuxianSkin.tagline : personality.tagline;
  const displayDesc = xiuxianSkin ? xiuxianSkin.description : personality.description;

  const imageSrc = isXiuxian ? getXiuxianTypeImage(personality.slug) : getTypeImage(personality.slug);
  const [typeImage, qrImage] = await Promise.all([
    getCachedImage(imageSrc).catch(() => null),
    createQrImage().catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

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
  wash.addColorStop(0, hexToRgba(accentColor, 0.08));
  wash.addColorStop(1, hexToRgba(accentColor, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 560);

  // Card border
  strokeRoundedRect(ctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(accentColor, 0.25), 2.5);
  strokeRoundedRect(ctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(accentColor, 0.08), 1);

  // Corner ornaments
  ctx.fillStyle = hexToRgba(accentColor, 0.35);
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 28);
  ctx.fillText('✦', CARD_WIDTH - 36, 28);
  ctx.fillText('✦', 36, CARD_HEIGHT - 44);
  ctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  // Header
  ctx.fillStyle = accentColor;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText(isXiuxian ? 'SBTI 修仙灵境' : 'SBTI 人格报告', CARD_WIDTH / 2, 46);

  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText(isXiuxian ? '在SBTI测定中，我的本命灵兽被鉴定为' : '在SBTI商业性格测定中，我被鉴定为', CARD_WIDTH / 2, 68);

  // ============ HERO CHARACTER IMAGE ============
  const imageCardX = 60;
  const imageCardY = 88;
  const imageCardWidth = CARD_WIDTH - 120;
  const imageCardHeight = 420;
  fillRoundedRect(ctx, imageCardX, imageCardY, imageCardWidth, imageCardHeight, 24, '#ffffff');
  strokeRoundedRect(ctx, imageCardX, imageCardY, imageCardWidth, imageCardHeight, 24, hexToRgba(accentColor, 0.25));

  if (typeImage) {
    ctx.save();
    roundRectPath(ctx, imageCardX + 4, imageCardY + 4, imageCardWidth - 8, imageCardHeight - 8, 20);
    ctx.clip();
    drawImageContain(ctx, typeImage, imageCardX + 12, imageCardY + 12, imageCardWidth - 24, imageCardHeight - 24);
    ctx.restore();
  } else {
    ctx.fillStyle = DARK;
    ctx.font = `700 120px ${FONT_SANS}`;
    ctx.fillText(personality.emoji, imageCardX + imageCardWidth / 2, imageCardY + 120);
  }

  const badgeText = isXiuxian
    ? `#${personality.isSpecial ? '特殊灵宠' : '标准修仙结果'}`
    : `#${personality.isSpecial ? '特殊人格' : '标准人格'}`;
  ctx.font = `12px ${FONT_MONO}`;
  ctx.textAlign = 'left';
  const badgeWidth = ctx.measureText(badgeText).width + 24;
  const badgeX = imageCardX + imageCardWidth - badgeWidth - 16;
  const badgeY = imageCardY + imageCardHeight - 40;
  fillRoundedRect(ctx, badgeX, badgeY, badgeWidth, 28, 14, hexToRgba(accentColor, 0.12));
  ctx.fillStyle = accentColor;
  ctx.fillText(badgeText, badgeX + 12, badgeY + 7);

  // Name + Code centered (adaptive for long xiuxian titles)
  const nameY = imageCardY + imageCardHeight + 16;
  const titleMaxWidth = CARD_WIDTH - 72;
  let titleFontSize = isXiuxian ? 52 : 48;
  let titleLines: string[] = [];

  while (titleFontSize >= 36) {
    ctx.font = `700 ${titleFontSize}px ${FONT_SANS}`;
    titleLines = wrapText(ctx, displayName, titleMaxWidth, 2);
    if (titleLines.length <= 2) {
      break;
    }
    titleFontSize -= 2;
  }

  if (titleLines.length === 0) {
    ctx.font = `700 ${titleFontSize}px ${FONT_SANS}`;
    titleLines = wrapText(ctx, displayName, titleMaxWidth, 2);
  }

  const titleLineHeight = Math.round(titleFontSize * 1.08);
  ctx.fillStyle = DARK;
  ctx.textAlign = 'center';
  titleLines.forEach((line, index) => {
    ctx.fillText(line, CARD_WIDTH / 2, nameY + index * titleLineHeight);
  });

  const codeY = nameY + titleLines.length * titleLineHeight + 4;
  ctx.fillStyle = accentColor;
  ctx.font = `600 18px ${FONT_MONO}`;
  ctx.fillText(personality.code, CARD_WIDTH / 2, codeY);

  // Rarity badge + population %
  const rarity = getRarity(personality.slug);
  const rarityY = codeY + 32;
  const rarityText = isXiuxian && xiuxianSkin ? xiuxianSkin.realm : rarity.label;
  ctx.font = `600 13px ${FONT_SANS}`;
  const rarityW = ctx.measureText(rarityText).width + 28;
  const pctText = isXiuxian
    ? `仅 ${rarity.populationPct}% 的修士结成了此等灵体`
    : `仅 ${rarity.populationPct}% 的测试者是此人格`;
  ctx.font = `12px ${FONT_SANS}`;
  const pctW = ctx.measureText(pctText).width;
  const totalBadgeW = rarityW + 8 + pctW;
  const badgeStartX = (CARD_WIDTH - totalBadgeW) / 2;
  // rarity pill
  fillRoundedRect(ctx, badgeStartX, rarityY, rarityW, 24, 12, rarity.bgColor);
  ctx.fillStyle = rarity.color;
  ctx.font = `600 13px ${FONT_SANS}`;
  ctx.fillText(rarityText, badgeStartX + rarityW / 2, rarityY + 5);
  // population text
  ctx.fillStyle = MED;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText(pctText, badgeStartX + rarityW + 8 + pctW / 2, rarityY + 6);
  ctx.textAlign = 'left';

  const topDimensionScores = dimensionScores.slice(0, 3);
  const bottomLimit = CARD_HEIGHT - 28;
  const descX = 36;
  const descWidth = CARD_WIDTH - 72;
  let descTopOffset = 42;
  let descHeight = 120;
  let descBodyLineHeight = 24;
  let descBodyMaxLines = 3;
  let descToBarsGap = 20;
  let barRowSpacing = 30;
  let footerGap = 12;
  let taglineLineHeight = 22;
  let taglineMaxLines = 2;

  const getFooterBottom = () => {
    const descYLocal = rarityY + descTopOffset;
    const barSectionYLocal = descYLocal + descHeight + descToBarsGap;
    const lastBarBottomLocal = topDimensionScores.length > 0
      ? barSectionYLocal + 38 + (topDimensionScores.length - 1) * barRowSpacing + 15
      : barSectionYLocal + 24;
    const footerDividerYLocal = lastBarBottomLocal + footerGap;
    const qrCardYLocal = footerDividerYLocal - 4;
    return qrCardYLocal + 80;
  };

  let compactPass = 0;
  while (getFooterBottom() > bottomLimit && compactPass < 12) {
    descTopOffset = Math.max(28, descTopOffset - 2);
    descHeight = Math.max(92, descHeight - 8);
    descBodyLineHeight = Math.max(20, descBodyLineHeight - 1);
    descBodyMaxLines = Math.max(2, descBodyMaxLines - 1);
    descToBarsGap = Math.max(12, descToBarsGap - 2);
    barRowSpacing = Math.max(24, barRowSpacing - 1);
    footerGap = Math.max(8, footerGap - 1);
    if (compactPass >= 6) {
      taglineLineHeight = Math.max(20, taglineLineHeight - 1);
      taglineMaxLines = 1;
    }
    compactPass += 1;
  }

  const descY = rarityY + descTopOffset;
  fillRoundedRect(ctx, descX, descY, descWidth, descHeight, 16, hexToRgba(accentColor, 0.04));
  strokeRoundedRect(ctx, descX, descY, descWidth, descHeight, 16, hexToRgba(accentColor, 0.10));

  ctx.fillStyle = accentColor;
  ctx.font = `600 16px ${FONT_SANS}`;
  const taglineLines = wrapText(ctx, `"${displayTagline}"`, descWidth - 48, taglineMaxLines);
  taglineLines.forEach((line, index) => {
    ctx.fillText(line, descX + 24, descY + 16 + index * taglineLineHeight);
  });

  const descBodyStartY = descY + 16 + taglineLines.length * taglineLineHeight + 10;
  const descBodyAvailableHeight = Math.max(24, descHeight - (descBodyStartY - descY) - 12);
  const descBodyLinesByHeight = Math.max(1, Math.floor(descBodyAvailableHeight / descBodyLineHeight));
  const descBodyLines = Math.min(descBodyMaxLines, descBodyLinesByHeight);

  ctx.fillStyle = DARK;
  ctx.font = `14px ${FONT_SANS}`;
  drawWrappedText(ctx, displayDesc, descX + 24, descBodyStartY, descWidth - 48, descBodyLineHeight, descBodyLines);

  const barSectionY = descY + descHeight + descToBarsGap;
  ctx.fillStyle = MED;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText('核心特质 TOP 3', 36, barSectionY);

  topDimensionScores.forEach((score, index) => {
    const dim = DIMENSIONS.find(item => item.id === score.id);
    if (!dim) return;

    const color = MODEL_COLORS[dim.model].base;
    const rowY = barSectionY + 38 + index * barRowSpacing;
    const barX = 130;
    const barWidth = 326;
    const progressWidth = Math.max(36, (score.score / 15) * barWidth);

    ctx.fillStyle = DARK;
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(dim.name, 36, rowY);

    fillRoundedRect(ctx, barX, rowY + 7, barWidth, 8, 999, DIV);
    fillRoundedRect(ctx, barX, rowY + 7, progressWidth, 8, 999, color);

    ctx.fillStyle = color;
    ctx.font = `600 14px ${FONT_MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(String(score.score), 492, rowY - 1);
    ctx.textAlign = 'left';
  });

  const lastBarBottom = topDimensionScores.length > 0
    ? barSectionY + 38 + (topDimensionScores.length - 1) * barRowSpacing + 15
    : barSectionY + 24;
  const footerDividerY = lastBarBottom + footerGap;
  const footerTitleY = footerDividerY + 20;
  const footerUrlY = footerDividerY + 50;
  const qrCardY = footerDividerY - 4;

  ctx.strokeStyle = DIV;
  ctx.beginPath();
  ctx.moveTo(36, footerDividerY);
  ctx.lineTo(CARD_WIDTH - 36, footerDividerY);
  ctx.stroke();

  ctx.fillStyle = DARK;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.fillText('测测你的隐藏人格', 36, footerTitleY);

  ctx.fillStyle = accentColor;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 36, footerUrlY);

  fillRoundedRect(ctx, 424, qrCardY, 80, 80, 12, '#ffffff');
  if (qrImage) {
    drawImageContain(ctx, qrImage, 428, qrCardY + 4, 72, 72);
  } else {
    fillRoundedRect(ctx, 432, qrCardY + 8, 64, 64, 8, DIV);
  }

  return canvas.toDataURL('image/png');
}

export const ShareImageGenerator = forwardRef<ShareImageGeneratorHandle, Props>(
  function ShareImageGenerator({ personality, dimensionScores, isXiuxian }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const shareDisplayName = isXiuxian
      ? (getXiuxianSkin(personality.slug)?.displayName ?? personality.name)
      : personality.name;

    const prepareAssets = useCallback(async () => {
      const imageSrc = isXiuxian ? getXiuxianTypeImage(personality.slug) : getTypeImage(personality.slug);
      await Promise.all([
        getCachedImage(imageSrc).catch(() => null),
        createQrImage().catch(() => null),
      ]);
    }, [personality.slug, isXiuxian]);

    useEffect(() => {
      void prepareAssets();
    }, [prepareAssets]);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);

      try {
        const dataUrl = await renderShareImage(personality, dimensionScores, isXiuxian);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [dimensionScores, generating, isXiuxian, personality]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `SBTI-${personality.code}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;

      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择“保存到照片”或“存储到文件”。');
            await navigator.share({
              files: [file],
              title: `SBTI-${personality.code}.png`,
            });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
        }

        setSaveHint(
          isWeChatBrowser()
            ? '微信内置浏览器不支持直接弹出保存面板，请长按上方图片保存，或右上角用系统浏览器打开后再保存。'
            : '当前浏览器不能直接弹出保存面板，请长按上方图片保存到相册。',
        );
        return;
      }

      const link = document.createElement('a');
      link.download = `SBTI-${personality.code}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;

      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `我的 SBTI 人格：${shareDisplayName}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, previewUrl, shareDisplayName]);

    useImperativeHandle(ref, () => ({
      generate: handleGenerate,
    }), [handleGenerate]);

    return (
      <div>
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
                <p className="text-center text-xs text-accent mb-3 px-4 leading-5">
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
                  className="flex-1 py-3 rounded-xl bg-accent text-bg-primary text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
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