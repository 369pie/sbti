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
import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { withBasePath } from '@/lib/site';
import {
  HERMOSA_TAGS,
  HERMOSA_TAG_LABELS,
  HERMOSA_TAG_HINTS,
  type HermosaTag,
  type HermosaUniverse,
} from '@/lib/hermosa/tags';
import { getCurrentHermosaTopic } from '@/lib/hermosa/topics';
import { rememberOwnContribution } from '@/lib/hermosa/contributions-storage';

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
const RESULT_TOPIC_WEEK = getCurrentHermosaTopic().week;

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

function followUpHref(
  kind: 'book' | 'ai_question',
  universe: HermosaUniverse,
  slug?: string,
  code?: string,
): string {
  const params = new URLSearchParams({ kind, universe });
  if (slug) params.set('slug', slug);
  if (code) params.set('code', code);
  return withBasePath(`/her-voice/?${params}`);
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
      rememberOwnContribution(data.message.id);
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
      className="hv-ic-shell"
      style={{
        margin: '64px auto 0',
        width: 'min(100% - 48px, 860px)',
        padding: '48px 32px 40px',
        background: '#FAF7F2',
        border: 'none',
        borderTop: '3px solid #1A1530',
        borderBottom: '1px solid rgba(26,21,48,0.14)',
        boxSizing: 'border-box',
        color: '#1A1530',
        fontFamily: '"Noto Serif SC", serif',
      }}
      aria-labelledby="hermosa-input-title"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 720px) {
              .hv-ic-shell { margin: 40px auto 0 !important; width: 100% !important; padding: 32px 18px !important; }
              .hv-ic-cols { flex-direction: column !important; }
            }
          `,
        }}
      />
      <header style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.42em',
            color: accent,
            marginBottom: 14,
            textTransform: 'uppercase',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
          }}
        >
          § 写入档案 · COMPOSE
        </div>
        <h2
          id="hermosa-input-title"
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.15,
            fontStyle: 'italic',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#1A1530',
            fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
          }}
        >
          {personalityName ? `她想对${personalityName}说什么？` : '写下你想说的'}
        </h2>
        <div style={{ width: 48, height: 2, background: accent, margin: '20px 0 0' }} />
        <p
          style={{
            marginTop: 18,
            fontSize: 14,
            lineHeight: 1.85,
            color: '#1A1530',
            opacity: 0.78,
            maxWidth: 580,
          }}
        >
          一句话写给同型号姐妹、写给产品。带 <span style={{ color: accent, fontStyle: 'italic', fontWeight: 600 }}>#想要</span> /{' '}
          <span style={{ color: accent, fontStyle: 'italic', fontWeight: 600 }}>#体验吐槽</span> 会进入我们的开发板。
        </p>
      </header>

      {!submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 200))}
            placeholder={tag ? HERMOSA_TAG_HINTS[tag] : '在这里点亮一束光。可以只是一个名字、一句没说出口的话、一个棗…'}
            rows={3}
            maxLength={200}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: 0,
              border: 'none',
              borderBottom: '1px solid rgba(26,21,48,0.14)',
              background: '#F5F0E8',
              color: '#1A1530',
              fontSize: 16,
              lineHeight: 1.75,
              fontFamily: '"Noto Serif SC", serif',
              fontStyle: 'italic',
              resize: 'vertical',
              minHeight: 100,
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
                    padding: active ? '6px 12px 6px 10px' : '6px 12px',
                    borderRadius: 0,
                    border: '1px solid ' + (active ? accent : 'rgba(26,21,48,0.14)'),
                    background: active ? accent : 'transparent',
                    color: active ? '#F5F0E8' : '#8A817A',
                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                    fontSize: 11,
                    letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  <span style={{ opacity: 0.6 }}>#</span> {HERMOSA_TAG_LABELS[t]}
                </button>
              );
            })}
          </div>
          <div
            className="hv-ic-cols"
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'baseline',
              flexWrap: 'wrap',
              borderTop: '1px dashed rgba(26,21,48,0.14)',
              paddingTop: 18,
            }}
          >
            <div style={{ display: 'flex', flex: '1 1 200px', alignItems: 'baseline', borderBottom: '1px solid #1A1530' }}>
              <span style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 10, color: '#8A817A', letterSpacing: '0.2em' }}>FROM ·</span>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value.slice(0, 24))}
                placeholder="可空 · 匿名昵称"
                maxLength={24}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: 0,
                  border: 'none',
                  background: 'transparent',
                  color: '#1A1530',
                  fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  outline: 'none',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                color: '#8A817A',
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
                padding: '12px 24px',
                borderRadius: 0,
                border: 'none',
                background: valid ? '#1A1530' : 'rgba(26,21,48,0.06)',
                color: valid ? '#F5F0E8' : 'rgba(26,21,48,0.3)',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                fontWeight: 500,
                cursor: valid ? 'pointer' : 'not-allowed',
                transition: 'all 180ms ease',
              }}
            >
              {submitting ? '· LIGHTING ·' : '→ 点亮这束光'}
            </button>
          </div>
          {err ? (
            <div style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 11, color: '#C0512F' }}>
              {err}
            </div>
          ) : null}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11,
              color: accent,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
            }}
          >
            § 已存档 · SAVED
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardUrl}
            alt="HERMOSA 存档"
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 0,
              border: `1px solid rgba(26,21,48,0.14)`,
            }}
          />
          <div className="hv-ic-cols" style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 360 }}>
            <a
              href={cardUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 18px',
                borderRadius: 0,
                border: '1px solid rgba(26,21,48,0.14)',
                color: '#1A1530',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              ↓ 保存长图
            </a>
            <Link
              href={withBasePath('/her-voice/')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 18px',
                borderRadius: 0,
                background: '#1A1530',
                color: '#F5F0E8',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              → 返回她说墙
            </Link>
          </div>
          <div
            className="hv-ic-cols"
            style={{
              width: '100%',
              maxWidth: 520,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
              paddingTop: 12,
              borderTop: '1px dashed rgba(26,21,48,0.14)',
            }}
          >
            <FollowUpLink
              href={followUpHref('book', universe, slug, code)}
              target="result_book_followup"
            >
              推荐一本书
            </FollowUpLink>
            <FollowUpLink
              href={followUpHref('ai_question', universe, slug, code)}
              target="result_ai_followup"
            >
              写一个 AI 问题
            </FollowUpLink>
            <FollowUpLink
              href={withBasePath('/her-voice/my/')}
              target="result_salon_followup"
            >
              → 点亮自己的第一束光
            </FollowUpLink>
          </div>
        </div>
      )}

      {peers.length > 0 ? (
        <div style={{ marginTop: 40, borderTop: '3px solid #1A1530', paddingTop: 32 }}>
          <div
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.42em',
              color: '#8A817A',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            § 回声 · PEERS
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
            }}
          >
            {peers.slice(0, 3).map((m) => (
              <li
                key={m.id}
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(26,21,48,0.14)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.75,
                    fontStyle: 'italic',
                    color: '#1A1530',
                    fontFamily: '"Noto Serif SC", serif',
                  }}
                >
                  “{m.text}”
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: '#8A817A',
                    }}
                  >
                    — {m.signature || 'Anonymous'}
                  </span>
                  <span style={{ marginLeft: 'auto' }} />
                  <button
                    type="button"
                    onClick={() => onEcho(m.id)}
                    disabled={echoed.has(m.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 0,
                      border: '1px solid ' + (echoed.has(m.id) ? accent : 'rgba(26,21,48,0.14)'),
                      background: echoed.has(m.id) ? accent : 'transparent',
                      color: echoed.has(m.id) ? '#F5F0E8' : '#1A1530',
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      textTransform: 'uppercase',
                      cursor: echoed.has(m.id) ? 'default' : 'pointer',
                      transition: 'all 200ms ease',
                    }}
                  >
                    {echoed.has(m.id) ? '✓ ' + m.echo_count : '+ ' + m.echo_count}
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

function FollowUpLink({
  href,
  target,
  children,
}: {
  href: string;
  target: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        enqueueProductEvent('her_voice', 'her_voice_asset_click', {
          props: { target, topic_week: RESULT_TOPIC_WEEK },
        })
      }
      style={{
        flex: '1 1 140px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 14px',
        borderRadius: 0,
        border: '1px solid rgba(26,21,48,0.14)',
        color: '#1A1530',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );
}
