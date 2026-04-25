'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  analyzeCptiSquad,
  decodeCptiSquad,
  encodeCptiSquad,
  listSelectablePersonalities,
  type CptiSquadAnalysis,
  type CptiSquadMember,
} from '@/lib/cpti/squad';
import { isUnlocked } from '@/lib/mysti/unlock';
import {
  isSubscriber,
  passCoversSingleSku,
  syncSubscriptionFromServer,
} from '@/lib/mysti/subscription';
import { restoreMystiEntitlement } from '@/lib/mysti/entitlement-restore';

const MIN = 4;
const MAX = 4;

type SquadEvent =
  | 'cpti_squad_created'
  | 'cpti_squad_joined'
  | 'cpti_squad_purchased'
  | 'cpti_squad_share_link_copied'
  | 'cpti_squad_paywall_view';

function emptyMember(): CptiSquadMember { return { slug: '', nickname: '' }; }

function readInitialSquadState(): {
  members: CptiSquadMember[];
  analysis: CptiSquadAnalysis | null;
  joinedSize: number;
} {
  if (typeof window === 'undefined') {
    return {
      members: [emptyMember(), emptyMember(), emptyMember(), emptyMember()],
      analysis: null,
      joinedSize: 0,
    };
  }

  const decoded = decodeCptiSquad(new URLSearchParams(window.location.search));
  const padded = [...decoded];
  while (padded.length < 4) padded.push(emptyMember());
  const normalized = padded.slice(0, MAX);
  return {
    members: normalized,
    analysis: normalized.filter((member) => member.slug).length === MAX ? analyzeCptiSquad(normalized) : null,
    joinedSize: Math.min(decoded.length, MAX),
  };
}

function trackSquad(name: SquadEvent, props: Record<string, unknown> = {}): void {
  import('@/lib/cpti/analytics').then(({ trackCptiEvent }) => {
    trackCptiEvent(name, props);
  }).catch(() => {});
}

