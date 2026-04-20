'use client';

/**
 * SealedCard (W2) — replaces the v1 灰锁 visual for未解锁 cards.
 *
 * Frame style is driven by the current season's SealStyle:
 *  - silk     (spring): silk ribbon wrapped diagonally
 *  - envelope (summer): envelope flap top + wax seal
 *  - wax      (autumn): wax stamp center over a folded letter
 *  - scroll   (winter): rolled scroll with twine
 *  - lantern  (festival): paper lantern with red tassels
 *
 * All renderings are pure CSS / inline SVG — no extra image assets.
 *
 * Goal: feel like "等待揭晓" not "被剥夺". Hover/touch lifts the seal slightly
 * to suggest tactility.
 */

import { memo } from 'react';
import type { CSSProperties } from 'react';
import type { SealStyle } from '@/lib/museum/season';

export interface SealedCardProps {
  /** Tab accent color (used as ribbon / wax color highlight) */
  accent: string;
  /** Seal style to render */
  sealStyle: SealStyle;
  /** Whether this card is "isSpecial" (隐藏款) — adds gold/purple tint */
  isHidden?: boolean;
  /** Card code (e.g., SBTI-XXXX) shown faintly under the seal */
  code?: string;
  /** Tab label shown as a small chip */
  tabLabel?: string;
  className?: string;
  style?: CSSProperties;
  /** Slight scale on hover */
  interactive?: boolean;
}

const HIDDEN_TINT = 'linear-gradient(160deg, #fdf6e3 0%, #f4e6c2 35%, #e6d4ff 70%, #f4d6e8 100%)';
const DEFAULT_TINT = 'linear-gradient(160deg, #FFFDF9 0%, #FAF3E5 50%, #F5E9D6 100%)';

function SealCore({ sealStyle, accent, isHidden }: { sealStyle: SealStyle; accent: string; isHidden: boolean }) {
  switch (sealStyle) {
    case 'silk':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          {/* Diagonal silk ribbon */}
          <defs>
            <linearGradient id="silk-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
              <stop offset="50%" stopColor={accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <rect x="-10" y="38" width="120" height="22" fill="url(#silk-grad)" transform="rotate(-22 50 50)" />
          <rect x="-10" y="38" width="120" height="22" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="0.4" transform="rotate(-22 50 50)" />
          {/* Knot */}
          <circle cx="50" cy="50" r="8" fill={accent} fillOpacity="0.92" />
          <circle cx="50" cy="50" r="3" fill="#FFFDF9" />
          <text x="50" y="53" textAnchor="middle" fontSize="3.4" fill={accent} fontWeight="600">✦</text>
        </svg>
      );
    case 'envelope':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          {/* Envelope flap */}
          <polygon points="10,15 90,15 50,55" fill={accent} fillOpacity="0.18" stroke={accent} strokeOpacity="0.45" strokeWidth="0.6" />
          <line x1="10" y1="15" x2="50" y2="55" stroke={accent} strokeOpacity="0.4" strokeWidth="0.4" />
          <line x1="90" y1="15" x2="50" y2="55" stroke={accent} strokeOpacity="0.4" strokeWidth="0.4" />
          {/* Wax seal at fold */}
          <circle cx="50" cy="55" r="9" fill={accent} fillOpacity="0.9" />
          <circle cx="50" cy="55" r="9" fill="none" stroke="#FFFDF9" strokeWidth="0.6" />
          <text x="50" y="58.5" textAnchor="middle" fontSize="6" fill="#FFFDF9" fontWeight="700" fontFamily="serif">W</text>
        </svg>
      );
    case 'wax':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          {/* Folded letter lines */}
          <line x1="20" y1="34" x2="80" y2="34" stroke={accent} strokeOpacity="0.18" strokeWidth="0.5" strokeDasharray="2 1.5" />
          <line x1="20" y1="66" x2="80" y2="66" stroke={accent} strokeOpacity="0.18" strokeWidth="0.5" strokeDasharray="2 1.5" />
          {/* Wax stamp */}
          <circle cx="50" cy="50" r="13" fill={accent} fillOpacity="0.92" />
          <circle cx="50" cy="50" r="13" fill="none" stroke="#FFFDF9" strokeWidth="0.7" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="#FFFDF9" strokeOpacity="0.7" strokeWidth="0.4" strokeDasharray="1.5 1" />
          <text x="50" y="54.5" textAnchor="middle" fontSize="9" fill="#FFFDF9" fontWeight="700" fontFamily="serif">M</text>
        </svg>
      );
    case 'scroll':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          {/* Rolled scroll body */}
          <rect x="14" y="42" width="72" height="16" rx="4" fill="#FAF3E5" stroke={accent} strokeOpacity="0.5" strokeWidth="0.6" />
          {/* Scroll caps */}
          <circle cx="14" cy="50" r="5" fill={accent} fillOpacity="0.85" />
          <circle cx="86" cy="50" r="5" fill={accent} fillOpacity="0.85" />
          {/* Twine */}
          <line x1="50" y1="40" x2="50" y2="60" stroke={accent} strokeOpacity="0.7" strokeWidth="1.2" />
          <line x1="48" y1="40" x2="48" y2="60" stroke={accent} strokeOpacity="0.4" strokeWidth="0.5" />
          <line x1="52" y1="40" x2="52" y2="60" stroke={accent} strokeOpacity="0.4" strokeWidth="0.5" />
          {/* Knot */}
          <circle cx="50" cy="50" r="3.5" fill={accent} />
        </svg>
      );
    case 'lantern':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          {/* Lantern body */}
          <ellipse cx="50" cy="50" rx="20" ry="22" fill={accent} fillOpacity={isHidden ? '0.85' : '0.78'} />
          <ellipse cx="50" cy="50" rx="20" ry="22" fill="none" stroke="#FFFDF9" strokeWidth="0.4" strokeOpacity="0.6" />
          <line x1="30" y1="50" x2="70" y2="50" stroke="#FFFDF9" strokeOpacity="0.5" strokeWidth="0.5" />
          {/* Top cap */}
          <rect x="44" y="26" width="12" height="3" fill={accent} fillOpacity="0.95" />
          <line x1="50" y1="22" x2="50" y2="26" stroke={accent} strokeWidth="0.8" />
          {/* Tassels */}
          <line x1="50" y1="72" x2="50" y2="84" stroke={accent} strokeWidth="0.8" />
          <line x1="46" y1="72" x2="44" y2="86" stroke={accent} strokeWidth="0.5" />
          <line x1="54" y1="72" x2="56" y2="86" stroke={accent} strokeWidth="0.5" />
          {/* Glyph */}
          <text x="50" y="55" textAnchor="middle" fontSize="11" fill="#FFFDF9" fontFamily="serif" fontWeight="700">封</text>
        </svg>
      );
  }
}

