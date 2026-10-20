'use client';

/**
 * One-tap anonymous archive (PR #12) — v3 journal skin.
 * Pre-save: blurred today-card preview. Save → anon Supabase session →
 * POST /api/her/archive/ with the test result, so the archive holds「我是谁」.
 * After save: real today card + a single next step into /today/.
 */

import Link from 'next/link';
import { useState } from 'react';

import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { getApiPath } from '@/lib/api';
import { markDeviceArchive } from '@/lib/her/device-archive';
import { ensureAnonymousSession } from '@/lib/supabase/auth';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';

import styles from '@/app/test/test-v3.module.css';

interface SavedArchive {
  isAnonymous: boolean;
  card: { fortune: string; luckyColor: { name: string; hex: string; tip: string }; makeup: string };
  archive: { completenessPct: number };
}

export interface ArchiveTestResult {
  test_id: string;
  result_key: string;
  result_name?: string;
}

export function ArchiveSaveCard({ source, result }: { source: string; result?: ArchiveTestResult; accent?: string }) {
  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saved, setSaved] = useState<SavedArchive | null>(null);

  async function save() {
    if (phase === 'saving') return;
    setPhase('saving');
    enqueueProductEvent('home', 'archive_save_click', {
      step: 'archive_click',
      props: { source, test_id: result?.test_id, result_key: result?.result_key },
    });
    try {
      const supabase = tryCreateBrowserSupabaseClient();
      if (!supabase) throw new Error('no_supabase');
      const session = await ensureAnonymousSession(supabase);
      if (!session.success) throw new Error(session.error || 'anon_signin_failed');
      const res = await fetch(getApiPath('/her/archive/'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result ? { test: result } : {}),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'save_failed');
      if (data.created) {
        enqueueProductEvent('home', 'archive_created', {
          step: 'archive',
          props: {
            mode: data.isAnonymous ? 'anonymous' : 'claimed',
            source,
            test_id: result?.test_id,
            result_key: result?.result_key,
          },
        });
      }
      markDeviceArchive();
      setSaved(data as SavedArchive);
      setPhase('saved');
    } catch {
      setPhase('error');
    }
  }

  const card = saved?.card;
  const rows: Array<[string, string, string | undefined]> = [
    ['今日运势', card?.fortune ?? '今天适合把一件小事做完，再奖励自己', undefined],
    ['幸运色', card ? `${card.luckyColor.name} · ${card.luckyColor.tip}` : '一种只衬你的颜色', card?.luckyColor.hex],
    ['妆容一句', card?.makeup ?? '一句刚好适合今天的妆容建议', undefined],
  ];

  return (
    <div className={`s-card s-card--lined ${styles.archive}`}>
      <div className="s-tape s-tape--sage" />
      <div className={styles.archiveHead}>
        <span className="s-eyebrow">你的今日卡 · 预览</span>
        <span className={styles.archiveMeta}>
          {saved ? `档案 ${saved.archive.completenessPct}% 完整` : '存下档案就能看'}
        </span>
      </div>
      <ul className={styles.archiveList} aria-live="polite">
        {rows.map(([k, v, hex]) => (
          <li key={k}>
            <span className={styles.archiveK}>{k}</span>
            <span className={saved ? undefined : styles.blur}>
              {hex ? <i aria-hidden className={styles.sw} style={{ background: hex }} /> : null}
              {v}
            </span>
          </li>
        ))}
      </ul>

      {phase !== 'saved' ? (
        <>
          <button
            type="button"
            onClick={() => void save()}
            disabled={phase === 'saving'}
            className="s-btn"
            style={{ opacity: phase === 'saving' ? 0.7 : 1, border: 0, cursor: 'pointer' }}
          >
            {phase === 'saving' ? '正在为你建档…' : '一键存进我的档案'}
          </button>
          <p className={styles.sub}>
            {phase === 'error' ? '刚才没存上，再点一次试试' : '免注册 · 存在这台设备上，之后可以随时绑定账号'}
          </p>
        </>
      ) : (
        <>
          <Link href="/today/" prefetch={false} className="s-btn">
            打开我的今日卡 →
          </Link>
          {saved?.isAnonymous ? (
            <p className={styles.sub}>
              换手机也不想丢？<Link href="/auth/register/?next=%2Fme%2F" prefetch={false}>绑定账号</Link>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
