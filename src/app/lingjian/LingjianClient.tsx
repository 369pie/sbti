'use client';

/**
 * 灵笺 · 人生档案 — 跨模块聚合 v0
 *
 * 章节 I  我是谁    — WTFTI 主神（取自 wtf-card.results.wtfti）
 * 章节 II 我如何出现 — 灵镜形象档案（取自 mirror-history + wtf-card.mirrorResults）
 * 章节 III 我如何选择 — 灵鉴决策快卡 + 命书（取自 mysti-decision-log + mysti-destiny-archive）
 * 章节 IV 我如何相遇 — 关系合盘（取自 mysti-dual-archive）
 * 章节 V 我的资产 — Ling-Bi + 已购记录（取自 ling-bi-ledger-v1）
 *
 * MVP 阶段：纯客户端 localStorage 聚合，不做服务端持久化。
 * Q2 升级：拉通 Supabase 用户身份，支持跨设备同步。
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/components/AuthProvider';
import {
  buildLingjianSyncEntries,
  EMPTY_DATA,
  loadLingjianAggregateData,
  type AggregateData,
  type LingjianEntryType,
} from '@/lib/lingjian/codex';
import { DECISION_SCENARIOS } from '@/lib/mysti/decision-quotes';
import type { LedgerEntry, Wallet } from '@/lib/wallet/ling-bi';
import { getWtftiPersonality } from '@/lib/wtfti-personalities';

type SyncState = 'idle' | 'syncing' | 'synced' | 'failed';

interface CloudStats {
  count: number;
  latestSyncedAt: string | null;
}

interface CloudEntry {
  id: string;
  client_entry_id: string;
  entry_type: LingjianEntryType;
  title: string;
  summary: string;
  source_created_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CloudResponse {
  count?: number;
  latestSyncedAt?: string | null;
  entries?: CloudEntry[];
}

interface CloudBuckets {
  profile: CloudEntry[];
  mirror: CloudEntry[];
  mysti: CloudEntry[];
  dual: CloudEntry[];
  wallet: CloudEntry[];
}

interface ServerWalletSnapshot {
  wallet: Wallet;
  ledger: LedgerEntry[];
  source: 'server';
}

export default function LingjianClient() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState<AggregateData>(EMPTY_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [cloudStats, setCloudStats] = useState<CloudStats | null>(null);
  const [cloudEntries, setCloudEntries] = useState<CloudEntry[]>([]);
  const [serverWallet, setServerWallet] = useState<ServerWalletSnapshot | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadLingjianAggregateData());
    setHydrated(true);
  }, []);

  const refreshCloudEntries = useCallback(async (): Promise<CloudResponse | null> => {
    const res = await fetch('/api/lingjian/sync/?limit=100', { cache: 'no-store' });
    if (!res.ok) return null;

    const payload = (await res.json()) as CloudResponse;
    const entries = payload.entries ?? [];
    setCloudStats({
      count: payload.count ?? entries.length,
      latestSyncedAt: payload.latestSyncedAt ?? entries[0]?.updated_at ?? null,
    });
    setCloudEntries(entries);
    return payload;
  }, []);

  const refreshServerWallet = useCallback(async (): Promise<void> => {
    const res = await fetch('/api/wallet/ling-bi/?limit=20', { cache: 'no-store' });
    if (!res.ok) return;

    const payload = (await res.json()) as {
      ok?: boolean;
      wallet?: Wallet;
      ledger?: LedgerEntry[];
      source?: 'server';
    };
    if (!payload.ok || !payload.wallet || !payload.ledger) return;

    setServerWallet({
      wallet: payload.wallet,
      ledger: payload.ledger,
      source: 'server',
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      const handle = window.setTimeout(() => {
        setCloudStats(null);
        setCloudEntries([]);
        setServerWallet(null);
      }, 0);
      return () => window.clearTimeout(handle);
    }

    const handle = window.setTimeout(() => {
      void refreshCloudEntries().catch(() => {});
      void refreshServerWallet().catch(() => {});
    }, 0);
    return () => window.clearTimeout(handle);
  }, [hydrated, isAuthenticated, refreshCloudEntries, refreshServerWallet]);

  const mainPersonality = useMemo(() => {
    const slug = data.wtfCard?.results?.wtfti?.slug;
    return slug ? getWtftiPersonality(slug) : null;
  }, [data.wtfCard]);

  const syncEntries = useMemo(() => buildLingjianSyncEntries(data), [data]);
  const localClientIds = useMemo(
    () => new Set(syncEntries.map((entry) => entry.clientEntryId)),
    [syncEntries],
  );
  const cloudOnlyEntries = useMemo(
    () => cloudEntries.filter((entry) => !localClientIds.has(entry.client_entry_id)),
    [cloudEntries, localClientIds],
  );
  const cloudBuckets = useMemo(() => bucketCloudEntries(cloudOnlyEntries), [cloudOnlyEntries]);
  const totalEntries =
    data.mirrorHistory.length +
    data.decisionArchive.length +
    data.destinyArchive.length +
    data.dualArchive.length +
    cloudOnlyEntries.filter((entry) => entry.entry_type !== 'wallet_ledger' && entry.entry_type !== 'wtfti_profile')
      .length;

  async function handleSync() {
    if (!hydrated || syncState === 'syncing') return;

    if (!isAuthenticated) {
      setSyncState('failed');
      setSyncMessage('登录正式账号后，可把本机灵笺同步到云端。');
      return;
    }

    if (syncEntries.length === 0) {
      setSyncState('failed');
      setSyncMessage('当前没有可同步的灵笺档案。');
      return;
    }

    setSyncState('syncing');
    setSyncMessage(null);

    try {
      const postSync = async () => {
        const res = await fetch('/api/lingjian/sync/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: syncEntries }),
        });
        const payload = (await res.json()) as {
          synced?: number;
          syncedAt?: string;
          skipped?: number;
          error?: string;
          needsClaimedAccount?: boolean;
        };
        return { res, payload };
      };

      let { res, payload } = await postSync();
      if (res.status === 401) {
        await refreshCloudEntries().catch(() => null);
        ({ res, payload } = await postSync());
      }

      const typedPayload = payload as {
        synced?: number;
        syncedAt?: string;
        skipped?: number;
        error?: string;
        needsClaimedAccount?: boolean;
      };

      if (!res.ok) {
        setSyncState('failed');
        setSyncMessage(
          typedPayload.needsClaimedAccount ? '匿名体验账号暂不支持云同步，请先绑定邮箱。' : typedPayload.error ?? '同步失败',
        );
        return;
      }

      const syncedAt = typedPayload.syncedAt ?? new Date().toISOString();
      setCloudStats((prev) => ({
        count: Math.max(prev?.count ?? 0, syncEntries.length),
        latestSyncedAt: syncedAt,
      }));
      await refreshCloudEntries().catch(() => null);
      await refreshServerWallet().catch(() => null);
      setSyncState('synced');
      setSyncMessage(`已同步 ${typedPayload.synced ?? syncEntries.length} 条灵笺档案`);
    } catch {
      setSyncState('failed');
      setSyncMessage('网络异常，同步稍后再试。');
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 130% 60% at 50% 0%, #2d1e52 0%, #1a1530 45%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 96px' }}>
        {/* ── Back ── */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            href="/wtfti/"
            style={{
              fontSize: 12,
              color: 'rgba(245,240,232,0.55)',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ← WTFTI
          </Link>
          {hydrated ? (
            <span
              style={{
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                color: '#C9A676',
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(201,166,118,0.12)',
                border: '1px solid rgba(201,166,118,0.3)',
              }}
            >
              ✦ 灵币余额 {data.lingBiBalance}
            </span>
          ) : null}
        </div>

        {/* ── Cover ── */}
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.42em',
              color: 'rgba(201,166,118,0.85)',
              textTransform: 'uppercase',
              margin: '0 0 14px',
            }}
          >
            Lingjian · Life Codex · WTFTI
          </p>
          <h1
            style={{
              margin: '0 0 16px',
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: '0.04em',
              lineHeight: 1.15,
              background: 'linear-gradient(135deg, #F5F0E8 30%, #C9A676 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            灵笺 · 人生档案
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(245,240,232,0.65)', lineHeight: 1.75 }}>
            主神 · 形象 · 选择 · 关系 · 资产<br />
            一本书，缮写五章人生
          </p>
          {hydrated && totalEntries > 0 ? (
            <p
              style={{
                margin: '14px 0 0',
                fontSize: 12,
                color: 'rgba(245,240,232,0.45)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.08em',
              }}
            >
              已收录 {totalEntries} 条印记
            </p>
          ) : null}
        </header>

        <SyncPanel
          localCount={syncEntries.length}
          cloudStats={cloudStats}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          syncState={syncState}
          syncMessage={syncMessage}
          onSync={handleSync}
        />

        {/* ── Chapter I: WTFTI 主神 ── */}
        <ChapterCard
          eyebrow="I"
          title="我是谁 · 主神"
          subtitle="WTFTI 多宇宙人格档案"
          actionLabel={mainPersonality ? '查看完整档案 →' : '去做测试 →'}
          actionHref={mainPersonality ? '/wtfti/profile/' : '/wtfti/'}
        >
          {!hydrated ? (
            <Skeleton lines={2} />
          ) : mainPersonality ? (
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 22,
                  fontWeight: 500,
                  color: '#C9A676',
                  letterSpacing: '0.04em',
                }}
              >
                {mainPersonality.wtftiName}
              </p>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13,
                  color: 'rgba(245,240,232,0.7)',
                  lineHeight: 1.7,
                }}
              >
                {mainPersonality.tagline ?? mainPersonality.copy?.wtfHit ?? '你的主神已就位'}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link href="/mirror/" style={cta()}>去灵镜见 TA 的样子</Link>
                <Link href="/mysti/destiny/" style={cta('subtle')}>去灵鉴见 TA 的命</Link>
              </div>
            </div>
          ) : cloudBuckets.profile.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <CloudArchiveRows rows={cloudBuckets.profile} limit={1} />
              <p style={{ ...listMeta, marginTop: 2 }}>
                这是从云端补回的主神档案摘要；本机重新完成 WTFTI 后会恢复完整交互。
              </p>
            </div>
          ) : (
            <EmptyState
              text="还没有主神档案。先做一次 WTFTI 测试，主神揭晓后，本书才能开始缮写。"
              ctaText="开始测试"
              ctaHref="/wtfti/"
            />
          )}
        </ChapterCard>

        {/* ── Chapter II: 灵镜 形象档案 ── */}
        <ChapterCard
          eyebrow="II"
          title="我如何出现 · 灵镜"
          subtitle="形象档案馆 · 色彩 / 妆发 / 穿搭"
          actionLabel="去灵镜 →"
          actionHref="/mirror/"
        >
          {!hydrated ? (
            <Skeleton lines={3} />
          ) : data.mirrorHistory.length === 0 && cloudBuckets.mirror.length === 0 ? (
            <EmptyState
              text="还没有形象档案。¥1/张单图体验 · ¥19.9 三页诊断卡（色彩+妆发+穿搭）。"
              ctaText="上传一张照片"
              ctaHref="/mirror/"
            />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {data.mirrorHistory.slice(0, 5).map((m) => (
                <div key={m.id} style={listRow}>
                  <span style={listMeta}>
                    {modeBadge(m.mode)} {fmtDate(m.timestamp)}
                  </span>
                  <p style={listClaim}>{m.summary || '（无摘要）'}</p>
                </div>
              ))}
              {data.mirrorHistory.length > 5 ? (
                <p style={{ ...listMeta, textAlign: 'right', margin: '4px 0 0' }}>
                  共 {data.mirrorHistory.length} 条 · 仅展示最近 5 条
                </p>
              ) : null}
              <CloudArchiveRows rows={cloudBuckets.mirror} />
            </div>
          )}
        </ChapterCard>

        {/* ── Chapter III: 灵鉴 选择档案 ── */}
        <ChapterCard
          eyebrow="III"
          title="我如何选择 · 灵鉴"
          subtitle="问心档案 · 决策快卡 / 命书 / 每日牌"
          actionLabel="去问一件事 →"
          actionHref="/mysti/decision/"
        >
          {!hydrated ? (
            <Skeleton lines={3} />
          ) : data.decisionArchive.length === 0 && data.destinyArchive.length === 0 && cloudBuckets.mysti.length === 0 ? (
            <EmptyState
              text="还没有选择档案。先让灵鉴替你问一件今晚正在心里盘旋的事。"
              ctaText="进入 90 秒决策快卡"
              ctaHref="/mysti/decision/"
            />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {data.decisionArchive.slice(0, 4).map((entry) => (
                <div key={entry.id} style={listRow}>
                  <span style={listMeta}>
                    {decisionLabel(entry.scenario)} · {stanceLabel(entry.stance)} · {fmtDate(Date.parse(entry.createdAt))}
                  </span>
                  <p style={listClaim}>“{entry.quote}”</p>
                </div>
              ))}
              {data.destinyArchive.slice(0, 3).map((entry) => (
                <div key={entry.id} style={listRow}>
                  <span style={listMeta}>
                    命书馆 · {entry.inputSummary.solarDate} · {entry.inputSummary.birthplace} ·{' '}
                    {entry.inputSummary.gender === 'female' ? '女命' : '男命'}
                  </span>
                  <p style={listClaim}>{entry.report.blindReading?.summary?.slice(0, 80) || '盲断已生成'}</p>
                  <p style={{ ...listMeta, marginTop: 4 }}>
                    四柱：{entry.report.chart?.fourPillars} · {fmtDate(entry.recordedAt)}
                    {entry.report.meta?.stub ? ' · 演示数据' : ''}
                  </p>
                </div>
              ))}
              {data.decisionArchive.length + data.destinyArchive.length > 7 ? (
                <p style={{ ...listMeta, textAlign: 'right', margin: '4px 0 0' }}>
                  共 {data.decisionArchive.length + data.destinyArchive.length} 条 · 仅展示最近 7 条
                </p>
              ) : null}
              <CloudArchiveRows rows={cloudBuckets.mysti} limit={7} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Link href="/mysti/destiny/" style={cta('subtle')}>去命书馆</Link>
                <Link href="/mysti/daily/" style={cta('subtle')}>抽每日一牌</Link>
              </div>
            </div>
          )}
        </ChapterCard>

        {/* ── Chapter IV: 关系合盘 ── */}
        <ChapterCard
          eyebrow="IV"
          title="我如何相遇 · 合盘"
          subtitle="WTFTI 主神 × TA 主神 = 关系原型"
          actionLabel="完整档案 →"
          actionHref="/mysti/archive/"
        >
          {!hydrated ? (
            <Skeleton lines={2} />
          ) : data.dualArchive.length === 0 && cloudBuckets.dual.length === 0 ? (
            <EmptyState
              text="还没有合盘记录。和某个 TA 一起测一次，关系原型会归档于此。"
              ctaText="发起合盘"
              ctaHref="/mysti/"
            />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {data.dualArchive.slice(0, 5).map((d) => (
                <div key={`${d.selfSlug}-${d.partnerSlug}-${d.recordedAt}`} style={listRow}>
                  <span style={listMeta}>
                    {d.archetypeEmoji ?? '✦'} {d.archetypeName ?? '关系合盘'} · {fmtDate(d.recordedAt)}
                  </span>
                  <p style={listClaim}>
                    {getWtftiPersonality(d.selfSlug)?.wtftiName ?? d.selfSlug} ×{' '}
                    {getWtftiPersonality(d.partnerSlug)?.wtftiName ?? d.partnerSlug}
                  </p>
                </div>
              ))}
              {data.dualArchive.length > 5 ? (
                <p style={{ ...listMeta, textAlign: 'right', margin: '4px 0 0' }}>
                  共 {data.dualArchive.length} 段 · 仅展示最近 5 段
                </p>
              ) : null}
              <CloudArchiveRows rows={cloudBuckets.dual} />
            </div>
          )}
        </ChapterCard>

        {/* ── Chapter V: 资产 ── */}
        <ChapterCard
          eyebrow="V"
          title="我的资产 · 灵币"
          subtitle="Ling-Bi · 通用余额 / 消费记录 / 已购档案"
          actionLabel="去灵镜 →"
          actionHref="/mirror/"
        >
          {!hydrated ? (
            <Skeleton lines={2} />
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div
                style={{
                  padding: '18px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(201,166,118,0.22)',
                  background:
                    'linear-gradient(135deg, rgba(201,166,118,0.12), rgba(192,122,142,0.08))',
                }}
              >
                <p style={{ ...listMeta, marginBottom: 8 }}>可用 Ling-Bi</p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 34,
                    color: '#C9A676',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                  }}
                >
                  {data.lingBiBalance}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(245,240,232,0.55)', lineHeight: 1.7 }}>
                  灵镜单图 1 灵币 · 三页诊断卡 20 灵币 · 命书馆单次 39 灵币
                </p>
              </div>

              {serverWallet ? (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(201,166,118,0.18)',
                    background: 'rgba(201,166,118,0.055)',
                  }}
                >
                  <p style={{ ...listMeta, marginBottom: 8 }}>云端 Ling-Bi</p>
                  <p style={{ margin: 0, fontSize: 18, color: '#C9A676' }}>
                    {serverWallet.wallet.balance} 灵币
                    <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(245,240,232,0.45)' }}>
                      累计入账 {serverWallet.wallet.totalEarned} · 累计消费 {serverWallet.wallet.totalSpent}
                    </span>
                  </p>
                  {serverWallet.ledger.length > 0 ? (
                    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                      {serverWallet.ledger.slice(0, 3).map((entry) => (
                        <div key={entry.id} style={{ ...listMeta, margin: 0 }}>
                          {entry.delta > 0 ? '+' : ''}{entry.delta} · {entry.source} · 余额 {entry.balanceAfter}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {data.ledger.length > 0 || cloudBuckets.wallet.length > 0 ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {data.ledger.slice(0, 4).map((entry) => (
                    <div key={entry.id} style={listRow}>
                      <span style={listMeta}>
                        {entry.delta > 0 ? '入账' : '消费'} · {entry.source} · {fmtDate(entry.timestamp)}
                      </span>
                      <p style={listClaim}>
                        {entry.delta > 0 ? '+' : ''}{entry.delta} 灵币
                        <span style={{ color: 'rgba(245,240,232,0.45)' }}>
                          {' '}· 余额 {entry.balanceAfter}
                        </span>
                      </p>
                    </div>
                  ))}
                  <CloudArchiveRows rows={cloudBuckets.wallet} limit={4} />
                </div>
              ) : (
                <EmptyState
                  text="还没有灵币流水。新用户欢迎灵币会在首次打开钱包时自动生成。"
                  ctaText="去灵镜生成第一份档案"
                  ctaHref="/mirror/"
                />
              )}
            </div>
          )}
        </ChapterCard>

        {/* ── Footer ── */}
        <footer
          style={{
            marginTop: 32,
            padding: 16,
            borderRadius: 12,
            border: '1px dashed rgba(245,240,232,0.12)',
            fontSize: 11,
            color: 'rgba(245,240,232,0.4)',
            textAlign: 'center',
            lineHeight: 1.7,
          }}
        >
          灵笺 v1 · 本机优先，登录后可同步云端 ·{' '}
          <Link href="/wtfti/" style={{ color: 'rgba(201,166,118,0.7)' }}>
            返回 WTFTI
          </Link>
        </footer>
      </div>
    </main>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function bucketCloudEntries(entries: CloudEntry[]): CloudBuckets {
  return {
    profile: entries.filter((entry) => entry.entry_type === 'wtfti_profile'),
    mirror: entries.filter((entry) => entry.entry_type === 'mirror_report'),
    mysti: entries.filter((entry) => entry.entry_type === 'mysti_decision' || entry.entry_type === 'mysti_destiny'),
    dual: entries.filter((entry) => entry.entry_type === 'mysti_dual'),
    wallet: entries.filter((entry) => entry.entry_type === 'wallet_ledger'),
  };
}

function CloudArchiveRows({ rows, limit = 5 }: { rows: CloudEntry[]; limit?: number }) {
  if (rows.length === 0) return null;

  return (
    <>
      {rows.slice(0, limit).map((row) => (
        <div key={row.id} style={cloudRow}>
          <span style={listMeta}>
            {cloudTypeLabel(row.entry_type)} · 云端 · {formatCloudDate(row.source_created_at ?? row.updated_at)}
          </span>
          <p style={listClaim}>{row.title || '灵笺档案'}</p>
          {row.summary && row.summary !== row.title ? (
            <p style={{ ...listMeta, margin: '4px 0 0', lineHeight: 1.55 }}>{row.summary}</p>
          ) : null}
        </div>
      ))}
      {rows.length > limit ? (
        <p style={{ ...listMeta, textAlign: 'right', margin: '4px 0 0' }}>
          云端另有 {rows.length - limit} 条
        </p>
      ) : null}
    </>
  );
}

function SyncPanel({
  localCount,
  cloudStats,
  isAuthenticated,
  authLoading,
  syncState,
  syncMessage,
  onSync,
}: {
  localCount: number;
  cloudStats: CloudStats | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  syncState: SyncState;
  syncMessage: string | null;
  onSync: () => void;
}) {
  return (
    <section
      style={{
        margin: '0 0 24px',
        padding: 16,
        borderRadius: 12,
        border: '1px solid rgba(201,166,118,0.18)',
        background: 'rgba(245,240,232,0.035)',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...listMeta, marginBottom: 6 }}>Life Codex Sync</p>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,240,232,0.78)', lineHeight: 1.65 }}>
            本机 {localCount} 条
            {cloudStats ? ` · 云端 ${cloudStats.count} 条` : ''}
            {cloudStats?.latestSyncedAt ? ` · ${formatSyncTime(cloudStats.latestSyncedAt)} 更新` : ''}
          </p>
          {syncMessage ? (
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 12,
                color: syncState === 'failed' ? '#E8A0BF' : 'rgba(201,166,118,0.86)',
                lineHeight: 1.6,
              }}
            >
              {syncMessage}
            </p>
          ) : null}
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={onSync}
            disabled={authLoading || syncState === 'syncing'}
            style={{
              ...buttonCta(),
              opacity: authLoading || syncState === 'syncing' ? 0.6 : 1,
              cursor: authLoading || syncState === 'syncing' ? 'wait' : 'pointer',
            }}
          >
            {syncState === 'syncing' ? '同步中' : '同步'}
          </button>
        ) : (
          <Link href="/auth/login/" style={cta('subtle')}>
            登录同步
          </Link>
        )}
      </div>
    </section>
  );
}

