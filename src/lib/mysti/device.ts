/**
 * Stable per-device identifier used by Mysti subscription / order lookup.
 *
 * Stored in localStorage under `mysti-device-id`. Generated lazily on first use.
 * Not a user identity — this is just so the same browser can recover its
 * subscription after clearing the entitlement envelope.
 */

const DEVICE_KEY = 'mysti-device-id';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing && existing.length >= 6) return existing;
    const fresh = uuid();
    window.localStorage.setItem(DEVICE_KEY, fresh);
    return fresh;
  } catch {
    return '';
  }
}

export function readDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(DEVICE_KEY);
  } catch {
    return null;
  }
}
