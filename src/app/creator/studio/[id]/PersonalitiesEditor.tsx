'use client';

import { useState, useCallback } from 'react';
import { getApiPath } from '@/lib/api';

const AI_STYLE_OPTIONS = [
  { value: 'anime', label: '🎌 动漫风' },
  { value: 'watercolor', label: '🎨 水彩' },
  { value: 'chibi', label: '🧸 Q版' },
  { value: 'realistic', label: '📷 写实' },
  { value: 'flat', label: '🟦 扁平' },
  { value: 'ink', label: '🖋 水墨' },
] as const;

interface Props {
  universeId: string;
  personalities: Record<string, unknown>[];
  axes: Record<string, unknown>[];
  scoringMode: string;
  onSaved: () => void;
}

interface PersonalityDraft {
  id?: string;
  slug: string;
  name: string;
  number: string;
  code: string;
  emoji: string;
  tagline: string;
  color: string;
  quote: string;
  imageUrl: string;
  copyHit: string;
  copyOs: string;
  copyCloser: string;
  copySymptomsText: string;
}

function makePersonalityDraft(personality?: Record<string, unknown>): PersonalityDraft {
  return {
    id: personality?.id as string | undefined,
    slug: (personality?.slug as string) ?? '',
    name: (personality?.name as string) ?? '',
    number: personality?.number ? String(personality.number) : '',
    code: (personality?.code as string) ?? '',
    emoji: (personality?.emoji as string) ?? '✨',
    tagline: (personality?.tagline as string) ?? '',
    color: (personality?.color as string) ?? '#ff4d6d',
    quote: (personality?.quote as string) ?? '',
    imageUrl: (personality?.image_url as string) ?? (personality?.imageUrl as string) ?? '',
    copyHit: (personality?.copy_hit as string) ?? (personality?.copyHit as string) ?? '',
    copyOs: (personality?.copy_os as string) ?? (personality?.copyOs as string) ?? '',
    copyCloser: (personality?.copy_closer as string) ?? (personality?.copyCloser as string) ?? '',
    copySymptomsText: Array.isArray(personality?.copy_symptoms)
      ? (personality?.copy_symptoms as string[]).join('\n')
      : '',
  };
}

