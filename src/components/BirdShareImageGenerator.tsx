'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';
import type { BirdPersonality } from '@/lib/bird/personalities';
import type { DimensionScore } from '@/lib/scoring';
import { SHARE_SITE_URL } from '@/lib/site';

export interface BirdShareImageHandle {
  generate: () => void;
}

interface Props {
  personality: BirdPersonality;
  imageUrl?: string;
  dimensionScores?: DimensionScore[];
}

// ─── 设计 Token ───
const CARD_W = 540;
const CARD_H = 960;
const SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const DARK = '#1F1A16';
const MED = '#5B524B';

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
    ? normalized.split('').map(c => c + c).join('')
    : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, fill: string | CanvasGradient,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, stroke: string, lineWidth = 1,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
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
    const onLoad = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error(`Image load failed: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onErr); };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onErr);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* best-effort */ }
  return img;
}

function getCachedImage(src: string) {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = loadImage(src).catch(e => { imageCache.delete(src); throw e; });
  imageCache.set(src, p);
  return p;
}

async function createQrImage() {
  const qrDataUrl = await toQrDataUrl(SHARE_SITE_URL, {
    width: 200,
    margin: 1,
    color: { dark: '#1A2340', light: '#F5F8FF' },
    errorCorrectionLevel: 'M',
  });
  return getCachedImage(qrDataUrl);
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function parseTagEmoji(tag: string) {
  const match = tag.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u);
  if (match) return { emoji: match[1], text: tag.slice(match[0].length) };
  return { emoji: '', text: tag };
}

// ─── 渲染主函数 ───
async function renderBirdShareImage(p: BirdPersonality, imgUrl?: string) {
  const [typeImage, qrImage] = await Promise.all([
    imgUrl ? getCachedImage(imgUrl).catch(() => null) : Promise.resolve(null),
    createQrImage().catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = 'top';

  const accent = p.color;
  const bg = '#FAF8F5';

  // ─── 1. 背景 ───
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 顶部大面积淡色光晕
  const halo = ctx.createRadialGradient(CARD_W / 2, 280, 40, CARD_W / 2, 280, 460);
  halo.addColorStop(0, hexToRgba(accent, 0.10));
  halo.addColorStop(0.55, hexToRgba(accent, 0.04));
  halo.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // ─── 2. 巨幅插画区（占据上半部绝大部分空间）───
  const imgX = 16;
  const imgY = 20;
  const imgW = 508;
  const imgH = 508;
  const imgR = 28;

  // 底座阴影
  ctx.shadowColor = 'rgba(26, 35, 64, 0.12)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 20;
  fillRoundedRect(ctx, imgX, imgY, imgW, imgH, imgR, '#FFFFFF');
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 细边框
  strokeRoundedRect(ctx, imgX, imgY, imgW, imgH, imgR, '#E3EAF5', 1);

  // 插画（留少量边距，让鸟占满框）
  const imgPad = 18;
  if (typeImage) {
    drawImageContain(ctx, typeImage, imgX + imgPad, imgY + imgPad, imgW - imgPad * 2, imgH - imgPad * 2);
  } else {
    ctx.textAlign = 'center';
    ctx.font = `180px ${FONT_SANS}`;
    ctx.fillStyle = hexToRgba(accent, 0.10);
    ctx.fillText(p.emoji, CARD_W / 2, imgY + imgH / 2 - 72);
  }

  // ─── 3. 编号章（画框内右上角）───
  const badgeCX = imgX + imgW - 36;
  const badgeCY = imgY + 36;
  const badgeR = 20;

  ctx.beginPath();
  ctx.arc(badgeCX, badgeCY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = accent;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(badgeCX, badgeCY, badgeR - 6, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = hexToRgba(accent, 0.35);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = DARK;
  ctx.font = `800 12px ${FONT_MONO}`;
  ctx.fillText(p.number, badgeCX, badgeCY - 3);

  // ─── 4. 品牌字标（画框内左上角）───
  ctx.textAlign = 'left';
  ctx.fillStyle = hexToRgba(DARK, 0.28);
  ctx.font = `700 11px ${FONT_SANS}`;
  ctx.fillText('BIRDTI', imgX + 20, imgY + 22);

  // ─── 5. 文字区（紧凑排在下半部）───
  let cursorY = imgY + imgH + 36;

  // 鸟格名称
  ctx.textAlign = 'center';
  ctx.fillStyle = DARK;
  ctx.font = `800 36px ${FONT_SANS}`;
  ctx.fillText(p.birdTitle, CARD_W / 2, cursorY);
  cursorY += 44;

  // 装饰短横线
  fillRoundedRect(ctx, (CARD_W - 32) / 2, cursorY, 32, 4, 2, hexToRgba(accent, 0.28));
  cursorY += 16;

  // 鸟种名 + Code
  ctx.fillStyle = MED;
  ctx.font = `500 15px ${FONT_SANS}`;
  ctx.fillText(`${p.birdName}  ·  ${p.code}`, CARD_W / 2, cursorY);
  cursorY += 26;

  // Tagline
  ctx.fillStyle = accent;
  ctx.font = `600 16px ${FONT_SANS}`;
  const tagLines = wrapText(ctx, `「${p.tagline}」`, CARD_W - 120, 2);
  tagLines.forEach((line) => {
    ctx.fillText(line, CARD_W / 2, cursorY);
    cursorY += 24;
  });
  cursorY += 10;

  // ─── 6. Tags — 垂直列表（干净、不用算宽度、永远不会错）───
  const tagTexts = p.tags.map(parseTagEmoji);
  const tagLineH = 22;
  ctx.font = `500 13px ${FONT_SANS}`;
  ctx.fillStyle = hexToRgba(DARK, 0.72);
  ctx.textAlign = 'center';

  tagTexts.forEach(t => {
    const label = t.emoji ? `${t.emoji}  ${t.text}` : t.text;
    ctx.fillText(label, CARD_W / 2, cursorY);
    cursorY += tagLineH;
  });
  cursorY += 16;

  // ─── 7. Quote bar ───
  const quoteH = 42;
  const quoteMaxW = CARD_W - 100;
  ctx.font = `600 13px ${FONT_SANS}`;
  const quoteLines = wrapText(ctx, p.quote, quoteMaxW, 2);
  fillRoundedRect(ctx, (CARD_W - quoteMaxW) / 2, cursorY, quoteMaxW, quoteH, 12, accent);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  const quoteLineH = 18;
  const quoteStartY = cursorY + quoteH / 2 - (quoteLines.length * quoteLineH) / 2 + 2;
  quoteLines.forEach((line, i) => {
    ctx.fillText(line, CARD_W / 2, quoteStartY + i * quoteLineH);
  });
  cursorY += quoteH;

  // ─── 8. Footer ───
  const footY = CARD_H - 30;
  ctx.textAlign = 'left';
  ctx.fillStyle = hexToRgba(DARK, 0.40);
  ctx.font = `600 12px ${FONT_SANS}`;
  ctx.fillText('测测你是什么鸟', 36, footY);
  ctx.fillStyle = hexToRgba(DARK, 0.22);
  ctx.font = `10px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 36, footY + 16);

  if (qrImage) {
    const qrS = 38;
    fillRoundedRect(ctx, CARD_W - 36 - qrS, footY - 8, qrS, qrS, 8, '#FFFFFF');
    drawImageContain(ctx, qrImage, CARD_W - 33 - qrS, footY - 5, qrS - 6, qrS - 6);
  }

  return canvas.toDataURL('image/png');
}

