/**
 * Mirror Credits — localStorage-based credit system for mirror lab.
 *
 * Free tier: 2 free mirror generations
 * Paid tier: 1 credit per generation
 * Top-up: 10 credits (¥10), 30 credits (¥30)
 */

const CREDITS_KEY = 'mirror-credits';
const USAGE_KEY = 'mirror-usage';
const HISTORY_KEY = 'mirror-history';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface MirrorCredits {
  remaining: number;
  freeUsed: number;
  paidUsed: number;
  totalPurchased: number;
  updatedAt: number;
}

export interface MirrorUsageRecord {
  mode: string;
  reportType?: string;
  timestamp: number;
  wasFree: boolean;
}

export interface MirrorHistoryRecord {
  id: string;
  mode: string;
  reportType?: string;
  summary: string;
  imageUrl: string | null;
  /** Store report sections for display when image expires */
  reportSections?: { title: string; body: string }[];
  reportPalette?: string[];
  timestamp: number;
  expiresAt: number; // 3 days from creation
}

// ─── Constants ─────────────────────────────────────────────────────────────

const FREE_CREDITS = 2;
const CREDITS_PER_GENERATION = 1;
const TOP_UP_OPTIONS = [
  { credits: 10, price: 10, label: '灵镜 10 次 · ¥10', pack: 'mirror-10' },
  { credits: 30, price: 30, label: '灵镜 30 次 · ¥30', pack: 'mirror-30' },
];

const HISTORY_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const MAX_HISTORY = 20;

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateId(): string {
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function loadJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveJson(key: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage full / private mode
  }
}

// ─── Credits ───────────────────────────────────────────────────────────────

export function getCredits(): MirrorCredits {
  const existing = loadJson<MirrorCredits>(CREDITS_KEY);
  if (existing) return existing;

  const fresh: MirrorCredits = {
    remaining: FREE_CREDITS,
    freeUsed: 0,
    paidUsed: 0,
    totalPurchased: 0,
    updatedAt: Date.now(),
  };
  saveJson(CREDITS_KEY, fresh);
  return fresh;
}

export function hasCredits(): boolean {
  return getCredits().remaining > 0;
}

export function getFreeCreditsRemaining(): number {
  const credits = getCredits();
  return Math.max(0, FREE_CREDITS - credits.freeUsed);
}

export function consumeCredit(): { success: boolean; wasFree: boolean; remaining: number } {
  const credits = getCredits();

  if (credits.remaining <= 0) {
    return { success: false, wasFree: false, remaining: 0 };
  }

  const wasFree = credits.freeUsed < FREE_CREDITS;

  credits.remaining -= CREDITS_PER_GENERATION;
  if (wasFree) {
    credits.freeUsed += CREDITS_PER_GENERATION;
  } else {
    credits.paidUsed += CREDITS_PER_GENERATION;
  }
  credits.updatedAt = Date.now();

  saveJson(CREDITS_KEY, credits);

  // Record usage
  const usage = loadJson<MirrorUsageRecord[]>(USAGE_KEY) || [];
  usage.unshift({
    mode: 'unknown',
    timestamp: Date.now(),
    wasFree,
  });
  if (usage.length > 50) usage.length = 50;
  saveJson(USAGE_KEY, usage);

  return { success: true, wasFree, remaining: credits.remaining };
}

export function addCredits(amount: number): MirrorCredits {
  const credits = getCredits();
  credits.remaining += amount;
  credits.totalPurchased += amount;
  credits.updatedAt = Date.now();
  saveJson(CREDITS_KEY, credits);
  return credits;
}

export function getTopUpOptions() {
  return TOP_UP_OPTIONS;
}

// ─── Usage tracking ────────────────────────────────────────────────────────

export function getUsageHistory(): MirrorUsageRecord[] {
  return loadJson<MirrorUsageRecord[]>(USAGE_KEY) || [];
}

export function getTodayUsageCount(): number {
  const today = new Date().toISOString().slice(0, 10);
  return getUsageHistory().filter(r =>
    new Date(r.timestamp).toISOString().slice(0, 10) === today
  ).length;
}

// ─── History (3-day expiry) ────────────────────────────────────────────────

export function addToHistory(record: Omit<MirrorHistoryRecord, 'id' | 'timestamp' | 'expiresAt'>): void {
  const history = getHistory();

  const entry: MirrorHistoryRecord = {
    ...record,
    id: generateId(),
    timestamp: Date.now(),
    expiresAt: Date.now() + HISTORY_EXPIRY_MS,
  };

  history.unshift(entry);

  // Clean expired
  const now = Date.now();
  const cleaned = history.filter(r => r.expiresAt > now);

  // Limit
  if (cleaned.length > MAX_HISTORY) cleaned.length = MAX_HISTORY;

  saveJson(HISTORY_KEY, cleaned);
}

export function getHistory(): MirrorHistoryRecord[] {
  const history = loadJson<MirrorHistoryRecord[]>(HISTORY_KEY) || [];

  // Clean expired on read
  const now = Date.now();
  const cleaned = history.filter(r => r.expiresAt > now);

  if (cleaned.length !== history.length) {
    saveJson(HISTORY_KEY, cleaned);
  }

  return cleaned;
}

export function clearHistory(): void {
  saveJson(HISTORY_KEY, []);
}

export function getHistoryCount(): number {
  return getHistory().length;
}

// ─── Paywall check ─────────────────────────────────────────────────────────

export interface PaywallResult {
  allowed: boolean;
  reason: 'free' | 'paid' | 'no-credits';
  remaining: number;
  message: string;
}

export function checkPaywall(): PaywallResult {
  const credits = getCredits();
  const freeRemaining = getFreeCreditsRemaining();

  if (freeRemaining > 0) {
    return {
      allowed: true,
      reason: 'free',
      remaining: credits.remaining,
      message: `免费次数剩余 ${freeRemaining} 次`,
    };
  }

  if (credits.remaining > 0) {
    return {
      allowed: true,
      reason: 'paid',
      remaining: credits.remaining,
      message: `付费次数剩余 ${credits.remaining} 次`,
    };
  }

  return {
    allowed: false,
    reason: 'no-credits',
    remaining: 0,
    message: '免费次数已用完，充值后继续使用',
  };
}
