'use client';

/**
 * CptiCompatibilityPredictor
 * ─────────────────────────────────────────────────────────────
 * Sprint 2 polish (2026-04-19) — E7 lite.
 *
 * Shows the user's top 3 most compatible CPTI personalities and what
 * relationship type they'd most likely form. Each row links to the
 * relationship type SEO page (cross-links + curiosity loop).
 */

import { useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  predictTopCompatible,
  type CompatibilityPrediction,
} from '@/lib/cpti/compatibility-prediction';
import {
  getCptiTypeMediumImage,
  type CptiPersonalityType,
} from '@/lib/cpti/personalities';
import type { CptiDimensionScore } from '@/lib/cpti/scoring';
import { trackCptiEvent } from '@/lib/cpti/analytics';

interface Props {
  personality: CptiPersonalityType;
  dimensionScores: CptiDimensionScore[];
}

export function CptiCompatibilityPredictor({ personality, dimensionScores }: Props) {
  const trackedRef = useRef(false);

  const predictions = useMemo<CompatibilityPrediction[]>(
    () =>
      predictTopCompatible(dimensionScores, {
        limit: 3,
        excludeSlug: personality.slug,
      }),
    [dimensionScores, personality.slug],
  );

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackCptiEvent('cpti_prediction_viewed', {
      mySlug: personality.slug,
      topPartner: predictions[0]?.partner.slug,
      topRelationship: predictions[0]?.result.relationship.slug,
    });
  }, [predictions, personality.slug]);

  if (predictions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-text-primary">
            🔮 你最容易出 CP 的 3 种人
          </h3>
          <p className="text-xs text-text-muted mt-1">
            根据你 5 个维度的组合预测 · 找到这种人测一下，验证准不准
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {predictions.map(({ partner, result }, idx) => {
          const rel = result.relationship;
          return (
            <li key={partner.slug}>
              <Link
                href={`/cpti/relationship/${rel.slug}/`}
                onClick={() =>
                  trackCptiEvent('cpti_prediction_clicked', {
                    mySlug: personality.slug,
                    partnerSlug: partner.slug,
                    relationshipSlug: rel.slug,
                    rank: idx + 1,
                  })
                }
                className="group flex items-center gap-3 sm:gap-4 rounded-xl bg-bg-secondary/40 hover:bg-bg-secondary border border-transparent hover:border-border-subtle p-3 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden relative bg-bg-primary">
                  <NextImage
                    src={getCptiTypeMediumImage(partner.slug)}
                    alt={partner.name}
                    fill
                    sizes="56px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-mono text-text-muted">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {partner.name}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {partner.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-text-muted">→ 大概率出</span>
                    <span
                      className="font-semibold"
                      style={{ color: rel.color }}
                    >
                      {rel.emoji} {rel.name}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-lg sm:text-xl font-bold font-mono leading-none"
                    style={{ color: rel.color }}
                  >
                    {result.compatibility}%
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">兼容度</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 pt-4 border-t border-border-subtle text-center">
        <p className="text-xs text-text-muted">
          💡 想验证？把测试发给你身边像这种人格的人 ↑
        </p>
      </div>
    </div>
  );
}
