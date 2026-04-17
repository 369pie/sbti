'use client';

/**
 * 凡人TI · Tier 2 视觉皮肤
 * - 宣纸/水墨背景 + 竹叶/墨点装饰
 * - 宋体标题 + 赛博楷体正文
 * - 朱红印章 wax-seal 等价物
 */

import type { ReactNode } from 'react';
import type { FrRealmInfo } from '@/lib/fanrenti/characters';

interface FanrentiThemeProps {
  children: ReactNode;
  realm?: FrRealmInfo;
}

export function FanrentiTheme({ children, realm }: FanrentiThemeProps) {
  const accent = realm?.accent ?? '#2a4d4f';
  const tint = realm?.bgTint ?? '#f6f2ea';

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={
        {
          background: 'linear-gradient(180deg, #f6f2ea 0%, #eae2d2 100%)',
          ['--fr-accent' as string]: accent,
          ['--fr-tint' as string]: tint,
        } as React.CSSProperties
      }
    >
      <FanrentiInkBackdrop />
      <div className="relative z-10">{children}</div>

      <style jsx global>{`
        @keyframes fr-ink-drift {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0.14; }
          50% { transform: translate(8px, -10px) rotate(1.2deg); opacity: 0.2; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 0.14; }
        }
        .fr-paper-card {
          background: linear-gradient(180deg, #fbf7ed 0%, #f1e9d5 100%);
          border: 1px solid rgba(90, 69, 40, 0.18);
          box-shadow:
            0 1px 2px rgba(58, 47, 24, 0.06),
            0 4px 20px -8px rgba(58, 47, 24, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          color: #2d2418;
          position: relative;
        }
        .fr-paper-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='1.2' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.28 0 0 0 0 0.18 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          opacity: 0.3;
          mix-blend-mode: multiply;
          pointer-events: none;
          border-radius: inherit;
        }
        .fr-ink-text {
          color: #2d2418;
        }
        .fr-stamp {
          background: linear-gradient(135deg, #a62a3a 0%, #7a1e28 100%);
          color: #fbeee2;
          border: 2px solid rgba(122, 30, 40, 0.7);
          box-shadow:
            inset 0 0 0 2px rgba(251, 238, 226, 0.3),
            0 2px 8px rgba(122, 30, 40, 0.35);
          font-family: 'Noto Serif SC', 'Songti SC', serif;
          transform: rotate(-8deg);
        }
        .fr-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(90, 69, 40, 0.45) 50%, transparent 100%);
        }
      `}</style>
    </div>
  );
}

/** Ink-wash backdrop with drifting ink splashes + bamboo silhouettes */
function FanrentiInkBackdrop() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 800"
    >
      <defs>
        <radialGradient id="fr-ink-1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2d2418" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#2d2418" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#2d2418" stopOpacity="0" />
        </radialGradient>
        <filter id="fr-ink-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence baseFrequency="0.9" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      </defs>

      {/* 水墨晕染 */}
      <g filter="url(#fr-ink-rough)">
        <ellipse cx="220" cy="180" rx="180" ry="90" fill="url(#fr-ink-1)" style={{ animation: 'fr-ink-drift 18s ease-in-out infinite' }} />
        <ellipse cx="980" cy="660" rx="230" ry="120" fill="url(#fr-ink-1)" style={{ animation: 'fr-ink-drift 22s ease-in-out infinite reverse' }} />
        <ellipse cx="1060" cy="120" rx="140" ry="70" fill="url(#fr-ink-1)" style={{ animation: 'fr-ink-drift 26s ease-in-out infinite' }} />
        <ellipse cx="160" cy="700" rx="170" ry="80" fill="url(#fr-ink-1)" style={{ animation: 'fr-ink-drift 20s ease-in-out infinite reverse' }} />
      </g>

      {/* 远山（极淡） */}
      <g opacity="0.18" fill="#4a4030">
        <path d="M0 620 Q 200 540, 420 600 T 820 580 T 1200 620 L 1200 800 L 0 800 Z" />
        <path d="M0 680 Q 300 620, 600 670 T 1200 680 L 1200 800 L 0 800 Z" opacity="0.6" />
      </g>

      {/* 朱红色章点缀 */}
      <circle cx="1100" cy="60" r="14" fill="#a62a3a" opacity="0.5" />
    </svg>
  );
}

/** 朱红印章装饰 */
export function FanrentiSealIcon({ className = 'w-14 h-14', text = '凡人' }: { className?: string; text?: string }) {
  return (
    <div
      className={`fr-stamp inline-flex items-center justify-center rounded ${className}`}
      style={{ letterSpacing: '0.08em', fontSize: '0.95rem', fontWeight: 700 }}
    >
      {text}
    </div>
  );
}

/** 卷轴两端装饰（ornament） */
export function FanrentiScrollOrnament({ color = '#5a4528' }: { color?: string }) {
  return (
    <svg viewBox="0 0 80 12" className="w-full h-3" aria-hidden>
      <line x1="4" y1="6" x2="76" y2="6" stroke={color} strokeWidth="0.6" opacity="0.6" />
      <circle cx="6" cy="6" r="3" fill={color} opacity="0.65" />
      <circle cx="74" cy="6" r="3" fill={color} opacity="0.65" />
      <circle cx="40" cy="6" r="1.6" fill={color} opacity="0.8" />
    </svg>
  );
}
