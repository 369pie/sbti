'use client';

/**
 * SoulProbeStandalone · 灵魂探针独立页
 *
 * - 6 题答完 → encode 成 6 字符 → 写 localStorage
 * - 生成「邀请 ta」分享链接（含 ?soul= 参数）
 * - CTA 引导到 pair preview / 真实 pair 页
 *
 * 战略：docs/01-strategy/wtfti-pantheon-soul-resonance-2026-04-19.md §5 §7
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { SoulProbeQuiz } from '@/components/galaxy/SoulProbeQuiz';
import { StardustSealing } from '@/components/quiz-formats';
import {
  calcSoulResonance,
  decodeSoulAnswers,
  encodeSoulAnswers,
  isSoulComplete,
  type SoulAnswers,
} from '@/lib/wtfi/soul-resonance';

const STORAGE_KEY = 'wtfti.soul.answers.v1';

export default function SoulProbeStandalone() {
  const [answers, setAnswers] = useState<SoulAnswers>({});
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [friendCode, setFriendCode] = useState<string | null>(null);

  // hydrate from localStorage + read ?friend=
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setAnswers(decodeSoulAnswers(raw));
        const params = new URLSearchParams(window.location.search);
        const fc = params.get('friend') ?? params.get('mySoul');
        if (fc && /^[A-D_\-]{1,6}$/i.test(fc)) {
          setFriendCode(fc.toUpperCase().slice(0, 6).padEnd(6, '-'));
        }
      } catch {
        /* noop */
      }
      setHydrated(true);
    });
  }, []);

  // persist on change
  const handleChange = useCallback((next: SoulAnswers) => {
    setAnswers(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, encodeSoulAnswers(next));
    } catch {
      /* noop */
    }
  }, []);

  const code = useMemo(() => encodeSoulAnswers(answers), [answers]);
  const complete = isSoulComplete(answers);

  const friendAnswers = useMemo(
    () => (friendCode ? decodeSoulAnswers(friendCode) : null),
    [friendCode],
  );
  const sScore = useMemo(
    () => (friendAnswers && complete ? calcSoulResonance(answers, friendAnswers) : null),
    [answers, complete, friendAnswers],
  );

  const inviteUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const u = new URL(window.location.origin + '/wtfti/galaxy/soul-probe/');
    if (complete) u.searchParams.set('friend', code);
    return u.toString();
  }, [code, complete]);

  const copyInvite = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `我的灵魂频率已经收齐 6 道签 ✦\n来 WTFTI 测一测你的，看看我们是不是「灵魂双星」：\n${inviteUrl}`,
      );
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      /* noop */
    }
  }, [inviteUrl]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, #2a1c4d 0%, #1a1530 38%, #0F0A22 100%)',
        color: 'var(--color-bg-primary)',
        fontFamily: 'var(--font-display), "Cormorant Garamond", "Noto Serif SC", serif',
        padding: '64px 20px 96px',
      }}
    >
      <header style={{ maxWidth: 640, margin: '0 auto 40px', textAlign: 'center' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            letterSpacing: '0.42em',
            color: 'var(--color-gold)',
            textTransform: 'uppercase',
          }}
        >
          ✦ Soul Probe · 6 道签
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display), serif',
            fontSize: 38,
            margin: '14px 0 8px',
            letterSpacing: '0.04em',
            lineHeight: 1.25,
          }}
        >
          你听见的频率，
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>就是你的灵魂签</em>
        </h1>
        <p
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 14,
            color: 'rgba(245,240,232,0.7)',
            margin: 0,
            lineHeight: 1.85,
          }}
        >
          凭直觉选 · 60 秒 · 不影响你的人格判定
          <br />
          但当你和 ta 配对时，
          <span style={{ color: 'var(--color-gold)' }}>这 6 道签会算出你们的「灵魂频率 S」</span>
        </p>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {friendCode && (
          <section
            style={{
              marginBottom: 24,
              padding: '18px 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(192,122,142,0.15), rgba(156,124,255,0.1))',
              border: '1px solid rgba(192,122,142,0.5)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 10,
                letterSpacing: '0.42em',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
              }}
            >
              ✦ Incoming Soul Code
            </p>
            <p
              style={{
                margin: '6px 0 4px',
                fontFamily: 'var(--font-display), serif',
                fontStyle: 'italic',
                fontSize: 30,
                letterSpacing: 10,
                color: 'var(--color-bg-primary)',
              }}
            >
              {friendCode}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                color: 'rgba(245,240,232,0.7)',
                fontFamily: '"Noto Serif SC", serif',
                lineHeight: 1.7,
              }}
            >
              你的朋友的灵魂频率码已经到了。
              <br />
              答完这 6 题，下面就会显示你们的 <span style={{ color: 'var(--color-gold)' }}>灵魂频率 S</span>。
            </p>
          </section>
        )}
        {hydrated ? (
          <SoulProbeQuiz initialAnswers={answers} onAnswer={handleChange} />
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(245,240,232,0.4)' }}>载入中…</p>
        )}
      </div>

      {complete && friendAnswers && sScore !== null && (
        <section
          style={{
            maxWidth: 640,
            margin: '36px auto 0',
            padding: '32px 24px',
            borderRadius: 22,
            background:
              sScore >= 0.5
                ? 'linear-gradient(155deg, rgba(192,122,142,0.22) 0%, rgba(201,166,118,0.18) 100%)'
                : 'linear-gradient(155deg, rgba(156,124,255,0.16) 0%, rgba(26,21,48,0.6) 100%)',
            border: sScore >= 0.5 ? '1px solid #C9A676' : '1px solid rgba(245,240,232,0.18)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              letterSpacing: '0.42em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
            }}
          >
            ✦ Soul Resonance · 灵魂频率 S
          </p>
          <p
            style={{
              margin: '12px 0 4px',
              fontFamily: 'var(--font-display), serif',
              fontStyle: 'italic',
              fontSize: 64,
              color: sScore >= 0.5 ? 'var(--color-gold)' : '#9C7CFF',
              lineHeight: 1,
            }}
          >
            {Math.round(sScore * 6)}
            <span style={{ color: 'rgba(245,240,232,0.4)', fontSize: 28 }}> / 6</span>
          </p>
          <p
            style={{
              margin: '4px 0 14px',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 13.5,
              color: 'rgba(245,240,232,0.85)',
              lineHeight: 1.85,
              maxWidth: 460,
              marginInline: 'auto',
            }}
          >
            {sScore >= 0.83
              ? '这是 0.3% 的相遇——你们听见的频率几乎完全重合。'
              : sScore >= 0.5
              ? '你们的灵魂频率高度共振——你们爱的东西，多得惊人地一致。'
              : sScore >= 0.17
              ? '你们各自有独立的频率，但偶尔会在同一个节拍上对上眼。'
              : '你们听见的频率不一样。互相敬意，不必勉强同频。'}
          </p>
          <p
            style={{
              margin: '0 0 18px',
              fontSize: 11,
              color: 'rgba(245,240,232,0.5)',
              letterSpacing: '0.08em',
            }}
          >
            S = {sScore.toFixed(2)} · 你 {code} ⚭ ta {friendCode}
          </p>
          <Link
            href={`/wtfti/galaxy/pair/preview/?soulA=${code}&soulB=${friendCode}`}
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              borderRadius: 999,
              border: '1px solid #C9A676',
              background: 'transparent',
              color: 'var(--color-gold)',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 13,
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            ✦ 加上人格引力 G，看完整双层叙事 →
          </Link>
        </section>
      )}

      {complete && (
        <section
          style={{
            maxWidth: 640,
            margin: '36px auto 0',
            padding: '28px 24px',
            borderRadius: 18,
            background:
              'linear-gradient(155deg, rgba(192,122,142,0.16) 0%, rgba(201,166,118,0.12) 100%)',
            border: '1px solid #C9A676',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              letterSpacing: '0.42em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
            }}
          >
            ✦ Your Soul Code
          </p>
          <p
            style={{
              margin: '8px 0 4px',
              fontFamily: 'var(--font-display), serif',
              fontStyle: 'italic',
              fontSize: 42,
              letterSpacing: 12,
              color: 'var(--color-bg-primary)',
            }}
          >
            {code}
          </p>
          <p
            style={{
              margin: '0 0 18px',
              fontFamily: '"Noto Serif SC", serif',
              fontSize: 12.5,
              color: 'rgba(245,240,232,0.65)',
              lineHeight: 1.7,
            }}
          >
            这是你这 6 题的灵魂指纹，已经存在你的浏览器里。
            <br />
            把它发给 ta，看看你们是不是「<span style={{ color: 'var(--color-gold)' }}>灵魂双星</span>」。
          </p>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={copyInvite}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                border: '1px solid #C9A676',
                background: 'var(--color-gold)',
                color: '#1a1530',
                fontFamily: '"Noto Serif SC", serif',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              {copyState === 'copied' ? '✓ 邀请已复制' : '复制「邀请 ta」链接'}
            </button>
            <Link
              href="/wtfti/galaxy/pair/preview/"
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                border: '1px solid rgba(245,240,232,0.35)',
                background: 'transparent',
                color: 'var(--color-bg-primary)',
                fontFamily: '"Noto Serif SC", serif',
                fontSize: 13,
                letterSpacing: '0.08em',
                textDecoration: 'none',
              }}
            >
              去试两颗主星的引力 →
            </Link>
          </div>
        </section>
      )}

      {complete && (
        <section
          style={{
            maxWidth: 640,
            margin: '36px auto 0',
            padding: '28px 24px',
            borderRadius: 18,
            background:
              'linear-gradient(155deg, rgba(245,240,232,0.06) 0%, rgba(26,21,48,0.6) 100%)',
            border: '1px solid rgba(245,240,232,0.18)',
          }}
        >
          <p
            style={{
              margin: 0,
              textAlign: 'center',
              fontSize: 10,
              letterSpacing: '0.42em',
              color: 'var(--color-gold)',
              textTransform: 'uppercase',
            }}
          >
            ✦ Stardust Sealing · 星尘封信
          </p>
          <h3
            style={{
              margin: '8px 0 14px',
              textAlign: 'center',
              fontFamily: 'var(--font-display), serif',
              fontStyle: 'italic',
              fontSize: 22,
              color: 'var(--color-bg-primary)',
              fontWeight: 500,
            }}
          >
            给 30 天后的你，留一句话
          </h3>
          <StardustSealing
            personalitySlug={`soul-${code}`}
            dueDays={30}
            nextHref="/wtfti/galaxy/preview/"
            nextLabel="✦ 查看我的人格星图"
          />
        </section>
      )}

      <p
        style={{
          maxWidth: 480,
          margin: '40px auto 0',
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(245,240,232,0.4)',
          lineHeight: 1.7,
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        S 公式：S = 1/6 × Σ exact_match。<br />
        SKIP 计 0，但分母仍是 6。<br />
        我们不会上传你的答案；只在你的浏览器里保存。
      </p>
    </main>
  );
}
