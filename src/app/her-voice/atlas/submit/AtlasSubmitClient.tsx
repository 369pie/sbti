'use client';

import { useState } from 'react';
import { getApiPath } from '@/lib/api';
import { ACCENT, HAIRLINE, INK, INK_MUTED, PAPER_RAISED, primaryLinkStyle } from '../../_editorial-styles';

interface SubmitResponse {
  ok: boolean;
  persisted?: boolean;
  error?: string;
  submission?: {
    id: string;
    status: string;
    sigil_hash?: string | null;
  };
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  fontSize: 14,
  color: INK,
};

const monoLabelStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 10,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: ACCENT,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${HAIRLINE}`,
  background: PAPER_RAISED,
  color: INK,
  padding: '14px 16px',
  fontSize: 15,
  lineHeight: 1.6,
  fontFamily: 'inherit',
  outline: 'none',
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  color: INK_MUTED,
  fontSize: 12,
  lineHeight: 1.6,
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  letterSpacing: '0.08em',
};

export function AtlasSubmitClient() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [topicWeek, setTopicWeek] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse['submission'] | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErr(null);
    setResult(null);
    setPersisted(null);

    try {
      const res = await fetch(getApiPath('/api/hermosa/atlas'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          body_md: bodyMd,
          cover_note: coverNote,
          source_topic_week: topicWeek || null,
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false, error: `HTTP_${res.status}` }))) as SubmitResponse;
      if (!res.ok || !data.ok) {
        setErr(data.error ?? `HTTP_${res.status}`);
        return;
      }
      setPersisted(Boolean(data.persisted));
      setResult(data.submission ?? null);
      setTitle('');
      setExcerpt('');
      setBodyMd('');
      setCoverNote('');
      setTopicWeek('');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'network_error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ marginTop: 48, borderTop: `1px solid ${INK}`, paddingTop: 28 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)',
          gap: 28,
        }}
      >
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 20 }}>
          <label style={labelStyle}>
            <span style={monoLabelStyle}>题目 · Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required style={inputStyle} />
            <p style={hintStyle}>{title.length}/80</p>
          </label>

          <label style={labelStyle}>
            <span style={monoLabelStyle}>一句副标 · Excerpt</span>
            <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={220} style={inputStyle} />
            <p style={hintStyle}>可空。推荐 40-90 字，像 atlas 词条的副标题。</p>
          </label>

          <label style={labelStyle}>
            <span style={monoLabelStyle}>主稿 · 200-4000 字</span>
            <textarea
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              minLength={200}
              maxLength={4000}
              required
              rows={14}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <p style={hintStyle}>{bodyMd.length}/4000 · 先写你真正想命名的那件事，不用先写得像百科。</p>
          </label>

          <label style={labelStyle}>
            <span style={monoLabelStyle}>封面一句话 · Cover Note</span>
            <input value={coverNote} onChange={(e) => setCoverNote(e.target.value)} maxLength={120} style={inputStyle} />
            <p style={hintStyle}>可空。给编辑部一个你希望被读到的切口。</p>
          </label>

          <label style={labelStyle}>
            <span style={monoLabelStyle}>相关围炉周次 · YYYY-Www</span>
            <input value={topicWeek} onChange={(e) => setTopicWeek(e.target.value)} placeholder="2026-W19" style={inputStyle} />
            <p style={hintStyle}>可空。如果这条词条来自某一周围炉，可以写周次。</p>
          </label>

          <div className="hv-actions" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" disabled={submitting} style={{ ...primaryLinkStyle, cursor: submitting ? 'wait' : 'pointer' }}>
              {submitting ? '正在递交' : '递交给编辑部'}
            </button>
            <span style={hintStyle}>当前进入 review 池，不会自动公开。</span>
          </div>
        </form>

        <aside
          style={{
            borderTop: `1px solid ${INK}`,
            paddingTop: 18,
            display: 'grid',
            gap: 16,
            alignContent: 'start',
          }}
        >
          <div style={monoLabelStyle}>§ Editorial Note</div>
          <p style={{ margin: 0, color: INK, lineHeight: 1.85, fontStyle: 'italic' }}>
            这里不是公开发帖口，也不是 comment 区。它更像一张递进编辑部的卡片：先命名，再等待被整理进 atlas。
          </p>
          <p style={{ margin: 0, color: INK_MUTED, lineHeight: 1.8 }}>
            Q3 正式开放前，这个页面默认作为预热投稿池。被选中的稿子会进入双月发布队列，而不是即时上线。
          </p>

          {err ? (
            <div style={{ border: `1px solid ${ACCENT}`, padding: '12px 14px', color: ACCENT, fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 12 }}>
              · {err} ·
            </div>
          ) : null}

          {result ? (
            <div style={{ border: `1px solid ${INK}`, padding: '14px 16px', background: PAPER_RAISED, display: 'grid', gap: 10 }}>
              <div style={monoLabelStyle}>§ 已进入 Review 池</div>
              <p style={{ margin: 0, lineHeight: 1.8 }}>
                投稿编号：{result.id}
                <br />
                当前状态：{result.status}
                {result.sigil_hash ? (
                  <>
                    <br />
                    印记：{result.sigil_hash}
                  </>
                ) : null}
              </p>
              <p style={{ ...hintStyle, marginTop: 2 }}>
                {persisted ? '已写入 atlas_submissions。' : '当前环境未持久化，但表单结构已打通。'}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}