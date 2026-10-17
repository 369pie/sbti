/**
 * Asia/Shanghai calendar helpers for Today Card + streak.
 * UTC+8 fixed offset (no DST). Same boundary as museum/featured.
 */

const SHANGHAI_OFFSET_MS = 8 * 3600_000;

/** YYYY-MM-DD in Asia/Shanghai. */
export function shanghaiDateISO(now: Date = new Date()): string {
  return new Date(now.getTime() + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
}

/** Yesterday YYYY-MM-DD relative to Asia/Shanghai calendar. */
export function shanghaiYesterdayISO(now: Date = new Date()): string {
  return shanghaiDateISO(new Date(now.getTime() - 86_400_000));
}

/** Hour 0–23 in Asia/Shanghai. */
export function shanghaiHour(now: Date = new Date()): number {
  return new Date(now.getTime() + SHANGHAI_OFFSET_MS).getUTCHours();
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return '夜深了';
  if (hour < 11) return '早呀';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

/** e.g. 2026年10月17日 */
export function formatShanghaiDateCN(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}
