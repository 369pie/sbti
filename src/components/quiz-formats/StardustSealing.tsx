/**
 * C3 · Stardust Sealing 星尘封信
 * 包装 F8 WhisperInput → 信封封缄动画 → 写入 letters-archive。
 * 30 天后通过 letters-archive.dueAt 触发收信箱弹出。
 */
'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { sealStardustLetter } from '@/lib/wtfi/letters-archive';

import { WhisperInput } from './WhisperInput';

interface Props {
  /** 与本次测试结果挂钩的 personality slug，用于回访场景 */
  personalitySlug?: string;
  /** 默认 30 天后开启 */
  dueDays?: number;
  /** 完成后回调（拿到信件 id） */
  onSealed?: (letterId: string) => void;
  /** 提示是否启用浏览器通知 */
  enableNotification?: boolean;
  /** 封缄完成后用户「下一步」要去哪 — 默认回到 WTFTI 首页 */
  nextHref?: string;
  /** 「下一步」按钮文案 — 默认「✦ 回到我的人格主页」 */
  nextLabel?: string;
}

export function StardustSealing({
  personalitySlug,
  dueDays = 30,
  onSealed,
  enableNotification = true,
  nextHref = '/wtfti/',
  nextLabel = '✦ 回到我的人格主页',
}: Props) {
  const [text, setText] = useState('');
  const [sealed, setSealed] = useState<{ id: string; dueAt: string } | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  const handleSeal = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const letter = sealStardustLetter({
      text: trimmed,
      personalitySlug,
      dueDays,
    });
    setSealed({ id: letter.id, dueAt: letter.dueAt });
    if (typeof navigator !== 'undefined') navigator.vibrate?.([40, 60, 80]);

    if (
      enableNotification &&
      typeof window !== 'undefined' &&
      'Notification' in window
    ) {
      try {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          setNotifGranted(perm === 'granted');
        } else {
          setNotifGranted(Notification.permission === 'granted');
        }
      } catch {
        setNotifGranted(false);
      }
    }

    onSealed?.(letter.id);
  }, [text, personalitySlug, dueDays, enableNotification, onSealed]);

  if (sealed) {
    const dueDate = new Date(sealed.dueAt);
    const dueLabel = `${dueDate.getFullYear()}年${dueDate.getMonth() + 1}月${dueDate.getDate()}日`;
    return (
      <section
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          borderRadius: 20,
          background:
            'radial-gradient(ellipse at center top, rgba(245,240,232,.10) 0%, rgba(20,12,40,.95) 70%)',
          border: '1px solid rgba(245,240,232,.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            margin: '0 auto 22px',
            width: 220,
            height: 140,
            position: 'relative',
            animation: 'envelope-rise 1.2s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 6,
              background:
                'linear-gradient(180deg, #FCF7EC 0%, #E8DEC4 100%)',
              boxShadow:
                '0 18px 50px rgba(201,166,118,.45), 0 4px 14px rgba(0,0,0,.4)',
            }}
          />
          {/* 信封三角盖 */}
          <svg viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
            <path
              d="M0,0 L110,72 L220,0 L220,8 L110,80 L0,8 Z"
              fill="#D8C9A6"
            />
          </svg>
          {/* 金封蜡 */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '52%',
              transform: 'translate(-50%, -50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 30%, #F5E1B4 0%, #C9A676 60%, #8C6F44 100%)',
              boxShadow: '0 0 14px rgba(201,166,118,.65)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: 18,
            }}
          >
            ✦
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 10,
            letterSpacing: 6,
            color: '#C9A676',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          ✦ Stardust Sealed · 星尘已封缄
        </p>
        <h2
          style={{
            margin: '6px 0 8px',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
            fontSize: 22,
            color: '#F5F0E8',
            fontWeight: 500,
          }}
        >
          这封信已交给 30 天后的你
        </h2>
        <p
          style={{
            margin: '0 auto 8px',
            maxWidth: 320,
            fontSize: 13,
            color: 'rgba(245,240,232,.7)',
            lineHeight: 1.6,
            fontFamily: 'Noto Serif SC, serif',
          }}
        >
          预计开启日：<strong style={{ color: '#C9A676', fontWeight: 500 }}>{dueLabel}</strong>
        </p>
        {notifGranted === false ? (
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,.45)', marginTop: 6 }}>
            ✦ 没开启浏览器通知也没关系 — 30 天后访问本站会自动跳出收信箱。
          </p>
        ) : notifGranted ? (
          <p style={{ fontSize: 11, color: '#C9A676', marginTop: 6 }}>
            ✦ 浏览器通知已开启 · 30 天后会轻轻提醒你
          </p>
        ) : null}

        <div
          style={{
            marginTop: 22,
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href={nextHref}
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              border: '1px solid #C9A676',
              background:
                'linear-gradient(180deg, rgba(201,166,118,.22) 0%, rgba(201,166,118,.08) 100%)',
              color: '#F5F0E8',
              fontSize: 12.5,
              letterSpacing: 4,
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
              fontStyle: 'italic',
            }}
          >
            {nextLabel}
          </Link>
          <Link
            href="/wtfti/letters/"
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              border: '1px solid rgba(245,240,232,.28)',
              background: 'transparent',
              color: 'rgba(245,240,232,.85)',
              fontSize: 12.5,
              letterSpacing: 4,
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
              fontStyle: 'italic',
            }}
          >
            ✦ 进入收信箱
          </Link>
        </div>
        <p
          style={{
            margin: '14px auto 0',
            maxWidth: 360,
            fontSize: 11,
            color: 'rgba(245,240,232,.5)',
            lineHeight: 1.7,
            fontStyle: 'italic',
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          ✦ 你可以随时回到「收信箱」查看所有寄出的信 — 到期那天，月光会替你拆开。
        </p>

        <style>{`
          @keyframes envelope-rise {
            0%   { transform: translateY(60px) rotate(-4deg) scale(.7); opacity: 0; }
            60%  { opacity: 1; }
            100% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section style={{ display: 'grid', gap: 18 }}>
      <WhisperInput
        prompt="如果你能给 30 天后的自己留一句话，是？"
        hint="✦ 写下来 → 装进信封 → 30 天后交还给你"
        maxLength={24}
        initial={text}
        onCommit={setText}
      />
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <button
          type="button"
          onClick={handleSeal}
          disabled={!text.trim()}
          style={{
            padding: '12px 24px',
            borderRadius: 999,
            border: '1px solid rgba(201,166,118,.65)',
            background: text.trim()
              ? 'linear-gradient(180deg, rgba(201,166,118,.22) 0%, rgba(201,166,118,.10) 100%)'
              : 'rgba(245,240,232,.04)',
            color: text.trim() ? '#F5F0E8' : 'rgba(245,240,232,.4)',
            fontSize: 12.5,
            letterSpacing: 4,
            textTransform: 'uppercase',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
          }}
        >
          ✦ 封缄 · Seal & Send to Future
        </button>
      </div>
    </section>
  );
}
