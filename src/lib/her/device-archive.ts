/** Device-local marker: this browser already created「她的档案」(anon or claimed). */
const KEY = 'wtfti.archive.created';

export function hasDeviceArchive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markDeviceArchive(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    // ignore
  }
}
