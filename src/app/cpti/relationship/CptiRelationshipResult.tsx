'use client';

import dynamic from 'next/dynamic';

import { useSyncExternalStore, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { CptiRelationshipType } from '@/lib/cpti/relationships';
import {
  RELATIONSHIP_TIER_INFO,
  CPTI_RELATIONSHIP_TYPES,
  getCptiRelationshipTypeImage,
  getCptiRelationshipTypeThumbnailImage,
} from '@/lib/cpti/relationships';
import type { DimensionPair } from '@/lib/cpti/relationship-matching';
import { CPTI_DIMENSIONS, CPTI_MODEL_NAMES, CPTI_MODEL_COLORS } from '@/lib/cpti/dimensions';
import type { CptiDimensionScore } from '@/lib/cpti/scoring';
import { getCptiPersonalityBySlug, getCptiTypeImage, getCptiTypeThumbnailImage } from '@/lib/cpti/personalities';
import { getSiteUrl } from '@/lib/site';
import { encodeRelationshipLink, decodeRelationshipLink } from '@/lib/cpti/cpti-relationship-link';
const CptiRelationshipShareImageGenerator = dynamic(
  () => import('@/components/CptiRelationshipShareImageGenerator').then((m) => m.CptiRelationshipShareImageGenerator),
  { ssr: false },
);
import type { CptiRelationshipShareImageGeneratorHandle } from '@/components/CptiRelationshipShareImageGenerator';
import { ClaimAssetCard } from '@/components/ClaimAssetCard';
import CptiPairShareCard from '@/components/CptiPairShareCard';
import { SendAsGiftCTA } from '@/components/SendAsGiftCTA';
import { trackCptiEvent } from '@/lib/cpti/analytics';
import { getRelationshipRarity } from '@/lib/cpti/relationships-rarity';
import {
  CPTI_SEASONAL_SKINS,
  getSkinSku,
  isSkinInWindow,
  type CptiSeasonalSkinId,
} from '@/lib/cpti/seasonal-skins';
import { cptiApi } from '@/lib/cpti/cpti-api';
import { useDeferredShareGenerate } from '@/lib/perf/use-deferred-share-generate';

const emptySubscribe = () => () => {};

interface StoredRelationshipData {
  relationship: CptiRelationshipType;
  pairs: DimensionPair[];
  compatibility: number;
  nicknameA: string;
  personalitySlugA: string;
  personalitySlugB: string;
  dimsA: CptiDimensionScore[];
  dimsB: CptiDimensionScore[];
}

interface BackendRelationshipData {
  relationship: {
    id: string;
    slug: string;
    tier: string;
    compatibility: number;
  };
  participantProfile?: {
    personality: {
      slug: string;
    };
    dimensions: CptiDimensionScore[];
  };
  collectionProgress?: {
    collected: number;
    total: number;
  };
}

function levelNum(l: string): number {
  return l === 'H' ? 3 : l === 'M' ? 2 : 1;
}

function getCptiPersonalityImageSrc(slug: string, mode: 'full' | 'thumb' | 'emoji'): string {
  if (mode === 'emoji') return '';
  return mode === 'full' ? getCptiTypeImage(slug) : getCptiTypeThumbnailImage(slug);
}

export function CptiRelationshipResult() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [returnLinkCopied, setReturnLinkCopied] = useState(false);
  const [relImageMode, setRelImageMode] = useState<'full' | 'thumb' | 'emoji'>('full');
  const [aImageMode, setAImageMode] = useState<'full' | 'thumb' | 'emoji'>('thumb');
  const [bImageMode, setBImageMode] = useState<'full' | 'thumb' | 'emoji'>('thumb');
  // CPTI 2.0 — 含蓄分享：隐藏昵称、以“我和 ta”代替，适用同事/前任/死对头场景。
  const [subtleShare, setSubtleShare] = useState(false);  // CPTI 2.0 — 双签限定卡（金箔双线框 + COSIGN 印章），需 isUnlocked('cpti-cosign-edition')。
  const [cosignShare, setCosignShare] = useState(false);
  const [cosignUnlocked, setCosignUnlocked] = useState(false);
  // CPTI 2.0 S5.3 — 季节限定皮肤
  const [seasonSkin, setSeasonSkin] = useState<CptiSeasonalSkinId | undefined>(undefined);
  const [availableSkins, setAvailableSkins] = useState<CptiSeasonalSkinId[]>([]);
  const [seasonSkinPurchasing, setSeasonSkinPurchasing] = useState<CptiSeasonalSkinId | null>(null);
  const [seasonSkinError, setSeasonSkinError] = useState<string | null>(null);
  const shareRef = useRef<CptiRelationshipShareImageGeneratorHandle>(null);
  const { mounted: shareMounted, ensureMounted: ensureShareMounted, triggerGenerate: triggerShareGenerate } = useDeferredShareGenerate(shareRef, CptiRelationshipShareImageGenerator);

  const { data, backendData, fromLink } = useMemo(() => {
    if (!mounted) {
      return {
        data: null as StoredRelationshipData | null,
        backendData: null as BackendRelationshipData | null,
        fromLink: false,
      };
    }

    const rParam = searchParams.get('r');
    if (rParam) {
      const decoded = decodeRelationshipLink(rParam);
      if (decoded) {
        const rel = CPTI_RELATIONSHIP_TYPES.find(r => r.slug === decoded.relationshipSlug);
        if (rel) {
          return {
            data: {
              relationship: rel,
              pairs: [],
              compatibility: decoded.compatibility,
              nicknameA: decoded.nicknameA,
              personalitySlugA: decoded.personalitySlugA,
              personalitySlugB: decoded.personalitySlugB,
              dimsA: [],
              dimsB: [],
            },
            backendData: null,
            fromLink: true,
          };
        }
      }
    }

    try {
      const raw = sessionStorage.getItem('cpti-relationship');
      if (raw) {
        const nextData = JSON.parse(raw) as StoredRelationshipData;
        let nextBackendData: BackendRelationshipData | null = null;

        try {
          const backendRaw = sessionStorage.getItem('cpti-relationship-backend');
          if (backendRaw) {
            nextBackendData = JSON.parse(backendRaw) as BackendRelationshipData;
          }
        } catch {
          nextBackendData = null;
        }

        return {
          data: nextData,
          backendData: nextBackendData,
          fromLink: false,
        };
      }
    } catch {
      // ignore storage failures
    }

    const typeParam = searchParams.get('type');
    if (typeParam) {
      const rel = CPTI_RELATIONSHIP_TYPES.find(r => r.slug === typeParam);
      if (rel) {
        return {
          data: {
            relationship: rel,
            pairs: [],
            compatibility: 0,
            nicknameA: '',
            personalitySlugA: '',
            personalitySlugB: '',
            dimsA: [],
            dimsB: [],
          },
          backendData: null,
          fromLink: true,
        };
      }
    }

    return {
      data: null,
      backendData: null,
      fromLink: false,
    };
  }, [mounted, searchParams]);

  const shareUrl = getSiteUrl('/cpti/');

  // ── Ceremony reveal state machine ──
  // Phases: 'translating' → 'dimensions' → 'reveal' → 'done'
  type CeremonyPhase = 'translating' | 'dimensions' | 'reveal' | 'done';
  const [ceremonyPhase, setCeremonyPhase] = useState<CeremonyPhase | null>(null);
  const [litDimensions, setLitDimensions] = useState(0);
  const ceremonyStartedRef = useRef(false);

  // Trigger ceremony only for fresh session results (not from link or already seen)
  useEffect(() => {
    if (!data || fromLink || ceremonyStartedRef.current) return;
    // Check if we already showed ceremony for this session
    const seenKey = 'cpti-ceremony-seen';
    try {
      if (sessionStorage.getItem(seenKey)) return;
      sessionStorage.setItem(seenKey, '1');
    } catch { /* ignore */ }

    ceremonyStartedRef.current = true;
    setCeremonyPhase('translating');

    // Phase 1: translating (2s)
    const t1 = setTimeout(() => setCeremonyPhase('dimensions'), 2000);
    // Phase 2: dimensions light up one by one (5 × 500ms = 2.5s)
    const dimTimers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 5; i++) {
      dimTimers.push(setTimeout(() => setLitDimensions(i), 2000 + i * 500));
    }
    // Phase 3: reveal name (after dimensions done)
    const t3 = setTimeout(() => setCeremonyPhase('reveal'), 4700);
    // Phase 4: done → show full page
    const t4 = setTimeout(() => setCeremonyPhase('done'), 6500);

    return () => {
      clearTimeout(t1);
      dimTimers.forEach(clearTimeout);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [data, fromLink]);

  const skipCeremony = useCallback(() => {
    setCeremonyPhase('done');
  }, []);

  // CPTI 2.0 — auto-archive this result into the user's Codex. Local stays as
  // an immediate/offline cache; Supabase mirrors it in the background.
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    (async () => {
      try {
        const { archiveCodexRecord, getCodexCount, CODEX_MILESTONES } = await import('@/lib/cpti/codex-archive');
        const { trackCptiEvent } = await import('@/lib/cpti/analytics');
        const before = getCodexCount();
        const rec = archiveCodexRecord({
          relationshipSlug: data.relationship.slug,
          personalitySlugA: data.personalitySlugA,
          personalitySlugB: data.personalitySlugB,
          partnerNickname: data.nicknameA && data.nicknameA !== '朋友' ? data.nicknameA : undefined,
          compatibility: data.compatibility,
        });
        if (cancelled || !rec) return;
        void cptiApi.syncCodexRecords([rec]).catch(() => {});
        const after = getCodexCount();
        if (after > before) {
          trackCptiEvent('cpti_codex_record_added', { relationship: data.relationship.slug, value: after });
          for (const m of CODEX_MILESTONES) {
            if (after === m) {
              trackCptiEvent('cpti_codex_milestone_reached', { milestone: m, value: after });
            }
          }
        }
      } catch { /* archive is best-effort; never block render */ }
    })();
    return () => { cancelled = true; };
  }, [data, fromLink]);

  // CPTI 2.0 — Detect cosign unlock state for this specific relationship.
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    (async () => {
      try {
        const [{ isUnlocked }, { isSubscriber, passCoversSingleSku, syncSubscriptionFromServer }, { restoreMystiEntitlement }] = await Promise.all([
          import('@/lib/mysti/unlock'),
          import('@/lib/mysti/subscription'),
          import('@/lib/mysti/entitlement-restore'),
        ]);
        const resourceId = `cpti-cosign:${data.relationship.slug}:${data.personalitySlugA}:${data.personalitySlugB}`;
        await syncSubscriptionFromServer({ force: true });
        const unlocked =
          isUnlocked('cpti-cosign-edition', resourceId) ||
          (await restoreMystiEntitlement({
            sku: 'cpti-cosign-edition',
            resourceId,
          })).restored ||
          (isSubscriber() && passCoversSingleSku('cpti-cosign-edition'));
        if (!cancelled) setCosignUnlocked(unlocked);
      } catch { /* best-effort */ }
    })();
    return () => { cancelled = true; };
  }, [data]);

  // CPTI 2.0 S5.3 — Detect available seasonal skins (in window or unlocked).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { CPTI_SEASONAL_SKINS, isSkinAvailable } = await import('@/lib/cpti/seasonal-skins');
        const results = await Promise.all(
          CPTI_SEASONAL_SKINS.map(async s => ((await isSkinAvailable(s.id)) ? s.id : null)),
        );
        if (!cancelled) setAvailableSkins(results.filter((x): x is CptiSeasonalSkinId => x !== null));
      } catch { /* skins are optional */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const requestedSkin = searchParams.get('skin') as CptiSeasonalSkinId | null;
    if (!requestedSkin) return;
    if (availableSkins.includes(requestedSkin)) {
      setSeasonSkin(requestedSkin);
    }
  }, [availableSkins, searchParams]);

  // CPTI 2.0 S5.4 — If arrived via ?inv=SENDER, queue a notification back for the inviter.
  useEffect(() => {
    if (!data || typeof window === 'undefined') return;
    const inv = new URLSearchParams(window.location.search).get('inv');
    if (!inv) return;
    (async () => {
      try {
        await cptiApi.consumeInviteLoopback(inv);
        const { trackCptiEvent } = await import('@/lib/cpti/analytics');
        trackCptiEvent('cpti_invite_loopback_queued', { to: inv, relationship: data.relationship.slug });
      } catch {
        try {
          const { queueInviteNotification } = await import('@/lib/cpti/invite-loopback');
          queueInviteNotification({
            toSenderId: inv,
            relationshipSlug: data.relationship.slug,
            fromNickname: data.nicknameA,
          });
        } catch { /* noop */ }
      }
    })();
  }, [data]);

  const getReturnBaseLink = useCallback(() => {
    if (!data) return '';
    return getSiteUrl(`/cpti/relationship/?r=${encodeRelationshipLink({
      relationshipSlug: data.relationship.slug,
      compatibility: data.compatibility,
      personalitySlugA: data.personalitySlugA,
      personalitySlugB: data.personalitySlugB,
      nicknameA: data.nicknameA || '朋友',
      nicknameB: '你',
    })}`);
  }, [data]);

  const copyReturnLink = useCallback(async () => {
    if (!data) return;
    const base = getReturnBaseLink();
    let inv: string | null = null;
    try {
      const created = await cptiApi.createInviteLoopback({ relationshipSlug: data.relationship.slug });
      inv = created.shareToken;
    } catch {
      try {
        const mod = await import('@/lib/cpti/invite-loopback');
        inv = mod.getOrCreateSenderId();
      } catch { /* noop */ }
    }
    const link = inv ? `${base}&inv=${encodeURIComponent(inv)}` : base;
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setReturnLinkCopied(true);
    setTimeout(() => setReturnLinkCopied(false), 2000);
  }, [data, getReturnBaseLink]);

  const copyShareText = useCallback(() => {
    if (!data) return;
    const text = `我们的CP关系类型是「${data.relationship.name}」${data.relationship.emoji}\n${data.relationship.tagline}\n来测测你们的 → ${shareUrl}`;
    navigator.clipboard.writeText(text);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  }, [data, shareUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleUnlockSeasonalSkin = useCallback(async (skinId: CptiSeasonalSkinId) => {
    setSeasonSkinPurchasing(skinId);
    setSeasonSkinError(null);
    try {
      const [
        { getPaymentAvailabilityStatus },
        { getActiveReferralCode },
        { getOrCreateDeviceId },
        { recordUnlock },
        { readApiJson },
      ] = await Promise.all([
        import('@/lib/payment/availability'),
        import('@/lib/mysti/creator-referral'),
        import('@/lib/mysti/device'),
        import('@/lib/mysti/unlock'),
        import('@/lib/api'),
      ]);

      const availability = getPaymentAvailabilityStatus();
      if (availability.blocked) {
        throw new Error(availability.message ?? 'payment_unavailable');
      }

      const sku = getSkinSku(skinId);
      const ref = getActiveReferralCode() || undefined;
      const deviceId = getOrCreateDeviceId() || undefined;
      const redirect = (() => {
        const pathname = window.location.pathname;
        const search = window.location.search;
        const params = new URLSearchParams(search);
        params.set('skin', skinId);
        params.set('unlocked', sku);
        const next = params.toString();
        return `${pathname}?${next}`;
      })();

      trackCptiEvent('cpti_pricing_sku_clicked', { tier: sku, relationship: data?.relationship.slug });

      const res = await fetch('/api/mysti/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          resourceId: skinId,
          paymentType: 'wechat',
          ref,
          deviceId,
          redirect,
        }),
      });
      const payload = await readApiJson<{
        url?: string;
        orderId?: string;
        stub?: boolean;
        error?: string;
        message?: string;
      }>(res);
      if (!res.ok || !payload.url || !payload.orderId) {
        throw new Error(payload.message || payload.error || 'create_failed');
      }

      if (payload.stub) {
        const verify = await fetch(
          `/api/mysti/payment/verify?orderId=${encodeURIComponent(payload.orderId)}&stub=1`,
        );
        const verified = (await verify.json()) as { paid?: boolean; token?: string };
        if (verified.paid) {
          recordUnlock({
            sku,
            resourceId: skinId,
            orderId: payload.orderId,
            unlockedAt: Date.now(),
            token: verified.token,
          });
          setAvailableSkins((prev) => (prev.includes(skinId) ? prev : [...prev, skinId]));
          setSeasonSkin(skinId);
          trackCptiEvent('cpti_seasonal_skin_applied', { skin: skinId, relationship: data?.relationship.slug });
          return;
        }
      }

      window.location.href = payload.url;
    } catch (error) {
      setSeasonSkinError(error instanceof Error ? error.message : String(error));
    } finally {
      setSeasonSkinPurchasing(null);
    }
  }, [data?.relationship.slug]);

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold mb-2">没有找到关系数据</h1>
          <p className="text-text-muted text-sm mb-6">请先完成CPTI配对测试。</p>
          <Link
            href="/cpti/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-all"
          >
            开始测试
          </Link>
        </div>
      </div>
    );
  }

  const { relationship, pairs, compatibility, nicknameA, personalitySlugA, personalitySlugB } = data;
  const personalityA = getCptiPersonalityBySlug(personalitySlugA);
  const personalityB = getCptiPersonalityBySlug(personalitySlugB);
  const tierInfo = RELATIONSHIP_TIER_INFO[relationship.tier];
  const isSpecialTier = relationship.tier === 'rare' || relationship.slug === 'soul';

  // ── Ceremony overlay ──
  if (ceremonyPhase && ceremonyPhase !== 'done') {
    const dimNames = ['主导力', '表达力', '冲突力', '付出力', '融合度'];
    const dimColors = ['#e06088', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'];

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
        onClick={skipCeremony}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{
            background: ceremonyPhase === 'reveal'
              ? `radial-gradient(ellipse at center, ${relationship.color}15 0%, #FAF8F5 70%)`
              : '#FAF8F5',
          }}
        />

        <AnimatePresence mode="wait">
          {/* Phase 1: Translating */}
          {ceremonyPhase === 'translating' && (
            <motion.div
              key="translating"
              className="text-center relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-4xl mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔮
              </motion.div>
              <p className="text-lg text-text-primary font-medium">
                正在翻译你们的关系……
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-rose-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 2: Dimensions lighting up */}
          {ceremonyPhase === 'dimensions' && (
            <motion.div
              key="dimensions"
              className="text-center relative z-10 w-full max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm text-text-muted mb-8 tracking-wider">六维正在连接……</p>
              <div className="space-y-4">
                {dimNames.map((name, i) => {
                  const isLit = i < litDimensions;
                  return (
                    <motion.div
                      key={name}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity: isLit ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ background: isLit ? dimColors[i] : '#D1D5DB' }}
                        animate={isLit ? {
                          scale: [1, 1.4, 1],
                          boxShadow: [`0 0 0 ${dimColors[i]}00`, `0 0 12px ${dimColors[i]}60`, `0 0 4px ${dimColors[i]}30`],
                        } : {}}
                        transition={{ duration: 0.4 }}
                      />
                      <span className={`text-sm font-medium transition-colors ${isLit ? 'text-text-primary' : 'text-text-muted'}`}>
                        {name}
                      </span>
                      {isLit && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xs font-mono"
                          style={{ color: dimColors[i] }}
                        >
                          ✓ 已匹配
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Phase 3: Reveal */}
          {ceremonyPhase === 'reveal' && (
            <motion.div
              key="reveal"
              className="text-center relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.2, 0, 0.2, 1] }}
            >
              <motion.div
                className="text-5xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                {relationship.emoji}
              </motion.div>
              <motion.div
                className="text-sm font-mono tracking-[0.3em] uppercase mb-3"
                style={{ color: relationship.color }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {relationship.code}
              </motion.div>
              <motion.h1
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {relationship.name}
              </motion.h1>
              <motion.p
                className="text-lg text-text-secondary mt-3 max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                {relationship.tagline}
              </motion.p>

              {/* Special tier celebration */}
              {isSpecialTier && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, type: 'spring', stiffness: 150 }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border"
                    style={{
                      color: '#D4A017',
                      background: 'rgba(212,160,23,0.08)',
                      borderColor: 'rgba(212,160,23,0.25)',
                    }}
                  >
                    ✦ 稀有关系
                  </span>
                </motion.div>
              )}

              {/* Gold particles for special tiers */}
              {isSpecialTier && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFA500' : '#FFEC8B',
                        left: `${20 + Math.random() * 60}%`,
                        top: `${30 + Math.random() * 40}%`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
                      }}
                      transition={{
                        delay: 0.8 + Math.random() * 0.8,
                        duration: 1.2 + Math.random() * 0.5,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip hint */}
        <motion.p
          className="absolute bottom-12 text-xs text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5 }}
        >
          点击任意处跳过
        </motion.p>
      </div>
    );
  }

  const relationshipImageSrc =
    relImageMode === 'emoji'
      ? ''
      : relImageMode === 'full'
        ? getCptiRelationshipTypeImage(relationship.slug)
        : getCptiRelationshipTypeThumbnailImage(relationship.slug);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${relationship.color}15, transparent 65%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pt-14 pb-10 text-center relative">
          {/* Share button */}
          <button
            onPointerEnter={ensureShareMounted} onClick={triggerShareGenerate}
            className="absolute top-14 right-6 p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-rose-400 transition-all cursor-pointer"
            title="生成分享图片"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-bg-secondary/60 text-xs text-text-muted mb-5">
              CP关系鉴定结果
            </div>

            {/* Relationship card image */}
            {relImageMode === 'emoji' ? (
              <div
                className="w-56 h-72 sm:w-64 sm:h-80 mx-auto mb-6 rounded-2xl flex items-center justify-center text-7xl sm:text-8xl shadow-sm"
                style={{ background: `${relationship.color}15` }}
              >
                {relationship.emoji}
              </div>
            ) : (
              <div
                className="relative w-56 h-72 sm:w-64 sm:h-80 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg"
                style={{
                  background: `${relationship.color}10`,
                  boxShadow: `0 16px 48px -12px ${relationship.color}25`,
                }}
              >
                <NextImage
                  src={relationshipImageSrc}
                  alt={relationship.name}
                  fill
                  sizes="(max-width: 640px) 224px, 256px"
                  className="object-contain p-1"
                  priority
                  onError={() =>
                    setRelImageMode(m => {
                      if (m === 'full') return 'thumb';
                      if (m === 'thumb') return 'emoji';
                      return m;
                    })
                  }
                />
              </div>
            )}

            {/* Dual portrait */}
            <div className="flex items-center justify-center gap-4 mb-5">
              {personalityA && (
                <div className="text-center">
                  {aImageMode === 'emoji' ? (
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl mx-auto"
                      style={{ background: `${personalityA.color}15` }}
                    >
                      {personalityA.emoji}
                    </div>
                  ) : (
                    <div
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden mx-auto"
                      style={{ background: `${personalityA.color}10` }}
                    >
                      <NextImage
                        src={getCptiPersonalityImageSrc(personalitySlugA, aImageMode)}
                        alt={personalityA.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        onError={() =>
                          setAImageMode(m => {
                            if (m === 'full') return 'thumb';
                            if (m === 'thumb') return 'emoji';
                            return m;
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="text-xs text-text-muted mt-1.5">{nicknameA || 'A'}</div>
                  <div className="text-[10px] font-mono" style={{ color: personalityA.color }}>{personalityA.code}</div>
                </div>
              )}

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: `${relationship.color}12`, color: relationship.color }}
              >
                ×
              </div>

              {personalityB && (
                <div className="text-center">
                  {bImageMode === 'emoji' ? (
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl mx-auto"
                      style={{ background: `${personalityB.color}15` }}
                    >
                      {personalityB.emoji}
                    </div>
                  ) : (
                    <div
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden mx-auto"
                      style={{ background: `${personalityB.color}10` }}
                    >
                      <NextImage
                        src={getCptiPersonalityImageSrc(personalitySlugB, bImageMode)}
                        alt={personalityB.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        onError={() =>
                          setBImageMode(m => {
                            if (m === 'full') return 'thumb';
                            if (m === 'thumb') return 'emoji';
                            return m;
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="text-xs text-text-muted mt-1.5">你</div>
                  <div className="text-[10px] font-mono" style={{ color: personalityB.color }}>{personalityB.code}</div>
                </div>
              )}
            </div>

            <div
              className="text-sm font-mono tracking-[0.3em] uppercase mb-2"
              style={{ color: relationship.color }}
            >
              {relationship.code}
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              {relationship.name}
            </h1>

            {/* Tier badge + compatibility */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ color: tierInfo.color, background: tierInfo.bgColor, borderColor: `${tierInfo.color}30` }}
              >
                {tierInfo.label}
              </span>
              {compatibility > 0 && (
                <span className="text-xs text-text-muted">
                  契合度 {compatibility}%
                </span>
              )}
            </div>

            <p className="text-lg text-text-secondary max-w-md mx-auto">
              {relationship.tagline}
            </p>

            {/* Backend sync badge + collection progress */}
            {backendData && !fromLink && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 bg-emerald-500/5 text-emerald-500">
                  ✓ 已同步到双方图鉴
                </span>
                {backendData.collectionProgress != null && (
                  <span className="text-xs text-text-muted">
                    已收集 {backendData.collectionProgress.collected}/{backendData.collectionProgress.total} 种关系
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8"
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4">
            关系速写
          </h2>
          <p className="text-text-secondary leading-[1.8] text-base">
            {relationship.description}
          </p>
        </motion.div>
      </section>

      {backendData && !fromLink && (
        <section className="max-w-2xl mx-auto px-6 pb-14">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <ClaimAssetCard
              variant="relationship"
              payload={{
                relationshipId: backendData.relationship.id,
                currentPersonalitySlug: backendData.participantProfile?.personality.slug,
                currentDimensionScores: backendData.participantProfile?.dimensions,
                currentSource: 'pair_flow',
              }}
            />
          </motion.div>
        </section>
      )}

      {/* Dimension comparison (only available from session, not from link) */}
      {!fromLink && pairs.length > 0 && (
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-6">
            五维对比
          </h2>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8 space-y-6">
            {pairs.map(pair => {
              const dim = CPTI_DIMENSIONS.find(d => d.id === pair.id);
              if (!dim) return null;
              const color = CPTI_MODEL_COLORS[dim.model];
              const pctA = ((levelNum(pair.levelA) - 1) / 2) * 100;
              const pctB = ((levelNum(pair.levelB) - 1) / 2) * 100;

              return (
                <div key={pair.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: color.base }}>{pair.id}</span>
                      <span className="text-sm text-text-primary">{CPTI_MODEL_NAMES[dim.model]}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                      {pair.levelA} vs {pair.levelB}
                    </span>
                  </div>

                  {/* A bar */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-muted w-6">{nicknameA?.[0] || 'A'}</span>
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full opacity-70"
                        style={{ background: color.base }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pctA, 5)}%` }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {/* B bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-6">你</span>
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color.light }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pctB, 5)}%` }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {pair.pattern === 'both-high' && (
                    <p className="text-xs text-emerald-400 mt-1.5">✦ 双高 — 你们在这个维度上都很强</p>
                  )}
                  {pair.pattern === 'both-low' && (
                    <p className="text-xs text-text-muted mt-1.5">双低 — 你们在这个维度上都偏弱</p>
                  )}
                  {pair.pattern === 'gap' && (
                    <p className="text-xs text-amber-400 mt-1.5">⚡ 大差异 — 这个维度上你们截然不同</p>
                  )}
                  {pair.pattern === 'complement' && (
                    <p className="text-xs text-sky-400 mt-1.5">互补 — 你们在这个维度上恰好互补</p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>
      )}

      {/* Return link — let the other person see this result */}
      {!fromLink && (
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 sm:p-6 text-center">
            <div className="text-2xl mb-2">💌</div>
            <p className="text-sm text-text-secondary mb-3">
              把结果发给{nicknameA || 'ta'}，让ta也能看到你们的关系类型
            </p>
            <button
              onClick={copyReturnLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-purple-500/30 text-sm text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
            >
              {returnLinkCopied ? '已复制回传链接 ✓' : '📋 复制回传链接'}
            </button>
          </div>
        </motion.div>
      </section>
      )}

      {/* Share */}
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-4 text-center">
            分享你们的关系鉴定
          </h2>

          {/* Rarity ribbon (E-06) */}
          <div className="mb-4 text-center">
            {(() => {
              const r = getRelationshipRarity(relationship.slug);
              return (
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider border"
                  style={{ color: r.color, borderColor: r.color, background: r.bgColor }}
                >
                  {r.label} · 仅 {r.populationPct.toFixed(1)}% 的人是这对
                </span>
              );
            })()}
          </div>

          {/* Pair share card (E-06 双人卡) */}
          <div className="mb-5">
            <CptiPairShareCard
              slug={relationship.slug}
              userCode={data.personalitySlugB.toUpperCase().slice(0, 8)}
              partnerCode={data.personalitySlugA.toUpperCase().slice(0, 8)}
              userName="你"
              partnerName={data.nicknameA || 'TA'}
            />
          </div>

          {/* Send as gift CTA — pair / dual report bundle */}
          <div className="mb-5">
            <SendAsGiftCTA
              source="cpti_pair_result"
              giftSku="dual-report"
              label={`把这份合盘报告送给 ${data.nicknameA || 'TA'}`}
              description="双人灵魂深度报告 · 附手写贺卡 · ¥69 起"
            />
          </div>

          <div className="space-y-3">
            {/* Subtle Mode toggle (S5.1) */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-bg-secondary/40 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={subtleShare}
                onChange={(e) => {
                  const next = e.target.checked;
                  setSubtleShare(next);
                  import('@/lib/cpti/analytics').then(({ trackCptiEvent }) => {
                    trackCptiEvent('cpti_subtle_share_toggled', { enabled: next, relationship: relationship.slug });
                  }).catch(() => {});
                }}
                className="accent-rose-400"
              />
              <span>含蓄模式：隐藏昵称，只显“我和 ta”</span>
              <span className="ml-auto text-[10px] text-text-muted">适同事/前任/死对头</span>
            </label>
            {/* Cosign Mode toggle (S2.3) — pay or pass-covered */}
            {cosignUnlocked ? (
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/5 text-xs text-amber-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cosignShare}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setCosignShare(next);
                    if (next) {
                      import('@/lib/cpti/analytics').then(({ trackCptiEvent }) => {
                        trackCptiEvent('cpti_cosign_completed', { relationship: relationship.slug });
                      }).catch(() => {});
                    }
                  }}
                  className="accent-amber-400"
                />
                <span>双签限定卡：金箔双线框 + COSIGN 印章</span>
                <span className="ml-auto text-[10px] text-amber-300/70">已解锁</span>
              </label>
            ) : (
              <Link
                href={`/cpti/pricing/?intent=cosign&rel=${relationship.slug}`}
                onClick={() => {
                  import('@/lib/cpti/analytics').then(({ trackCptiEvent }) => {
                    trackCptiEvent('cpti_cosign_invited', { relationship: relationship.slug });
                  }).catch(() => {});
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent text-xs text-amber-300 hover:bg-amber-500/15 transition-all"
              >
                <span>✦</span>
                <span>解锁双签金箔限定卡</span>
                <span className="ml-auto font-mono text-amber-200">¥9.9</span>
              </Link>
            )}
            <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-3 text-xs text-amber-200">
              <div className="flex items-center justify-between gap-3">
                <span className="text-amber-300">季节限定皮肤</span>
                {availableSkins.length > 0 && (
                  <select
                    value={seasonSkin ?? ''}
                    onChange={(e) => {
                      const v = (e.target.value || undefined) as CptiSeasonalSkinId | undefined;
                      setSeasonSkin(v);
                      if (v) {
                        trackCptiEvent('cpti_seasonal_skin_applied', { skin: v, relationship: relationship.slug });
                      }
                    }}
                    className="min-w-[180px] bg-transparent text-amber-200 text-xs outline-none cursor-pointer"
                  >
                    <option value="" className="bg-bg-primary text-text-primary">— 不使用皮肤 —</option>
                    {availableSkins.map((id) => (
                      <option key={id} value={id} className="bg-bg-primary text-text-primary">
                        {CPTI_SEASONAL_SKINS.find((skin) => skin.id === id)?.label ?? id}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                {CPTI_SEASONAL_SKINS.map((skin) => {
                  const unlocked = availableSkins.includes(skin.id);
                  const active = isSkinInWindow(skin);
                  const selected = seasonSkin === skin.id;
                  return (
                    <div
                      key={skin.id}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${selected ? 'border-amber-300/60 bg-amber-400/10' : 'border-amber-500/20 bg-transparent'}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-amber-100">
                          <span>{skin.label}</span>
                          <span className="rounded-full border border-amber-400/30 px-1.5 py-0.5 text-[10px] text-amber-300/80">
                            {active ? '本期开放' : '窗口外可购买'}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] text-amber-100/70">{skin.tagline}</p>
                      </div>
                      {unlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSeasonSkin(skin.id);
                            trackCptiEvent('cpti_seasonal_skin_applied', { skin: skin.id, relationship: relationship.slug });
                          }}
                          className={`rounded-lg px-3 py-1.5 text-[11px] ${selected ? 'bg-amber-300 text-[#2c2620]' : 'border border-amber-400/40 text-amber-200 hover:bg-amber-400/10'}`}
                        >
                          {selected ? '使用中' : '使用这套'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleUnlockSeasonalSkin(skin.id)}
                          disabled={seasonSkinPurchasing === skin.id}
                          className="rounded-lg border border-amber-400/40 px-3 py-1.5 text-[11px] text-amber-200 hover:bg-amber-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {seasonSkinPurchasing === skin.id ? '创建订单…' : `¥${skin.unlockPrice} 解锁`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {seasonSkinError && <p className="text-[11px] text-rose-300">{seasonSkinError}</p>}
            </div>
            {shareMounted ? <CptiRelationshipShareImageGenerator ref={shareRef}
              relationship={relationship}
              nicknameA={nicknameA}
              nicknameB="你"
              personalitySlugA={data.personalitySlugA}
              personalitySlugB={data.personalitySlugB}
              subtle={subtleShare}
              cosign={cosignShare && cosignUnlocked}
              skin={seasonSkin}
            /> : null}

            <button
              onClick={copyShareText}
              className="w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              {textCopied ? '已复制分享文案 ✓' : '📋 复制分享文案'}
            </button>

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all cursor-pointer"
              >
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              <Link
                href="/cpti/test"
                className="flex-1 py-3 rounded-xl border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50 transition-all text-center"
              >
                重新测试
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA back to CPTI */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="text-center">
          <Link
            href="/cpti/"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← 返回CPTI首页
          </Link>
        </div>
      </section>
    </div>
  );
}
