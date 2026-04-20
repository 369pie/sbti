/**
 * Soul Letter templates · 灵魂来信文案脚手架
 *
 * Strategy doc: docs/02-modules/soulti/soulti-viral-product-strategy-2026-04-19.md (E6)
 *
 * Each subscription receives 3 letters:
 *   - D+1 复盘信  (free, included)
 *   - D+3 镜像信  (paid, ¥9.9 single or included in ¥19.9 deep report)
 *   - D+7 修复信  (paid, same)
 *
 * Letters reference the user's tear rate %, day-self vs night-self, and pull
 * from existing REPAIR_PRESCRIPTIONS / SOUL_LETTERS in `deep-report.ts` for
 * type-specific copy. The cron worker (separate file, not yet built) reads
 * `soul_letter_subscriptions` rows and renders these templates for delivery.
 */

import {
  getRepairForCode,
  type SoulLetter,
  SOUL_LETTERS,
} from './deep-report';
import { getSoultiPersonalityBySlug } from './personalities';
import { SHARE_SITE_URL } from '../site';

export type LetterKind = 'd1' | 'd3' | 'd7';

export interface LetterPayload {
  email: string;
  slug: string;
  code: string;
  tearRatePercent?: number;
  /** Optional: name the user told us (we currently don't collect this; reserved) */
  name?: string;
}

export interface RenderedLetter {
  subject: string;
  /** Plain-text body for fallback */
  text: string;
  /** Minimal inline-styled HTML; serif typography matches in-product feel */
  html: string;
  kind: LetterKind;
}

const SERIF =
  "Georgia, 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

function tearLevel(percent?: number): 'aligned' | 'partial' | 'split' | 'extreme' | 'unknown' {
  if (typeof percent !== 'number') return 'unknown';
  if (percent < 20) return 'aligned';
  if (percent < 50) return 'partial';
  if (percent < 80) return 'split';
  return 'extreme';
}

function pickSoulLetter(code: string): SoulLetter | null {
  // J3 is index 2, J5 is index 4 (matches deep-report.ts SOUL_LETTERS keying)
  const key = `${code[2] ?? ''}${code[4] ?? ''}`;
  return SOUL_LETTERS[key] ?? null;
}

