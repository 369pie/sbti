'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';
import { SHARE_SITE_URL } from '@/lib/site';
import { MYSTI_THEMES } from '@/lib/mysti/themes';
import type { MystiTheme, MystiShareImageGeneratorHandle } from '@/lib/mysti/types';
import type { DailyCardInterpretation } from '@/lib/mysti/daily-card';
import { formatDateCN } from '@/lib/mysti/daily-card';
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
) {
  ctx.save();
  ctx.shadowColor = hexToRgba(theme.accent, 0.18);
  ctx.shadowBlur = 24;
  fillRoundedRect(ctx, x, y, w, h, 10, theme.cardSurface);
  ctx.restore();

  strokeRoundedRect(ctx, x, y, w, h, 10, theme.cardBorder, 1.5);
  strokeRoundedRect(ctx, x + 6, y + 6, w - 12, h - 12, 6, hexToRgba(theme.divider, 0.6), 1);
  drawOrnaments(ctx, x + 2, y + 2, w - 4, h - 4, theme.accent);
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
  const url = `${SHARE_SITE_URL}mysti/daily/`;
  return toQrDataUrl(url, { width: 200, margin: 1, color: { dark: '#2D2A26', light: '#FFF9F2' } });
}

async function renderDailyShareImage(
  dailyCard: DailyCardInterpretation,
  themeId: MystiTheme['id'],
): Promise<string> {
  const theme = MYSTI_THEMES[themeId];
  const dateStr = formatDateCN(new Date());

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  const canvasHeight = 1200;
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

  // Decorative radial glow
  const glow = ctx.createRadialGradient(CARD_WIDTH / 2, 300, 40, CARD_WIDTH / 2, 300, 360);
  glow.addColorStop(0, hexToRgba(theme.accent, 0.08));
  glow.addColorStop(1, hexToRgba(theme.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, 800);

  const qrDataUrl = await createQrImage();
  const W = CARD_WIDTH;
  const cx = W / 2;
  let y = 44;

  // Brand
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `14px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('WTFTI · 每日一牌', cx, y);
  y += 32;

  // Date
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(dateStr, cx, y);
  y += 32;

  // Arcana header
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText('大阿卡纳', cx, y);
  y += 20;
  ctx.font = `bold 26px ${FONT_SANS}`;
  ctx.fillStyle = theme.text;
  ctx.fillText(dailyCard.arcanaNameCN, cx, y);
  y += 28;
  ctx.font = `14px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(dailyCard.arcanaName, cx, y);
  y += 28;

  // Divider
  ctx.beginPath();
  ctx.moveTo(cx - 60, y);
  ctx.lineTo(cx + 60, y);
  ctx.strokeStyle = theme.divider;
  ctx.lineWidth = 1;
  ctx.stroke();
  y += 24;

  // Tarot card frame with symbol inside
  const tw = 264;
  const th = 396;
  const tx = cx - tw / 2;
  drawTarotFrame(ctx, tx, y, tw, th, theme);

  // Card content
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.accent;
  ctx.font = `72px ${FONT_SERIF}`;
  ctx.fillText(dailyCard.arcanaNameCN.slice(0, 1), cx, y + th / 2 - 20);
  ctx.fillStyle = theme.text;
  ctx.font = `20px ${FONT_SANS}`;
  ctx.fillText(dailyCard.arcanaNameCN, cx, y + th / 2 + 40);
  ctx.fillStyle = theme.textMuted;
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillText(dailyCard.arcanaName, cx, y + th / 2 + 65);

  // Lucky number circle
  ctx.beginPath();
  ctx.arc(cx + tw / 2 - 30, y + th - 30, 16, 0, Math.PI * 2);
  ctx.fillStyle = theme.accentSoft;
  ctx.fill();
  ctx.fillStyle = theme.accent;
  ctx.font = `bold 14px ${FONT_SANS}`;
  ctx.fillText(String(dailyCard.luckyNumber), cx + tw / 2 - 30, y + th - 30 + 1);
  ctx.restore();

  y += th + 24;

  // Keywords
  ctx.font = `13px ${FONT_SANS}`;
  const kwGap = 10;
  const kwPaddings = [10, 6];
  let kwTotalW = 0;
  const kwWidths: number[] = [];
  for (const kw of dailyCard.keywords) {
    const w = ctx.measureText(kw).width + kwPaddings[0] * 2;
    kwWidths.push(w);
    kwTotalW += w;
  }
  kwTotalW += (dailyCard.keywords.length - 1) * kwGap;
  let kx = cx - kwTotalW / 2;
  for (let i = 0; i < dailyCard.keywords.length; i++) {
    const kw = dailyCard.keywords[i];
    const w = kwWidths[i];
    fillRoundedRect(ctx, kx, y, w, 26, 13, theme.accentSoft);
    ctx.fillStyle = theme.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `13px ${FONT_SANS}`;
    ctx.fillText(kw, kx + w / 2, y + 13);
    kx += w + kwGap;
  }
  y += 42;

  // Daily reading quote card
  const quotePadX = 28;
  const quotePadY = 24;
  const quoteW = 460;
  const quoteInnerW = quoteW - quotePadX * 2;
  ctx.font = `14px ${FONT_SANS}`;
  const readingLines = wrapText(ctx, dailyCard.dailyReading, quoteInnerW);
  const lineH = 20;
  const quoteH = readingLines.length * lineH + quotePadY * 2 + 16;
  const qx = cx - quoteW / 2;

  fillRoundedRect(ctx, qx, y, quoteW, quoteH, 12, theme.accentSoft);

  // Section label
  ctx.font = `12px ${FONT_SANS}`;
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('✦ 今日解读 ✦', cx, y + 10);

  // Reading text
  ctx.font = `14px ${FONT_SANS}`;
  ctx.fillStyle = theme.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let ry = y + quotePadY + 14;
  for (const line of readingLines) {
    ctx.fillText(line, cx, ry);
    ry += lineH;
  }
  y += quoteH + 16;

  // Action card
  const actionPadY = 16;
  const actionH = 60;
  fillRoundedRect(ctx, qx, y, quoteW, actionH, 12, hexToRgba(theme.cardSurface, 0.6));
  strokeRoundedRect(ctx, qx, y, quoteW, actionH, 12, hexToRgba(theme.divider, 0.5), 1);

  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('🎯 今日行动', cx, y + 10);

  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillStyle = theme.text;
  ctx.fillText(dailyCard.action, cx, y + 30);
  y += actionH + 16;

  // Lucky color + number
  const luckyW = 220;
  const luckyH = 60;
  const luckyGap = 20;
  const luckyLeftX = cx - luckyW - luckyGap / 2;
  const luckyRightX = cx + luckyGap / 2;

  // Lucky color box
  fillRoundedRect(ctx, luckyLeftX, y, luckyW, luckyH, 8, hexToRgba(theme.cardSurface, 0.6));
  strokeRoundedRect(ctx, luckyLeftX, y, luckyW, luckyH, 8, hexToRgba(theme.divider, 0.5), 1);
  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText('幸运色', luckyLeftX + luckyW / 2, y + 10);

  // Color circle
  ctx.beginPath();
  ctx.arc(luckyLeftX + luckyW / 2 - 24, y + 36, 8, 0, Math.PI * 2);
  ctx.fillStyle = dailyCard.luckyColor;
  ctx.fill();
  ctx.strokeStyle = theme.divider;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillStyle = theme.text;
  ctx.fillText(dailyCard.luckyColor, luckyLeftX + luckyW / 2 + 8, y + 36 + 4);

  // Lucky number box
  fillRoundedRect(ctx, luckyRightX, y, luckyW, luckyH, 8, hexToRgba(theme.cardSurface, 0.6));
  strokeRoundedRect(ctx, luckyRightX, y, luckyW, luckyH, 8, hexToRgba(theme.divider, 0.5), 1);
  ctx.font = `11px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText('幸运数', luckyRightX + luckyW / 2, y + 10);

  ctx.font = `bold 24px ${FONT_SERIF}`;
  ctx.fillStyle = theme.accent;
  ctx.fillText(String(dailyCard.luckyNumber), luckyRightX + luckyW / 2, y + 30);

  y += luckyH + 24;

  // QR code & footer
  const qrSize = 84;
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
  ctx.fillText('wtfti.com/mysti/daily', cx, y + qrSize + 10);

  ctx.font = `13px ${FONT_SANS}`;
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('扫码抽取今日卡牌', cx, y + qrSize + 32);
  y += qrSize + 60;

  // Crop to actual content height
  const cropH = Math.max(y + 24, 1000);
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = canvas.width;
  croppedCanvas.height = cropH * CARD_SCALE;
  const cctx = croppedCanvas.getContext('2d');
  if (!cctx) throw new Error('Crop canvas context unavailable');
  cctx.drawImage(canvas, 0, 0, canvas.width, croppedCanvas.height, 0, 0, canvas.width, croppedCanvas.height);
  return croppedCanvas.toDataURL('image/png');
}

interface Props {
  dailyCard: DailyCardInterpretation;
  themeId?: MystiTheme['id'];
}

export const MystiDailyShareImageGenerator = forwardRef<MystiShareImageGeneratorHandle, Props>(
  function MystiDailyShareImageGenerator({ dailyCard, themeId = 'celestial' }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({ resourceId: 'mysti-daily:share', universe: 'mysti-daily' });

    const theme = MYSTI_THEMES[themeId];

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);
      trackMystiEvent('mysti_daily_share', { arcanaName: dailyCard.arcanaNameCN });
      try {
        const dataUrl = await renderDailyShareImage(dailyCard, themeId);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#0A0612', 'MYSTI');
        setPreviewUrl(finalUrl);
      } catch (e) {
        console.error('Daily share image generation failed:', e);
      } finally {
        setGenerating(false);
      }
    }, [generating, dailyCard, themeId, tierCtl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `WTFTI-每日一牌-${dailyCard.arcanaNameCN}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [dailyCard.arcanaNameCN, previewUrl, tierCtl.fileSuffix]);

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
      link.download = `WTFTI-每日一牌-${dailyCard.arcanaNameCN}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, dailyCard.arcanaNameCN, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        const title = `今日卡牌：${dailyCard.arcanaNameCN} — WTFTI 每日一牌`;
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, dailyCard.arcanaNameCN, handleDownload, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    return (
      <div>
        <ShareTierPicker
          tier={tierCtl.tier}
          setTier={tierCtl.setTier}
          tierUnlocked={tierCtl.tierUnlocked}
          variant="dark"
          className="mb-3"
        />
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
              📸 生成今日卡牌
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
                <img src={previewUrl} alt="每日一牌分享卡片" className="w-full" />
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
                  style={{ background: `linear-gradient(90deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})` }}
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
