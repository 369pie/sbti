'use client';

import { useEffect, useState } from 'react';

import { getPaymentAvailabilityStatus, type PaymentAvailabilityStatus } from './availability';

/**
 * B05: live 02:00–06:00 (北京时间) payment pause state for checkout buttons.
 * SSR / first paint = not paused (avoids hydration mismatch); re-checked every 30 s.
 */
export function usePaymentPause(): PaymentAvailabilityStatus | null {
  const [status, setStatus] = useState<PaymentAvailabilityStatus | null>(null);
  useEffect(() => {
    const tick = () => {
      const s = getPaymentAvailabilityStatus();
      setStatus(s.blocked ? s : null);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return status;
}

export function pausedButtonLabel(s: PaymentAvailabilityStatus): string {
  return `支付通道暂停中 · ${s.resumesAt} 后可支付`;
}

export function pausedNote(s: PaymentAvailabilityStatus): string {
  return `第三方支付通道每日 ${s.windowLabel}（${s.timeZoneLabel}）暂停收款，${s.resumesAt} 后恢复。会员权益不受影响。`;
}
