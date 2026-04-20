'use client';

/**
 * /her-voice — HERMOSA 主墙
 *
 * 瀑布流式（CSS columns）展示，按 universe + tag 筛选。
 * 单条 → 黑板字报缩略图 + 引用 + 共鸣 +1。
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

  const featured = useMemo(() => rows.filter((r) => r.is_featured).slice(0, 3), [rows]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, rgba(192,122,142,0.10) 0%, rgba(245,240,232,0) 50%), #FAF6EE',
        color: '#15102A',
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
              color: '#C9A676',
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
            她 的 话 墙
          </h1>
          <p
            style={{
              maxWidth: 540,
              margin: '18px auto 0',
              fontSize: 14,
              lineHeight: 1.85,
              opacity: 0.7,
            }}
          >
            一面只让女性安静说话的涂鸦黑板字报墙。
            做完任意一个 WTFTI 测试，你都可以在结果页留下一句话；带{' '}
            <span style={{ color: '#C9A676' }}>#想要</span> /{' '}
            <span style={{ color: '#C9A676' }}>#体验吐槽</span> 的留言会进入我们公开的{' '}
            <Link href={withBasePath('/her-voice/we-heard-you/')} style={{ color: '#A85A6E' }}>
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
                background: '#C9A676',
                alignSelf: 'center',
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: 12,
                letterSpacing: '0.32em',
                fontStyle: 'italic',
                opacity: 0.55,
              }}
            >
              MMXXVI
            </span>
            <span
              style={{
                width: 60,
                height: 1,
                background: '#C9A676',
                alignSelf: 'center',
                opacity: 0.6,
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
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(201,166,118,0.25)',
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

        {/* Featured 编辑甄选 */}
        {featured.length > 0 ? (
          <section style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.42em',
                color: '#A85A6E',
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
          <div style={{ textAlign: 'center', opacity: 0.5, padding: 40 }}>正在打开她们的笔记本…</div>
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
      <span style={{ fontSize: 11, letterSpacing: '0.32em', opacity: 0.55, minWidth: 48 }}>
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
        border: '1px solid ' + (active ? '#C9A676' : 'rgba(201,166,118,0.30)'),
        background: active ? '#C9A676' : 'transparent',
        color: active ? '#15102A' : '#15102A',
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
        background: '#15102A',
        color: '#F5F0E8',
        boxShadow: '0 10px 30px rgba(21,16,42,0.10)',
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
        <span style={{ color: '#C9A676', marginRight: 4 }}>「</span>
        {m.text}
        <span style={{ color: '#C9A676', marginLeft: 4 }}>」</span>
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
              border: '1px solid rgba(201,166,118,0.45)',
              color: '#C9A676',
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
          opacity: 0.55,
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
            border: '1px solid #C9A676',
            background: echoed ? '#C9A676' : 'transparent',
            color: echoed ? '#15102A' : '#C9A676',
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
        background: '#15102A',
        color: '#F5F0E8',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(201,166,118,0.4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cardUrl} alt={m.text.slice(0, 30)} style={{ width: '100%', display: 'block' }} />
      <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, opacity: 0.6, fontStyle: 'italic' }}>
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
            border: '1px solid #C9A676',
            background: echoed ? '#C9A676' : 'transparent',
            color: echoed ? '#15102A' : '#C9A676',
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
        opacity: 0.6,
        background: 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        border: '1px dashed rgba(201,166,118,0.4)',
      }}
    >
      <div style={{ fontSize: 14, marginBottom: 12 }}>这里还很安静。</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        去做一个测试，回到结果页留下你的第一句话 ✦
      </div>
      <Link
        href={withBasePath('/')}
        style={{
          display: 'inline-block',
          marginTop: 22,
          padding: '10px 22px',
          borderRadius: 999,
          background: '#C9A676',
          color: '#15102A',
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
