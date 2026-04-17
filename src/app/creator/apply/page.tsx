'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getApiPath, readApiJson } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

interface SubmitResponse {
  success?: boolean;
  applicationId?: string;
  status?: string;
  error?: string;
  code?: string;
  details?: string;
}

export default function CreatorApplyPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [xiaohongshuHandle, setXiaohongshuHandle] = useState('');
  const [contentVertical, setContentVertical] = useState('');
  const [intro, setIntro] = useState('');
  const [wantsFree, setWantsFree] = useState(true);
  const [wantsPaid, setWantsPaid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationId, setApplicationId] = useState('');

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && email.trim().length > 0 && (wantsFree || wantsPaid);
  }, [email, name, wantsFree, wantsPaid]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError('');
    setApplicationId('');

    try {
      const res = await fetch(getApiPath('/creator-applications'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          wechatId,
          xiaohongshuHandle,
          contentVertical,
          wantsFree,
          wantsPaid,
          intro,
          sourcePage: '/creator/apply/',
        }),
      });

      const data = await readApiJson<SubmitResponse>(res);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('请先登录正式账号后再提交申请。');
        }
        if (data.code === 'SERVER_ENV_MISSING') {
          throw new Error(`服务端环境变量未配置完整（${data.details ?? '请联系管理员'}）`);
        }
        if (data.code === 'DB_SCHEMA_MISSING') {
          throw new Error('当前本地连接的 Supabase 还没建创作者申请表。请先执行 src/lib/ugc/schema.sql。');
        }
        throw new Error(data.error ?? '提交失败，请稍后重试');
      }

      setApplicationId(data.applicationId ?? '');
      setName('');
      setEmail('');
      setPhone('');
      setWechatId('');
      setXiaohongshuHandle('');
      setContentVertical('');
      setIntro('');
      setWantsFree(true);
      setWantsPaid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  const loginHref = `/auth/login/?next=${encodeURIComponent('/creator/apply/')}`;
  const registerHref = `/auth/register/?next=${encodeURIComponent('/creator/apply/')}`;

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 text-sm text-text-muted">
          正在检查登录状态...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-8 sm:p-10 text-center">
          <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Creator Apply</span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">登录后提交创作者申请</h1>
          <p className="text-text-secondary leading-8 text-base max-w-2xl mx-auto">
            正式能力下，创作者申请会绑定到你的账号。提交后，你可以在个人中心持续查看审核状态与后续进展。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              登录后申请
            </Link>
            <Link
              href={registerHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors"
            >
              注册新账号
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-muted">
            已有申请记录的账号也可以回来更新资料，个人中心会保留当前审核状态。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      <span className="text-xs font-mono tracking-[0.2em] text-text-muted uppercase block mb-3">Creator Apply</span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">创作者内测申请</h1>
      <p className="text-text-secondary leading-8 text-base mb-3">
        填写邮箱、微信 ID、手机号等信息，我们会按提交顺序联系你。审核通过后可开通免费主题测试与付费主题测试能力。
      </p>
      <p className="text-sm text-text-muted mb-8">
        提交成功后，你可以在个人中心持续查看申请状态。
      </p>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border-subtle bg-bg-elevated p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-sm text-text-primary font-medium">称呼 *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：阿青"
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-text-primary font-medium">邮箱 *</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-sm text-text-primary font-medium">手机号</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="可选，便于快速联系"
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-text-primary font-medium">微信 ID</span>
            <input
              value={wechatId}
              onChange={(e) => setWechatId(e.target.value)}
              placeholder="可选，便于建群沟通"
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-sm text-text-primary font-medium">小红书账号</span>
            <input
              value={xiaohongshuHandle}
              onChange={(e) => setXiaohongshuHandle(e.target.value)}
              placeholder="例如：@XX测评"
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-text-primary font-medium">内容方向</span>
            <input
              value={contentVertical}
              onChange={(e) => setContentVertical(e.target.value)}
              placeholder="例如：情感、职场、游戏"
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            />
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm text-text-primary font-medium">你想开通的模式 *</legend>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={wantsFree} onChange={(e) => setWantsFree(e.target.checked)} />
              免费主题测试
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={wantsPaid} onChange={(e) => setWantsPaid(e.target.checked)} />
              付费主题测试商城
            </label>
          </div>
        </fieldset>

        <label className="space-y-2 block">
          <span className="text-sm text-text-primary font-medium">补充说明</span>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="介绍你的主题方向、目标受众、过往内容数据等"
            rows={5}
            className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent resize-y"
          />
        </label>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {applicationId && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            提交成功，申请编号：{applicationId}。你可以在个人中心查看当前审核状态。
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '提交申请'}
          </button>

          <Link
            href="/me/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors"
          >
            去个人中心查看进度
          </Link>
        </div>
      </form>
    </div>
  );
}
