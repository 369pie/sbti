'use client';

import NextImage from 'next/image';
import { getSoultiRarity, getSoultiResonance, getSoultiTypeMediumImage, getSoultiTypeEmojiFallbackImage } from '@/lib/soulti/personalities';
import type { SoultiPersonalityType } from '@/lib/soulti/personalities';
import { SHARE_SITE_URL } from '@/lib/site';
import { useState } from 'react';

interface Props {
  personality: SoultiPersonalityType;
  tearRate?: number;
}

const serif = "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";
const mono = "'SF Mono', 'Roboto Mono', ui-monospace, monospace";

/**
 * S-02 · 纵向 9:16 分享卡（小红书/朋友圈风格）
 * 纯 DOM 渲染，用户可截图保存或长按保存。
 * 核心差异化元素：稀有度徽章 · 历史女性肖像/名字 · 诗句 · populationPct
 */
export function SoultiPortraitShareCard({ personality, tearRate }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const rarity = getSoultiRarity(personality.slug);
  const resonance = getSoultiResonance(personality.slug);

  return (
    <div className="mx-auto" style={{ maxWidth: 360 }}>
      <div
        className="relative mx-auto rounded-3xl overflow-hidden"
        style={{
          aspectRatio: '9 / 16',
          background: `linear-gradient(155deg, ${personality.color}22 0%, #FAF8F5 45%, #FDFCFA 100%)`,
          border: `1px solid ${personality.color}30`,
          boxShadow: '0 24px 60px -30px rgba(107,93,77,0.35)',
        }}
      >
        {/* Top ribbon */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: mono, color: '#8b7355' }}>
            SoulTI
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] tracking-[0.15em]"
            style={{
              background: rarity.bgColor,
              color: rarity.color,
              border: `1px solid ${rarity.color}40`,
              fontFamily: mono,
            }}
          >
            {rarity.label} · {rarity.populationPct.toFixed(1)}%
          </span>
        </div>

        {/* Emoji + Code */}
        <div className="absolute top-[12%] left-0 right-0 text-center">
          <div className="text-5xl mb-2" aria-hidden>{personality.emoji}</div>
          <p className="text-[10px] tracking-[0.35em]" style={{ fontFamily: mono, color: personality.color }}>
            {personality.code.split('').join(' · ')}
          </p>
        </div>

        {/* Center image */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '26%', width: 140, height: 140 }}
        >
          <div
            className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${personality.color}15, ${personality.color}05)`,
              border: `1px solid ${personality.color}30`,
            }}
          >
            {!imgFailed ? (
              <NextImage
                src={getSoultiTypeMediumImage(personality.slug)}
                alt={personality.name}
                width={140}
                height={140}
                className="object-contain"
                onError={() => setImgFailed(true)}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getSoultiTypeEmojiFallbackImage(personality.slug, 140)}
                alt={personality.name}
                width={140}
                height={140}
              />
            )}
          </div>
        </div>

        {/* Name */}
        <div className="absolute left-0 right-0 text-center" style={{ top: '53%' }}>
          <h2 className="text-2xl mb-1" style={{ fontFamily: serif, color: '#2D2A26' }}>
            {personality.name}
          </h2>
          <p className="text-xs px-10 leading-[1.9]" style={{ fontFamily: serif, color: '#6a6054' }}>
            {personality.tagline}
          </p>
        </div>

        {/* Quote */}
        {resonance && (
          <div className="absolute left-5 right-5" style={{ top: '66%' }}>
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(139,115,85,0.15)',
              }}
            >
              <p className="text-[11px] leading-[1.9] text-center" style={{ fontFamily: serif, color: '#3a352f', whiteSpace: 'pre-line' }}>
                &ldquo;{resonance.quote}&rdquo;
              </p>
              <p className="mt-2 text-[9px] tracking-[0.2em] text-center" style={{ fontFamily: mono, color: '#8b7355' }}>
                — {resonance.quoteSource}
              </p>
            </div>
            <p className="mt-3 text-[10px] text-center" style={{ fontFamily: serif, color: '#8a7f72' }}>
              与你共振 · {resonance.soulOrigin.zhName}（{resonance.soulOrigin.era}）
            </p>
          </div>
        )}

        {/* Tear rate */}
        {typeof tearRate === 'number' && tearRate > 0 && (
          <div className="absolute left-5 right-5 text-center" style={{ top: '86%' }}>
            <p className="text-[10px] tracking-[0.2em]" style={{ fontFamily: mono, color: '#9a918a' }}>
              裂痕指数 {Math.round(tearRate)} / 100
            </p>
          </div>
        )}

        {/* Bottom brand */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em]" style={{ fontFamily: mono, color: '#9a918a' }}>
            {SHARE_SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}/soulti
          </span>
          <span className="text-[10px] tracking-[0.2em]" style={{ fontFamily: mono, color: '#9a918a' }}>
            {personality.number}
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px]" style={{ fontFamily: mono, color: '#9a918a' }}>
        手机端长按卡片保存图片 · 桌面端请截图
      </p>
    </div>
  );
}
