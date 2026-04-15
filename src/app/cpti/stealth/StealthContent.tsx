'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CptiQuiz } from '@/components/CptiQuiz';
import { loadCptiProfile } from '@/lib/cpti/cpti-profile';

const emptySubscribe = () => () => {};

export function StealthContent() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [nickname, setNickname] = useState('');
  const [started, setStarted] = useState(false);

  // Check for saved CPTI profile
  const hasProfile = mounted ? !!loadCptiProfile() : false;

  if (started && hasProfile) {
    return <CptiQuiz mode="stealth" targetNickname={nickname.trim() || 'TA'} />;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="text-5xl mb-4">🔮</div>
        <h1 className="text-2xl font-semibold mb-2">偷偷测CP感</h1>
        <p className="text-text-muted text-sm mb-8">
          不用发链接给TA，根据你的观察和了解
          <br />
          来测测你们的CP默契度
        </p>

        {!hasProfile && mounted ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
            <div className="text-2xl mb-2">☝️</div>
            <p className="text-sm text-text-secondary mb-4">
              你需要先完成自己的CPTI测试
              <br />
              才能偷偷测和别人的CP感
            </p>
            <Link
              href="/cpti/test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-all"
            >
              先测测自己的CP角色
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : mounted ? (
          <div className="space-y-4 max-w-xs mx-auto">
            <div>
              <input
                type="text"
                placeholder="给TA起个代号（选填）"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/40 transition-colors text-center"
              />
              <p className="text-xs text-text-muted mt-2">
                代号仅用于显示，不会发送给任何人
              </p>
            </div>
            <button
              onClick={() => setStarted(true)}
              className="w-full py-3.5 rounded-xl bg-purple-500 text-white font-medium text-sm hover:bg-purple-600 transition-all cursor-pointer"
            >
              开始偷偷测
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
