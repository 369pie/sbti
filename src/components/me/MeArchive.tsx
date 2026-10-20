'use client';

/**
 * 「我」· 匿名档案 (audit 2026-10-20 Phase 1).
 * Shows the one-tap anonymous archive (PR #12) + finished tests without a login
 * wall. Login / bind account are secondary. Read-only: GET /api/her/archive/.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getApiPath } from '@/lib/api';
import { readLocalTestHistory, type LocalTestRecord } from '@/lib/analytics/test-events';

import styles from './me-archive.module.css';

const TEST_LABEL: Record<string, string> = {
  first_look: '90 秒首测',
  soulti: 'SoulTI',
  xpti: '亲密偏好',
  wohe: '我和他',
  xpti_couple: '我和他',
  cpti: 'CP 角色',
  cpti_peer: '我们的关系',
  cpti_stealth: '暗恋关系',
  classic: '经典 SBTI',
  wtfti: 'WTFTI 人格',
  mysti: '塔罗人格',
  mysti_reading: '塔罗',
};

interface ArchiveGet {
  ok: boolean;
  exists?: boolean;
  isAnonymous?: boolean;
  card?: { fortune: string; luckyColor: { name: string; hex: string; tip: string } };
  archive?: { completenessPct: number; gaps: Array<{ key: string; label: string; href: string }> };
  persona?: { test_id: string; result_key: string; result_name?: string } | null;
  tests?: Array<{ test_id: string; result_key: string; result_name?: string }>;
}

type Row = { test_id: string; result_key: string; result_name?: string; href?: string };

function resultHref(r: Row): string | undefined {
  if (r.href) return r.href;
  if (r.test_id === 'first_look') return `/test/result/${r.result_key}/`;
  if (r.test_id === 'soulti') return `/soulti/result/${r.result_key}/`;
  if (r.test_id === 'xpti') return `/xpti/result/${r.result_key}/`;
  if (r.test_id === 'cpti') return `/cpti/result/${r.result_key}/`;
  return undefined;
}

export function MeArchive({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<ArchiveGet | null>(null);
  const [local, setLocal] = useState<LocalTestRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setLocal(readLocalTestHistory()));
    fetch(getApiPath('/her/archive/'), { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: ArchiveGet | null) => setData(j))
      .catch(() => setData(null))
      .finally(() => setLoaded(true));
  }, []);

  const hasArchive = !!data?.exists;
  const rows: Row[] = [];
  const seen = new Set<string>();
  for (const r of [...(data?.tests ?? []), ...local]) {
    if (seen.has(r.test_id)) continue;
    seen.add(r.test_id);
    rows.push(r);
  }
  const persona = data?.persona ?? rows.find((r) => r.test_id === 'first_look') ?? null;
  const pct = data?.archive?.completenessPct ?? 0;
  const guest = !embedded;

  return (
    <div className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <p className="s-eyebrow">Me · 我</p>
        <h1 className={`s-title ${styles.h1}`}>{hasArchive ? '我的档案' : '这里会是你的档案'}</h1>
        <p className={styles.sub}>
          {hasArchive
            ? data?.isAnonymous
              ? '存在这台设备上，不用注册。想换手机也不丢，可以绑定账号。'
              : '你测过的每一个结果，都会写进这里。'
            : rows.length
              ? '你在这台设备上测过的结果都在这里，一键存进档案就能每天收到今日卡。'
              : '做完任意一个测试，一键就能存下来，不用注册。'}
        </p>

        <section className={`s-card s-card--lined ${styles.card}`}>
          <div className="s-tape" />
          <div className={styles.head}>
            <span className="s-eyebrow">我是谁</span>
            {hasArchive ? <span className={styles.pct}>{pct}%</span> : null}
          </div>
          {hasArchive ? (
            <div className={styles.bar} aria-label={`档案 ${pct}% 完整`}><i style={{ width: `${pct}%` }} /></div>
          ) : null}
          <p className={`s-title ${styles.persona}`}>
            {persona?.result_name ?? (persona ? TEST_LABEL[persona.test_id] ?? '已测' : loaded ? '还没测过' : '…')}
          </p>
          {rows.length > 0 ? (
            <ul className={styles.list}>
              {rows.map((r) => {
                const href = resultHref(r);
                const inner = (
                  <>
                    <span>{TEST_LABEL[r.test_id] ?? r.test_id}</span>
                    <span className={styles.k}>{r.result_name ?? r.result_key} ›</span>
                  </>
                );
                return <li key={r.test_id}>{href ? <Link href={href} prefetch={false}>{inner}</Link> : <span className={styles.row}>{inner}</span>}</li>;
              })}
            </ul>
          ) : null}
          {hasArchive && data?.archive?.gaps?.length ? (
            <div className={styles.gaps}>
              {data.archive.gaps.slice(0, 4).map((g) => (
                <Link key={g.key} href={g.href} prefetch={false}>+ {g.label}</Link>
              ))}
            </div>
          ) : null}
        </section>

        {hasArchive && data?.card ? (
          <section className={`s-card ${styles.card}`}>
            <div className="s-tape s-tape--peach" />
            <span className="s-eyebrow">今日卡</span>
            <p className={`s-title ${styles.today}`}>{data.card.fortune}</p>
          </section>
        ) : null}

        <div className={styles.cta}>
          {hasArchive ? (
            <Link href="/today/" prefetch={false} className="s-btn">打开我的今日卡</Link>
          ) : persona && resultHref(persona) ? (
            <Link href={resultHref(persona)!} prefetch={false} className="s-btn">把这个结果存进档案</Link>
          ) : (
            <Link href="/test/" prefetch={false} className="s-btn">90 秒首测 · 开始建档</Link>
          )}
        </div>

        <div className={styles.links}>
          <Link href="/start/" prefetch={false}>测试大厅</Link>
          <Link href="/bottle/" prefetch={false}>树洞</Link>
          {guest ? (
            <>
              <Link href="/auth/register/?next=%2Fme%2F" prefetch={false}>{hasArchive ? '绑定账号' : '注册'}</Link>
              <Link href="/auth/login/?next=%2Fme%2F" prefetch={false}>已有账号，登录</Link>
            </>
          ) : null}
        </div>
        {guest ? <p className={styles.fine}>仅供娱乐与自我探索</p> : null}
      </div>
    </div>
  );
}
