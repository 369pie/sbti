'use client';

/**
 * CPTI 2.0 — 男性反向报告 client.
 *
 * Visual constraint: must look distinct from the pink-leaning female-side
 * result page. We use 米白底 + 深褐字 + 金箔单线，no rose gradients, no
 * emoji in body copy.
 */

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CptiRelationshipType } from '@/lib/cpti/relationships';
import { buildHisPovReport } from '@/lib/cpti/his-pov';
import { trackCptiEvent } from '@/lib/cpti/analytics';

interface Props {
  relationship: CptiRelationshipType;
}

const TONE_BADGE: Record<'soft' | 'mid' | 'edge', { label: string; color: string }> = {
  soft: { label: '柔', color: '#8a7355' },
  mid:  { label: '中', color: '#6b5b3f' },
  edge: { label: '锋', color: '#3f3a2e' },
};

export function CptiHisPovClient({ relationship }: Props) {
  const searchParams = useSearchParams();

  const { hisSlug, herSlug, compatibility } = useMemo(() => {
    const c = Number(searchParams.get('c') ?? '');
    return {
      hisSlug: searchParams.get('his') ?? 'balanced',
      herSlug: searchParams.get('her') ?? undefined,
      compatibility: Number.isFinite(c) && c >= 0 && c <= 100 ? c : 65,
    };
  }, [searchParams]);

  const report = useMemo(
    () => buildHisPovReport(relationship, compatibility, hisSlug, herSlug),
    [relationship, compatibility, hisSlug, herSlug],
  );

  useEffect(() => {
    trackCptiEvent('cpti_his_pov_viewed', {
      relationship: relationship.slug,
      personality: hisSlug,
      target: herSlug,
    });
  }, [relationship.slug, hisSlug, herSlug]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-[640px] px-5 py-10">
        {/* Eyebrow */}
        <div className="mb-3 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em] text-gold">
          <span>CPTI · His POV</span>
          <span className="h-px flex-1 bg-gold/40" />
          <span>{relationship.code}</span>
        </div>

        <h1
          className="text-[34px] leading-[1.15] font-serif"
          style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif', fontStyle: 'italic' }}
        >
          在她眼里
          <br />
          你是谁
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          她邀请你测了「{relationship.name}」。这是给你的报告 —— 不是教你怎么哄她，
          是让你看见她现在是怎么看这段关系的。
        </p>

        {/* Section I — 在她眼里 */}
        <Section roman="I" title="她对你的定位">
          <p className="text-[15px] leading-[1.85] text-text-primary">{report.herView}</p>
        </Section>

        {/* Section II — 走向 */}
        <Section roman="II" title="这段关系正在向哪里去">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-serif text-gold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              {report.direction.arrow}
            </span>
            <span className="text-base font-medium tracking-wide">{report.direction.label}</span>
            <span className="ml-auto text-[11px] font-mono text-gold">
              compatibility {compatibility}/100
            </span>
          </div>
          <p className="mt-3 text-[15px] leading-[1.85] text-text-primary">{report.direction.body}</p>
        </Section>

        {/* Section III — 升级建议 */}
        <Section roman="III" title="想让这段关系更稳，先做这件事">
          <ul className="space-y-5">
            {report.upgrades.map((u, i) => (
              <li key={i} className="border-l-2 border-gold/50 pl-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-gold">
                    NO.{String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: TONE_BADGE[u.tone].color + '14', color: TONE_BADGE[u.tone].color }}
                  >
                    {TONE_BADGE[u.tone].label}
                  </span>
                </div>
                <h3 className="text-[15px] font-medium text-text-primary">{u.title}</h3>
                <p className="mt-1 text-[14px] leading-[1.85] text-text-secondary">{u.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* CTAs */}
        <div className="mt-12 space-y-3">
          <Link
            href="/cpti/test/"
            onClick={() => trackCptiEvent('cpti_his_pov_cta_clicked', { target: 'cpti-self', relationship: relationship.slug })}
            className="block w-full rounded-xl bg-text-primary py-4 text-center text-[15px] font-medium text-bg-primary transition active:scale-[0.98]"
          >
            测一下你自己是哪种 CPTI 角色 →
          </Link>
          <Link
            href="/xpti/"
            onClick={() => trackCptiEvent('cpti_his_pov_cta_clicked', { target: 'xpti', relationship: relationship.slug })}
            className="block w-full rounded-xl border border-gold/60 py-4 text-center text-[14px] font-medium text-text-secondary transition hover:bg-gold/8"
          >
            测你想要的亲密关系是什么样 → XPTI
          </Link>
          <Link
            href={`/cpti/relationship/${relationship.slug}/`}
            className="block py-3 text-center text-[12px] font-mono uppercase tracking-[0.24em] text-gold hover:text-text-primary"
          >
            查看「{relationship.name}」完整描述
          </Link>
        </div>

        <footer className="mt-16 border-t border-gold/30 pt-6 text-center text-[10px] font-mono uppercase tracking-[0.32em] text-gold">
          CPTI · 关系图鉴 · His POV
        </footer>
      </div>
    </div>
  );
}

function Section({ roman, title, children }: { roman: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className="text-2xl text-gold"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic' }}
        >
          {roman}
        </span>
        <h2 className="text-[15px] font-medium tracking-wide text-text-primary">{title}</h2>
        <span className="h-px flex-1 bg-gold/30" />
      </div>
      {children}
    </section>
  );
}
