'use client';

/**
 * /her-voice — Her Voice Commons
 *
 * Sprint 1 upgrade:
 * - contribution kinds: voice / book / AI question
 * - weekly topic and curation consent
 * - public filters for kind, universe, and tag
 * - analytics hooks for select, submit, and echo
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { getApiPath } from '@/lib/api';
import { enqueueProductEvent } from '@/lib/analytics/product-events';
import {
  HERMOSA_KIND_HINTS,
  HERMOSA_KIND_LABELS,
  HERMOSA_KINDS,
  HERMOSA_TAGS,
  HERMOSA_TAG_LABELS,
  HERMOSA_UNIVERSES,
  HERMOSA_UNIVERSE_LABELS,
  HERMOSA_WRITE_KINDS,
  isHermosaKind,
  isHermosaUniverse,
  type HermosaContributionMetadata,
  type HermosaKind,
  type HermosaTag,
  type HermosaUniverse,
} from '@/lib/hermosa/tags';
import { getCurrentHermosaTopic } from '@/lib/hermosa/topics';
import { rememberOwnContribution } from '@/lib/hermosa/contributions-storage';
import { withBasePath } from '@/lib/site';
import { VoiceSigil, levelFromCount } from '@/components/VoiceSigil';

interface Message {
  id: string;
  universe: string;
  slug: string | null;
  kind: HermosaKind;
  text: string;
  signature: string | null;
  tags: string[];
  metadata: HermosaContributionMetadata;
  topic_week: string | null;
  curation_status: string;
  consent_to_feature: boolean;
  attribution_mode: string;
  safety_level: string;
  echo_count: number;
  is_featured: boolean;
  // HER AURORA · W3 · 极光生命周期（lit / caught / tended / inscribed / codex）
  lifecycle?: 'lit' | 'caught' | 'tended' | 'inscribed' | 'codex';
  inscribed_letter_slug?: string | null;
  codex_atlas_slug?: string | null;
  created_at: string;
}

interface ContributionPayload {
  kind: (typeof HERMOSA_WRITE_KINDS)[number];
  text: string;
  tags: HermosaTag[];
  metadata: HermosaContributionMetadata;
}

const ECHO_KEY = 'hermosa.echoes.v1';
const CURRENT_TOPIC = getCurrentHermosaTopic();
const TOPIC_WEEK = CURRENT_TOPIC.week;
const WEEKLY_TOPIC = CURRENT_TOPIC.question;

interface TopicOverride {
  question: string;
  host: string | null;
  slug: string | null;
  code: string | null;
}

const PUBLIC_FUNNEL_RESOURCES = [
  {
    index: 'I',
    label: 'AI SIGNALS',
    title: '最前沿 AI 资讯与工具信号',
    body: '把正在起量的新工具、新模型、新玩法整理成可理解的情报，不再靠刷碎片信息判断机会。',
  },
  {
    index: 'II',
    label: 'MONETIZATION',
    title: 'AI 变现机会拆解',
    body: '关注 AI 宣传广告片、AI 漫剧、数字人、内容矩阵、个人 IP 与轻服务接单，先看清流程、报价与需求。',
  },
  {
    index: 'III',
    label: 'TOKEN MAP',
    title: 'Token 中转站行业观察',
    body: '只讲行业结构、成本逻辑、常见坑位、风控与合规边界，避免把灰色包装误当成机会。',
  },
  {
    index: 'IV',
    label: 'SIDE BUSINESS',
    title: '信息差选品与轻副业',
    body: '从小红书、闲鱼等平台观察需求、选品、测内容、低成本验证，适合普通人先小步试错。',
  },
  {
    index: 'V',
    label: 'ANTI-PIT',
    title: '避坑与一手经验共享',
    body: 'AI 行业鱼龙混杂，很多坑比入群费贵得多。先听真实经验，再决定要不要花钱、花时间、下场做。',
  },
] as const;

const PUBLIC_FUNNEL_TIERS = [
  { label: '前 30 名', price: '19.9 元' },
  { label: '31-100 名', price: '99 元' },
  { label: '100 名以后', price: '499 元' },
] as const;

function loadEchoes(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const arr = JSON.parse(window.localStorage.getItem(ECHO_KEY) ?? '[]') as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveEcho(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const next = Array.from(loadEchoes());
    next.push(id);
    window.localStorage.setItem(ECHO_KEY, JSON.stringify(next.slice(-200)));
  } catch {}
}

export function HerVoiceContent() {
  const [universe, setUniverse] = useState<'all' | HermosaUniverse>('all');
  const [tag, setTag] = useState<'all' | HermosaTag>('all');
  const [kindFilter, setKindFilter] = useState<'all' | HermosaKind>('all');
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [echoed, setEchoed] = useState<Set<string>>(new Set());
  const [writeSource, setWriteSource] = useState<{
    universe: HermosaUniverse;
    slug?: string;
    code?: string;
  }>({ universe: 'meta' });
  const [topicOverride, setTopicOverride] = useState<TopicOverride | null>(null);

  const [writeKind, setWriteKind] = useState<(typeof HERMOSA_WRITE_KINDS)[number]>('voice');
  const [writeText, setWriteText] = useState('');
  const [writeSignature, setWriteSignature] = useState('');
  const [writeTag, setWriteTag] = useState<HermosaTag | ''>('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookQuote, setBookQuote] = useState('');
  const [bookNote, setBookNote] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [aiTool, setAiTool] = useState('');
  const [consentToFeature, setConsentToFeature] = useState(false);
  const [writeSubmitting, setWriteSubmitting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [writeSuccess, setWriteSuccess] = useState(false);

  useEffect(() => {
    setEchoed(loadEchoes());
    enqueueProductEvent('her_voice', 'her_voice_view', {
      props: { topic_week: TOPIC_WEEK },
    });

    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const queryKind = params.get('kind');
    if (queryKind && isHermosaKind(queryKind)) {
      setKindFilter(queryKind);
      if ((HERMOSA_WRITE_KINDS as readonly string[]).includes(queryKind)) {
        setWriteKind(queryKind as (typeof HERMOSA_WRITE_KINDS)[number]);
      }
    }
    const queryUniverse = params.get('universe');
    const querySlug = params.get('slug')?.trim().slice(0, 80) || undefined;
    const queryCode = params.get('code')?.trim().slice(0, 16) || undefined;
    if (queryUniverse && isHermosaUniverse(queryUniverse)) {
      setUniverse(queryUniverse);
      setWriteSource({ universe: queryUniverse, slug: querySlug, code: queryCode });
    }
    const prompt = (params.get('prompt') ?? params.get('topic') ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
    if (prompt) {
      const host = (params.get('host') ?? '').replace(/\s+/g, ' ').trim().slice(0, 40) || null;
      const sourceUniverse = queryUniverse && isHermosaUniverse(queryUniverse) ? queryUniverse : 'meta';
      setTopicOverride({ question: prompt, host, slug: querySlug ?? null, code: queryCode ?? null });
      setUniverse(sourceUniverse);
      setWriteSource({ universe: sourceUniverse, slug: querySlug, code: queryCode });
      enqueueProductEvent('her_voice', 'her_voice_creator_topic_view', {
        props: { topic_week: TOPIC_WEEK, slug: querySlug ?? 'none', code: queryCode ?? 'none' },
      });
    }
  }, []);

  const activeTopicQuestion = topicOverride?.question ?? WEEKLY_TOPIC;

  // 极光时刻倒计时：本周极光时刻 = 本周日 23:59 本地时间。
  // 仅在客户端计算 + 每分钟刷新一次，避免 SSR 时间漂移导致水合不一致。
  const [auroralCountdown, setAuroralCountdown] = useState<{ days: number; hours: number } | null>(null);
  useEffect(() => {
    const computeRemaining = () => {
      const now = new Date();
      const day = now.getDay(); // 0=周日, 1=周一, ..., 6=周六
      const daysUntilSunday = (7 - day) % 7; // 周日为 0，下次"本周日 23:59"
      const target = new Date(now);
      target.setDate(now.getDate() + daysUntilSunday);
      target.setHours(23, 59, 0, 0);
      // 若本周日 23:59 已过（周日傍晚之后），自动滚到下一个周日。
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 7);
      }
      const diffMs = target.getTime() - now.getTime();
      const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
      return { days: Math.floor(totalHours / 24), hours: totalHours % 24 };
    };
    setAuroralCountdown(computeRemaining());
    const t = setInterval(() => setAuroralCountdown(computeRemaining()), 60_000);
    return () => clearInterval(t);
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '60' });
      if (universe !== 'all') params.set('universe', universe);
      if (tag !== 'all') params.set('tag', tag);
      if (kindFilter !== 'all') params.set('kind', kindFilter);
      const res = await fetch(getApiPath(`/api/hermosa/messages?${params}`), {
        cache: 'no-store',
      });
      if (!res.ok) {
        setRows([]);
        return;
      }
      const data = (await res.json()) as { ok: boolean; messages: Message[] };
      setRows(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [universe, tag, kindFilter]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const selectWriteKind = useCallback((next: (typeof HERMOSA_WRITE_KINDS)[number]) => {
    setWriteKind(next);
    setKindFilter(next);
    setWriteError(null);
    enqueueProductEvent('her_voice', 'her_voice_kind_select', {
      props: { kind: next, topic_week: TOPIC_WEEK },
    });
  }, []);

  const openAiQuestionComposer = useCallback(() => {
    setWriteKind('ai_question');
    setKindFilter('ai_question');
    setWriteError(null);
    enqueueProductEvent('her_voice', 'her_voice_public_funnel_cta_click', {
      props: { topic_week: TOPIC_WEEK, target: 'compose_ai_question' },
    });
    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      const el = document.getElementById('hv-compose');
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, []);

  const contribution = useMemo<ContributionPayload | null>(() => {
    if (writeKind === 'voice') {
      const text = writeText.trim();
      if (!text || text.length > 180) return null;
      return {
        kind: 'voice',
        text,
        tags: writeTag ? [writeTag] : [],
        metadata: { prompt: activeTopicQuestion },
      };
    }

    if (writeKind === 'book') {
      const title = bookTitle.trim();
      const author = bookAuthor.trim();
      const quote = bookQuote.trim();
      const note = bookNote.trim();
      if (!title || (!note && !quote)) return null;
      const summary = note || quote;
      return {
        kind: 'book',
        text: `《${title}》${author ? ` / ${author}` : ''}：${summary}`.slice(0, 180),
        tags: ['story'],
        metadata: {
          prompt: activeTopicQuestion,
          book_title: title,
          book_author: author || undefined,
          book_quote: quote || undefined,
          book_note: note || undefined,
        },
      };
    }

    const question = aiQuestion.trim();
    if (!question || question.length > 180) return null;
    return {
      kind: 'ai_question',
      text: question,
      tags: ['want'],
      metadata: {
        prompt: activeTopicQuestion,
        ai_question: question,
        ai_context: aiContext.trim() || undefined,
        ai_tool: aiTool.trim() || undefined,
      },
    };
  }, [activeTopicQuestion, aiContext, aiQuestion, aiTool, bookAuthor, bookNote, bookQuote, bookTitle, writeKind, writeTag, writeText]);

  const onEcho = useCallback(
    async (id: string) => {
      if (echoed.has(id)) return;
      const target = rows.find((r) => r.id === id);
      const next = new Set(echoed);
      next.add(id);
      setEchoed(next);
      saveEcho(id);
      setRows((prev) =>
        prev.map((p) => (p.id === id ? { ...p, echo_count: p.echo_count + 1 } : p)),
      );
      enqueueProductEvent('her_voice', 'her_voice_echo', {
        props: {
          kind: target?.kind ?? 'unknown',
          universe: target?.universe ?? 'unknown',
        },
      });
      try {
        await fetch(getApiPath('/api/hermosa/echo'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch {}
    },
    [echoed, rows],
  );

  const resetContributionFields = useCallback(() => {
    setWriteText('');
    setWriteTag('');
    setBookTitle('');
    setBookAuthor('');
    setBookQuote('');
    setBookNote('');
    setAiQuestion('');
    setAiContext('');
    setAiTool('');
    setConsentToFeature(false);
  }, []);

  const onWriteSubmit = useCallback(async () => {
    if (!contribution || writeSubmitting) return;
    setWriteSubmitting(true);
    setWriteError(null);
    setWriteSuccess(false);
    enqueueProductEvent('her_voice', 'her_voice_submit_start', {
      props: {
        kind: contribution.kind,
        topic_week: TOPIC_WEEK,
        has_consent: consentToFeature,
      },
    });

    try {
      const res = await fetch(getApiPath('/api/hermosa/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universe: writeSource.universe,
          slug: writeSource.slug,
          code: writeSource.code,
          kind: contribution.kind,
          text: contribution.text,
          metadata: contribution.metadata,
          signature: writeSignature.trim() || undefined,
          tags: contribution.tags,
          topic_week: TOPIC_WEEK,
          consent_to_feature: consentToFeature,
          attribution_mode: writeSignature.trim() ? 'signature' : 'anonymous',
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: Message; error?: string };
      if (!res.ok || !data.ok) {
        if (data.error === 'rate_limited') {
          setWriteError('一小时内最多写 3 条，先沉淀一下吧。');
        } else if (data.error === 'invalid_kind') {
          setWriteError('贡献类型无效，请重新选择。');
        } else {
          setWriteError('提交失败，稍后再试。');
        }
        enqueueProductEvent('her_voice', 'her_voice_submit_error', {
          props: { kind: contribution.kind, error: data.error ?? `http_${res.status}` },
        });
        return;
      }
      setWriteSuccess(true);
      resetContributionFields();
      if (data.message) {
        setRows((prev) => [data.message!, ...prev]);
        rememberOwnContribution(data.message.id);
      }
      enqueueProductEvent('her_voice', 'her_voice_submit_success', {
        props: {
          kind: contribution.kind,
          topic_week: TOPIC_WEEK,
          has_consent: consentToFeature,
        },
      });
      setTimeout(() => setWriteSuccess(false), 3000);
    } catch {
      setWriteError('网络错误，稍后再试。');
      enqueueProductEvent('her_voice', 'her_voice_submit_error', {
        props: { kind: contribution.kind, error: 'network' },
      });
    } finally {
      setWriteSubmitting(false);
    }
  }, [consentToFeature, contribution, resetContributionFields, writeSignature, writeSource, writeSubmitting]);

  const featured = useMemo(() => rows.filter((r) => r.is_featured).slice(0, 3), [rows]);
  const kindCounts = useMemo(() => {
    const counts = Object.fromEntries(HERMOSA_KINDS.map((k) => [k, 0])) as Record<HermosaKind, number>;
    for (const row of rows) counts[row.kind] = (counts[row.kind] ?? 0) + 1;
    return counts;
  }, [rows]);
  const consentCount = useMemo(() => rows.filter((r) => r.consent_to_feature).length, [rows]);
  const topicCount = useMemo(() => rows.filter((r) => r.topic_week === TOPIC_WEEK).length, [rows]);

  const charCount =
    writeKind === 'voice'
      ? writeText.length
      : writeKind === 'book'
      ? Math.max(bookNote.length, bookQuote.length)
      : aiQuestion.length;

  const issueNumber = useMemo(() => {
    const m = TOPIC_WEEK.match(/(\d+)/g);
    return m ? toRoman(parseInt(m[m.length - 1] ?? '1', 10)) : 'I';
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: PAPER,
        color: INK,
        padding: '0 0 120px',
        fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
      }}
    >
      {/* Top dateline rule */}
      <div
        className="hv-topdate"
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '20px 28px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 8,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.32em',
          color: INK_MUTED,
        }}
      >
        <span>N° {issueNumber} · HERMOSA · HER AURORA · 她的极光</span>
        <span className="hv-topdate-r">{TOPIC_WEEK.toUpperCase()} · 暮光博物笔记</span>
      </div>
      <div className="hv-shell" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ height: 1, background: INK, opacity: 0.85, marginTop: 14 }} />
        <div style={{ height: 1, background: INK, opacity: 0.85, marginTop: 3 }} />
      </div>

      <div className="hv-shell" style={{ maxWidth: 1180, margin: '0 auto', padding: '46px 28px 0' }}>
        <header style={{ marginBottom: 56 }}>
          {/* Masthead */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '18px 0 28px',
            }}
          >
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                color: ACCENT,
              }}
            >
              POSTED TONIGHT · 今夜的极光时刻
            </div>
            <h1
              className="hv-h1"
              style={{
                margin: '14px 0 0',
                fontSize: 'clamp(56px, 12vw, 156px)',
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                color: INK,
                fontWeight: 600,
              }}
            >
              <span style={{ textDecoration: 'line-through', textDecorationThickness: 2, opacity: 0.55, marginRight: '0.18em', fontWeight: 500 }}>
                黑板
              </span>
              <span style={{ fontStyle: 'italic', color: ACCENT }}>她的极光</span>
            </h1>
            <div
              style={{
                marginTop: 22,
                fontSize: 'clamp(15px, 1.6vw, 19px)',
                lineHeight: 1.7,
                color: INK,
                opacity: 0.78,
                maxWidth: 720,
                fontStyle: 'italic',
              }}
            >
              一个让女性在长夜里彼此发光的现代档案馆。点亮一束光，接住一句「我也」，被守光人收录，最终入卷成为「极光星图」。
              <br />— 在这里你不发帖，你点亮一束光。
            </div>
            {/* Accent rule */}
            <div style={{ width: 96, height: 3, background: ACCENT, marginTop: 28 }} />
          </div>

          {/* Nav strip */}
          <nav
            className="hv-nav"
            style={{
              display: 'flex',
              gap: 0,
              flexWrap: 'wrap',
              justifyContent: 'center',
              borderTop: `1px solid ${HAIRLINE}`,
              borderBottom: `1px solid ${HAIRLINE}`,
              padding: '14px 0',
            }}
            aria-label="HER AURORA sections"
          >
            <NavLink href="/her-voice/books/" target="books_index">I · 极光书架</NavLink>
            <NavSep />
            <NavLink href="/her-voice/ai-lab/" target="ai_lab_index">II · 极光实验室</NavLink>
            <NavSep />
            <NavLink href={`/her-voice/wallpapers/${TOPIC_WEEK}/`} target="weekly_wallpapers">III · 本周壁纸包</NavLink>
            <NavSep />
            <NavLink href="/her-voice/we-heard-you/" target="we_heard_you">IV · 已被收录</NavLink>
            <NavSep />
            <NavLink href="/her-voice/talents/" target="talents_index">V · 守光人名录</NavLink>
            <NavSep />
            <NavLink href="/her-voice/my/" target="my_archive">VI · 我的极光</NavLink>
            <NavSep />
            <NavLink href="/her-voice/topics/" target="topic_builder">VII · 点亮一束新光</NavLink>
            <NavSep />
            <NavLink href="/her-voice/letters/" target="letters_index">VIII · 极光来信</NavLink>
            <NavSep />
            <NavLink href="/her-voice/atlas/" target="atlas_index">IX · 极光星图</NavLink>
          </nav>
        </header>

        <section className="hv-topic" style={topicBandStyle}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 14,
              borderLeft: `3px solid ${ACCENT}`,
              paddingLeft: 22,
            }}
          >
            {auroralCountdown ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: 'rgba(125, 183, 176, 0.12)',
                  border: '1px solid rgba(125, 183, 176, 0.42)',
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  color: '#3F6A65',
                  textTransform: 'uppercase',
                }}
              >
                <span aria-hidden>⌛</span>
                <span>本周极光时刻 · 还剩 {auroralCountdown.days} 天 {auroralCountdown.hours} 小时</span>
              </div>
            ) : null}
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                color: ACCENT,
              }}
            >
              {TOPIC_WEEK} · AURORAL HOUR · 本周问题
            </div>
            {!topicOverride && CURRENT_TOPIC.host ? (
              <div
                style={{
                  fontSize: 12,
                  color: '#5C5366',
                  fontStyle: 'italic',
                  letterSpacing: '0.04em',
                }}
              >
                守光人 · <span style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontStyle: 'normal', letterSpacing: '0.18em' }}>{CURRENT_TOPIC.host}</span> 提问 ——
              </div>
            ) : null}
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(28px, 4vw, 44px)',
                lineHeight: 1.18,
                color: INK,
                fontStyle: 'italic',
                letterSpacing: '-0.01em',
                fontWeight: 500,
              }}
            >
              {activeTopicQuestion}
            </h2>
            <div style={{ fontSize: 13, color: INK_MUTED, fontStyle: 'italic', letterSpacing: '0.04em' }}>
              {topicOverride?.host
                ? `— ${topicOverride.host} 发起的共建主题；点亮的光会归入这一期公共笔记。`
                : CURRENT_TOPIC.hostNote
                  ? `— ${CURRENT_TOPIC.hostNote}`
                  : '— 今夜的极光时刻。点亮一束光，按一下「我也」，或只是坐进来听。'}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                marginTop: 4,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.28em',
                color: INK_MUTED,
                textTransform: 'uppercase',
              }}
            >
              <span>已经有 N° {rows.length} 束光在长夜里点亮</span>
              <a
                href="#hv-compose"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window === 'undefined') return;
                  const el = document.getElementById('hv-compose');
                  if (!el) return;
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  enqueueProductEvent('her_voice', 'her_voice_aurora_hour_cta_click', {
                    props: { topic_week: TOPIC_WEEK },
                  });
                }}
                style={{
                  color: ACCENT,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${ACCENT}`,
                  paddingBottom: 1,
                }}
              >
                → 也点一束
              </a>
            </div>
            {topicOverride?.code ? (
              <div
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  color: INK_MUTED,
                  textTransform: 'uppercase',
                }}
              >
                CREATOR TOPIC · {topicOverride.slug ?? 'untitled'} · {topicOverride.code}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', minWidth: 220 }}>
            <MiniStat label="本周收录" value={topicCount} />
            <MiniStat label="同意精选" value={consentCount} />
            <MiniStat label="共建总数" value={rows.length} />
          </div>
        </section>

        <PublicFunnelSection onAskClick={openAiQuestionComposer} />

        <section
          className="hv-entries"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 0,
            marginBottom: 36,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 0,
            background: PAPER_RAISED,
          }}
        >
          {(HERMOSA_WRITE_KINDS as readonly (typeof HERMOSA_WRITE_KINDS)[number][]).map((kind, index, arr) => {
            const active = writeKind === kind;
            const isLast = index === arr.length - 1;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => selectWriteKind(kind)}
                style={{
                  position: 'relative',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: '26px 24px 24px',
                  background: active ? PAPER : 'transparent',
                  border: 'none',
                  borderRight: isLast ? 'none' : `1px solid ${HAIRLINE}`,
                  borderTop: active ? `3px solid ${ACCENT}` : `3px solid transparent`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 156,
                  fontFamily: 'inherit',
                  color: 'inherit',
                  transition: 'background 180ms ease, border-color 180ms ease',
                }}
                aria-pressed={active}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 11,
                      letterSpacing: '0.32em',
                      color: active ? ACCENT : INK_MUTED,
                    }}
                  >
                    {roman(index + 1)} · {kind === 'voice' ? 'VOICE' : kind === 'book' ? 'BOOK' : 'AI'}
                  </span>
                  {active ? (
                    <span style={{ fontSize: 18, color: ACCENT, lineHeight: 1 }}>●</span>
                  ) : null}
                </div>
                <span
                  style={{
                    fontSize: 28,
                    lineHeight: 1.15,
                    fontStyle: 'italic',
                    color: INK,
                    fontWeight: 500,
                  }}
                >
                  {HERMOSA_KIND_LABELS[kind]}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: INK_MUTED,
                    fontStyle: 'normal',
                    fontFamily: '"Noto Serif SC", serif',
                  }}
                >
                  {HERMOSA_KIND_HINTS[kind]}
                </span>
              </button>
            );
          })}
        </section>

        <section id="hv-compose" className="hv-form" style={panelStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 22,
              paddingBottom: 14,
              borderBottom: `1px solid ${HAIRLINE}`,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                color: ACCENT,
              }}
            >
              § 写入共建 · COMPOSE
            </div>
            {writeSource.universe !== 'meta' ? (
              <div
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.28em',
                  color: INK_MUTED,
                  textTransform: 'uppercase',
                }}
              >
                FROM · {HERMOSA_UNIVERSE_LABELS[writeSource.universe]}
                {writeSource.slug ? ` / ${writeSource.slug}` : ''}
              </div>
            ) : null}
          </div>
          <ContributionFields
            kind={writeKind}
            writeText={writeText}
            setWriteText={setWriteText}
            writeTag={writeTag}
            setWriteTag={setWriteTag}
            bookTitle={bookTitle}
            setBookTitle={setBookTitle}
            bookAuthor={bookAuthor}
            setBookAuthor={setBookAuthor}
            bookQuote={bookQuote}
            setBookQuote={setBookQuote}
            bookNote={bookNote}
            setBookNote={setBookNote}
            aiQuestion={aiQuestion}
            setAiQuestion={setAiQuestion}
            aiContext={aiContext}
            setAiContext={setAiContext}
            aiTool={aiTool}
            setAiTool={setAiTool}
          />

          <div className="hv-form-actions" style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={writeSignature}
              onChange={(e) => setWriteSignature(e.target.value.slice(0, 24))}
              placeholder="可空 · 匿名昵称"
              maxLength={24}
              style={inputStyle}
            />
            <label
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontSize: 12,
                color: INK_MUTED,
                fontStyle: 'italic',
                cursor: 'pointer',
                fontFamily: '"Cormorant Garamond", serif',
              }}
            >
              <input
                type="checkbox"
                checked={consentToFeature}
                onChange={(e) => {
                  setConsentToFeature(e.target.checked);
                  enqueueProductEvent('her_voice', 'her_voice_consent_toggle', {
                    props: { kind: writeKind, value: e.target.checked },
                  });
                }}
                style={{ accentColor: ACCENT }}
              />
              同意进入精选、书单或壁纸素材池
            </label>
            <span style={{
              marginLeft: 'auto',
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.28em',
              color: INK_MUTED,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {charCount}/180
            </span>
            <button
              type="button"
              onClick={onWriteSubmit}
              disabled={!contribution || writeSubmitting}
              style={{
                padding: '14px 32px',
                minWidth: 160,
                borderRadius: 0,
                border: `1px solid ${contribution && !writeSubmitting ? INK : HAIRLINE}`,
                background: contribution && !writeSubmitting ? INK : 'transparent',
                color: contribution && !writeSubmitting ? PAPER : INK_MUTED,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.42em',
                fontWeight: 500,
                textTransform: 'uppercase',
                cursor: contribution && !writeSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 180ms ease',
              }}
            >
              {writeSubmitting ? '· SAVING ·' : '→ 写下来'}
            </button>
          </div>
          {writeError ? (
            <div style={{
              fontSize: 12,
              color: ACCENT,
              marginTop: 14,
              fontStyle: 'italic',
              fontFamily: '"Cormorant Garamond", serif',
            }}>— {writeError}</div>
          ) : null}
          {writeSuccess ? (
            <div
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 11,
                color: ACCENT,
                marginTop: 14,
                letterSpacing: '0.42em',
                textAlign: 'center',
              }}
            >
              ✓ 已收藏进 HER AURORA · 她的极光
            </div>
          ) : null}
        </section>

        <section className="hv-filter" style={filterPanelStyle}>
          <FilterRow label="类型">
            <Pill active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
              全部
            </Pill>
            {(HERMOSA_KINDS as readonly HermosaKind[]).map((k) => (
              <Pill key={k} active={kindFilter === k} onClick={() => setKindFilter(k)}>
                {HERMOSA_KIND_LABELS[k]} {kindCounts[k] ? kindCounts[k] : ''}
              </Pill>
            ))}
          </FilterRow>
          <FilterRow label="宇宙">
            <Pill active={universe === 'all'} onClick={() => setUniverse('all')}>
              全部
            </Pill>
            {(HERMOSA_UNIVERSES as readonly HermosaUniverse[]).map((u) => (
              <Pill key={u} active={universe === u} onClick={() => setUniverse(u)}>
                {HERMOSA_UNIVERSE_LABELS[u]}
              </Pill>
            ))}
          </FilterRow>
          <FilterRow label="标签">
            <Pill active={tag === 'all'} onClick={() => setTag('all')}>
              全部
            </Pill>
            {(HERMOSA_TAGS as readonly HermosaTag[]).map((t) => (
              <Pill key={t} active={tag === t} onClick={() => setTag(t)}>
                # {HERMOSA_TAG_LABELS[t]}
              </Pill>
            ))}
          </FilterRow>
        </section>

        {featured.length > 0 ? (
          <section style={{ marginBottom: 56 }}>
            <SectionHeading
              eyebrow="EDITOR'S CHOICE · 本周精选"
              title="她们的话，被反复回看"
              kicker={`${featured.length} 张精选 · 可下载为壁纸`}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 24,
                marginTop: 22,
              }}
            >
              {featured.map((m) => (
                <FeaturedCard key={m.id} m={m} echoed={echoed.has(m.id)} onEcho={onEcho} />
              ))}
            </div>
          </section>
        ) : null}

        <SectionHeading
          eyebrow="THE WALL · 全部回声"
          title="每一句都是一个女孩的笔记"
          kicker={`${rows.length} 条共建 · 用列与列之间的空气阅读`}
        />
        {loading && rows.length === 0 ? (
          <div style={{ textAlign: 'center', color: INK_MUTED, padding: 60, fontStyle: 'italic' }}>
            正在打开她们的笔记本…
          </div>
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ columnCount: 1, columnGap: 28, marginTop: 22 }} className="hermosa-wall">
            {rows.map((m, i) => (
              <WallCard key={m.id} m={m} index={i + 1} echoed={echoed.has(m.id)} onEcho={onEcho} />
            ))}
          </div>
        )}

        {/* Footer dateline */}
        <footer
          className="hv-footer"
          style={{
            marginTop: 80,
            paddingTop: 28,
            borderTop: `1px solid ${INK}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 14,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.32em',
            color: INK_MUTED,
          }}
        >
          <span>HER AURORA · MMXXVI</span>
          <span style={{ fontStyle: 'italic', fontFamily: 'inherit', letterSpacing: '0.18em', color: ACCENT }}>
            — 她说，未完待续
          </span>
          <span>HERMOSA · {issueNumber}</span>
        </footer>
      </div>

      <style jsx>{`
        @media (min-width: 720px) {
          :global(.hermosa-wall) { column-count: 2; }
        }
        @media (min-width: 1040px) {
          :global(.hermosa-wall) { column-count: 3; }
        }
        /* === Mobile-first overrides === */
        @media (max-width: 720px) {
          :global(.hv-shell) { padding-left: 18px !important; padding-right: 18px !important; }
          :global(.hv-topdate) { padding-left: 18px !important; padding-right: 18px !important; font-size: 9px !important; letter-spacing: 0.24em !important; }
          :global(.hv-topdate-r) { display: none; }
          :global(.hv-h1) { font-size: clamp(48px, 14vw, 88px) !important; letter-spacing: -0.03em !important; }
          :global(.hv-nav) { flex-direction: column; gap: 0; padding: 4px 0 !important; }
          :global(.hv-nav .hv-navsep) { display: none; }
          :global(.hv-nav a) { width: 100%; justify-content: flex-start !important; padding: 14px 4px !important; border-bottom: 1px solid rgba(26,21,48,0.08); font-size: 12px !important; letter-spacing: 0.28em !important; }
          :global(.hv-nav a:last-child) { border-bottom: none; }
          :global(.hv-topic) { grid-template-columns: 1fr !important; gap: 24px !important; padding: 26px 0 !important; margin-bottom: 36px !important; }
          :global(.hv-topic > div:first-child) { padding-left: 16px !important; }
          :global(.hv-public-funnel) { grid-template-columns: 1fr !important; gap: 26px !important; padding: 30px 0 34px !important; margin-bottom: 36px !important; }
          :global(.hv-public-funnel-price) { grid-template-columns: 1fr !important; gap: 12px !important; }
          :global(.hv-public-funnel-grid) { grid-template-columns: 1fr !important; border-left: none !important; }
          :global(.hv-public-funnel-grid article) { min-height: auto !important; border-right: none !important; padding: 20px 0 !important; background: transparent !important; }
          :global(.hv-entries) { grid-template-columns: 1fr !important; }
          :global(.hv-entries > button) { border-right: none !important; border-bottom: 1px solid rgba(26,21,48,0.14); min-height: 120px !important; padding: 22px 20px !important; }
          :global(.hv-entries > button:last-child) { border-bottom: none; }
          :global(.hv-entries > button > span:nth-child(2)) { font-size: 24px !important; }
          :global(.hv-footer) { flex-direction: column; align-items: flex-start !important; gap: 10px !important; font-size: 10px !important; letter-spacing: 0.24em !important; }
          :global(.hv-form) { padding: 22px 18px !important; }
          :global(.hv-form-actions) { flex-direction: column; align-items: stretch !important; }
          :global(.hv-form-actions button[type="button"]) { width: 100%; }
          :global(.hv-filter) { padding: 16px 0 !important; }
        }
      `}</style>
    </main>
  );
}

