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
  sealStardustLetter,
  type StardustUserLetter,
} from '@/lib/wtfi/letters-archive';
import { subscribeLetterReminder, syncWtftiTimeAssets } from '@/lib/wtfi/cloud-sync';
import { trackFunnelEvent } from '@/lib/analytics/funnel';

function daysUntil(iso: string, now: Date = new Date()): number {
  const ms = new Date(iso).getTime() - now.getTime();
  return Math.ceil(ms / 86400_000);
}

export function LettersInbox() {
  const [letters, setLetters] = useState<StardustUserLetter[] | null>(null);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setLetters(listStardustLetters()));
    // 云端同步：拉回其他设备的信件 + 首次静默迁移本地旧数据
    let cancelled = false;
    void syncWtftiTimeAssets().then(() => {
      if (!cancelled) setLetters(listStardustLetters());
    });
    return () => {
      cancelled = true;
    };
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
      <LetterComposer
        autoFocus
        onSealed={() => setLetters(listStardustLetters())}
      />
    );
  }

  return (
    <>
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
    {composing ? (
      <LetterComposer
        autoFocus
        onSealed={() => {
          setComposing(false);
          setLetters(listStardustLetters());
        }}
      />
    ) : (
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setComposing(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 999,
            border: '1px dashed rgba(201,166,118,.4)',
            background: 'transparent',
            color: 'rgba(245,240,232,.7)',
            fontSize: 11.5,
            letterSpacing: 3,
            cursor: 'pointer',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
          }}
        >
          再写一颗
        </button>
      </div>
    )}
    </>
  );
}

/**
 * LetterComposer · 收信箱内的写信卡（D1 旅程断点修复）
 * /today「封第一封信」CTA 落到这里 — 不必先完成一次测试。
 */
function LetterComposer({
  autoFocus = false,
  onSealed,
}: {
  autoFocus?: boolean;
  onSealed?: () => void;
}) {
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [sealed, setSealed] = useState<StardustUserLetter | null>(null);
  const [reminderState, setReminderState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const handleSeal = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const letter = sealStardustLetter({ text: trimmed });
    setSealed(letter);
    try {
      trackFunnelEvent('letter_sealed', { module: 'wtfti', source: 'inbox-composer' });
    } catch {
      /* noop */
    }
    if (typeof navigator !== 'undefined') navigator.vibrate?.([40, 60, 80]);
    onSealed?.();
  }, [text, onSealed]);

  const handleReminder = useCallback(async () => {
    if (!sealed || reminderState === 'sending') return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setReminderState('error');
      return;
    }
    setReminderState('sending');
    const ok = await subscribeLetterReminder(sealed.id, value);
    setReminderState(ok ? 'done' : 'error');
    if (ok) {
      try {
        trackFunnelEvent('letter_reminder_optin', { module: 'wtfti', source: 'inbox-composer' });
      } catch {
        /* noop */
      }
    }
  }, [sealed, email, reminderState]);

  if (sealed) {
    const dueDate = new Date(sealed.dueAt);
    return (
      <section
        style={{
          padding: '36px 24px',
          textAlign: 'center',
          borderRadius: 16,
          border: '1px solid rgba(201,166,118,.45)',
          background: 'linear-gradient(180deg, rgba(201,166,118,.10) 0%, rgba(20,15,40,.5) 100%)',
        }}
      >
        <p style={{ margin: 0, fontSize: 10, letterSpacing: 6, color: '#C9A676', textTransform: 'uppercase', fontWeight: 600 }}>
          ✦ 已封存 · 30 天后见
        </p>
        <p style={{ margin: '10px 0 6px', fontFamily: 'Cormorant Garamond, Noto Serif SC, serif', fontStyle: 'italic', fontSize: 20, color: '#F5F0E8' }}>
          这封信已交给 30 天后的你
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 12.5, color: 'rgba(245,240,232,.65)' }}>
          预计开启日：
          <strong style={{ color: '#C9A676', fontWeight: 500 }}>
            {dueDate.getFullYear()}年{dueDate.getMonth() + 1}月{dueDate.getDate()}日
          </strong>
        </p>
        {reminderState === 'done' ? (
          <p style={{ margin: 0, fontSize: 12, color: '#C9A676' }}>✦ 到期那天，邮件会轻轻叫你回来。</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, maxWidth: 340, margin: '0 auto' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (reminderState === 'error') setReminderState('idle');
              }}
              placeholder="留下邮箱，到期提醒你拆信（可选）"
              aria-label="到期拆信邮件提醒邮箱"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 999,
                border: `1px solid ${reminderState === 'error' ? 'rgba(192,122,142,.6)' : 'rgba(201,166,118,.35)'}`,
                background: 'rgba(20,15,42,.5)',
                color: '#F5F0E8',
                fontSize: 12,
                fontFamily: 'Noto Serif SC, serif',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleReminder}
              disabled={reminderState === 'sending'}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                border: '1px solid rgba(201,166,118,.5)',
                background: 'rgba(201,166,118,.12)',
                color: '#F5F0E8',
                fontSize: 11,
                letterSpacing: 2,
                cursor: reminderState === 'sending' ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {reminderState === 'sending' ? '…' : '提醒我'}
            </button>
          </div>
        )}
        {reminderState === 'error' ? (
          <p style={{ margin: '6px 2px 0', fontSize: 10.5, color: 'rgba(231,198,192,.75)' }}>
            邮箱好像不太对，或订阅失败了 — 可以再试一次。
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      style={{
        padding: '26px 22px',
        borderRadius: 16,
        border: '1px dashed rgba(201,166,118,.35)',
        background: 'rgba(245,240,232,.03)',
      }}
    >
      <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: 5, color: '#C9A676', textTransform: 'uppercase', fontWeight: 600 }}>
        时间胶囊 · 写给 30 天后的自己
      </p>
      <textarea
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value.slice(0, 240))}
        placeholder="今天的一句话、一个愿望、一点心事 — 封缄 30 天，到期由你自己拆开。"
        rows={3}
        aria-label="给 30 天后自己的信"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 14px',
          borderRadius: 12,
          border: '1px solid rgba(245,240,232,.14)',
          background: 'rgba(20,15,42,.45)',
          color: '#F5F0E8',
          fontSize: 13.5,
          lineHeight: 1.8,
          fontFamily: 'Noto Serif SC, serif',
          outline: 'none',
          resize: 'vertical',
        }}
      />
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10.5, color: 'rgba(245,240,232,.4)' }}>{text.length}/240</span>
        <button
          type="button"
          onClick={handleSeal}
          disabled={!text.trim()}
          style={{
            marginLeft: 'auto',
            padding: '10px 22px',
            borderRadius: 999,
            border: '1px solid rgba(201,166,118,.65)',
            background: text.trim()
              ? 'linear-gradient(180deg, rgba(201,166,118,.25) 0%, rgba(201,166,118,.10) 100%)'
              : 'rgba(245,240,232,.04)',
            color: text.trim() ? '#F5F0E8' : 'rgba(245,240,232,.4)',
            fontSize: 12,
            letterSpacing: 4,
            textTransform: 'uppercase',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
          }}
        >
          封起来 · 30 天后见
        </button>
      </div>
    </section>
  );
}
