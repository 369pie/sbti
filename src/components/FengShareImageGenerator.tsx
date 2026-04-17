'use client';

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';
import type { FengPersonality } from '@/lib/feng/personalities';
import type { DimensionScore } from '@/lib/scoring';
import { SHARE_SITE_URL } from '@/lib/site';

export interface FengShareImageHandle {
  generate: () => void;
}

interface Props {
  personality: FengPersonality;
  imageUrl?: string;
  dimensionScores?: DimensionScore[];
}

// 设计 Token
const CARD_W = 540;
const CARD_H = 960; // 3:4 比例，适合小红书
const SCALE = 2;
const FONT_SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const FONT_MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

const BG = '#0a0a0a';

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
    color: { dark: '#ffffff', light: '#0a0a0a' },
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
  const s = Math.min(w / sw, h / sh);
  const dw = sw * s;
  const dh = sh * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

// 渲染主函数
async function renderFengShareImage(p: FengPersonality, imgUrl?: string) {
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

  // 1. 纯黑背景
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 微弱霓虹晕染
  const wash = ctx.createRadialGradient(CARD_W / 2, 280, 0, CARD_W / 2, 280, 320);
  wash.addColorStop(0, hexToRgba(accent, 0.12));
  wash.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_W, 600);

  // 2. 顶部装饰边框
  strokeRoundedRect(ctx, 20, 20, CARD_W - 40, CARD_H - 40, 24, hexToRgba(accent, 0.35), 2);
  strokeRoundedRect(ctx, 28, 28, CARD_W - 56, CARD_H - 56, 18, hexToRgba(accent, 0.15), 1);

  // 角落装饰
  ctx.fillStyle = hexToRgba(accent, 0.5);
  ctx.font = `14px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 32);
  ctx.fillText('✦', CARD_W - 36, 32);
  ctx.fillText('✦', 36, CARD_H - 40);
  ctx.fillText('✦', CARD_W - 36, CARD_H - 40);

  // 3. 顶部文字
  let y = 56;
  ctx.textAlign = 'center';
  ctx.fillStyle = hexToRgba(accent, 0.85);
  ctx.font = `600 12px ${FONT_MONO}`;
  ctx.fillText(`疯TI · 发疯宇宙 · ${p.number}`, CARD_W / 2, y);
  y += 26;

  // 大表情 / 图片
  const emojiSize = 140;
  if (typeImage) {
    ctx.save();
    roundRectPath(ctx, CARD_W / 2 - 100, y, 200, 200, 24);
    ctx.clip();
    drawImageContain(ctx, typeImage, CARD_W / 2 - 100, y, 200, 200);
    ctx.restore();
  } else {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 40;
    ctx.fillText(p.emoji, CARD_W / 2, y + 20);
    ctx.shadowBlur = 0;
  }
  y += 220;

  // CODE
  ctx.fillStyle = accent;
  ctx.font = `700 18px ${FONT_MONO}`;
  ctx.fillText(p.code, CARD_W / 2, y);
  y += 32;

  // 发疯名 - 大号霓虹
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 28;
  ctx.font = `900 42px ${FONT_SANS}`;
  const nameLines = wrapText(ctx, p.fengName, CARD_W - 80, 2);
  nameLines.forEach((line, i) => {
    ctx.fillText(line, CARD_W / 2, y + i * 52);
  });
  ctx.shadowBlur = 0;
  y += nameLines.length * 52 + 20;

  // 标语
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 16px ${FONT_SANS}`;
  const tagLines = wrapText(ctx, `“${p.tagline}”`, CARD_W - 80, 3);
  tagLines.forEach((line, i) => {
    ctx.fillText(line, CARD_W / 2, y + i * 26);
  });
  y += tagLines.length * 26 + 28;

  // 发疯一击卡片
  const cardW = CARD_W - 72;
  const cardX = 36;
  const hitLines = wrapText(ctx, p.copy.wtfHit, cardW - 32, 5);
  const cardH = Math.max(64, hitLines.length * 28 + 28);
  fillRoundedRect(ctx, cardX, y, cardW, cardH, 16, hexToRgba(accent, 0.08));
  strokeRoundedRect(ctx, cardX, y, cardW, cardH, 16, hexToRgba(accent, 0.25), 1);
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 15px ${FONT_SANS}`;
  hitLines.forEach((line, i) => {
    ctx.fillText(line, CARD_W / 2, y + 16 + i * 26);
  });
  y += cardH + 24;

  // 隐藏症状标题
  ctx.fillStyle = hexToRgba(accent, 0.7);
  ctx.font = `600 11px ${FONT_MONO}`;
  ctx.fillText('隐藏症状清单', CARD_W / 2, y);
  y += 22;

  // 症状列表（只显示前3条，防止超出）
  const symptoms = p.copy.symptoms.slice(0, 3);
  ctx.font = `13px ${FONT_SANS}`;
  symptoms.forEach((s, i) => {
    const sLines = wrapText(ctx, s, cardW - 32, 3);
    const rowH = sLines.length * 22 + 6;
    fillRoundedRect(ctx, cardX, y, cardW, rowH, 10, hexToRgba('#ffffff', 0.04));
    ctx.fillStyle = accent;
    ctx.textAlign = 'left';
    ctx.fillText(`${i + 1}.`, cardX + 12, y + 8);
    ctx.fillStyle = '#e5e5e5';
    sLines.forEach((line, li) => {
      ctx.fillText(line, cardX + 28, y + 8 + li * 22);
    });
    ctx.textAlign = 'center';
    y += rowH + 8;
  });

  // 底部水印 + QR
  const footY = CARD_H - 90;
  ctx.strokeStyle = hexToRgba(accent, 0.2);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, footY);
  ctx.lineTo(CARD_W - 36, footY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 14px ${FONT_SANS}`;
  ctx.fillText('测测你的发疯人格', 36, footY + 14);
  ctx.fillStyle = hexToRgba(accent, 0.8);
  ctx.font = `11px ${FONT_MONO}`;
  ctx.fillText(SHARE_SITE_URL, 36, footY + 36);

  // QR 码
  if (qrImage) {
    fillRoundedRect(ctx, CARD_W - 36 - 58, footY + 4, 58, 58, 10, hexToRgba(accent, 0.1));
    strokeRoundedRect(ctx, CARD_W - 36 - 58, footY + 4, 58, 58, 10, hexToRgba(accent, 0.3), 1);
    drawImageContain(ctx, qrImage, CARD_W - 36 - 54, footY + 8, 50, 50);
  }

  return canvas.toDataURL('image/png');
}

