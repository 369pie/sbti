'use client';

/**
 * HERMOSA · 结果页留言入口
 * ─────────────────────────────────────────────
 * - 一行话输入（≤180）+ 单选标签（6 选 1，可不选）+ 匿名签名
 * - 提交后 inline 渲染 3 张同型号近期留言 + 当前留言的黑板字报缩略图
 * - 不评论、不互相私信，纯展览
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import {
  HERMOSA_TAGS,
  HERMOSA_TAG_LABELS,
  HERMOSA_TAG_HINTS,
  type HermosaTag,
  type HermosaUniverse,
} from '@/lib/hermosa/tags';

interface Message {
  id: string;
  text: string;
  signature: string | null;
  tags: string[];
  echo_count: number;
  is_featured: boolean;
  created_at: string;
}

interface Props {
  universe: HermosaUniverse;
  slug?: string;
  code?: string;
  /** 人格名（仅用于 placeholder 文案） */
  personalityName?: string;
  /** 主色，用于按钮 */
  accent?: string;
}

const SIG_KEY = 'hermosa.signature';
const ECHO_KEY = 'hermosa.echoes.v1';

function loadEchoes(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(ECHO_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function saveEcho(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const next = Array.from(loadEchoes());
    next.push(id);
    window.localStorage.setItem(ECHO_KEY, JSON.stringify(next.slice(-200)));
  } catch {}
}

export function HermosaInputCard({
  universe,
  slug,
  code,
  personalityName,
  accent = '#C9A676',
}: Props) {
  const [text, setText] = useState('');
  const [signature, setSignature] = useState('');
  const [tag, setTag] = useState<HermosaTag | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Message | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [peers, setPeers] = useState<Message[]>([]);
  const [echoed, setEchoed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sig = typeof window !== 'undefined' ? window.localStorage.getItem(SIG_KEY) ?? '' : '';
    if (sig) setSignature(sig);
    setEchoed(loadEchoes());
  }, []);

  // 拉取同 slug / 同 universe 近期留言
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const params = new URLSearchParams({ universe, limit: '6' });
      if (slug) params.set('slug', slug);
      try {
        const res = await fetch(getApiPath(`/api/hermosa/messages?${params}`), {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = (await res.json()) as { ok: boolean; messages: Message[] };
        if (cancelled) return;
        setPeers(data.messages ?? []);
      } catch {
        /* noop */
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [universe, slug]);

  const remaining = 180 - text.length;
  const valid = text.trim().length > 0 && remaining >= 0 && !submitting;

  const onSubmit = useCallback(async () => {
    if (!valid) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch(getApiPath('/api/hermosa/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universe,
          slug,
          code,
          text: text.trim(),
          signature: signature.trim() || undefined,
          tags: tag ? [tag] : [],
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: Message; error?: string };
      if (!res.ok || !data.ok || !data.message) {
        if (data.error === 'rate_limited') {
          setErr('一小时内最多写 3 条，先沉淀一下吧。');
        } else {
          setErr('提交失败，稍后再试。');
        }
        return;
      }
      setSubmitted(data.message);
      try {
        if (signature) window.localStorage.setItem(SIG_KEY, signature.trim());
      } catch {}
    } finally {
      setSubmitting(false);
    }
  }, [valid, universe, slug, code, text, signature, tag]);

  const onEcho = useCallback(
    async (id: string) => {
      if (echoed.has(id)) return;
      const next = new Set(echoed);
      next.add(id);
      setEchoed(next);
      saveEcho(id);
      // optimistic
      setPeers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, echo_count: p.echo_count + 1 } : p)),
      );
      try {
        await fetch(getApiPath('/api/hermosa/echo'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch {}
    },
    [echoed],
  );

  const cardUrl = useMemo(() => {
    if (!submitted) return '';
    const params = new URLSearchParams({
      text: submitted.text,
      signature: submitted.signature ?? '',
      universe,
      slug: slug ?? '',
      tag: (submitted.tags ?? [])[0] ?? '',
    });
    return getApiPath(`/api/hermosa/card?${params}`);
  }, [submitted, universe, slug]);

  return (
    <section
      style={{
        marginTop: 64,
        padding: '40px 24px',
        background: 'linear-gradient(180deg, rgba(21,16,42,0.04) 0%, rgba(21,16,42,0.10) 100%)',
        border: '1px solid rgba(201,166,118,0.30)',
        borderRadius: 18,
      }}
      aria-labelledby="hermosa-input-title"
    >
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.42em',
            color: accent,
            marginBottom: 10,
            fontWeight: 500,
          }}
        >
          HERMOSA · 她 的 话
        </div>
        <h2
          id="hermosa-input-title"
          style={{
            margin: 0,
            fontSize: 22,
            fontStyle: 'italic',
            fontFamily: 'var(--font-display, "Noto Serif SC", serif)',
          }}
        >
          {personalityName ? `她想对${personalityName}说什么？` : '她想说点什么？'}
        </h2>
        <p style={{ marginTop: 8, fontSize: 13, opacity: 0.6, lineHeight: 1.7 }}>
          一句话写给同型号姐妹、写给产品、写给世界。
          带 <span style={{ color: accent }}>#想要</span> /{' '}
          <span style={{ color: accent }}>#体验吐槽</span> 的留言会进入产品方公开看板。
        </p>
      </header>

      {!submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 200))}
            placeholder={tag ? HERMOSA_TAG_HINTS[tag] : '一行话，不超过 180 字…'}
            rows={3}
            maxLength={200}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid rgba(201,166,118,0.35)',
              background: 'rgba(255,255,255,0.6)',
              fontSize: 15,
              lineHeight: 1.7,
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: 80,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(HERMOSA_TAGS as readonly HermosaTag[]).map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(active ? '' : t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: '1px solid ' + (active ? accent : 'rgba(201,166,118,0.30)'),
                    background: active ? accent : 'transparent',
                    color: active ? '#15102A' : 'inherit',
                    fontSize: 12,
                    letterSpacing: '0.18em',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  # {HERMOSA_TAG_LABELS[t]}
                </button>
              );
            })}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value.slice(0, 24))}
              placeholder="可空 · 匿名昵称"
              maxLength={24}
              style={{
                flex: '1 1 160px',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid rgba(201,166,118,0.30)',
                background: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <span
              style={{
                fontSize: 12,
                opacity: 0.55,
                fontVariantNumeric: 'tabular-nums',
                marginRight: 'auto',
              }}
            >
              {text.length}/180
            </span>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!valid}
              style={{
                padding: '10px 26px',
                borderRadius: 999,
                border: 'none',
                background: valid ? accent : 'rgba(201,166,118,0.35)',
                color: '#15102A',
                fontSize: 13,
                letterSpacing: '0.24em',
                fontWeight: 600,
                cursor: valid ? 'pointer' : 'not-allowed',
              }}
            >
              {submitting ? '抄写中…' : '写下她的话'}
            </button>
          </div>
          {err ? (
            <div style={{ fontSize: 12, color: '#A85A6E' }}>{err}</div>
          ) : null}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 13, color: accent, letterSpacing: '0.32em' }}>
            ✦ 她的话已被收藏 ✦
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardUrl}
            alt="HERMOSA 黑板字报"
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 14,
              boxShadow: '0 14px 38px rgba(21,16,42,0.20)',
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={cardUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: '1px solid ' + accent,
                color: accent,
                fontSize: 12,
                letterSpacing: '0.24em',
                textDecoration: 'none',
              }}
            >
              下载长图
            </a>
            <Link
              href={withBasePath('/her-voice/')}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                background: accent,
                color: '#15102A',
                fontSize: 12,
                letterSpacing: '0.24em',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              去她的话墙
            </Link>
          </div>
        </div>
      )}

      {peers.length > 0 ? (
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.32em',
              opacity: 0.55,
              textAlign: 'center',
              marginBottom: 14,
            }}
          >
            — 同型号姐妹的话 —
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {peers.slice(0, 3).map((m) => (
              <li
                key={m.id}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(201,166,118,0.20)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 14, lineHeight: 1.65, fontStyle: 'italic' }}>「{m.text}」</div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 11,
                    opacity: 0.55,
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>— {m.signature || 'Anonymous'}</span>
                  <span style={{ marginLeft: 'auto' }} />
                  <button
                    type="button"
                    onClick={() => onEcho(m.id)}
                    disabled={echoed.has(m.id)}
                    style={{
                      padding: '3px 12px',
                      borderRadius: 999,
                      border: '1px solid ' + accent,
                      background: echoed.has(m.id) ? accent : 'transparent',
                      color: echoed.has(m.id) ? '#15102A' : accent,
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      cursor: echoed.has(m.id) ? 'default' : 'pointer',
                    }}
                  >
                    ✦ {m.echo_count} 共鸣
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
