'use client';

/**
 * TomorrowRitualCta · D0→D1 收口卡（Phase A · 权威战略 §10 裁决 4）
 *
 * 结果页（被看见层）唯一的留存收口：只通向 /today（被陪伴）与第一封信（被记住）。
 * 同时用于 galaxy 结果页与经典 WTFTI 结果页，品牌样式内联（暮紫 × 金箔 × 玫瑰）。
 */

import Link from 'next/link';

import { trackFunnelEvent, type FunnelModule } from '@/lib/analytics/funnel';
import { basePath } from '@/lib/site';

interface Props {
  fromModule?: FunnelModule;
  /** 埋点上下文（页面位置标识） */
  source?: string;
}

export function TomorrowRitualCta({ fromModule = 'wtfti', source = 'result-tomorrow-cta' }: Props) {
  const track = () => {
    try {
      trackFunnelEvent('cross_module_unlock_click', {
        module: fromModule,
        fromModule,
        toModule: 'wtfti',
        source,
      });
    } catch {
      /* noop */
    }
  };

  return (
    <section aria-label="明天的仪式 · 留存收口" style={{ maxWidth: 720, margin: '0 auto', padding: '8px 20px 40px' }}>
      <div
        style={{
          borderRadius: 24,
          padding: '28px 26px',
          background:
            'radial-gradient(ellipse at top, rgba(156,124,255,0.14), rgba(26,21,48,0) 55%), rgba(20,15,42,0.6)',
          border: '1px solid rgba(201,166,118,0.26)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 10,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: '#D4B58A',
            opacity: 0.85,
            margin: 0,
          }}
        >
          Tomorrow · 明天的仪式
        </p>
        <h3
          style={{
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
            fontStyle: 'italic',
            fontSize: 23,
            fontWeight: 400,
            color: '#F5F0E8',
            margin: '12px 0 8px',
          }}
        >
          测完啦。明天回来抽个签。
        </h3>
        <p
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 13,
            lineHeight: 1.85,
            color: 'rgba(245,240,232,0.7)',
            maxWidth: 460,
            margin: '0 auto 20px',
          }}
        >
          明天来领每日签——一张牌、一句运势、月亮打卡，
          30 秒搞定；再写一颗给 30 天后自己的时间胶囊，我们替你存着。
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Link
            href={`${basePath}/today`}
            onClick={track}
            prefetch={false}
            style={{
              display: 'inline-block',
              padding: '13px 26px',
              borderRadius: 999,
              background: 'linear-gradient(120deg, #C07A8E, #C9A676)',
              color: '#1A1530',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            去领每日签 →
          </Link>
          <Link
            href={`${basePath}/wtfti/letters/`}
            onClick={track}
            prefetch={false}
            style={{
              display: 'inline-block',
              padding: '13px 26px',
              borderRadius: 999,
              border: '1px solid rgba(192,122,142,0.45)',
              color: '#E7C6C0',
              textDecoration: 'none',
              fontSize: 13.5,
              letterSpacing: '0.08em',
            }}
          >
            写第一颗时间胶囊
          </Link>
        </div>
      </div>
    </section>
  );
}
