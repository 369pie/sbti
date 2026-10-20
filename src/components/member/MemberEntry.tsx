'use client';

import Link from 'next/link';
import { FEATURES, MEMBER_DAYS, MEMBER_PRICE_CNY } from '@/lib/entitlements';
import { memberHref, trackMemberEntry, useEntitlements } from '@/lib/member-client';

/** Plain text link (nav / inline). */
export function MemberEntryLink({ source, className, style, children }: {
  source: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <Link href={memberHref(source)} prefetch={false} className={className} style={style}
      onClick={() => trackMemberEntry(source)} data-member-entry={source}>
      {children ?? '会员'}
    </Link>
  );
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric' });
}

/** Card entry: shows status for members, pitch for everyone else. */
export function MemberEntryCard({ source, showUsage = false }: { source: string; showUsage?: boolean }) {
  const ent = useEntitlements();
  const isMember = !!ent?.isMember;
  const contentCount = FEATURES.filter((f) => f.kind === 'content').length;
  const usage = ent?.usage ?? [];
  return (
    <div className="s-card" data-member-card={source}
      style={{ padding: '18px 18px 16px', borderRadius: 18, border: '1px solid var(--s-accent, #C07A8E)', background: 'var(--s-paper, #fffaf4)' }}>
      <p className="s-eyebrow" style={{ margin: 0 }}>WTFTI 会员</p>
      {isMember ? (
        <>
          <p style={{ margin: '6px 0 2px', fontSize: 17, fontWeight: 600 }}>会员生效中 ✓</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--s-ink-2, #6b5d57)' }}>
            {ent?.expiresAt ? `${fmtDate(ent.expiresAt)}到期 · 不自动续费` : '全站付费内容已解锁'}
          </p>
        </>
      ) : (
        <>
          <p style={{ margin: '6px 0 2px', fontSize: 17, fontWeight: 600 }}>开会员，全站解锁</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--s-ink-2, #6b5d57)' }}>
            {contentCount} 类深度报告 / 合盘全免费 · AI 次数更多 · ¥{MEMBER_PRICE_CNY} / {MEMBER_DAYS} 天，不自动续费
          </p>
        </>
      )}
      {showUsage && usage.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
          {usage.map((u) => (
            <li key={u.key} style={{ color: 'var(--s-ink-2, #6b5d57)' }}>
              {u.label}：
              {u.cap == null ? '不限' : u.remaining == null ? `每月 ${u.cap} 次` : `剩 ${u.remaining}/${u.cap}`}
            </li>
          ))}
        </ul>
      )}
      <Link href={memberHref(source)} prefetch={false} onClick={() => trackMemberEntry(source)} className="s-btn"
        style={{ marginTop: 12, display: 'block', textAlign: 'center' }}>
        {isMember ? '查看会员权益' : `¥${MEMBER_PRICE_CNY} 开通会员`}
      </Link>
    </div>
  );
}