// ─── React 组件 ───
export const BirdShareImageGenerator = forwardRef<BirdShareImageHandle, Props>(
  function BirdShareImageGenerator({ personality, imageUrl }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({ resourceId: 'bird:share', universe: 'bird' });

    const prepareAssets = useCallback(async () => {
      await Promise.all([
        imageUrl ? getCachedImage(imageUrl).catch(() => null) : Promise.resolve(null),
        createQrImage().catch(() => null),
      ]);
    }, [imageUrl]);

    useEffect(() => {
      void prepareAssets();
    }, [prepareAssets]);

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const dataUrl = await renderBirdShareImage(personality, imageUrl);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#FFF9F2', 'BIRD');
        setPreviewUrl(finalUrl);
      } catch (err) {
        console.error('Failed to generate Bird share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [generating, imageUrl, personality, tierCtl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `BirdTI-${personality.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `BirdTI-${personality.code}.png` });
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
      link.download = `BirdTI-${personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `鸟TI · 我居然是${personality.birdName}？？` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.birdName, previewUrl]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate }), [handleGenerate]);

    const p = personality;

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
          className="w-full py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              生成鸟TI图鉴卡
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
                <img src={previewUrl} alt={`鸟TI ${p.number} · ${p.birdName}·${p.birdTitle}`} className="w-full" />
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
