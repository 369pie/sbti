'use client';

/**
 * Admin · HERMOSA Salon 治理后台
 *
 * 两个 tab：
 *   1) Talents — curation_status / spotlight / flag / publish
 *   2) Whispers — 投递审计（成功 / 失败 / flagged 投递记录）
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import { HERMOSA_UNIVERSE_LABELS } from '@/lib/hermosa/tags';

const TOKEN_KEY = 'wtfti.admin.hermosa.token';

const PAPER = '#F5F0E8';
const PAPER_RAISED = '#FAF7F2';
const INK = '#1A1530';
const INK_MUTED = '#8A817A';
const ACCENT = '#C0512F';
const HAIRLINE = 'rgba(26, 21, 48, 0.14)';
const MONO = 'ui-monospace, "SF Mono", monospace';
const SERIF = 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)';

interface TalentRow {
  id: string;
  handle: string;
  pitch: string;
  skills: string[];
  universe: string | null;
  contact_email: string | null;
  contact_note: string | null;
  is_open_to_collab: boolean;
  is_published: boolean;
  flagged: boolean;
  curation_status: 'pending' | 'reviewed' | 'spotlighted' | 'rejected';
  source_msg_id: string | null;
  client_hash: string | null;
  created_at: string;
}

interface TalentResp {
  total: number;
  totalsByCuration: Record<string, number>;
  flaggedTotal: number;
  liveTotal: number;
  openTotal: number;
  rows: TalentRow[];
}

interface WhisperRow {
  id: string;
  talent_id: string;
  talent_handle: string | null;
  sender_email: string;
  sender_handle: string | null;
  brief_len: number;
  budget_band: string | null;
  delivered: boolean;
  deliver_error: string | null;
  flagged: boolean;
  created_at: string;
}

interface WhisperResp {
  total: number;
  flaggedTotal: number;
  deliveredTotal: number;
  failedTotal: number;
  rows: WhisperRow[];
}

interface TopicRow {
  week_code: string;
  title: string;
  eyebrow: string | null;
  prompts: string[] | null;
  calendar_tag: string | null;
  pillar_link: string | null;
  notes: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface TopicResp {
  total: number;
  publishedCount: number;
  rows: TopicRow[];
}

const CURATION_LABELS: Record<TalentRow['curation_status'], string> = {
  pending: '待审',
  reviewed: '已审',
  spotlighted: '★ 精选',
  rejected: '拒绝',
};

export function AdminAuroraContent() {
  const [token, setToken] = useState('');
  const [tab, setTab] = useState<'talents' | 'whispers' | 'topics'>('talents');
  const [days, setDays] = useState(30);
  const [curationFilter, setCurationFilter] = useState<'all' | TalentRow['curation_status']>('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [whisperDeliveredOnly, setWhisperDeliveredOnly] = useState<'all' | 'true' | 'false'>('all');
  const [whisperFlaggedOnly, setWhisperFlaggedOnly] = useState(false);
  const [whisperTalentId, setWhisperTalentId] = useState('');

  const [talents, setTalents] = useState<TalentResp | null>(null);
  const [whispers, setWhispers] = useState<WhisperResp | null>(null);
  const [topics, setTopics] = useState<TopicResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) ?? '' : '';
    setToken(t);
  }, []);

  const fetchTalents = useCallback(async () => {
    if (!token) {
      setErr('请先填入 ADMIN_HERMOSA_TOKEN（或 ADMIN_FUNNEL_TOKEN）');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({ token, days: String(days) });
      if (curationFilter !== 'all') params.set('curation_status', curationFilter);
      if (flaggedOnly) params.set('flagged', 'true');
      const res = await fetch(getApiPath(`/api/hermosa/admin/talents?${params}`), {
        cache: 'no-store',
      });
      if (!res.ok) {
        setErr(`HTTP ${res.status}`);
        setTalents(null);
      } else {
        setTalents((await res.json()) as TalentResp);
        try {
          window.localStorage.setItem(TOKEN_KEY, token);
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'network_error');
    } finally {
      setLoading(false);
    }
  }, [token, days, curationFilter, flaggedOnly]);

  const fetchWhispers = useCallback(async () => {
    if (!token) {
      setErr('请先填入 ADMIN_HERMOSA_TOKEN（或 ADMIN_FUNNEL_TOKEN）');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({ token, days: String(days) });
      if (whisperFlaggedOnly) params.set('flagged', 'true');
      if (whisperDeliveredOnly !== 'all') params.set('delivered', whisperDeliveredOnly);
      if (whisperTalentId.trim()) params.set('talent_id', whisperTalentId.trim());
      const res = await fetch(getApiPath(`/api/hermosa/admin/whispers?${params}`), {
        cache: 'no-store',
      });
      if (!res.ok) {
        setErr(`HTTP ${res.status}`);
        setWhispers(null);
      } else {
        setWhispers((await res.json()) as WhisperResp);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'network_error');
    } finally {
      setLoading(false);
    }
  }, [token, days, whisperDeliveredOnly, whisperFlaggedOnly, whisperTalentId]);

  const patchTalent = useCallback(
    async (id: string, body: Partial<Pick<TalentRow, 'curation_status' | 'flagged' | 'is_published' | 'is_open_to_collab'>>) => {
      if (!token) return;
      try {
        const res = await fetch(getApiPath(`/api/hermosa/admin/talents?id=${id}&token=${encodeURIComponent(token)}`), {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          setErr(`PATCH ${res.status}`);
          return;
        }
        const data = (await res.json()) as { ok: boolean; talent: TalentRow };
        if (data.ok && talents) {
          setTalents({
            ...talents,
            rows: talents.rows.map((r) => (r.id === id ? data.talent : r)),
          });
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'network_error');
      }
    },
    [token, talents],
  );

  const fetchTopics = useCallback(async () => {
    if (!token) {
      setErr('请先填入 ADMIN_HERMOSA_TOKEN（或 ADMIN_FUNNEL_TOKEN）');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(getApiPath(`/api/hermosa/admin/topics?token=${encodeURIComponent(token)}`), {
        cache: 'no-store',
      });
      if (!res.ok) {
        setErr(`HTTP ${res.status}`);
        setTopics(null);
      } else {
        setTopics((await res.json()) as TopicResp);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'network_error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const upsertTopic = useCallback(
    async (
      mode: 'create' | 'update',
      week_code: string,
      body: Partial<Omit<TopicRow, 'created_at' | 'updated_at'>>,
    ) => {
      if (!token) return false;
      try {
        const url =
          mode === 'create'
            ? `/api/hermosa/admin/topics?token=${encodeURIComponent(token)}`
            : `/api/hermosa/admin/topics?token=${encodeURIComponent(token)}&week_code=${encodeURIComponent(week_code)}`;
        const payload = mode === 'create' ? { week_code, ...body } : body;
        const res = await fetch(getApiPath(url), {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          setErr(`${mode.toUpperCase()} ${res.status} · ${j.error ?? ''}`);
          return false;
        }
        await fetchTopics();
        return true;
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'network_error');
        return false;
      }
    },
    [token, fetchTopics],
  );

  const deleteTopic = useCallback(
    async (week_code: string) => {
      if (!token) return;
      if (typeof window !== 'undefined' && !window.confirm(`删除 ${week_code} 这一周的围炉主题？`)) return;
      try {
        const res = await fetch(
          getApiPath(
            `/api/hermosa/admin/topics?token=${encodeURIComponent(token)}&week_code=${encodeURIComponent(week_code)}`,
          ),
          { method: 'DELETE' },
        );
        if (!res.ok) {
          setErr(`DELETE ${res.status}`);
          return;
        }
        await fetchTopics();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'network_error');
      }
    },
    [token, fetchTopics],
  );

  return (
    <main style={{ minHeight: '100vh', background: PAPER, color: INK, padding: '32px 24px 96px', fontFamily: SERIF }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ marginBottom: 32, paddingBottom: 16, borderBottom: `1px solid ${INK}` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.42em', color: ACCENT, textTransform: 'uppercase' }}>
            § ADMIN · HERMOSA · AURORA
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 'clamp(28px, 4vw, 40px)', fontStyle: 'italic', fontWeight: 400 }}>
            Aurora 治理后台
          </h1>
          <p style={{ margin: 0, color: INK_MUTED, fontSize: 14 }}>
            Talents 审核 · Whisper 投递审计 · 每条操作即时生效
          </p>
          <nav style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <Link href={withBasePath('/admin/hermosa/')} style={navLinkStyle}>
              ← 留言后台
            </Link>
            <Link href={withBasePath('/admin/hermosa/atlas/')} style={navLinkStyle}>
              → Atlas 投稿池
            </Link>
            <Link href={withBasePath('/her-voice/talents/')} style={navLinkStyle} target="_blank" rel="noreferrer">
              → 公开名录
            </Link>
            <Link href={withBasePath('/her-voice/')} style={navLinkStyle} target="_blank" rel="noreferrer">
              → 主墙
            </Link>
          </nav>
        </header>

        {/* Token + days controls */}
        <section style={controlBoxStyle}>
          <label style={labelStyle}>
            <span>ADMIN TOKEN</span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ADMIN_HERMOSA_TOKEN"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            <span>窗口（天）</span>
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value) || 30)))}
              style={{ ...inputStyle, width: 100 }}
            />
          </label>
          <button
            onClick={tab === 'talents' ? fetchTalents : tab === 'whispers' ? fetchWhispers : fetchTopics}
            disabled={loading}
            style={primaryBtnStyle}
          >
            {loading ? '· 加载中 ·' : '↻ 拉取'}
          </button>
        </section>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 0, marginTop: 24, borderBottom: `1px solid ${HAIRLINE}` }}>
          <TabButton active={tab === 'talents'} onClick={() => setTab('talents')}>
            I · 接单档案
          </TabButton>
          <TabButton active={tab === 'whispers'} onClick={() => setTab('whispers')}>
            II · Whisper 审计
          </TabButton>
          <TabButton active={tab === 'topics'} onClick={() => setTab('topics')}>
            III · 围炉主题
          </TabButton>
        </nav>

        {err ? (
          <div style={{ marginTop: 16, padding: 12, border: `1px solid ${ACCENT}`, color: ACCENT, fontFamily: MONO, fontSize: 12 }}>
            · {err} ·
          </div>
        ) : null}

        {tab === 'talents' ? (
          <TalentsTab
            data={talents}
            curationFilter={curationFilter}
            setCurationFilter={setCurationFilter}
            flaggedOnly={flaggedOnly}
            setFlaggedOnly={setFlaggedOnly}
            patchTalent={patchTalent}
          />
        ) : tab === 'whispers' ? (
          <WhispersTab
            data={whispers}
            deliveredOnly={whisperDeliveredOnly}
            setDeliveredOnly={setWhisperDeliveredOnly}
            flaggedOnly={whisperFlaggedOnly}
            setFlaggedOnly={setWhisperFlaggedOnly}
            talentId={whisperTalentId}
            setTalentId={setWhisperTalentId}
          />
        ) : (
          <TopicsTab data={topics} upsertTopic={upsertTopic} deleteTopic={deleteTopic} />
        )}
      </div>
    </main>
  );
}

