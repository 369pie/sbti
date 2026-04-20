'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { finalizeClaimedSession, stageAnonymousSourceForMerge } from '@/lib/auth/claimed-session';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { getSupabaseBrowserConfigHelpMessage, isSupabaseConfigError } from '@/lib/supabase/env';
import { signInWithPassword } from '@/lib/supabase/auth';
import { useAuth } from '@/components/AuthProvider';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') || '/card/';
  const registered = searchParams.get('registered') === '1';

  const { refresh } = useAuth();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'idle' | 'submitting' | 'redirecting'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const isBusy = phase !== 'idle';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setError('');

    if (!login.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }

    setPhase('submitting');
    let keepBusyForRedirect = false;
    try {
      await stageAnonymousSourceForMerge();

      const supabase = createBrowserSupabaseClient();
      const result = await signInWithPassword(supabase, login.trim(), password);

      if (!result.success) {
        setError(result.error || '登录失败');
        return;
      }

      await refresh();
      await finalizeClaimedSession().catch(() => null);
      keepBusyForRedirect = true;
      setPhase('redirecting');
      router.push(redirectTo);
    } catch (err) {
      if (isSupabaseConfigError(err)) {
        setError(getSupabaseBrowserConfigHelpMessage());
        return;
      }

      setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
    } finally {
      if (!keepBusyForRedirect) {
        setPhase('idle');
      }
    }
  }, [isBusy, login, password, redirectTo, router, refresh]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔮</div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">欢迎回来</h1>
          <p className="text-sm text-text-muted mt-1.5">登录后同步你的人格衣橱</p>
        </div>

        {registered && (
          <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 text-center">
            ✅ 注册成功！请登录你的账号
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login" className="block text-sm font-medium text-text-secondary mb-1.5">
              账号
            </label>
            <input
              id="login"
              type="text"
              autoComplete="username"
              value={login}
              onChange={e => setLogin(e.target.value)}
              placeholder="用户名或邮箱"
              className="auth-input"
              disabled={isBusy}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                密码
              </label>
              <Link
                href="/auth/forgot-password/"
                className="text-xs text-accent hover:text-accent/80 transition-colors"
              >
                忘记密码？
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="auth-input pr-10"
                disabled={isBusy}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isBusy}
            aria-busy={isBusy}
            className="auth-button"
          >
            {isBusy ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {phase === 'redirecting' ? '跳转中…' : '登录中…'}
              </span>
            ) : '登录'}
          </button>

          {isBusy && (
            <p className="text-xs text-text-muted text-center">正在处理，请勿重复点击</p>
          )}
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-text-muted">
          还没有账号？{' '}
          <Link
            href={`/auth/register/?next=${encodeURIComponent(redirectTo)}`}
            className="text-accent font-medium hover:text-accent/80 transition-colors"
          >
            立即注册
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-text-muted/60">
          不登录也能做测试 ·{' '}
          <Link href="/test/" className="underline hover:text-text-muted transition-colors">
            先玩一下
          </Link>
        </p>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}
