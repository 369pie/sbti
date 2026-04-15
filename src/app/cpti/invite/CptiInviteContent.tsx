'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useSyncExternalStore, Suspense, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    setPairLoading(true);
    setPairError(null);
    cptiApi.resolvePairCode(pairCode)
      .then((res: { id: string; code: string; inviterNickname: string | null; inviterPersonalitySlug: string | null }) => {
        setResolved({
          id: res.id,
          code: res.code,
          inviterNickname: res.inviterNickname,
          inviterPersonalitySlug: res.inviterPersonalitySlug,
        });
      })
      .catch((err: any) => {
        setPairError(err?.message || '配对码无效或已过期');
      })
      .finally(() => {
        setPairLoading(false);
      });
  }, [pairCode]);

  const handleStartTest = useCallback(() => {
    if (!resolved) return;
    router.push(`/cpti/test?pairCodeId=${encodeURIComponent(resolved.id)}&mode=pair`);
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

    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-6">💌</div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight">
            {displayName}想知道
            <br />
            <span className="text-rose-400">你们是什么关系</span>
          </h1>

          {personality && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/60 border border-border-subtle text-sm text-text-muted mb-6">
              <span>{personality.emoji}</span>
              <span>{displayName}的CP角色是 <strong className="text-text-primary">{personality.name}</strong></span>
            </div>
          )}

          <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto mb-8">
            回答 12 道观察题，以<strong>你观察到的ta</strong>为视角回答。
            <br />
            完成后你们将收到一张<strong>CP关系鉴定卡</strong>。
          </p>

          <button
            onClick={handleStartTest}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-rose-500 text-white font-medium text-base hover:bg-rose-600 transition-all cursor-pointer"
          >
            开始测试
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <div className="mt-8">
            <Link
              href="/cpti/"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              或者自己做一份CPTI测试
            </Link>
          </div>
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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6">💌</div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight">
          {displayName}想知道
          <br />
          <span className="text-rose-400">你们是什么关系</span>
        </h1>

        {personality && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/60 border border-border-subtle text-sm text-text-muted mb-6">
            <span>{personality.emoji}</span>
            <span>{displayName}的CP角色是 <strong className="text-text-primary">{personality.name}</strong></span>
          </div>
        )}

        <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto mb-8">
          回答 12 道观察题，以<strong>你观察到的ta</strong>为视角回答。
          <br />
          完成后你们将收到一张<strong>CP关系鉴定卡</strong>。
        </p>

        <button
          onClick={() => setStarted(true)}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-rose-500 text-white font-medium text-base hover:bg-rose-600 transition-all cursor-pointer"
        >
          开始鉴定
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <div className="mt-8">
          <Link
            href="/cpti/"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            或者自己做一份CPTI测试
          </Link>
        </div>
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
