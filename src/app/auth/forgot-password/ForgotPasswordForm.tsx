'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { getSupabaseBrowserConfigHelpMessage, isSupabaseConfigError } from '@/lib/supabase/env';
import { sendPasswordResetEmail } from '@/lib/supabase/auth';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('请输入邮箱地址');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('邮箱格式不正确');
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const result = await sendPasswordResetEmail(supabase, trimmed);

      if (!result.success) {
        setError(result.error || '发送失败');
        return;
      }

      setSent(true);
    } catch (err) {
      if (isSupabaseConfigError(err)) {
        setError(getSupabaseBrowserConfigHelpMessage());
        return;
      }

      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setLoading(false);
    }
  }, [email]);

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-2xl font-bold font-heading text-text-primary mb-2">邮件已发送</h1>
          <p className="text-sm text-text-muted mb-6">
            如果该邮箱已注册，你将收到一封重置密码的邮件。
            <br />请检查你的收件箱（和垃圾邮件文件夹）。
          </p>
          <Link
            href="/auth/login/"
            className="inline-flex items-center gap-1.5 text-accent font-medium hover:text-accent/80 transition-colors"
          >
            ← 返回登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold font-heading text-text-primary">找回密码</h1>
          <p className="text-sm text-text-muted mt-1.5">输入注册时填写的邮箱，我们会发送重置链接</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
              邮箱地址
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
                发送中…
              </span>
            ) : '发送重置邮件'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link
            href="/auth/login/"
            className="text-accent font-medium hover:text-accent/80 transition-colors"
          >
            ← 返回登录
          </Link>
        </p>
      </div>
    </div>
  );
}