function ChapterCard({
  eyebrow,
  title,
  subtitle,
  children,
  actionLabel,
  actionHref,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <section
      style={{
        marginBottom: 22,
        padding: 22,
        borderRadius: 16,
        border: '1px solid rgba(201,166,118,0.18)',
        background: 'rgba(245,240,232,0.04)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid rgba(201,166,118,0.5)',
            color: '#C9A676',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Cormorant Garamond, serif',
            flexShrink: 0,
          }}
        >
          {eyebrow}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              margin: '0 0 2px',
              fontSize: 18,
              fontWeight: 500,
              color: '#F5F0E8',
              letterSpacing: '0.03em',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: 'rgba(245,240,232,0.5)',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.06em',
            }}
          >
            {subtitle}
          </p>
        </div>
        <Link href={actionHref} style={cta('subtle')}>
          {actionLabel}
        </Link>
      </header>
      <div>{children}</div>
    </section>
  );
}

function EmptyState({
  text,
  ctaText,
  ctaHref,
}: {
  text: string;
  ctaText: string;
  ctaHref: string;
}) {
  return (
    <div
      style={{
        padding: '20px 16px',
        borderRadius: 10,
        background: 'rgba(245,240,232,0.02)',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(245,240,232,0.6)', lineHeight: 1.7 }}>
        {text}
      </p>
      <Link href={ctaHref} style={cta()}>
        {ctaText}
      </Link>
    </div>
  );
}

function Skeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: 4,
            background: 'rgba(245,240,232,0.06)',
            width: `${80 - i * 10}%`,
          }}
        />
      ))}
    </div>
  );
}

