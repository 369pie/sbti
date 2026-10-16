'use client';

/**
 * /her-voice/my — 我的她说档案
 * ─────────────────────────────────────────────
 * Sprint 4 个人贡献档案（不依赖账号系统）。
 *
 * 数据来源：
 *  - localStorage 里的提交 id 列表（POST /api/hermosa/messages 成功后写入）
 *  - localStorage 里的收藏 id（书 / AI 卡）
 *  - GET /api/hermosa/my?ids=... 拉取最新策展状态
 *
 * 视觉沿用 Editorial Atelier × 暮光博物笔记，不另起一套。
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import {
  HERMOSA_KIND_LABELS,
  HERMOSA_CURATION_STATUS_LABELS,
  HERMOSA_STATUS_LABELS,
  HERMOSA_UNIVERSE_LABELS,
  type HermosaContributionMetadata,
  type HermosaCurationStatus,
  type HermosaKind,
} from '@/lib/hermosa/tags';
import {
  loadOwnContributionIds,
  loadSavedIds,
  loadSeenNotifications,
  markNotificationsSeen,
  toggleSaved,
} from '@/lib/hermosa/contributions-storage';
import { TalentPanel } from './TalentPanel';
import { renderHaloSvg } from '@/lib/sigil/generate';

interface MyRow {
  id: string;
  universe: string;
  slug: string | null;
  kind: HermosaKind;
  text: string;
  signature: string | null;
  tags: string[];
  metadata: HermosaContributionMetadata;
  topic_week: string | null;
  curation_status: HermosaCurationStatus;
  status: string | null;
  status_note: string | null;
  consent_to_feature: boolean;
  is_featured: boolean;
  is_published: boolean;
  flagged: boolean;
  echo_count: number;
  // HER AURORA · W3 · 极光生命周期（lit / caught / tended / inscribed / codex）
  lifecycle?: 'lit' | 'caught' | 'tended' | 'inscribed' | 'codex';
  inscribed_letter_slug?: string | null;
  codex_atlas_slug?: string | null;
  created_at: string;
}

const SELECTED_STATES: HermosaCurationStatus[] = ['selected', 'published'];

function chunkIds(ids: string[]): string {
  return ids.slice(0, 50).join(',');
}

export function MyHerVoiceContent() {
  const [contributions, setContributions] = useState<MyRow[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [savedBooks, setSavedBooks] = useState<MyRow[]>([]);
  const [savedAi, setSavedAi] = useState<MyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNotifications, setNewNotifications] = useState<MyRow[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const ownIds = loadOwnContributionIds();
    const bookIds = loadSavedIds('book');
    const aiIds = loadSavedIds('ai');
    const allIds = Array.from(new Set([...ownIds, ...bookIds, ...aiIds]));
    if (allIds.length === 0) {
      setContributions([]);
      setMissing([]);
      setSavedBooks([]);
      setSavedAi([]);
      setNewNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(getApiPath(`/api/hermosa/my?ids=${chunkIds(allIds)}`), {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { rows: MyRow[]; missing: string[] };
      const byId = new Map(data.rows.map((r) => [r.id, r] as const));

      const ownRows = ownIds.map((id) => byId.get(id)).filter((r): r is MyRow => Boolean(r));
      const bookRows = bookIds.map((id) => byId.get(id)).filter((r): r is MyRow => r?.kind === 'book');
      const aiRows = aiIds.map((id) => byId.get(id)).filter((r): r is MyRow => r?.kind === 'ai_question');

      const seen = new Set(loadSeenNotifications());
      const fresh = ownRows.filter(
        (r) => SELECTED_STATES.includes(r.curation_status) && !seen.has(r.id),
      );

      setContributions(ownRows);
      setMissing(data.missing);
      setSavedBooks(bookRows);
      setSavedAi(aiRows);
      setNewNotifications(fresh);
    } catch {
      setContributions([]);
      setSavedBooks([]);
      setSavedAi([]);
      setNewNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dismissNotifications = useCallback(() => {
    if (newNotifications.length === 0) return;
    markNotificationsSeen(newNotifications.map((r) => r.id));
    setNewNotifications([]);
  }, [newNotifications]);

  const stats = useMemo(() => {
    const total = contributions.length;
    const selected = contributions.filter((r) => SELECTED_STATES.includes(r.curation_status)).length;
    const featured = contributions.filter((r) => r.is_featured).length;
    const echo = contributions.reduce((sum, r) => sum + (r.echo_count ?? 0), 0);
    const byKind: Record<HermosaKind, number> = {
      voice: 0, book: 0, ai_question: 0, concept: 0, feedback: 0,
    };
    for (const r of contributions) {
      if (r.kind in byKind) byKind[r.kind] += 1;
    }
    return { total, selected, featured, echo, byKind };
  }, [contributions]);

  const badges = useMemo(() => buildBadges(stats), [stats]);
  const inboxItems = useMemo(() => buildInboxItems(contributions), [contributions]);
  const aiProgress = useMemo(() => buildAiProgress(contributions, savedAi), [contributions, savedAi]);

  return (
    <main className="hv-page" style={pageStyle}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 720px) {
              .hv-page { padding: 28px 16px 100px !important; }
              .hv-my-dateline-r { display: none; }
              .hv-actions { flex-direction: column; align-items: stretch !important; }
              .hv-actions a { width: 100%; }
              .hv-inbox-grid { grid-template-columns: 1fr !important; }
              .hv-stats > * { padding-right: 0 !important; border-right: none !important; }
            }
          `,
        }}
      />
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.32em',
            color: INK_MUTED,
            marginBottom: 14,
          }}
        >
          <span>HERMOSA · MY ARCHIVE</span>
          <span className="hv-my-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={{ height: 1, background: INK, opacity: 0.85, marginBottom: 32 }} />

        <header style={{ marginBottom: 56 }}>
          <div style={eyebrowStyle}>§ 我的档案 · MY ARCHIVE</div>
          <h1 style={titleStyle}>
            我的<span style={{ color: ACCENT }}>她说</span>档案
          </h1>
          <div style={{ width: 64, height: 3, background: ACCENT, margin: '24px 0 0' }} />
          <p style={ledeStyle}>
            这里只属于你这台浏览器：你提交过的留言、推荐的书、写下的 AI 问题，以及谁被编辑选入了精选墙。
            没有账号系统，也不会上传到任何第三方。
          </p>
          <div className="hv-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link href={withBasePath('/her-voice/')} style={primaryLinkStyle}>← 回到她说</Link>
            <Link href={withBasePath('/her-voice/talents/')} style={secondaryLinkStyle}>沙龙名录</Link>
            <Link href={withBasePath('/her-voice/books/')} style={secondaryLinkStyle}>她的书架</Link>
            <Link href={withBasePath('/her-voice/ai-lab/')} style={secondaryLinkStyle}>AI 共学</Link>
          </div>
        </header>

        {loading ? (
          <div style={emptyStyle}>正在读取你的本地档案…</div>
        ) : null}

        {!loading && contributions.length > 0 ? (
          <HaloPanel rows={contributions} />
        ) : null}

        <TalentPanel />

        {!loading && newNotifications.length > 0 ? (
          <section style={notifPanelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={notifIconStyle}>★</span>
              <strong style={{ fontStyle: 'italic' }}>
                你有 {newNotifications.length} 条被编辑选入了
              </strong>
            </div>
            <ul style={notifListStyle}>
              {newNotifications.slice(0, 5).map((r) => (
                <li key={r.id} style={{ marginBottom: 8 }}>
                  <span style={kindBadgeStyle}>{HERMOSA_KIND_LABELS[r.kind] ?? r.kind}</span>
                  <span style={{ marginLeft: 8 }}>「{r.text}」</span>
                </li>
              ))}
            </ul>
            <button onClick={dismissNotifications} style={dismissBtnStyle}>知道了</button>
          </section>
        ) : null}

        {!loading ? (
          <section className="hv-inbox-grid" style={inboxGridStyle}>
            <InboxPanel items={inboxItems} contributionCount={contributions.length} />
            <AiProgressPanel steps={aiProgress} />
          </section>
        ) : null}

        {!loading && contributions.length > 0 ? (
          <section className="hv-stats" style={statSectionStyle}>
            <Stat label="总贡献" value={stats.total} />
            <Stat label="一句话" value={stats.byKind.voice} />
            <Stat label="她的书" value={stats.byKind.book} />
            <Stat label="AI 问题" value={stats.byKind.ai_question} />
            <Stat label="被选入" value={stats.selected} accent="#9C7CFF" />
            <Stat label="共鸣总数" value={stats.echo} accent="#C07A8E" />
          </section>
        ) : null}

        {!loading && badges.length > 0 ? (
          <section style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {badges.map((b) => (
              <span key={b.id} title={b.title} style={badgePillStyle}>
                {b.label}
              </span>
            ))}
          </section>
        ) : null}

        <Section title="我的提交">
          {contributions.length === 0 ? (
            <EmptyHint
              title="这里还没有你写下的话"
              hint="去她说写下你的第一句吧。"
              href="/her-voice/"
              cta="去 Her Voice"
            />
          ) : (
            <ContributionList rows={contributions} onChange={refresh} />
          )}
        </Section>

        <Section title="收藏的书">
          {savedBooks.length === 0 ? (
            <EmptyHint
              title="还没有收藏的书"
              hint="在她的书架里点收藏，回来这里能找到。"
              href="/her-voice/books/"
              cta="去她的书架"
            />
          ) : (
            <SavedList rows={savedBooks} scope="book" onChange={refresh} />
          )}
        </Section>

        <Section title="收藏的 AI 问题">
          {savedAi.length === 0 ? (
            <EmptyHint
              title="还没有收藏的 AI 问题"
              hint="在 AI 共学里点收藏，回来这里能找到。"
              href="/her-voice/ai-lab/"
              cta="去 AI 共学"
            />
          ) : (
            <SavedList rows={savedAi} scope="ai" onChange={refresh} />
          )}
        </Section>

        {missing.length > 0 ? (
          <p style={{ marginTop: 24, fontSize: 12, opacity: 0.55 }}>
            有 {missing.length} 条记录在远端找不到（可能被编辑下架或删除）。
          </p>
        ) : null}
      </div>
    </main>
  );
}

interface BadgeDef {
  id: string;
  label: string;
  title: string;
}

interface InboxItem {
  id: string;
  title: string;
  body: string;
  meta: string;
  href: string | null;
  tone: 'accent' | 'violet' | 'muted';
}

interface ProgressStep {
  id: string;
  title: string;
  detail: string;
  done: boolean;
}

function getAssetHref(row: MyRow): string | null {
  if (row.kind === 'voice' && row.topic_week) return `/her-voice/wallpapers/${row.topic_week}/`;
  if (row.kind === 'book' && row.topic_week) return `/her-voice/books/${row.topic_week}/`;
  if (row.kind === 'ai_question') return '/her-voice/ai-lab/';
  if (row.kind === 'concept') return '/her-voice/topics/';
  return null;
}

function buildInboxItems(rows: MyRow[]): InboxItem[] {
  const out: InboxItem[] = [];
  const sorted = [...rows].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  for (const row of sorted) {
    const label = HERMOSA_KIND_LABELS[row.kind] ?? row.kind;
    const href = getAssetHref(row);
    if (row.status) {
      out.push({
        id: `${row.id}:status`,
        title: HERMOSA_STATUS_LABELS[row.status] ?? row.status,
        body: row.status_note || `编辑部已更新这条${label}的处理状态。`,
        meta: `${label}${row.topic_week ? ` · ${row.topic_week}` : ''}`,
        href,
        tone: row.status === 'shipped' ? 'accent' : 'muted',
      });
    }
    if (SELECTED_STATES.includes(row.curation_status) || row.is_featured) {
      out.push({
        id: `${row.id}:selected`,
        title: row.curation_status === 'published' ? '已进入公共资产' : '被编辑选入精选',
        body: `「${row.text}」`,
        meta: `${label}${row.topic_week ? ` · ${row.topic_week}` : ''} · 共鸣 ${row.echo_count}`,
        href,
        tone: 'violet',
      });
    }
  }
  return out.slice(0, 6);
}

function buildAiProgress(contributions: MyRow[], savedAi: MyRow[]): ProgressStep[] {
  const ownAi = contributions.filter((row) => row.kind === 'ai_question');
  const selectedAi = ownAi.filter((row) => SELECTED_STATES.includes(row.curation_status) || row.is_featured);
  const weeks = new Set(ownAi.map((row) => row.topic_week).filter(Boolean));
  return [
    {
      id: 'first_ai',
      title: '写下第一个 AI 问题',
      detail: ownAi.length > 0 ? `${ownAi.length} 个问题已进入档案` : '从一个真实场景开始',
      done: ownAi.length > 0,
    },
    {
      id: 'save_three',
      title: '收集 3 个练习题',
      detail: `已累计 ${ownAi.length + savedAi.length}/3 个`,
      done: ownAi.length + savedAi.length >= 3,
    },
    {
      id: 'selected_ai',
      title: '进入 AI 共学精选',
      detail: selectedAi.length > 0 ? '已有问题被编辑选入' : '等待编辑整理',
      done: selectedAi.length > 0,
    },
    {
      id: 'weekly_return',
      title: '跨周持续练习',
      detail: weeks.size > 1 ? `${weeks.size} 个主题周` : '再回到下一期主题',
      done: weeks.size > 1,
    },
  ];
}

function buildBadges(stats: {
  total: number;
  selected: number;
  echo: number;
  byKind: Record<HermosaKind, number>;
}): BadgeDef[] {
  const out: BadgeDef[] = [];
  if (stats.total >= 1) out.push({ id: 'first', label: '✦ 第一句', title: '你写下了第一条贡献。' });
  if (stats.byKind.book >= 1) out.push({ id: 'reader', label: '✦ 她的读者', title: '你推荐了至少一本书。' });
  if (stats.byKind.ai_question >= 1) out.push({ id: 'ai_practice', label: '✦ AI 练习者', title: '你写下了至少一个 AI 问题。' });
  if (stats.total >= 5) out.push({ id: 'archive_5', label: '✦ 五条档案', title: '你已经累计贡献 5 条以上。' });
  if (stats.selected >= 1) out.push({ id: 'selected', label: '★ 被选入精选', title: '你的话被编辑选入了。' });
  if (stats.echo >= 10) out.push({ id: 'echo_10', label: '✦ 共鸣 10+', title: '你的话被共鸣 10 次以上。' });
  return out;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function InboxPanel({ items, contributionCount }: { items: InboxItem[]; contributionCount: number }) {
  return (
    <section style={panelBlockStyle}>
      <h2 style={sectionTitleStyle}>站内回声</h2>
      {items.length === 0 ? (
        <div style={softEmptyStyle}>
          {contributionCount > 0 ? '编辑回声会在这里出现。' : '写下第一条之后，这里会成为你的回看收件箱。'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <article key={item.id} style={inboxItemStyle(item.tone)}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 17, fontStyle: 'italic' }}>{item.title}</strong>
                <span style={{ ...kindBadgeStyle, color: item.tone === 'accent' ? ACCENT : INK_MUTED }}>{item.meta}</span>
              </div>
              <p style={{ ...bodyStyle, margin: 0 }}>{item.body}</p>
              {item.href ? (
                <Link href={withBasePath(item.href)} style={textLinkStyle}>
                  打开回看
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AiProgressPanel({ steps }: { steps: ProgressStep[] }) {
  const doneCount = steps.filter((step) => step.done).length;
  return (
    <section style={panelBlockStyle}>
      <h2 style={sectionTitleStyle}>AI 练习进度</h2>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 28, color: ACCENT, fontStyle: 'italic' }}>{doneCount}/{steps.length}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.28em', color: INK_MUTED }}>
          PRACTICE TRAIL
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {steps.map((step) => (
          <div key={step.id} style={progressRowStyle(step.done)}>
            <span style={progressDotStyle(step.done)}>{step.done ? '✓' : '·'}</span>
            <span>
              <strong style={{ display: 'block', fontSize: 15, fontStyle: 'italic' }}>{step.title}</strong>
              <span style={{ color: INK_MUTED, fontSize: 13 }}>{step.detail}</span>
            </span>
          </div>
        ))}
      </div>
      <Link href={withBasePath('/her-voice/ai-lab/')} style={{ ...textLinkStyle, marginTop: 16 }}>
        继续 AI 共学
      </Link>
    </section>
  );
}

function ContributionList({ rows, onChange }: { rows: MyRow[]; onChange: () => void }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map((r) => (
        <article key={r.id} style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={kindBadgeStyle}>{HERMOSA_KIND_LABELS[r.kind] ?? r.kind}</span>
            <span style={statusBadgeStyle(r)}>
              {HERMOSA_CURATION_STATUS_LABELS[r.curation_status] ?? r.curation_status}
            </span>
            {r.is_featured ? <span style={featuredBadgeStyle}>★ 精选</span> : null}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-text-muted)' }}>
              {new Date(r.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <ContributionBody row={r} />
          <div style={cardFooterStyle}>
            <span>
              {HERMOSA_UNIVERSE_LABELS[r.universe as keyof typeof HERMOSA_UNIVERSE_LABELS] ?? r.universe}
              {r.topic_week ? ` · ${r.topic_week}` : ''}
            </span>
            <span>共鸣 {r.echo_count}</span>
          </div>
        </article>
      ))}
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
        共 {rows.length} 条，最多保留 50 条最近提交。
      </span>
      {/* keep onChange referenced so TS doesn't drop it (used after future actions) */}
      <button hidden onClick={onChange} aria-hidden tabIndex={-1} />
    </div>
  );
}

