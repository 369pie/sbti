'use client';

/**
 * 决策入口页底部升级 banner —— 显示当前 30 天剩余配额，
 * 配额 ≤ 1 或没有 decision-pack 时露出 ¥4.9 销售卡。
 *
 * 服务端渲染时静默；hydration 后才呈现，避免水合不一致。
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getQuotaStatus,
  hasDecisionPack,
  type QuotaStatus,
} from '@/lib/mysti/decision-quota';
import { DecisionPackPaywall } from './DecisionPackPaywall';

export function DecisionDeckUpgradeBanner() {
  const [hydrated, setHydrated] = useState(false);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [pack, setPack] = useState(false);

  useEffect(() => {
    setQuota(getQuotaStatus());
    setPack(hasDecisionPack());
    setHydrated(true);
  }, []);

  if (!hydrated || !quota) return null;

  // 已解锁场景包：仅展示状态条 + sigil 升级位
  if (pack) {
    return (
      <div
        style={{
          marginTop: 40,
          padding: '18px 22px',
          borderRadius: 16,
          border: '1px solid rgba(201,166,118,0.32)',
          background: 'rgba(48,32,72,0.55)',
          color: '#F5F0E8',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.42em',
            color: '#C9A676',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          ✦ DECISION PACK · 已激活
        </div>
        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.78)' }}>
          {quota.remaining === 0
            ? `30 天剩余 ${quota.remaining}/${quota.total} 次 · 这一轮已抽满 · 等额度恢复后再继续`
            : `30 天剩余 ${quota.remaining}/${quota.total} 次 · 高级金句池开启 · 继续抽签即可`}
        </p>
        <Link
          href={quota.remaining === 0 ? '/mysti/archive/' : '/mysti/sigil/'}
          style={{
            fontSize: 12,
            letterSpacing: '0.18em',
            color: '#C9A676',
            textDecoration: 'none',
            marginTop: 4,
          }}
        >
          {quota.remaining === 0
            ? '✦ 想回看已经抽过的签？ → 我的灵鉴档案'
            : '✦ 想留下年度纪念册？ → 年度纪章册'}
        </Link>
      </div>
    );
  }

  // 未解锁：低剩余时露出销售卡；剩余充足时仅展示状态
  if (quota.remaining > 1) {
    return (
      <p
        style={{
          marginTop: 32,
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'rgba(245,240,232,0.55)',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        本月免费配额剩余 {quota.remaining}/{quota.total} 次 ·
        想要更多？解锁场景包 ¥4.9
      </p>
    );
  }

  return (
    <div style={{ marginTop: 40 }}>
      <DecisionPackPaywall
        variant="banner"
        subtitle={
          quota.remaining === 0
            ? '本月免费配额已经用完——解锁场景包，今晚就能继续。'
            : '本月只剩最后一次免费抽签——想接着抽，就让暮光替你打开下一个 30 天。'
        }
      />
    </div>
  );
}
