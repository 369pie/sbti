/**
 * 命书馆 · 本地存档（MVP localStorage）
 *
 * Q2 接 Supabase 后改为按 user_id 持久化。
 */
import type { DestinyReport } from './types';

const STORAGE_KEY = 'mysti-destiny-archive-v1';
const MAX_RECORDS = 20;

export interface DestinyArchiveEntry {
  id: string;
  /** 入参摘要，用于列表展示 */
  inputSummary: {
    solarDate: string;
    birthTime: string;
    birthplace: string;
    gender: 'female' | 'male';
  };
  report: DestinyReport;
  recordedAt: number;
}

function generateId(): string {
  const arr = new Uint8Array(4);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function loadDestinyArchive(): DestinyArchiveEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as DestinyArchiveEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveDestinyEntry(entry: Omit<DestinyArchiveEntry, 'id' | 'recordedAt'>): DestinyArchiveEntry {
  const next: DestinyArchiveEntry = {
    ...entry,
    id: generateId(),
    recordedAt: Date.now(),
  };
  if (typeof window === 'undefined') return next;
  const list = [next, ...loadDestinyArchive()].slice(0, MAX_RECORDS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* swallow */
  }
  return next;
}

export function clearDestinyArchive(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* swallow */
  }
}