function cta(variant: 'primary' | 'subtle' = 'primary'): React.CSSProperties {
  if (variant === 'subtle') {
    return {
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: 999,
      border: '1px solid rgba(245,240,232,0.18)',
      background: 'transparent',
      color: 'rgba(245,240,232,0.75)',
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      letterSpacing: '0.06em',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
    };
  }
  return {
    display: 'inline-block',
    padding: '8px 18px',
    borderRadius: 999,
    background: 'linear-gradient(135deg, #C9A676, #C07A8E)',
    color: '#1a1530',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.06em',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(201,166,118,0.2)',
    whiteSpace: 'nowrap',
  };
}

function buttonCta(): React.CSSProperties {
  return {
    border: 'none',
    borderRadius: 999,
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #C9A676, #C07A8E)',
    color: '#1a1530',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  };
}

const listRow: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 10,
  background: 'rgba(245,240,232,0.03)',
  border: '1px solid rgba(245,240,232,0.06)',
};

const cloudRow: React.CSSProperties = {
  ...listRow,
  background: 'rgba(201,166,118,0.055)',
  border: '1px solid rgba(201,166,118,0.16)',
};

const listMeta: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'rgba(245,240,232,0.45)',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.05em',
  marginBottom: 4,
};

const listClaim: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#F5F0E8',
  lineHeight: 1.7,
};