function SavedList({ rows, scope, onChange }: { rows: MyRow[]; scope: 'book' | 'ai'; onChange: () => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
      {rows.map((r) => (
        <article key={r.id} style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={kindBadgeStyle}>{HERMOSA_KIND_LABELS[r.kind] ?? r.kind}</span>
            {r.topic_week ? <span style={topicBadgeStyle}>{r.topic_week}</span> : null}
            <button
              onClick={() => {
                toggleSaved(scope, r.id);
                onChange();
              }}
              style={removeBtnStyle}
              aria-label="移除收藏"
            >
              移除
            </button>
          </div>
          <ContributionBody row={r} />
          <div style={cardFooterStyle}>
            <span>{r.signature || 'Anonymous'}</span>
            <span>共鸣 {r.echo_count}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ContributionBody({ row }: { row: MyRow }) {
  if (row.kind === 'book') {
    return (
      <div style={{ display: 'grid', gap: 4 }}>
        <strong style={{ fontStyle: 'italic', fontSize: 18 }}>
          《{row.metadata?.book_title ?? '未命名书籍'}》
        </strong>
        {row.metadata?.book_author ? (
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{row.metadata.book_author}</span>
        ) : null}
        {row.metadata?.book_quote ? (
          <blockquote style={quoteStyle}>「{row.metadata.book_quote}」</blockquote>
        ) : null}
        <p style={bodyStyle}>{row.metadata?.book_note || row.text}</p>
      </div>
    );
  }
  if (row.kind === 'ai_question') {
    return (
      <div style={{ display: 'grid', gap: 4 }}>
        {row.metadata?.ai_context ? (
          <div style={{ fontSize: 12, color: 'var(--color-rose)', letterSpacing: '0.16em' }}>
            场景 · {row.metadata.ai_context}
          </div>
        ) : null}
        <p style={{ ...bodyStyle, fontSize: 16, fontStyle: 'italic' }}>
          {row.metadata?.ai_question || row.text}
        </p>
        {row.metadata?.ai_tool ? (
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            常用工具 · {row.metadata.ai_tool}
          </span>
        ) : null}
      </div>
    );
  }
  return <p style={{ ...bodyStyle, fontSize: 16, fontStyle: 'italic' }}>「{row.text}」</p>;
}

function EmptyHint({
  title,
  hint,
  href,
  cta,
}: {
  title: string;
  hint: string;
  href: string;
  cta: string;
}) {
  return (
    <div style={emptyStyle}>
      <strong style={{ fontStyle: 'italic', display: 'block', marginBottom: 6 }}>{title}</strong>
      <span style={{ color: 'var(--color-text-secondary)' }}>{hint}</span>
      <Link href={withBasePath(href)} style={{ display: 'inline-block', marginTop: 12, color: 'var(--color-accent)' }}>
        {cta}
      </Link>
    </div>
  );
}

function Stat({ label, value, accent = '#C9A676' }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{
      flex: '1 1 120px',
      padding: 14,
      borderRadius: 12,
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-subtle)',
    }}>
      <div style={{ fontSize: 11, letterSpacing: '0.24em', opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 26, fontStyle: 'italic', marginTop: 6, color: accent }}>{value}</div>
    </div>
  );
}

// HER AURORA · W3 · Halo · 光环印面板
// 等级阈值：1/7/27/81 句话点亮一层（共 5 层）。
// 不显示进度条数字，只显示当前轨道圈数与"再点亮 X 束"的模糊提示。
const HALO_THRESHOLDS = [1, 7, 27, 81, 243] as const;
const HALO_ROMAN = ['I', 'II', 'III', 'IV', 'V'] as const;

function levelFromHaloCount(n: number): 0 | 1 | 2 | 3 | 4 {
  let level = 0;
  for (let i = 0; i < HALO_THRESHOLDS.length; i++) {
    if (n >= HALO_THRESHOLDS[i]) level = i;
  }
  return Math.min(level, 4) as 0 | 1 | 2 | 3 | 4;
}

function nextThresholdGap(n: number): number {
  for (const t of HALO_THRESHOLDS) {
    if (n < t) return t - n;
  }
  return 0;
}

function HaloPanel({ rows }: { rows: MyRow[] }) {
  const lit = rows.length;
  const tended = rows.filter((r) => r.lifecycle === 'tended' || r.lifecycle === 'inscribed' || r.lifecycle === 'codex' || r.is_featured).length;
  const inscribed = rows.filter((r) => r.lifecycle === 'inscribed' || r.lifecycle === 'codex').length;
  const codex = rows.filter((r) => r.lifecycle === 'codex').length;
  const level = levelFromHaloCount(lit);
  const gap = nextThresholdGap(lit);
  // 用最早一束光的 id 当稳定 hash 种子（同一台浏览器 → 同一个 Halo）
  const seed = rows[rows.length - 1]?.id ?? 'anonymous';
  const svg = useMemo(
    () =>
      renderHaloSvg({
        hash: `halo:${seed}`,
        level,
        size: 132,
        motifs: codex > 0 ? ['curator_mark', 'seasonal_ring'] : tended > 0 ? ['seasonal_ring'] : [],
      }),
    [seed, level, codex, tended],
  );
  return (
    <section
      style={{
        margin: '0 0 48px',
        padding: '28px',
        border: `1px solid ${INK}22`,
        background: PAPER_RAISED,
        display: 'grid',
        gridTemplateColumns: '132px 1fr',
        gap: 28,
        alignItems: 'center',
      }}
    >
      <div
        aria-hidden
        style={{ width: 132, height: 132, lineHeight: 0 }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10.5,
            letterSpacing: '0.36em',
            color: ACCENT,
            textTransform: 'uppercase',
          }}
        >
          § HALO · 光环印
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontStyle: 'italic',
            color: INK,
            letterSpacing: '-0.005em',
          }}
        >
          N° {lit} 度同光者 · 第 {HALO_ROMAN[level]} 圈轨道
        </h2>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 11, letterSpacing: '0.18em', color: INK_MUTED, textTransform: 'uppercase' }}>
          <span>LIT · {lit}</span>
          <span>TENDED · {tended}</span>
          <span>INSCRIBED · {inscribed}</span>
          <span>CODEX · {codex}</span>
        </div>
        <div style={{ fontSize: 13, color: '#5C5366', fontStyle: 'italic', letterSpacing: '0.04em', maxWidth: 520 }}>
          {gap > 0
            ? `— 再点亮 ${gap} 束光，你的轨道会延伸到第 ${HALO_ROMAN[Math.min(level + 1, 4)]} 圈。`
            : '— 你已抵达最外圈轨道。继续点亮的光会被守光人优先收入极光来信。'}
        </div>
      </div>
      <SameLightCluster rows={rows} />
    </section>
  );
}

