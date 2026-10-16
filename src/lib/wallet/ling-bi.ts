/**
 * 灵币（Ling-Bi）— 统一虚拟币钱包
 *
 * 设计目标：
 *  · 跨模块通用：灵镜（mirror）、灵鉴（mysti）、命书馆（destiny）共享余额
 *  · 1 灵币 = ¥1（消费心智简单：标价直接除以汇率）
 *  · MVP 走 localStorage；预留 Supabase 持久化接口
 *  · 平滑迁移旧 mirror-credits（首次读取时合并入新钱包，避免老用户清零）
 *
 * 消费成本（与 SKU 解耦，方便后续调价）：
 *  · mirror-single   1  灵币  → ¥1   单图（旧 mirror 引流款）
 *  · mirror-archive  20 灵币  → ¥19.9 三页诊断卡（升级款）
 *  · destiny-once    39 灵币  → ¥39  命书馆单次（内测期不真扣，仅记账）
 *
 * 充值包：
 *  · 10 灵币 / ¥10
 *  · 33 灵币 / ¥30  (+10% bonus)
 *  · 120 灵币 / ¥99 (+20% bonus)
 */

const WALLET_KEY = 'ling-bi-wallet-v1';
const LEDGER_KEY = 'ling-bi-ledger-v1';
const MIGRATED_FLAG = 'ling-bi-migrated-from-mirror-v1';
const LEGACY_MIRROR_KEY = 'mirror-credits';

const FREE_INITIAL_LING_BI = 2;
const MAX_LEDGER_ENTRIES = 100;

// ─── Types ─────────────────────────────────────────────────────────────────

export type LingBiSource =
  | 'mirror-single'      // 灵镜单图
  | 'mirror-archive'     // 灵镜三页档案
  | 'mirror-legacy'      // 旧 mirror credits 迁移
  | 'destiny-once'       // 命书馆单次
  | 'destiny-monthly'    // 命书馆月度运势
  | 'topup'              // 充值
  | 'free'               // 新用户赠送
  | 'gift'               // 邀请/礼品
  | 'refund';            // 退款

export type SkuCost = {
  sku: LingBiSource;
  cost: number;
  yuan: number;       // 对应人民币标价（仅展示用）
  label: string;
};

export const SKU_COSTS: Record<string, SkuCost> = {
  'mirror-single':   { sku: 'mirror-single',   cost: 1,  yuan: 1,    label: '灵镜单图' },
  'mirror-archive':  { sku: 'mirror-archive',  cost: 20, yuan: 19.9, label: '灵镜三页诊断卡' },
  'destiny-once':    { sku: 'destiny-once',    cost: 39, yuan: 39,   label: '命书馆单次命书' },
  'destiny-monthly': { sku: 'destiny-monthly', cost: 9,  yuan: 9.9,  label: '命书馆月度运势' },
};

export interface TopUpPack {
  id: string;
  yuan: number;
  lingBi: number;
  bonusPct: number;
  label: string;
}

export const TOP_UP_PACKS: TopUpPack[] = [
  { id: 'lb-10',  yuan: 10, lingBi: 10,  bonusPct: 0,  label: '10 灵币 · ¥10' },
  { id: 'lb-30',  yuan: 30, lingBi: 33,  bonusPct: 10, label: '33 灵币 · ¥30（送 3）' },
  { id: 'lb-99',  yuan: 99, lingBi: 120, bonusPct: 21, label: '120 灵币 · ¥99（送 21）' },
];

export interface Wallet {
  balance: number;
  totalEarned: number;       // 累计获得（含赠送/迁移/充值）
  totalSpent: number;        // 累计消费
  freeGranted: number;       // 已发放的免费灵币
  updatedAt: number;
  createdAt: number;
}

export interface LedgerEntry {
  id: string;
  delta: number;             // 正数=入账，负数=消费
  source: LingBiSource;
  resourceId?: string;       // 例如 mirror-history-id / destiny-chart-id
  note?: string;
  balanceAfter: number;
  timestamp: number;
}

// ─── Storage helpers ───────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function loadJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveJson(key: string, data: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded / private mode — fail silent
  }
}