export function PersonalitiesEditor({
  universeId,
  personalities: initial,
  axes,
  scoringMode,
  onSaved,
}: Props) {
  const [personalities, setPersonalities] = useState<PersonalityDraft[]>(initial.map(makePersonalityDraft));
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [genStyle, setGenStyle] = useState<Record<number, string>>({});
  const [genLoading, setGenLoading] = useState<Record<number, boolean>>({});

  const generateImage = useCallback(async (index: number, personality: PersonalityDraft) => {
    if (!personality.id) {
      alert('请先保存人格再生成图鉴');
      return;
    }
    const style = genStyle[index] ?? 'anime';
    setGenLoading(prev => ({ ...prev, [index]: true }));

    const res = await fetch(getApiPath('/creator/generate-image'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalityId: personality.id,
        universeId,
        style,
      }),
    });

    setGenLoading(prev => ({ ...prev, [index]: false }));

    if (res.ok) {
      const data = await res.json();
      setField(index, 'imageUrl', data.imageUrl);
      onSaved();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? 'AI 图鉴生成失败，请稍后重试');
    }
  }, [genStyle, universeId, onSaved]);

  const fieldClass =
    'w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-border transition-colors';

  const setField = (index: number, field: keyof PersonalityDraft, value: string) => {
    setPersonalities((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addPersonality = () => {
    setPersonalities((current) => [
      ...current,
      {
        slug: '',
        name: '',
        number: '',
        code: '',
        emoji: '✨',
        tagline: '',
        color: '#ff4d6d',
        quote: '',
        imageUrl: '',
        copyHit: '',
        copyOs: '',
        copyCloser: '',
        copySymptomsText: '',
      },
    ]);
  };

  const removePersonality = async (index: number) => {
    const personality = personalities[index];
    if (!personality.id) {
      setPersonalities((current) => current.filter((_, itemIndex) => itemIndex !== index));
      return;
    }

    const pendingId = `delete:${personality.id}`;
    setPendingKey(pendingId);
    const res = await fetch(getApiPath(`/creator/universes/${universeId}/personalities/${personality.id}`), {
      method: 'DELETE',
    });
    setPendingKey(null);

    if (res.ok) {
      setPersonalities((current) => current.filter((_, itemIndex) => itemIndex !== index));
      onSaved();
      return;
    }

    const err = await res.json().catch(() => null);
    alert(err?.error || '删除人格失败');
  };

  const savePersonality = async (personality: PersonalityDraft, index: number) => {
    if (!personality.slug.trim()) {
      alert('人格 slug 不能为空');
      return;
    }
    if (!personality.name.trim()) {
      alert('人格名称不能为空');
      return;
    }

    const payload = {
      slug: personality.slug.trim(),
      name: personality.name.trim(),
      number: personality.number.trim() || null,
      code: personality.code.trim() || null,
      emoji: personality.emoji.trim() || '✨',
      tagline: personality.tagline.trim() || null,
      color: personality.color.trim() || '#ff4d6d',
      quote: personality.quote.trim() || null,
      imageUrl: personality.imageUrl.trim() || null,
      copyHit: personality.copyHit.trim() || null,
      copyOs: personality.copyOs.trim() || null,
      copyCloser: personality.copyCloser.trim() || null,
      copySymptoms: personality.copySymptomsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      sortOrder: index,
    };

    const pendingId = personality.id ? `save:${personality.id}` : `create:${index}`;
    setPendingKey(pendingId);
    const res = await fetch(
      getApiPath(
        personality.id
          ? `/creator/universes/${universeId}/personalities/${personality.id}`
          : `/creator/universes/${universeId}/personalities`
      ),
      {
        method: personality.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    setPendingKey(null);

    if (res.ok) {
      onSaved();
      return;
    }

    const err = await res.json().catch(() => null);
    alert(err?.error || '保存人格失败');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          当前是 {scoringMode === 'dimension' ? '维度计分' : '直接匹配'} 模式，共 {axes.length} 个维度。
        </p>
        <button
          onClick={addPersonality}
          className="text-sm bg-bg-tertiary hover:bg-bg-tertiary px-3 py-1.5 rounded-lg transition-colors"
        >
          + 添加人格
        </button>
      </div>

      {personalities.length === 0 && (
        <div className="text-center py-12 text-text-muted">还没有人格，先创建一个结果类型。</div>
      )}

      {personalities.map((personality, index) => {
        const saveKey = personality.id ? `save:${personality.id}` : `create:${index}`;
        const deleteKey = personality.id ? `delete:${personality.id}` : '';
        const isSaving = pendingKey === saveKey;
        const isDeleting = pendingKey === deleteKey;

        return (
          <div key={personality.id ?? `draft-${index}`} className="bg-bg-secondary rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted">#{index + 1}</span>
              <input
                type="text"
                value={personality.emoji}
                onChange={(event) => setField(index, 'emoji', event.target.value)}
                className={`${fieldClass} w-16 text-center text-xl`}
                maxLength={4}
              />
              <input
                type="text"
                value={personality.name}
                onChange={(event) => setField(index, 'name', event.target.value)}
                placeholder="人格名称"
                className={fieldClass}
              />
              <button
                onClick={() => removePersonality(index)}
                disabled={isDeleting}
                className="text-text-muted hover:text-red-600 transition-colors text-sm disabled:opacity-40"
              >
                删除
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Slug</label>
                <input
                  type="text"
                  value={personality.slug}
                  onChange={(event) => setField(index, 'slug', event.target.value.toLowerCase())}
                  placeholder="healer"
                  className={fieldClass}
                  disabled={Boolean(personality.id)}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">编号</label>
                <input
                  type="text"
                  value={personality.number}
                  onChange={(event) => setField(index, 'number', event.target.value)}
                  placeholder="01"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Code</label>
                <input
                  type="text"
                  value={personality.code}
                  onChange={(event) => setField(index, 'code', event.target.value)}
                  placeholder="HLR"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">Tagline</label>
                <input
                  type="text"
                  value={personality.tagline}
                  onChange={(event) => setField(index, 'tagline', event.target.value)}
                  placeholder="一句话简介"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">主色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={personality.color}
                    onChange={(event) => setField(index, 'color', event.target.value)}
                    className="h-10 w-12 rounded bg-transparent"
                  />
                  <input
                    type="text"
                    value={personality.color}
                    onChange={(event) => setField(index, 'color', event.target.value)}
                    className={`${fieldClass} font-mono`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1">引用语</label>
              <textarea
                value={personality.quote}
                onChange={(event) => setField(index, 'quote', event.target.value)}
                className={`${fieldClass} h-20 resize-none`}
                placeholder="结果页引用语"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1">图片 URL</label>
              <input
                type="text"
                value={personality.imageUrl}
                onChange={(event) => setField(index, 'imageUrl', event.target.value)}
                className={fieldClass}
                placeholder="https://..."
              />
              {/* AI Image Generation */}
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={genStyle[index] ?? 'anime'}
                  onChange={(e) => setGenStyle(prev => ({ ...prev, [index]: e.target.value }))}
                  className="bg-bg-secondary border border-border-subtle rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-border"
                >
                  {AI_STYLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => generateImage(index, personality)}
                  disabled={genLoading[index] || !personality.id}
                  className="flex-1 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-medium hover:bg-purple-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {genLoading[index] ? '✨ 生成中…' : '🎨 AI 生成图鉴'}
                </button>
              </div>
              {personality.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden bg-bg-secondary w-20 h-20">
                  <img src={personality.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">一击文案</label>
                <textarea
                  value={personality.copyHit}
                  onChange={(event) => setField(index, 'copyHit', event.target.value)}
                  className={`${fieldClass} h-24 resize-none`}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">OS 解读</label>
                <textarea
                  value={personality.copyOs}
                  onChange={(event) => setField(index, 'copyOs', event.target.value)}
                  className={`${fieldClass} h-24 resize-none`}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">症状清单（每行一条）</label>
                <textarea
                  value={personality.copySymptomsText}
                  onChange={(event) => setField(index, 'copySymptomsText', event.target.value)}
                  className={`${fieldClass} h-28 resize-none`}
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">收尾文案</label>
                <textarea
                  value={personality.copyCloser}
                  onChange={(event) => setField(index, 'copyCloser', event.target.value)}
                  className={`${fieldClass} h-28 resize-none`}
                />
              </div>
            </div>

            <button
              onClick={() => savePersonality(personality, index)}
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary disabled:opacity-30 text-sm font-medium transition-colors"
            >
              {isSaving ? '保存中…' : '保存人格'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
