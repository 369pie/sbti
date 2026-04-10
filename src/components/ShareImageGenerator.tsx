'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import QRCode from 'qrcode';
import type { PersonalityType } from '@/lib/personalities';
import { getTypeImage, getRarity } from '@/lib/personalities';
import { DIMENSIONS, MODEL_COLORS } from '@/lib/dimensions';
import { SHARE_SITE_URL } from '@/lib/site';

import type { DimensionScore } from '@/lib/scoring';

export interface ShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  personality: PersonalityType;
  dimensionScores: DimensionScore[];
}

const CARD_WIDTH = 540;
const CARD_HEIGHT = 960;
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

async function renderShareImage(personality: PersonalityType, dimensionScores: DimensionScore[]) {
  const BG = '#FFF9F2';
  const DARK = '#2d2236';
  const MED = '#6b6380';
  const LIGHT = '#a099b4';
  const DIV = '#e8e0d6';

  const [typeImage, qrImage] = await Promise.all([
    getCachedImage(getTypeImage(personality.slug)).catch(() => null),
    createQrImage().catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  // ========== Cream background ==========
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Soft color wash
  const wash = ctx.createRadialGradient(CARD_WIDTH / 2, 240, 0, CARD_WIDTH / 2, 240, 320);
  wash.addColorStop(0, hexToRgba(personality.color, 0.09));
  wash.addColorStop(1, hexToRgba(personality.color, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_WIDTH, 500);

  // Card border
  strokeRoundedRect(ctx, 14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28, 24, hexToRgba(personality.color, 0.4), 2.5);
  // Inner decorative rule
  strokeRoundedRect(ctx, 22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44, 18, hexToRgba(personality.color, 0.1), 1);

  // Corner ornaments
  ctx.fillStyle = hexToRgba(personality.color, 0.45);
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 28);
  ctx.fillText('✦', CARD_WIDTH - 36, 28);
  ctx.fillText('✦', 36, CARD_HEIGHT - 44);
  ctx.fillText('✦', CARD_WIDTH - 36, CARD_HEIGHT - 44);

  // ========== Header ==========
  ctx.fillStyle = personality.color;
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText('SBTI 人格鉴定', CARD_WIDTH / 2, 48);

  // ========== Character image ==========
  const imgX = 90;
  const imgY = 78;
  const imgW = CARD_WIDTH - 180;
  const imgH = 340;

  fillRoundedRect(ctx, imgX, imgY, imgW, imgH, 20, '#ffffff');
  strokeRoundedRect(ctx, imgX, imgY, imgW, imgH, 20, hexToRgba(personality.color, 0.18));

  if (typeImage) {
    ctx.save();
    roundRectPath(ctx, imgX + 4, imgY + 4, imgW - 8, imgH - 8, 16);
    ctx.clip();
    drawImageContain(ctx, typeImage, imgX + 12, imgY + 12, imgW - 24, imgH - 24);
    ctx.restore();
  } else {
    ctx.fillStyle = DARK;
    ctx.font = `120px ${FONT_SANS}`;
    ctx.fillText(personality.emoji, CARD_WIDTH / 2, imgY + 90);
  }

  // Type badge on image
  const typeBadge = personality.isSpecial ? '✦ 特殊人格' : '标准人格';
  ctx.font = `11px ${FONT_MONO}`;
  ctx.textAlign = 'left';
  const tbW = ctx.measureText(typeBadge).width + 20;
  const tbX = imgX + imgW - tbW - 10;
  const tbY = imgY + imgH - 32;
  fillRoundedRect(ctx, tbX, tbY, tbW, 24, 12, hexToRgba(personality.color, 0.88));
  ctx.fillStyle = '#ffffff';
  ctx.fillText(typeBadge, tbX + 10, tbY + 6);

  // ========== Name + Code ==========
  const nameY = imgY + imgH + 22;
  ctx.fillStyle = DARK;
  ctx.font = `700 40px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(personality.name, CARD_WIDTH / 2, nameY);

  ctx.fillStyle = personality.color;
  ctx.font = `600 16px ${FONT_MONO}`;
  ctx.fillText(personality.code, CARD_WIDTH / 2, nameY + 50);

  // ========== Rarity stars ==========
  const rarity = getRarity(personality.slug);
  const rarityY = nameY + 78;
  const starMap: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
  const starCount = starMap[rarity.tier] || 1;
  const stars = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
  ctx.fillStyle = rarity.color;
  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillText(`${stars}  ${rarity.label}  ·  ${rarity.populationPct}% 的人`, CARD_WIDTH / 2, rarityY);

  // ========== Tagline ==========
  const tagY = rarityY + 32;
  ctx.fillStyle = personality.color;
  ctx.font = `600 15px ${FONT_SANS}`;
  ctx.fillText(`「${personality.tagline}」`, CARD_WIDTH / 2, tagY);

  // ========== Description ==========
  const descY = tagY + 32;
  ctx.fillStyle = MED;
  ctx.font = `13px ${FONT_SANS}`;
  const descLines = wrapText(ctx, personality.description, CARD_WIDTH - 100, 3);
  descLines.forEach((line, i) => {
    ctx.fillText(line, CARD_WIDTH / 2, descY + i * 22);
  });

  // ========== TOP 3 dimension pills ==========
  const topScores = dimensionScores.slice(0, 3);
  const pillY = descY + descLines.length * 22 + 20;
  ctx.font = `600 11px ${FONT_SANS}`;
  const pills = topScores.map(s => {
    const dim = DIMENSIONS.find(d => d.id === s.id);
    return {
      label: dim ? `${dim.name} ${s.score}` : `${s.id} ${s.score}`,
      color: dim ? MODEL_COLORS[dim.model].base : '#999',
      w: 0,
    };
  });
  pills.forEach(p => { p.w = ctx.measureText(p.label).width + 24; });
  const totalPW = pills.reduce((s, p) => s + p.w, 0) + 10 * (pills.length - 1);
  let px = (CARD_WIDTH - totalPW) / 2;
  pills.forEach(p => {
    fillRoundedRect(ctx, px, pillY, p.w, 26, 13, hexToRgba(p.color, 0.1));
    strokeRoundedRect(ctx, px, pillY, p.w, 26, 13, hexToRgba(p.color, 0.25));
    ctx.fillStyle = p.color;
    ctx.font = `600 11px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(p.label, px + p.w / 2, pillY + 7);
    px += p.w + 10;
  });

  // ========== Divider ==========
  const divY = pillY + 46;
  ctx.strokeStyle = DIV;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, divY);
  ctx.lineTo(CARD_WIDTH - 60, divY);
  ctx.stroke();

  // ========== Footer ==========
  const ftY = divY + 18;
  ctx.textAlign = 'left';
  ctx.fillStyle = DARK;
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.fillText('测测你的隐藏人格', 48, ftY);

  ctx.fillStyle = personality.color;
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 48, ftY + 24);

  // QR code
  const qrS = 60;
  const qrX = CARD_WIDTH - 48 - qrS;
  const qrY = ftY - 4;
  fillRoundedRect(ctx, qrX - 3, qrY - 3, qrS + 6, qrS + 6, 10, '#ffffff');
  strokeRoundedRect(ctx, qrX - 3, qrY - 3, qrS + 6, qrS + 6, 10, DIV);
  if (qrImage) {
    drawImageContain(ctx, qrImage, qrX, qrY, qrS, qrS);
  }

  return canvas.toDataURL('image/png');
}

export const ShareImageGenerator = forwardRef<ShareImageGeneratorHandle, Props>(
  function ShareImageGenerator({ personality, dimensionScores }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const prepareAssets = useCallback(async () => {
      await Promise.all([
        getCachedImage(getTypeImage(personality.slug)).catch(() => null),
        createQrImage().catch(() => null),
      ]);
    }, [personality.slug]);

    useEffect(() => {
      void prepareAssets();
    }, [prepareAssets]);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);

      try {
        const dataUrl = await renderShareImage(personality, dimensionScores);
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
          await navigator.share({ files: [file], title: `我的 SBTI 人格：${personality.name}` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.name, previewUrl]);

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
              className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="分享图片" className="w-full" />
              </div>

              <p className="text-center text-xs text-text-muted mb-3 sm:hidden">
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
                  className="flex-1 py-3 rounded-xl border border-border text-sm text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer flex items-center justify-center gap-2"
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

              <p className="text-center text-xs text-text-muted mt-4">
                点击空白处关闭
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);