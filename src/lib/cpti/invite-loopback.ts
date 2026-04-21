/**
 * CPTI Invite Loopback (v2.0 W2 — S5.4)
 *
 * 邀请回流通知（客户端 stub）：
 *   A 把测试结果分享给 B → B 打开链接、完成测试 → A 下次访问 Codex 看到
 *   "ta 已经测过了"。
 *
 * 客户端实现：
 *   - A 分享链接时附 ?inv=A_SENDER_ID（发送者本地匿名 id，从 localStorage 取/生成）
 *   - B 打开链接时识别 inv 参数，把通知写进 localStorage 的待派发队列
 *   - A 下次访问 Codex 时拉取自己 senderId 对应的通知，显示 + 标记已读
 *
 * 注意：单设备闭环。跨设备真实 push 需要后端，标记 v2 deferred。
 */

const SENDER_KEY = 'cpti.invite.sender.v1';
const INBOX_KEY = 'cpti.invite.inbox.v1';

export interface InviteNotification {
  /** 派发对象（即原始分享者）的 senderId */
  toSenderId: string;
  /** 关系 slug，便于 Codex 跳转 */
  relationshipSlug: string;
  /** 接收测试者（即 B）的可选昵称 */
  fromNickname?: string;
  /** 写入时间戳 */
  createdAt: number;
  /** 是否已读 */
  seen: boolean;
}

interface InboxBlob {
  v: number;
  items: InviteNotification[];
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 12);
  }
  return Math.random().toString(36).slice(2, 14);
}

/** 当前设备的 senderId — 不存在则生成。 */
export function getOrCreateSenderId(): string {
  if (!isBrowser()) return '';
  try {
    const cur = window.localStorage.getItem(SENDER_KEY);
    if (cur) return cur;
    const id = uuid();
    window.localStorage.setItem(SENDER_KEY, id);
    return id;
  } catch {
    return '';
  }
}

function readInbox(): InboxBlob {
  if (!isBrowser()) return { v: 1, items: [] };
  try {
    const raw = window.localStorage.getItem(INBOX_KEY);
    if (!raw) return { v: 1, items: [] };
    const parsed = JSON.parse(raw) as InboxBlob;
    if (!parsed || !Array.isArray(parsed.items)) return { v: 1, items: [] };
    return { v: 1, items: parsed.items };
  } catch {
    return { v: 1, items: [] };
  }
}

function writeInbox(blob: InboxBlob): void {
  if (!isBrowser()) return;
  try { window.localStorage.setItem(INBOX_KEY, JSON.stringify(blob)); } catch { /* noop */ }
}

/** 接收方调用：把通知写进队列。 */
export function queueInviteNotification(opts: { toSenderId: string; relationshipSlug: string; fromNickname?: string }): void {
  if (!opts.toSenderId) return;
  const blob = readInbox();
  // dedup: same sender + same rel within 1h
  const now = Date.now();
  const dedup = blob.items.some(it =>
    it.toSenderId === opts.toSenderId
    && it.relationshipSlug === opts.relationshipSlug
    && (now - it.createdAt) < 60 * 60 * 1000,
  );
  if (dedup) return;
  blob.items.push({
    toSenderId: opts.toSenderId,
    relationshipSlug: opts.relationshipSlug,
    fromNickname: opts.fromNickname,
    createdAt: now,
    seen: false,
  });
  writeInbox(blob);
}

/** 发送方调用：拉取自己未读的通知。 */
export function getMyPendingNotifications(): InviteNotification[] {
  const me = getOrCreateSenderId();
  if (!me) return [];
  return readInbox().items.filter(it => it.toSenderId === me && !it.seen);
}

/** 标记某条通知已读（按时间戳定位）。 */
export function markNotificationSeen(createdAt: number): void {
  const me = getOrCreateSenderId();
  if (!me) return;
  const blob = readInbox();
  blob.items = blob.items.map(it =>
    it.toSenderId === me && it.createdAt === createdAt ? { ...it, seen: true } : it,
  );
  writeInbox(blob);
}

/** 全部标记已读。 */
export function markAllNotificationsSeen(): void {
  const me = getOrCreateSenderId();
  if (!me) return;
  const blob = readInbox();
  blob.items = blob.items.map(it => (it.toSenderId === me ? { ...it, seen: true } : it));
  writeInbox(blob);
}
