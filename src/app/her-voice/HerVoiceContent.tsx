'use client';

/**
 * /her-voice — HERMOSA 主墙
 *
 * 瀑布流式（CSS columns）展示，按 universe + tag 筛选。
 * 单条 → 黑板字报缩略图 + 引用 + 共鸣 +1。
 *
 * Refactored: 全量使用 CSS 变量，适配亮/暗主题。
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import {
  HERMOSA_TAGS,
  HERMOSA_TAG_LABELS,
  HERMOSA_UNIVERSES,
  HERMOSA_UNIVERSE_LABELS,
  type HermosaTag,
  type HermosaUniverse,
} from '@/lib/hermosa/tags';

interface Message {
  id: string;
  universe: string;
  slug: string | null;
  text: string;
  signature: string | null;
  tags: string[];
  echo_count: number;
  is_featured: boolean;
  created_at: string;
}

const ECHO_KEY = 'hermosa.echoes.v1';

function loadEchoes(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const arr = JSON.parse(window.localStorage.getItem(ECHO_KEY) ?? '[]') as string[];
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

export function HerVoiceContent() {
  const [universe, setUniverse] = useState<'all' | HermosaUniverse>('all');
  const [tag, setTag] = useState<'all' | HermosaTag>('all');
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [echoed, setEchoed] = useState<Set<string>>(new Set());
  // Write form state
  const [writeText, setWriteText] = useState('');
  const [writeSignature, setWriteSignature] = useState('');
  const [writeTag, setWriteTag] = useState<HermosaTag | ''>('');
  const [writeSubmitting, setWriteSubmitting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [writeSuccess, setWriteSuccess] = useState(false);

  useEffect(() => {
    setEchoed(loadEchoes());
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '60' });
      if (universe !== 'all') params.set('universe', universe);
      if (tag !== 'all') params.set('tag', tag);
      const res = await fetch(getApiPath(`/api/hermosa/messages?${params}`), {
        cache: 'no-store',
      });
      if (!res.ok) {
        setRows([]);
        return;
      }
      const data = (await res.json()) as { ok: boolean; messages: Message[] };
      setRows(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [universe, tag]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const onEcho = useCallback(
    async (id: string) => {
      if (echoed.has(id)) return;
      const next = new Set(echoed);
      next.add(id);
      setEchoed(next);
      saveEcho(id);
      setRows((prev) =>
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

  const onWriteSubmit = useCallback(async () => {
    const text = writeText.trim();
    if (!text || text.length > 180 || writeSubmitting) return;
    setWriteSubmitting(true);
    setWriteError(null);
    setWriteSuccess(false);
    try {
      const res = await fetch(getApiPath('/api/hermosa/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universe: 'meta',
          text,
          signature: writeSignature.trim() || undefined,
          tags: writeTag ? [writeTag] : [],
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: Message; error?: string };
      if (!res.ok || !data.ok) {
        if (data.error === 'rate_limited') {
          setWriteError('一小时内最多写 3 条，先沉淀一下吧。');
        } else {
          setWriteError('提交失败，稍后再试。');
        }
        return;
      }
      setWriteSuccess(true);
      setWriteText('');
      setWriteTag('');
      // Refresh wall
      if (data.message) {
        setRows((prev) => [data.message!, ...prev]);
      }
      setTimeout(() => setWriteSuccess(false), 3000);
    } catch {
      setWriteError('网络错误，稍后再试。');
    } finally {
      setWriteSubmitting(false);
    }
  }, [writeText, writeSignature, writeTag, writeSubmitting]);

  const featured = useMemo(() => rows.filter((r) => r.is_featured).slice(0, 3), [rows]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        padding: '64px 18px 120px',
        fontFamily: 'var(--font-display, "Noto Serif SC", serif)',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.42em',
              color: 'var(--color-rose)',
              marginBottom: 14,
              fontWeight: 500,
            }}
          >
            HERMOSA · HER VOICE
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 44,
              lineHeight: 1.2,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}
          >
            她 说
          </h1>
          <p
            style={{
              maxWidth: 540,
              margin: '18px auto 0',
              fontSize: 14,
              lineHeight: 1.85,
              color: 'var(--color-text-secondary)',
            }}
          >
            一个只让女性安静说话的声音广场。
            写下你的态度、观点、宣言，被同频的人听见。
            带{' '}
            <span style={{ color: 'var(--color-rose)' }}>#想要</span> /{' '}
            <span style={{ color: 'var(--color-rose)' }}>#体验吐槽</span> 的留言会进入公开的{' '}
            <Link href={withBasePath('/her-voice/we-heard-you/')} style={{ color: 'var(--color-accent)' }}>
              「她说我们听见了」看板 →
            </Link>
          </p>
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 60,
                height: 1,
                background: 'var(--color-rose)',
                alignSelf: 'center',
                opacity: 0.4,
              }}
            />
            <span
              style={{
                fontSize: 12,
                letterSpacing: '0.32em',
                fontStyle: 'italic',
                color: 'var(--color-text-muted)',
              }}
            >
              MMXXVI
            </span>
            <span
              style={{
                width: 60,
                height: 1,
                background: 'var(--color-rose)',
                alignSelf: 'center',
                opacity: 0.4,
              }}
            />
          </div>
        </header>

        {/* Filters */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 32,
            padding: 18,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 14,
          }}
        >
          <FilterRow label="宇宙">
            <Pill active={universe === 'all'} onClick={() => setUniverse('all')}>
              全部
            </Pill>
            {(HERMOSA_UNIVERSES as readonly HermosaUniverse[]).map((u) => (
              <Pill key={u} active={universe === u} onClick={() => setUniverse(u)}>
                {HERMOSA_UNIVERSE_LABELS[u]}
              </Pill>
            ))}
          </FilterRow>
          <FilterRow label="标签">
            <Pill active={tag === 'all'} onClick={() => setTag('all')}>
              全部
            </Pill>
            {(HERMOSA_TAGS as readonly HermosaTag[]).map((t) => (
              <Pill key={t} active={tag === t} onClick={() => setTag(t)}>
                # {HERMOSA_TAG_LABELS[t]}
              </Pill>
            ))}
          </FilterRow>
        </section>

        {/* 写一条 */}
        <section
          style={{
            marginBottom: 36,
            padding: 24,
            background: 'var(--color-bg-elevated)',
            borderRadius: 16,
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.42em',
              color: 'var(--color-rose)',
              marginBottom: 14,
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            写 下 她 说
          </div>
          <textarea
            value={writeText}
            onChange={(e) => setWriteText(e.target.value.slice(0, 200))}
            placeholder="一句话，不超过 180 字…"
            rows={3}
            maxLength={200}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              fontSize: 15,
              lineHeight: 1.7,
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: 80,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 12,
            }}
          >
            {(HERMOSA_TAGS as readonly HermosaTag[]).map((t) => {
              const active = writeTag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWriteTag(active ? '' : t)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: '1px solid ' + (active ? 'var(--color-rose)' : 'var(--color-border-subtle)'),
                    background: active ? 'var(--color-rose)' : 'transparent',
                    color: active ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
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
              marginTop: 12,
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              value={writeSignature}
              onChange={(e) => setWriteSignature(e.target.value.slice(0, 24))}
              placeholder="可空 · 匿名昵称"
              maxLength={24}
              style={{
                flex: '1 1 160px',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {writeText.length}/180
            </span>
            <button
              type="button"
              onClick={onWriteSubmit}
              disabled={!writeText.trim() || writeText.length > 180 || writeSubmitting}
              style={{
                padding: '10px 26px',
                borderRadius: 999,
                border: 'none',
                background:
                  writeText.trim() && writeText.length <= 180 && !writeSubmitting
                    ? 'var(--color-rose)'
                    : 'var(--color-bg-secondary)',
                color:
                  writeText.trim() && writeText.length <= 180 && !writeSubmitting
                    ? 'var(--color-bg-primary)'
                    : 'var(--color-text-muted)',
                fontSize: 13,
                letterSpacing: '0.24em',
                fontWeight: 600,
                cursor:
                  writeText.trim() && writeText.length <= 180 && !writeSubmitting
                    ? 'pointer'
                    : 'not-allowed',
                transition: 'all 180ms ease',
              }}
            >
              {writeSubmitting ? '抄写中…' : '写下来'}
            </button>
          </div>
          {writeError ? (
            <div style={{ fontSize: 12, color: 'var(--color-accent)', marginTop: 10 }}>{writeError}</div>
          ) : null}
          {writeSuccess ? (
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-rose)',
                marginTop: 10,
                letterSpacing: '0.24em',
                textAlign: 'center',
              }}
            >
              ✦ 她说已被收藏 ✦
            </div>
          ) : null}
        </section>

        {/* Featured 编辑甄选 */}
        {featured.length > 0 ? (
          <section style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.42em',
                color: 'var(--color-accent)',
                marginBottom: 14,
                textAlign: 'center',
              }}
            >
              ✦ 本周精选 · EDITOR&apos;S CHOICE ✦
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14,
              }}
            >
              {featured.map((m) => (
                <FeaturedCard key={m.id} m={m} echoed={echoed.has(m.id)} onEcho={onEcho} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Wall — CSS columns 瀑布流 */}
        {loading && rows.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 }}>正在打开她们的笔记本…</div>
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              columnCount: 1,
              columnGap: 16,
            }}
            className="hermosa-wall"
          >
            {rows.map((m) => (
              <WallCard key={m.id} m={m} echoed={echoed.has(m.id)} onEcho={onEcho} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 600px) {
          :global(.hermosa-wall) { column-count: 2; }
        }
        @media (min-width: 960px) {
          :global(.hermosa-wall) { column-count: 3; }
        }
      `}</style>
    </main>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.32em', color: 'var(--color-text-muted)', minWidth: 48 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 999,
        border: '1px solid ' + (active ? 'var(--color-rose)' : 'var(--color-border-subtle)'),
        background: active ? 'var(--color-rose)' : 'transparent',
        color: active ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
        fontSize: 12,
        letterSpacing: '0.18em',
        cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
    >
      {children}
    </button>
  );
}

function WallCard({
  m,
  echoed,
  onEcho,
}: {
  m: Message;
  echoed: boolean;
  onEcho: (id: string) => void;
}) {
  return (
    <article
      style={{
        breakInside: 'avoid',
        marginBottom: 16,
        padding: 18,
        borderRadius: 14,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: '0 10px 30px color-mix(in oklab, var(--color-text-primary) 6%, transparent)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.65,
          fontStyle: 'italic',
          fontFamily: 'var(--font-display, "Noto Serif SC", serif)',
        }}
      >
        <span style={{ color: 'var(--color-rose)', marginRight: 4 }}>「</span>
        {m.text}
        <span style={{ color: 'var(--color-rose)', marginLeft: 4 }}>」</span>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {(m.tags ?? []).slice(0, 2).map((t) => (
          <span
            key={t}
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              padding: '2px 8px',
              borderRadius: 999,
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
          >
            # {HERMOSA_TAG_LABELS[t as HermosaTag] ?? t}
          </span>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--color-text-muted)',
        }}
      >
        <span style={{ fontStyle: 'italic' }}>
          — {m.signature || 'Anonymous'}
          {m.slug ? ` · ${m.slug}` : ''}
        </span>
        <button
          type="button"
          onClick={() => onEcho(m.id)}
          disabled={echoed}
          style={{
            marginLeft: 'auto',
            padding: '3px 10px',
            borderRadius: 999,
            border: '1px solid var(--color-rose)',
            background: echoed ? 'var(--color-rose)' : 'transparent',
            color: echoed ? 'var(--color-bg-primary)' : 'var(--color-rose)',
            fontSize: 11,
            letterSpacing: '0.18em',
            cursor: echoed ? 'default' : 'pointer',
          }}
        >
          ✦ {m.echo_count}
        </button>
      </div>
    </article>
  );
}

function FeaturedCard({
  m,
  echoed,
  onEcho,
}: {
  m: Message;
  echoed: boolean;
  onEcho: (id: string) => void;
}) {
  const cardUrl = useMemo(() => {
    const params = new URLSearchParams({
      text: m.text,
      signature: m.signature ?? '',
      universe: m.universe,
      slug: m.slug ?? '',
      tag: (m.tags ?? [])[0] ?? '',
    });
    return getApiPath(`/api/hermosa/card?${params}`);
  }, [m]);
  return (
    <article
      style={{
        background: 'var(--color-bg-elevated)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cardUrl} alt={m.text.slice(0, 30)} style={{ width: '100%', display: 'block' }} />
      <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          — {m.signature || 'Anonymous'}
        </span>
        <button
          type="button"
          onClick={() => onEcho(m.id)}
          disabled={echoed}
          style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            borderRadius: 999,
            border: '1px solid var(--color-rose)',
            background: echoed ? 'var(--color-rose)' : 'transparent',
            color: echoed ? 'var(--color-bg-primary)' : 'var(--color-rose)',
            fontSize: 11,
            letterSpacing: '0.18em',
            cursor: echoed ? 'default' : 'pointer',
          }}
        >
          ✦ {m.echo_count}
        </button>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: 'var(--color-bg-elevated)',
        borderRadius: 16,
        border: '1px dashed var(--color-border-subtle)',
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>这里还很安静。</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        在上面写下你的第一句话，或者{' '}
        <Link href={withBasePath('/')} style={{ color: 'var(--color-accent)' }}>
          做一个测试
        </Link>{' '}
        从结果页开始 ✦
      </div>
      <Link
        href={withBasePath('/')}
        style={{
          display: 'inline-block',
          marginTop: 22,
          padding: '10px 22px',
          borderRadius: 999,
          background: 'var(--color-rose)',
          color: 'var(--color-bg-primary)',
          fontSize: 12,
          letterSpacing: '0.24em',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        去 WTFTI 首页
      </Link>
    </div>
  );
}
