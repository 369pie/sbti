'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { HOME_PLANET_CATALOG } from '@/lib/wtfi/galaxy-planets';
import { getDeity } from '@/lib/wtfi/pantheon';
import {
  SHRINE_DECORATIONS,
  type Decoration,
  type ShrineState,
  getNextUnlock,
  lightCandle,
  visitShrine,
} from '@/lib/wtfi/shrine';
import { withBasePath } from '@/lib/site';

interface Props {
  slug: string;
}

export function ShrineClient({ slug }: Props) {
  const planet = HOME_PLANET_CATALOG.find((p) => p.slug === slug)!;
  const deity = getDeity(slug);
  const [state, setState] = useState<ShrineState | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [draftNote, setDraftNote] = useState('');
  const [draftNick, setDraftNick] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsGuest(new URLSearchParams(window.location.search).get('guest') === '1');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(visitShrine(slug));
  }, [slug]);

  const unlockedSet = useMemo(() => new Set(state?.unlocked ?? []), [state]);
  const nextUnlock = state ? getNextUnlock(state.visitCount) : null;

  function handleLightCandle() {
    if (!draftNote.trim()) return;
    const next = lightCandle(slug, {
      by: isGuest ? 'guest' : 'self',
      nickname: draftNick,
      note: draftNote,
    });
    if (next) {
      setState(next);
      setDraftNote('');
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 2200);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: 'var(--color-bg-primary)',
        fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
        padding: '56px 20px 96px',
      }}
    >
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        {/* Eyebrow */}
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.42em',
            color: planet.accent,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          ✦ Personal Shrine · {planet.code} ✦
        </p>

        <h1
          style={{
            margin: '12px 0 6px',
            textAlign: 'center',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
            fontSize: 38,
            fontWeight: 500,
            color: 'var(--color-bg-primary)',
            lineHeight: 1.1,
          }}
        >
          {planet.name}的神龛
        </h1>
        {deity ? (
          <p
            style={{
              margin: '0 auto 24px',
              maxWidth: 380,
              textAlign: 'center',
              fontSize: 13,
              color: 'rgba(245,240,232,0.72)',
              fontFamily: 'Noto Serif SC, serif',
              lineHeight: 1.7,
            }}
          >
            {deity.eastern.name} × {deity.western.name} 的私人神域 — {planet.headline}
          </p>
        ) : null}

        {/* Altar (主神像 + 装饰物悬浮 4 槽位) */}
        <section
          aria-label="神龛主祭坛"
          style={{
            position: 'relative',
            margin: '8px auto 28px',
            width: '100%',
            maxWidth: 420,
            aspectRatio: '4 / 5',
            borderRadius: 24,
            border: `1px solid ${planet.accent}33`,
            background:
              'radial-gradient(ellipse at 50% 35%, rgba(40,28,90,0.7), rgba(8,5,18,0.95))',
            overflow: 'hidden',
            boxShadow: `0 24px 80px ${planet.accent}22, inset 0 0 0 1px rgba(245,240,232,0.04)`,
          }}
        >
          {/* glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-20% -20% auto -20%',
              height: '70%',
              background: `radial-gradient(ellipse at center, ${planet.accent}55 0%, transparent 70%)`,
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* 主神像（卡图） */}
          <div
            style={{
              position: 'absolute',
              inset: '14% 18% 22%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `1px solid ${planet.accent}66`,
              boxShadow: `0 0 60px ${planet.accent}55`,
              background: 'rgba(8,5,18,0.6)',
            }}
          >
            <NextImage
              src={withBasePath(planet.cardImageUrl)}
              alt={`${planet.name} 主神像`}
              fill
              sizes="(max-width: 420px) 80vw, 320px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>

          {/* 主神题词 */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 12,
              padding: '0 18px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.32em',
                color: planet.accent,
                textTransform: 'uppercase',
              }}
            >
              {deity?.sigilGlyph ?? '✦'} {deity?.coreFour ?? planet.toneTags[0]}
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 12,
                color: 'rgba(245,240,232,0.78)',
                fontStyle: 'italic',
                fontFamily: 'Cormorant Garamond, serif',
              }}
            >
              {deity?.domain ?? planet.headline}
            </p>
          </div>

          {/* 装饰物悬浮槽位 */}
          {state ? (
            <DecorationSlots unlocked={unlockedSet} accent={planet.accent} />
          ) : null}
        </section>

        {/* 解锁进度 */}
        <section
          aria-label="装饰物解锁状态"
          style={{
            margin: '0 auto 24px',
            padding: '18px 18px 16px',
            borderRadius: 16,
            background: 'rgba(245,240,232,0.04)',
            border: '1px solid rgba(245,240,232,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <p
              style={{
                margin: 0,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.32em',
                color: 'rgba(245,240,232,0.6)',
                textTransform: 'uppercase',
              }}
            >
              ✦ 神域记忆
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--color-gold)',
                letterSpacing: '0.16em',
              }}
            >
              第 {state?.visitCount ?? '—'} 日
            </p>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 8,
            }}
          >
            {SHRINE_DECORATIONS.map((d) => {
              const has = unlockedSet.has(d.id);
              return (
                <div
                  key={d.id}
                  title={has ? `${d.name} · 已解锁` : `${d.unlockAt} 日解锁 · ${d.name}`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: `1px solid ${has ? d.color + '88' : 'rgba(245,240,232,0.12)'}`,
                    background: has ? `${d.color}1a` : 'rgba(245,240,232,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: has ? d.color : 'rgba(245,240,232,0.25)',
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                  aria-label={has ? `${d.name} 已解锁` : `${d.name} 待解锁，需 ${d.unlockAt} 日`}
                >
                  {has ? d.glyph : `${d.unlockAt}d`}
                </div>
              );
            })}
          </div>

          {!state ? null : nextUnlock ? (
            <p
              style={{
                margin: '14px 0 0',
                fontSize: 12,
                color: 'rgba(245,240,232,0.7)',
                lineHeight: 1.6,
                fontFamily: 'Noto Serif SC, serif',
              }}
            >
              再访 <strong style={{ color: 'var(--color-gold)' }}>{nextUnlock.unlockAt - (state?.visitCount ?? 0)} 日</strong>{' '}
              神龛会赠你「{nextUnlock.name}」。
            </p>
          ) : (
            <p
              style={{
                margin: '14px 0 0',
                fontSize: 12,
                color: 'var(--color-gold)',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              ✦ 全部装饰物已收集 · 大祭司
            </p>
          )}
        </section>

        {/* Candle wall */}
        <section
          aria-label="留言烛台"
          style={{
            margin: '0 auto 24px',
            padding: '18px 18px 16px',
            borderRadius: 16,
            background: 'rgba(245,240,232,0.04)',
            border: '1px solid rgba(201,166,118,0.22)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.32em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
            }}
          >
            ✦ 上一盏灯 · {state?.candles.length ?? 0} 盏
          </p>

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(state?.candles.slice(-5).reverse() ?? []).map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'rgba(8,5,18,0.45)',
                  border: '1px solid rgba(245,240,232,0.06)',
                  fontSize: 12.5,
                  color: 'rgba(245,240,232,0.86)',
                  lineHeight: 1.6,
                  fontFamily: 'Noto Serif SC, serif',
                }}
              >
                <span style={{ color: c.by === 'guest' ? 'var(--color-accent)' : 'var(--color-gold)', fontWeight: 600 }}>
                  {c.nickname || (c.by === 'guest' ? '一位访客' : '我')}：
                </span>{' '}
                {c.note}
              </div>
            ))}
            {!state?.candles.length ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  color: 'rgba(245,240,232,0.45)',
                  fontStyle: 'italic',
                }}
              >
                还没有人点过灯 — 你可以是第一个。
              </p>
            ) : null}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <input
              value={draftNick}
              onChange={(e) => setDraftNick(e.target.value)}
              placeholder={isGuest ? '访客昵称（选填）' : '你的称谓（选填）'}
              maxLength={12}
              style={{
                flex: '0 0 110px',
                padding: '8px 10px',
                fontSize: 12,
                borderRadius: 10,
                border: '1px solid rgba(245,240,232,0.18)',
                background: 'rgba(8,5,18,0.5)',
                color: 'var(--color-bg-primary)',
                fontFamily: 'inherit',
              }}
            />
            <input
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="一句留言 ≤ 30 字"
              maxLength={30}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLightCandle();
              }}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '8px 10px',
                fontSize: 12.5,
                borderRadius: 10,
                border: '1px solid rgba(245,240,232,0.18)',
                background: 'rgba(8,5,18,0.5)',
                color: 'var(--color-bg-primary)',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={handleLightCandle}
              disabled={!draftNote.trim()}
              style={{
                flex: '0 0 auto',
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: draftNote.trim()
                  ? 'linear-gradient(135deg, #C9A676 0%, #B08D5C 100%)'
                  : 'rgba(245,240,232,0.08)',
                color: draftNote.trim() ? '#1a1530' : 'rgba(245,240,232,0.4)',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                cursor: draftNote.trim() ? 'pointer' : 'not-allowed',
              }}
              aria-label="点亮一盏蜡烛 · 留下你的一句话"
            >
              {submitted ? '✦ 已点亮' : '✦ 点灯'}
            </button>
          </div>
        </section>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (typeof window === 'undefined') return;
              const url = `${window.location.origin}${window.location.pathname}?guest=1`;
              if (navigator.share) {
                navigator.share({ title: `${planet.name}的神龛`, url }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(url);
              }
            }}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              border: `1px solid ${planet.accent}66`,
              background: `${planet.accent}22`,
              color: 'var(--color-bg-primary)',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✦ 邀好友造访
          </button>
          <Link
            href={withBasePath('/wtfti/daily/')}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              border: '1px solid rgba(245,240,232,0.22)',
              color: 'rgba(245,240,232,0.85)',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}
          >
            ✦ 今日天象签
          </Link>
          <Link
            href={withBasePath(`/wtfti/galaxy/planet/${slug}/`)}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              border: '1px solid rgba(245,240,232,0.22)',
              color: 'rgba(245,240,232,0.85)',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}
          >
            ✦ 主星档案
          </Link>
        </div>

        {isGuest ? (
          <p
            style={{
              margin: '24px auto 0',
              maxWidth: 360,
              textAlign: 'center',
              fontSize: 11.5,
              color: 'rgba(245,240,232,0.55)',
              fontStyle: 'italic',
              fontFamily: 'Noto Serif SC, serif',
              lineHeight: 1.7,
            }}
          >
            ✦ 你是这座神龛的访客 — 留一盏灯，让 ta 知道你曾经来过。
          </p>
        ) : null}
      </div>
    </main>
  );
}

