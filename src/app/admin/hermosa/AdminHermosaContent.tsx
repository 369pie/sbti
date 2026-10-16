'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import {
  HERMOSA_ATTRIBUTION_LABELS,
  HERMOSA_CURATION_STATUSES,
  HERMOSA_CURATION_STATUS_LABELS,
  HERMOSA_KIND_LABELS,
  HERMOSA_KINDS,
  HERMOSA_SAFETY_LEVELS,
  HERMOSA_SAFETY_LEVEL_LABELS,
  HERMOSA_STATUS_LABELS,
  HERMOSA_TAGS,
  HERMOSA_TAG_LABELS,
  HERMOSA_UNIVERSE_LABELS,
  isHermosaTopicWeek,
  type HermosaAttributionMode,
  type HermosaContributionMetadata,
  type HermosaCurationStatus,
  type HermosaKind,
  type HermosaSafetyLevel,
  type HermosaTag,
} from '@/lib/hermosa/tags';
import { getCurrentHermosaTopic } from '@/lib/hermosa/topics';

const TOKEN_KEY = 'wtfti.admin.hermosa.token';
const CURRENT_TOPIC = getCurrentHermosaTopic();

interface Row {
  id: string;
  universe: string;
  slug: string | null;
  code: string | null;
  kind: HermosaKind;
  text: string;
  signature: string | null;
  tags: string[];
  metadata: HermosaContributionMetadata;
  topic_week: string | null;
  curation_status: HermosaCurationStatus;
  consent_to_feature: boolean;
  attribution_mode: HermosaAttributionMode;
  safety_level: HermosaSafetyLevel;
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
  totalsByKind: Record<HermosaKind, number>;
  totalsByCurationStatus: Record<HermosaCurationStatus, number>;
  totalsBySafetyLevel: Record<HermosaSafetyLevel, number>;
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
  const [tagFilter, setTagFilter] = useState<HermosaTag | 'all' | 'flagged'>('all');
  const [kindFilter, setKindFilter] = useState<HermosaKind | 'all'>('all');
  const [curationFilter, setCurationFilter] = useState<HermosaCurationStatus | 'all'>('all');
  const [safetyFilter, setSafetyFilter] = useState<HermosaSafetyLevel | 'all'>('all');
  const [consentedOnly, setConsentedOnly] = useState(false);
  const [topicWeek, setTopicWeek] = useState(CURRENT_TOPIC.week);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<CurationDraftResp | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftErr, setDraftErr] = useState<string | null>(null);
  const [draftPool, setDraftPool] = useState<'consented' | 'selected' | 'published'>('consented');
  const [draftCopied, setDraftCopied] = useState(false);
  const [topicCopied, setTopicCopied] = useState(false);

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
      const params = new URLSearchParams({
        days: String(days),
        token,
      });
      if (kindFilter !== 'all') params.set('kind', kindFilter);
      if (curationFilter !== 'all') params.set('curation_status', curationFilter);
      if (safetyFilter !== 'all') params.set('safety_level', safetyFilter);
      if (consentedOnly) params.set('consented', 'true');
      if (isHermosaTopicWeek(topicWeek)) params.set('topic_week', topicWeek);
      const res = await fetch(getApiPath(`/api/hermosa/admin?${params}`), { cache: 'no-store' });
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
  }, [consentedOnly, curationFilter, days, kindFilter, safetyFilter, token, topicWeek]);

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
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setErr(readablePatchError(payload?.error, res.status));
      } else {
        await fetchData();
      }
    },
    [token, fetchData],
  );

  const filteredRows = useMemo(() => {
    if (!data) return [] as Row[];
    if (tagFilter === 'all') return data.rows;
    if (tagFilter === 'flagged') return data.rows.filter((r) => r.flagged || r.safety_level === 'review');
    return data.rows.filter((r) => r.tags?.includes(tagFilter));
  }, [data, tagFilter]);
  const assetRows = useMemo(
    () =>
      filteredRows.filter(
        (row) =>
          row.consent_to_feature &&
          row.safety_level === 'safe' &&
          !row.flagged &&
          row.is_published &&
          (row.curation_status === 'selected' || row.curation_status === 'published'),
      ),
    [filteredRows],
  );
  const assetCopy = useMemo(
    () => formatAssetCopy(assetRows, topicWeek),
    [assetRows, topicWeek],
  );
  const topicRows = useMemo(
    () => filteredRows.filter((row) => row.kind === 'concept' && row.tags?.includes('feature')),
    [filteredRows],
  );
  const topicCopy = useMemo(() => formatTopicCopy(topicRows), [topicRows]);

  const showCreatorTopics = useCallback(() => {
    setKindFilter('concept');
    setTagFilter('feature');
    setCurationFilter('all');
    setSafetyFilter('all');
    setConsentedOnly(true);
  }, []);

  const copyAssetRows = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(assetCopy);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [assetCopy]);

  const copyTopicRows = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(topicCopy);
    setTopicCopied(true);
    window.setTimeout(() => setTopicCopied(false), 1600);
  }, [topicCopy]);

  const fetchDraft = useCallback(async () => {
    if (!token) {
      setDraftErr('需要先填入 token');
      return;
    }
    if (!isHermosaTopicWeek(topicWeek)) {
      setDraftErr('topic_week 格式应为 YYYY-Www');
      return;
    }
    setDraftLoading(true);
    setDraftErr(null);
    try {
      const params = new URLSearchParams({ token, week: topicWeek, pool: draftPool });
      const res = await fetch(getApiPath(`/api/hermosa/admin/curation?${params}`), { cache: 'no-store' });
      if (!res.ok) {
        setDraftErr(`HTTP ${res.status}`);
        setDraft(null);
      } else {
        setDraft((await res.json()) as CurationDraftResp);
      }
    } catch (e) {
      setDraftErr(String(e));
    } finally {
      setDraftLoading(false);
    }
  }, [draftPool, token, topicWeek]);

  const copyDraft = useCallback(async () => {
    if (!draft || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(draft.summaryDraft.paragraphDraft);
    setDraftCopied(true);
    window.setTimeout(() => setDraftCopied(false), 1600);
  }, [draft]);

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.42em', color: '#C9A676', marginBottom: 12 }}>
            HERMOSA · ADMIN
          </div>
          <h1 style={{ fontSize: 32, fontStyle: 'italic', margin: 0 }}>
            她说 · 策展工作台
          </h1>
          <p style={{ opacity: 0.62, marginTop: 8, fontSize: 14 }}>
            按类型、授权、安全和策展状态筛选；准备周主题、书单、AI 共学题库与公开精选。
          </p>
          <nav style={{ marginTop: 12 }}>
            <a
              href={withBasePath('/admin/hermosa/aurora/')}
              style={{
                display: 'inline-block',
                padding: '8px 14px',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#C9A676',
                textDecoration: 'none',
              }}
            >
              → AURORA 治理后台
            </a>
          </nav>
        </header>

        <section style={toolbarStyle}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_HERMOSA_TOKEN"
            style={inputStyle}
          />
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={selectStyle}>
            {[3, 7, 14, 30, 60, 90].map((d) => (
              <option key={d} value={d}>近 {d} 天</option>
            ))}
          </select>
          <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as HermosaKind | 'all')} style={selectStyle}>
            <option value="all">全部类型</option>
            {(HERMOSA_KINDS as readonly HermosaKind[]).map((kind) => (
              <option key={kind} value={kind}>{HERMOSA_KIND_LABELS[kind]}</option>
            ))}
          </select>
          <select
            value={curationFilter}
            onChange={(e) => setCurationFilter(e.target.value as HermosaCurationStatus | 'all')}
            style={selectStyle}
          >
            <option value="all">全部策展</option>
            {(HERMOSA_CURATION_STATUSES as readonly HermosaCurationStatus[]).map((status) => (
              <option key={status} value={status}>{HERMOSA_CURATION_STATUS_LABELS[status]}</option>
            ))}
          </select>
          <select value={safetyFilter} onChange={(e) => setSafetyFilter(e.target.value as HermosaSafetyLevel | 'all')} style={selectStyle}>
            <option value="all">全部安全</option>
            {(HERMOSA_SAFETY_LEVELS as readonly HermosaSafetyLevel[]).map((level) => (
              <option key={level} value={level}>{HERMOSA_SAFETY_LEVEL_LABELS[level]}</option>
            ))}
          </select>
          <input
            type="text"
            value={topicWeek}
            onChange={(e) => setTopicWeek(e.target.value.slice(0, 8))}
            placeholder="YYYY-Www"
            style={{ ...inputStyle, flex: '0 1 120px' }}
          />
          <label style={checkboxStyle}>
            <input
              type="checkbox"
              checked={consentedOnly}
              onChange={(e) => setConsentedOnly(e.target.checked)}
            />
            仅精选授权
          </label>
          <button onClick={fetchData} disabled={loading} style={loadButtonStyle}>
            {loading ? '加载中' : '拉取'}
          </button>
          {err ? <span style={{ color: '#ff8b9b', fontSize: 13 }}>{err}</span> : null}
        </section>

        {data ? (
          <>
            <section style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
              <Stat label="总条数" value={data.total} />
              {(HERMOSA_KINDS as readonly HermosaKind[]).map((kind) => (
                <Stat key={kind} label={HERMOSA_KIND_LABELS[kind]} value={data.totalsByKind?.[kind] ?? 0} />
              ))}
              {(HERMOSA_CURATION_STATUSES as readonly HermosaCurationStatus[]).map((status) => (
                <Stat
                  key={status}
                  label={HERMOSA_CURATION_STATUS_LABELS[status]}
                  value={data.totalsByCurationStatus?.[status] ?? 0}
                />
              ))}
            </section>

            <section style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {(['all', ...HERMOSA_TAGS, 'flagged'] as Array<HermosaTag | 'all' | 'flagged'>).map((t) => {
                const label = t === 'all' ? '全部标签' : t === 'flagged' ? '待审' : `# ${HERMOSA_TAG_LABELS[t]}`;
                const active = tagFilter === t;
                return (
                  <button key={t} onClick={() => setTagFilter(t)} style={tagButtonStyle(active)}>
                    {label}
                    {t !== 'all' && t !== 'flagged' ? ` ${data.totalsByTag?.[t] ?? 0}` : ''}
                  </button>
                );
              })}
            </section>

            <TopicGovernancePanel
              rows={topicRows}
              copied={topicCopied}
              copyText={topicCopy}
              onCopy={copyTopicRows}
              onFilter={showCreatorTopics}
            />

            <AssetWorkbench
              rows={assetRows}
              topicWeek={topicWeek}
              copyText={assetCopy}
              copied={copied}
              onCopy={copyAssetRows}
            />

            <CurationDraftPanel
              draft={draft}
              loading={draftLoading}
              err={draftErr}
              pool={draftPool}
              onPoolChange={setDraftPool}
              onFetch={fetchDraft}
              onCopy={copyDraft}
              copied={draftCopied}
              topicWeek={topicWeek}
            />

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredRows.length === 0 ? (
                <div style={{ opacity: 0.5, padding: 24, textAlign: 'center' }}>暂无</div>
              ) : null}
              {filteredRows.map((r) => (
                <article key={r.id} style={rowStyle(r)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12, opacity: 0.62 }}>
                    <span>
                      {HERMOSA_UNIVERSE_LABELS[r.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ?? r.universe}
                      {r.slug ? ` · ${r.slug}` : ''} {r.code ? ` · ${r.code}` : ''}
                    </span>
                    <span>{new Date(r.created_at).toLocaleString('zh-CN')}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={badgeStyle('#C9A676')}>{HERMOSA_KIND_LABELS[r.kind] ?? r.kind}</span>
                    <span style={badgeStyle('#C07A8E')}>{HERMOSA_CURATION_STATUS_LABELS[r.curation_status] ?? r.curation_status}</span>
                    <span style={badgeStyle(r.safety_level === 'review' ? '#ff8b9b' : '#9C7CFF')}>
                      {HERMOSA_SAFETY_LEVEL_LABELS[r.safety_level] ?? r.safety_level}
                    </span>
                    <span style={badgeStyle(r.consent_to_feature ? '#C9A676' : '#777')}>
                      {r.consent_to_feature ? '已授权精选' : '未授权'}
                    </span>
                    <span style={badgeStyle('#777')}>
                      {HERMOSA_ATTRIBUTION_LABELS[r.attribution_mode] ?? r.attribution_mode}
                    </span>
                    {r.topic_week ? <span style={badgeStyle('#777')}>{r.topic_week}</span> : null}
                  </div>

                  <div style={{ fontSize: 18, lineHeight: 1.6, fontStyle: 'italic' }}>「{r.text}」</div>
                  <MetadataPreview row={r} />

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
                    <span style={{ marginLeft: 'auto', opacity: 0.55 }}>
                      共鸣 {r.echo_count}
                      {r.signature ? ` · ${r.signature}` : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={r.curation_status}
                      onChange={(e) => patchRow(r.id, { curation_status: e.target.value })}
                      style={compactSelectStyle}
                    >
                      {(HERMOSA_CURATION_STATUSES as readonly HermosaCurationStatus[]).map((status) => (
                        <option key={status} value={status} disabled={status === 'published' && !canPublishRow(r)}>
                          {HERMOSA_CURATION_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={r.safety_level}
                      onChange={(e) => patchRow(r.id, { safety_level: e.target.value })}
                      style={compactSelectStyle}
                    >
                      {(HERMOSA_SAFETY_LEVELS as readonly HermosaSafetyLevel[]).map((level) => (
                        <option key={level} value={level}>
                          {HERMOSA_SAFETY_LEVEL_LABELS[level]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={r.status ?? ''}
                      onChange={(e) => patchRow(r.id, { status: e.target.value || null })}
                      style={compactSelectStyle}
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
                    <button onClick={() => patchRow(r.id, { is_featured: !r.is_featured })} style={pillStyle(r.is_featured)}>
                      {r.is_featured ? '已精选' : '加入精选'}
                    </button>
                    <button onClick={() => patchRow(r.id, { consent_to_feature: !r.consent_to_feature })} style={pillStyle(r.consent_to_feature)}>
                      {r.consent_to_feature ? '撤销授权标记' : '标记已授权'}
                    </button>
                    <button onClick={() => patchRow(r.id, { flagged: !r.flagged })} style={pillStyle(r.flagged, '#ff8b9b')}>
                      {r.flagged ? '已标记' : '标记待审'}
                    </button>
                    <button onClick={() => patchRow(r.id, { is_published: !r.is_published })} style={pillStyle(!r.is_published, '#888')}>
                      {r.is_published ? '隐藏' : '已隐藏'}
                    </button>
                    <a
                      href={getApiPath(`/api/hermosa/card?text=${encodeURIComponent(r.text)}&signature=${encodeURIComponent(r.signature ?? '')}&universe=${r.universe}&slug=${encodeURIComponent(r.slug ?? '')}&tag=${encodeURIComponent((r.tags ?? [])[0] ?? '')}`)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: 'auto', fontSize: 12, color: '#C9A676' }}
                    >
                      预览字报
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

function AssetWorkbench({
  rows,
  topicWeek,
  copyText,
  copied,
  onCopy,
}: {
  rows: Row[];
  topicWeek: string;
  copyText: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const safeWeek = isHermosaTopicWeek(topicWeek) ? topicWeek : CURRENT_TOPIC.week;
  const voiceImage = getApiPath(`/api/hermosa/artifact/voices?week=${safeWeek}`);
  const bookImage = getApiPath(`/api/hermosa/artifact/books?week=${safeWeek}`);
  return (
    <section
      style={{
        marginBottom: 18,
        padding: 16,
        borderRadius: 14,
        background: '#15102A',
        border: '1px solid rgba(201,166,118,0.25)',
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.32em', color: '#C9A676' }}>
          XHS ASSET WORKFLOW · {safeWeek}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#D9CAB4' }}>
          可用精选 {rows.length} 条
        </span>
      </div>
      <textarea
        readOnly
        value={copyText}
        rows={Math.min(8, Math.max(3, rows.length + 2))}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: 12,
          borderRadius: 10,
          border: '1px solid rgba(201,166,118,0.22)',
          background: '#0a0810',
          color: '#F5F0E8',
          fontSize: 12,
          lineHeight: 1.7,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={onCopy} style={pillStyle(copied)}>
          {copied ? '已复制' : '复制精选清单'}
        </button>
        <a href={voiceImage} target="_blank" rel="noreferrer" style={assetLinkStyle}>
          打开声音集合图
        </a>
        <a href={bookImage} target="_blank" rel="noreferrer" style={assetLinkStyle}>
          打开书单集合图
        </a>
        <a href={withBasePath(`/her-voice/wallpapers/${safeWeek}/`)} target="_blank" rel="noreferrer" style={assetLinkStyle}>
          壁纸落地页
        </a>
        <a href={withBasePath(`/her-voice/books/${safeWeek}/`)} target="_blank" rel="noreferrer" style={assetLinkStyle}>
          书单落地页
        </a>
      </div>
    </section>
  );
}

function TopicGovernancePanel({
  rows,
  copyText,
  copied,
  onCopy,
  onFilter,
}: {
  rows: Row[];
  copyText: string;
  copied: boolean;
  onCopy: () => void;
  onFilter: () => void;
}) {
  return (
    <section
      style={{
        marginBottom: 18,
        padding: 16,
        borderRadius: 14,
        background: '#15102A',
        border: '1px solid rgba(192,81,47,0.45)',
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.32em', color: '#C0512F' }}>
          CREATOR TOPIC GOVERNANCE
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#D9CAB4' }}>
          当前筛选内 {rows.length} 个主题提案
        </span>
      </div>
      <textarea
        readOnly
        value={copyText}
        rows={Math.min(8, Math.max(3, rows.length + 2))}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: 12,
          borderRadius: 10,
          border: '1px solid rgba(192,81,47,0.28)',
          background: '#0a0810',
          color: '#F5F0E8',
          fontSize: 12,
          lineHeight: 1.7,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={onFilter} style={pillStyle(false, '#C0512F')}>
          套用主题提案筛选
        </button>
        <button type="button" onClick={onCopy} style={pillStyle(copied, '#C0512F')}>
          {copied ? '已复制' : '复制主题 brief'}
        </button>
        <a href={withBasePath('/her-voice/topics/')} target="_blank" rel="noreferrer" style={assetLinkStyle}>
          打开征集工具
        </a>
      </div>
    </section>
  );
}

function MetadataPreview({ row }: { row: Row }) {
  const meta = row.metadata ?? {};
  const items: Array<[string, string | undefined]> = [];
  if (row.kind === 'book') {
    items.push(['书名', meta.book_title], ['作者', meta.book_author], ['摘录', meta.book_quote], ['推荐理由', meta.book_note]);
  } else if (row.kind === 'ai_question') {
    items.push(['问题', meta.ai_question], ['场景', meta.ai_context], ['工具', meta.ai_tool]);
  } else if (row.kind === 'concept') {
    items.push(['概念', meta.concept], ['困惑', meta.confusion]);
  } else if (row.kind === 'feedback') {
    items.push(['对象', meta.feedback_target], ['详情', meta.feedback_detail]);
  }
  const visible = items.filter(([, value]) => value);
  if (visible.length === 0) return null;
  return (
    <div style={{ display: 'grid', gap: 6, padding: 12, borderRadius: 10, background: '#0a0810', border: '1px solid rgba(201,166,118,0.18)' }}>
      {visible.map(([label, value]) => (
        <div key={label} style={{ fontSize: 12, lineHeight: 1.7, color: '#D9CAB4' }}>
          <span style={{ color: '#C9A676', letterSpacing: '0.16em' }}>{label}</span> · {value}
        </div>
      ))}
    </div>
  );
}

interface CurationDraftRow {
  id: string;
  text: string;
  signature: string | null;
  kind: HermosaKind;
}

interface CurationDraftGroup {
  key: string;
  label: string;
  count: number;
  byKind: Record<HermosaKind, number>;
  totalEcho: number;
  representative: CurationDraftRow | null;
  sampleIds: string[];
}

interface CurationBiasFinding {
  rule: string;
  severity: 'info' | 'warn' | 'block';
  message: string;
  hits: Array<{ id: string; text: string }>;
}

interface CurationDraftResp {
  topicWeek: string;
  topicQuestion: string;
  pool: 'consented' | 'selected' | 'published';
  total: number;
  byKind: Record<HermosaKind, number>;
  groups: CurationDraftGroup[];
  summaryDraft: {
    topicWeek: string | null;
    totalConsidered: number;
    oneSentenceDraft: string;
    paragraphDraft: string;
    groups: Array<{ key: string; label: string; count: number; sampleTexts: string[] }>;
    warnings: CurationBiasFinding[];
  };
  biasFindings: CurationBiasFinding[];
}

const POOL_OPTIONS: Array<{ value: CurationDraftResp['pool']; label: string }> = [
  { value: 'consented', label: '已授权（含候选）' },
  { value: 'selected', label: '已选入 / 已发布' },
  { value: 'published', label: '仅已发布' },
];

const SEVERITY_COLOR: Record<CurationBiasFinding['severity'], string> = {
  info: '#9C7CFF',
  warn: '#C9A676',
  block: '#ff8b9b',
};

function CurationDraftPanel({
  draft,
  loading,
  err,
  pool,
  onPoolChange,
  onFetch,
  onCopy,
  copied,
  topicWeek,
}: {
  draft: CurationDraftResp | null;
  loading: boolean;
  err: string | null;
  pool: CurationDraftResp['pool'];
  onPoolChange: (next: CurationDraftResp['pool']) => void;
  onFetch: () => void;
  onCopy: () => void;
  copied: boolean;
  topicWeek: string;
}) {
  return (
    <section
      style={{
        marginBottom: 18,
        padding: 16,
        borderRadius: 14,
        background: '#15102A',
        border: '1px solid rgba(156,124,255,0.35)',
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.32em', color: '#9C7CFF' }}>
          INTERNAL CURATION DRAFT · {topicWeek}
        </span>
        <select
          value={pool}
          onChange={(e) => onPoolChange(e.target.value as CurationDraftResp['pool'])}
          style={compactSelectStyle}
        >
          {POOL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button onClick={onFetch} disabled={loading} style={loadButtonStyle}>
          {loading ? '生成中' : '生成草稿'}
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.55 }}>
          仅作编辑参考；任何对外发布都需要人工二次确认。
        </span>
        {err ? <span style={{ color: '#ff8b9b', fontSize: 13 }}>{err}</span> : null}
      </div>

      {draft ? (
        <>
          <div style={{ fontSize: 13, color: '#D9CAB4' }}>
            主题：{draft.topicQuestion}｜样本 {draft.total} 条
            （voice {draft.byKind.voice} / book {draft.byKind.book} / ai {draft.byKind.ai_question}）
          </div>
          <textarea
            readOnly
            value={draft.summaryDraft.paragraphDraft}
            rows={Math.min(10, Math.max(4, draft.summaryDraft.paragraphDraft.split('\n').length))}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: 12,
              borderRadius: 10,
              border: '1px solid rgba(156,124,255,0.35)',
              background: '#0a0810',
              color: '#F5F0E8',
              fontSize: 12,
              lineHeight: 1.7,
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onCopy} style={pillStyle(copied, '#9C7CFF')}>
              {copied ? '已复制草稿' : '复制总结草稿'}
            </button>
          </div>

          {draft.groups.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.24em', opacity: 0.6 }}>聚类</div>
              {draft.groups.map((g) => (
                <div
                  key={g.key}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: '#0a0810',
                    border: '1px solid rgba(201,166,118,0.18)',
                    display: 'grid',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ color: '#C9A676', fontStyle: 'italic' }}>{g.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.55 }}>
                      {g.count} 条 · voice {g.byKind.voice} / book {g.byKind.book} / ai {g.byKind.ai_question} · 共鸣 {g.totalEcho}
                    </span>
                  </div>
                  {g.representative ? (
                    <div style={{ fontSize: 13, color: '#F5F0E8', lineHeight: 1.6 }}>
                      代表：「{g.representative.text}」
                      {g.representative.signature ? <span style={{ opacity: 0.55 }}> — {g.representative.signature}</span> : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {draft.biasFindings.length > 0 ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.24em', opacity: 0.6 }}>偏见自查</div>
              {draft.biasFindings.map((f) => (
                <div
                  key={f.rule}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: '#0a0810',
                    border: `1px solid ${SEVERITY_COLOR[f.severity]}`,
                    display: 'grid',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={badgeStyle(SEVERITY_COLOR[f.severity])}>{f.severity}</span>
                    <span style={{ fontSize: 12, color: '#D9CAB4' }}>{f.rule}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#F5F0E8' }}>{f.message}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#D9CAB4', lineHeight: 1.7 }}>
                    {f.hits.slice(0, 3).map((hit) => (
                      <li key={hit.id}>「{hit.text}」</li>
                    ))}
                    {f.hits.length > 3 ? <li>… 还有 {f.hits.length - 3} 条</li> : null}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div style={{ fontSize: 13, opacity: 0.55 }}>
          点「生成草稿」会从已发布且符合策展条件的条目里跑一次本地聚类、偏见自查和编辑总结草稿。
        </div>
      )}
    </section>
  );
}

function readablePatchError(error: string | undefined, status: number): string {
  if (error === 'missing_consent') return '发布前需要先获得精选授权。';
  if (error === 'unsafe_for_publish') return '发布前必须是安全状态，且不能被标记待审。';
  if (error === 'no_changes') return '没有可保存的变更。';
  return error ? `PATCH ${status}: ${error}` : `PATCH HTTP ${status}`;
}

function canPublishRow(row: Row): boolean {
  return row.consent_to_feature && row.safety_level === 'safe' && !row.flagged;
}

function formatAssetCopy(rows: Row[], topicWeek: string): string {
  if (rows.length === 0) {
    return `Her Voice ${topicWeek}\n暂无满足条件的精选：需要 已授权 + safe + selected/published + public。`;
  }
  return [
    `Her Voice ${topicWeek} 精选素材`,
    `共 ${rows.length} 条`,
    '',
    ...rows.map((row, index) => `${index + 1}. ${formatAdminRow(row)}`),
  ].join('\n');
}

function formatTopicCopy(rows: Row[]): string {
  if (rows.length === 0) {
    return 'Her Voice 主题提案\n暂无：可先点击「套用主题提案筛选」后拉取，或打开征集工具创建一个。';
  }
  return [
    'Her Voice 创作者主题提案',
    `共 ${rows.length} 个`,
    '',
    ...rows.map((row, index) => {
      const concept = row.metadata?.concept || row.text;
      const context = row.metadata?.confusion ? `｜${row.metadata.confusion}` : '';
      const source = [row.signature, row.slug, row.code].filter(Boolean).join(' · ') || 'Anonymous';
      return `${index + 1}. 「${concept}」${context}｜${source}｜${HERMOSA_CURATION_STATUS_LABELS[row.curation_status] ?? row.curation_status}`;
    }),
  ].join('\n');
}

function formatAdminRow(row: Row): string {
  if (row.kind === 'book') {
    const title = row.metadata?.book_title ?? '未命名书籍';
    const author = row.metadata?.book_author ? ` / ${row.metadata.book_author}` : '';
    const note = row.metadata?.book_note || row.metadata?.book_quote || row.text;
    return `【${HERMOSA_KIND_LABELS[row.kind]}】《${title}》${author}｜${note}｜${row.signature || 'Anonymous'}`;
  }
  if (row.kind === 'ai_question') {
    const context = row.metadata?.ai_context ? `${row.metadata.ai_context}｜` : '';
    return `【${HERMOSA_KIND_LABELS[row.kind]}】${context}${row.metadata?.ai_question || row.text}｜${row.signature || 'Anonymous'}`;
  }
  return `【${HERMOSA_KIND_LABELS[row.kind] ?? row.kind}】「${row.text}」｜${row.signature || 'Anonymous'}`;
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

function tagButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 999,
    border: '1px solid ' + (active ? '#C9A676' : 'rgba(201,166,118,0.25)'),
    background: active ? '#C9A676' : 'transparent',
    color: active ? '#15102A' : '#F5F0E8',
    fontSize: 12,
    letterSpacing: '0.18em',
    cursor: 'pointer',
  };
}

function rowStyle(row: Row): React.CSSProperties {
  return {
    background: '#15102A',
    border: '1px solid ' + (row.flagged || row.safety_level === 'review' ? '#ff8b9b' : 'rgba(201,166,118,0.25)'),
    borderRadius: 14,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };
}

function badgeStyle(accent: string): React.CSSProperties {
  return {
    padding: '2px 9px',
    borderRadius: 999,
    border: `1px solid ${accent}`,
    color: accent,
    fontSize: 11,
    letterSpacing: '0.14em',
  };
}

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

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0a0810',
  color: '#F5F0E8',
  padding: '48px 32px 96px',
  fontFamily: 'var(--font-display, "Noto Serif SC", serif)',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  background: '#15102A',
  border: '1px solid rgba(201,166,118,0.25)',
  borderRadius: 14,
  padding: 16,
  flexWrap: 'wrap',
  marginBottom: 24,
};

const inputStyle: React.CSSProperties = {
  flex: '1 1 240px',
  padding: '10px 14px',
  background: '#0a0810',
  border: '1px solid rgba(201,166,118,0.35)',
  borderRadius: 8,
  color: '#F5F0E8',
  fontSize: 14,
};

const selectStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#0a0810',
  border: '1px solid rgba(201,166,118,0.35)',
  borderRadius: 8,
  color: '#F5F0E8',
  fontSize: 14,
};

const compactSelectStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#0a0810',
  border: '1px solid rgba(201,166,118,0.35)',
  borderRadius: 6,
  color: '#F5F0E8',
  fontSize: 12,
};

const checkboxStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  fontSize: 12,
  color: '#D9CAB4',
};

const loadButtonStyle: React.CSSProperties = {
  padding: '10px 22px',
  background: '#C9A676',
  border: 'none',
  borderRadius: 8,
  color: '#15102A',
  fontWeight: 600,
  letterSpacing: '0.18em',
  cursor: 'pointer',
};

const assetLinkStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 999,
  border: '1px solid rgba(201,166,118,0.35)',
  color: '#C9A676',
  fontSize: 12,
  letterSpacing: '0.12em',
  textDecoration: 'none',
};