// HER AURORA · W4 · E-N7 · 同光者 Halo cluster v0
// 视觉占位：5 枚 mini Halo 在夜色背景上呈环形。
// 真实聚类（命格 + 标签 + 词向量 cos）见 master plan，v0 仅展示"你不是一个人"的归属感。
function SameLightCluster({ rows }: { rows: MyRow[] }) {
  const seeds = useMemo(() => {
    const ids = rows.slice(0, 5).map((r) => r.id);
    while (ids.length < 5) ids.push(`echo-${ids.length}`);
    return ids;
  }, [rows]);
  const halos = useMemo(
    () =>
      seeds.map((id, i) =>
        renderHaloSvg({
          hash: `cluster:${id}`,
          level: ((i + 2) % 5) as 0 | 1 | 2 | 3 | 4,
          size: 56,
        }),
      ),
    [seeds],
  );
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        marginTop: 18,
        paddingTop: 22,
        borderTop: `1px dashed ${INK}33`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10.5,
          letterSpacing: '0.36em',
          color: INK_MUTED,
          textTransform: 'uppercase',
        }}
      >
        § 本月同光者 · SAME LIGHT
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {halos.map((svg, i) => (
          <span
            key={i}
            aria-hidden
            style={{ width: 56, height: 56, lineHeight: 0, opacity: 0.86 }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ))}
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
          fontStyle: 'italic',
          fontSize: 13.5,
          color: '#5C5366',
          maxWidth: 560,
          lineHeight: 1.7,
        }}
      >
        — 这五枚光环来自和你相邻的同光者。我们不会让她们私信你，也永远不显示她们的原句。
        她们只是和你一起，被这一片极光照过。
      </p>
    </div>
  );
}

