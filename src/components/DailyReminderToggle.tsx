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

type Platform = 'ios-browser' | 'ios-app' | 'wechat' | 'android' | 'desktop';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/MicroMessenger|QQ\/|Weibo|xhsdiscover|aweme|Douyin/i.test(ua)) return 'wechat';
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) {
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
      || window.matchMedia?.('(display-mode: standalone)').matches;
    return standalone ? 'ios-app' : 'ios-browser';
  }
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

/** B02: per-platform guidance instead of a dead 「通知被关掉了」 button. */
export function pushGuidance(state: 'unsupported' | 'denied', platform: Platform = detectPlatform()) {
  if (platform === 'wechat') {
    return { platform, title: '在 App 里打开收不到每日提醒', steps: ['点右上角「···」', '选「在浏览器打开」（iPhone 用 Safari）', '回到这一页再开启提醒'] };
  }
  if (platform === 'ios-browser') {
    return { platform, title: 'iPhone 需要先把 WTFTI 加到主屏幕', steps: ['在 Safari 底部点「分享」', '选「添加到主屏幕」', '从主屏幕图标打开，再点「每天早上提醒我」'] };
  }
  if (platform === 'ios-app') {
    return state === 'denied'
      ? { platform, title: '通知被关掉了，这样重新打开', steps: ['打开 iPhone「设置」→「通知」', '找到 WTFTI，打开「允许通知」', '回来刷新这一页'] }
      : { platform, title: '当前系统版本暂不支持提醒', steps: ['升级到 iOS 16.4 或更高版本后再试'] };
  }
  if (platform === 'android') {
    return state === 'denied'
      ? { platform, title: '通知被关掉了，这样重新打开', steps: ['点地址栏左侧的锁形图标 / 「网站设置」', '把「通知」改为「允许」', '回来刷新这一页'] }
      : { platform, title: '这个浏览器不支持提醒', steps: ['换用 Chrome 或系统浏览器打开本页'] };
  }
  return state === 'denied'
    ? { platform, title: '通知被关掉了，这样重新打开', steps: ['点地址栏左侧的图标 → 网站设置', '把「通知」改为「允许」', '刷新这一页'] }
    : { platform, title: '这个浏览器不支持提醒', steps: ['换用 Chrome / Edge / Safari 最新版打开'] };
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

  if (state === 'unsupported' || state === 'denied') {
    const g = pushGuidance(state);
    return (
      <div
        className="w-full rounded-2xl border px-4 py-3 text-[13px] leading-relaxed"
        style={{ borderColor: 'var(--s-line)', background: 'var(--s-card)', color: 'var(--s-ink-2)' }}
        data-push-guidance={g.platform}
      >
        <p className="font-medium" style={{ color: 'var(--s-ink)', margin: 0 }}>{g.title}</p>
        <ol style={{ margin: '6px 0 0', paddingLeft: 18 }}>
          {g.steps.map((t) => <li key={t}>{t}</li>)}
        </ol>
      </div>
    );
  }

  const label: Record<Exclude<State, 'unsupported' | 'denied'>, string> = {
    idle: '每天早上提醒我看今日卡',
    working: '开启中…',
    on: '已开启每日提醒',
    error: '没开成功，再试一次',
  };

  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === 'working' || state === 'on'}
      className="w-full rounded-full border px-4 py-3 text-[14px] transition-colors disabled:cursor-default"
      style={{ borderColor: 'var(--s-line)', background: state === 'on' ? 'var(--s-accent-soft)' : 'var(--s-card)', color: 'var(--s-ink)' }}
    >
      {label[state]}
    </button>
  );
}
