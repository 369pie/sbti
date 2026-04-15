'use client';

import { useState, useRef, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cptiApi } from '@/lib/cpti/cpti-api';
import { getCptiPersonalityBySlug } from '@/lib/cpti/personalities';
import { trackCptiEvent } from '@/lib/cpti/analytics';

const emptySubscribe = () => () => {};

type Step = 'input' | 'resolved';

interface ResolvedPairCode {
  id: string;
  code: string;
  inviterNickname: string | null;
  inviterPersonalitySlug: string | null;
}

export default function JoinContent() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [step, setStep] = useState<Step>('input');
  const [resolved, setResolved] = useState<ResolvedPairCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackCptiEvent('cpti_join_page_opened');
  }, []);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digit
      const char = value.replace(/[^0-9]/g, '').slice(-1);
      setDigits(prev => {
        const next = [...prev];
        next[index] = char;
        return next;
      });
      setError(null);

      // Auto-advance to next input
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits(prev => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      }
    },
    [digits],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
      if (!pasted) return;
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      setError(null);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      const res = await cptiApi.resolvePairCode(code);
      const personality = res.inviterPersonalitySlug
        ? getCptiPersonalityBySlug(res.inviterPersonalitySlug)
        : null;

      setResolved({
        id: res.id,
        code: res.code,
        inviterNickname: res.inviterNickname,
        inviterPersonalitySlug: res.inviterPersonalitySlug,
      });
      setStep('resolved');
    } catch (err: any) {
      setError(err?.message || '配对码无效或已过期');
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleStartTest = useCallback(() => {
    if (!resolved) return;
    router.push(`/cpti/test?pairCodeId=${encodeURIComponent(resolved.id)}&mode=pair`);
  }, [resolved, router]);

  const handleReset = useCallback(() => {
    setDigits(['', '', '', '', '', '']);
    setStep('input');
    setResolved(null);
    setError(null);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Step: Resolved — show inviter info ──
  if (step === 'resolved' && resolved) {
    const personality = resolved.inviterPersonalitySlug
      ? getCptiPersonalityBySlug(resolved.inviterPersonalitySlug)
      : null;

    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center"
        >
          <div className="text-6xl mb-6">💌</div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight">
            配对成功
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/60 border border-border-subtle text-sm text-text-muted mb-6">
            {personality && <span>{personality.emoji}</span>}
            <span>
              {resolved.inviterNickname || '对方'} 的CP角色是{' '}
              <strong className="text-text-primary">
                {personality?.name || resolved.inviterPersonalitySlug || '未知'}
              </strong>
            </span>
          </div>

          <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto mb-8">
            你即将完成 CPTI 测试，
            <br />
            测试后将为你和对方生成CP关系鉴定卡。
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
            <button
              onClick={handleReset}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              重新输入配对码
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Step: Input ──
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 tracking-tight">
          输入配对码
        </h1>
        <p className="text-text-muted text-sm mb-10">
          输入对方分享的六位配对码，完成CP测试配对
        </p>

        {/* 6 digit inputs */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-mono font-semibold rounded-xl border border-border-subtle bg-bg-secondary text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 transition-all disabled:opacity-50"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={code.length !== 6 || loading}
          className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-8 py-3.5 rounded-xl bg-rose-500 text-white font-medium text-base hover:bg-rose-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              验证中...
            </>
          ) : (
            '确认'
          )}
        </button>
      </motion.div>
    </div>
  );
}
