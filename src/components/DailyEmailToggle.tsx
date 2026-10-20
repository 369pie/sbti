'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { enqueueProductEvent } from '@/lib/analytics/product-events';

type State = 'loading' | 'off' | 'on' | 'working' | 'no_email' | 'anon' | 'error';

// Daily 今日卡 email opt-in (refocus §6.1). Default off; registered users with a real email only.
export function DailyEmailToggle() {
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    fetch(getApiPath('/email/daily-optin/'))
      .then(async (r) => {
        if (r.status === 401) return setState('anon');
        const d = (await r.json()) as { on?: boolean; hasEmail?: boolean };
        setState(!d.hasEmail ? 'no_email' : d.on ? 'on' : 'off');
      })
      .catch(() => setState('anon'));
  }, []);

  async function toggle() {
    const next = state !== 'on';
    setState('working');
    const r = await fetch(getApiPath('/email/daily-optin/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ on: next }),
    }).catch(() => null);
    if (!r?.ok) {
      enqueueProductEvent('home', 'email_daily_enable_failed', { props: { status: r?.status ?? 0, on: next } });
      return setState('error');
    }
    if (next) enqueueProductEvent('home', 'email_daily_enabled');
    setState(next ? 'on' : 'off');
  }

  if (state === 'loading') return null;
  if (state === 'anon' || state === 'no_email') {
    return (
      <p className="text-[12px]" style={{ color: 'var(--s-mute)' }}>
        想用邮件收今日卡？<Link href="/auth/register/?next=/today/" style={{ color: 'var(--s-accent-text)' }}>留个邮箱建档</Link>
      </p>
    );
  }
  const label = { off: '也用邮件提醒我（每天一封，可随时退订）', on: '已开启每日邮件 · 点此关闭', working: '保存中…', error: '没保存成功，再试一次' }[state];
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={state === 'working'}
      className="w-full rounded-full border px-4 py-3 text-[14px]"
      style={{ borderColor: 'var(--s-line)', background: state === 'on' ? 'var(--s-accent-soft)' : 'var(--s-card)', color: 'var(--s-ink)' }}
    >
      {label}
    </button>
  );
}
