'use client';

/**
 * CPTI 2.0 — 关系档案夹（My Codex）
 *
 * Local remains the fast/offline cache; Supabase is now the durable layer.
 * This client always tries to mirror local edits to the backend, then rewrites
 * local storage from the server copy so multi-device visits converge.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CODEX_MILESTONES,
  CODEX_SCENARIO_LABELS,
  CODEX_SCENARIO_ORDER,
  type CodexRecord,
  type CodexScenarioBucket,
  deleteCodexRecord,
  listCodexRecords,
  replaceCodexRecords,
  updateCodexRecord,
} from '@/lib/cpti/codex-archive';
import { getRelationshipBySlug } from '@/lib/cpti/relationships';
import { getRelationshipRarity } from '@/lib/cpti/relationships-rarity';
import { getCptiPersonalityBySlug } from '@/lib/cpti/personalities';
import { trackCptiEvent } from '@/lib/cpti/analytics';
import { cptiApi } from '@/lib/cpti/cpti-api';
import { parseCptiPricingIntent } from '@/lib/cpti/pricing-intents';

type Tab = CodexScenarioBucket | 'all';

export function CptiCodexClient() {
  const searchParams = useSearchParams();
  const upgradeIntent = parseCptiPricingIntent(searchParams.get('intent')) === 'upgrade';
  const [records, setRecords] = useState<CodexRecord[]>(() =>
    typeof window === 'undefined' ? [] : listCodexRecords(),
  );
  const [tab, setTab] = useState<Tab>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  // S5.4 Invite Loopback notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; relationshipSlug: string; openedAt: string }>>([]);

  const refresh = useCallback(async () => {
    try {
      const remote = await cptiApi.getCodex();
      if (remote?.records) {
        replaceCodexRecords(remote.records);
        setRecords(remote.records);
        return;
      }
    } catch {
      // fall back to local cache
    }
    setRecords(listCodexRecords());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = listCodexRecords();
      try {
        await cptiApi.bootstrap();
        if (local.length > 0) {
          await cptiApi.syncCodexRecords(local);
        }
        const remote = await cptiApi.getCodex();
        if (!cancelled && remote?.records) {
          replaceCodexRecords(remote.records);
          setRecords(remote.records);
          return;
        }
      } catch {
        // best-effort remote sync only
      }
      if (!cancelled) {
        setRecords(local);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    trackCptiEvent('cpti_codex_viewed', { value: records.length });
    // Intentionally only fire once on mount; subsequent record changes do not
    // re-emit a "viewed" event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Milestone toast (fire-once per browser).
  useEffect(() => {
    const count = records.length;
    for (const m of CODEX_MILESTONES) {
      if (count >= m) {
        const key = `cpti-codex-milestone-${m}`;
        if (typeof window !== 'undefined' && !window.localStorage.getItem(key)) {
          try { window.localStorage.setItem(key, '1'); } catch {}
          trackCptiEvent('cpti_codex_milestone_reached', { milestone: m, value: count });
        }
      }
    }
  }, [records.length]);

  // S5.4 — Load pending invite-loopback notifications from server, fallback to local queue.
  useEffect(() => {
    (async () => {
      try {
        const remote = await cptiApi.getInviteLoopbacks();
        const pending = remote?.notifications ?? [];
        if (pending.length > 0) {
          setNotifications(pending.map(n => ({ id: n.id, relationshipSlug: n.relationshipSlug, openedAt: n.openedAt })));
          trackCptiEvent('cpti_invite_loopback_viewed', { count: pending.length });
          return;
        }

        const { getMyPendingNotifications } = await import('@/lib/cpti/invite-loopback');
        const fallback = getMyPendingNotifications();
        if (fallback.length > 0) {
          setNotifications(fallback.map(n => ({
            id: String(n.createdAt),
            relationshipSlug: n.relationshipSlug,
            openedAt: new Date(n.createdAt).toISOString(),
          })));
          trackCptiEvent('cpti_invite_loopback_viewed', { count: fallback.length });
        }
      } catch { /* best-effort */ }
    })();
  }, []);

  const dismissNotifications = useCallback(async () => {
    try {
      await cptiApi.markInviteLoopbacksSeen();
    } catch {
      try {
        const { markAllNotificationsSeen } = await import('@/lib/cpti/invite-loopback');
        markAllNotificationsSeen();
      } catch { /* noop */ }
    }
    setNotifications([]);
  }, []);

  const filtered = useMemo(() => {
    return tab === 'all' ? records : records.filter(r => r.scenario === tab);
  }, [records, tab]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: records.length, lover: 0, bestie: 0, family: 0, work: 0, enemy: 0, other: 0 };
    for (const r of records) c[r.scenario] = (c[r.scenario] ?? 0) + 1;
    return c;
  }, [records]);

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('确认删除这段关系记录？此操作不可撤回。')) return;
    if (deleteCodexRecord(id)) {
      trackCptiEvent('cpti_codex_record_deleted', { value: records.length - 1 });
      setRecords(listCodexRecords());
      try {
        await cptiApi.deleteCodexRecord(id);
        await refresh();
      } catch {
        // local delete already applied
      }
    }
  };

  const handleUpdate = async (id: string, patch: { partnerNickname?: string; note?: string; scenario?: CodexScenarioBucket }) => {
    if (updateCodexRecord(id, patch)) {
      trackCptiEvent('cpti_codex_record_renamed', {});
      setRecords(listCodexRecords());
      try {
        await cptiApi.updateCodexRecord(id, patch);
        await refresh();
      } catch {
        // local update already applied
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-[820px] px-5 py-10 sm:py-14">
        {/* Eyebrow */}
        <div className="mb-3 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em] text-gold">
          <span>CPTI · My Codex</span>
          <span className="h-px flex-1 bg-gold/40" />
          <span>{records.length} / 25</span>
        </div>

        <h1
          className="text-[40px] leading-[1.1]"
          style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif', fontStyle: 'italic' }}
        >
          我的关系图鉴
        </h1>
        <p className="mt-3 max-w-[520px] text-[14px] leading-[1.85] text-text-secondary">
          你测过的每一段关系都在这里。给它起个昵称、加一句备注、90 天后回来重测对比 ——
          这本图鉴会跟着你成长。
        </p>

        {/* Pass upsell */}
        {(records.length >= 3 || upgradeIntent) && (
          <div className="mt-6 rounded-2xl border border-gold/50 bg-bg-elevated/80 p-4 text-[13px] leading-[1.7] text-text-secondary sm:flex sm:items-center sm:gap-4">
            <div className="flex-1">
              <p className="font-medium text-text-primary">
                {records.length >= 3 ? '把所有关系永久留下来' : '先看年卡会把这本图鉴变成什么'}
              </p>
              <p className="mt-1 text-[12px] text-gold">
                {records.length >= 3
                  ? `你已经攒了 ${records.length} 段关系。¥29/年解锁年卡，开启重测对比 + 年度图鉴长图 + 全部 25 类深档。`
                  : '你现在还在起步阶段，但年卡会把之后测过的每一段关系都纳入图鉴：永久存档、备注编辑、未来的重测对比入口，以及年度关系长图。'}
              </p>
            </div>
            <Link
              href="/cpti/pricing/?intent=codex-pass"
              onClick={() => trackCptiEvent('cpti_codex_pass_clicked', { value: records.length })}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-text-primary px-4 py-2 text-[12.5px] font-medium text-bg-primary sm:mt-0 sm:shrink-0"
            >
              {records.length >= 3 ? '¥29 解锁年卡 →' : '查看年卡方案 →'}
            </Link>
          </div>
        )}

        {/* S5.4 Invite loopback notifications */}
        {notifications.length > 0 && (
          <div className="mt-6 rounded-xl border border-gold bg-bg-secondary p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <p className="text-[11px] tracking-[0.3em] uppercase text-gold">Invite Loopback · {notifications.length}</p>
                <p className="text-sm text-text-primary">
                  你分享过的 {notifications.length} 段关系，已经有人点开并看完了。
                </p>
                <ul className="text-xs text-text-secondary space-y-0.5 pt-1">
                  {notifications.slice(0, 3).map(n => (
                    <li key={n.id}>
                      · 有人打开了你分享的「{getRelationshipBySlug(n.relationshipSlug)?.name ?? n.relationshipSlug}」
                    </li>
                  ))}
                  {notifications.length > 3 && <li className="text-gold">…还有 {notifications.length - 3} 条</li>}
                </ul>
              </div>
              <button
                onClick={dismissNotifications}
                className="shrink-0 text-[11px] text-gold hover:text-text-primary"
              >
                全部标记已读
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
            全部 · {counts.all}
          </TabButton>
          {CODEX_SCENARIO_ORDER.map(s => (
            <TabButton key={s} active={tab === s} onClick={() => setTab(s)}>
              {CODEX_SCENARIO_LABELS[s].emoji} {CODEX_SCENARIO_LABELS[s].label} · {counts[s] ?? 0}
            </TabButton>
          ))}
        </div>

        {/* Records */}
        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            filtered.map(r => (
              <RecordCard
                key={r.id}
                record={r}
                editing={editingId === r.id}
                onEditStart={() => setEditingId(r.id)}
                onEditEnd={() => setEditingId(null)}
                onUpdate={patch => { void handleUpdate(r.id, patch); }}
                onDelete={() => { void handleDelete(r.id); }}
              />
            ))
          )}
        </div>

        <footer className="mt-16 border-t border-gold/30 pt-6 text-center text-[10px] font-mono uppercase tracking-[0.32em] text-gold">
          CPTI · v2.0 · Codex
        </footer>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${
        active
          ? 'border-text-primary bg-text-primary text-bg-primary'
          : 'border-gold/40 bg-bg-elevated/70 text-text-secondary hover:border-gold'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const label = tab === 'all' ? '关系' : CODEX_SCENARIO_LABELS[tab as CodexScenarioBucket].label;
  return (
    <div className="rounded-2xl border border-dashed border-gold/50 bg-bg-elevated/70 px-6 py-12 text-center">
      <p className="text-[14px] text-text-secondary">你的{label}图鉴还是空白。</p>
      <Link
        href="/cpti/test/"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-text-primary px-4 py-2.5 text-[13px] font-medium text-bg-primary"
      >
        先去测一段 →
      </Link>
    </div>
  );
}

interface RecordCardProps {
  record: CodexRecord;
  editing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  onUpdate: (patch: { partnerNickname?: string; note?: string; scenario?: CodexScenarioBucket }) => void;
  onDelete: () => void;
}

function RecordCard({ record, editing, onEditStart, onEditEnd, onUpdate, onDelete }: RecordCardProps) {
  const rel = getRelationshipBySlug(record.relationshipSlug);
  const me = getCptiPersonalityBySlug(record.personalitySlugA);
  const them = record.personalitySlugB ? getCptiPersonalityBySlug(record.personalitySlugB) : null;
  const rarity = getRelationshipRarity(record.relationshipSlug);

  const [nickname, setNickname] = useState(record.partnerNickname ?? '');
  const [note, setNote] = useState(record.note ?? '');
  const [scenario, setScenario] = useState<CodexScenarioBucket>(record.scenario);

  const created = new Date(record.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

  if (!rel) return null;

  return (
    <article
      className="rounded-2xl border border-border-subtle bg-bg-elevated/92 p-4 shadow-[0_8px_24px_-18px_rgba(192,122,142,0.35)]"
      style={{ borderLeft: `3px solid ${rel.color}` }}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl leading-none">{rel.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-[15px] font-medium text-text-primary">{rel.name}</h3>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: rarity.bgColor, color: rarity.color }}
            >
              {rarity.label}
            </span>
            {record.compatibility !== undefined && (
              <span className="text-[11px] font-mono text-text-muted">
                {record.compatibility}/100
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-text-muted">
            {me?.name ?? '我'} × {them?.name ?? record.partnerNickname ?? 'ta'} · {created}
            {record.reTestCount > 0 && ` · 已重测 ${record.reTestCount} 次`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Link
            href={`/cpti/relationship/${rel.slug}/`}
            className="rounded-md border border-gold/40 px-2 py-1 text-[11px] text-text-secondary hover:bg-gold/10"
          >
            查看
          </Link>
          <button
            onClick={editing ? onEditEnd : onEditStart}
            className="rounded-md border border-gold/40 px-2 py-1 text-[11px] text-text-secondary hover:bg-gold/10"
          >
            {editing ? '收起' : '编辑'}
          </button>
        </div>
      </div>

      {(record.partnerNickname || record.note) && !editing && (
        <div className="mt-3 border-t border-border-subtle pt-3 text-[13px] leading-[1.7]">
          {record.partnerNickname && (
            <p className="text-text-primary">
              <span className="text-text-muted">昵称：</span>{record.partnerNickname}
            </p>
          )}
          {record.note && (
            <p className="mt-1 text-text-secondary">
              <span className="text-text-muted">备注：</span>{record.note}
            </p>
          )}
        </div>
      )}

      {editing && (
        <div className="mt-3 space-y-3 border-t border-border-subtle pt-3">
          <label className="block text-[12px] text-text-secondary">
            ta 的昵称
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={24}
              placeholder="给 ta 起个名字"
              className="mt-1 block w-full rounded-md border border-gold/40 bg-bg-elevated px-3 py-2 text-[13px] text-text-primary outline-none focus:border-gold"
            />
          </label>
          <label className="block text-[12px] text-text-secondary">
            备注
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={140}
              rows={2}
              placeholder="一句话记下这段关系的当下"
              className="mt-1 block w-full rounded-md border border-gold/40 bg-bg-elevated px-3 py-2 text-[13px] text-text-primary outline-none focus:border-gold"
            />
          </label>
          <label className="block text-[12px] text-text-secondary">
            分类
            <select
              value={scenario}
              onChange={e => setScenario(e.target.value as CodexScenarioBucket)}
              className="mt-1 block w-full rounded-md border border-gold/40 bg-bg-elevated px-3 py-2 text-[13px] text-text-primary outline-none focus:border-gold"
            >
              {CODEX_SCENARIO_ORDER.map(s => (
                <option key={s} value={s}>{CODEX_SCENARIO_LABELS[s].label}</option>
              ))}
            </select>
          </label>
          <div className="flex justify-between gap-2">
            <button
              onClick={onDelete}
              className="rounded-md px-3 py-1.5 text-[12px] text-ember hover:bg-accent-dim"
            >
              删除
            </button>
            <div className="flex gap-2">
              <button
                onClick={onEditEnd}
                className="rounded-md border border-gold/40 px-3 py-1.5 text-[12px] text-text-secondary"
              >
                取消
              </button>
              <button
                onClick={() => { onUpdate({ partnerNickname: nickname.trim(), note: note.trim(), scenario }); onEditEnd(); }}
                className="rounded-md bg-text-primary px-3 py-1.5 text-[12px] text-bg-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