const PAPER = '#F5F0E8';
const PAPER_RAISED = '#FAF7F2';
const INK = '#1A1530';
const INK_MUTED = '#8A817A';
const ACCENT = '#C0512F';
const HAIRLINE = 'rgba(26, 21, 48, 0.14)';
const MONO = 'ui-monospace, "SF Mono", monospace';
const SERIF_DISPLAY = 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: PAPER,
  color: INK,
  padding: '40px 18px 120px',
  fontFamily: SERIF_DISPLAY,
};

const eyebrowStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  color: ACCENT,
  marginBottom: 16,
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(40px, 8vw, 72px)',
  lineHeight: 0.95,
  fontStyle: 'italic',
  letterSpacing: '-0.02em',
  color: INK,
  fontWeight: 500,
};

const ledeStyle: CSSProperties = {
  maxWidth: 620,
  margin: '22px 0 0',
  fontSize: 'clamp(15px, 1.6vw, 17px)',
  lineHeight: 1.85,
  color: INK,
  opacity: 0.78,
  fontStyle: 'italic',
};

const primaryLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44,
  padding: '12px 22px',
  borderRadius: 0,
  background: INK,
  color: PAPER,
  textDecoration: 'none',
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  fontWeight: 500,
  textTransform: 'uppercase',
  border: `1px solid ${INK}`,
};

