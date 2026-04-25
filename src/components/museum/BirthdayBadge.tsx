'use client';

/**
 * BirthdayBadge (W4) — small inline pill that lets the user set their birthday
 * (MM-DD) once. On the actual day, shows a celebratory mini-banner.
 *
 * Local-only. No backend, no full date (MM-DD only — privacy-respecting).
 */

import { useEffect, useState } from 'react';
import {
  formatBirthday,
  isBirthdayToday,
  loadBirthday,
  parseBirthdayInput,
  saveBirthday,
  clearBirthday,
  type BirthdayMd,
} from '@/lib/museum/birthday';
import { trackMuseum } from '@/lib/museum/analytics';

interface BirthdayBadgeProps {
  accent: string;
}

export default function BirthdayBadge({ accent }: BirthdayBadgeProps) {
  const [bd, setBd] = useState<BirthdayMd | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [seenToday, setSeenToday] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => {
      const b = loadBirthday();
      setBd(b);
      if (b && isBirthdayToday()) {
        setSeenToday(true);
        trackMuseum('birthday_card_seen');
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const onSave = () => {
    const parsed = parseBirthdayInput(draft);
    if (!parsed) {
      setError('请输入 MM-DD 格式（例如 04-19）');
      return;
    }
    saveBirthday(parsed);
    setBd(parsed);
    setEditing(false);
    setError(null);
    setDraft('');
    trackMuseum('birthday_set');
    if (isBirthdayToday()) setSeenToday(true);
  };

  const onClear = () => {
    clearBirthday();
    setBd(null);
    trackMuseum('birthday_clear');
  };

  const isToday = bd && isBirthdayToday();

  if (isToday && seenToday) {
    return (
      <div
        className="rounded-2xl border px-4 py-3 mb-4 flex items-center gap-3 animate-fade-up paper-texture"
        style={{
          borderColor: `${accent}55`,
          background: `linear-gradient(135deg, ${accent}18, ${accent}06)`,
        }}
      >
        <span className="text-2xl">🎂</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            今天是你的日子
          </p>
          <p className="text-[11px] text-text-muted">
            所有图鉴卡今日有金箔卡缘 · 翻今日签卡看你的生日花
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-text-muted hover:text-text-primary"
          aria-label="清除生日"
        >×</button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-xl border px-3 py-2.5 mb-4 flex items-center gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span className="text-[11px] text-text-muted shrink-0">生日</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="MM-DD"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
          maxLength={5}
          className="flex-1 min-w-0 bg-transparent text-sm font-mono outline-none border-b border-dashed focus:border-solid"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          autoFocus
        />
        <button onClick={onSave} className="text-xs font-semibold px-3 py-1 rounded-md text-bg-primary" style={{ background: accent }}>
          保存
        </button>
        <button onClick={() => { setEditing(false); setError(null); }} className="text-[11px] text-text-muted">
          取消
        </button>
        {error && <span className="absolute mt-12 text-[11px] text-rose">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setEditing(true); setDraft(bd ? formatBirthday(bd) : ''); }}
      className="text-[11px] text-text-muted hover:text-text-primary inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-dashed transition-colors"
      style={{ borderColor: 'var(--color-border-subtle)' }}
    >
      🎂 {bd ? `生日 ${formatBirthday(bd)} · 改` : '设个生日 · 当天卡缘金箔'}
    </button>
  );
}
