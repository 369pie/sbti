'use client';

import { useState } from 'react';
import { getApiPath } from '@/lib/api';

interface Props {
  universeId: string;
  questions: Record<string, unknown>[];
  axes: Record<string, unknown>[];
  scoringMode: string;
  personalitySlugs: string[];
  onSaved: () => void;
}

interface OptionDraft {
  text: string;
  imageUrl: string;
  scores: Record<string, number>;
  targetPersonality: string;
}

interface QuestionDraft {
  id?: string;
  text: string;
  poolTag: string;
  options: OptionDraft[];
}

interface AxisSummary {
  axisKey: string;
  name: string;
}

function makeOptionDraft(option?: Record<string, unknown>): OptionDraft {
  return {
    text: (option?.text as string) ?? '',
    imageUrl: (option?.image_url as string) ?? (option?.imageUrl as string) ?? '',
    scores: ((option?.scores as Record<string, number> | null) ?? {}),
    targetPersonality: (option?.target_personality as string) ?? (option?.targetPersonality as string) ?? '',
  };
}

function makeQuestionDraft(question?: Record<string, unknown>): QuestionDraft {
  return {
    id: question?.id as string | undefined,
    text: (question?.text as string) ?? '',
    poolTag: (question?.pool_tag as string) ?? (question?.poolTag as string) ?? '',
    options: Array.isArray(question?.options)
      ? (question?.options as Record<string, unknown>[]).map(makeOptionDraft)
      : [],
  };
}