function SealedCardImpl({
  accent,
  sealStyle,
  isHidden = false,
  code,
  tabLabel,
  className = '',
  style,
  interactive = true,
}: SealedCardProps) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden museum-sealed ${interactive ? 'museum-sealed--interactive' : ''} ${className}`}
      style={{
        background: isHidden ? HIDDEN_TINT : DEFAULT_TINT,
        boxShadow: 'inset 0 0 24px rgba(31,26,22,0.06), inset 0 0 0 1px rgba(31,26,22,0.06)',
        ...style,
      }}
      aria-hidden
    >
      {/* Paper grain overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(31,26,22,0.05) 1px, transparent 0)",
          backgroundSize: '6px 6px',
          mixBlendMode: 'multiply',
          opacity: 0.5,
        }}
      />

      {/* Corner ornaments — same language as cover */}
      <span className="absolute top-2 left-2 text-[10px] opacity-40" style={{ color: accent }}>✦</span>
      <span className="absolute top-2 right-2 text-[10px] opacity-40" style={{ color: accent }}>✦</span>
      <span className="absolute bottom-2 left-2 text-[10px] opacity-40" style={{ color: accent }}>✦</span>
      <span className="absolute bottom-2 right-2 text-[10px] opacity-40" style={{ color: accent }}>✦</span>

      {/* Seal artwork */}
      <SealCore sealStyle={sealStyle} accent={accent} isHidden={isHidden} />

      {/* Hidden glow halo */}
      {isHidden && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,210,140,0.28) 0%, transparent 55%)',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Bottom faint label */}
      {(code || tabLabel) && (
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <div className="text-[9px] font-mono tracking-[0.22em] uppercase" style={{ color: accent, opacity: 0.55 }}>
            {tabLabel ? `${tabLabel} · ` : ''}{isHidden ? '???' : code ?? '未解锁'}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(SealedCardImpl);