function PublicFunnelSection({ onAskClick }: { onAskClick: () => void }) {
  return (
    <section className="hv-public-funnel" style={publicFunnelStyle} aria-labelledby="hv-public-funnel-title">
      <div className="hv-public-funnel-copy" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.42em',
            color: ACCENT,
            textTransform: 'uppercase',
          }}
        >
          AURORA INTELLIGENCE · 公域可见的极光情报
        </div>
        <h2
          id="hv-public-funnel-title"
          style={{
            margin: 0,
            fontSize: 'clamp(32px, 5vw, 58px)',
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
            fontWeight: 500,
            color: INK,
          }}
        >
          现在加入，不只是进群，是进入一张正在更新的女性机会地图。
        </h2>
        <p
          style={{
            margin: 0,
            maxWidth: 620,
            fontSize: 17,
            lineHeight: 1.85,
            color: INK,
            opacity: 0.78,
            fontFamily: '"Noto Serif SC", serif',
          }}
        >
          AI 行业现在机会很多，噪声也很多。HER AURORA 会把“能落地的机会”和“需要避开的坑”放在同一张桌面上讨论：
          不夸大收益，不制造焦虑，先看结构，再判断要不要下场。
        </p>
        <div
          className="hv-public-funnel-price"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
            gap: 10,
            marginTop: 4,
          }}
        >
          {PUBLIC_FUNNEL_TIERS.map((tier) => (
            <div
              key={tier.label}
              style={{
                borderTop: `1px solid ${INK}`,
                borderBottom: `1px solid ${HAIRLINE}`,
                padding: '12px 0 14px',
              }}
            >
              <div
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 10,
                  letterSpacing: '0.28em',
                  color: INK_MUTED,
                  textTransform: 'uppercase',
                }}
              >
                {tier.label}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: ACCENT,
                  fontSize: 30,
                  lineHeight: 1,
                  fontStyle: 'italic',
                  fontWeight: 600,
                }}
              >
                {tier.price}
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.8,
            color: INK_MUTED,
            fontStyle: 'italic',
          }}
        >
          早期价格更像一张创始成员门票。外面一个 AI 项目课、陪跑群或资料包动辄数百到数千，
          在这里更重要的是先获得判断力，少为信息差和高价试错买单。
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <Link
            href={withBasePath('/contact/')}
            prefetch={false}
            onClick={() =>
              enqueueProductEvent('her_voice', 'her_voice_public_funnel_cta_click', {
                props: { topic_week: TOPIC_WEEK, target: 'contact_join_group' },
              })
            }
            style={primaryEditorialLinkStyle}
          >
            申请加入创始群
          </Link>
          <button type="button" onClick={onAskClick} style={secondaryEditorialButtonStyle}>
            先写下一个 AI / 副业问题
          </button>
        </div>
        <div
          style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.24em',
            color: INK_MUTED,
            textTransform: 'uppercase',
          }}
        >
          加微信请备注「极光」· 守光人会优先识别创始成员申请
        </div>
      </div>

      <div
        className="hv-public-funnel-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          borderTop: `1px solid ${INK}`,
          borderLeft: `1px solid ${HAIRLINE}`,
          alignSelf: 'stretch',
        }}
      >
        {PUBLIC_FUNNEL_RESOURCES.map((item) => (
          <article
            key={item.index}
            style={{
              minHeight: 184,
              padding: '22px 20px',
              borderRight: `1px solid ${HAIRLINE}`,
              borderBottom: `1px solid ${HAIRLINE}`,
              background: 'rgba(250, 247, 242, 0.54)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'baseline',
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  color: ACCENT,
                  fontSize: 31,
                  lineHeight: 1,
                  fontStyle: 'italic',
                }}
              >
                {item.index}
              </span>
              <span
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  fontSize: 9,
                  letterSpacing: '0.28em',
                  color: INK_MUTED,
                  textAlign: 'right',
                }}
              >
                {item.label}
              </span>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: 21,
                lineHeight: 1.28,
                color: INK,
                fontStyle: 'italic',
                fontWeight: 500,
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 13,
                lineHeight: 1.72,
                color: INK_MUTED,
                fontFamily: '"Noto Serif SC", serif',
              }}
            >
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function NavSep() {
  return (
    <span
      aria-hidden
      className="hv-navsep"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: INK_MUTED,
        opacity: 0.55,
        padding: '0 6px',
        fontSize: 10,
      }}
    >
      ·
    </span>
  );
}

