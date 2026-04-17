'use client';

import { useCallback, useRef, useState } from 'react';
import type { FanrentiPersonality } from '@/lib/fanrenti/personalities';
import type { FrCharacter } from '@/lib/fanrenti/characters';
import type { FrRealmInfo } from '@/lib/fanrenti/characters';

interface Props {
  personality: FanrentiPersonality;
  character: FrCharacter;
  realm: FrRealmInfo;
  shareUrl: string;
}

export function FanrentiShareCard({ personality: p, character, realm, shareUrl }: Props) {
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
        backgroundColor: '#0f2320',
      });

      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `fanrenti-${p.slug}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `凡人TI · 我的道心是${character.name}`,
              text: p.tagline,
              url: shareUrl,
            });
            setGenerated(true);
            return;
          }
        } catch { /* fall through to download */ }
      }

      const link = document.createElement('a');
      link.download = `fanrenti-${character.name}-${p.slug}.png`;
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
        className="relative mx-auto overflow-hidden rounded-xl"
        style={{
          width: 340,
          background: `linear-gradient(160deg, #0f1f1c 0%, #162e28 50%, #0f1f1c 100%)`,
          boxShadow: `0 0 0 1px ${realm.accent}30`,
          fontFamily: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
        }}
      >
        {/* Ink wash accent top */}
        <div className="h-1.5" style={{ background: realm.accent }} />

        {/* Ink ellipses background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full opacity-10"
            style={{
              width: 200,
              height: 80,
              top: '20%',
              left: '-10%',
              background: realm.accent,
              filter: 'blur(30px)',
            }}
          />
          <div
            className="absolute rounded-full opacity-8"
            style={{
              width: 150,
              height: 60,
              bottom: '15%',
              right: '-5%',
              background: realm.accent,
              filter: 'blur(25px)',
            }}
          />
        </div>

        <div className="relative px-8 pt-8 pb-6">
          {/* Realm badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">{realm.emoji}</span>
            <span
              className="text-xs font-semibold tracking-widest px-3 py-1 rounded-full"
              style={{ background: realm.accent + '22', color: realm.accent, fontFamily: 'system-ui, sans-serif' }}
            >
              {realm.name}
            </span>
          </div>

          {/* Emoji center */}
          <div className="text-center mb-4">
            <div className="text-7xl mb-3">{p.emoji}</div>
          </div>

          {/* Character name */}
          <div className="text-center mb-3">
            <div className="text-[10px] tracking-[0.2em] text-white/40 mb-1" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {p.number} · {character.nameEn}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{character.name}</h2>
            <div
              className="text-xs px-3 py-0.5 rounded-full inline-block"
              style={{ color: realm.accent, background: realm.accent + '18', fontFamily: 'system-ui, sans-serif' }}
            >
              {character.archetype}
            </div>
          </div>

          {/* Ink divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${realm.accent}50)` }} />
            <span className="text-sm" style={{ color: '#8b2a1a' }}>印</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${realm.accent}50)` }} />
          </div>

          {/* Tagline */}
          <p
            className="text-center text-white/85 text-sm leading-relaxed mb-6"
            style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
          >
            "{p.tagline}"
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center mb-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {p.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stamp watermark & brand */}
          <div className="flex items-end justify-between">
            <div style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div className="text-[10px] text-white/25 tracking-wider">WTFTI · 凡人TI · 修仙</div>
            </div>
            <div
              className="text-xs font-bold rotate-[-12deg] opacity-60"
              style={{ color: '#8b2a1a', fontFamily: '"Noto Serif SC", serif', border: '1px solid #8b2a1a60', padding: '2px 6px', borderRadius: 2 }}
            >
              道心
            </div>
          </div>
        </div>

        <div className="h-1" style={{ background: `linear-gradient(to right, ${realm.accent}40, ${realm.accent}, ${realm.accent}40)` }} />
      </div>

      {/* Generate button */}
      <div className="flex justify-center">
        <button
          onClick={generateCard}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer"
          style={{ background: realm.accent, color: '#f0ede8' }}
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
