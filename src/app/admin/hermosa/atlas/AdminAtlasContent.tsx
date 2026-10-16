'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';

const PAPER = '#F5F0E8';
const PAPER_RAISED = '#FAF7F2';
const INK = '#1A1530';
const INK_MUTED = '#8A817A';
const ACCENT = '#C0512F';
const HAIRLINE = 'rgba(26, 21, 48, 0.14)';
const MONO = 'ui-monospace, "SF Mono", monospace';
const SERIF = 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)';

type AtlasStatus = 'draft' | 'review' | 'published' | 'rejected';

interface AtlasRow {
  id: string;
  contributor_hash: string;
  sigil_hash: string | null;
  title: string;
  body_md: string;
  excerpt: string | null;
  cover_note: string | null;
  slug: string | null;
  source_topic_week: string | null;
  status: AtlasStatus;
  ai_suspected: boolean;
  curator_note: string | null;
  publish_issue: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AtlasResp {
  total: number;
  aiSuspectedTotal: number;
  totalsByStatus: Record<AtlasStatus, number>;
  rows: AtlasRow[];
}

interface DraftState {
  title: string;
  body_md: string;
  excerpt: string;
  cover_note: string;
  slug: string;
  source_topic_week: string;
  status: AtlasStatus;
  ai_suspected: boolean;
  curator_note: string;
  publish_issue: string;
}

const navLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 36,
  padding: '8px 12px',
  border: `1px solid ${HAIRLINE}`,
  color: INK,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  textDecoration: 'none',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${HAIRLINE}`,
  background: PAPER_RAISED,
  color: INK,
  padding: '12px 14px',
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
};

const labelMonoStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.28em',
  color: ACCENT,
  textTransform: 'uppercase',
};

function toDraft(row: AtlasRow): DraftState {
  return {
    title: row.title,
    body_md: row.body_md,
    excerpt: row.excerpt ?? '',
    cover_note: row.cover_note ?? '',
    slug: row.slug ?? '',
    source_topic_week: row.source_topic_week ?? '',
    status: row.status,
    ai_suspected: row.ai_suspected,
    curator_note: row.curator_note ?? '',
    publish_issue: row.publish_issue ?? '',
  };
}

export function AdminAtlasContent() {
  const [token, setToken] = useState('');
  const [days, setDays] = useState(180);
  const [statusFilter, setStatusFilter] = useState<'all' | AtlasStatus>('all');
  const [aiFilter, setAiFilter] = useState<'all' | 'true' | 'false'>('all');
  const [data, setData] = useState<AtlasResp | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedRow = useMemo(
    () => data?.rows.find((row) => row.id === selectedId) ?? null,
    [data, selectedId],
  );

  const fetchRows = useCallback(async () => {
    if (!token) {
      setErr('请先填入 ADMIN_HERMOSA_TOKEN（或 ADMIN_FUNNEL_TOKEN）');
      return;
    }
    setLoading(true);
    setErr(null);
    setNotice(null);
    try {
      const params = new URLSearchParams({ token, days: String(days) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (aiFilter !== 'all') params.set('ai_suspected', aiFilter);
      const res = await fetch(getApiPath(`/api/hermosa/admin/atlas?${params}`), { cache: 'no-store' });
      const json = (await res.json().catch(() => ({ error: `HTTP ${res.status}` }))) as AtlasResp & { error?: string };
      if (!res.ok) {
        setErr(json.error ?? `HTTP ${res.status}`);
        setData(null);
        return;
      }
      setData(json);
      if (selectedId) {
        const next = json.rows.find((row) => row.id === selectedId) ?? null;
        if (next) {
          setDraft(toDraft(next));
        } else {
          setSelectedId(null);
          setDraft(null);
        }
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'network_error');
    } finally {
      setLoading(false);
    }
  }, [token, days, statusFilter, aiFilter, selectedId]);

  const openRow = useCallback((row: AtlasRow) => {
    setSelectedId(row.id);
    setDraft(toDraft(row));
    setNotice(null);
    setErr(null);
  }, []);

  const patchRow = useCallback(async (id: string, body: Record<string, unknown>) => {
    if (!token) {
      setErr('缺少 ADMIN TOKEN');
      return null;
    }
    const res = await fetch(getApiPath(`/api/hermosa/admin/atlas?id=${id}&token=${encodeURIComponent(token)}`), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({ error: `HTTP ${res.status}` }))) as { ok?: boolean; row?: AtlasRow; error?: string };
    if (!res.ok || !json.ok || !json.row) {
      throw new Error(json.error ?? `HTTP ${res.status}`);
    }
    setData((prev) => prev ? { ...prev, rows: prev.rows.map((row) => (row.id === id ? json.row! : row)) } : prev);
    if (selectedId === id) {
      setDraft(toDraft(json.row));
    }
    return json.row;
  }, [token, selectedId]);

  async function saveSelected() {
    if (!selectedId || !draft) return;
    setSaving(true);
    setErr(null);
    setNotice(null);
    try {
      await patchRow(selectedId, {
        title: draft.title,
        body_md: draft.body_md,
        excerpt: draft.excerpt || null,
        cover_note: draft.cover_note || null,
        slug: draft.slug || null,
        source_topic_week: draft.source_topic_week || null,
        status: draft.status,
        ai_suspected: draft.ai_suspected,
        curator_note: draft.curator_note || null,
        publish_issue: draft.publish_issue || null,
      });
      setNotice('已保存 atlas 条目。');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'network_error');
    } finally {
      setSaving(false);
    }
  }

  async function quickSetStatus(row: AtlasRow, status: AtlasStatus) {
    setErr(null);
    setNotice(null);
    try {
      await patchRow(row.id, { status });
      setNotice(`已将「${row.title}」设为 ${status}。`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'network_error');
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: PAPER, color: INK, padding: '32px 24px 96px', fontFamily: SERIF }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <header style={{ marginBottom: 32, paddingBottom: 16, borderBottom: `1px solid ${INK}` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.42em', color: ACCENT, textTransform: 'uppercase' }}>
            § ADMIN · HERMOSA · ATLAS
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 'clamp(28px, 4vw, 40px)', fontStyle: 'italic', fontWeight: 400 }}>
            她词条投稿池后台
          </h1>
          <p style={{ margin: 0, color: INK_MUTED, fontSize: 14 }}>
            review 池筛选 · slug / issue / curator note 整理 · 双月发布前的编辑台
          </p>
          <nav style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <Link href={withBasePath('/admin/hermosa/')} style={navLinkStyle}>← 留言后台</Link>
            <Link href={withBasePath('/admin/hermosa/aurora/')} style={navLinkStyle}>→ Aurora 后台</Link>
            <Link href={withBasePath('/her-voice/atlas/')} style={navLinkStyle} target="_blank" rel="noreferrer">→ 公开她词条</Link>
            <Link href={withBasePath('/her-voice/atlas/submit/')} style={navLinkStyle} target="_blank" rel="noreferrer">→ 投稿入口</Link>
          </nav>
        </header>

        <section style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'end', padding: '14px 0 18px', borderBottom: `1px solid ${HAIRLINE}` }}>
          <label style={{ ...labelStyle, minWidth: 280 }}>
            <span style={labelMonoStyle}>Admin Token</span>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_HERMOSA_TOKEN" style={inputStyle} />
          </label>
          <label style={{ ...labelStyle, width: 120 }}>
            <span style={labelMonoStyle}>Days</span>
            <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value) || 180)))} style={inputStyle} />
          </label>
          <label style={{ ...labelStyle, width: 180 }}>
            <span style={labelMonoStyle}>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | AtlasStatus)} style={inputStyle}>
              <option value="all">all</option>
              <option value="draft">draft</option>
              <option value="review">review</option>
              <option value="published">published</option>
              <option value="rejected">rejected</option>
            </select>
          </label>
          <label style={{ ...labelStyle, width: 180 }}>
            <span style={labelMonoStyle}>AI Suspected</span>
            <select value={aiFilter} onChange={(e) => setAiFilter(e.target.value as 'all' | 'true' | 'false')} style={inputStyle}>
              <option value="all">all</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </label>
          <button onClick={fetchRows} disabled={loading} style={{ ...navLinkStyle, background: INK, color: PAPER, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? '加载中' : '拉取'}
          </button>
        </section>

        {err ? (
          <div style={{ marginTop: 16, padding: 12, border: `1px solid ${ACCENT}`, color: ACCENT, fontFamily: MONO, fontSize: 12 }}>
            · {err} ·
          </div>
        ) : null}
        {notice ? (
          <div style={{ marginTop: 16, padding: 12, border: `1px solid ${INK}`, color: INK, fontFamily: MONO, fontSize: 12 }}>
            · {notice} ·
          </div>
        ) : null}

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 0.92fr) minmax(420px, 1.08fr)', gap: 24, marginTop: 24 }}>
          <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 20 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <SummaryChip label="Total" value={data?.total ?? 0} />
              <SummaryChip label="Review" value={data?.totalsByStatus.review ?? 0} />
              <SummaryChip label="Published" value={data?.totalsByStatus.published ?? 0} />
              <SummaryChip label="AI" value={data?.aiSuspectedTotal ?? 0} />
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {(data?.rows ?? []).map((row) => (
                <article
                  key={row.id}
                  onClick={() => openRow(row)}
                  style={{
                    border: `1px solid ${selectedId === row.id ? INK : HAIRLINE}`,
                    padding: '14px 16px',
                    background: selectedId === row.id ? PAPER_RAISED : 'transparent',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.28em', color: ACCENT, textTransform: 'uppercase' }}>
                        {row.status} {row.ai_suspected ? '· ai?' : ''}
                      </div>
                      <h2 style={{ margin: '6px 0 0', fontSize: 24, lineHeight: 1.2, fontStyle: 'italic', fontWeight: 400 }}>
                        {row.title}
                      </h2>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: INK_MUTED, letterSpacing: '0.22em', textTransform: 'uppercase', textAlign: 'right' }}>
                      {new Date(row.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>

                  <p style={{ margin: 0, color: INK_MUTED, lineHeight: 1.7, fontSize: 14 }}>
                    {row.excerpt ?? row.body_md.slice(0, 110)}
                  </p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <QuickButton onClick={(event) => { event.stopPropagation(); void quickSetStatus(row, 'review'); }}>review</QuickButton>
                    <QuickButton onClick={(event) => { event.stopPropagation(); void quickSetStatus(row, 'published'); }}>publish</QuickButton>
                    <QuickButton onClick={(event) => { event.stopPropagation(); void quickSetStatus(row, 'rejected'); }}>reject</QuickButton>
                  </div>
                </article>
              ))}

              {!data?.rows.length ? (
                <div style={{ border: `1px dashed ${HAIRLINE}`, padding: '48px 20px', textAlign: 'center', color: INK_MUTED, fontStyle: 'italic' }}>
                  还没有 atlas 投稿被拉进来，或者当前筛选为空。
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 20 }}>
            {selectedRow && draft ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div style={labelMonoStyle}>§ Selected Submission</div>
                  <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(28px, 3vw, 34px)', fontStyle: 'italic', fontWeight: 400 }}>
                    {selectedRow.title}
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={labelStyle}>
                    <span style={labelMonoStyle}>Status</span>
                    <select value={draft.status} onChange={(e) => setDraft((prev) => prev ? { ...prev, status: e.target.value as AtlasStatus } : prev)} style={inputStyle}>
                      <option value="draft">draft</option>
                      <option value="review">review</option>
                      <option value="published">published</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </label>
                  <label style={labelStyle}>
                    <span style={labelMonoStyle}>Publish Issue</span>
                    <input value={draft.publish_issue} onChange={(e) => setDraft((prev) => prev ? { ...prev, publish_issue: e.target.value } : prev)} placeholder="2026-summer" style={inputStyle} />
                  </label>
                </div>

                <label style={labelStyle}>
                  <span style={labelMonoStyle}>Title</span>
                  <input value={draft.title} onChange={(e) => setDraft((prev) => prev ? { ...prev, title: e.target.value } : prev)} style={inputStyle} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={labelStyle}>
                    <span style={labelMonoStyle}>Slug</span>
                    <input value={draft.slug} onChange={(e) => setDraft((prev) => prev ? { ...prev, slug: e.target.value.toLowerCase() } : prev)} placeholder="unsent-words" style={inputStyle} />
                  </label>
                  <label style={labelStyle}>
                    <span style={labelMonoStyle}>Topic Week</span>
                    <input value={draft.source_topic_week} onChange={(e) => setDraft((prev) => prev ? { ...prev, source_topic_week: e.target.value } : prev)} placeholder="2026-W19" style={inputStyle} />
                  </label>
                </div>

                <label style={labelStyle}>
                  <span style={labelMonoStyle}>Excerpt</span>
                  <input value={draft.excerpt} onChange={(e) => setDraft((prev) => prev ? { ...prev, excerpt: e.target.value } : prev)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  <span style={labelMonoStyle}>Cover Note</span>
                  <input value={draft.cover_note} onChange={(e) => setDraft((prev) => prev ? { ...prev, cover_note: e.target.value } : prev)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  <span style={labelMonoStyle}>Body</span>
                  <textarea value={draft.body_md} onChange={(e) => setDraft((prev) => prev ? { ...prev, body_md: e.target.value } : prev)} rows={14} style={{ ...inputStyle, resize: 'vertical' }} />
                </label>

                <label style={labelStyle}>
                  <span style={labelMonoStyle}>Curator Note</span>
                  <textarea value={draft.curator_note} onChange={(e) => setDraft((prev) => prev ? { ...prev, curator_note: e.target.value } : prev)} rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <input type="checkbox" checked={draft.ai_suspected} onChange={(e) => setDraft((prev) => prev ? { ...prev, ai_suspected: e.target.checked } : prev)} />
                  标记为 AI suspected
                </label>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={() => void saveSelected()} disabled={saving} style={{ ...navLinkStyle, background: INK, color: PAPER, cursor: saving ? 'wait' : 'pointer' }}>
                    {saving ? '保存中' : '保存'}
                  </button>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', color: INK_MUTED }}>
                    {selectedRow.sigil_hash ? `SIGIL ${selectedRow.sigil_hash}` : 'NO SIGIL'}
                    {selectedRow.published_at ? ` · PUBLISHED ${new Date(selectedRow.published_at).toLocaleDateString('zh-CN')}` : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ border: `1px dashed ${HAIRLINE}`, padding: '56px 24px', textAlign: 'center', color: INK_MUTED, fontStyle: 'italic' }}>
                从左侧选一条投稿，开始整理 slug、issue、curator note 和发布状态。
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: `1px solid ${HAIRLINE}`, padding: '10px 12px', minWidth: 108 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.28em', color: ACCENT, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 28, fontStyle: 'italic', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function QuickButton({ children, onClick }: { children: React.ReactNode; onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${HAIRLINE}`,
        background: 'transparent',
        color: INK,
        padding: '8px 10px',
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}