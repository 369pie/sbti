'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { withBasePath } from '@/lib/site';
import { rememberOwnContribution } from '@/lib/hermosa/contributions-storage';
import { getCurrentHermosaTopic } from '@/lib/hermosa/topics';
import {
  ACCENT,
  HAIRLINE,
  INK,
  INK_MUTED,
  PAPER,
  PAPER_RAISED,
  accentRuleStyle,
  datelineRuleStyle,
  datelineStyle,
  eyebrowStyle,
  ledeStyle,
  pageStyle,
  primaryLinkStyle,
  secondaryLinkStyle,
  shellStyle,
  summaryStyle,
  titleStyle,
  HerVoiceMobileStyles,
} from '../_editorial-styles';

const MONO = 'ui-monospace, "SF Mono", monospace';
const DEFAULT_PROMPT = '100 位女生第一次用 AI 做了什么？';
const CURRENT_TOPIC = getCurrentHermosaTopic();

function slugify(input: string): string {
  const ascii = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return ascii || `topic-${new Date().toISOString().slice(0, 10)}`;
}

function buildCode(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).slice(0, 6).toUpperCase().padStart(4, '0');
}

export function TopicBuilderClient() {
  const [host, setHost] = useState('');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [defaultKind, setDefaultKind] = useState<'voice' | 'book' | 'ai_question'>('ai_question');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'ok' | 'error'>('idle');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const topicLink = useMemo(() => {
    const cleanHost = host.replace(/\s+/g, ' ').trim().slice(0, 40);
    const cleanPrompt = prompt.replace(/\s+/g, ' ').trim().slice(0, 120) || DEFAULT_PROMPT;
    const slug = slugify(`${cleanHost || 'her-voice'} ${cleanPrompt}`);
    const code = buildCode(`${cleanHost}|${cleanPrompt}|${defaultKind}`);
    const params = new URLSearchParams({
      kind: defaultKind,
      universe: 'meta',
      slug,
      code,
      prompt: cleanPrompt,
    });
    if (cleanHost) params.set('host', cleanHost);
    const path = withBasePath(`/her-voice/?${params.toString()}`);
    return `${origin}${path}`;
  }, [defaultKind, host, origin, prompt]);

  const shareCopy = useMemo(() => {
    const cleanHost = host.trim() || 'Her Voice';
    const cleanPrompt = prompt.trim() || DEFAULT_PROMPT;
    return [
      `${cleanHost} 发起一个 Her Voice 主题征集：`,
      `「${cleanPrompt}」`,
      '',
      '写一句话、推荐一本书，或者留下一个想用 AI 学会的问题。',
      '被选入后会进入 Her Voice 公共资产：书单、AI 问题库、壁纸包和本周精选。',
      '',
      topicLink,
    ].join('\n');
  }, [host, prompt, topicLink]);

  async function copyShareText() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(shareCopy);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function submitTopicProposal() {
    const cleanPrompt = prompt.replace(/\s+/g, ' ').trim().slice(0, 120) || DEFAULT_PROMPT;
    const cleanHost = host.replace(/\s+/g, ' ').trim().slice(0, 40);
    const slug = slugify(`${cleanHost || 'her-voice'} ${cleanPrompt}`);
    const code = buildCode(`${cleanHost}|${cleanPrompt}|${defaultKind}`);
    setSubmitting(true);
    setSubmitState('idle');
    try {
      const res = await fetch(getApiPath('/api/hermosa/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universe: 'meta',
          slug,
          code,
          kind: 'concept',
          text: cleanPrompt,
          metadata: {
            concept: cleanPrompt,
            confusion: cleanHost ? `${cleanHost} 发起的 Her Voice 共建主题。默认入口：${defaultKind}` : `Her Voice 共建主题。默认入口：${defaultKind}`,
            prompt: cleanPrompt,
          },
          signature: cleanHost || undefined,
          tags: ['feature'],
          topic_week: CURRENT_TOPIC.week,
          consent_to_feature: true,
          attribution_mode: cleanHost ? 'signature' : 'anonymous',
        }),
      });
      const payload = (await res.json().catch(() => null)) as { ok?: boolean; message?: { id?: string } } | null;
      if (!res.ok || !payload?.ok) throw new Error(String(res.status));
      if (payload.message?.id) rememberOwnContribution(payload.message.id);
      setSubmitState('ok');
    } catch {
      setSubmitState('error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="hv-page" style={pageStyle}>
      <HerVoiceMobileStyles />
      <div style={shellStyle}>
        <div style={datelineStyle}>
          <span>HERMOSA · CREATOR TOPIC KIT</span>
          <span className="hv-dateline-r">暮光博物笔记 · MMXXVI</span>
        </div>
        <div style={datelineRuleStyle} />

        <header style={{ marginBottom: 52 }}>
          <div style={eyebrowStyle}>§ 发起主题 · TOPIC KIT</div>
          <h1 style={titleStyle}>
            把一次<span style={{ color: ACCENT }}>提问</span>变成共建
          </h1>
          <div style={accentRuleStyle} />
          <p style={ledeStyle}>
            给女性创作者、社群主理人和 KOC 的轻工具。填一个主题，生成可分享的 Her Voice 征集链接；
            回流内容会带上 slug/code，方便后台按来源整理第一期资产包。
          </p>
          <div style={summaryStyle}>NO LOGIN / TRACKED BY SLUG + CODE / EDITORIAL COMMONS</div>
        </header>

        <section style={builderGridStyle}>
          <div style={panelStyle}>
            <Field label="发起人 · HOST">
              <input
                value={host}
                onChange={(event) => setHost(event.target.value.slice(0, 40))}
                placeholder="例：某某读书会 / AI 女生小组"
                style={inputStyle}
              />
            </Field>
            <Field label="征集问题 · PROMPT">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value.slice(0, 120))}
                rows={3}
                style={textareaStyle}
              />
            </Field>
            <Field label="默认入口 · DEFAULT TAB">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  ['voice', '一句话'],
                  ['book', '她的书'],
                  ['ai_question', 'AI 问题'],
                ].map(([value, label]) => {
                  const active = defaultKind === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDefaultKind(value as typeof defaultKind)}
                      style={choiceStyle(active)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <div style={{ ...panelStyle, background: PAPER }}>
            <div style={eyebrowStyle}>§ 生成结果 · SHARE COPY</div>
            <textarea readOnly value={shareCopy} rows={9} style={copyBoxStyle} />
            <div className="hv-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
              <button type="button" onClick={copyShareText} style={buttonStyle(copied)}>
                {copied ? '已复制' : '复制征集文案'}
              </button>
              <button type="button" onClick={submitTopicProposal} disabled={submitting} style={buttonStyle(submitState === 'ok')}>
                {submitting ? '提交中' : submitState === 'ok' ? '已提交编辑部' : '提交主题给编辑部'}
              </button>
              <a href={topicLink} target="_blank" rel="noreferrer" style={primaryLinkStyle}>
                打开征集页
              </a>
              <Link href={withBasePath('/her-voice/')} style={secondaryLinkStyle}>
                回到她说
              </Link>
            </div>
          </div>
        </section>

        {submitState === 'error' ? (
          <section style={{ ...noteStyle, color: ACCENT }}>
            主题暂时没有提交成功；征集链接已经生成，可以先复制使用。
          </section>
        ) : null}

        <section style={noteStyle}>
          <strong style={{ color: ACCENT, fontStyle: 'italic' }}>编辑提示：</strong>
          后台可以用 slug/code 识别这次主题来源；先人工筛选，确认授权后再进入书单、壁纸包、AI 问题库。
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.32em', color: INK_MUTED, textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const builderGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
  gap: 28,
  alignItems: 'start',
};

const panelStyle: CSSProperties = {
  padding: '28px 0',
  borderTop: `1px solid ${INK}`,
  borderBottom: `1px solid ${HAIRLINE}`,
  background: PAPER_RAISED,
  display: 'grid',
  gap: 18,
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: 'none',
  borderBottom: `1px solid ${INK}`,
  background: 'transparent',
  padding: '10px 0',
  color: INK,
  fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
  fontSize: 17,
  fontStyle: 'italic',
  outline: 'none',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 96,
  lineHeight: 1.7,
};

const copyBoxStyle: CSSProperties = {
  ...textareaStyle,
  minHeight: 220,
  padding: 16,
  border: `1px solid ${HAIRLINE}`,
  fontSize: 14,
  fontStyle: 'normal',
  fontFamily: '"Noto Serif SC", serif',
  background: PAPER_RAISED,
};

function choiceStyle(active: boolean): CSSProperties {
  return {
    padding: '9px 12px',
    border: `1px solid ${active ? INK : HAIRLINE}`,
    background: active ? INK : 'transparent',
    color: active ? PAPER : INK,
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };
}

function buttonStyle(active: boolean): CSSProperties {
  return {
    ...primaryLinkStyle,
    background: active ? ACCENT : INK,
    borderColor: active ? ACCENT : INK,
    cursor: 'pointer',
  };
}

const noteStyle: CSSProperties = {
  marginTop: 34,
  padding: '18px 0',
  borderTop: `1px dotted ${HAIRLINE}`,
  color: INK_MUTED,
  fontSize: 14,
  lineHeight: 1.8,
};