export default function CptiSquadClient() {
  const personalities = useMemo(() => listSelectablePersonalities(), []);
  const [initialState] = useState(() => readInitialSquadState());
  const [members, setMembers] = useState<CptiSquadMember[]>(initialState.members);
  const [analysis, setAnalysis] = useState<CptiSquadAnalysis | null>(initialState.analysis);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (initialState.joinedSize >= MIN) {
      trackSquad('cpti_squad_joined', { size: initialState.joinedSize });
    }
  }, [initialState.joinedSize]);

  // unlock check
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await syncSubscriptionFromServer({ force: true });
        const ok =
          isUnlocked('cpti-squad-pack', 'cpti-squad') ||
          (await restoreMystiEntitlement({
            sku: 'cpti-squad-pack',
            resourceId: 'cpti-squad',
          })).restored ||
          (isSubscriber() && passCoversSingleSku('cpti-squad-pack'));
        if (alive) setUnlocked(ok);
      } catch { /* noop */ }
    })();
    return () => { alive = false; };
  }, []);

  const filled = members.filter(m => m.slug);
  const canAnalyze = filled.length === MAX;

  function setSlot(idx: number, patch: Partial<CptiSquadMember>): void {
    setMembers(prev => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  }

  function addSlot(): void { if (members.length < MAX) setMembers(prev => [...prev, emptyMember()]); }
  function removeSlot(idx: number): void { setMembers(prev => prev.filter((_, i) => i !== idx)); }

  function runAnalysis(): void {
    const a = analyzeCptiSquad(filled);
    setAnalysis(a);
    if (a) {
      trackSquad('cpti_squad_created', { size: filled.length, vibe: a.aggregate.code });
      // sync URL for share
      const qs = encodeCptiSquad(filled);
      const next = `${window.location.pathname}?${qs}`;
      window.history.replaceState(null, '', next);
    }
  }

  function copyShareLink(): void {
    const qs = encodeCptiSquad(filled);
    const url = `${window.location.origin}${window.location.pathname}?${qs}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    trackSquad('cpti_squad_share_link_copied', { size: filled.length });
  }

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-3">
          <p className="text-xs tracking-[0.4em] text-amber-300/70 uppercase">CPTI · Squad</p>
          <h1 className="text-3xl md:text-4xl font-display">闺蜜组：4 个人，6 段关系</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            把你那群&ldquo;互相吐槽但谁也离不开谁&rdquo;的人拉进来。我们会算 6 段两两关系，还会给你们的组合贴一个标签：
            混沌四人组 / 人间妈妈团 / 黏黏胶水组…
          </p>
        </header>

        {/* 选择面板 */}
        <section className="space-y-4 p-5 rounded-2xl border border-border bg-bg-secondary/30">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">挑出 {MAX} 个人</h2>
            <span className="text-xs text-text-muted">已选 {filled.length} / {MAX}</span>
          </div>

          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border/60 bg-bg-primary/40">
                <select
                  value={m.slug}
                  onChange={(e) => setSlot(i, { slug: e.target.value })}
                  className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-bg-primary border border-border text-sm"
                >
                  <option value="">— 选个人格 —</option>
                  {personalities.map(p => (
                    <option key={p.slug} value={p.slug}>{p.emoji} {p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={m.nickname}
                  placeholder="昵称（可选）"
                  maxLength={12}
                  onChange={(e) => setSlot(i, { nickname: e.target.value })}
                  className="w-32 px-3 py-2 rounded-lg bg-bg-primary border border-border text-sm"
                />
                {members.length > MIN && (
                  <button onClick={() => removeSlot(i)} className="text-xs text-text-muted hover:text-rose-400">×</button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {members.length < MAX && (
              <button onClick={addSlot} className="px-3 py-2 rounded-lg border border-border text-xs text-text-secondary hover:bg-bg-secondary/60">
                + 再加一个
              </button>
            )}
            <button
              onClick={runAnalysis}
              disabled={!canAnalyze}
              className="px-4 py-2 rounded-lg bg-accent/90 hover:bg-accent text-bg-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              分析这群人
            </button>
          </div>
        </section>

        {/* 结果 */}
        {analysis && (
          <section className="space-y-6">
            {/* aggregate card */}
            <article className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-transparent space-y-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-display">{analysis.aggregate.vibeLabel}</h3>
                <span className="font-mono text-xs text-amber-300/80">{analysis.aggregate.code}</span>
              </div>
              <p className="text-sm text-text-secondary italic">{analysis.aggregate.tagline}</p>

              <div className="grid grid-cols-5 gap-2 pt-2">
                {analysis.aggregate.dimensions.map(d => (
                  <div key={d.id} className="text-center space-y-1">
                    <div className="text-[10px] text-text-muted">{d.label}</div>
                    <div className="text-base font-mono text-amber-200">{d.score}</div>
                    <div className="h-1 rounded-full bg-bg-secondary overflow-hidden">
                      <div className="h-full bg-amber-400/80" style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-text-secondary">
                平均匹配度 <span className="font-mono text-amber-200">{analysis.averageCompatibility}</span> ·
                共 <span className="font-mono">{analysis.pairs.length}</span> 段关系
              </div>
            </article>

            {/* highlights */}
            {analysis.highlights.length > 0 && (
              <article className="p-5 rounded-2xl border border-border bg-bg-secondary/30 space-y-3">
                <h4 className="text-sm font-medium tracking-widest uppercase text-text-muted">谁是谁</h4>
                <ul className="space-y-2">
                  {analysis.highlights.map(h => (
                    <li key={h.role} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-rose-300">{h.role}</span>
                      <span className="text-text-primary">{h.memberNickname}</span>
                      <span className="flex-1 text-xs text-text-muted text-right">{h.basis}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* pairs grid */}
            <article className="space-y-3">
              <h4 className="text-sm font-medium tracking-widest uppercase text-text-muted">6 段两两关系</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {analysis.pairs.map((p, i) => (
                  <Link
                    key={i}
                    href={`/cpti/relationship/${p.relationship.slug}/`}
                    className="group p-4 rounded-xl border border-border hover:border-rose-500/40 bg-bg-secondary/30 hover:bg-bg-secondary/50 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{p.nicknameA} <span className="text-text-primary">×</span> {p.nicknameB}</span>
                      <span className="font-mono">{p.compatibility}</span>
                    </div>
                    <div className="text-base font-display group-hover:text-rose-300 transition-colors">
                      {p.relationship.name}
                    </div>
                    <div className="text-[11px] text-amber-300/70">{p.rarityLabel}</div>
                  </Link>
                ))}
              </div>
            </article>

            {/* paywall / share */}
            <article className="p-5 rounded-2xl border border-border bg-bg-secondary/30 space-y-3">
              {unlocked ? (
                <>
                  <h4 className="text-sm font-medium">分享给你这群人</h4>
                  <button
                    onClick={copyShareLink}
                    className="w-full py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300 hover:bg-rose-500/15"
                  >
                    📋 复制带组合的专属链接
                  </button>
                  <p className="text-[11px] text-text-muted">链接里包含每个人的人格选择，对方点开就能看到完整 6 段关系。</p>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-medium">解锁完整闺蜜组报告</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    免费版可以看 6 段关系名 + 组合标签。¥39 解锁后会得到：每段关系完整解读卡、PDF 一键导出、群里@分享专属链接、组合人格金箔限定卡。
                  </p>
                  <Link
                    href="/cpti/pricing/?intent=squad"
                    onClick={() => trackSquad('cpti_squad_paywall_view', { size: filled.length })}
                    className="block w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-bg-primary text-sm text-center font-medium hover:opacity-90"
                  >
                    ¥39 解锁完整报告 →
                  </Link>
                </>
              )}
            </article>
          </section>
        )}

        <footer className="pt-8 text-xs text-text-muted text-center">
          CPTI · 关系性格 · v2.0 Squad Mode
        </footer>
      </div>
    </main>
  );
}
