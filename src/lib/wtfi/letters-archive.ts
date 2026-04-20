/**
 * Stardust Letters Archive · 用户写给未来自己的信
 *
 * 存储：localStorage（key: `wtfti.letters.v1`）
 * 触发：根据 dueAt 字段，访问时检查是否到期 → 弹出收信箱
 *
 * 后续可接 Supabase（payload 已设计为可序列化、可同步）。
 */

export interface StardustUserLetter {
  id: string;
  text: string;
  /** 写信时间 ISO */
  sealedAt: string;
  /** 计划开启时间 ISO */
  dueAt: string;
  /** 关联的 personality slug（可选） */
  personalitySlug?: string;
  /** 是否已开启 */
  opened: boolean;
  /**
   * 信件类型
   *   - sealed（默认）· 用户主动写给未来自己的信
   *   - retest · 月相复测仪式的 28 天召回
   */
  kind?: 'sealed' | 'retest';
}

const KEY = 'wtfti.letters.v1';

function safeRead(): StardustUserLetter[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is StardustUserLetter =>
        x &&
        typeof x.id === 'string' &&
        typeof x.text === 'string' &&
        typeof x.sealedAt === 'string' &&
        typeof x.dueAt === 'string',
    );
  } catch {
    return [];
  }
}

function safeWrite(letters: StardustUserLetter[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(letters));
  } catch {
    // quota / private mode → silent
  }
}

function makeId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${t}${r}`;
}

interface SealOpts {
  text: string;
  personalitySlug?: string;
  dueDays?: number;
  kind?: 'sealed' | 'retest';
}

export function sealStardustLetter({
  text,
  personalitySlug,
  dueDays = 30,
  kind = 'sealed',
}: SealOpts): StardustUserLetter {
  const sealedAt = new Date();
  const dueAt = new Date(sealedAt.getTime() + dueDays * 86400_000);
  const letter: StardustUserLetter = {
    id: makeId(),
    text: text.trim().slice(0, 240),
    sealedAt: sealedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    personalitySlug,
    opened: false,
    kind,
  };
  const all = safeRead();
  all.push(letter);
  safeWrite(all);
  return letter;
}

/**
 * 检查当前用户是否已经有未拆封的 retest 召回信。
 * 用于避免每次完成仪式都重复塞一份。
 */
export function hasPendingRetestLetter(): boolean {
  return safeRead().some((l) => l.kind === 'retest' && !l.opened);
}

/**
 * 仪式完成后，若 28 天内无未拆封的月相复测信，自动排一份。
 *
 * 打通点：
 *   - RitualQuizRunner finalize 调用
 *   - StardustDueBanner 已经在全站显示到期信件
 *   - /wtfti/letters 列表页点击"去复测"跳 /wtfti/galaxy/test
 */
export function scheduleMonthlyRetestLetter(
  personalitySlug: string,
  dueDays: number = 28,
): StardustUserLetter | null {
  if (hasPendingRetestLetter()) return null;
  return sealStardustLetter({
    kind: 'retest',
    dueDays,
    personalitySlug,
    text: [
      '✦ 月相复测仪式',
      '',
      '28 天前你第一次把神域烧进了夜空。',
      '月亮转了一圈，情绪、关系、欲望都换了指针。',
      '',
      '再走一次仪式，神可能换脸，也可能认得更深。',
    ].join('\n'),
  });
}

export function listStardustLetters(): StardustUserLetter[] {
  return safeRead().sort((a, b) => a.sealedAt.localeCompare(b.sealedAt));
}

/** 现在到期且未开启的信 */
export function listDueStardustLetters(now: Date = new Date()): StardustUserLetter[] {
  return safeRead().filter((l) => !l.opened && new Date(l.dueAt) <= now);
}

export function markStardustLetterOpened(id: string): void {
  const all = safeRead();
  const next = all.map((l) => (l.id === id ? { ...l, opened: true } : l));
  safeWrite(next);
}

export function deleteStardustLetter(id: string): void {
  const all = safeRead().filter((l) => l.id !== id);
  safeWrite(all);
}
