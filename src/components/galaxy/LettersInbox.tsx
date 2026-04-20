/**
 * LettersInbox · 列出用户的 Stardust Letters
 * - 已到期的信会以"金封蜡可拆"样式
 * - 未到期的灰封 + 倒计时
 * - 已开启的信展开正文
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteStardustLetter,
  listStardustLetters,
  markStardustLetterOpened,
  type StardustUserLetter,
} from '@/lib/wtfi/letters-archive';

function daysUntil(iso: string, now: Date = new Date()): number {
  const ms = new Date(iso).getTime() - now.getTime();
  return Math.ceil(ms / 86400_000);
}

export function LettersInbox() {
  const [letters, setLetters] = useState<StardustUserLetter[] | null>(null);

  useEffect(() => {
    queueMicrotask(() => setLetters(listStardustLetters()));
  }, []);

  const now = useMemo(() => new Date(), []);

  const handleOpen = useCallback((id: string) => {
    markStardustLetterOpened(id);
    setLetters(listStardustLetters());
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm('确定删除这封信？此操作不可撤销。');
      if (!ok) return;
    }
    deleteStardustLetter(id);
    setLetters(listStardustLetters());
  }, []);

  if (letters === null) {
    return (
      <p style={{ textAlign: 'center', color: 'rgba(245,240,232,.5)', padding: 40 }}>
        ✦ 载入收信箱…
      </p>
    );
  }

  if (letters.length === 0) {
    return (
      <section
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          borderRadius: 16,
          border: '1px dashed rgba(245,240,232,.18)',
          background: 'rgba(245,240,232,.04)',
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(245,240,232,.65)' }}>
          ✦ 你还没有寄出过任何一封星尘信件。
        </p>
        <p style={{ marginTop: 10, fontSize: 12, color: 'rgba(245,240,232,.45)' }}>
          完成一次 WTFTI 测试 → 收尾时写一句给 30 天后的自己。
        </p>
      </section>
    );
  }

  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gap: 14,
      }}
    >
      {letters.map((letter) => {
        const due = daysUntil(letter.dueAt, now);
        const ready = due <= 0;
        const sealedDate = new Date(letter.sealedAt);
        const dueDate = new Date(letter.dueAt);
        return (
          <li
            key={letter.id}
            style={{
              padding: '18px 18px 16px',
              borderRadius: 12,
              border: ready
                ? '1px solid rgba(201,166,118,.55)'
                : '1px solid rgba(245,240,232,.10)',
              background: ready
                ? 'linear-gradient(180deg, rgba(201,166,118,.10) 0%, rgba(20,15,40,.4) 100%)'
                : 'rgba(20,15,40,.6)',
              boxShadow: ready
                ? '0 8px 32px rgba(201,166,118,.25)'
                : '0 4px 14px rgba(0,0,0,.35)',
            }}
          >
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: ready
                    ? 'radial-gradient(circle at 35% 30%, #F5E1B4 0%, #C9A676 60%, #8C6F44 100%)'
                    : 'rgba(80,70,110,.45)',
                  color: ready ? '#fff' : 'rgba(245,240,232,.5)',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontSize: 14,
                  boxShadow: ready ? '0 0 10px rgba(201,166,118,.55)' : 'none',
                }}
              >
                ✦
              </span>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 9.5,
                    letterSpacing: 4,
                    color: ready ? '#C9A676' : 'rgba(245,240,232,.5)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {ready
                    ? letter.opened
                      ? '✦ Already Opened · 已拆封'
                      : '✦ Ready to Open · 可以拆封了'
                    : `✦ Sealed · ${due} 天后开启`}
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: 11,
                    color: 'rgba(245,240,232,.5)',
                  }}
                >
                  封缄于 {sealedDate.toLocaleDateString('zh-CN')} · 计划开启 {dueDate.toLocaleDateString('zh-CN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(letter.id)}
                aria-label="删除这封信"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(245,240,232,.35)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                × 删除
              </button>
            </header>

            {!ready ? (
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 12,
                  color: 'rgba(245,240,232,.45)',
                  fontStyle: 'italic',
                  fontFamily: 'Cormorant Garamond, serif',
                }}
              >
                ✦ 30 天后这封信会替你重新打开 — 现在还不能偷看。
              </p>
            ) : letter.opened ? (
              <blockquote
                style={{
                  margin: '6px 0 0',
                  padding: '10px 14px',
                  borderLeft: '2px solid #C9A676',
                  background: 'rgba(245,240,232,.04)',
                  fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: '#F5F0E8',
                  lineHeight: 1.6,
                }}
              >
                「{letter.text}」
              </blockquote>
            ) : (
              <button
                type="button"
                onClick={() => handleOpen(letter.id)}
                style={{
                  marginTop: 6,
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: '1px solid rgba(201,166,118,.55)',
                  background:
                    'linear-gradient(180deg, rgba(201,166,118,.22) 0%, rgba(201,166,118,.10) 100%)',
                  color: '#F5F0E8',
                  fontSize: 12,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                }}
              >
                ✦ 拆封 · Break the Seal
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
