'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import { UniverseSettings } from './UniverseSettings';
import { AxesEditor } from './AxesEditor';
import { QuestionsEditor } from './QuestionsEditor';
import { PersonalitiesEditor } from './PersonalitiesEditor';
import { ComplianceGate } from './ComplianceGate';
import { parseReviewFeedback } from '@/lib/ugc/review-feedback';

type Tab = 'settings' | 'axes' | 'questions' | 'personalities';

interface UniverseData {
  universe: Record<string, unknown>;
  axes: Record<string, unknown>[];
  questions: Record<string, unknown>[];
  personalities: Record<string, unknown>[];
}

export default function UniverseEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const universeId = params.id;

  const [tab, setTab] = useState<Tab>('settings');
  const [data, setData] = useState<UniverseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const fetchData = useCallback(async () => {
    const res = await fetch(getApiPath(`/creator/universes/${universeId}`));
    if (!res.ok) {
      setError('无法加载宇宙数据');
      setLoading(false);
      return;
    }
    const d = await res.json();
    setData(d);
    setLoading(false);
    setRefreshToken(x => x + 1);
  }, [universeId]);

  useEffect(() => {
    async function loadUniverse() {
      await fetchData();
    }

    void loadUniverse();
  }, [fetchData]);

  const handleSubmitForReview = async () => {
    const res = await fetch(getApiPath(`/creator/universes/${universeId}/submit`), { method: 'POST' });
    if (res.ok) {
      alert('已提交审核！');
      fetchData();
    } else {
      const err = await res.json().catch(() => ({}));
      const base = err.error || '提交失败';
      if (err.compliance) {
        alert(`${base}\n\n请先在“女权文案体检”面板修完所有错误。`);
      } else {
        alert(base);
      }
      setRefreshToken(x => x + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted">
        加载中…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-red-600">
        {error || '未找到'}
      </div>
    );
  }

  const u = data.universe as Record<string, unknown>;
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'settings', label: '⚙️ 设置' },
    { key: 'axes', label: '📐 维度', count: data.axes.length },
    { key: 'questions', label: '❓ 题库', count: data.questions.length },
    { key: 'personalities', label: '🎭 人格', count: data.personalities.length },
  ];
  const reviewFeedback = parseReviewFeedback(typeof u.review_note === 'string' ? u.review_note : null);
  const readinessItems: Array<{ key: string; label: string; hint: string; tab: Tab; done: boolean }> = [
    {
      key: 'settings',
      label: '补完宇宙简介',
      hint: '让审核和用户都知道你在做什么主题',
      tab: 'settings',
      done: Boolean(typeof u.description === 'string' && u.description.trim().length >= 12),
    },
    {
      key: 'axes',
      label: '设置维度',
      hint: '至少 2 个维度；直接匹配模式可跳过',
      tab: 'axes',
      done: (u.scoring_mode as string) === 'direct' || data.axes.length >= 2,
    },
    {
      key: 'questions',
      label: '补满题库',
      hint: '至少 5 道题，用户才会觉得这个测试成立',
      tab: 'questions',
      done: data.questions.length >= 5,
    },
    {
      key: 'personalities',
      label: '补齐结果人格',
      hint: '至少 2 个结果，建议先用模板骨架再改名',
      tab: 'personalities',
      done: data.personalities.length >= 2,
    },
  ];
  const readinessDoneCount = readinessItems.filter((item) => item.done).length;
  const nextReadinessItem = readinessItems.find((item) => !item.done);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/creator/studio')}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            ← 返回
          </button>
          <span className="text-2xl">{u.emoji as string}</span>
          <h1 className="text-xl font-bold flex-1">{u.name as string}</h1>
          <span className="text-xs text-text-muted font-mono">/{u.slug as string}/</span>
        </div>

        {/* Status bar */}
        {u.status === 'draft' && (
          <div className="bg-bg-secondary rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4">
            <span className="text-sm text-text-secondary">当前状态：草稿</span>
            <button
              onClick={handleSubmitForReview}
              className="text-sm bg-bg-tertiary hover:bg-bg-tertiary px-4 py-1.5 rounded-lg transition-colors"
            >
              提交审核
            </button>
          </div>
        )}
        {u.status === 'review' && (
          <div className="bg-yellow-500/10 rounded-xl px-4 py-3 mb-6 text-sm text-amber-600">
            审核中 — 审核通过后将自动发布
          </div>
        )}
        {u.status === 'published' && (
          <div className="bg-green-500/10 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            <span className="text-sm text-green-600">已发布</span>
            <a
              href={withBasePath(`/c/${u.slug}/test/`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 hover:text-green-200 transition-colors"
            >
              查看测试 ↗
            </a>
          </div>
        )}

        {u.status === 'draft' && reviewFeedback && (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-4">
            <div className="text-xs font-mono tracking-wider text-amber-700/75 uppercase mb-2">上次审核反馈</div>
            <div className="text-sm text-amber-100 font-medium">{reviewFeedback.reason.label}</div>
            <div className="text-sm text-amber-100/75 mt-2 leading-7">
              {reviewFeedback.note || '管理员建议你根据上面的方向继续修改后再提交。'}
            </div>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-border-subtle bg-bg-secondary p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-text-muted mb-2">审核准备清单</div>
              <h2 className="text-base font-semibold">先把最小可审核版本做出来</h2>
              <p className="text-sm text-text-secondary mt-1 leading-7">
                当前已完成 {readinessDoneCount} / {readinessItems.length} 项。先完成骨架，再细修文案和视觉。
              </p>
            </div>
            {nextReadinessItem && (
              <button
                type="button"
                onClick={() => setTab(nextReadinessItem.tab)}
                className="shrink-0 px-3 py-2 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary text-sm transition-colors"
              >
                下一步：{nextReadinessItem.label}
              </button>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 mt-4">
            {readinessItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.tab)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  item.done
                    ? 'border-green-500/20 bg-green-500/10'
                    : 'border-border-subtle bg-bg-secondary/60 hover:bg-bg-secondary'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className={item.done ? 'text-green-600' : 'text-text-muted'}>
                    {item.done ? '●' : '○'}
                  </span>
                  <span>{item.label}</span>
                </div>
                <div className="text-xs text-text-muted mt-1">{item.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 女权文案合规面板 — 所有 status 均显示 */}
        <div className="mb-6">
          <ComplianceGate universeId={universeId} refreshToken={refreshToken} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-secondary rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === t.key
                  ? 'bg-bg-tertiary text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="ml-1 text-xs text-text-muted">({t.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'settings' && (
          <UniverseSettings
            universeId={universeId}
            initial={u}
            onSaved={fetchData}
          />
        )}
        {tab === 'axes' && (
          <AxesEditor
            universeId={universeId}
            axes={data.axes}
            onSaved={fetchData}
          />
        )}
        {tab === 'questions' && (
          <QuestionsEditor
            universeId={universeId}
            questions={data.questions}
            axes={data.axes}
            scoringMode={(u.scoring_mode as string) || 'dimension'}
            personalitySlugs={data.personalities.map(p => p.slug as string)}
            onSaved={fetchData}
          />
        )}
        {tab === 'personalities' && (
          <PersonalitiesEditor
            universeId={universeId}
            personalities={data.personalities}
            axes={data.axes}
            scoringMode={(u.scoring_mode as string) || 'dimension'}
            onSaved={fetchData}
          />
        )}
      </div>
    </div>
  );
}
