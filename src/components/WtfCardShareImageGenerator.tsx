'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { SHARE_SITE_URL } from '@/lib/site';
import {
  encodeCardData, getLitCount, getTotalCount, CARD_UNIVERSE_IDS,
  type WtfCardData,
} from '@/lib/wtf-card';
import { getUniverse } from '@/lib/universes';
import { resolvePersonality } from '@/lib/personality-resolver';

export interface WtfCardShareImageGeneratorHandle {
  generate: () => void;
}

interface Props {
  card: WtfCardData;
}

const CARD_WIDTH = 540;
const CARD_HEIGHT = 960;
const CARD_SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const BG = '#FFF9F2';
const DARK = '#2D2A26';
const MED = '#6B6560';
const MUTED = '#9C9590';
const DIV = '#e8e0d6';
const ACCENT = '#e06088';

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    const onLoad = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error(`Image load failed: ${src}`)); };
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
  const promise = loadImage(src).catch(err => { imageCache.delete(src); throw err; });
  imageCache.set(src, promise);
  return promise;
}

// ─── Canvas rendering ────────────────────────────────────

async function renderCardImage(card: WtfCardData): Promise<string> {
  const shareUrl = `${SHARE_SITE_URL}card/?c=${encodeCardData(card)}`;

  const qrDataUrl = await toQrDataUrl(shareUrl, {
    width: 200, margin: 1,
    color: { dark: '#2D2A26', light: BG },
    errorCorrectionLevel: 'M',
  });
  const qrImage = await getCachedImage(qrDataUrl).catch(() => null);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * CARD_SCALE;
  canvas.height = CARD_HEIGHT * CARD_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.scale(CARD_SCALE, CARD_SCALE);
  ctx.textBaseline = 'top';

  const PAD = 32;
  const CW = CARD_WIDTH - PAD * 2; // content width

  // ── Background ──
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Subtle border
  roundRectPath(ctx, 1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2, 24);
  ctx.strokeStyle = DIV;
  ctx.lineWidth = 1;
  ctx.stroke();

  let y = 36;

  // ── Header: WTF CARD ──
  ctx.font = `600 10px ${FONT_MONO}`;
  ctx.fillStyle = ACCENT;
  ctx.letterSpacing = '3px';
  const headerText = 'W T F   C A R D';
  const headerW = ctx.measureText(headerText).width;
  ctx.fillText(headerText, (CARD_WIDTH - headerW) / 2, y);
  ctx.letterSpacing = '0px';
  y += 28;

  // ── Nickname + ID ──
  const nickname = card.nickname || '匿名';
  ctx.font = `700 22px ${FONT_SANS}`;
  ctx.fillStyle = DARK;
  const nameW = ctx.measureText(nickname).width;
  ctx.fillText(nickname, (CARD_WIDTH - nameW) / 2, y);
  y += 30;

  ctx.font = `400 10px ${FONT_MONO}`;
  ctx.fillStyle = MUTED;
  const idText = `#${card.id.toUpperCase()} · ${card.createdAt}`;
  const idW = ctx.measureText(idText).width;
  ctx.fillText(idText, (CARD_WIDTH - idW) / 2, y);
  y += 28;

  // ── Divider ──
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CARD_WIDTH - PAD, y);
  ctx.strokeStyle = DIV;
  ctx.lineWidth = 1;
  ctx.stroke();
  y += 20;

  // ── Progress text ──
  const litCount = getLitCount(card);
  const totalCount = getTotalCount();
  ctx.font = `600 13px ${FONT_SANS}`;
  ctx.fillStyle = MED;
  const progText = `已点亮 ${litCount} / ${totalCount} 个宇宙`;
  const progW = ctx.measureText(progText).width;
  ctx.fillText(progText, (CARD_WIDTH - progW) / 2, y);
  y += 30;

  // ── Progress bar ──
  const barX = PAD + 20;
  const barW = CW - 40;
  const barH = 8;
  fillRoundedRect(ctx, barX, y, barW, barH, 4, DIV);
  if (litCount > 0) {
    const filledW = Math.max(barH, barW * (litCount / totalCount));
    fillRoundedRect(ctx, barX, y, filledW, barH, 4, ACCENT);
  }
  y += 28;

  // ── Badge grid (2 cols) ──
  const BADGE_GAP = 10;
  const BADGE_COLS = 2;
  const BADGE_W = (CW - BADGE_GAP * (BADGE_COLS - 1)) / BADGE_COLS;
  const BADGE_H = 56;

  for (let i = 0; i < CARD_UNIVERSE_IDS.length; i++) {
    const uid = CARD_UNIVERSE_IDS[i];
    const col = i % BADGE_COLS;
    const row = Math.floor(i / BADGE_COLS);
    const bx = PAD + col * (BADGE_W + BADGE_GAP);
    const by = y + row * (BADGE_H + BADGE_GAP);

    const result = card.results[uid];
    const universe = getUniverse(uid);
    if (!universe) continue;

    const resolved = result ? resolvePersonality(uid, result.slug) : null;

    if (resolved) {
      // Lit badge
      fillRoundedRect(ctx, bx, by, BADGE_W, BADGE_H, 12, '#FFFFFF');
      roundRectPath(ctx, bx, by, BADGE_W, BADGE_H, 12);
      ctx.strokeStyle = DIV;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Emoji
      ctx.font = `24px ${FONT_SANS}`;
      ctx.fillStyle = DARK;
      ctx.fillText(resolved.emoji, bx + 12, by + 14);

      // Universe short name
      ctx.font = `500 10px ${FONT_MONO}`;
      ctx.fillStyle = MUTED;
      ctx.fillText(universe.shortName, bx + 46, by + 12);

      // Personality name
      ctx.font = `600 14px ${FONT_SANS}`;
      ctx.fillStyle = DARK;
      const pName = resolved.name;
      ctx.fillText(pName.length > 6 ? pName.slice(0, 6) + '…' : pName, bx + 46, by + 28);
    } else {
      // Unlit badge
      fillRoundedRect(ctx, bx, by, BADGE_W, BADGE_H, 12, '#F5F2ED');
      ctx.setLineDash([4, 4]);
      roundRectPath(ctx, bx, by, BADGE_W, BADGE_H, 12);
      ctx.strokeStyle = '#D5D0C8';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Dimmed emoji
      ctx.globalAlpha = 0.3;
      ctx.font = `24px ${FONT_SANS}`;
      ctx.fillText(universe.emoji || '❓', bx + 12, by + 14);
      ctx.globalAlpha = 1;

      // Universe name
      ctx.font = `500 10px ${FONT_MONO}`;
      ctx.fillStyle = MUTED;
      ctx.fillText(universe.shortName, bx + 46, by + 12);

      ctx.font = `400 12px ${FONT_SANS}`;
      ctx.fillStyle = '#C0B8AE';
      ctx.fillText('未解锁', bx + 46, by + 28);
    }
  }

  const totalRows = Math.ceil(CARD_UNIVERSE_IDS.length / BADGE_COLS);
  y += totalRows * (BADGE_H + BADGE_GAP);
  y += 10;

  // ── Divider ──
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(CARD_WIDTH - PAD, y);
  ctx.strokeStyle = DIV;
  ctx.lineWidth = 1;
  ctx.stroke();
  y += 24;

  // ── Bottom: QR + text ──
  const qrSize = 72;
  const bottomX = PAD;

  if (qrImage) {
    ctx.drawImage(qrImage, bottomX, y, qrSize, qrSize);
  }

  const textX = bottomX + qrSize + 16;
  ctx.font = `600 13px ${FONT_SANS}`;
  ctx.fillStyle = DARK;
  ctx.fillText('扫码查看我的 WTF Card', textX, y + 10);

  ctx.font = `400 11px ${FONT_SANS}`;
  ctx.fillStyle = MUTED;
  ctx.fillText('WTFTI.com — 多宇宙人格测试', textX, y + 32);

  ctx.font = `400 10px ${FONT_MONO}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(`${litCount} / ${totalCount} 宇宙已点亮`, textX, y + 52);

  return canvas.toDataURL('image/png');
}

// ─── Component ───────────────────────────────────────────

export const WtfCardShareImageGenerator = forwardRef<WtfCardShareImageGeneratorHandle, Props>(
  function WtfCardShareImageGenerator({ card }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderCardImage(card);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate WTF Card image:', err);
      } finally {
        setGenerating(false);
      }
    }, [card, generating]);

    const createFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `WTF-Card-${card.id}.png`, { type: 'image/png' });
    }, [card.id, previewUrl]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `WTF-Card-${card.id}.png` });
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
      link.download = `WTF-Card-${card.id}.png`;
      link.href = previewUrl;
      link.click();
    }, [card.id, createFile, previewUrl]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: '我的 WTF Card' });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createFile, handleDownload, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    if (!previewUrl) return null;

    return (
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
            <img src={previewUrl} alt="WTF Card 分享图" className="w-full" />
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
    );
  },
);
