'use client';

/**
 * <WhisperButton/> — 项目方点击后弹出 Whisper 表单，POST /api/hermosa/whisper。
 * 双盲：talent 邮箱不出现在前端任何地方，发送结果只返回 ok / error。
 */

import { useState, type CSSProperties } from 'react';
import { getApiPath } from '@/lib/api';

const PAPER = '#F5F0E8';
const PAPER_RAISED = '#FAF7F2';
const INK = '#1A1530';
const INK_MUTED = '#8A817A';
const ACCENT = '#C0512F';
const HAIRLINE = 'rgba(26, 21, 48, 0.14)';
const MONO = 'ui-monospace, "SF Mono", monospace';
const SERIF = 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)';

const BUDGETS: Array<{ value: string; label: string }> = [
  { value: 'free', label: '互助 / 无预算' },
  { value: '<1k', label: '< 1k' },
  { value: '1k-5k', label: '1k – 5k' },
  { value: '5k-20k', label: '5k – 20k' },
  { value: '20k+', label: '20k+' },
  { value: 'flex', label: '可商量' },
];

const ERROR_LABEL: Record<string, string> = {
  invalid_email: '邮箱格式不对，再看看？',
  empty_brief: '一句话需求是空的。',
  rate_limited: '今天发起的 Whisper 太多了，1 小时后再试。',
  duplicate_recent: '24 小时内你已经联系过她了，给她一些时间。',
  talent_not_found: '这位接单者已经不在名录里了。',
  talent_unavailable: '她暂停接单了，回头再来。',
  no_contact_channel: '她还没预留联系通道。',
  flagged: '这条消息被反垃圾系统拦了 —— 别贴外部链接和联系方式，直接讲项目就好。',
  network: '网络出错了，再试一次？',
};