// ─── Decoration overlays (4 槽位) ──────────────────────────

interface DecorationSlotsProps {
  unlocked: Set<string>;
  accent: string;
}

function DecorationSlots({ unlocked }: DecorationSlotsProps) {
  // 4 个固定槽位
  const slots: Array<{ pos: React.CSSProperties; deco: Decoration | null }> = [
    {
      pos: { top: '6%', left: '8%' },
      deco: SHRINE_DECORATIONS.find((d) => d.id === 'candle' && unlocked.has(d.id)) ?? null,
    },
    {
      pos: { top: '6%', right: '8%' },
      deco: SHRINE_DECORATIONS.find((d) => d.id === 'rose' && unlocked.has(d.id)) ?? null,
    },
    {
      pos: { bottom: '34%', left: '4%' },
      deco: SHRINE_DECORATIONS.find((d) => d.id === 'laurel' && unlocked.has(d.id)) ?? null,
    },
    {
      pos: { bottom: '34%', right: '4%' },
      deco: SHRINE_DECORATIONS.find((d) => d.id === 'crystal' && unlocked.has(d.id)) ?? null,
    },
  ];

  return (
    <>
      {slots.map((s, i) =>
        s.deco ? (
          <div
            key={i}
            aria-label={s.deco.name}
            style={{
              position: 'absolute',
              ...s.pos,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${s.deco.color}55, transparent 70%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              filter: 'drop-shadow(0 0 8px ' + s.deco.color + 'aa)',
              animation: `shrine-float-${i} ${4 + i * 0.6}s ease-in-out infinite alternate`,
            }}
          >
            {s.deco.glyph}
          </div>
        ) : null,
      )}
      <style>{`
        @keyframes shrine-float-0 { from { transform: translateY(0); } to { transform: translateY(-6px); } }
        @keyframes shrine-float-1 { from { transform: translateY(0); } to { transform: translateY(-8px); } }
        @keyframes shrine-float-2 { from { transform: translateY(0); } to { transform: translateY(-5px); } }
        @keyframes shrine-float-3 { from { transform: translateY(0); } to { transform: translateY(-7px); } }
        @media (prefers-reduced-motion: reduce) {
          [aria-label][style*="shrine-float"] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
