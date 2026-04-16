'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { loadCard, type RelationshipRecord } from '@/lib/wtf-card';
import {
  CPTI_RELATIONSHIP_TYPES,
  RELATIONSHIP_TIER_INFO,
  type CptiRelationshipType,
  type RelationshipTier,
} from '@/lib/cpti/relationships';
import { cptiApi } from '@/lib/cpti/cpti-api';

type TierGroup = {
  key: RelationshipTier;
  types: CptiRelationshipType[];
};

export function CptiGalleryContent() {
  const [relationships, setRelationships] = useState<RelationshipRecord[]>([]);
  const [syncedSlugs, setSyncedSlugs] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<CptiRelationshipType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load local relationships from WTF Card
    const card = loadCard();
    if (card?.relationships) {
      setRelationships(card.relationships);
    }

    // Also fetch from backend
    cptiApi.getCollection().then(data => {
      if (data?.recentRelationships?.length > 0) {
        const backendSlugs = new Set(data.recentRelationships.map(r => r.slug));
        setSyncedSlugs(backendSlugs);
        // Merge: keep unique by slug, prefer backend data
        const localSlugs = new Set(card?.relationships?.map(r => r.slug) ?? []);
        const merged = [...(card?.relationships ?? [])];
        for (const br of data.recentRelationships) {
          if (!localSlugs.has(br.slug)) {
            merged.push({
              slug: br.slug,
              compatibility: br.compatibility,
              partnerNickname: '',
              mySlug: '',
              partnerSlug: br.otherPersonality,
              testedAt: br.createdAt,
            });
          }
        }
        setRelationships(merged);
      }
    }).catch(() => { /* offline fallback — local only */ });
  }, []);

  const collectedSlugs = new Set(relationships.map(r => r.slug));
  const total = CPTI_RELATIONSHIP_TYPES.length;
  const collected = collectedSlugs.size;

  const tiers: TierGroup[] = [
    { key: 'viral', types: CPTI_RELATIONSHIP_TYPES.filter(t => t.tier === 'viral') },
    { key: 'deep', types: CPTI_RELATIONSHIP_TYPES.filter(t => t.tier === 'deep') },
    { key: 'rare', types: CPTI_RELATIONSHIP_TYPES.filter(t => t.tier === 'rare') },
  ];

  const latestFor = (slug: string) =>
    relationships.find(r => r.slug === slug);

  const pct = total > 0 ? (collected / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-4">
        <Link
          href="/cpti/"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors mb-4 inline-block"
        >
          ← 返回 CPTI
        </Link>

        <motion.div
          initial={mounted ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            💕 CP关系图鉴
          </h1>
          <p className="text-sm text-text-muted mb-4">
            25种CP关系类型 · 3个稀有度梯队 · 邀请朋友测试来收集
          </p>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-secondary font-medium">
                已收集 {collected} / {total}
              </span>
              <span className="text-text-muted font-mono">
                {Math.round(pct)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #f43f5e, #ec4899, #a855f7)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gallery Grid */}
      <main className="max-w-2xl mx-auto px-6 pb-20">
        <div className="space-y-8">
          {tiers.map(({ key, types }, tierIdx) => {
            const tierInfo = RELATIONSHIP_TIER_INFO[key];
            const tierCollected = types.filter(t => collectedSlugs.has(t.slug)).length;

            return (
              <motion.div
                key={key}
                initial={mounted ? { opacity: 0, y: 16 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + tierIdx * 0.15, duration: 0.4 }}
              >
                {/* Tier header */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: tierInfo.color }}
                  />
                  <span className="text-sm font-semibold" style={{ color: tierInfo.color }}>
                    {tierInfo.label}
                  </span>
                  <span className="text-xs text-text-muted font-mono ml-auto">
                    {tierCollected} / {types.length}
                  </span>
                </div>

                {/* Type cards */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {types.map(relType => {
                    const isCollected = collectedSlugs.has(relType.slug);
                    const record = isCollected ? latestFor(relType.slug) : null;

                    return (
                      <button
                        key={relType.slug}
                        onClick={() => setSelectedType(relType)}
                        className={`relative group rounded-xl p-2.5 text-center transition-all cursor-pointer ${
                          isCollected
                            ? 'bg-bg-elevated border border-border-subtle hover:border-border hover:shadow-md'
                            : 'bg-bg-secondary/40 border border-dashed border-border/50 opacity-60 hover:opacity-80'
                        }`}
                      >
                        {/* Synced indicator */}
                        {isCollected && syncedSlugs.has(relType.slug) && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}

                        <div className={`text-2xl leading-none mb-1.5 ${isCollected ? '' : 'grayscale opacity-50'}`}>
                          {relType.emoji}
                        </div>
                        <div className={`text-[10px] leading-tight truncate ${
                          isCollected ? 'text-text-secondary font-medium' : 'text-text-muted'
                        }`}>
                          {relType.name}
                        </div>

                        {isCollected && record && (
                          <div className="text-[9px] mt-0.5 font-mono" style={{ color: relType.color }}>
                            {record.compatibility}%
                          </div>
                        )}

                        {!isCollected && (
                          <div className="text-[8px] mt-0.5 text-text-muted">
                            ???
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={mounted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/cpti/join"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-rose-500 text-white font-medium text-base hover:bg-rose-500/90 transition-all"
          >
            邀请朋友测试
          </Link>
          <p className="text-xs text-text-muted mt-3">
            每次配对都有机会解锁新关系类型
          </p>
        </motion.div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setSelectedType(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md mx-4 rounded-t-2xl sm:rounded-2xl bg-bg-primary border border-border-subtle p-6 max-h-[80vh] overflow-y-auto"
            >
              <RelationshipDetail
                type={selectedType}
                isCollected={collectedSlugs.has(selectedType.slug)}
                record={latestFor(selectedType.slug) ?? null}
                onClose={() => setSelectedType(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RelationshipDetail({
  type,
  isCollected,
  record,
  onClose,
}: {
  type: CptiRelationshipType;
  isCollected: boolean;
  record: RelationshipRecord | null;
  onClose: () => void;
}) {
  const tierInfo = RELATIONSHIP_TIER_INFO[type.tier];

  return (
    <div>
      {/* Close button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-3">{type.emoji}</div>
        <h2 className="text-xl font-bold text-text-primary">{type.name}</h2>
        <p className="text-xs font-mono tracking-wider mt-1" style={{ color: type.color }}>
          {type.code}
        </p>
      </div>

      {/* Tier badge */}
      <div className="flex justify-center mb-4">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: tierInfo.bgColor, color: tierInfo.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: tierInfo.color }} />
          {tierInfo.label}
        </span>
      </div>

      {/* Tagline */}
      <p className="text-sm text-text-secondary text-center italic mb-4">
        &ldquo;{type.tagline}&rdquo;
      </p>

      {/* Description */}
      {isCollected ? (
        <div className="text-sm text-text-secondary leading-relaxed mb-4">
          {type.description}
        </div>
      ) : (
        <div className="rounded-xl bg-bg-secondary/50 border border-dashed border-border p-4 text-center mb-4">
          <p className="text-sm text-text-muted">
            完成配对测试后解锁详细描述
          </p>
        </div>
      )}

      {/* Collected info */}
      {isCollected && record && (
        <div
          className="rounded-xl border p-4 mb-4"
          style={{ borderColor: `${type.color}30`, background: `${type.color}08` }}
        >
          <div className="text-xs text-text-muted mb-2">配对记录</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              与 {record.partnerNickname || '好友'}
            </span>
            <span className="text-sm font-mono font-medium" style={{ color: type.color }}>
              {record.compatibility}% 匹配度
            </span>
          </div>
        </div>
      )}

      {/* Action */}
      {!isCollected && (
        <Link
          href="/cpti/join"
          className="block w-full text-center px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-500/90 transition-colors"
        >
          去配对，解锁这个关系类型
        </Link>
      )}
    </div>
  );
}