function generateId(): string {
  const arr = new Uint8Array(6);
  if (isBrowser() && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Legacy migration ──────────────────────────────────────────────────────

interface LegacyMirrorCredits {
  remaining: number;
  freeUsed: number;
  paidUsed: number;
  totalPurchased: number;
  updatedAt: number;
}

/**
 * 首次读取时把旧 mirror-credits 余额迁移到新钱包，避免老用户清零。
 * 只迁移 `remaining`，因为新钱包的免费额度独立计算。
 * 设置 MIGRATED_FLAG 防止重复迁移；旧 key 保留只读，不清空。
 */
function migrateFromLegacyIfNeeded(wallet: Wallet, ledger: LedgerEntry[]): {
  wallet: Wallet;
  ledger: LedgerEntry[];
  didMigrate: boolean;
} {
  if (!isBrowser()) return { wallet, ledger, didMigrate: false };
  if (window.localStorage.getItem(MIGRATED_FLAG)) {
    return { wallet, ledger, didMigrate: false };
  }

  const legacy = loadJson<LegacyMirrorCredits>(LEGACY_MIRROR_KEY);
  if (!legacy || typeof legacy.remaining !== 'number' || legacy.remaining <= 0) {
    saveJson(MIGRATED_FLAG, { at: Date.now(), reason: 'no-legacy-balance' });
    return { wallet, ledger, didMigrate: false };
  }

  const carried = legacy.remaining;
  const next: Wallet = {
    ...wallet,
    balance: wallet.balance + carried,
    totalEarned: wallet.totalEarned + carried,
    updatedAt: Date.now(),
  };
  const entry: LedgerEntry = {
    id: generateId(),
    delta: carried,
    source: 'mirror-legacy',
    note: `迁移自旧 mirror-credits（${carried}）`,
    balanceAfter: next.balance,
    timestamp: Date.now(),
  };
  saveJson(MIGRATED_FLAG, { at: Date.now(), carried });
  return { wallet: next, ledger: [entry, ...ledger], didMigrate: true };
}

// ─── Core API ──────────────────────────────────────────────────────────────

function freshWallet(): Wallet {
  const now = Date.now();
  return {
    balance: FREE_INITIAL_LING_BI,
    totalEarned: FREE_INITIAL_LING_BI,
    totalSpent: 0,
    freeGranted: FREE_INITIAL_LING_BI,
    updatedAt: now,
    createdAt: now,
  };
}

function ensureLedgerSize(ledger: LedgerEntry[]): LedgerEntry[] {
  if (ledger.length <= MAX_LEDGER_ENTRIES) return ledger;
  return ledger.slice(0, MAX_LEDGER_ENTRIES);
}

export function getWallet(): Wallet {
  let wallet = loadJson<Wallet>(WALLET_KEY);
  let ledger = loadJson<LedgerEntry[]>(LEDGER_KEY) || [];
  let didInit = false;

  if (!wallet) {
    wallet = freshWallet();
    ledger = [{
      id: generateId(),
      delta: FREE_INITIAL_LING_BI,
      source: 'free',
      note: '新用户欢迎灵币',
      balanceAfter: wallet.balance,
      timestamp: Date.now(),
    }, ...ledger];
    didInit = true;
  }

  const migrated = migrateFromLegacyIfNeeded(wallet, ledger);
  if (didInit || migrated.didMigrate) {
    saveJson(WALLET_KEY, migrated.wallet);
    saveJson(LEDGER_KEY, ensureLedgerSize(migrated.ledger));
  }
  return migrated.wallet;
}

export function getLedger(): LedgerEntry[] {
  // 触发一次 getWallet 以确保迁移已发生
  getWallet();
  return loadJson<LedgerEntry[]>(LEDGER_KEY) || [];
}

export function getBalance(): number {
  return getWallet().balance;
}

export interface ConsumeResult {
  ok: boolean;
  reason?: 'insufficient' | 'invalid-cost';
  required?: number;
  balance: number;
}

/**
 * 扣费。原子性：先校验余额，再写入 wallet + ledger。
 * 服务端版本上线前，调用方仍需在敏感场景做服务端二次校验。
 */
export function consume(
  source: LingBiSource,
  cost: number,
  options: { resourceId?: string; note?: string } = {},
): ConsumeResult {
  if (!Number.isFinite(cost) || cost <= 0) {
    return { ok: false, reason: 'invalid-cost', balance: getBalance() };
  }

  const wallet = getWallet();
  if (wallet.balance < cost) {
    return { ok: false, reason: 'insufficient', required: cost, balance: wallet.balance };
  }

  const next: Wallet = {
    ...wallet,
    balance: wallet.balance - cost,
    totalSpent: wallet.totalSpent + cost,
    updatedAt: Date.now(),
  };
  const entry: LedgerEntry = {
    id: generateId(),
    delta: -cost,
    source,
    resourceId: options.resourceId,
    note: options.note,
    balanceAfter: next.balance,
    timestamp: Date.now(),
  };
  const ledger = ensureLedgerSize([entry, ...(loadJson<LedgerEntry[]>(LEDGER_KEY) || [])]);
  saveJson(WALLET_KEY, next);
  saveJson(LEDGER_KEY, ledger);
  return { ok: true, balance: next.balance };
}

export function consumeBySku(
  skuKey: keyof typeof SKU_COSTS,
  options: { resourceId?: string; note?: string } = {},
): ConsumeResult {
  const sku = SKU_COSTS[skuKey];
  if (!sku) return { ok: false, reason: 'invalid-cost', balance: getBalance() };
  return consume(sku.sku, sku.cost, { ...options, note: options.note ?? sku.label });
}

export interface TopUpResult {
  ok: boolean;
  balance: number;
  added: number;
}

/**
 * 充值入账。调用方应在支付回调成功后调用。
 * MVP 阶段不做幂等键 — Q2 接 Supabase 时按 orderId 去重。
 */
export function topUp(
  amount: number,
  options: { source?: LingBiSource; orderId?: string; note?: string } = {},
): TopUpResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, balance: getBalance(), added: 0 };
  }
  const wallet = getWallet();
  const next: Wallet = {
    ...wallet,
    balance: wallet.balance + amount,
    totalEarned: wallet.totalEarned + amount,
    updatedAt: Date.now(),
  };
  const entry: LedgerEntry = {
    id: generateId(),
    delta: amount,
    source: options.source ?? 'topup',
    resourceId: options.orderId,
    note: options.note,
    balanceAfter: next.balance,
    timestamp: Date.now(),
  };
  const ledger = ensureLedgerSize([entry, ...(loadJson<LedgerEntry[]>(LEDGER_KEY) || [])]);
  saveJson(WALLET_KEY, next);
  saveJson(LEDGER_KEY, ledger);
  return { ok: true, balance: next.balance, added: amount };
}

export function canAfford(skuKey: keyof typeof SKU_COSTS): boolean {
  const sku = SKU_COSTS[skuKey];
  if (!sku) return false;
  return getBalance() >= sku.cost;
}

// ─── Test/dev helpers ──────────────────────────────────────────────────────

/** 仅测试/开发使用 — 清空钱包状态。 */
export function __resetWalletForTests(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(WALLET_KEY);
  window.localStorage.removeItem(LEDGER_KEY);
  window.localStorage.removeItem(MIGRATED_FLAG);
}
