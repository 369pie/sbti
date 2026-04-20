/**
 * F8 · Whisper Input 私语输入
 * 24 字限制 + 暗紫底 + 金线下划 + 呼吸星点。
 */
'use client';

import { useCallback, useState } from 'react';

interface Props {
  prompt: string;
  hint?: string;
  maxLength?: number;
  initial?: string;
  /** 输入完成（onChange + debounced 也行；这里在 blur 时回调） */
  onCommit: (text: string) => void;
  placeholder?: string;
}

export function WhisperInput({
  prompt,
  hint,
  maxLength = 24,
  initial = '',
  onCommit,
  placeholder = '在这里写下一句…',
}: Props) {
  const [value, setValue] = useState<string>(initial);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value.slice(0, maxLength);
      setValue(v);
    },
    [maxLength],
  );

  const handleBlur = useCallback(() => {
    onCommit(value.trim());
  }, [value, onCommit]);

  const remaining = maxLength - value.length;

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend style={{ width: '100%' }}>
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 15,
            color: '#F5F0E8',
            fontFamily: 'Noto Serif SC, serif',
            lineHeight: 1.55,
          }}
        >
          {prompt}
        </p>
        {hint ? (
          <p
            style={{
              margin: '6px 0 0',
              textAlign: 'center',
              fontSize: 11.5,
              color: 'rgba(245,240,232,.5)',
              fontStyle: 'italic',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            {hint}
          </p>
        ) : null}
      </legend>

      <div
        style={{
          margin: '20px auto 0',
          maxWidth: 380,
          padding: '20px 18px',
          borderRadius: 14,
          background:
            'linear-gradient(180deg, rgba(28,20,55,.85) 0%, rgba(14,10,28,.95) 100%)',
          border: '1px solid rgba(201,166,118,.25)',
          boxShadow: '0 12px 40px rgba(60,40,110,.45)',
          position: 'relative',
        }}
      >
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={maxLength}
          rows={2}
          placeholder={placeholder}
          aria-label={prompt}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            color: '#F5F0E8',
            fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
            fontStyle: 'italic',
            fontSize: 18,
            lineHeight: 1.6,
            textAlign: 'center',
            letterSpacing: 0.5,
            padding: '8px 4px',
            borderBottom: `1px solid ${value.length > 0 ? '#C9A676' : 'rgba(245,240,232,.18)'}`,
            transition: 'border-color .35s',
          }}
        />
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 10,
            letterSpacing: 3,
            color: 'rgba(201,166,118,.7)',
            textTransform: 'uppercase',
          }}
        >
          <span>✦ Whisper</span>
          <span style={{ color: remaining < 5 ? '#C07A8E' : 'rgba(245,240,232,.5)' }}>
            {value.length} / {maxLength}
          </span>
        </div>
      </div>
    </fieldset>
  );
}