function modeBadge(mode: string): string {
  switch (mode) {
    case 'beauty':
      return '✿ 变美';
    case 'fortune':
      return '旧命纹记录';
    case 'color':
      return '🎨 色彩';
    case 'compare':
      return '⚡ 对比';
    default:
      return '✧ 灵镜';
  }
}

function decisionLabel(scenario: string): string {
  return DECISION_SCENARIOS.find(item => item.id === scenario)?.label ?? '灵鉴决策';
}

function stanceLabel(stance: string): string {
  switch (stance) {
    case 'go':
      return '宜行';
    case 'wait':
      return '宜静';
    case 'flow':
      return '宜随';
    default:
      return '暮光';
  }
}

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  } catch {
    return '';
  }
}

function formatSyncTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '刚刚';
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

function formatCloudDate(value: string | null): string {
  if (!value) return '未记录';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未记录';
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

function cloudTypeLabel(type: LingjianEntryType): string {
  switch (type) {
    case 'wtfti_profile':
      return '主神';
    case 'mirror_report':
      return '灵镜';
    case 'mysti_decision':
      return '问心';
    case 'mysti_destiny':
      return '命书馆';
    case 'mysti_dual':
      return '合盘';
    case 'wallet_ledger':
      return '灵币';
    default:
      return '灵笺';
  }
}
