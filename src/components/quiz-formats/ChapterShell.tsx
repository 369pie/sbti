/**
 * ChapterShell · 章节包裹组件
 *
 * 给每个测试章节提供：颜色主题 / 章节编号 / 进度 / 暗化效果 / 触觉钩子。
 * 所有 quiz-format 组件应当被它包裹。
 */
'use client';

import type { CSSProperties, ReactNode } from 'react';

export type ChapterTone =
  | 'rose' // 玫瑰陶土 — 引力轴 / 自我
  | 'twilight' // 暮紫 — 暗面 / 边界（屏幕暗 30%）
  | 'gold' // 金箔 — 命运 / 意义
  | 'aurora' // 极光 — 灵魂探针
  | 'whisper'; // 月光白 — 收尾

const TONES: Record<
  ChapterTone,
  {
    accent: string;
    bg: string;
    glow: string;
    dim: number;
    label: string;
  }
> = {
  rose: {
    accent: '#C07A8E',
    bg: 'linear-gradient(160deg, rgba(192,122,142,.10) 0%, rgba(26,21,48,0) 70%)',
    glow: '0 0 80px rgba(192,122,142,.35)',
    dim: 0,
    label: 'Gravitational Axes',
  },
  twilight: {
    accent: '#9C7CFF',
    bg: 'linear-gradient(160deg, rgba(60,40,110,.55) 0%, rgba(12,8,22,1) 70%)',
    glow: '0 0 100px rgba(70,40,140,.55)',
    dim: 0.3,
    label: 'Well of Shadow',
  },
  gold: {
    accent: '#C9A676',
    bg: 'linear-gradient(160deg, rgba(201,166,118,.10) 0%, rgba(26,21,48,0) 70%)',
    glow: '0 0 80px rgba(201,166,118,.35)',
    dim: 0,
    label: 'Threads of Fate',
  },
  aurora: {
    accent: '#7AA3B0',
    bg: 'linear-gradient(160deg, rgba(122,163,176,.12) 0%, rgba(156,124,255,.08) 100%)',
    glow: '0 0 100px rgba(122,163,176,.45)',
    dim: 0,
    label: 'Soul Probe',
  },
  whisper: {
    accent: '#F5F0E8',
    bg: 'radial-gradient(ellipse at center top, rgba(245,240,232,.08) 0%, rgba(26,21,48,0) 60%)',
    glow: '0 0 60px rgba(245,240,232,.18)',
    dim: 0.1,
    label: 'Stardust Letter',
  },
};

interface Props {
  tone: ChapterTone;
  /** Roman numeral or Arabic */
  chapterMark: string;
  /** Eyebrow English label, defaults to tone preset */
  eyebrow?: string;
  /** H2 主题 */
  title: string;
  /** 副标题（可选） */
  subtitle?: string;
  /** 进度 0-1 */
  progress?: number;
  /** 章节内问题序号（1-based） */
  questionIndex?: number;
  /** 章节内问题总数 */
  questionTotal?: number;
  children: ReactNode;
  /** 额外样式 */
  style?: CSSProperties;
}

