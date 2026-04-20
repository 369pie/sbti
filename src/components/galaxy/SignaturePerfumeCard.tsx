'use client';

import type { CSSProperties } from 'react';
import type { SignaturePerfume } from '@/lib/wtfi/signature-perfume';

interface Props {
  perfume: SignaturePerfume;
  /** 来自 soul probe 的"你嗅觉档案"延伸文案，可选 */
  annotation?: string | null;
}

/**
 * SignaturePerfumeCard
 *
 * 编辑式香水 + 灵魂结晶卡片（用于 GalaxyPreview 结果页）。
 * 视觉参考：小红书"你是哪一瓶香水？"测试结果 + 暮光博物笔记。
 */
export function SignaturePerfumeCard({ perfume, annotation }: Props) {
  const accent = perfume.accent;
  return (
    <article
      style={{
        ...wrap,
        border: `1px solid ${accent}3a`,
        boxShadow: `0 30px 80px -36px ${accent}66, 0 0 0 1px rgba(255,255,255,0.04) inset`,
      }}
    >
      <CornerOrnaments accent={accent} />

      {/* 香水瓶视觉 + 名 */}
      <div style={{ textAlign: 'center', padding: '8px 18px 0' }}>
        <p style={{ ...eyebrow, color: '#D4B58A' }}>✦ 你的香水 · YOUR SIGNATURE ✦</p>
        <PerfumeBottle accent={accent} house={perfume.house} name={perfume.name} />
        <h3 style={perfumeName}>
          <em style={{ fontStyle: 'italic' }}>{perfume.name}</em>
        </h3>
        <p style={{ ...houseLabel, color: '#D4B58A' }}>{perfume.house}</p>
        <p style={positioningLine}>
          <em style={{ fontStyle: 'italic' }}>{perfume.year}</em>
          <span style={{ opacity: 0.5, padding: '0 10px' }}>·</span>
          {perfume.positioning}
        </p>
        <div style={chipRow}>
          {perfume.toneChips.map((c) => (
            <span key={c} style={{ ...chip, borderColor: `${accent}55`, color: '#F5F0E8' }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 故事 */}
      <p style={story}>{perfume.story}</p>

      {/* 调香金字塔 */}
      <div style={{ padding: '0 24px' }}>
        <p style={sectionLabel}>香调金字塔 · OLFACTORY PYRAMID</p>
        <div style={pyramidGrid}>
          <PyramidCol label="前调 · 开场" content={perfume.pyramid.top} accent={accent} />
          <PyramidCol label="中调 · 核心" content={perfume.pyramid.heart} accent={accent} />
          <PyramidCol label="后调 · 余韵" content={perfume.pyramid.base} accent={accent} />
        </div>
      </div>

      {/* 季节 / 场合 */}
      <div style={{ padding: '0 24px' }}>
        <p style={sectionLabel}>最适合的季节与场合</p>
        <div style={chipRow}>
          {perfume.occasion.map((c) => (
            <span key={c} style={{ ...occasionChip, color: '#F5F0E8' }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* 编辑视角的呼应 */}
      <p style={{ ...whisper, color: accent }}>「{perfume.whisper}」</p>

      {/* 灵魂结晶 */}
      <div style={{ padding: '0 24px' }}>
        <CrystalRow perfume={perfume} />
      </div>

      {/* 个性化注解（仅 soul probe 用户） */}
      {annotation && (
        <p style={annotationStyle}>
          <span style={{ color: '#D4B58A', letterSpacing: '0.36em' }}>// </span>
          {annotation}
        </p>
      )}
    </article>
  );
}

function PerfumeBottle({
  accent,
  house,
  name,
}: {
  accent: string;
  house: string;
  name: string;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: 132,
        height: 168,
        margin: '8px auto 18px',
      }}
    >
      {/* 瓶塞 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 50,
          height: 18,
          borderRadius: '5px 5px 3px 3px',
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)`,
          boxShadow: `0 2px 6px ${accent}55`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 28,
          height: 8,
          background: `${accent}aa`,
          borderRadius: 1,
        }}
      />
      {/* 瓶身 */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 110,
          height: 142,
          borderRadius: '14px 14px 22px 22px',
          background: `linear-gradient(160deg, ${accent}38 0%, ${accent}14 60%, ${accent}28 100%)`,
          border: `1px solid ${accent}55`,
          boxShadow: `inset 0 -16px 24px ${accent}22, 0 12px 28px -16px ${accent}55, inset 6px 6px 14px rgba(255,255,255,0.06)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: '0 8px',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 9,
            letterSpacing: '0.36em',
            color: '#F5F0E8',
            opacity: 0.85,
          }}
        >
          {house}
        </span>
        <span
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 18,
            color: '#F5F0E8',
            lineHeight: 1.05,
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          {name.length > 14 ? name.split(/[·\s]/)[0] : name}
        </span>
      </div>
      {/* 高光 */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: '32%',
          width: 4,
          height: 96,
          borderRadius: 4,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0))',
          opacity: 0.8,
        }}
      />
    </div>
  );
}

function PyramidCol({
  label,
  content,
  accent,
}: {
  label: string;
  content: string;
  accent: string;
}) {
  return (
    <div
      style={{
        padding: '14px 12px',
        borderRadius: 14,
        border: `1px solid ${accent}30`,
        background:
          'linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(26,21,48,0.4) 100%)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,232,0.55)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: '8px 0 0',
          fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1.4,
          color: '#F5F0E8',
        }}
      >
        {content}
      </p>
    </div>
  );
}

function CrystalRow({ perfume }: { perfume: SignaturePerfume }) {
  const c = perfume.crystal;
  return (
    <div
      style={{
        marginTop: 24,
        padding: '18px 18px 20px',
        borderRadius: 18,
        background:
          'linear-gradient(155deg, rgba(245,240,232,0.06) 0%, rgba(26,21,48,0.55) 100%)',
        border: '1px solid rgba(201,166,118,0.28)',
        display: 'grid',
        gridTemplateColumns: '64px 1fr',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <CrystalGlyph color={c.color} />
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            letterSpacing: '0.36em',
            textTransform: 'uppercase',
            color: '#D4B58A',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          灵魂结晶 · SOUL CRYSTAL
        </p>
        <p
          style={{
            margin: '6px 0 2px',
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 19,
            color: '#F5F0E8',
            fontWeight: 500,
          }}
        >
          {c.name}{' '}
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'rgba(245,240,232,0.55)',
              marginLeft: 4,
            }}
          >
            / {c.latin}
          </span>
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'rgba(245,240,232,0.78)',
          }}
        >
          「{c.hint}」
          <span
            style={{
              marginLeft: 10,
              fontStyle: 'normal',
              fontSize: 11,
              letterSpacing: '0.2em',
              color: c.color,
              border: `1px solid ${c.color}66`,
              padding: '2px 8px',
              borderRadius: 999,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {c.tag}
          </span>
        </p>
      </div>
    </div>
  );
}

function CrystalGlyph({ color }: { color: string }) {
  // 六边形结晶簇 SVG
  return (
    <svg
      viewBox="0 0 64 64"
      width={64}
      height={64}
      aria-hidden
      style={{ filter: `drop-shadow(0 0 14px ${color}77)` }}
    >
      <defs>
        <linearGradient id={`crystal-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
          <stop offset="40%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor={color} stopOpacity={0.55} />
        </linearGradient>
      </defs>
      {/* 主结晶 */}
      <polygon
        points="32,6 50,20 46,46 18,46 14,20"
        fill={`url(#crystal-${color.slice(1)})`}
        stroke="#F5F0E8"
        strokeOpacity={0.5}
        strokeWidth={0.6}
      />
      <polyline
        points="32,6 32,46"
        stroke="#FFFFFF"
        strokeOpacity={0.4}
        strokeWidth={0.6}
        fill="none"
      />
      <polyline
        points="14,20 32,28 50,20"
        stroke="#FFFFFF"
        strokeOpacity={0.45}
        strokeWidth={0.6}
        fill="none"
      />
      {/* 旁边小结晶 */}
      <polygon
        points="6,40 12,34 18,42 14,52 8,52"
        fill={`${color}cc`}
        stroke="#F5F0E8"
        strokeOpacity={0.35}
        strokeWidth={0.5}
      />
      <polygon
        points="50,40 56,46 52,56 46,54 48,46"
        fill={`${color}aa`}
        stroke="#F5F0E8"
        strokeOpacity={0.35}
        strokeWidth={0.5}
      />
    </svg>
  );
}

function CornerOrnaments({ accent }: { accent: string }) {
  const base: CSSProperties = {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: accent,
    opacity: 0.6,
  };
  return (
    <>
      <div style={{ ...base, top: 8, left: 8, borderLeft: '1px solid', borderTop: '1px solid' }} />
      <div style={{ ...base, top: 8, right: 8, borderRight: '1px solid', borderTop: '1px solid' }} />
      <div style={{ ...base, bottom: 8, left: 8, borderLeft: '1px solid', borderBottom: '1px solid' }} />
      <div style={{ ...base, bottom: 8, right: 8, borderRight: '1px solid', borderBottom: '1px solid' }} />
    </>
  );
}

// ── styles ─────────────────────────────────────────

const wrap: CSSProperties = {
  position: 'relative',
  width: 'min(calc(100% - 40px), 860px)',
  margin: '0 auto',
  padding: '28px 8px 32px',
  borderRadius: 28,
  background: 'linear-gradient(180deg, #251A3A 0%, #1c1334 100%)',
  display: 'flex',
  flexDirection: 'column',
  gap: 22,
};

const eyebrow: CSSProperties = {
  margin: 0,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.42em',
  textTransform: 'uppercase',
};

const perfumeName: CSSProperties = {
  margin: '4px 0 2px',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontSize: 38,
  lineHeight: 1.1,
  color: '#F5F0E8',
  letterSpacing: '0.02em',
};

const houseLabel: CSSProperties = {
  margin: 0,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.42em',
};

const positioningLine: CSSProperties = {
  margin: '10px 0 14px',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontStyle: 'italic',
  fontSize: 15,
  color: 'rgba(245,240,232,0.7)',
};

const chipRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  justifyContent: 'center',
  marginTop: 8,
};

const chip: CSSProperties = {
  padding: '5px 12px',
  borderRadius: 999,
  border: '1px solid',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 12.5,
  letterSpacing: '0.04em',
  background: 'rgba(245,240,232,0.04)',
};

const occasionChip: CSSProperties = {
  padding: '5px 14px',
  borderRadius: 999,
  border: '1px solid rgba(201,166,118,0.35)',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 12.5,
  letterSpacing: '0.06em',
  background: 'rgba(201,166,118,0.06)',
};

const story: CSSProperties = {
  margin: '4px 26px 0',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontStyle: 'italic',
  fontSize: 16,
  lineHeight: 1.85,
  color: 'rgba(245,240,232,0.86)',
  textAlign: 'center',
};

const sectionLabel: CSSProperties = {
  margin: '0 0 12px',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 10,
  letterSpacing: '0.36em',
  textTransform: 'uppercase',
  color: 'rgba(245,240,232,0.55)',
  textAlign: 'center',
};

const pyramidGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10,
};

const whisper: CSSProperties = {
  margin: '6px 28px 0',
  fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
  fontStyle: 'italic',
  fontSize: 17,
  lineHeight: 1.7,
  textAlign: 'center',
  letterSpacing: '0.02em',
};

const annotationStyle: CSSProperties = {
  margin: '6px 28px 0',
  fontFamily: '"Noto Serif SC", serif',
  fontSize: 12.5,
  lineHeight: 1.75,
  textAlign: 'center',
  color: 'rgba(245,240,232,0.6)',
};
