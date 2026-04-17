'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { getApiPath } from '@/lib/api';
import { finalizeClaimedSession, stageAnonymousSourceForMerge } from '@/lib/auth/claimed-session';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { getSiteUrl } from '@/lib/site';

type PageState =
  | 'checking'
  | 'ready'
  | 'sending'
  | 'sent'
  | 'upgrading'
  | 'done'
  | 'error';

export function ClaimedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => {
    const raw = searchParams.get('next') ?? '/card';
    return raw.startsWith('/') ? raw : '/card';
  }, [searchParams]);

  const shouldMerge = searchParams.get('merge') === '1';
  const [email, setEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('checking');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  const runUpgradeFinalize = useCallback(async () => {
    setPageState('upgrading');

    if (shouldMerge) {
      await finalizeClaimedSession();
    } else {
      const upgradeRes = await fetch(getApiPath('/cpti/upgrade'), {
        method: 'POST',
      });

      const upgradeData = await upgradeRes.json().catch(() => ({}));
      if (!upgradeRes.ok) {
        throw new Error(upgradeData.error ?? '认领状态同步失败');
      }
    }

    setIsAnonymous(false);
    setPageState('done');
    setMessage('账号已经认领完成，之前保存的关系和鉴定资产会继续跟着你走。');
  }, [shouldMerge]);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) return;

      if (error || !data.user) {
        setPageState('ready');
        setIsAnonymous(true);
        return;
      }

      setIsAnonymous(data.user.is_anonymous ?? false);

      if (data.user.email) {
        setEmail(data.user.email);
      }

      if (!(data.user.is_anonymous ?? false)) {
        try {
          await runUpgradeFinalize();
        } catch (err) {
          if (!active) return;
          setPageState('error');
          setMessage(err instanceof Error ? err.message : '认领失败，请稍后重试');
        }
        return;
      }

      setPageState('ready');
    });

    return () => {
      active = false;
    };
  }, [runUpgradeFinalize]);

  const handleSendMagicLink = useCallback(async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id && typeof window !== 'undefined') {
        await stageAnonymousSourceForMerge();
      }

      setPageState('sending');

      const callbackUrl = new URL(getSiteUrl('/auth/callback'));
      callbackUrl.searchParams.set('next', `/auth/claimed?next=${encodeURIComponent(next)}&merge=1`);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setPageState('sent');
      setMessage('认领链接已经发到你的邮箱了。点开邮件里的链接，回来后会自动完成认领。');
    } catch (error) {
      setPageState('error');
      setMessage(error instanceof Error ? error.message : '发送认领链接失败');
    }
  }, [email, next]);

  const handleContinue = useCallback(() => {
    router.push(next);
  }, [next, router]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border-subtle bg-bg-elevated p-7 shadow-sm">
        <div className="text-center">
          <div className="text-5xl mb-4">🫶</div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">认领你的 WTF CARD</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            你刚刚保存的关系、鉴定和图鉴资产已经有了临时身份。再走一步，就能把这些资产正式认领下来。
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border-subtle bg-bg-secondary/40 p-4 text-sm text-text-secondary">
          {pageState === 'checking' && '正在检查你的认领状态…'}
          {pageState === 'upgrading' && '正在把临时资产挂到正式账号上…'}
          {pageState === 'done' && message}
          {pageState === 'sent' && message}
          {pageState === 'error' && message}
          {pageState === 'ready' && isAnonymous === false && '当前会话已经是正式账号，点下方按钮继续即可。'}
          {pageState === 'ready' && isAnonymous !== false && '输入一个你常用的邮箱，系统会发一封认领链接给你。无论这个邮箱是新账号还是旧账号，回来后都会自动接住当前这批资产。'}
        </div>

        {(pageState === 'ready' || pageState === 'sending' || pageState === 'sent') && isAnonymous !== false && (
          <div className="mt-6 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-border-subtle bg-white/70 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent/40"
            />
            <button
              onClick={handleSendMagicLink}
              disabled={pageState === 'sending' || email.trim().length === 0}
              className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pageState === 'sending' ? '发送中…' : '发送认领链接'}
            </button>
          </div>
        )}

        {(pageState === 'done' || (pageState === 'ready' && isAnonymous === false)) && (
          <button
            onClick={handleContinue}
            className="mt-6 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
          >
            继续前往我的 WTF CARD
          </button>
        )}

        <div className="mt-4 text-center">
          <Link
            href={next}
            className="text-xs text-text-muted transition hover:text-text-secondary"
          >
            先跳过，稍后再认领
          </Link>
        </div>
      </div>
    </div>
  );
}