export function ChapterShell({
  tone,
  chapterMark,
  eyebrow,
  title,
  subtitle,
  progress,
  questionIndex,
  questionTotal,
  children,
  style,
}: Props) {
  const t = TONES[tone];
  const isIntro = typeof questionIndex !== 'number';
  return (
    <section
      data-chapter-tone={tone}
      style={{
        position: 'relative',
        borderRadius: 26,
        padding: 'clamp(28px, 5vh, 44px) clamp(22px, 5vw, 40px) clamp(28px, 5vh, 40px)',
        background:
          'linear-gradient(180deg, rgba(20,15,38,0.78) 0%, rgba(10,8,32,0.62) 100%)',
        border: `1px solid ${t.accent}55`,
        boxShadow: `0 30px 90px -30px rgba(2,0,16,0.85), 0 0 0 1px rgba(245,240,232,0.04) inset, ${t.glow}`,
        backdropFilter: 'blur(18px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.1)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* tone overlay (rose / twilight / gold / aurora 各自独有的次表面光) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: t.bg,
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
      {/* 角标星屑 */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 14,
          left: 18,
          fontSize: 10,
          color: `${t.accent}`,
          opacity: 0.7,
          letterSpacing: '0.2em',
        }}
      >
        ✦
      </span>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 14,
          right: 18,
          fontSize: 10,
          color: `${t.accent}`,
          opacity: 0.7,
          letterSpacing: '0.2em',
        }}
      >
        ✦
      </span>
      {/* 顶部光晕 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-50% -10% auto auto',
          width: 420,
          height: 420,
          background: t.glow,
          filter: 'blur(80px)',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />
      <header style={{ position: 'relative', textAlign: 'center', marginBottom: 24 }}>
        {/* 章节徽章：仅 intro 页显示大徽章；问答页用紧凑 chapter pill */}
        {isIntro ? (
          <div
            aria-hidden
            style={{
              position: 'relative',
              width: 96,
              height: 96,
              margin: '0 auto 18px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${t.accent}55 0%, transparent 70%)`,
                filter: 'blur(14px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 6,
                borderRadius: '50%',
                border: `1px solid ${t.accent}88`,
                boxShadow: `0 0 24px ${t.accent}44, inset 0 0 18px ${t.accent}22`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 14,
                borderRadius: '50%',
                border: `1px dashed ${t.accent}55`,
                animation: 'wtfti-orbit-spin 28s linear infinite',
              }}
            />
            <span
              style={{
                position: 'relative',
                fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
                fontSize: 32,
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#F5F0E8',
                textShadow: `0 0 18px ${t.accent}aa`,
                letterSpacing: '0.04em',
              }}
            >
              {chapterMark}
            </span>
          </div>
        ) : null}
        <p
          style={{
            margin: 0,
            fontSize: 10.5,
            letterSpacing: '0.42em',
            color: '#F5F0E8',
            textTransform: 'uppercase',
            fontWeight: 700,
            opacity: 0.92,
            textShadow: `0 0 14px ${t.accent}88, 0 1px 2px rgba(2,0,16,0.85)`,
          }}
        >
          <span style={{ color: t.accent }}>✦</span> Chapter {chapterMark} ·{' '}
          <span style={{ color: t.accent }}>{eyebrow ?? t.label}</span>
        </p>
        {typeof questionIndex === 'number' && typeof questionTotal === 'number' ? (
          <p
            role="status"
            aria-live="polite"
            style={{
              margin: '8px 0 0',
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.36em',
              color: 'rgba(245,240,232,0.85)',
              textTransform: 'uppercase',
            }}
          >
            Question {questionIndex} / {questionTotal}
          </p>
        ) : null}
        <h2
          style={{
            margin: isIntro ? '14px 0 10px' : '10px 0 8px',
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontSize: isIntro ? 'clamp(30px, 5.2vw, 40px)' : 'clamp(24px, 4vw, 30px)',
            fontStyle: 'italic',
            color: '#F5F0E8',
            fontWeight: 500,
            lineHeight: 1.18,
            textShadow: '0 1px 24px rgba(2,0,16,0.6)',
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              margin: '0 auto',
              maxWidth: 440,
              fontSize: 14.5,
              color: 'rgba(245,240,232,0.88)',
              lineHeight: 1.7,
              fontFamily: '"Noto Serif SC", serif',
            }}
          >
            {subtitle}
          </p>
        ) : null}
        {typeof progress === 'number' ? (
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`章节进度 ${Math.round(progress * 100)}%`}
            style={{
              margin: '20px auto 0',
              maxWidth: 280,
              height: 3,
              background: 'rgba(245,240,232,.10)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                background: `linear-gradient(90deg, ${t.accent}, ${t.accent}aa)`,
                boxShadow: `0 0 12px ${t.accent}aa`,
                transition: 'width 480ms cubic-bezier(.2,.7,.2,1)',
              }}
            />
          </div>
        ) : null}
      </header>
      <div style={{ position: 'relative' }}>{children}</div>
    </section>
  );
}

export const CHAPTER_TONES = TONES;