export function QuestionsEditor({
  universeId,
  questions: initial,
  axes,
  scoringMode,
  personalitySlugs,
  onSaved,
}: Props) {
  const [questions, setQuestions] = useState<QuestionDraft[]>(initial.map(makeQuestionDraft));
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const axisSummaries: AxisSummary[] = axes.map((axis) => ({
    axisKey: (axis.axis_key as string) ?? '',
    name: (axis.name as string) ?? '未命名维度',
  }));

  const fieldClass =
    'w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-border transition-colors';

  const setQuestionField = (index: number, field: keyof QuestionDraft, value: string | OptionDraft[]) => {
    setQuestions((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const setOptionField = (questionIndex: number, optionIndex: number, field: keyof OptionDraft, value: string) => {
    setQuestions((current) => {
      const next = [...current];
      const question = next[questionIndex];
      const options = [...question.options];
      options[optionIndex] = { ...options[optionIndex], [field]: value };
      next[questionIndex] = { ...question, options };
      return next;
    });
  };

  const setOptionScore = (questionIndex: number, optionIndex: number, axisKey: string, rawValue: string) => {
    setQuestions((current) => {
      const next = [...current];
      const question = next[questionIndex];
      const options = [...question.options];
      const option = options[optionIndex];
      const scores = { ...option.scores };
      if (rawValue === '') {
        delete scores[axisKey];
      } else {
        const numeric = Number(rawValue);
        scores[axisKey] = Number.isFinite(numeric) ? numeric : 0;
      }
      options[optionIndex] = { ...option, scores };
      next[questionIndex] = { ...question, options };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        text: '',
        poolTag: '',
        options: [makeOptionDraft()],
      },
    ]);
  };

  const removeQuestion = async (index: number) => {
    const question = questions[index];
    if (!question.id) {
      setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
      return;
    }

    const pendingId = `delete:${question.id}`;
    setPendingKey(pendingId);
    const res = await fetch(getApiPath(`/creator/universes/${universeId}/questions/${question.id}`), {
      method: 'DELETE',
    });
    setPendingKey(null);

    if (res.ok) {
      setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
      onSaved();
      return;
    }

    const err = await res.json().catch(() => null);
    alert(err?.error || '删除题目失败');
  };

  const addOption = (questionIndex: number) => {
    setQuestions((current) => {
      const next = [...current];
      next[questionIndex] = {
        ...next[questionIndex],
        options: [...next[questionIndex].options, makeOptionDraft()],
      };
      return next;
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((current) => {
      const next = [...current];
      const question = next[questionIndex];
      next[questionIndex] = {
        ...question,
        options: question.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex),
      };
      return next;
    });
  };

  const saveQuestion = async (question: QuestionDraft, index: number) => {
    if (!question.text.trim()) {
      alert('题目文案不能为空');
      return;
    }
    if (question.options.length < 2) {
      alert('每题至少需要 2 个选项');
      return;
    }
    if (question.options.some((option) => !option.text.trim())) {
      alert('每个选项都需要填写文案');
      return;
    }
    if (scoringMode === 'direct' && question.options.some((option) => !option.targetPersonality)) {
      alert('直接匹配模式下，每个选项都需要指定目标人格');
      return;
    }

    const payload = {
      text: question.text.trim(),
      sortOrder: index,
      poolTag: question.poolTag.trim() || null,
      options: question.options.map((option) => ({
        text: option.text.trim(),
        imageUrl: option.imageUrl.trim() || undefined,
        scores: option.scores,
        targetPersonality: option.targetPersonality || undefined,
      })),
    };

    const pendingId = question.id ? `save:${question.id}` : `create:${index}`;
    setPendingKey(pendingId);
    const res = await fetch(
      getApiPath(
        question.id
          ? `/creator/universes/${universeId}/questions/${question.id}`
          : `/creator/universes/${universeId}/questions`
      ),
      {
        method: question.id ? 'PATCH' : 'POST',
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
    alert(err?.error || '保存题目失败');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          {scoringMode === 'dimension'
            ? '每个选项可以给多个维度加减分。'
            : '每个选项直接指向一个人格类型。'}
        </p>
        <button
          onClick={addQuestion}
          className="text-sm bg-bg-tertiary hover:bg-bg-tertiary px-3 py-1.5 rounded-lg transition-colors"
        >
          + 添加题目
        </button>
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12 text-text-muted">还没有题目，先添加一题试试。</div>
      )}

      {questions.map((question, questionIndex) => {
        const saveKey = question.id ? `save:${question.id}` : `create:${questionIndex}`;
        const deleteKey = question.id ? `delete:${question.id}` : '';
        const isSaving = pendingKey === saveKey;
        const isDeleting = pendingKey === deleteKey;

        return (
          <div key={question.id ?? `draft-${questionIndex}`} className="bg-bg-secondary rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-xs text-text-muted pt-2">Q{questionIndex + 1}</span>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={question.text}
                  onChange={(event) => setQuestionField(questionIndex, 'text', event.target.value)}
                  placeholder="题目文案"
                  className={fieldClass}
                />
                <input
                  type="text"
                  value={question.poolTag}
                  onChange={(event) => setQuestionField(questionIndex, 'poolTag', event.target.value)}
                  placeholder="题池标签（可选）"
                  className={fieldClass}
                />
              </div>
              <button
                onClick={() => removeQuestion(questionIndex)}
                disabled={isDeleting}
                className="text-text-muted hover:text-red-600 transition-colors text-sm pt-2 disabled:opacity-40"
              >
                删除
              </button>
            </div>

            <div className="space-y-3 pl-8">
              {question.options.map((option, optionIndex) => (
                <div key={`${question.id ?? questionIndex}-${optionIndex}`} className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-8">#{optionIndex + 1}</span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(event) => setOptionField(questionIndex, optionIndex, 'text', event.target.value)}
                      placeholder="选项文案"
                      className={fieldClass}
                    />
                    <button
                      onClick={() => removeOption(questionIndex, optionIndex)}
                      disabled={question.options.length <= 1}
                      className="text-text-muted hover:text-red-600 transition-colors text-sm disabled:opacity-20"
                    >
                      ✕
                    </button>
                  </div>

                  <input
                    type="text"
                    value={option.imageUrl}
                    onChange={(event) => setOptionField(questionIndex, optionIndex, 'imageUrl', event.target.value)}
                    placeholder="选项图片 URL（可选）"
                    className={fieldClass}
                  />

                  {scoringMode === 'dimension' ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {axisSummaries.map((axis) => (
                        <label key={axis.axisKey} className="block">
                          <span className="block text-xs text-text-muted mb-1">
                            {axis.name} <span className="font-mono text-text-muted">{axis.axisKey}</span>
                          </span>
                          <input
                            type="number"
                            value={option.scores[axis.axisKey] ?? ''}
                            onChange={(event) => setOptionScore(questionIndex, optionIndex, axis.axisKey, event.target.value)}
                            className={fieldClass}
                            placeholder="0"
                          />
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs text-text-muted mb-1">目标人格</label>
                      <select
                        value={option.targetPersonality}
                        onChange={(event) =>
                          setOptionField(questionIndex, optionIndex, 'targetPersonality', event.target.value)
                        }
                        className={fieldClass}
                      >
                        <option value="">请选择</option>
                        {personalitySlugs.map((slug) => (
                          <option key={slug} value={slug}>
                            {slug}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => addOption(questionIndex)}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                + 添加选项
              </button>
            </div>

            <button
              onClick={() => saveQuestion(question, questionIndex)}
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary disabled:opacity-30 text-sm font-medium transition-colors"
            >
              {isSaving ? '保存中…' : '保存题目'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
