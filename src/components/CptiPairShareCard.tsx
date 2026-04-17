'use client';

/**
 * CPTI Pair Share Card (E-06)
 *
 * Minimal double-sided share visual for relationship results. Generates a
 * 1080×1350 (9:16-ish) canvas-free SVG that both partners can save. Designed
 * to be embedded in CptiRelationshipResult after user + partner both enter
 * their CPTI codes.
 *
 * This is a simple SVG renderer (not a next/og image) to keep it export-safe.
 */

import { getRelationshipRarity } from '@/lib/cpti/relationships-rarity';
import { getRelationshipBySlug } from '@/lib/cpti/relationships';

interface Props {
  slug: string;
  userCode: string;
  partnerCode: string;
  userName?: string;
  partnerName?: string;
}

export default function CptiPairShareCard({
  slug, userCode, partnerCode, userName = '她', partnerName = 'TA',
}: Props) {
  const rel = getRelationshipBySlug(slug);
  const rarity = getRelationshipRarity(slug);

  if (!rel) {
    return <div className="text-sm text-text-muted">未找到该关系类型</div>;
  }

  return (
    <div className="max-w-sm mx-auto">
      <div
        className="relative rounded-3xl overflow-hidden border shadow-xl aspect-[4/5]"
        style={{
          borderColor: rarity.color,
          background: `linear-gradient(160deg, ${rel.color}1a 0%, ${rarity.bgColor} 100%)`,
        }}
      >
        {/* Rarity ribbon */}
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider"
          style={{ background: rarity.bgColor, color: rarity.color, border: `1px solid ${rarity.color}` }}
        >
          {rarity.label} · {rarity.populationPct.toFixed(1)}%
        </div>

        {/* Emoji */}
        <div className="pt-14 text-center text-7xl">{rel.emoji}</div>

        {/* Name */}
        <div className="text-center mt-4 px-6">
          <div className="text-2xl font-semibold text-text-primary tracking-tight">{rel.name}</div>
          <div className="text-sm text-text-secondary mt-2 italic">{rel.tagline}</div>
        </div>

        {/* Pair footer */}
        <div className="absolute bottom-0 inset-x-0 px-6 py-5 bg-gradient-to-t from-black/30 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-[10px] font-mono text-white/70 uppercase">{userName}</div>
              <div className="text-sm font-semibold text-white tracking-wider">{userCode}</div>
            </div>
            <div className="text-white/60 text-xs">×</div>
            <div className="text-center">
              <div className="text-[10px] font-mono text-white/70 uppercase">{partnerName}</div>
              <div className="text-sm font-semibold text-white tracking-wider">{partnerCode}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-text-muted">
        长按保存 · 一起分享给 TA · WTFTI · CPTI
      </div>
    </div>
  );
}
