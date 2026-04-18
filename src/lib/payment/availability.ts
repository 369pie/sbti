export const PAYMENT_BLOCKED_TIME_ZONE = 'Asia/Shanghai';
export const PAYMENT_BLOCKED_TIME_ZONE_LABEL = '北京时间';
export const PAYMENT_BLOCKED_WINDOW_LABEL = '02:00-06:00';
export const PAYMENT_BLOCKED_RESUME_LABEL = '06:00';

const PAYMENT_BLOCKED_START_MINUTES = 2 * 60;
const PAYMENT_BLOCKED_END_MINUTES = 6 * 60;

export interface PaymentAvailabilityStatus {
  blocked: boolean;
  error: 'payment_window_closed' | null;
  message: string | null;
  timeZone: string;
  timeZoneLabel: string;
  windowLabel: string;
  resumesAt: string;
}

function readMinuteOfDayInTimeZone(date: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);

    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
    return hour * 60 + minute;
  } catch {
    return date.getHours() * 60 + date.getMinutes();
  }
}

function isMinuteInWindow(minuteOfDay: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes < endMinutes) {
    return minuteOfDay >= startMinutes && minuteOfDay < endMinutes;
  }

  return minuteOfDay >= startMinutes || minuteOfDay < endMinutes;
}

export function getPaymentAvailabilityStatus(now = new Date()): PaymentAvailabilityStatus {
  const minuteOfDay = readMinuteOfDayInTimeZone(now, PAYMENT_BLOCKED_TIME_ZONE);
  const blocked = isMinuteInWindow(
    minuteOfDay,
    PAYMENT_BLOCKED_START_MINUTES,
    PAYMENT_BLOCKED_END_MINUTES,
  );

  return {
    blocked,
    error: blocked ? 'payment_window_closed' : null,
    message: blocked
      ? `第三方支付通道每日 ${PAYMENT_BLOCKED_WINDOW_LABEL}（${PAYMENT_BLOCKED_TIME_ZONE_LABEL}）暂停收款，请在 ${PAYMENT_BLOCKED_RESUME_LABEL} 后再试。`
      : null,
    timeZone: PAYMENT_BLOCKED_TIME_ZONE,
    timeZoneLabel: PAYMENT_BLOCKED_TIME_ZONE_LABEL,
    windowLabel: PAYMENT_BLOCKED_WINDOW_LABEL,
    resumesAt: PAYMENT_BLOCKED_RESUME_LABEL,
  };
}

export function getPaymentBlockedPayload(now = new Date()) {
  const status = getPaymentAvailabilityStatus(now);

  return {
    error: status.error ?? 'payment_window_closed',
    message:
      status.message ??
      `第三方支付通道每日 ${PAYMENT_BLOCKED_WINDOW_LABEL}（${PAYMENT_BLOCKED_TIME_ZONE_LABEL}）暂停收款，请在 ${PAYMENT_BLOCKED_RESUME_LABEL} 后再试。`,
    blockedWindow: status.windowLabel,
    timeZone: status.timeZone,
    timeZoneLabel: status.timeZoneLabel,
    resumesAt: status.resumesAt,
  };
}