function htmlShell(title: string, body: string, payload?: { email: string; slug: string }): string {
  const unsubscribeBlock = payload
    ? (() => {
        const token = Buffer.from(`${payload.email}|${payload.slug}`, 'utf8').toString('base64url');
        const url = `${SHARE_SITE_URL.replace(/\/$/, '')}/api/soulti/soul-letter/unsubscribe?token=${token}`;
        return `
      不想再收到？<a href="${url}" style="color:#8b7355;text-decoration:underline;">一键退订</a>。`;
      })()
    : '';
  return `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:32px 16px;background:#FAF8F5;font-family:${SERIF};color:#2D2A26;">
  <div style="max-width:560px;margin:0 auto;background:#FDFCFA;border:1px solid rgba(139,115,85,0.18);border-radius:18px;padding:32px 28px;">
    <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8b7355;margin:0 0 18px;">SoulTI · Soul Letter</p>
    ${body}
    <hr style="border:0;border-top:1px solid rgba(139,115,85,0.18);margin:28px 0 18px;">
    <p style="font-size:11px;color:#a89f93;line-height:1.8;margin:0;">
      你正在收到「灵魂来信」是因为你在 SoulTI 测试结果页订阅了它。${unsubscribeBlock}
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

/** D+1 · 复盘信 (free) — confirms the test, mirrors what we observed, and seeds D+3. */
export function renderD1(payload: LetterPayload): RenderedLetter {
  const p = getSoultiPersonalityBySlug(payload.slug);
  const name = p?.name ?? '你';
  const level = tearLevel(payload.tearRatePercent);
  const tearLine =
    typeof payload.tearRatePercent === 'number'
      ? `你的撕裂度是 <strong>${payload.tearRatePercent}%</strong>。`
      : '你的撕裂度，我们替你记下了。';

  const reflection =
    level === 'extreme'
      ? '昨天那种"白天像在演别人，深夜才是自己"的感觉，不是错觉。'
      : level === 'split'
        ? '昨天那个让你想"安静一下"的瞬间，是身体替你按下的暂停键。'
        : level === 'partial'
          ? '昨天那一点不对劲，是你身体里两个频率在对位。'
          : '昨天的安静，可能不是迟钝，而是真正的统一。';

  const body = `
    <p style="font-size:18px;line-height:1.6;margin:0 0 14px;">${escapeHtml(`亲爱的「${name}」：`)}</p>
    <p style="font-size:14px;line-height:2;margin:0 0 14px;">昨天你做完测试，我们没有立刻打扰你。</p>
    <p style="font-size:14px;line-height:2;margin:0 0 14px;">${tearLine}</p>
    <p style="font-size:14px;line-height:2;margin:0 0 14px;">${escapeHtml(reflection)}</p>
    <p style="font-size:14px;line-height:2;margin:0 0 14px;">这一封是免费的复盘信。</p>
    <p style="font-size:14px;line-height:2;margin:0 0 6px;">第三天，会有一封「镜像信」给你——讲讲你白天那一面，正在替深夜的你撑住什么。</p>
    <p style="font-size:14px;line-height:2;margin:0 0 0;">第七天，是「修复信」，里面有一份只属于你这一型的小处方。</p>
    <p style="font-size:13px;line-height:2;color:#7A6A5A;margin:18px 0 0;font-style:italic;">— SoulTI 编辑组</p>
  `;
  return {
    kind: 'd1',
    subject: `「${name}」· 昨晚你测出的撕裂度，是这个意思`,
    text: stripHtml(body),
    html: htmlShell(`${name} · 复盘信`, body, { email: payload.email, slug: payload.slug }),
  };
}

/** D+3 · 镜像信 (paid) — uses SOUL_LETTERS keyed copy (J3+J5) to mirror the inner pair. */
export function renderD3(payload: LetterPayload): RenderedLetter {
  const p = getSoultiPersonalityBySlug(payload.slug);
  const name = p?.name ?? '你';
  const letter = pickSoulLetter(payload.code);
  const opening = letter?.opening ?? '今天，让我们看看你身体里的两个声音。';
  const lines = letter?.body ?? [
    '白天的你，往前推一步；深夜的你，往后退一步。',
    '这两个动作，不矛盾，是同一首歌的呼气和吸气。',
    '今天起，试着不再让"哪一个才是真的我"困住你。',
  ];
  const closing = letter?.closing ?? '愿你今晚不必选边。';

  const body = `
    <p style="font-size:18px;line-height:1.6;margin:0 0 14px;">${escapeHtml(`「${name}」·`)}</p>
    <p style="font-size:14px;line-height:2;margin:0 0 14px;">${escapeHtml(opening)}</p>
    ${lines
      .map(
        (l) =>
          `<p style="font-size:14px;line-height:2;margin:0 0 12px;">${escapeHtml(l)}</p>`,
      )
      .join('')}
    <p style="font-size:14px;line-height:2;margin:14px 0 0;">${escapeHtml(closing)}</p>
    <p style="font-size:13px;line-height:2;color:#7A6A5A;margin:24px 0 0;font-style:italic;">— SoulTI · 镜像信</p>
  `;

  return {
    kind: 'd3',
    subject: `「${name}」· 镜像信 · 第三天`,
    text: stripHtml(body),
    html: htmlShell(`${name} · 镜像信`, body, { email: payload.email, slug: payload.slug }),
  };
}

/** D+7 · 修复信 (paid) — pulls REPAIR_PRESCRIPTIONS for the user's J5 axis (G/K). */
export function renderD7(payload: LetterPayload): RenderedLetter {
  const p = getSoultiPersonalityBySlug(payload.slug);
  const name = p?.name ?? '你';
  const repair = getRepairForCode(payload.code);
  const heading = repair?.typeLabel ?? `给「${name}」的修复处方`;
  const intro = repair?.metaphor ?? '修复不是变成另一个人，而是让现在的你过得轻一点。';
  const items =
    repair?.strategies?.slice(0, 6) ??
    [
      { title: '今晚先停下来', description: '把手机翻过来 30 分钟。' },
      { title: '写一句话', description: '在备忘录写下：“今晚到此为止”。' },
    ];

  const itemsHtml = items
    .map(
      (it) => `
    <li style="margin:0 0 14px;">
      <p style="font-size:14px;line-height:1.7;margin:0 0 4px;color:#2D2A26;">${escapeHtml(it.title)}</p>
      <p style="font-size:13px;line-height:1.95;color:#5a5550;margin:0;">${escapeHtml(it.description)}</p>
    </li>`,
    )
    .join('');

  const body = `
    <p style="font-size:18px;line-height:1.6;margin:0 0 14px;">${escapeHtml(`「${name}」·`)}</p>
    <p style="font-size:16px;line-height:1.7;margin:0 0 8px;color:#2D2A26;">${escapeHtml(heading)}</p>
    <p style="font-size:14px;line-height:2;margin:0 0 18px;color:#5a5550;font-style:italic;">${escapeHtml(intro)}</p>
    <ul style="padding:0;margin:0;list-style:none;">${itemsHtml}</ul>
    <p style="font-size:13px;line-height:2;color:#7A6A5A;margin:24px 0 0;font-style:italic;">— SoulTI · 修复信</p>
  `;

  return {
    kind: 'd7',
    subject: `「${name}」· 修复信 · 第七天`,
    text: stripHtml(body),
    html: htmlShell(`${name} · 修复信`, body, { email: payload.email, slug: payload.slug }),
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const LETTER_RENDERERS: Record<LetterKind, (p: LetterPayload) => RenderedLetter> = {
  d1: renderD1,
  d3: renderD3,
  d7: renderD7,
};
