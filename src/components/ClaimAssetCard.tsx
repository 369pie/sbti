'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type {
  ClaimRelationshipPayload,
  ClaimResultPayload,
  CptiClaimRequest,
} from '@/lib/cpti/claim';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type ClaimState = 'idle' | 'claiming' | 'claimed' | 'error';

interface SharedClaimAssetCardProps {
  className?: string;
  onClaim?: (result: unknown) => void;
  onIdleSecondaryAction?: () => void;
}

type ClaimAssetCardProps =
  | (SharedClaimAssetCardProps & {
      variant: 'result';
      payload: ClaimResultPayload;
    })
  | (SharedClaimAssetCardProps & {
      variant: 'relationship';
      payload: ClaimRelationshipPayload;
    });

const COPY = {
  result: {
    idle: {
      title: '认领这份 CPTI 结果',
      description: '收进你的 WTF CARD，换设备也不会丢。以后再来配对、收集图鉴，都会继续累计。',
      primaryButton: '保存到 WTF CARD',
      secondaryButton: '先继续分享',
    },
    claiming: {
      title: '正在保存...',
      description: '正在将结果同步到云端',
      primaryButton: '保存中…',
      secondaryButton: '',
    },
    claimed: {
      title: '这份资产已经保住了',
      description: '这份结果已经和你当前会话绑定，之后再升级成正式账号也能继续带走。',
      primaryButton: '去看我的 WTF CARD',
      secondaryButton: '先继续分享',
    },
    error: {
      title: '保存失败',
      description: '请稍后重试',
      primaryButton: '重试',
      secondaryButton: '',
    },
  },
  relationship: {
    idle: {
      title: '把这段关系收进你的 WTF CARD',
      description: '认领后可永久保留这次匹配、累计关系图鉴，并继续统计你的灵魂伴侣数和稀有关系数。',
      primaryButton: '认领这份关系',
      secondaryButton: '先复制回传链接',
    },
    claiming: {
      title: '正在保存...',
      description: '正在将关系同步到云端',
      primaryButton: '保存中…',
      secondaryButton: '',
    },
    claimed: {
      title: '已同步到你的 WTF CARD',
      description: '之后的新关系、新图鉴和排行榜记录都会继续累计。',
      primaryButton: '去看我的总图鉴',
      secondaryButton: '继续解锁更多关系',
    },
    error: {
      title: '保存失败',
      description: '请稍后重试',
      primaryButton: '重试',
      secondaryButton: '',
    },
  },
};

export function ClaimAssetCard({
  variant,
  payload,
  onClaim,
  onIdleSecondaryAction,
  className = '',
}: ClaimAssetCardProps) {
  const [claimState, setClaimState] = useState<ClaimState>('idle');
  const clientMutationIdRef = useRef(
    typeof crypto !== 'undefined' ? crypto.randomUUID() : `claim-${Date.now()}`
  );
  const copy = COPY[variant];

  const handleClaim = useCallback(async () => {
    setClaimState('claiming');

    try {
      // Create Supabase client
      const supabase = createBrowserSupabaseClient();

      // Check if already has session
      const { data: { session } } = await supabase.auth.getSession();

      // If no session, sign in anonymously
      if (!session) {
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
          console.error('Anonymous sign-in failed:', authError);
          setClaimState('error');
          return;
        }
      }

      await fetch('/api/cpti/users/bootstrap', {
        method: 'POST',
      });

      const requestBody: CptiClaimRequest =
        variant === 'result'
          ? {
              type: 'result',
              data: {
                ...payload,
                clientMutationId: payload.clientMutationId ?? clientMutationIdRef.current,
              },
            }
          : {
              type: 'relationship',
              data: {
                ...payload,
                clientMutationId: payload.clientMutationId ?? clientMutationIdRef.current,
              },
            };

      // Call claim API
      const response = await fetch('/api/cpti/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Claim failed');
      }

      const result = await response.json();

      if (result.success) {
        setClaimState('claimed');
        onClaim?.(result);
      } else {
        setClaimState('error');
      }
    } catch (error) {
      console.error('Claim error:', error);
      setClaimState('error');
    }
  }, [onClaim, payload, variant]);

  const handleSecondaryAction = useCallback(() => {
    if (claimState === 'claimed') {
      // Navigate to WTF CARD or continue exploring
      if (variant === 'result') {
        window.location.href = '/card';
      } else {
        // Continue exploring relationships
        window.location.href = '/cpti';
      }
      return;
    }

    onIdleSecondaryAction?.();
  }, [claimState, onIdleSecondaryAction, variant]);

  const handlePrimaryAction = useCallback(() => {
    if (claimState === 'idle' || claimState === 'error') {
      handleClaim();
    } else if (claimState === 'claimed') {
      window.location.href = '/card';
    }
  }, [claimState, handleClaim]);

  const currentCopy = copy[claimState === 'claiming' ? 'claiming' : claimState];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={claimState}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 p-6 ${className}`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {currentCopy.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
            {currentCopy.description}
          </p>

          {/* Actions */}
          {claimState !== 'claiming' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrimaryAction}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentCopy.primaryButton}
              </button>

              {currentCopy.secondaryButton && (
                <button
                  onClick={handleSecondaryAction}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-sm transition-all"
                >
                  {currentCopy.secondaryButton}
                </button>
              )}
            </div>
          )}

          {/* Loading state */}
          {claimState === 'claiming' && (
            <div className="flex items-center justify-center py-2">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Helper text */}
          {claimState === 'idle' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
              不影响你继续发给 ta 配对。
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
