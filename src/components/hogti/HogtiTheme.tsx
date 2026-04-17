'use client';

/**
 * HogtiTheme — 霍格沃茨TI 专属视觉容器
 *
 * 给 Landing / Result 页根节点加上：
 *  - 羊皮卷夜幕背景（暗蓝底 + 星光）
 *  - 衬线排版（Tailwind font-serif）
 *  - 院色 accent 通过 CSS variable --hog-accent 注入
 *
 * 不引入新字体文件，不新增全局 CSS 变量，降低回归风险。
 */

import type { CSSProperties, ReactNode } from 'react';
import type { HogHouseInfo } from '@/lib/hogti/characters';

interface HogtiThemeProps {
  children: ReactNode;
  house?: HogHouseInfo;
  /** 关闭星空背景（某些紧凑子页可能需要） */
  flatBackground?: boolean;
  className?: string;
}

export function HogtiTheme({ children, house, flatBackground = false, className = '' }: HogtiThemeProps) {
  const accent = house?.accent ?? '#3a2f6b';
  const bgTint = house?.bgTint ?? '#f3eadc';

  const style = {
    '--hog-accent': accent,
    '--hog-tint': bgTint,
  } as CSSProperties;

  return (
    <div
      className={`hogti-theme relative font-serif min-h-screen ${className}`}
      style={style}
    >
      {!flatBackground && <HogtiNightBackdrop />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** 羊皮卷夜幕背景：径向暗蓝 + 星光 SVG 点点 */
function HogtiNightBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 底层：深夜蓝到羊皮纸的渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, #1a1a35 0%, #2a2344 18%, #efe2c6 55%, #f5ecd7 100%)',
        }}
      />
      {/* 星光层（SVG 点阵） */}
      <svg
        className="absolute inset-0 w-full h-[45vh] opacity-70"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="star" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="1" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
          </radialGradient>
        </defs>
        {STAR_POSITIONS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="url(#star)"
            className="animate-hogti-twinkle"
            style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
          />
        ))}
      </svg>
      {/* 羊皮纸色的下半部分 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh]"
        style={{
          background: 'linear-gradient(180deg, rgba(239,226,198,0) 0%, #f5ecd7 40%, #f0e3c5 100%)',
        }}
      />
      {/* 羊皮卷噪点：SVG 纤维纹理（很轻量） */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08] mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="paper-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
      </svg>

      <style jsx global>{`
        @keyframes hogti-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .animate-hogti-twinkle {
          animation: hogti-twinkle 3s ease-in-out infinite;
          transform-origin: center;
        }
        .hogti-theme {
          color: #2a2140;
        }
        .hogti-theme h1, .hogti-theme h2, .hogti-theme h3 {
          font-family: 'EB Garamond', 'Times New Roman', 'Source Han Serif SC', 'Noto Serif SC', serif;
          letter-spacing: -0.01em;
        }
        .hogti-ink {
          color: #1a1428;
        }
        .hogti-parchment-card {
          background: linear-gradient(180deg, #fbf3df 0%, #f3e6c1 100%);
          border: 1px solid rgba(122, 93, 42, 0.25);
          box-shadow:
            0 1px 2px rgba(90, 60, 20, 0.08),
            inset 0 0 0 1px rgba(255, 255, 255, 0.4);
        }
        .hogti-gold-divider {
          background: linear-gradient(90deg, transparent, #b08d3c 40%, #b08d3c 60%, transparent);
          height: 1px;
        }
        .hogti-wax-seal {
          background: radial-gradient(circle at 30% 30%, #c04a36 0%, #8a2617 60%, #6a1810 100%);
          color: #fbf3df;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

interface StarPos { x: number; y: number; r: number; delay: number; dur: number; }
const STAR_POSITIONS: StarPos[] = [
  { x: 8, y: 12, r: 1.5, delay: 0.1, dur: 3.2 },
  { x: 18, y: 28, r: 1, delay: 1.2, dur: 2.8 },
  { x: 27, y: 8, r: 2, delay: 0.5, dur: 3.5 },
  { x: 41, y: 22, r: 1.2, delay: 1.8, dur: 3.1 },
  { x: 55, y: 14, r: 1.8, delay: 0.3, dur: 2.9 },
  { x: 63, y: 30, r: 1, delay: 2.2, dur: 3.3 },
  { x: 72, y: 10, r: 1.5, delay: 0.8, dur: 2.7 },
  { x: 85, y: 24, r: 1.2, delay: 1.5, dur: 3.4 },
  { x: 92, y: 16, r: 1, delay: 2.5, dur: 3 },
  { x: 15, y: 38, r: 0.8, delay: 0.6, dur: 3.2 },
  { x: 33, y: 42, r: 1, delay: 1.9, dur: 2.6 },
  { x: 48, y: 35, r: 1.3, delay: 0.4, dur: 3.6 },
  { x: 68, y: 40, r: 0.9, delay: 1.1, dur: 3 },
  { x: 78, y: 36, r: 1.2, delay: 2.1, dur: 2.8 },
  { x: 5, y: 32, r: 1, delay: 0.9, dur: 3.1 },
];

/** 装饰性 SVG：羽毛笔 */
export function HogtiQuillIcon({ className = 'w-5 h-5', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <path d="M3 21l7-7m0 0l11-11-3-3-11 11m3 3l-3 3m3-3l-3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 装饰性 SVG：学院徽章外框 */
export function HogtiCrestFrame({
  className = '',
  color = '#b08d3c',
  children,
}: {
  className?: string;
  color?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" fill="none" stroke={color} strokeWidth={1.2}>
        {/* 外六边形 */}
        <path d="M60 4 L112 32 L112 88 L60 116 L8 88 L8 32 Z" strokeOpacity={0.7} />
        {/* 内六边形 */}
        <path d="M60 14 L102 38 L102 82 L60 106 L18 82 L18 38 Z" strokeOpacity={0.35} />
        {/* 四角装饰 */}
        <circle cx="60" cy="4" r="2.2" fill={color} />
        <circle cx="60" cy="116" r="2.2" fill={color} />
        <circle cx="8" cy="32" r="2.2" fill={color} />
        <circle cx="8" cy="88" r="2.2" fill={color} />
        <circle cx="112" cy="32" r="2.2" fill={color} />
        <circle cx="112" cy="88" r="2.2" fill={color} />
      </svg>
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}
