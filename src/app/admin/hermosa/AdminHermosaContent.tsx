'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiPath } from '@/lib/api';
import {
  HERMOSA_TAGS,
  HERMOSA_TAG_LABELS,
  HERMOSA_UNIVERSE_LABELS,
  HERMOSA_STATUS_LABELS,
  type HermosaTag,
} from '@/lib/hermosa/tags';

const TOKEN_KEY = 'wtfti.admin.hermosa.token';

interface Row {
  id: string;
  universe: string;
  slug: string | null;
  code: string | null;
  text: string;
  signature: string | null;
  tags: string[];
  echo_count: number;
  is_featured: boolean;
  status: string | null;
  status_note: string | null;
  is_published: boolean;
  flagged: boolean;
  created_at: string;
}

interface Resp {
  days: number;
  total: number;
  totalsByTag: Record<HermosaTag, number>;
  totalsByUniverse: Record<string, number>;
  rows: Row[];
}

const STATUS_OPTIONS: Array<{ value: '' | 'heard' | 'planned' | 'shipped'; label: string }> = [
  { value: '', label: '— 未处理 —' },
  { value: 'heard', label: '已收到' },
  { value: 'planned', label: '排期中' },
  { value: 'shipped', label: '已上线' },
];

export function AdminHermosaContent() {
  const [token, setToken] = useState('');
  const [days, setDays] = useState(14);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<HermosaTag | 'all' | 'flagged'>('all');

  useEffect(() => {
    const t = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) ?? '' : '';
    setToken(t);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) {
      setErr('请先填入 ADMIN_HERMOSA_TOKEN（或 ADMIN_FUNNEL_TOKEN）');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
        getApiPath(`/api/hermosa/admin?days=${days}&token=${encodeURIComponent(token)}`),
        { cache: 'no-store' },
      );
      if (!res.ok) {
        setErr(`HTTP ${res.status}`);
        setData(null);
      } else {
        setData((await res.json()) as Resp);
        try { window.localStorage.setItem(TOKEN_KEY, token); } catch {}
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  const patchRow = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      if (!token) return;
      const res = await fetch(
        getApiPath(`/api/hermosa/admin?id=${id}&token=${encodeURIComponent(token)}`),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        },
      );
      if (!res.ok) {
        setErr(`PATCH HTTP ${res.status}`);
      } else {
        await fetchData();
      }
    },
    [token, fetchData],
  );

  const filteredRows = useMemo(() => {
    if (!data) return [] as Row[];
    if (tab === 'all') return data.rows;
    if (tab === 'flagged') return data.rows.filter((r) => r.flagged);
    return data.rows.filter((r) => r.tags?.includes(tab));
  }, [data, tab]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0810',
        color: '#F5F0E8',
        padding: '48px 32px 96px',
        fontFamily: 'var(--font-display, "Noto Serif SC", serif)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.42em', color: '#C9A676', marginBottom: 12 }}>
            HERMOSA · ADMIN
          </div>
          <h1 style={{ fontSize: 32, fontStyle: 'italic', margin: 0 }}>
            她说 · 后台看板
          </h1>
          <p style={{ opacity: 0.6, marginTop: 8, fontSize: 14 }}>
            按标签聚合、可标注 已收到 / 排期中 / 已上线 / 精选 / 隐藏，闭环用户共建。
          </p>
        </header>

        <section
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            background: '#15102A',
            border: '1px solid rgba(201,166,118,0.25)',
            borderRadius: 14,
            padding: 16,
            flexWrap: 'wrap',
            marginBottom: 24,
          }}
        >
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_HERMOSA_TOKEN"
            style={{
              flex: '1 1 240px',
              padding: '10px 14px',
              background: '#0a0810',
              border: '1px solid rgba(201,166,118,0.35)',
              borderRadius: 8,
              color: '#F5F0E8',
              fontSize: 14,
            }}
          />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              padding: '10px 14px',
              background: '#0a0810',
              border: '1px solid rgba(201,166,118,0.35)',
              borderRadius: 8,
              color: '#F5F0E8',
              fontSize: 14,
            }}
          >
            {[3, 7, 14, 30, 60, 90].map((d) => (
              <option key={d} value={d}>近 {d} 天</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: '10px 22px',
              background: '#C9A676',
              border: 'none',
              borderRadius: 8,
              color: '#15102A',
              fontWeight: 600,
              letterSpacing: '0.18em',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? '加载中…' : '拉取'}
          </button>
          {err ? <span style={{ color: '#ff8b9b', fontSize: 13 }}>{err}</span> : null}
        </section>

        {data ? (
          <>
            <section style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
              <Stat label="总条数" value={data.total} />
              {(HERMOSA_TAGS as readonly HermosaTag[]).map((t) => (
                <Stat key={t} label={`# ${HERMOSA_TAG_LABELS[t]}`} value={data.totalsByTag[t] ?? 0} />
              ))}
            </section>

            <section style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {(['all', ...HERMOSA_TAGS, 'flagged'] as Array<HermosaTag | 'all' | 'flagged'>).map((t) => {
                const label =
                  t === 'all' ? '全部' : t === 'flagged' ? '⚠ 待审' : `# ${HERMOSA_TAG_LABELS[t]}`;
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      border: '1px solid ' + (active ? '#C9A676' : 'rgba(201,166,118,0.25)'),
                      background: active ? '#C9A676' : 'transparent',
                      color: active ? '#15102A' : '#F5F0E8',
                      fontSize: 12,
                      letterSpacing: '0.18em',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredRows.length === 0 ? (
                <div style={{ opacity: 0.5, padding: 24, textAlign: 'center' }}>暂无</div>
              ) : null}
              {filteredRows.map((r) => (
                <article
                  key={r.id}
                  style={{
                    background: '#15102A',
                    border: '1px solid ' + (r.flagged ? '#ff8b9b' : 'rgba(201,166,118,0.25)'),
                    borderRadius: 14,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.55 }}>
                    <span>
                      {HERMOSA_UNIVERSE_LABELS[r.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ?? r.universe}
                      {r.slug ? ` · ${r.slug}` : ''} {r.code ? ` · ${r.code}` : ''}
                    </span>
                    <span>{new Date(r.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                  <div style={{ fontSize: 18, lineHeight: 1.6, fontStyle: 'italic' }}>「{r.text}」</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                    {(r.tags ?? []).map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: '2px 10px',
                          borderRadius: 999,
                          border: '1px solid rgba(201,166,118,0.35)',
                          color: '#C9A676',
                          letterSpacing: '0.18em',
                        }}
                      >
                        # {HERMOSA_TAG_LABELS[t as HermosaTag] ?? t}
                      </span>
                    ))}
                    <span style={{ marginLeft: 'auto', opacity: 0.5 }}>
                      ✦ {r.echo_count} 共鸣
                      {r.signature ? ` · — ${r.signature}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={r.status ?? ''}
                      onChange={(e) => patchRow(r.id, { status: e.target.value || null })}
                      style={selectStyle}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {r.status ? (
                      <span style={{ fontSize: 12, color: '#C9A676' }}>
                        {HERMOSA_STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    ) : null}
                    <button
                      onClick={() => patchRow(r.id, { is_featured: !r.is_featured })}
                      style={pillStyle(r.is_featured)}
                    >
                      {r.is_featured ? '★ 已精选' : '加入精选'}
                    </button>
                    <button
                      onClick={() => patchRow(r.id, { flagged: !r.flagged })}
                      style={pillStyle(r.flagged, '#ff8b9b')}
                    >
                      {r.flagged ? '⚠ 已标记' : '标记'}
                    </button>
                    <button
                      onClick={() => patchRow(r.id, { is_published: !r.is_published })}
                      style={pillStyle(!r.is_published, '#888')}
                    >
                      {r.is_published ? '隐藏' : '🚫 已隐藏'}
                    </button>
                    <a
                      href={getApiPath(`/api/hermosa/card?text=${encodeURIComponent(r.text)}&signature=${encodeURIComponent(r.signature ?? '')}&universe=${r.universe}&slug=${encodeURIComponent(r.slug ?? '')}&tag=${encodeURIComponent((r.tags ?? [])[0] ?? '')}`)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: 'auto', fontSize: 12, color: '#C9A676' }}
                    >
                      预览字报 ↗
                    </a>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: '#15102A',
        border: '1px solid rgba(201,166,118,0.25)',
        borderRadius: 12,
        padding: '12px 18px',
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.24em', opacity: 0.55 }}>{label}</div>
      <div style={{ fontSize: 24, marginTop: 4, fontStyle: 'italic', color: '#C9A676' }}>{value}</div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#0a0810',
  border: '1px solid rgba(201,166,118,0.35)',
  borderRadius: 6,
  color: '#F5F0E8',
  fontSize: 12,
};

function pillStyle(active: boolean, accent = '#C9A676'): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 999,
    border: `1px solid ${active ? accent : 'rgba(201,166,118,0.25)'}`,
    background: active ? accent : 'transparent',
    color: active ? '#15102A' : '#F5F0E8',
    fontSize: 12,
    letterSpacing: '0.12em',
    cursor: 'pointer',
  };
}
