'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useSyncExternalStore, Suspense, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { decodeCptiInvite, type CptiInviteData } from '@/lib/cpti/cpti-invite';
import { getCptiPersonalityBySlug } from '@/lib/cpti/personalities';
import { CptiQuiz } from '@/components/CptiQuiz';
import { cptiApi } from '@/lib/cpti/cpti-api';

const emptySubscribe = () => () => {};

interface ResolvedPairCode {
  id: string;
  code: string;
  inviterNickname: string | null;
  inviterPersonalitySlug: string | null;
}

function InviteInner() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pairCode = searchParams.get('pairCode');
  const code = searchParams.get('code');

  // Pair code resolution state
  const [resolved, setResolved] = useState<ResolvedPairCode | null>(null);
  const [pairLoading, setPairLoading] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);

  // Resolve pair code from URL on mount
  useEffect(() => {
    if (!pairCode) return;
    let active = true;

    const resolvePairCode = async () => {
      setPairLoading(true);
      setPairError(null);

      try {
        const res = await cptiApi.resolvePairCode(pairCode);
        if (!active) return;

        setResolved({
          id: res.id,
          code: res.code,
          inviterNickname: res.inviterNickname,
          inviterPersonalitySlug: res.inviterPersonalitySlug,
        });
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : '配对码无效或已过期';
        setPairError(message);
      } finally {
        if (active) {
          setPairLoading(false);
        }
      }
    };

    void resolvePairCode();

    return () => {
      active = false;
    };
  }, [pairCode]);

  const handleStartTest = useCallback(() => {
    if (!resolved) return;
    const next = new URLSearchParams({
      pairCodeId: resolved.id,
      mode: 'pair',
    });
    if (resolved.inviterNickname) {
      next.set('partnerNickname', resolved.inviterNickname);
    }
    router.push(`/cpti/test?${next.toString()}`);
  }, [resolved, router]);

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // Priority: pairCode flow
  if (pairCode) {
    // Loading state
    if (pairLoading) {
      return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      );
    }

    // Error state
    if (pairError || !resolved) {
      return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🔗</div>
            <h1 className="text-2xl font-semibold mb-2">配对码无效</h1>
            <p className="text-text-muted text-sm mb-6">{pairError || '这个配对码无效或已过期。'}</p>
            <Link
              href="/cpti/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-all"
            >
              自己去做CPTI测试
            </Link>
          </div>
        </div>
      );
    }

    // Resolved - show inviter info and start button
    const personality = resolved.inviterPersonalitySlug
      ? getCptiPersonalityBySlug(resolved.inviterPersonalitySlug)
      : null;
    const displayName = resolved.inviterNickname || '对方';
    const initial = displayName[0] || 'T';
    const accentColor = personality?.color || '#e06088';

    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-md text-center relative">

          {/* Background pulse ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <motion.div
              className="w-64 h-64 rounded-full"
              style={{ background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)` }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Connection visualization */}
          <motion.div
            className="flex items-center justify-center gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Inviter avatar */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
              >
                {initial}
              </div>
              <span className="text-xs text-text-muted mt-2 block">{displayName}</span>
            </div>

            {/* Animated connection line */}
            <div className="relative w-20 h-8 flex items-center">
              <svg width="80" height="32" viewBox="0 0 80 32" className="absolute inset-0">
                <motion.path
                  d="M0,16 Q20,4 40,16 Q60,28 80,16"
                  stroke={accentColor}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="4 4"
                  animate={{ strokeDashoffset: [0, -16] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </svg>
              <motion.div
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{ background: accentColor }}
                animate={{
                  x: [0, 77, 0],
                  y: [0, 0, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* You placeholder */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 border-dashed"
                style={{ borderColor: `${accentColor}40`, color: `${accentColor}80` }}
              >
                ?
              </div>
              <span className="text-xs text-text-muted mt-2 block">你</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-sm text-text-muted mb-3 tracking-wider">TA 正在等你揭晓——</p>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4 tracking-tight">
              你们到底是
              <br />
              <span style={{ color: accentColor }}>什么关系</span>
              <span className="text-xl">？</span>
            </h1>
          </motion.div>

          {personality && (
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/60 border border-border-subtle text-sm text-text-muted mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <span>{personality.emoji}</span>
              <span>{displayName}是 <strong className="text-text-primary">{personality.name}</strong></span>
            </motion.div>
          )}

          <motion.p
            className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            回答 <strong>12</strong> 道观察题，以你眼中的TA为视角。
            <br />
            <span className="text-text-muted">只需 3 分钟。</span>
          </motion.p>

          <motion.button
            onClick={handleStartTest}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-base transition-all cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              boxShadow: `0 8px 24px -4px ${accentColor}40`,
            }}
          >
            3分钟，揭晓你们是什么关系
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              href="/cpti/join/"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              有配对码？手动输入 →
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Fallback: existing base64 code flow
  if (!code) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">💔</div>
          <h1 className="text-2xl font-semibold mb-2">邀请链接无效</h1>
          <p className="text-text-muted text-sm mb-6">这个邀请链接缺少必要的参数，可能已失效。</p>
          <Link
            href="/cpti/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-all"
          >
            自己去做CPTI测试
          </Link>
        </div>
      </div>
    );
  }

  const inviteData = decodeCptiInvite(code);

  if (!inviteData) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-2xl font-semibold mb-2">邀请链接已损坏</h1>
          <p className="text-text-muted text-sm mb-6">无法解析这个邀请链接的数据。</p>
          <Link
            href="/cpti/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-all"
          >
            自己去做CPTI测试
          </Link>
        </div>
      </div>
    );
  }

  const personality = getCptiPersonalityBySlug(inviteData.personalitySlug);

  return <InviteLanding inviteData={inviteData} personality={personality} />;
}

