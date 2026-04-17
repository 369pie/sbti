'use client';

import { useState } from 'react';
import { getApiPath } from '@/lib/api';

interface Props {
  universeId: string;
  axes: Record<string, unknown>[];
  onSaved: () => void;
}

interface AxisDraft {
  axisKey: string;
  name: string;
  lowLabel: string;
  highLabel: string;
}

export function AxesEditor({ universeId, axes: initial, onSaved }: Props) {
  const [axes, setAxes] = useState<AxisDraft[]>(
    initial.map(a => ({
      axisKey: a.axis_key as string,
      name: a.name as string,
      lowLabel: a.low_label as string,
      highLabel: a.high_label as string,
    }))
  );
  const [saving, setSaving] = useState(false);

  const addAxis = () => {
    if (axes.length >= 8) {
      alert('最多 8 个维度');
      return;
    }
    setAxes([...axes, { axisKey: '', name: '', lowLabel: '低', highLabel: '高' }]);
  };

  const updateAxis = (index: number, field: keyof AxisDraft, value: string) => {
    const next = [...axes];
    next[index] = { ...next[index], [field]: value };
    // Auto-generate key from name
    if (field === 'name' && !next[index].axisKey) {
      next[index].axisKey = value.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().slice(0, 10);
    }
    setAxes(next);
  };

  const removeAxis = (index: number) => {
    setAxes(axes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validate
    for (const a of axes) {
      if (!a.axisKey || !a.name) {
        alert('每个维度的 Key 和名称不能为空');
        return;
      }
    }
    const keys = axes.map(a => a.axisKey);
    if (new Set(keys).size !== keys.length) {
      alert('维度 Key 不能重复');
      return;
    }

    setSaving(true);
    const res = await fetch(getApiPath(`/creator/universes/${universeId}/axes`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ axes }),
    });
    setSaving(false);

    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json();
      alert(err.error || '保存失败');
    }
  };

  const fieldClass = 'bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-border transition-colors';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-text-muted">
          定义 3-8 个计分维度。每个选项会在这些维度上加减分。
        </p>
        <button
          onClick={addAxis}
          disabled={axes.length >= 8}
          className="text-sm bg-bg-tertiary hover:bg-bg-tertiary disabled:opacity-30 px-3 py-1.5 rounded-lg transition-colors"
        >
          + 添加维度
        </button>
      </div>

      {axes.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          尚未创建维度。使用「直接匹配」模式不需要维度。
        </div>
      )}

      {axes.map((axis, i) => (
        <div key={i} className="bg-bg-secondary rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted w-6">#{i + 1}</span>
            <input
              type="text"
              value={axis.name}
              onChange={e => updateAxis(i, 'name', e.target.value)}
              placeholder="维度名称（如：内向-外向）"
              className={`${fieldClass} flex-1`}
            />
            <input
              type="text"
              value={axis.axisKey}
              onChange={e => updateAxis(i, 'axisKey', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="KEY"
              className={`${fieldClass} w-24 font-mono text-xs`}
            />
            <button
              onClick={() => removeAxis(i)}
              className="text-text-muted hover:text-red-600 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-3 pl-9">
            <div className="flex-1">
              <label className="block text-xs text-text-muted mb-1">低端标签</label>
              <input
                type="text"
                value={axis.lowLabel}
                onChange={e => updateAxis(i, 'lowLabel', e.target.value)}
                className={fieldClass + ' w-full'}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-text-muted mb-1">高端标签</label>
              <input
                type="text"
                value={axis.highLabel}
                onChange={e => updateAxis(i, 'highLabel', e.target.value)}
                className={fieldClass + ' w-full'}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary disabled:opacity-30 text-sm font-medium transition-colors"
      >
        {saving ? '保存中…' : '保存维度'}
      </button>
    </div>
  );
}