// React 组件
export const FengShareImageGenerator = forwardRef<FengShareImageHandle, Props>(
  function FengShareImageGenerator({ personality, imageUrl }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({ resourceId: 'feng:share', universe: 'feng' });

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
        const dataUrl = await renderFengShareImage(personality, imageUrl);
        const finalUrl = await tierCtl.applyOverlay(dataUrl, '#050505', 'FENG');
        setPreviewUrl(finalUrl);
      } catch (err) {
        console.error('Failed to generate Feng share image:', err);
      } finally {
        setGenerating(false);
      }
    }, [generating, imageUrl, personality, tierCtl]);

    const createPreviewFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `FengTI-${personality.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createPreviewFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `FengTI-${personality.code}.png` });
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
      link.download = `FengTI-${personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createPreviewFile, personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createPreviewFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `疯TI · 我竟然是${personality.fengName}？？` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createPreviewFile, handleDownload, personality.fengName, previewUrl]);

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
          className="w-full py-3.5 rounded-xl font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-black"
          style={{ background: personality.color, boxShadow: `0 0 20px ${personality.color}40` }}
        >
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
              生成中…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              生成疯TI图鉴卡
            </>
          )}
        </button>

        {previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/90 backdrop-blur-sm p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center"
            onClick={() => setPreviewUrl(null)}
          >
            <div
              className="relative w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/75 z-10"
                aria-label="关闭"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="rounded-2xl overflow-hidden shadow-2xl mb-4 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={`疯TI ${personality.number} · ${personality.fengName}`} className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs mb-3 px-4 leading-5" style={{ color: personality.color }}>
                  {saveHint}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-sm text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  保存图片
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl text-bg-primary text-sm font-medium hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 text-black"
                  style={{ background: personality.color }}
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