function SectionHeading({ eyebrow, title, kicker }: { eyebrow: string; title: string; kicker?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
      <div
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.42em',
          color: ACCENT,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(26px, 3.6vw, 38px)',
            lineHeight: 1.18,
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
            fontWeight: 500,
            color: INK,
          }}
        >
          {title}
        </h2>
        {kicker ? (
          <span style={{ flex: 1, height: 1, background: HAIRLINE, alignSelf: 'center' }} />
        ) : null}
        {kicker ? (
          <span style={{ fontSize: 12, color: INK_MUTED, fontStyle: 'italic', letterSpacing: '0.04em' }}>{kicker}</span>
        ) : null}
      </div>
    </div>
  );
}

function ContributionFields(props: {
  kind: (typeof HERMOSA_WRITE_KINDS)[number];
  writeText: string;
  setWriteText: (value: string) => void;
  writeTag: HermosaTag | '';
  setWriteTag: (value: HermosaTag | '') => void;
  bookTitle: string;
  setBookTitle: (value: string) => void;
  bookAuthor: string;
  setBookAuthor: (value: string) => void;
  bookQuote: string;
  setBookQuote: (value: string) => void;
  bookNote: string;
  setBookNote: (value: string) => void;
  aiQuestion: string;
  setAiQuestion: (value: string) => void;
  aiContext: string;
  setAiContext: (value: string) => void;
  aiTool: string;
  setAiTool: (value: string) => void;
}) {
  if (props.kind === 'book') {
    return (
      <div style={fieldGridStyle}>
        <input
          value={props.bookTitle}
          onChange={(e) => props.setBookTitle(e.target.value.slice(0, 80))}
          placeholder="书名"
          style={inputStyle}
        />
        <input
          value={props.bookAuthor}
          onChange={(e) => props.setBookAuthor(e.target.value.slice(0, 60))}
          placeholder="作者，可空"
          style={inputStyle}
        />
        <textarea
          value={props.bookQuote}
          onChange={(e) => props.setBookQuote(e.target.value.slice(0, 180))}
          placeholder="一句打动你的原文或关键词，可空"
          rows={2}
          maxLength={180}
          style={textareaStyle}
        />
        <textarea
          value={props.bookNote}
          onChange={(e) => props.setBookNote(e.target.value.slice(0, 180))}
          placeholder="为什么推荐给更多女性？不超过 180 字"
          rows={3}
          maxLength={180}
          style={textareaStyle}
        />
      </div>
    );
  }

  if (props.kind === 'ai_question') {
    return (
      <div style={fieldGridStyle}>
        <textarea
          value={props.aiQuestion}
          onChange={(e) => props.setAiQuestion(e.target.value.slice(0, 180))}
          placeholder="你想用 AI 解决、学习、验证什么问题？不超过 180 字"
          rows={3}
          maxLength={180}
          style={textareaStyle}
        />
        <input
          value={props.aiContext}
          onChange={(e) => props.setAiContext(e.target.value.slice(0, 120))}
          placeholder="场景，可空：学习 / 工作 / 创作 / 情绪整理"
          style={inputStyle}
        />
        <input
          value={props.aiTool}
          onChange={(e) => props.setAiTool(e.target.value.slice(0, 40))}
          placeholder="正在用的工具，可空"
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <>
      <textarea
        value={props.writeText}
        onChange={(e) => props.setWriteText(e.target.value.slice(0, 200))}
        placeholder="一句话，不超过 180 字..."
        rows={3}
        maxLength={200}
        style={textareaStyle}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {(HERMOSA_TAGS as readonly HermosaTag[]).map((t) => {
          const active = props.writeTag === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => props.setWriteTag(active ? '' : t)}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                border: '1px solid ' + (active ? 'var(--color-rose)' : 'var(--color-border-subtle)'),
                background: active ? 'var(--color-rose)' : 'transparent',
                color: active ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
                fontSize: 12,
                letterSpacing: '0.18em',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              # {HERMOSA_TAG_LABELS[t]}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
      <span
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.42em',
          color: ACCENT,
          minWidth: 60,
          textTransform: 'uppercase',
        }}
      >
        / {label}
      </span>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 0',
        margin: '0 6px',
        borderRadius: 0,
        border: 'none',
        borderBottom: '1px solid ' + (active ? ACCENT : 'transparent'),
        background: 'transparent',
        color: active ? ACCENT : INK_MUTED,
        fontFamily: active ? 'inherit' : 'ui-monospace, "SF Mono", monospace',
        fontStyle: active ? 'italic' : 'normal',
        fontSize: active ? 14 : 11,
        letterSpacing: active ? '0.02em' : '0.32em',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        transition: 'all 180ms ease',
      }}
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      <div
        style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.32em',
          color: INK_MUTED,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          lineHeight: 1,
          color: ACCENT,
          fontStyle: 'italic',
          fontWeight: 500,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function NavLink({
  href,
  target,
  children,
}: {
  href: string;
  target: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={withBasePath(href)}
      onClick={() =>
        enqueueProductEvent('her_voice', 'her_voice_asset_click', {
          props: { target, topic_week: TOPIC_WEEK },
        })
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 14px',
        color: INK,
        textDecoration: 'none',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 11,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        transition: 'color 180ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = INK; }}
    >
      {children}
    </Link>
  );
}

function WallCard({
  m,
  index,
  echoed,
  onEcho,
}: {
  m: Message;
  index: number;
  echoed: boolean;
  onEcho: (id: string) => void;
}) {
  // Slight rotation/typography variance for editorial wall feel
  const variance = index % 5;
  const isPullQuote = variance === 1 || variance === 3;
  const accentInside = variance === 2;
  return (
    <article
      style={{
        breakInside: 'avoid',
        marginBottom: 32,
        padding: '0 0 26px',
        borderTop: `1px solid ${INK}`,
        borderBottom: variance === 4 ? `1px solid ${HAIRLINE}` : 'none',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 10,
        }}
      >
        <span
          style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            color: ACCENT,
          }}
        >
          N° {String(index).padStart(2, '0')} · {(HERMOSA_KIND_LABELS[m.kind] ?? m.kind).toUpperCase()}
        </span>
        {m.topic_week ? (
          <span
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: INK_MUTED,
            }}
          >
            {m.topic_week}
          </span>
        ) : null}
        <LifecycleBadge lifecycle={m.lifecycle} />
      </div>
      <div
        style={{
          fontSize: isPullQuote ? 24 : 17,
          lineHeight: isPullQuote ? 1.4 : 1.7,
          fontStyle: 'italic',
          fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
          color: accentInside ? ACCENT : INK,
          fontWeight: isPullQuote ? 500 : 400,
          letterSpacing: isPullQuote ? '-0.005em' : 0,
        }}
      >
        <span style={{ color: ACCENT, marginRight: 4, fontStyle: 'normal', fontFamily: '"Cormorant Garamond", serif' }}>“</span>
        {m.text}
        <span style={{ color: ACCENT, marginLeft: 2, fontStyle: 'normal', fontFamily: '"Cormorant Garamond", serif' }}>”</span>
      </div>
      <MetadataLine message={m} />
      {(m.tags ?? []).length > 0 || m.consent_to_feature ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(m.tags ?? []).slice(0, 2).map((t) => (
            <span
              key={t}
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.28em',
                color: INK_MUTED,
                textTransform: 'uppercase',
              }}
            >
              # {HERMOSA_TAG_LABELS[t as HermosaTag] ?? t}
            </span>
          ))}
          {m.consent_to_feature ? (
            <span
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.28em',
                color: ACCENT,
              }}
            >
              ★ 可精选
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: INK_MUTED,
          paddingTop: 6,
          borderTop: `1px dotted ${HAIRLINE}`,
        }}
      >
        <VoiceSigil
          hash={m.signature ? `sig:${m.signature}` : `id:${m.id}`}
          level={levelFromCount(m.echo_count)}
          size={28}
        />
        <span style={{ fontStyle: 'italic', fontFamily: '"Cormorant Garamond", serif' }}>
          — {m.attribution_mode === 'anonymous' ? 'Anonymous' : (m.signature || 'Anonymous')}
          {m.slug ? `, ${m.slug}` : ''}
        </span>
        <button
          type="button"
          onClick={() => onEcho(m.id)}
          disabled={echoed}
          style={{
            marginLeft: 'auto',
            padding: '2px 0 2px 14px',
            border: 'none',
            borderLeft: `1px solid ${HAIRLINE}`,
            background: 'transparent',
            color: echoed ? ACCENT : INK_MUTED,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            cursor: echoed ? 'default' : 'pointer',
          }}
        >
          {echoed ? '✓ ' : '+ '}共鸣 {m.echo_count}
        </button>
      </div>
      <EchoThread parentId={m.id} />
    </article>
  );
}

