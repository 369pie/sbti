'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { SHARE_SITE_URL } from '@/lib/site';
import { MYSTI_THEMES } from '@/lib/mysti/themes';
import type { MystiTheme, MystiShareImageGeneratorHandle } from '@/lib/mysti/types';
import {
  getRarityColor,
  getRarityGlow,
  getRarityLabel,
  getRarityEmoji,
  type GachaResult,
} from '@/lib/mysti/gacha';
import { trackMystiEvent } from '@/lib/mysti/analytics';

const CARD_WIDTH = 540;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_SERIF = 'Georgia, "Songti SC", "SimSun", serif';

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

function strokeRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, stroke: string, width = 1) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawOrnaments(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = `10px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', x + 4, y + 4);
  ctx.fillText('✦', x + w - 4, y + 4);
  ctx.fillText('✦', x + 4, y + h - 4);
  ctx.fillText('✦', x + w - 4, y + h - 4);
}

function drawTarotFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: MystiTheme,
  rarityColor: string,
) {
  ctx.save();
  ctx.shadowColor = hexToRgba(rarityColor, 0.25);
  ctx.shadowBlur = 30;
  fillRoundedRect(ctx, x, y, w, h, 10, theme.cardSurface);
  ctx.restore();

  strokeRoundedRect(ctx, x, y, w, h, 10, rarityColor, 2);
  strokeRoundedRect(ctx, x + 6, y + 6, w - 12, h - 12, 6, hexToRgba(rarityColor, 0.5), 1);
  drawOrnaments(ctx, x + 2, y + 2, w - 4, h - 4, rarityColor);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = text.split('');
  const lines: string[] = [];
  let line = '';
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function createQrImage(): Promise<string> {
  const url = `${SHARE_SITE_URL}mysti/gacha/`;
  return toQrDataUrl(url, { width: 200, margin: 1, color: { dark: '#2D2A26', light: '#FFF9F2' } });
}

async function renderGachaShareImage(
  result: GachaResult,
  collectionCount: number,
  collectionTotal: number,
  themeId: MystiTheme['id'],
): Promise<string> {
  const theme = MYSTI_THEMES[themeId];
  const rarityColor = getRarityColor(result.card.rarity);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  const canvasHeight = 1000;
  canvas.height = canvasHeight * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.scale(CARD_SCALE, CARD_SCALE);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  grad.addColorStop(0, theme.gradientBg[0]);
  grad.addColorStop(1, theme.gradientBg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_WIDTH, canvasHeight);

  // Decorative radial glow with rarity color
  const glow = ctx.createRadialGradient(CARD_WIDTH / 2, 250, 40, CARD_WIDTH / 2, 250, 300);
  glow.addColorStop(0, hexToRgba(rarityColor, 0.12));
  glow.addColorStop(1, hexToRgba(rarityColor, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, 600);

  const qrDataUrl = await createQrImage();
  const W = CARD_WIDTH;
  const cx = W / 2;
  let y = 44;

  // Brand
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `14px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('WTFTI · 每日抽卡', cx, y);
  y += 28;

  // Date
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(result.date, cx, y);
  y += 32;

  // Rarity badge
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = rarityColor;
  ctx.fillText(`${getRarityEmoji(result.card.rarity)} ${getRarityLabel(result.card.rarity)}`, cx, y);
  y += 28;

  // Tarot card frame
  const tw = 240;
  const th = 360;
  const tx = cx - tw / 2;
  drawTarotFrame(ctx, tx, y, tw, th, theme, rarityColor);

  // Card content
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Universe emoji
  ctx.font = `36px ${FONT_SANS}`;
  ctx.fillText(result.card.universeEmoji || '🔮', cx, y + th / 2 - 60);

  // Personality emoji
  ctx.font = `56px ${FONT_SANS}`;
  ctx.fillText(result.card.personalityEmoji, cx, y + th / 2 + 10);

  // Personality name
  ctx.fillStyle = theme.text;
  ctx.font = `18px ${FONT_SANS}`;
  ctx.fillText(result.card.personalityName, cx, y + th / 2 + 60);

  // Personality code
  ctx.fillStyle = theme.textMuted;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText(result.card.personalityCode, cx, y + th / 2 + 80);

  // Universe badge
  ctx.font = `11px ${FONT_SANS}`;
  const universeText = result.card.universeName;
  const universeW = ctx.measureText(universeText).width + 20;
  fillRoundedRect(ctx, cx - universeW / 2, y + th / 2 + 95, universeW, 22, 11, theme.accentSoft);
  ctx.fillStyle = theme.accent;
  ctx.fillText(universeText, cx, y + th / 2 + 106);

  ctx.restore();

  y += th + 24;

  // Card description
  ctx.font = `14px ${FONT_SANS}`;
  const descLines = wrapText(ctx, `"${result.card.cardDescription}"`, 440);
  ctx.fillStyle = theme.textMuted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let descY = y;
  for (const line of descLines) {
    ctx.fillText(line, cx, descY);
    descY += 22;
  }
  y = descY + 16;

  // New card indicator
  if (result.isNew) {
    ctx.font = `12px ${FONT_SANS}`;
    ctx.fillStyle = '#22c55e';
    ctx.fillText('✨ 新卡牌！', cx, y);
    y += 24;
  }

  // Collection progress
  const progressW = 400;
  const progressH = 8;
  const progressX = cx - progressW / 2;

  // Progress bar background
  fillRoundedRect(ctx, progressX, y, progressW, progressH, 4, theme.divider);

  // Progress bar fill
  const progress = collectionCount / collectionTotal;
  if (progress > 0) {
    fillRoundedRect(ctx, progressX, y, progressW * progress, progressH, 4, theme.accent);
  }

  y += 16;

  // Collection text
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText(`已收集 ${collectionCount}/${collectionTotal}`, cx, y);
  y += 32;

  // QR code & footer
  const qrSize = 80;
  const qrX = cx - qrSize / 2;

  ctx.beginPath();
  ctx.arc(cx, y + qrSize / 2, qrSize / 2 + 6, 0, Math.PI * 2);
  ctx.fillStyle = theme.cardSurface;
  ctx.fill();
  ctx.strokeStyle = theme.divider;
  ctx.lineWidth = 1;
  ctx.stroke();

  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  ctx.drawImage(qrImg, qrX, y, qrSize, qrSize);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('wtfti.com/mysti/gacha', cx, y + qrSize + 10);

  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('扫码抽取灵魂卡牌', cx, y + qrSize + 32);
  y += qrSize + 60;

  // Crop to actual content height
  const cropH = Math.max(y + 24, 800);
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = canvas.width;
  croppedCanvas.height = cropH * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Crop canvas context unavailable');
  cctx.drawImage(canvas, 0, 0, canvas.width, croppedCanvas.height, 0, 0, canvas.width, croppedCanvas.height);
  return croppedCanvas.toDataURL('image/png');
}

