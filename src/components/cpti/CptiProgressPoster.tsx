'use client';

/**
 * CptiProgressPoster
 * ─────────────────────────────────────────────────────────────
 * Sprint 2 polish (2026-04-19) — shareable progress card for the gallery.
 *
 * Renders a hidden 1080×1440 (3:4 Xiaohongshu) poster off-screen, exports
 * via html-to-image, and triggers a download. When 25/25 is reached, swaps
 * to a "graduation" variant with a different headline + gradient.
 */

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  CPTI_RELATIONSHIP_TYPES,
  RELATIONSHIP_TIER_INFO,
  type CptiRelationshipType,
} from '@/lib/cpti/relationships';
import { trackCptiEvent } from '@/lib/cpti/analytics';

interface Props {
  collectedSlugs: Set<string>;
}

export function CptiProgressPoster({ collectedSlugs }: Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const total = CPTI_RELATIONSHIP_TYPES.length;
  const collected = collectedSlugs.size;
  const isGraduated = collected >= total;

  const handleDownload = async () => {
    if (!posterRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: isGraduated ? '#1a0a1f' : '#0f0a1a',
      });
      const link = document.createElement('a');
      link.download = `cpti-progress-${collected}-of-${total}.png`;
      link.href = dataUrl;
      link.click();
      trackCptiEvent('cpti_gallery_progress_shared', {
        collected,
        total,
        graduated: isGraduated,
      });
    } catch (err) {
      console.error('[CptiProgressPoster] export failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const groupedByTier = (['viral', 'deep', 'rare'] as const).map((tier) => ({
    tier,
    info: RELATIONSHIP_TIER_INFO[tier],
    types: CPTI_RELATIONSHIP_TYPES.filter((t) => t.tier === tier),
  }));

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
          isGraduated
            ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-bg-primary shadow-lg hover:shadow-xl'
            : 'bg-gradient-to-r from-rose-500 to-purple-600 text-bg-primary shadow-md hover:shadow-lg'
        } ${downloading ? 'opacity-60 cursor-wait' : 'hover:scale-[1.02]'}`}
      >
        <span className="text-base">{isGraduated ? '🏆' : '📤'}</span>
        {downloading
          ? '生成中…'
          : isGraduated
            ? '保存通关海报 25/25'
            : `晒进度卡 ${collected}/${total}`}
      </button>

      {/* Off-screen poster */}
      <div
        style={{
          position: 'fixed',
          left: '-200vw',
          top: 0,
          width: 1080,
          height: 1440,
          pointerEvents: 'none',
        }}
        aria-hidden
      >
        <div
          ref={posterRef}
          style={{
            width: 1080,
            height: 1440,
            background: isGraduated
              ? 'linear-gradient(160deg, #2a0a35 0%, #1a0428 50%, #350a2a 100%)'
              : 'linear-gradient(160deg, #1a0a2a 0%, #0d0518 50%, #2a0a25 100%)',
            color: 'white',
            padding: '72px 64px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily:
              'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative background glow */}
          <div
            style={{
              position: 'absolute',
              top: -200,
              right: -200,
              width: 600,
              height: 600,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(244,63,94,0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -150,
              left: -150,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 4,
                color: '#f9a8d4',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              CPTI · COUPLE PERSONALITY TYPE INDICATOR
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: 16,
                background: isGraduated
                  ? 'linear-gradient(90deg, #fbbf24, #f43f5e, #a855f7)'
                  : 'linear-gradient(90deg, #f43f5e, #ec4899, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {isGraduated
                ? '我集齐了 25 种关系'
                : '我的关系图鉴'}
            </div>
            <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>
              {isGraduated
                ? '·  CPTI 25/25 全收集 ·'
                : `已解锁 ${collected} / ${total} 种关系类型`}
            </div>
          </div>

          {/* Big progress number */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              margin: '48px 0 32px',
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 220,
                fontWeight: 900,
                lineHeight: 1,
                background: isGraduated
                  ? 'linear-gradient(180deg, #fbbf24, #f97316)'
                  : 'linear-gradient(180deg, #f43f5e, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {collected}
            </div>
            <div style={{ fontSize: 64, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              / {total}
            </div>
          </div>

          {/* Tiered grid of squares */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
            {groupedByTier.map(({ tier, info, types }) => {
              const tierCollected = types.filter((t) => collectedSlugs.has(t.slug)).length;
              return (
                <div key={tier} style={{ marginBottom: 28 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 12,
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: info.color,
                      }}
                    />
                    <span style={{ color: info.color }}>{info.label}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        color: 'rgba(255,255,255,0.45)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {tierCollected} / {types.length}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(types.length, 8)}, 1fr)`,
                      gap: 8,
                    }}
                  >
                    {types.map((t: CptiRelationshipType) => {
                      const got = collectedSlugs.has(t.slug);
                      return (
                        <div
                          key={t.slug}
                          style={{
                            aspectRatio: '1 / 1',
                            borderRadius: 14,
                            background: got
                              ? `linear-gradient(135deg, ${t.color}cc, ${t.color}66)`
                              : 'rgba(255,255,255,0.04)',
                            border: got
                              ? `2px solid ${t.color}`
                              : '2px dashed rgba(255,255,255,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 36,
                            opacity: got ? 1 : 0.35,
                            filter: got ? 'none' : 'grayscale(0.8)',
                          }}
                        >
                          {t.emoji}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              paddingTop: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
                {isGraduated ? '换你来挑战 25/25 ↓' : '一起来集 25 种关系 ↓'}
              </div>
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>
                wtfti.com / cpti
              </div>
            </div>
            <div
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.45)',
                textAlign: 'right',
                lineHeight: 1.5,
              }}
            >
              CPTI 关系图鉴
              <br />
              共 25 种 · 3 个稀有度
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
