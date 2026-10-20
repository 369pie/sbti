'use client';

/**
 * /member/ — the ONE membership (audit 2026-10-20 decision 4).
 * Replaces /mysti/subscribe (暮光通行证), /xpti/pricing, /cpti/pricing (308 here).
 * Single reports stay purchasable on their own result pages.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { MembershipSubscribeCard } from '@/components/MembershipSubscribeCard';
import { readApiJson } from '@/lib/api';
import { MEMBERSHIP_PRICE_LABEL } from '@/lib/her/membership-benefits';
import { getOrCreateDeviceId } from '@/lib/mysti/device';

interface MembershipResp {
  ok?: boolean;
  claimed?: boolean;
  isMember?: boolean;
  expiresAt?: string | null;
  source?: 'her_profiles' | 'legacy_pass' | null;
}

const SINGLES: Array<{ name: string; desc: string; href: string }> = [
  { name: '我和他 · 双人关系报告', desc: '你们俩都测完后解锁，可 AA 各付一半', href: '/xpti/couple/' },
  { name: 'SoulTI · 深夜长信', desc: '测完 SoulTI 后在结果页解锁', href: '/soulti/test/' },
];

export function MemberContent() {
  const [state, setState] = useState<MembershipResp | null>(null);

  useEffect(() => {
    const deviceId = getOrCreateDeviceId() || '';
    fetch(`/api/her/membership/?deviceId=${encodeURIComponent(deviceId)}`, { credentials: 'include' })
      .then((r) => readApiJson<MembershipResp>(r))
      .then(setState)
      .catch(() => setState({ ok: false }));
  }, []);

  return (
    <main className="skin-journal" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px' }}>
        <p className="s-eyebrow">Membership · 会员</p>
        <h1 className="s-title" style={{ fontSize: 34, margin: '10px 0 8px' }}>
          一个会员，全部都有
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--s-ink-2)', margin: '0 0 20px' }}>
          {MEMBERSHIP_PRICE_LABEL}，一次开通 30 天，到期不自动续费。今日卡、美我、我和他、塔罗用的是同一个会员。
        </p>

        {state?.source === 'legacy_pass' ? (
          <p className="s-card" style={{ padding: '12px 14px', fontSize: 13, color: 'var(--s-ink-2)', marginBottom: 14 }}>
            你之前开通的「暮光通行证」已自动算作会员，权益到原到期日为止。
          </p>
        ) : null}

        <MembershipSubscribeCard
          redirectPath="/member/"
          skin="journal"
          variant="card"
          isMember={!!state?.isMember}
          expiresAt={state?.expiresAt ?? null}
        />

        {state && !state.claimed && !state.isMember ? (
          <p style={{ fontSize: 12, color: 'var(--s-mute)', margin: '12px 2px 0', lineHeight: 1.6 }}>
            建议先
            <Link href="/auth/register/?next=%2Fmember%2F" prefetch={false} style={{ color: 'var(--s-accent-text)' }}>
              绑定账号
            </Link>
            再开通，换手机也不丢会员。
          </p>
        ) : null}

        <section style={{ marginTop: 28 }}>
          <p className="s-eyebrow">Single reports · 单次报告</p>
          <h2 className="s-title" style={{ fontSize: 22, margin: '8px 0 12px' }}>不想开会员？单买也行</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {SINGLES.map((s) => (
              <Link key={s.name} href={s.href} prefetch={false} className="s-card" style={{ padding: '14px 16px', display: 'block' }}>
                <span style={{ display: 'block', fontSize: 15, color: 'var(--s-ink)', fontWeight: 500 }}>{s.name}</span>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--s-mute)', marginTop: 4 }}>{s.desc} · 会员 8 折</span>
              </Link>
            ))}
          </div>
        </section>

        <p style={{ fontSize: 12, color: 'var(--s-mute)', marginTop: 28, lineHeight: 1.7 }}>
          支付由虎皮椒（微信 / 支付宝）处理。到期后需你主动续费，我们不会自动扣款。仅供娱乐与自我探索。
        </p>
      </div>
    </main>
  );
}