function TabButton({
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
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
        padding: '14px 22px',
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.42em',
        textTransform: 'uppercase',
        color: active ? INK : INK_MUTED,
        cursor: 'pointer',
        marginBottom: -1,
      }}
    >
      {children}
    </button>
  );
}

function TalentsTab({
  data,
  curationFilter,
  setCurationFilter,
  flaggedOnly,
  setFlaggedOnly,
  patchTalent,
}: {
  data: TalentResp | null;
  curationFilter: 'all' | TalentRow['curation_status'];
  setCurationFilter: (v: 'all' | TalentRow['curation_status']) => void;
  flaggedOnly: boolean;
  setFlaggedOnly: (v: boolean) => void;
  patchTalent: (id: string, body: Partial<Pick<TalentRow, 'curation_status' | 'flagged' | 'is_published' | 'is_open_to_collab'>>) => void;
}) {
  return (
    <section style={{ marginTop: 24 }}>
      {data ? (
        <div style={kpiGridStyle}>
          <Kpi k="LIVE" v={data.liveTotal} hint="可见 & 未 flag" />
          <Kpi k="OPEN" v={data.openTotal} hint="可见 & 接单中" />
          <Kpi k="FLAGGED" v={data.flaggedTotal} hint="待复核" accent={data.flaggedTotal > 0} />
          <Kpi k="PENDING" v={data.totalsByCuration.pending ?? 0} />
          <Kpi k="SPOTLIGHTED" v={data.totalsByCuration.spotlighted ?? 0} />
          <Kpi k="REJECTED" v={data.totalsByCuration.rejected ?? 0} />
        </div>
      ) : null}

      <div style={filterRowStyle}>
        <label style={chipLabelStyle}>
          <span>CURATION</span>
          <select
            value={curationFilter}
            onChange={(e) => setCurationFilter(e.target.value as typeof curationFilter)}
            style={selectStyle}
          >
            <option value="all">全部</option>
            <option value="pending">待审</option>
            <option value="reviewed">已审</option>
            <option value="spotlighted">★ 精选</option>
            <option value="rejected">拒绝</option>
          </select>
        </label>
        <label style={{ ...chipLabelStyle, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          仅 flagged
        </label>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
        {(data?.rows ?? []).map((t) => (
          <TalentCard key={t.id} t={t} patchTalent={patchTalent} />
        ))}
        {data && data.rows.length === 0 ? (
          <div style={emptyStyle}>· 这个窗口里没有符合条件的接单档案 ·</div>
        ) : null}
      </div>
    </section>
  );
}

function TalentCard({
  t,
  patchTalent,
}: {
  t: TalentRow;
  patchTalent: (id: string, body: Partial<Pick<TalentRow, 'curation_status' | 'flagged' | 'is_published' | 'is_open_to_collab'>>) => void;
}) {
  return (
    <article
      style={{
        background: PAPER_RAISED,
        border: `1px solid ${HAIRLINE}`,
        borderTop: t.flagged ? `3px solid ${ACCENT}` : `3px solid ${INK}`,
        padding: '20px 22px',
        display: 'grid',
        gap: 12,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontStyle: 'italic', fontSize: 24, fontWeight: 400 }}>{t.handle}</h3>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: INK_MUTED, textTransform: 'uppercase' }}>
          {CURATION_LABELS[t.curation_status]}
        </span>
        {t.flagged ? (
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: ACCENT, textTransform: 'uppercase' }}>
            ⚠ FLAGGED
          </span>
        ) : null}
        {!t.is_published ? (
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: INK_MUTED, textTransform: 'uppercase' }}>
            · 已下架 ·
          </span>
        ) : null}
        <Link
          href={withBasePath(`/her-voice/talents/${t.id}/`)}
          target="_blank"
          rel="noreferrer"
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: INK_MUTED, textTransform: 'uppercase', textDecoration: 'underline', marginLeft: 'auto' }}
        >
          ↗ 公开页
        </Link>
      </header>

      <p style={{ margin: 0, fontStyle: 'italic', borderLeft: `3px solid ${ACCENT}`, paddingLeft: 14, color: INK }}>
        「{t.pitch}」
      </p>

      {t.skills.length > 0 ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {t.skills.map((s) => (
            <span
              key={s}
              style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${HAIRLINE}` }}
            >
              #{s}
            </span>
          ))}
        </div>
      ) : null}

      <dl style={{ margin: 0, fontSize: 12, color: INK_MUTED, display: 'grid', gap: 4 }}>
        <Meta k="EMAIL" v={t.contact_email ?? '(未预留)'} />
        {t.contact_note ? <Meta k="NOTE" v={t.contact_note} /> : null}
        {t.universe ? (
          <Meta
            k="FROM"
            v={HERMOSA_UNIVERSE_LABELS[t.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ?? t.universe}
          />
        ) : null}
        <Meta k="CREATED" v={new Date(t.created_at).toLocaleString('zh-CN')} />
        <Meta k="STATUS" v={`${t.is_published ? '已发布' : '已下架'} · ${t.is_open_to_collab ? '接单中' : '暂停接单'}`} />
      </dl>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => patchTalent(t.id, { curation_status: 'spotlighted' })}
          disabled={t.curation_status === 'spotlighted'}
          style={t.curation_status === 'spotlighted' ? activeBtnStyle : btnStyle}
        >
          ★ 精选
        </button>
        <button
          onClick={() => patchTalent(t.id, { curation_status: 'reviewed' })}
          disabled={t.curation_status === 'reviewed'}
          style={t.curation_status === 'reviewed' ? activeBtnStyle : btnStyle}
        >
          ✓ 已审
        </button>
        <button
          onClick={() => patchTalent(t.id, { curation_status: 'rejected' })}
          style={btnStyle}
        >
          ✕ 拒绝
        </button>
        <button
          onClick={() => patchTalent(t.id, { flagged: !t.flagged })}
          style={t.flagged ? activeBtnStyle : btnStyle}
        >
          {t.flagged ? '↩ 解除 flag' : '⚠ 标记 flag'}
        </button>
        <button
          onClick={() => patchTalent(t.id, { is_published: !t.is_published })}
          style={btnStyle}
        >
          {t.is_published ? '⌫ 下架' : '↑ 重新发布'}
        </button>
      </div>
    </article>
  );
}

function WhispersTab({
  data,
  deliveredOnly,
  setDeliveredOnly,
  flaggedOnly,
  setFlaggedOnly,
  talentId,
  setTalentId,
}: {
  data: WhisperResp | null;
  deliveredOnly: 'all' | 'true' | 'false';
  setDeliveredOnly: (v: 'all' | 'true' | 'false') => void;
  flaggedOnly: boolean;
  setFlaggedOnly: (v: boolean) => void;
  talentId: string;
  setTalentId: (v: string) => void;
}) {
  return (
    <section style={{ marginTop: 24 }}>
      {data ? (
        <div style={kpiGridStyle}>
          <Kpi k="TOTAL" v={data.total} hint="时间窗内" />
          <Kpi k="DELIVERED" v={data.deliveredTotal} />
          <Kpi k="FAILED" v={data.failedTotal} accent={data.failedTotal > 0} />
          <Kpi k="FLAGGED" v={data.flaggedTotal} accent={data.flaggedTotal > 0} />
        </div>
      ) : null}

      <div style={filterRowStyle}>
        <label style={chipLabelStyle}>
          <span>DELIVERED</span>
          <select
            value={deliveredOnly}
            onChange={(e) => setDeliveredOnly(e.target.value as typeof deliveredOnly)}
            style={selectStyle}
          >
            <option value="all">全部</option>
            <option value="true">仅成功</option>
            <option value="false">仅失败</option>
          </select>
        </label>
        <label style={{ ...chipLabelStyle, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          仅 flagged
        </label>
        <label style={chipLabelStyle}>
          <span>TALENT ID</span>
          <input
            type="text"
            value={talentId}
            onChange={(e) => setTalentId(e.target.value)}
            placeholder="(optional uuid)"
            style={{ ...inputStyle, width: 280 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 16, overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>TIME</th>
              <th style={thStyle}>TO (TALENT)</th>
              <th style={thStyle}>FROM</th>
              <th style={thStyle}>BUDGET</th>
              <th style={thStyle}>LEN</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rows ?? []).map((w) => (
              <tr key={w.id} style={{ borderBottom: `1px dotted ${HAIRLINE}` }}>
                <td style={tdStyle}>{new Date(w.created_at).toLocaleString('zh-CN')}</td>
                <td style={tdStyle}>
                  <Link
                    href={withBasePath(`/her-voice/talents/${w.talent_id}/`)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: INK, textDecoration: 'underline', fontStyle: 'italic' }}
                  >
                    {w.talent_handle ?? w.talent_id.slice(0, 8)}
                  </Link>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontFamily: MONO, fontSize: 11 }}>{w.sender_email}</span>
                  {w.sender_handle ? (
                    <span style={{ marginLeft: 6, color: INK_MUTED, fontStyle: 'italic' }}>· {w.sender_handle}</span>
                  ) : null}
                </td>
                <td style={tdStyle}>{w.budget_band ?? '—'}</td>
                <td style={tdStyle}>{w.brief_len}</td>
                <td style={tdStyle}>
                  {w.flagged ? (
                    <span style={{ color: ACCENT, fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em' }}>⚠ FLAGGED</span>
                  ) : w.delivered ? (
                    <span style={{ color: INK, fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em' }}>✓ SENT</span>
                  ) : (
                    <span style={{ color: ACCENT, fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em' }} title={w.deliver_error ?? ''}>
                      ✕ {w.deliver_error ?? 'FAILED'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {data && data.rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: INK_MUTED, fontStyle: 'italic', padding: '32px 0' }}>
                  · 没有符合条件的 Whisper 记录 ·
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Kpi({ k, v, hint, accent }: { k: string; v: number; hint?: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: PAPER_RAISED,
        border: `1px solid ${HAIRLINE}`,
        borderTop: `3px solid ${accent ? ACCENT : INK}`,
        padding: '14px 16px',
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: INK_MUTED, textTransform: 'uppercase' }}>
        {k}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 32, fontStyle: 'italic', color: accent ? ACCENT : INK, lineHeight: 1.1 }}>
        {v}
      </div>
      {hint ? <div style={{ fontSize: 11, color: INK_MUTED }}>{hint}</div> : null}
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12 }}>
      <dt style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: INK_MUTED, textTransform: 'uppercase' }}>
        {k}
      </dt>
      <dd style={{ margin: 0, fontStyle: 'italic', color: INK }}>{v}</dd>
    </div>
  );
}

// ── TopicsTab · 围炉主题排期 ──────────────────────────────────

function TopicsTab({
  data,
  upsertTopic,
  deleteTopic,
}: {
  data: TopicResp | null;
  upsertTopic: (
    mode: 'create' | 'update',
    week_code: string,
    body: Partial<Omit<TopicRow, 'created_at' | 'updated_at'>>,
  ) => Promise<boolean>;
  deleteTopic: (week_code: string) => void;
}) {
  return (
    <section style={{ marginTop: 24, display: 'grid', gap: 24 }}>
      {data ? (
        <div style={kpiGridStyle}>
          <Kpi k="ALL" v={data.total} hint="近 120 周" />
          <Kpi k="PUBLISHED" v={data.publishedCount} hint="已上架可见" />
          <Kpi k="DRAFT" v={data.total - data.publishedCount} hint="未上架" />
        </div>
      ) : null}

      <TopicEditor
        mode="create"
        title="＋ 新建一周围炉"
        initial={{
          week_code: defaultNextWeekCode(),
          title: '',
          eyebrow: '',
          prompts: [''],
          calendar_tag: '',
          pillar_link: '',
          notes: '',
          is_published: false,
        }}
        onSubmit={(week, patch) => upsertTopic('create', week, patch)}
      />

      <div style={{ display: 'grid', gap: 16 }}>
        {(data?.rows ?? []).map((row) => (
          <TopicCard key={row.week_code} row={row} upsertTopic={upsertTopic} deleteTopic={deleteTopic} />
        ))}
        {data && data.rows.length === 0 ? (
          <div style={emptyStyle}>· 还没有任何围炉主题。先在上方新建一周。 ·</div>
        ) : null}
      </div>
    </section>
  );
}

function TopicCard({
  row,
  upsertTopic,
  deleteTopic,
}: {
  row: TopicRow;
  upsertTopic: (
    mode: 'create' | 'update',
    week_code: string,
    body: Partial<Omit<TopicRow, 'created_at' | 'updated_at'>>,
  ) => Promise<boolean>;
  deleteTopic: (week_code: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <article
      style={{
        background: PAPER_RAISED,
        border: `1px solid ${HAIRLINE}`,
        borderTop: row.is_published ? `3px solid ${ACCENT}` : `3px solid ${INK_MUTED}`,
        padding: '20px 22px',
        display: 'grid',
        gap: 12,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.42em', color: ACCENT }}>
          {row.week_code}
        </span>
        <h3 style={{ margin: 0, fontStyle: 'italic', fontSize: 22, fontWeight: 400 }}>{row.title}</h3>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: row.is_published ? ACCENT : INK_MUTED, textTransform: 'uppercase', marginLeft: 'auto' }}>
          {row.is_published ? '● 上架' : '○ 草稿'}
        </span>
      </header>
      {row.eyebrow ? (
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32em', color: INK_MUTED, textTransform: 'uppercase' }}>
          {row.eyebrow}
        </div>
      ) : null}
      {row.prompts && row.prompts.length > 0 ? (
        <ul style={{ margin: 0, padding: '0 0 0 18px', fontStyle: 'italic', color: INK, lineHeight: 1.6 }}>
          {row.prompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ) : null}
      <dl style={{ margin: 0, fontSize: 12, color: INK_MUTED, display: 'grid', gap: 4 }}>
        {row.calendar_tag ? <Meta k="CAL" v={row.calendar_tag} /> : null}
        {row.pillar_link ? <Meta k="LINK" v={row.pillar_link} /> : null}
        {row.notes ? <Meta k="NOTE" v={row.notes} /> : null}
        <Meta k="UPDATED" v={new Date(row.updated_at).toLocaleString()} />
      </dl>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          style={btnStyle}
          onClick={() => upsertTopic('update', row.week_code, { is_published: !row.is_published })}
        >
          {row.is_published ? '↓ 下架' : '↑ 上架'}
        </button>
        <button style={btnStyle} onClick={() => setEditing((v) => !v)}>
          {editing ? '× 收起' : '✎ 编辑'}
        </button>
        <button style={{ ...btnStyle, color: ACCENT, borderColor: ACCENT }} onClick={() => deleteTopic(row.week_code)}>
          ⌫ 删除
        </button>
      </div>

      {editing ? (
        <TopicEditor
          mode="update"
          title="编辑这一周"
          initial={{
            week_code: row.week_code,
            title: row.title,
            eyebrow: row.eyebrow ?? '',
            prompts: row.prompts && row.prompts.length > 0 ? row.prompts : [''],
            calendar_tag: row.calendar_tag ?? '',
            pillar_link: row.pillar_link ?? '',
            notes: row.notes ?? '',
            is_published: row.is_published,
          }}
          onSubmit={async (week, patch) => {
            const ok = await upsertTopic('update', week, patch);
            if (ok) setEditing(false);
            return ok;
          }}
        />
      ) : null}
    </article>
  );
}

interface TopicForm {
  week_code: string;
  title: string;
  eyebrow: string;
  prompts: string[];
  calendar_tag: string;
  pillar_link: string;
  notes: string;
  is_published: boolean;
}

function TopicEditor({
  mode,
  title,
  initial,
  onSubmit,
}: {
  mode: 'create' | 'update';
  title: string;
  initial: TopicForm;
  onSubmit: (week_code: string, patch: Partial<Omit<TopicRow, 'created_at' | 'updated_at'>>) => Promise<boolean>;
}) {
  const [form, setForm] = useState<TopicForm>(initial);
  const [busy, setBusy] = useState(false);

  return (
    <form
      style={{
        background: PAPER_RAISED,
        border: `1px dashed ${HAIRLINE}`,
        padding: '18px 20px',
        display: 'grid',
        gap: 12,
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setBusy(true);
        const cleanedPrompts = form.prompts.map((p) => p.trim()).filter(Boolean);
        const patch: Partial<Omit<TopicRow, 'created_at' | 'updated_at'>> = {
          title: form.title.trim(),
          eyebrow: form.eyebrow.trim() || null,
          prompts: cleanedPrompts.length ? cleanedPrompts : null,
          calendar_tag: form.calendar_tag.trim() || null,
          pillar_link: form.pillar_link.trim() || null,
          notes: form.notes.trim() || null,
          is_published: form.is_published,
        };
        const ok = await onSubmit(form.week_code.trim(), patch);
        setBusy(false);
        if (ok && mode === 'create') {
          setForm({ ...initial, week_code: defaultNextWeekCode() });
        }
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.42em', color: ACCENT, textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <label style={labelStyle}>
          <span>WEEK_CODE · YYYY-Www</span>
          <input
            value={form.week_code}
            onChange={(e) => setForm({ ...form, week_code: e.target.value })}
            disabled={mode === 'update'}
            placeholder="2026-W19"
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          <span>TITLE · ≤ 80</span>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={80}
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          <span>EYEBROW · ≤ 40</span>
          <input
            value={form.eyebrow}
            onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
            maxLength={40}
            placeholder="例：本周围炉"
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span>CALENDAR TAG</span>
          <input
            value={form.calendar_tag}
            onChange={(e) => setForm({ ...form, calendar_tag: e.target.value })}
            maxLength={40}
            placeholder="例：guyu / mercury_retro"
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          <span>PILLAR LINK</span>
          <input
            value={form.pillar_link}
            onChange={(e) => setForm({ ...form, pillar_link: e.target.value })}
            maxLength={120}
            placeholder="例：/wtfti/ritual/"
            style={inputStyle}
          />
        </label>
      </div>

      <label style={labelStyle}>
        <span>PROMPTS · 每行一句 · ≤ 6 句 · 每句 ≤ 80 字</span>
        <textarea
          rows={4}
          value={form.prompts.join('\n')}
          onChange={(e) =>
            setForm({ ...form, prompts: e.target.value.split('\n').slice(0, 6) })
          }
          style={{ ...inputStyle, minWidth: 280, fontFamily: SERIF, fontStyle: 'italic' }}
          placeholder="一句围炉引子&#10;另一句备选 italic 引子"
        />
      </label>

      <label style={labelStyle}>
        <span>EDITORIAL NOTES · 内部</span>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ ...inputStyle, minWidth: 280 }}
        />
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <label style={{ ...chipLabelStyle, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            style={{ marginRight: 6 }}
          />
          上架（is_published = true）
        </label>
        <button type="submit" disabled={busy} style={primaryBtnStyle}>
          {busy ? '· 提交中 ·' : mode === 'create' ? '＋ 创建' : '✓ 保存'}
        </button>
      </div>
    </form>
  );
}

function defaultNextWeekCode(): string {
  // ISO week of next Monday — keep simple deterministic helper for editor default.
  const now = new Date();
  const day = now.getUTCDay() || 7;
  const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + (8 - day)));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── styles ─────────────────────────────────────────────────────

const navLinkStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  color: INK,
  textTransform: 'uppercase',
  textDecoration: 'none',
  padding: '8px 14px',
  border: `1px solid ${HAIRLINE}`,
};

const controlBoxStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  padding: 16,
  background: PAPER_RAISED,
  border: `1px solid ${HAIRLINE}`,
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  color: INK_MUTED,
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  background: PAPER,
  color: INK,
  border: `1px solid ${HAIRLINE}`,
  padding: '8px 10px',
  fontFamily: MONO,
  fontSize: 13,
  minWidth: 220,
  borderRadius: 0,
};

const selectStyle: React.CSSProperties = {
  background: PAPER,
  color: INK,
  border: `1px solid ${HAIRLINE}`,
  padding: '6px 10px',
  fontFamily: MONO,
  fontSize: 12,
  borderRadius: 0,
};

const primaryBtnStyle: React.CSSProperties = {
  background: INK,
  color: PAPER,
  border: 'none',
  padding: '10px 22px',
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const kpiGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 12,
  marginTop: 16,
};

const filterRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  marginTop: 16,
  padding: 12,
  background: PAPER_RAISED,
  border: `1px solid ${HAIRLINE}`,
};

const chipLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  color: INK_MUTED,
  textTransform: 'uppercase',
};

const btnStyle: React.CSSProperties = {
  background: 'transparent',
  color: INK,
  border: `1px solid ${HAIRLINE}`,
  padding: '6px 12px',
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const activeBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: INK,
  color: PAPER,
  borderColor: INK,
  cursor: 'default',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  background: PAPER_RAISED,
  border: `1px solid ${HAIRLINE}`,
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: `1px solid ${INK}`,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  color: INK_MUTED,
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'top',
  color: INK,
};

const emptyStyle: React.CSSProperties = {
  padding: '40px 0',
  textAlign: 'center',
  fontStyle: 'italic',
  color: INK_MUTED,
  border: `1px dashed ${HAIRLINE}`,
};
