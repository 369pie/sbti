'use client';

import { useCallback, useRef, useState } from 'react';
import type { HogtiPersonality } from '@/lib/hogti/personalities';
import type { HogCharacter } from '@/lib/hogti/characters';
import type { HogHouseInfo } from '@/lib/hogti/characters';

interface Props {
  personality: HogtiPersonality;
  character: HogCharacter;
  house: HogHouseInfo;
  shareUrl: string;
}

export function HogtiShareCard({ personality: p, character, house, shareUrl }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateCard = useCallback(async () => {
    if (!cardRef.current || generating) return;
    setGenerating(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#1a1535',
      });

      // Mobile: try native share with file
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `hogti-${p.slug}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `霍格沃茨TI · 我是${character.name}`,
              text: p.tagline,
              url: shareUrl,
            });
            setGenerated(true);
            return;
          }
        } catch { /* fall through to download */ }
      }

      // Desktop: download
      const link = document.createElement('a');
      link.download = `hogti-${character.name}-${p.slug}.png`;
      link.href = dataUrl;
      link.click();
      setGenerated(true);
    } catch (err) {
      console.error('Share card generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [generating, p.slug, p.tagline, character.name, shareUrl]);

  return (
    <div className="space-y-4">
      {/* Card preview */}
      <div
        ref={cardRef}
        className="relative mx-auto overflow-hidden rounded-2xl"
        style={{
          width: 340,
          background: `linear-gradient(145deg, #110e2e 0%, #1e1a4a 40%, #2e2460 100%)`,
          boxShadow: `0 0 0 1px ${house.accent}30`,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Starfield dots */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: i % 3 === 0 ? 2 : 1,
                height: i % 3 === 0 ? 2 : 1,
                top: `${5 + (i * 17 + i * 3) % 88}%`,
                left: `${(i * 23 + i * 7) % 95}%`,
                opacity: 0.3 + (i % 4) * 0.1,
              }}
            />
          ))}
        </div>

        {/* House color top bar */}
        <div className="h-1.5" style={{ background: house.accent }} />

        <div className="relative px-8 pt-8 pb-6">
          {/* House badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">{house.emoji}</span>
            <span
              className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ background: house.accent + '22', color: house.accent, fontFamily: 'system-ui, sans-serif' }}
            >
              {house.name} · {house.nameEn}
            </span>
          </div>

          {/* Character emoji big */}
          <div className="text-center mb-4">
            <div className="text-7xl mb-3">{p.emoji}</div>
          </div>

          {/* Character name */}
          <div className="text-center mb-3">
            <div className="text-[11px] tracking-[0.2em] text-white/40 uppercase mb-1" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {p.number} · {character.nameEn}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{character.name}</h2>
            <div
              className="text-xs px-3 py-0.5 rounded-full inline-block"
              style={{ color: house.accent, background: house.accent + '18', fontFamily: 'system-ui, sans-serif' }}
            >
              {character.archetype}
            </div>
          </div>

          {/* Gold divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${house.accent}60)` }} />
            <span style={{ color: house.accent }}>✦</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${house.accent}60)` }} />
          </div>

          {/* Tagline */}
          <p
            className="text-center text-white/85 text-sm leading-relaxed italic mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            "{p.tagline}"
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center mb-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {p.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* URL */}
          <div className="text-center" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <div className="text-[10px] text-white/30 tracking-wider">WTFTI · 霍格沃茨TI</div>
          </div>
        </div>

        {/* House color bottom bar */}
        <div className="h-1" style={{ background: `linear-gradient(to right, ${house.accent}40, ${house.accent}, ${house.accent}40)` }} />
      </div>

      {/* Generate button */}
      <div className="flex justify-center">
        <button
          onClick={generateCard}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer"
          style={{ background: house.accent, color: '#fff' }}
        >
          {generating ? (
            <>
              <span className="animate-spin">⏳</span>
              生成中…
            </>
          ) : generated ? (
            <>✓ 图鉴已保存</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              保存图鉴卡
            </>
          )}
        </button>
      </div>
    </div>
  );
}
