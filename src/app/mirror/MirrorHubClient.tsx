'use client';

/**
 * /mirror · 美我 hub（P2 + P3 会员额度）
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { MembershipSubscribeCard } from '@/components/MembershipSubscribeCard';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { getApiPath } from '@/lib/api';
import { MEMBER_TRY_ON_CAP } from '@/lib/her/membership';

import styles from './mirror-hub.module.css';

type MembershipState =
  | { status: 'unknown' }
  | { status: 'guest' }
  | { status: 'ready'; isMember: boolean; expiresAt: string | null };

const CARDS = [
  {
    href: '/mirror/color/',
    title: '色彩季型',
    badge: '写入档案',
    desc: '三道小问题（可加自拍），季型标签写入档案，今日幸运色会更准。',
    cta: '测我的季型 →',
    tone: 'accent' as const,
    lined: true,
  },
  {
    href: '/mirror/face/',
    title: '脸型 · 妆容',
    badge: '写入档案',
    desc: '自述脸型 + 可选自拍，固定妆容库建议。深度 AI 妆发仍在灵镜 Atelier。',
    cta: '看我的妆容建议 →',
    tone: 'accent' as const,
    lined: false,
  },
  {
    href: '/mirror/atelier/?mode=compare',
    title: '静态换装',
    badgeFree: '每月 3 次免费',
    badgeMember: `会员每月 ${MEMBER_TRY_ON_CAP} 次`,
    desc: '单张试衣约十几秒。登录用户有月免额度，超出扣灵币。未满 18 岁不做泳装内衣类。',
    cta: '换一身试试 →',
    tone: 'muted' as const,
    lined: false,
  },
  {
    href: '/mirror/palm/',
    title: '掌纹',
    badge: '仪式感',
    desc: '拍掌心，照片上标出四条主线；同图同手结果一致。照片处理完即丢弃。',
    cta: '去看掌纹 →',
    tone: 'accent' as const,
    lined: false,
  },
  {
    href: '/mirror/atelier/?mode=beauty',
    title: '灵镜 Atelier',
    badge: '按次灵币',
    desc: '深度妆发 / 色彩 / 风格对比生成。尝鲜后按次付费。',
    cta: '打开 Atelier →',
    tone: 'muted' as const,
    lined: false,
  },
] as const;

export function MirrorHubClient() {
  const [membership, setMembership] = useState<MembershipState>({ status: 'unknown' });

  useEffect(() => {
    trackFunnelEvent('module_landing_view', { module: 'wtfti', source: '/mirror' });
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiPath('/her/membership/'), {
          credentials: 'include',
          cache: 'no-store',
        });
        if (cancelled) return;
        if (res.status === 401) {
          setMembership({ status: 'guest' });
          return;
        }
        if (!res.ok) {
          setMembership({ status: 'guest' });
          return;
        }
        const data = (await res.json()) as {
          isMember?: boolean;
          expiresAt?: string | null;
        };
        setMembership({
          status: 'ready',
          isMember: data.isMember === true,
          expiresAt: data.expiresAt ?? null,
        });
      } catch {
        if (!cancelled) setMembership({ status: 'guest' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isMember = membership.status === 'ready' && membership.isMember;

  return (
    <main className={`skin-journal ${styles.page}`}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className="s-eyebrow">美我 · MIRROR</p>
          <h1 className={`s-title ${styles.hi}`}>
            变好看，从<em>认识自己</em>开始
          </h1>
          <p className={styles.lead}>
            色彩、脸型妆容、换装、掌纹——写进档案，让「今日」更像为你写的。
            {isMember
              ? ` 会员本月换装额度 ${MEMBER_TRY_ON_CAP} 次。`
              : ' 会员可提升换装额度，全站深度报告免费。'}
          </p>
        </header>

        <div className={styles.grid}>
          {CARDS.map((c) => {
            const badge =
              'badge' in c
                ? c.badge
                : isMember
                  ? c.badgeMember
                  : c.badgeFree;
            return (
              <Link
                key={c.href + c.title}
                href={c.href}
                prefetch={false}
                className={`s-card ${c.lined ? 's-card--lined' : ''} ${styles.card}`}
              >
                {c.lined ? <span className="s-tape s-tape--peach" aria-hidden /> : null}
                <div className={styles.cardTop}>
                  <h2 className={`s-title ${styles.cardTitle}`}>{c.title}</h2>
                  <span className={`${styles.badge} ${c.tone === 'muted' ? styles.badgeMuted : ''}`}>
                    {badge}
                  </span>
                </div>
                <p className={styles.desc}>{c.desc}</p>
                <span className={styles.cta}>{c.cta}</span>
              </Link>
            );
          })}
        </div>

        {membership.status !== 'unknown' ? (
          <div className={styles.memberSlot}>
            {membership.status === 'guest' ? (
              <section className={`s-card ${styles.guestMember}`}>
                <p className="s-eyebrow">会员 · ¥19/月</p>
                <p className={styles.guestMemberText}>
                  登录后可开通会员：美我月额度提升到 {MEMBER_TRY_ON_CAP} 次，全站深度报告免费，完整今日解锁。
                  到期不自动续费。
                </p>
                <Link href="/auth/login/?next=%2Fmirror%2F" prefetch={false} className="s-btn">
                  登录后开通
                </Link>
              </section>
            ) : (
              <MembershipSubscribeCard
                redirectPath="/mirror/"
                skin="journal"
                variant="card"
                isMember={isMember}
                expiresAt={membership.expiresAt}
              />
            )}
          </div>
        ) : null}

        <p className={styles.note}>
          人脸 / 掌纹 / 全身照只用于本次生成，处理完即删除，不入库、不公开展示。未满 18
          岁不做泳装内衣类换装。
        </p>
      </div>
    </main>
  );
}