interface InviteLandingProps {
  inviteData: CptiInviteData;
  personality: ReturnType<typeof getCptiPersonalityBySlug>;
}

function InviteLanding({ inviteData, personality }: InviteLandingProps) {
  const [started, setStarted] = useState(false);

  if (started) {
    return <CptiQuiz mode="peer" inviteData={inviteData} />;
  }

  const displayName = inviteData.nickname || '对方';
  const initial = displayName[0] || 'T';
  const accentColor = personality?.color || '#e06088';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 overflow-hidden">
      <div className="w-full max-w-md text-center relative">

        {/* Background pulse */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <motion.div
            className="w-64 h-64 rounded-full"
            style={{ background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Connection visualization */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            >
              {initial}
            </div>
            <span className="text-xs text-text-muted mt-2 block">{displayName}</span>
          </div>

          <div className="relative w-20 h-8 flex items-center">
            <svg width="80" height="32" viewBox="0 0 80 32" className="absolute inset-0">
              <motion.path
                d="M0,16 Q20,4 40,16 Q60,28 80,16"
                stroke={accentColor}
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, -16] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{ background: accentColor }}
              animate={{ x: [0, 77, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 border-dashed"
              style={{ borderColor: `${accentColor}40`, color: `${accentColor}80` }}
            >
              ?
            </div>
            <span className="text-xs text-text-muted mt-2 block">你</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-sm text-text-muted mb-3 tracking-wider">TA 正在等你揭晓——</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4 tracking-tight">
            你们到底是
            <br />
            <span style={{ color: accentColor }}>什么关系</span>
            <span className="text-xl">？</span>
          </h1>
        </motion.div>

        {personality && (
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/60 border border-border-subtle text-sm text-text-muted mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <span>{personality.emoji}</span>
            <span>{displayName}是 <strong className="text-text-primary">{personality.name}</strong></span>
          </motion.div>
        )}

        <motion.p
          className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          回答 <strong>12</strong> 道观察题，以你眼中的TA为视角。
          <br />
          <span className="text-text-muted">只需 3 分钟。</span>
        </motion.p>

        <motion.button
          onClick={() => setStarted(true)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-base transition-all cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            boxShadow: `0 8px 24px -4px ${accentColor}40`,
          }}
        >
          3分钟，揭晓你们是什么关系
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/cpti/"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            或者自己去做一份CPTI测试
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function CptiInviteContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <InviteInner />
    </Suspense>
  );
}