// HER AURORA · W3 · 5 态生命周期徽章（lit / caught / tended / inscribed / codex）
const LIFECYCLE_BADGES: Record<NonNullable<Message['lifecycle']>, { label: string; mark: string; ring: string; ink: string }> = {
  lit:       { label: 'LIT · 已点亮',       mark: '·',   ring: 'rgba(192, 122, 142, 0.32)', ink: '#C07A8E' },
  caught:    { label: 'CAUGHT · 被接住',    mark: '◜',   ring: 'rgba(125, 183, 176, 0.42)', ink: '#3F6A65' },
  tended:    { label: 'TENDED · 守光人在意', mark: '✶',   ring: 'rgba(92, 83, 102, 0.42)',   ink: '#5C5366' },
  inscribed: { label: 'INSCRIBED · 入信',   mark: '✦',   ring: 'rgba(201, 166, 118, 0.55)', ink: '#8C6A2C' },
  codex:     { label: 'CODEX · 入卷',       mark: 'Ⅻ',  ring: 'rgba(156, 124, 255, 0.55)', ink: '#5B3FB8' },
};

function LifecycleBadge({ lifecycle }: { lifecycle?: Message['lifecycle'] }) {
  const key: NonNullable<Message['lifecycle']> = lifecycle ?? 'lit';
  if (key === 'lit') return null; // 默认态不显示，避免噪声
  const cfg = LIFECYCLE_BADGES[key];
  return (
    <span
      title={cfg.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px',
        borderRadius: 999,
        border: `1px solid ${cfg.ring}`,
        background: 'transparent',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 9.5,
        letterSpacing: '0.28em',
        color: cfg.ink,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden style={{ fontSize: 11, letterSpacing: 0 }}>{cfg.mark}</span>
      <span>{cfg.label}</span>
    </span>
  );
}

function MetadataLine({ message }: { message: Message }) {
  const meta = message.metadata ?? {};
  let text: string | null = null;
  if (message.kind === 'book' && (meta.book_title || meta.book_author)) {
    text = [meta.book_title, meta.book_author].filter(Boolean).join(' / ');
  } else if (message.kind === 'ai_question' && (meta.ai_context || meta.ai_tool)) {
    text = [meta.ai_context, meta.ai_tool].filter(Boolean).join(' · ');
  }
  if (!text) return null;
  return <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{text}</div>;
}

function FeaturedCard({
  m,
  echoed,
  onEcho,
}: {
  m: Message;
  echoed: boolean;
  onEcho: (id: string) => void;
}) {
  const cardUrl = useMemo(() => {
    const params = new URLSearchParams({
      text: m.text,
      signature: m.signature ?? '',
      universe: m.universe,
      slug: m.slug ?? '',
      tag: (m.tags ?? [])[0] ?? '',
      style: 'editorial'
    });
    return getApiPath(`/api/hermosa/card?${params}`);
  }, [m]);
  return (
    <article
      style={{
        background: 'transparent',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ overflow: 'hidden', border: `1px solid ${HAIRLINE}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cardUrl} alt={m.text.slice(0, 30)} style={{ width: '100%', display: 'block', transition: 'transform 600ms ease' }} />
      </div>
      <div
        style={{
          padding: '14px 0 0',
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          borderTop: `1px solid ${HAIRLINE}`,
          marginTop: 14,
        }}
      >
        <span
          style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            color: ACCENT,
          }}
        >
          {(HERMOSA_KIND_LABELS[m.kind] ?? m.kind).toUpperCase()}
        </span>
        <LifecycleBadge lifecycle={m.lifecycle} />
        <span style={{ fontSize: 13, color: INK, fontStyle: 'italic', fontFamily: '"Cormorant Garamond", serif' }}>
          — {m.signature || 'Anonymous'}
        </span>
        <button
          type="button"
          onClick={() => onEcho(m.id)}
          disabled={echoed}
          style={{
            marginLeft: 'auto',
            padding: '4px 0 4px 14px',
            border: 'none',
            borderLeft: `1px solid ${HAIRLINE}`,
            background: 'transparent',
            color: echoed ? ACCENT : INK_MUTED,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            cursor: echoed ? 'default' : 'pointer',
          }}
        >
          {echoed ? '✓ ' : '+ '}共鸣 {m.echo_count}
        </button>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: 'var(--color-bg-elevated)',
        borderRadius: 16,
        border: '1px dashed var(--color-border-subtle)',
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>这里还很安静。</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        在上面写下第一条共建，或者{' '}
        <Link href={withBasePath('/')} style={{ color: 'var(--color-accent)' }}>
          做一个测试
        </Link>{' '}
        从结果页开始。
      </div>
      <Link
        href={withBasePath('/')}
        style={{
          display: 'inline-block',
          marginTop: 22,
          padding: '10px 22px',
          borderRadius: 999,
          background: 'var(--color-rose)',
          color: 'var(--color-bg-primary)',
          fontSize: 12,
          letterSpacing: '0.24em',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        去 WTFTI 首页
      </Link>
    </div>
  );
}

function roman(value: number): string {
  return ['I', 'II', 'III'][value - 1] ?? String(value);
}

function toRoman(num: number): string {
  const map: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = num; let out = '';
  for (const [v, s] of map) { while (n >= v) { out += s; n -= v; } }
  return out || 'I';
}

// Editorial design tokens (warm-editorial / magazine-poster vocabulary)
const PAPER = '#F5F0E8';
const PAPER_RAISED = '#FAF7F2';
const INK = '#1A1530';
const INK_MUTED = '#8A817A';
const ACCENT = '#C0512F'; // terracotta / rose-leaning warm
const HAIRLINE = 'rgba(26, 21, 48, 0.14)';

const topicBandStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
  gap: 36,
  alignItems: 'stretch',
  marginBottom: 56,
  padding: '36px 0',
  borderTop: `1px solid ${INK}`,
  borderBottom: `1px solid ${HAIRLINE}`,
  background: 'transparent',
};

const publicFunnelStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
  gap: 34,
  alignItems: 'start',
  marginBottom: 56,
  padding: '38px 0 44px',
  borderTop: `1px solid ${INK}`,
  borderBottom: `1px solid ${INK}`,
  background:
    'radial-gradient(circle at 12% 18%, rgba(192, 122, 142, 0.14), transparent 34%), radial-gradient(circle at 86% 8%, rgba(201, 166, 118, 0.16), transparent 32%)',
};

const panelStyle: CSSProperties = {
  marginBottom: 56,
  padding: '36px 32px',
  background: PAPER_RAISED,
  borderRadius: 0,
  border: 'none',
  borderTop: `1px solid ${INK}`,
  borderBottom: `1px solid ${INK}`,
};

const primaryEditorialLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 24px',
  borderRadius: 0,
  border: `1px solid ${INK}`,
  background: INK,
  color: PAPER,
  textDecoration: 'none',
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
};

const secondaryEditorialButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 22px',
  borderRadius: 0,
  border: `1px solid ${HAIRLINE}`,
  background: 'transparent',
  color: ACCENT,
  fontFamily: 'ui-monospace, "SF Mono", monospace',
  fontSize: 11,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const filterPanelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginBottom: 56,
  padding: '20px 0',
  borderTop: `1px solid ${HAIRLINE}`,
  borderBottom: `1px solid ${HAIRLINE}`,
  background: 'transparent',
};

const fieldGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
};

const inputStyle: CSSProperties = {
  flex: '1 1 180px',
  width: '100%',
  padding: '10px 0',
  borderRadius: 0,
  border: 'none',
  borderBottom: `1px solid ${HAIRLINE}`,
  background: 'transparent',
  color: INK,
  fontSize: 14,
  fontFamily: 'inherit',
  fontStyle: 'italic',
  outline: 'none',
  boxSizing: 'border-box',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  padding: '16px 0',
  borderRadius: 0,
  border: 'none',
  borderTop: `1px solid ${HAIRLINE}`,
  borderBottom: `1px solid ${HAIRLINE}`,
  background: 'transparent',
  color: INK,
  fontSize: 17,
  lineHeight: 1.75,
  fontFamily: 'var(--font-display, "Cormorant Garamond", "Noto Serif SC", serif)',
  fontStyle: 'italic',
  resize: 'vertical',
  minHeight: 110,
  outline: 'none',
  boxSizing: 'border-box',
};

// =============================================================
// W4 · E4.2 · 「我也」接龙（金箔细线）
// =============================================================

interface ThreadRow {
  id: string;
  parent_id: string;
  text: string;
  signature: string | null;
  sigil_hash: string;
  created_at: string;
}

function EchoThread({ parentId }: { parentId: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(getApiPath(`/api/hermosa/echo-thread?parent_id=${parentId}`), {
        cache: 'no-store',
      });
      const json = (await res.json()) as { ok?: boolean; rows?: ThreadRow[] };
      if (json.ok && json.rows) setRows(json.rows);
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, [parentId]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (!loaded) void load();
  }, [load, loaded]);

  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(getApiPath('/api/hermosa/echo-thread'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ parent_id: parentId, text }),
      });
      const json = (await res.json()) as { ok?: boolean; row?: ThreadRow; error?: string };
      if (json.ok && json.row) {
        setRows((prev) => [...prev, json.row!]);
        setDraft('');
        enqueueProductEvent('her_voice', 'salon_thread_reply', { props: { parent_id: parentId } });
      } else {
        setError(json.error === 'rate_limited' ? '同一条留言今天先听别人说一句' : '写入失败，待会再试');
      }
    } catch {
      setError('网络抖了一下');
    } finally {
      setSubmitting(false);
    }
  }, [draft, parentId, submitting]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        style={{
          marginTop: 8,
          padding: 0,
          border: 'none',
          background: 'transparent',
          color: ACCENT,
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: 10,
          letterSpacing: '0.32em',
          cursor: 'pointer',
        }}
      >
        + 我也 …
      </button>
    );
  }

  return (
    <div
      style={{
        marginTop: 12,
        paddingTop: 10,
        paddingLeft: 14,
        borderLeft: `1px solid ${ACCENT}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <VoiceSigil hash={`sig:${r.sigil_hash}`} level={0} size={20} />
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: INK,
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
            }}
          >
            {r.text}
            {r.signature ? (
              <span style={{ color: INK_MUTED, marginLeft: 6, fontStyle: 'normal', fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 10, letterSpacing: '0.18em' }}>
                — {r.signature}
              </span>
            ) : null}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 120))}
          placeholder="一句「我也」就够了 …"
          rows={2}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderBottom: `1px dotted ${HAIRLINE}`,
            background: 'transparent',
            color: INK,
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            resize: 'vertical',
            minHeight: 36,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={submitting || draft.trim().length === 0}
          style={{
            padding: '4px 10px',
            border: `1px solid ${ACCENT}`,
            background: 'transparent',
            color: ACCENT,
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            cursor: submitting || draft.trim().length === 0 ? 'default' : 'pointer',
            opacity: submitting || draft.trim().length === 0 ? 0.5 : 1,
          }}
        >
          {submitting ? '…' : '我也 →'}
        </button>
      </div>
      {error ? (
        <div style={{ fontSize: 11, color: '#b35a5a', fontFamily: 'ui-monospace, "SF Mono", monospace', letterSpacing: '0.18em' }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
