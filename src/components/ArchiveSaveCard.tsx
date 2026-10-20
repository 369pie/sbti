'use client';

/**
 * One-tap「她的档案」— no forced registration.
 * Before save: locked preview of today's card (value first).
 * After save: real today card + completeness, single CTA → /today/, bind account later.
 */

import Link from 'next/link';
import { useState } from 'react';

import { enqueueProductEvent } from '@/lib/analytics/product-events';
import { getApiPath } from '@/lib/api';
import { markDeviceArchive } from '@/lib/her/device-archive';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';

interface SavedArchive {
  isAnonymous: boolean;
  card: { fortune: string; luckyColor: { name: string; hex: string; tip: string }; makeup: string };
  archive: { completenessPct: number };
}

const mono = 'ui-monospace, "SF Mono", monospace';

export function ArchiveSaveCard({ accent, source }: { accent: string; source: string }) {
  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saved, setSaved] = useState<SavedArchive | null>(null);

  async function save() {
    if (phase === 'saving') return;
    setPhase('saving');
    enqueueProductEvent('home', 'archive_save_click', { step: 'archive_click', props: { source } });
    try {
      const supabase = tryCreateBrowserSupabaseClient();
      if (!supabase) throw new Error('no_supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      }
      const res = await fetch(getApiPath('/her/archive/'), { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'save_failed');
      if (data.created) {
        enqueueProductEvent('home', 'archive_created', {
          step: 'archive',
          props: { mode: data.isAnonymous ? 'anonymous' : 'claimed', source },
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
    <div className="mb-6">
      <div
        className="p-5 mb-4"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-rule-soft)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[0.32em] uppercase" style={{ fontFamily: mono, color: accent }}>
            你的今日卡 · 预览
          </span>
          <span className="text-[11px]" style={{ fontFamily: mono, color: 'var(--color-text-muted)' }}>
            {saved ? `档案 ${saved.archive.completenessPct}% 完整` : '保存档案后解锁'}
          </span>
        </div>
        <ul className="flex flex-col gap-2.5" aria-live="polite">
          {rows.map(([k, v, hex]) => (
            <li key={k} className="flex items-baseline gap-3 text-[14px]">
              <span className="shrink-0 w-16 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{k}</span>
              {hex ? <i aria-hidden style={{ width: 10, height: 10, borderRadius: 99, background: hex, display: 'inline-block' }} /> : null}
              <span
                style={{
                  color: 'var(--color-text-primary)',
                  filter: saved ? 'none' : 'blur(4px)',
                  userSelect: saved ? 'auto' : 'none',
                  transition: 'filter 500ms ease',
                }}
              >
                {v}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {phase !== 'saved' ? (
        <>
          <button
            type="button"
            onClick={() => void save()}
            disabled={phase === 'saving'}
            className="w-full inline-flex items-center justify-center gap-3 px-7 py-3.5 text-sm"
            style={{ background: accent, color: 'var(--color-bg-elevated)', fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', opacity: phase === 'saving' ? 0.7 : 1 }}
          >
            {phase === 'saving' ? '正在为你建档…' : '一键保存我的档案，看今日卡'}
            <span aria-hidden>→</span>
          </button>
          <p className="mt-2 text-center text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            {phase === 'error' ? '刚才没存上，再点一次试试' : '免注册 · 存在这台设备上，之后可随时绑定账号'}
          </p>
        </>
      ) : (
        <>
          <Link
            href="/today/"
            className="w-full inline-flex items-center justify-center gap-3 px-7 py-3.5 text-sm"
            style={{ background: accent, color: 'var(--color-bg-elevated)', fontFamily: 'var(--font-display)' }}
          >
            档案已保存 · 打开我的今日卡
            <span aria-hidden>→</span>
          </Link>
          {saved?.isAnonymous ? (
            <p className="mt-2 text-center text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              换手机也不想丢？
              <Link href="/auth/register/?next=%2Ftoday%2F" style={{ color: accent, marginLeft: 4, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                绑定账号
              </Link>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
