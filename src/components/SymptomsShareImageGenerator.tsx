'use client';

import { useCallback, useImperativeHandle, useState, forwardRef } from 'react';
import { toQrDataUrl } from '@/lib/qr-code';
import { useShareTier, ShareTierPicker } from '@/lib/use-share-tier';
import type { WtftiPersonality } from '@/lib/wtfti-personalities';
import { getWtftiTypeImage } from '@/lib/wtfti-personalities';
import { SHARE_SITE_URL } from '@/lib/site';

export interface SymptomsShareImageHandle {
  generate: () => void;
}

interface Props {
  personality: WtftiPersonality;
  hitCount: number;
  totalSymptoms: number;
  checkedIndexes: Set<number>;
}

const W = 540;
const MAX_H = 3000;
const S = 2;
const SANS = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif';
const MONO = '"SF Mono", "Roboto Mono", ui-monospace, monospace';

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

function hexAlpha(hex: string, a: number) {
  const n = hex.replace('#', '');
  const v = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const r = Number.parseInt(v.slice(0, 2), 16);
  const g = Number.parseInt(v.slice(2, 4), 16);
  const b = Number.parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function fillRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, stroke: string, lw = 1) {
  roundRect(ctx, x, y, w, h, r);
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    const onLoad = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error(`Load: ${src}`)); };
    const cleanup = () => { img.removeEventListener('load', onLoad); img.removeEventListener('error', onError); };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    img.src = src;
    if (img.complete && img.naturalWidth > 0) { cleanup(); resolve(); }
  });
  try { await img.decode(); } catch { /* ok */ }
  return img;
}

function drawContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function renderSymptomsCard(
  p: WtftiPersonality,
  hitCount: number,
  totalSymptoms: number,
  checkedIndexes: Set<number>,
) {
  const BG = '#1a1118';
  const CARD_BG = '#231c28';
  const LIGHT = '#a89bb0';
  const WHITE = '#f5f0f8';
  const ACCENT = p.color;

  const shareUrl = SHARE_SITE_URL + `wtfti/symptoms/${p.slug}/`;

  const [qrImg, charImg] = await Promise.all([
    toQrDataUrl(shareUrl, {
      width: 200, margin: 1, color: { dark: WHITE, light: BG + 'ff' }, errorCorrectionLevel: 'M',
    }).then(u => loadImage(u)).catch(() => null),
    loadImage(getWtftiTypeImage(p.slug)).catch(() => null),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = W * S;
  canvas.height = MAX_H * S;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');
  ctx.scale(S, S);
  ctx.textBaseline = 'top';

  // BG
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, MAX_H);
  const wash = ctx.createRadialGradient(W / 2, 160, 0, W / 2, 160, 280);
  wash.addColorStop(0, hexAlpha(ACCENT, 0.12));
  wash.addColorStop(1, hexAlpha(ACCENT, 0));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, 400);

  let y = 36;

  // ── Badge ──
  const badge = `📋 WTF ${p.number} 症状清单`;
  ctx.font = `600 12px ${SANS}`;
  const bw = ctx.measureText(badge).width + 24;
  const bx = (W - bw) / 2;
  fillRR(ctx, bx, y, bw, 26, 13, hexAlpha(ACCENT, 0.12));
  strokeRR(ctx, bx, y, bw, 26, 13, hexAlpha(ACCENT, 0.25));
  ctx.fillStyle = ACCENT;
  ctx.textAlign = 'center';
  ctx.fillText(badge, W / 2, y + 6);
  y += 38;

  // ── Character + Name ──
  if (charImg) {
    const imgSize = 120;
    const imgX = (W - imgSize) / 2;
    fillRR(ctx, imgX, y, imgSize, imgSize, 20, CARD_BG);
    ctx.save();
    roundRect(ctx, imgX + 3, y + 3, imgSize - 6, imgSize - 6, 17);
    ctx.clip();
    drawContain(ctx, charImg, imgX + 6, y + 6, imgSize - 12, imgSize - 12);
    ctx.restore();
    y += imgSize + 12;
  } else {
    ctx.font = `72px ${SANS}`;
    ctx.fillText(p.emoji, W / 2, y);
    y += 84;
  }

  ctx.fillStyle = WHITE;
  ctx.font = `700 32px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(p.wtftiName, W / 2, y);
  y += 38;

  ctx.fillStyle = ACCENT;
  ctx.font = `600 13px ${MONO}`;
  ctx.fillText(p.code, W / 2, y);
  y += 26;

  // ── Hit counter ──
  const counterY = y;
  const counterH = 56;
  fillRR(ctx, 36, counterY, W - 72, counterH, 16, hexAlpha(ACCENT, 0.1));
  strokeRR(ctx, 36, counterY, W - 72, counterH, 16, hexAlpha(ACCENT, 0.2));

  ctx.fillStyle = ACCENT;
  ctx.font = `800 28px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(`${hitCount} / ${totalSymptoms}`, W / 2, counterY + 10);
  ctx.fillStyle = LIGHT;
  ctx.font = `11px ${SANS}`;
  ctx.fillText('枪', W / 2 + 40, counterY + 18);
  y += counterH + 16;

  // ── Verdict ──
  const verdict = hitCount >= totalSymptoms
    ? `全中 💀 已确诊${p.wtftiName}`
    : hitCount >= 4
      ? `中了 ${hitCount} 枪 😵 高度疑似`
      : hitCount >= 3
        ? `中了 ${hitCount} 枪 🫣 有点像`
        : hitCount >= 2
          ? `中了 ${hitCount} 枪 🤔 轻微症状`
          : `中了 ${hitCount} 枪 😌 还有救`;
  ctx.fillStyle = WHITE;
  ctx.font = `600 14px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(verdict, W / 2, y);
  y += 28;

  // ── Symptoms list ──
  ctx.textAlign = 'left';
  p.copy.symptoms.forEach((symptom, i) => {
    const isHit = checkedIndexes.has(i);
    const rowH = 34;

    if (isHit) {
      fillRR(ctx, 36, y, W - 72, rowH, 10, hexAlpha(ACCENT, 0.08));
    }

    // Checkbox
    const cbX = 48;
    const cbY = y + 8;
    const cbSize = 16;
    if (isHit) {
      fillRR(ctx, cbX, cbY, cbSize, cbSize, 4, ACCENT);
      ctx.fillStyle = '#fff';
      ctx.font = `bold 11px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText('✓', cbX + cbSize / 2, cbY + 2);
    } else {
      strokeRR(ctx, cbX, cbY, cbSize, cbSize, 4, hexAlpha(LIGHT, 0.4));
    }

    // Text
    ctx.textAlign = 'left';
    ctx.fillStyle = isHit ? WHITE : LIGHT;
    ctx.font = `${isHit ? '600' : '400'} 13px ${SANS}`;
    ctx.fillText(symptom, cbX + cbSize + 10, y + 9);

    y += rowH + 4;
  });
  y += 8;

  // ── CTA ──
  ctx.fillStyle = LIGHT;
  ctx.font = `italic 12px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('你中了几枪？扫码来打勾 →', W / 2, y);
  y += 28;

  // ── Footer ──
  const H = y + 76;
  const fY = H - 72;

  ctx.strokeStyle = hexAlpha(LIGHT, 0.15);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(36, fY);
  ctx.lineTo(W - 36, fY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = WHITE;
  ctx.font = `600 13px ${SANS}`;
  ctx.fillText('WTFTI 症状清单', 36, fY + 10);
  ctx.fillStyle = ACCENT;
  ctx.font = `11px ${MONO}`;
  ctx.fillText(shareUrl, 36, fY + 30);

  fillRR(ctx, W - 36 - 56, fY + 4, 56, 56, 10, CARD_BG);
  if (qrImg) drawContain(ctx, qrImg, W - 36 - 52, fY + 8, 48, 48);

  // ── Crop + border ──
  const out = document.createElement('canvas');
  out.width = W * S;
  out.height = H * S;
  const oc = out.getContext('2d');
  if (!oc) throw new Error('No context');
  oc.drawImage(canvas, 0, 0);
  oc.scale(S, S);
  strokeRR(oc, 14, 14, W - 28, H - 28, 22, hexAlpha(ACCENT, 0.35), 2.5);
  strokeRR(oc, 22, 22, W - 44, H - 44, 16, hexAlpha(ACCENT, 0.1), 1);

  // Corner ornaments
  oc.fillStyle = hexAlpha(ACCENT, 0.4);
  oc.font = `13px ${SANS}`;
  oc.textAlign = 'center';
  oc.textBaseline = 'top';
  oc.fillText('✦', 36, 28);
  oc.fillText('✦', W - 36, 28);
  oc.fillText('✦', 36, H - 42);
  oc.fillText('✦', W - 36, H - 42);

  return out.toDataURL('image/png');
}

export const SymptomsShareImageGenerator = forwardRef<SymptomsShareImageHandle, Props>(
  function SymptomsShareImageGenerator({ personality, hitCount, totalSymptoms, checkedIndexes }, ref) {
    const [generating, setGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saveHint, setSaveHint] = useState<string | null>(null);
    const tierCtl = useShareTier({ resourceId: `symptoms:${personality.code}`, universe: 'symptoms' });

    const handleGenerate = useCallback(async () => {
      if (generating) return;
      if (await tierCtl.ensurePaid()) return;
      setGenerating(true);
      setSaveHint(null);
      try {
        const url = await renderSymptomsCard(personality, hitCount, totalSymptoms, checkedIndexes);
        const finalUrl = await tierCtl.applyOverlay(url, '#FFF1F4', 'WTF');
        setPreviewUrl(finalUrl);
      } catch (err) {
        console.error('Failed to generate symptoms card:', err);
      } finally {
        setGenerating(false);
      }
    }, [checkedIndexes, generating, hitCount, personality, totalSymptoms, tierCtl]);

    const createFile = useCallback(async () => {
      if (!previewUrl) return null;
      const blob = await (await fetch(previewUrl)).blob();
      return new File([blob], `WTF-症状-${personality.code}${tierCtl.fileSuffix}.png`, { type: 'image/png' });
    }, [personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleDownload = useCallback(async () => {
      if (!previewUrl) return;
      if (isMobile()) {
        try {
          const file = await createFile();
          if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
            setSaveHint('请在系统菜单里选择"保存到照片"或"存储到文件"。');
            await navigator.share({ files: [file], title: `WTF-症状-${personality.code}.png` });
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
      link.download = `WTF-症状-${personality.code}${tierCtl.fileSuffix}.png`;
      link.href = previewUrl;
      link.click();
    }, [createFile, personality.code, previewUrl, tierCtl.fileSuffix]);

    const handleShare = useCallback(async () => {
      if (!previewUrl) return;
      try {
        const file = await createFile();
        if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `${personality.wtftiName}症状清单` });
        } else {
          await handleDownload();
        }
      } catch {
        await handleDownload();
      }
    }, [createFile, handleDownload, personality.wtftiName, previewUrl]);

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
          className="w-full py-3.5 rounded-xl text-white font-medium text-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: personality.color }}
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
              生成症状卡片
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
                <img src={previewUrl} alt="症状卡片" className="w-full" />
              </div>

              <p className="text-center text-xs text-white/60 mb-3 sm:hidden">
                💡 长按上方图片可直接保存到相册
              </p>

              {saveHint && (
                <p className="text-center text-xs text-amber-400 mb-3 px-4 leading-5">
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
                  style={{ background: personality.color }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  发给朋友
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