export function WhisperButton({
  talentId,
  talentHandle,
}: {
  talentId: string;
  talentHandle: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [brief, setBrief] = useState('');
  const [budget, setBudget] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    brief.trim().length > 0 &&
    brief.trim().length <= 280 &&
    !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(getApiPath('/api/hermosa/whisper'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          talent_id: talentId,
          sender_email: email.trim(),
          sender_handle: handle.trim() || null,
          brief: brief.trim(),
          budget_band: budget || null,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? 'unknown');
        return;
      }
      setDone(true);
    } catch {
      setError('network');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    if (done) {
      // reset for next use
      setEmail('');
      setHandle('');
      setBrief('');
      setBudget('');
      setDone(false);
      setError(null);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={triggerBtnStyle}>
        → WHISPER
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`联系 ${talentHandle}`}
          onClick={close}
          style={overlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
            <button
              onClick={close}
              aria-label="关闭"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'transparent',
                border: 'none',
                fontFamily: MONO,
                fontSize: 12,
                color: INK_MUTED,
                cursor: 'pointer',
                letterSpacing: '0.32em',
              }}
            >
              ✕ CLOSE
            </button>

            {done ? (
              <DoneState handle={talentHandle} onClose={close} />
            ) : (
              <FormState
                handle={talentHandle}
                email={email}
                setEmail={setEmail}
                yourHandle={handle}
                setYourHandle={setHandle}
                brief={brief}
                setBrief={setBrief}
                budget={budget}
                setBudget={setBudget}
                error={error}
                busy={busy}
                canSubmit={canSubmit}
                onSubmit={submit}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function FormState({
  handle,
  email,
  setEmail,
  yourHandle,
  setYourHandle,
  brief,
  setBrief,
  budget,
  setBudget,
  error,
  busy,
  canSubmit,
  onSubmit,
}: {
  handle: string;
  email: string;
  setEmail: (v: string) => void;
  yourHandle: string;
  setYourHandle: (v: string) => void;
  brief: string;
  setBrief: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  error: string | null;
  busy: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      <div style={eyebrowStyle}>§ WHISPER · 双盲投递</div>
      <h2 style={titleStyle}>
        给 <span style={{ color: ACCENT, fontStyle: 'italic' }}>{handle}</span>
      </h2>
      <div style={ruleStyle} />
      <p style={ledeStyle}>
        她不会知道你的真实身份 —— 直到你按下发送。我们也不会知道你说了什么 ——
        正文不入库，只记录元数据。她直接 reply 这封邮件就能联系到你。
      </p>

      <div style={{ display: 'grid', gap: 16, marginTop: 22 }}>
        <Field label="你的邮箱 · YOUR EMAIL" hint="她的回信会到这里">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, 120))}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </Field>
        <Field label="你的称呼 · YOUR HANDLE" hint="可空 ≤ 24">
          <input
            value={yourHandle}
            onChange={(e) => setYourHandle(e.target.value.slice(0, 24))}
            placeholder="例：某品牌内容主理"
            style={inputStyle}
          />
        </Field>
        <Field label="一句话需求 · BRIEF" hint={`${brief.length} / 280`}>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value.slice(0, 280))}
            placeholder="想做一档女性向播客 · 需要一位会写人物稿的合作者，预计 4 期。"
            rows={4}
            style={textareaStyle}
          />
        </Field>
        <Field label="预算意向 · BUDGET" hint="选一个最贴近的">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BUDGETS.map((b) => {
              const active = budget === b.value;
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBudget(active ? '' : b.value)}
                  style={{
                    padding: '8px 12px',
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    border: `1px solid ${active ? INK : HAIRLINE}`,
                    background: active ? INK : 'transparent',
                    color: active ? PAPER : INK,
                    cursor: 'pointer',
                    borderRadius: 0,
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      {error ? (
        <div
          style={{
            marginTop: 16,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.24em',
            color: ACCENT,
            textTransform: 'uppercase',
          }}
        >
          · {ERROR_LABEL[error] ?? error} ·
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
        <button onClick={onSubmit} disabled={!canSubmit} style={primaryBtnStyle}>
          {busy ? '· SENDING ·' : '→ 发送 Whisper'}
        </button>
      </div>

      <p
        style={{
          marginTop: 18,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: INK_MUTED,
          textTransform: 'uppercase',
        }}
      >
        · 反垃圾：1h 最多 3 条 · 24h 同一位最多 1 条 ·
      </p>
    </>
  );
}

function DoneState({ handle, onClose }: { handle: string; onClose: () => void }) {
  return (
    <>
      <div style={eyebrowStyle}>§ DELIVERED · 已投递</div>
      <h2 style={titleStyle}>
        信已经<span style={{ color: ACCENT, fontStyle: 'italic' }}>寄出去了</span>
      </h2>
      <div style={ruleStyle} />
      <p style={ledeStyle}>
        如果 {handle} 感兴趣，她会直接回到你刚才填的邮箱里 ——
        我们不在中间留痕，也不会代发后续。
        没回复也很正常，可以一周后再试一次别的人选。
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} style={primaryBtnStyle}>
          → 知道了
        </button>
      </div>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: INK_MUTED,
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{label}</span>
        {hint ? <span style={{ opacity: 0.7 }}>{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const triggerBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
  padding: '10px 18px',
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  textTransform: 'uppercase',
  background: INK,
  color: PAPER,
  border: `1px solid ${INK}`,
  cursor: 'pointer',
  borderRadius: 0,
};

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(26, 21, 48, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
  zIndex: 200,
};

const panelStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 560,
  maxHeight: 'calc(100vh - 48px)',
  overflowY: 'auto',
  background: PAPER_RAISED,
  borderTop: `3px solid ${INK}`,
  borderBottom: `1px solid ${HAIRLINE}`,
  padding: '40px 32px 32px',
  fontFamily: SERIF,
  color: INK,
};

const eyebrowStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '0.42em',
  color: ACCENT,
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  margin: '12px 0 0',
  fontSize: 'clamp(28px, 4vw, 38px)',
  lineHeight: 1.05,
  fontStyle: 'italic',
  letterSpacing: '-0.01em',
  fontWeight: 500,
};

const ruleStyle: CSSProperties = {
  width: 48,
  height: 2,
  background: ACCENT,
  margin: '14px 0 18px',
};

const ledeStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.85,
  fontStyle: 'italic',
  color: INK,
  opacity: 0.78,
};

const inputStyle: CSSProperties = {
  border: 'none',
  borderBottom: `1px solid ${INK}`,
  background: 'transparent',
  padding: '8px 0',
  fontFamily: SERIF,
  fontStyle: 'italic',
  fontSize: 16,
  color: INK,
  borderRadius: 0,
  width: '100%',
  outline: 'none',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 80,
  lineHeight: 1.6,
};

const primaryBtnStyle: CSSProperties = {
  ...triggerBtnStyle,
  minHeight: 44,
  padding: '12px 22px',
};