const secondaryLinkStyle: CSSProperties = {
  ...primaryLinkStyle,
  background: 'transparent',
  color: INK,
  border: `1px solid ${HAIRLINE}`,
};

const notifPanelStyle: CSSProperties = {
  marginBottom: 32,
  padding: '22px 24px',
  borderRadius: 0,
  background: PAPER_RAISED,
  border: 'none',
  borderTop: `3px solid ${ACCENT}`,
  borderBottom: `1px solid ${HAIRLINE}`,
  display: 'grid',
  gap: 12,
};

const notifIconStyle: CSSProperties = {
  display: 'inline-flex',
  width: 28,
  height: 28,
  borderRadius: 0,
  background: ACCENT,
  color: PAPER,
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: MONO,
  fontSize: 12,
};

const notifListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  fontSize: 15,
  lineHeight: 1.85,
  color: INK,
  fontStyle: 'italic',
};

const dismissBtnStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '8px 18px',
  borderRadius: 0,
  background: 'transparent',
  color: INK,
  border: `1px solid ${INK}`,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.42em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const statSectionStyle: CSSProperties = {
  display: 'flex',
  gap: 18,
  flexWrap: 'wrap',
  marginBottom: 32,
  paddingBottom: 18,
  borderBottom: `1px solid ${HAIRLINE}`,
};