interface Props {
  result: GachaResult;
  collectionCount: number;
  collectionTotal: number;
  themeId?: MystiTheme['id'];
}

export const MystiGachaShareImageGenerator = forwardRef<MystiShareImageGeneratorHandle, Props>(
  function MystiGachaShareImageGenerator({ result, collectionCount, collectionTotal, themeId = 'celestial' }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const theme = MYSTI_THEMES[themeId];

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      trackMystiEvent('mysti_gacha_share', {
        rarity: result.card.rarity,
        universeId: result.card.universeId,
        slug: result.card.slug,
      });
      try {
        const dataUrl = await renderGachaShareImage(result, collectionCount, collectionTotal, themeId);
        setPreviewUrl(dataUrl);
      } catch (e) {
        console.error('Gacha share image generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [generating, result, collectionCount, collectionTotal, themeId]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `WTFTI-每日抽卡-${result.card.personalityName}.png`, { type: 'image/png' });
    }, [result.card.personalityName, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: file.name });
            return;
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
        }
        setSaveHint('请长按上方图片保存到相册。');
        return;
      }
      const link = document.createElement('a');
      link.download = `WTFTI-每日抽卡-${result.card.personalityName}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, result.card.personalityName, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        const title = `今日抽卡：${result.card.personalityName} (${getRarityLabel(result.card.rarity)}) — WTFTI 每日抽卡`;
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, result.card.personalityName, result.card.rarity, handleDownload, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-xl text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})` }}
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
              📸 生成分享卡
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
                <img src={previewUrl} alt="每日抽卡分享卡片" className="w-full" />
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
                  className="flex-1 py-3 rounded-xl text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  下载图片
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white hover:brightness-110 transition-all"
                  style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})` }}
                >
                  分享
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
