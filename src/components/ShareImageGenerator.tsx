'use client';

import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import type { PersonalityType } from '@/lib/personalities';
import { getTypeImage } from '@/lib/personalities';
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

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const shareAssetCache = new Map<string, Promise<string>>();

async function imageToDataUrl(src: string): Promise<string> {
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
    // Some browsers reject decode() for already-decoded images; the loaded bitmap is still usable.
  }

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext('2d')!.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

function getCachedImageDataUrl(src: string): Promise<string> {
  const cached = shareAssetCache.get(src);
  if (cached) return cached;

  const promise = imageToDataUrl(src).catch(error => {
    shareAssetCache.delete(src);
    throw error;
  });

  shareAssetCache.set(src, promise);
  return promise;
}

async function waitForImageElement(img: HTMLImageElement | null, src: string): Promise<void> {
  if (!img) {
    throw new Error('Missing share-card image node');
  }

  if (img.src === src && img.complete && img.naturalWidth > 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const handleLoad = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('Share-card image render failed'));
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
    // decode() is best-effort here; load completion is the actual correctness gate.
  }
}

async function waitForPaint(): Promise<void> {
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export const ShareImageGenerator = forwardRef<ShareImageGeneratorHandle, Props>(
  function ShareImageGenerator({ personality, dimensionScores }, ref) {
  const cardRef = useRef<HTMLDivElement>(null);
  const typeImageRef = useRef<HTMLImageElement>(null);
  const qrImageRef = useRef<HTMLImageElement>(null);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const siteLabel = SHARE_SITE_URL;

  const generateQR = useCallback(async () => {
    const dataUrl = await QRCode.toDataURL(SHARE_SITE_URL, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#00000000' },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  }, []);

  const prepareAssets = useCallback(async () => {
    const imageSrc = getTypeImage(personality.slug);
    const [qr, typeImage] = await Promise.all([
      generateQR(),
      getCachedImageDataUrl(imageSrc),
    ]);

    return { qr, typeImage };
  }, [generateQR, personality.slug]);

  useEffect(() => {
    void prepareAssets();
  }, [prepareAssets]);

  const handleGenerate = useCallback(async () => {
    if (!cardRef.current || generating) return;
    setGenerating(true);

    try {
      const { qr, typeImage } = await prepareAssets();

      await Promise.all([
        waitForImageElement(qrImageRef.current, qr),
        waitForImageElement(typeImageRef.current, typeImage),
      ]);
      await waitForPaint();

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: '#0c0a09',
        cacheBust: true,
      });

      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate share image:', err);
    } finally {
      setGenerating(false);
    }
  }, [generating, prepareAssets]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    if (isMobile()) {
      // On mobile, <a download> often doesn't work — open in new tab so user can long-press save
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>SBTI-${personality.code}</title><style>*{margin:0;padding:0}body{background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh}img{max-width:100%;height:auto}</style></head><body><img src="${previewUrl}" alt="SBTI-${personality.code}"></body></html>`);
        w.document.close();
      }
    } else {
      const link = document.createElement('a');
      link.download = `SBTI-${personality.code}.png`;
      link.href = previewUrl;
      link.click();
    }
  }, [previewUrl, personality.code]);

  const handleShare = useCallback(async () => {
    if (!previewUrl) return;
    try {
      const blob = await (await fetch(previewUrl)).blob();
      const file = new File([blob], `SBTI-${personality.code}.png`, { type: 'image/png' });
      if (navigator.share) {
        await navigator.share({ files: [file], title: `我的 SBTI 人格：${personality.name}` });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  }, [previewUrl, personality.code, personality.name, handleDownload]);

  // Expose generate method for external triggers (e.g. top-right share button)
  useImperativeHandle(ref, () => ({
    generate: () => { handleGenerate(); },
  }), [handleGenerate]);

  return (
    <div>
      {/* Generate button */}
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

      {/* Hidden share card — rendered offscreen, captured by html-to-image */}
      <div
        className="fixed"
        style={{ left: '-9999px', top: 0, zIndex: -1 }}
        aria-hidden
      >
        <div
          ref={cardRef}
          style={{
            width: 540,
            height: 960,
            fontFamily: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif',
            background: '#0c0a09',
            color: '#fafaf9',
            overflow: 'hidden',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Background grid + Glow (Rich content aesthetic) */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(#292524 1px, transparent 1px), linear-gradient(90deg, #292524 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              opacity: 0.1,
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              width: '100%', height: '50%',
              background: `radial-gradient(circle at 50% 30%, ${personality.color}35, transparent 60%)`,
              position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
            }}
          />

          {/* Top Navbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 36px 0', position: 'relative' }}>
             <div style={{ fontSize: 13, letterSpacing: '0.2em', color: '#78716c', fontFamily: 'monospace' }}>
              SBTI 人格报告 //
             </div>
             <div style={{ fontSize: 11, letterSpacing: '0.02em', color: '#a8a29e', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {siteLabel}
             </div>
          </div>

          <div style={{ flex: 1, padding: '0 36px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* Title / Intro */}
            <div style={{ marginTop: 40, marginBottom: 20 }}>
              <div style={{ fontSize: 16, color: '#a8a29e', marginBottom: 8, letterSpacing: '0.05em' }}>
                在SBTI商业性格测定中，我被鉴定为
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', color: '#fafaf9' }}>
                  {personality.name}
                </span>
                <span style={{ fontSize: 20, fontFamily: 'monospace', letterSpacing: '0.2em', color: personality.color, fontWeight: 600 }}>
                  {personality.code}
                </span>
              </div>
            </div>

            {/* Huge Image Block */}
            <div
              style={{
                width: '100%', height: 280,
                borderRadius: 24,
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${personality.color}15, ${personality.color}05)`,
                border: `1px solid ${personality.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 28,
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={typeImageRef}
                src={TRANSPARENT_PIXEL}
                alt={personality.name}
                width={220} height={220}
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.4))' }}
              />
              <div style={{ position: 'absolute', bottom: 16, right: 16, background: '#00000080', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 999, fontSize: 12, color: personality.color, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                #{personality.isSpecial ? '特殊人格' : '标准人格'}
              </div>
            </div>

            {/* Description Box with Glassmorphism */}
            <div style={{
              background: '#ffffff05', border: '1px solid #ffffff10', borderRadius: 16,
              padding: '24px', marginBottom: 28
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: personality.color, marginBottom: 12 }}>
                "{personality.tagline}"
              </div>
              <div style={{ fontSize: 14, color: '#d6d3d1', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {personality.description}
              </div>
            </div>

            {/* Top 3 Traits Graph - pure CSS */}
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#78716c', marginBottom: 16 }}>核心特质 TOP 3</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {dimensionScores.slice(0, 3).map((score) => {
                   const dim = DIMENSIONS.find(d => d.id === score.id)!;
                   const percentage = Math.max(10, (score.score / 15) * 100);
                   const mc = MODEL_COLORS[dim.model];
                   return (
                     <div key={dim.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <div style={{ width: 80, fontSize: 13, color: '#a8a29e', whiteSpace: 'nowrap' }}>{dim.name}</div>
                       <div style={{ flex: 1, height: 8, background: '#ffffff10', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: percentage + '%', background: mc.base, borderRadius: 999 }} />
                       </div>
                       <div style={{ width: 40, textAlign: 'right', fontSize: 14, fontFamily: 'monospace', color: mc.base, fontWeight: 600 }}>{score.score}</div>
                     </div>
                   )
                 })}
               </div>
            </div>

          </div>

          {/* Bottom Footer (90px height) */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 36px',
              borderTop: '1px solid #ffffff10',
              background: '#0c0a09',
              position: 'relative'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fafaf9', marginBottom: 6, letterSpacing: '0.05em' }}>
                测测你的隐藏人格？
              </div>
              <div style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {siteLabel}
              </div>
            </div>
            
            <div
              style={{
                width: 80, height: 80,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                padding: 4
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={qrImageRef} src={TRANSPARENT_PIXEL} alt="QR Code" width={72} height={72} />
            </div>
          </div>

        </div>
      </div>

      {/* Preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Preview image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="分享图片" className="w-full" />
            </div>

            {/* Mobile hint */}
            <p className="text-center text-xs text-text-muted mb-3 sm:hidden">
              💡 长按上方图片可直接保存到相册
            </p>

            {/* Actions */}
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

            {/* Close hint */}
            <p className="text-center text-xs text-text-muted mt-4">
              点击空白处关闭
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
