'use client';

import { useEffect, useState } from 'react';
import { getOrCreateDeviceId } from '@/lib/mysti/device';

export type DeepState<T> =
  | { status: 'loading' }
  | { status: 'locked' }
  | { status: 'error' }
  | { status: 'ok'; data: T };

/**
 * Paid deep content is never bundled — it is fetched from /api/deep/<kind>/,
 * which re-checks entitlement server-side (member or paid order).
 */
export function useDeepPayload<T>(kind: string, params: Record<string, string | null | undefined>): DeepState<T> {
  const [state, setState] = useState<DeepState<T>>({ status: 'loading' });
  const key = JSON.stringify(params);
  useEffect(() => {
    let cancelled = false;
    const body = { ...JSON.parse(key), deviceId: getOrCreateDeviceId() || undefined };
    fetch(`/api/deep/${kind}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 402 || res.status === 403) return setState({ status: 'locked' });
        if (!res.ok) return setState({ status: 'error' });
        const json = (await res.json()) as { data: T };
        if (!cancelled) setState({ status: 'ok', data: json.data });
      })
      .catch(() => !cancelled && setState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [kind, key]);
  return state;
}

/** Shared placeholder for non-ok states inside an unlocked paywall. */
export function deepStatusText(state: DeepState<unknown>): string {
  if (state.status === 'loading') return '正在加载完整内容…';
  if (state.status === 'locked') return '没有找到这台设备的购买记录或会员权益。换了浏览器的话，请回到原来的浏览器打开，或在「我」里登录后再试。';
  return '内容加载失败，请刷新重试。';
}
