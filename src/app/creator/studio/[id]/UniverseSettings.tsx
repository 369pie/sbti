'use client';

import { useState } from 'react';
import { getApiPath } from '@/lib/api';

interface Props {
  universeId: string;
  initial: Record<string, unknown>;
  onSaved: () => void;
}

export function UniverseSettings({ universeId, initial, onSaved }: Props) {
  const [name, setName] = useState(initial.name as string);
  const [emoji, setEmoji] = useState((initial.emoji as string) || '🌟');
  const [description, setDescription] = useState((initial.description as string) || '');
  const [primaryColor, setPrimaryColor] = useState((initial.primary_color as string) || '#ff4d6d');
  const [cardStyle, setCardStyle] = useState((initial.card_style as string) || 'default');
  const [scoringMode, setScoringMode] = useState((initial.scoring_mode as string) || 'dimension');
  const [questionsPerTest, setQuestionsPerTest] = useState(initial.questions_per_test as number | null);
  const [hitLabel, setHitLabel] = useState((initial.hit_label as string) || '💥 一击');
  const [osLabel, setOsLabel] = useState((initial.os_label as string) || '🧠 OS 解读');
  const [symptomsLabel, setSymptomsLabel] = useState((initial.symptoms_label as string) || '📋 症状清单');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(getApiPath(`/creator/universes/${universeId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        emoji,
        description,
        primary_color: primaryColor,
        card_style: cardStyle,
        scoring_mode: scoringMode,
        questions_per_test: questionsPerTest,
        hit_label: hitLabel,
        os_label: osLabel,
        symptoms_label: symptomsLabel,
      }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json();
      alert(err.error || '保存失败');
    }
  };

  const fieldClass = 'w-full bg-bg-secondary border border-border-subtle rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-border transition-colors';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
        <div>
          <label className="block text-xs text-text-muted mb-1">Emoji</label>
          <input
            type="text"
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            className={`${fieldClass} text-center text-2xl`}
            maxLength={4}
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">宇宙名称</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={fieldClass} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-text-muted mb-1">简介</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={`${fieldClass} h-20 resize-none`}
          placeholder="简短描述你的人格宇宙…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">主题色</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              className={`${fieldClass} font-mono flex-1`}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">卡片风格</label>
          <select value={cardStyle} onChange={e => setCardStyle(e.target.value)} className={fieldClass}>
            <option value="default">默认</option>
            <option value="dark">暗黑</option>
            <option value="neon">霓虹</option>
            <option value="pastel">粉彩</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1">计分方式</label>
          <select value={scoringMode} onChange={e => setScoringMode(e.target.value)} className={fieldClass}>
            <option value="dimension">维度计分</option>
            <option value="direct">直接匹配</option>
          </select>
          <p className="text-xs text-text-muted mt-1">
            {scoringMode === 'dimension' ? '选项在各维度上加减分' : '选项直接投票给人格'}
          </p>
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">每次测试题数</label>
          <input
            type="number"
            value={questionsPerTest ?? ''}
            onChange={e => setQuestionsPerTest(e.target.value ? parseInt(e.target.value) : null)}
            className={fieldClass}
            placeholder="留空 = 全部"
            min={3}
            max={100}
          />
        </div>
      </div>

      {/* Section labels */}
      <div className="border-t border-border-subtle pt-6">
        <h3 className="text-sm text-text-secondary mb-4">结果页板块标题</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">一击</label>
            <input type="text" value={hitLabel} onChange={e => setHitLabel(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">OS 解读</label>
            <input type="text" value={osLabel} onChange={e => setOsLabel(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">症状</label>
            <input type="text" value={symptomsLabel} onChange={e => setSymptomsLabel(e.target.value)} className={fieldClass} />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !name}
        className="w-full py-3 rounded-xl bg-bg-tertiary hover:bg-bg-tertiary disabled:opacity-30 text-sm font-medium transition-colors"
      >
        {saving ? '保存中…' : '保存设置'}
      </button>
    </div>
  );
}
