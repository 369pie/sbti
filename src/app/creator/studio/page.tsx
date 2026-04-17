'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getApiPath } from '@/lib/api';
import type { UniverseRow } from '@/lib/ugc/db';
import { STARTER_TEMPLATE_CARDS } from '@/lib/ugc/starter-templates';

export default function CreatorStudioPage() {
  const router = useRouter();
  const [universes, setUniverses] = useState<UniverseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const fetchUniverses = useCallback(async () => {
    const res = await fetch(getApiPath('/creator/universes'));
    if (res.ok) {
      const data = await res.json();
      setUniverses(data.universes);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function loadUniverses() {
      await fetchUniverses();
    }

    void loadUniverses();
  }, [fetchUniverses]);

  const handleCreate = async () => {
    if (!newSlug || !newName) return;
    setCreating(true);

    const res = await fetch(getApiPath('/creator/universes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: newSlug,
        name: newName,
        templateId: selectedTemplateId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/creator/studio/${data.universe.id}`);
    } else {
      const err = await res.json();
      alert(err.error || '创建失败');
      setCreating(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = STARTER_TEMPLATE_CARDS.find((item) => item.id === templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);
    setNewName(template.defaultName);
    setNewSlug(template.defaultSlug);
  };

  const statusCounts = universes.reduce(
    (acc, universe) => {
      acc.total += 1;
      acc[universe.status] = (acc[universe.status] ?? 0) + 1;
      return acc;
    },
    { total: 0, draft: 0, review: 0, published: 0, archived: 0 } as Record<string, number>,
  );

  const statusLabel: Record<string, { text: string; className: string }> = {
    draft: { text: '草稿', className: 'bg-bg-tertiary text-text-secondary' },
    review: { text: '审核中', className: 'bg-yellow-500/20 text-amber-600' },
    published: { text: '已发布', className: 'bg-green-500/12 text-green-600' },
    archived: { text: '已归档', className: 'bg-bg-secondary text-text-muted' },
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2">🎨 创作工作室</h1>
        <p className="text-text-muted text-sm mb-8">创建和管理你的人格宇宙</p>

        <div className="mb-8 rounded-2xl border border-border-subtle bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-text-muted mb-2">Launch Path</div>
              <h2 className="text-lg font-semibold mb-2">先别从空白页开始</h2>
              <p className="text-sm text-text-secondary leading-7">
                最快的启动路径是：先套一个模板，改成你的主题语言，再补满 5 道题和 2 个人格后提交审核。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs min-w-[132px]">
              <div className="rounded-xl bg-bg-secondary px-3 py-2">
                <div className="text-text-primary font-semibold">{statusCounts.draft}</div>
                <div className="text-text-muted mt-1">草稿</div>
              </div>
              <div className="rounded-xl bg-bg-secondary px-3 py-2">
                <div className="text-amber-600 font-semibold">{statusCounts.review}</div>
                <div className="text-text-muted mt-1">审核中</div>
              </div>
              <div className="col-span-2 rounded-xl bg-bg-secondary px-3 py-2">
                <div className="text-green-600 font-semibold">{statusCounts.published}</div>
                <div className="text-text-muted mt-1">已发布</div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-xl bg-bg-secondary px-4 py-3">
              <div className="text-text-primary font-medium">1. 选模板</div>
              <div className="text-text-muted text-xs mt-1">热点 / 情感 / 灵性三种起手式</div>
            </div>
            <div className="rounded-xl bg-bg-secondary px-4 py-3">
              <div className="text-text-primary font-medium">2. 改成你的内容世界</div>
              <div className="text-text-muted text-xs mt-1">先改结果名，再改题目和情绪文案</div>
            </div>
            <div className="rounded-xl bg-bg-secondary px-4 py-3">
              <div className="text-text-primary font-medium">3. 补齐后提交审核</div>
              <div className="text-text-muted text-xs mt-1">目标线：2 维度 / 5 题 / 2 人格</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-medium">🚀 Starter Templates</h2>
            {selectedTemplateId && (
              <button
                type="button"
                onClick={() => setSelectedTemplateId(null)}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                改为空白创建
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {STARTER_TEMPLATE_CARDS.map((template) => {
              const selected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-border bg-bg-tertiary'
                      : 'border-border-subtle bg-bg-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl mb-2">{template.emoji}</div>
                      <div className="font-medium">{template.name}</div>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: template.primaryColor }}
                    />
                  </div>
                  <p className="text-xs text-text-muted leading-6 mt-2 min-h-[3rem]">{template.description}</p>
                  <div className="text-[11px] text-text-muted mt-2">适合：{template.bestFor}</div>
                  <div className="flex gap-2 mt-3 text-[11px] text-text-muted">
                    <span>{template.counts.axes} 维度</span>
                    <span>{template.counts.questions} 题</span>
                    <span>{template.counts.personalities} 人格</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Universe list */}
        {loading ? (
          <div className="text-text-muted text-center py-12">加载中…</div>
        ) : (
          <div className="space-y-3 mb-8">
            {universes.map(u => {
              const status = statusLabel[u.status] ?? statusLabel.draft;
              return (
                <button
                  key={u.id}
                  onClick={() => router.push(`/creator/studio/${u.id}`)}
                  className="w-full bg-bg-secondary hover:bg-bg-tertiary rounded-xl p-4 text-left transition-colors flex items-center gap-4"
                >
                  <span className="text-3xl">{u.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{u.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      /{u.slug}/ · {u.total_tests} 次测试
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${status.className}`}>
                    {status.text}
                  </span>
                </button>
              );
            })}

            {universes.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                还没有创建任何宇宙<br />
                <span className="text-sm">在下方创建你的第一个人格宇宙吧！</span>
              </div>
            )}
          </div>
        )}

        {/* Create new */}
        <div className="bg-bg-secondary rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">✨ 创建新宇宙</h2>
          {selectedTemplateId && (
            <div className="mb-4 rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
              已套用模板：
              <span className="text-text-primary ml-1">
                {STARTER_TEMPLATE_CARDS.find((item) => item.id === selectedTemplateId)?.name}
              </span>
              <div className="text-xs text-text-muted mt-1">
                创建后会自动生成维度、题目和人格骨架，你只需要继续替换成自己的主题语言。
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">宇宙名称</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="例：三国杀人格"
                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-border transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">URL 标识 (slug)</label>
              <input
                type="text"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="例：sanguo"
                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-border transition-colors"
              />
              <p className="text-xs text-text-muted mt-1">仅支持小写字母、数字和连字符</p>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !newSlug || !newName}
              className="w-full py-2.5 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {creating ? '创建中…' : selectedTemplateId ? '创建宇宙并套用模板' : '创建空白宇宙'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