const badgePillStyle: CSSProperties = {
  padding: '6px 0',
  borderRadius: 0,
  border: 'none',
  borderRight: `1px solid ${HAIRLINE}`,
  paddingRight: 18,
  color: INK,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
};

const inboxGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
  gap: 28,
  marginBottom: 34,
};

const panelBlockStyle: CSSProperties = {
  minWidth: 0,
};

const softEmptyStyle: CSSProperties = {
  padding: '24px 0',
  borderTop: `1px solid ${HAIRLINE}`,
  color: INK_MUTED,
  fontSize: 14,
  fontStyle: 'italic',
};

function inboxItemStyle(tone: InboxItem['tone']): CSSProperties {
  const borderColor = tone === 'accent' ? ACCENT : tone === 'violet' ? '#9C7CFF' : HAIRLINE;
  return {
    padding: '16px 0 18px',
    borderTop: `1px solid ${borderColor}`,
    display: 'grid',
    gap: 8,
  };
}

const textLinkStyle: CSSProperties = {
  color: ACCENT,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  justifySelf: 'start',
};

function progressRowStyle(done: boolean): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: '28px 1fr',
    gap: 10,
    alignItems: 'start',
    opacity: done ? 1 : 0.62,
  };
}

function progressDotStyle(done: boolean): CSSProperties {
  return {
    width: 22,
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${done ? ACCENT : HAIRLINE}`,
    color: done ? PAPER : INK_MUTED,
    background: done ? ACCENT : 'transparent',
    fontFamily: MONO,
    fontSize: 12,
  };
}

const sectionTitleStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  color: ACCENT,
  margin: '0 0 18px',
  paddingBottom: 10,
  borderBottom: `1px solid ${INK}`,
  fontWeight: 400,
  textTransform: 'uppercase',
};

const cardStyle: CSSProperties = {
  padding: '20px 0 22px',
  borderRadius: 0,
  background: 'transparent',
  border: 'none',
  borderTop: `1px solid ${HAIRLINE}`,
  display: 'grid',
  gap: 12,
};

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'baseline',
  flexWrap: 'wrap',
};

const cardFooterStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: MONO,
  fontSize: 10,
  color: INK_MUTED,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  paddingTop: 8,
  borderTop: `1px dotted ${HAIRLINE}`,
};

const kindBadgeStyle: CSSProperties = {
  padding: 0,
  borderRadius: 0,
  border: 'none',
  color: ACCENT,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
};

const topicBadgeStyle: CSSProperties = {
  padding: 0,
  borderRadius: 0,
  border: 'none',
  color: INK_MUTED,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.28em',
};

const featuredBadgeStyle: CSSProperties = {
  padding: '2px 8px',
  borderRadius: 0,
  background: ACCENT,
  color: PAPER,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
};

function statusBadgeStyle(row: MyRow): CSSProperties {
  const color = SELECTED_STATES.includes(row.curation_status)
    ? ACCENT
    : row.curation_status === 'rejected'
      ? INK_MUTED
      : INK_MUTED;
  return {
    padding: 0,
    borderRadius: 0,
    border: 'none',
    color,
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
  };
}

const removeBtnStyle: CSSProperties = {
  marginLeft: 'auto',
  padding: '4px 10px',
  borderRadius: 0,
  background: 'transparent',
  color: INK_MUTED,
  border: 'none',
  borderLeft: `1px solid ${HAIRLINE}`,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const quoteStyle: CSSProperties = {
  margin: '6px 0 0',
  paddingLeft: 14,
  borderLeft: `3px solid ${ACCENT}`,
  color: INK,
  fontSize: 16,
  lineHeight: 1.75,
  fontStyle: 'italic',
  fontFamily: SERIF_DISPLAY,
};

const bodyStyle: CSSProperties = {
  margin: 0,
  color: INK,
  opacity: 0.78,
  fontSize: 14,
  lineHeight: 1.85,
  fontFamily: '"Noto Serif SC", serif',
};

const emptyStyle: CSSProperties = {
  padding: 28,
  borderRadius: 0,
  border: `1px dashed ${HAIRLINE}`,
  color: INK_MUTED,
  textAlign: 'left',
  fontStyle: 'italic',
};
