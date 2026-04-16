'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') || '/card/';
  const { refresh } = useAuth();

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = useCallback((): string | null => {
    const trimmed = username.trim();
    if (!trimmed) return '请输入用户名';
    if (trimmed.length < 2) return '用户名至少2个字符';
    if (trimmed.length > 20) return '用户名最多20个字符';
    if (!/^[\w\u4e00-\u9fff\u3040-\u30ff]+$/.test(trimmed)) {
      return '用户名只能包含字母、数字、下划线或中文';
    }
    if (!password) return '请输入密码';
    if (password.length < 6) return '密码至少6位';
    if (password.length > 72) return '密码最多72位';
    if (password !== confirmPassword) return '两次密码输入不一致';
    if (nickname && nickname.trim().length > 30) return '昵称最多30个字符';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return '邮箱格式不正确';
    }
    return null;
  }, [username, nickname, password, confirmPassword, email]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          email: email.trim() || undefined,
          nickname: nickname.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || '注册失败');
        return;
      }

      if (data.autoSignedIn) {
        // Server signed us in — refresh client auth state and go
        await refresh();
        router.push(redirectTo);
      } else {
        // Redirect to login with success message
        router.push(`/auth/login/?registered=1&next=${encodeURIComponent(redirectTo)}`);
      }
    } finally {
      setLoading(false);
    }
  }, [username, nickname, password, email, redirectTo, router, validate]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">创建账号</h1>
          <p className="text-sm text-text-muted mt-1.5">注册后永久保存你的人格图鉴</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1.5">
              用户名 <span className="text-accent">*</span>
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="给自己取个名字"
              className="auth-input"
              maxLength={20}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-text-muted">2-20个字符，支持中英文、数字和下划线</p>
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-text-secondary mb-1.5">
              昵称 <span className="text-text-muted font-normal text-xs">（选填，显示在分享卡片上）</span>
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="你想被别人怎么称呼？"
              className="auth-input"
              maxLength={30}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
              密码 <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少6位"
                className="auth-input pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
              确认密码 <span className="text-accent">*</span>
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="再输入一次密码"
              className="auth-input"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
              邮箱 <span className="text-text-muted font-normal text-xs">（选填，用于找回密码）</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="auth-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                注册中…
              </span>
            ) : '创建账号'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-text-muted">
          已有账号？{' '}
          <Link
            href={`/auth/login/?next=${encodeURIComponent(redirectTo)}`}
            className="text-accent font-medium hover:text-accent/80 transition-colors"
          >
            去登录
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-text-muted/60">
          注册即同意我们的{' '}
          <Link href="/terms/" className="underline">使用条款</Link>
          {' '}和{' '}
          <Link href="/privacy/" className="underline">隐私政策</Link>
        </p>
      </div>
    </div>
  );
}
