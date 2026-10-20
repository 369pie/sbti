'use client';

import { useEffect, useState } from 'react';
import { tryCreateBrowserSupabaseClient } from '@/lib/supabase/client';
import { getOrCreateAnonymousSession } from '@/lib/supabase/auth';
import { getApiPath } from '@/lib/api';
import { enqueueProductEvent } from '@/lib/analytics/product-events';

type State = 'unsupported' | 'idle' | 'working' | 'on' | 'denied' | 'error';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

// Daily "今日卡" reminder (refocus §6.1). iOS only supports this after "添加到主屏幕".
export function DailyReminderToggle() {
  const [state, setState] = useState<State>('idle');

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    navigator.serviceWorker.getRegistration('/').then((reg) => reg?.pushManager.getSubscription()).then((sub) => {
      if (sub) setState('on');
    });
  }, []);

  async function enable() {
    setState('working');
    enqueueProductEvent('home', 'push_enable_click');
    let stage = 'permission';
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'idle');
        enqueueProductEvent('home', 'push_enable_failed', { step: 'permission', props: { reason: permission } });
        return;
      }
      stage = 'sw_register';
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }));

      stage = 'session';
      const supabase = tryCreateBrowserSupabaseClient();
      if (supabase) await getOrCreateAnonymousSession(supabase);

      stage = 'api';
      const res = await fetch(getApiPath('/push/subscribe/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error(`subscribe ${res.status}`);
      enqueueProductEvent('home', 'push_enabled');
      setState('on');
    } catch (e) {
      enqueueProductEvent('home', 'push_enable_failed', {
        step: stage,
        props: { reason: e instanceof Error ? e.message.slice(0, 120) : 'unknown' },
      });
      setState('error');
    }
  }

  if (state === 'unsupported') {
    return (
      <p className="text-[12px]" style={{ color: 'var(--s-mute)' }}>
        想每天收到提醒？用 Safari 打开，点「分享 → 添加到主屏幕」后再来开启。
      </p>
    );
  }

  const label: Record<Exclude<State, 'unsupported'>, string> = {
    idle: '每天早上提醒我看今日卡',
    working: '开启中…',
    on: '已开启每日提醒',
    denied: '通知被关掉了，可以在浏览器设置里重新打开',
    error: '没开成功，再试一次',
  };

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === 'working' || state === 'on' || state === 'denied'}
      className="w-full rounded-full border px-4 py-3 text-[14px] transition-colors disabled:cursor-default"
      style={{ borderColor: 'var(--s-line)', background: state === 'on' ? 'var(--s-accent-soft)' : 'var(--s-card)', color: 'var(--s-ink)' }}
    >
      {label[state]}
    </button>
  );
}
