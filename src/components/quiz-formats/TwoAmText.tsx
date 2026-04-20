/**
 * F5 · 2 AM Text 凌晨短信
 * 题目伪装成手机锁屏通知 + iMessage 风格回复气泡。
 */
'use client';

import { useCallback, useState } from 'react';

export interface TextReplyOption {
  key: string;
  text: string;
  /** 'me' 风格（蓝色右气泡）or 'narrator'（灰色） */
  variant?: 'me' | 'narrator';
}

interface Props {
  /** 谁发的短信 — "前任 · 03:14" */
  sender: string;
  /** 几条传来的消息 */
  incoming: string[];
  /** 我可选的回复气泡 */
  replies: TextReplyOption[];
  initial?: string;
  onPick: (key: string) => void;
  hint?: string;
}

export function TwoAmText({ sender, incoming, replies, initial, onPick, hint }: Props) {
  const [picked, setPicked] = useState<string | undefined>(initial);

  const handle = useCallback(
    (key: string) => {
      setPicked(key);
      if (typeof navigator !== 'undefined') navigator.vibrate?.(6);
      onPick(key);
    },
    [onPick],
  );

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 5,
          color: '#C9A676',
          textTransform: 'uppercase',
          textShadow: '0 0 12px rgba(2,0,16,0.6)',
        }}
      >
        ✦ 03:14 AM · Lock Screen
      </legend>

      <div
        style={{
          margin: '16px auto 0',
          maxWidth: 340,
          padding: '14px 14px 18px',
          borderRadius: 16,
          background:
            'linear-gradient(180deg, rgba(20,15,40,.92) 0%, rgba(12,8,22,.95) 100%)',
          border: '1px solid rgba(156,124,255,.28)',
          boxShadow: '0 16px 60px rgba(60,40,110,.55), inset 0 0 0 1px rgba(245,240,232,.04)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p
          style={{
            margin: '0 0 10px',
            textAlign: 'center',
            fontSize: 11,
            color: 'rgba(245,240,232,.55)',
            letterSpacing: 1,
          }}
        >
          {sender}
        </p>
        <div style={{ display: 'grid', gap: 6 }}>
          {incoming.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: 'flex-start',
                maxWidth: '78%',
                padding: '8px 12px',
                borderRadius: '14px 14px 14px 4px',
                background: 'rgba(70,55,130,.45)',
                color: '#F5F0E8',
                fontSize: 13,
                lineHeight: 1.5,
                fontFamily: 'Noto Serif SC, serif',
              }}
            >
              {msg}
            </div>
          ))}
        </div>

        <p
          style={{
            margin: '14px 0 8px',
            textAlign: 'center',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: 4,
            color: 'rgba(245,240,232,.65)',
            textTransform: 'uppercase',
          }}
        >
          ✦ 你的回复
        </p>

        <div style={{ display: 'grid', gap: 6 }}>
          {replies.map((r) => {
            const isPicked = picked === r.key;
            const variant = r.variant ?? 'me';
            const isMe = variant === 'me';
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handle(r.key)}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  marginLeft: isMe ? 'auto' : 0,
                  marginRight: isMe ? 0 : 'auto',
                  display: 'block',
                  maxWidth: '85%',
                  padding: '9px 13px',
                  borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  border: isPicked ? '1px solid #C9A676' : '1px solid rgba(245,240,232,.10)',
                  background: isPicked
                    ? 'rgba(201,166,118,.18)'
                    : isMe
                    ? 'rgba(0,122,255,.32)'
                    : 'rgba(80,80,100,.28)',
                  color: '#F5F0E8',
                  fontSize: 13,
                  lineHeight: 1.5,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'Noto Serif SC, serif',
                  boxShadow: isPicked ? '0 0 14px rgba(201,166,118,.45)' : 'none',
                  transition: 'all .25s',
                }}
              >
                {r.text}
              </button>
            );
          })}
        </div>
      </div>

      {hint ? (
        <p
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 11.5,
            color: 'rgba(245,240,232,.7)',
            fontStyle: 'italic',
          }}
        >
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}
