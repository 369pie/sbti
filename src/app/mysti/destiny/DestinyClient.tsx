'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { DestinyApiResponse, DestinyReport, DestinyDomainCard } from '@/lib/mysti/destiny/types';
import { saveDestinyEntry } from '@/lib/mysti/destiny/archive';

type FlowState = 'idle' | 'submitting' | 'completed' | 'failed';
type Gender = 'female' | 'male';
type FocusArea = 'career' | 'relationship' | 'wealth' | 'health' | 'general';

const FOCUS_OPTIONS: { value: FocusArea; label: string }[] = [
  { value: 'general', label: '总览' },
  { value: 'career', label: '事业' },
  { value: 'relationship', label: '感情' },
  { value: 'wealth', label: '财运' },
  { value: 'health', label: '健康' },
];

const SHICHEN_OPTIONS = [
  { value: '23:30', label: '子时 (23:00-01:00)' },
  { value: '01:30', label: '丑时 (01:00-03:00)' },
  { value: '03:30', label: '寅时 (03:00-05:00)' },
  { value: '05:30', label: '卯时 (05:00-07:00)' },
  { value: '07:30', label: '辰时 (07:00-09:00)' },
  { value: '09:30', label: '巳时 (09:00-11:00)' },
  { value: '11:30', label: '午时 (11:00-13:00)' },
  { value: '13:30', label: '未时 (13:00-15:00)' },
  { value: '15:30', label: '申时 (15:00-17:00)' },
  { value: '17:30', label: '酉时 (17:00-19:00)' },
  { value: '19:30', label: '戌时 (19:00-21:00)' },
  { value: '21:30', label: '亥时 (21:00-23:00)' },
];

export default function DestinyClient() {
  const [solarDate, setSolarDate] = useState('1995-05-15');
  const [birthTime, setBirthTime] = useState('09:30');
  const [birthplace, setBirthplace] = useState('北京');
  const [gender, setGender] = useState<Gender>('female');
  const [focus, setFocus] = useState<FocusArea[]>(['general']);
  const [knownEvent, setKnownEvent] = useState('');
  const [knownEventYear, setKnownEventYear] = useState<number | ''>('');

  const [state, setState] = useState<FlowState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DestinyReport | null>(null);
  const [isStub, setIsStub] = useState(false);

  function toggleFocus(value: FocusArea) {
    setFocus((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === 'submitting') return;
    setState('submitting');
    setError(null);
    setReport(null);

    try {
      const body: Record<string, unknown> = {
        solarDate,
        birthTime,
        birthplace: birthplace.trim(),
        gender,
        focus: focus.length > 0 ? focus : ['general'],
      };

      if (knownEvent.trim() && typeof knownEventYear === 'number') {
        body.knownEvents = [{ year: knownEventYear, event: knownEvent.trim() }];
      }

      const res = await fetch('/api/mysti/destiny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as DestinyApiResponse;

      if (!data.ok || !data.report) {
        setError(data.error || '生成失败，请稍后重试');
        setState('failed');
        return;
      }
      setReport(data.report);
      setIsStub(!!data.stub);
      setState('completed');

      // 归档至本地灵笺（MVP localStorage）
      try {
        saveDestinyEntry({
          inputSummary: {
            solarDate,
            birthTime,
            birthplace: birthplace.trim(),
            gender,
          },
          report: data.report,
        });
      } catch {
        /* swallow archive errors — UI 已完成，不阻塞 */
      }
    } catch {
      setError('网络异常，请稍后重试');
      setState('failed');
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 130% 60% at 50% 0%, #2d1e52 0%, #1a1530 45%, #0F0A22 100%)',
        color: '#F5F0E8',
        fontFamily: 'Cormorant Garamond, Noto Serif SC, serif',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 96px' }}>
        {/* ── Back ── */}
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/mysti/"
            style={{
              fontSize: 12,
              color: 'rgba(245,240,232,0.55)',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.06em',
            }}
          >
            ← 返回灵鉴
          </Link>
        </div>

        {/* ── Hero ── */}
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.42em',
              color: 'rgba(201,166,118,0.85)',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            灵鉴 · 命运缮写室 · 内测
          </p>
          <h1
            style={{
              margin: '0 0 14px',
              fontSize: 38,
              fontWeight: 500,
              letterSpacing: '0.04em',
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #F5F0E8 30%, #C9A676 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            命书馆
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(245,240,232,0.65)', lineHeight: 1.7 }}>
            徐乐吾 · 梁湘润 · 袁树珊 · 韦千里 — 四家方法投票<br />
            每条结论标注典籍出处 · 不蒙猜 · 不打诳语
          </p>
        </header>

        {/* ── Form ── */}
        {state !== 'completed' && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: 24,
              borderRadius: 16,
              border: '1px solid rgba(201,166,118,0.18)',
              background: 'rgba(245,240,232,0.04)',
              display: 'grid',
              gap: 18,
            }}
          >
            <Field label="阳历出生日期">
              <input
                type="date"
                required
                value={solarDate}
                onChange={(e) => setSolarDate(e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="时辰（按出生地真太阳时校正）">
              <select
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                style={inputStyle}
              >
                {SHICHEN_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} style={{ color: '#1a1530' }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="出生地（市级）">
              <input
                type="text"
                required
                placeholder="例如：北京 / 上海 / 深圳"
                value={birthplace}
                onChange={(e) => setBirthplace(e.target.value)}
                maxLength={40}
                style={inputStyle}
              />
            </Field>

            <Field label="性别">
              <div style={{ display: 'flex', gap: 12 }}>
                {(['female', 'male'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      ...pillStyle,
                      borderColor:
                        gender === g ? 'rgba(201,166,118,0.7)' : 'rgba(245,240,232,0.15)',
                      background:
                        gender === g ? 'rgba(201,166,118,0.18)' : 'transparent',
                      color: gender === g ? '#C9A676' : 'rgba(245,240,232,0.7)',
                    }}
                  >
                    {g === 'female' ? '女命' : '男命'}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="当前关注（可多选）">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOCUS_OPTIONS.map((opt) => {
                  const active = focus.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleFocus(opt.value)}
                      style={{
                        ...pillStyle,
                        padding: '6px 14px',
                        fontSize: 12,
                        borderColor: active ? 'rgba(201,166,118,0.7)' : 'rgba(245,240,232,0.15)',
                        background: active ? 'rgba(201,166,118,0.18)' : 'transparent',
                        color: active ? '#C9A676' : 'rgba(245,240,232,0.7)',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="（可选）一件已发生的关键事件 — 用于盲断验证">
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                <input
                  type="number"
                  placeholder="年份"
                  min={1900}
                  max={2099}
                  value={knownEventYear}
                  onChange={(e) =>
                    setKnownEventYear(e.target.value ? parseInt(e.target.value, 10) : '')
                  }
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="例如：跳槽 / 结婚 / 重大健康事件"
                  value={knownEvent}
                  onChange={(e) => setKnownEvent(e.target.value)}
                  maxLength={50}
                  style={inputStyle}
                />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(245,240,232,0.45)' }}>
                提供此项后，命书会先盲断该年走势，再与你的实际经历对照，建立信任度。
              </p>
            </Field>

            {error ? (
              <p
                role="alert"
                style={{
                  margin: 0,
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(192,122,142,0.12)',
                  color: '#E8A0BF',
                  fontSize: 13,
                }}
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={state === 'submitting'}
              style={{
                marginTop: 8,
                padding: '14px 24px',
                borderRadius: 999,
                border: 'none',
                background:
                  state === 'submitting'
                    ? 'rgba(201,166,118,0.4)'
                    : 'linear-gradient(135deg, #C9A676, #C07A8E)',
                color: '#1a1530',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.08em',
                cursor: state === 'submitting' ? 'wait' : 'pointer',
                boxShadow: '0 8px 28px rgba(201,166,118,0.25)',
              }}
            >
              {state === 'submitting' ? '正在缮写命书…' : '生成命书 · 内测免费'}
            </button>

            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: 'rgba(245,240,232,0.4)',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              内测期免费体验 · 正式版预计 ¥39 / 单次<br />
              娱乐参考 · 不构成医疗 / 法律 / 投资 / 重大决策建议
            </p>
          </form>
        )}

        {/* ── Result ── */}
        {state === 'completed' && report ? (
          <ReportView
            report={report}
            isStub={isStub}
            onRestart={() => {
              setReport(null);
              setState('idle');
            }}
          />
        ) : null}

        {/* ── Bottom strap ── */}
        {state !== 'completed' ? (
          <div
            style={{
              marginTop: 32,
              padding: 16,
              borderRadius: 12,
              border: '1px dashed rgba(245,240,232,0.12)',
              background: 'rgba(245,240,232,0.02)',
              fontSize: 12,
              color: 'rgba(245,240,232,0.55)',
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: '#C9A676', fontWeight: 600 }}>方法论</strong>
            <p style={{ margin: '8px 0 0' }}>
              · 四家方法（徐乐吾 / 梁湘润 / 袁树珊 / 韦千里）并行分析，结论标注共识比例（X/4）<br />
              · 每条结论标注典籍出处（《穷通宝鉴》/《滴天髓》/《子平真诠》/《命理探原》/《八字提要》）<br />
              · 不确定时明说「不确定」，禁止万能话术<br />
              · 真太阳时校正 + 半三合规则严格判定（巳丑 / 寅戌 / 卯未 不算半合）<br />
              · 先盲断后验证：你的过往事件用来检验盘面，而非反推
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          color: 'rgba(245,240,232,0.55)',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid rgba(245,240,232,0.15)',
  background: 'rgba(245,240,232,0.06)',
  color: '#F5F0E8',
  fontSize: 14,
  fontFamily: 'Noto Serif SC, serif',
  outline: 'none',
};

const pillStyle: React.CSSProperties = {
  padding: '8px 18px',
  borderRadius: 999,
  border: '1px solid rgba(245,240,232,0.15)',
  background: 'transparent',
  color: 'rgba(245,240,232,0.7)',
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

function ReportView({
  report,
  isStub,
  onRestart,
}: {
  report: DestinyReport;
  isStub: boolean;
  onRestart: () => void;
}) {
  return (
    <article style={{ display: 'grid', gap: 22 }}>
      <TrustNotice report={report} isStub={isStub} />

      <SectionCard title="命盘 · Chart" eyebrow="I">
        <KV k="四柱" v={report.chart.fourPillars} />
        <KV k="日主" v={report.chart.dayMaster} />
        <KV k="月令 / 强弱" v={report.chart.monthlyOrder} />
        <KV k="格局" v={report.chart.structure} />
        <KV k="调候用神" v={report.chart.regulator} />
        <KV k="真太阳时" v={report.chart.trueSolarTimeNote} />
      </SectionCard>

      <SectionCard title="盲断 · Blind Reading" eyebrow="II">
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.85, color: '#F5F0E8' }}>
          {report.blindReading.summary}
        </p>
        {report.blindReading.predictions.length > 0 ? (
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {report.blindReading.predictions.map((p, i) => (
              <div key={i} style={predictionRow}>
                <span style={ageBadge}>{p.ageRange}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{p.claim}</p>
                  <p style={sourceText}>
                    置信度 {p.confidence} · {p.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>

      {report.validation &&
      (report.validation.matchedEvents.length > 0 || report.validation.conflicts.length > 0) ? (
        <SectionCard title="验证 · Validation" eyebrow="III">
          {report.validation.matchedEvents.map((m, i) => (
            <div key={`m-${i}`} style={{ marginBottom: 8, fontSize: 13 }}>
              <strong style={{ color: '#C9A676' }}>✓ </strong>
              <em>{m.userEvent}</em> — {m.chartSupports}
            </div>
          ))}
          {report.validation.conflicts.map((c, i) => (
            <div key={`c-${i}`} style={{ marginBottom: 8, fontSize: 13, color: '#E8A0BF' }}>
              <strong>✗ </strong>
              <em>{c.userEvent}</em> — {c.issue}
            </div>
          ))}
          <p style={{ ...sourceText, marginTop: 8 }}>
            综合可信度评分：{report.validation.confidenceScore} / 10
          </p>
        </SectionCard>
      ) : null}

      <SectionCard title="当下解读 · Current" eyebrow="IV">
        <DomainCardRow label="事业" card={report.currentReading.career} />
        <DomainCardRow label="财运" card={report.currentReading.wealth} />
        <DomainCardRow label="感情" card={report.currentReading.relationship} />
        <DomainCardRow label="健康" card={report.currentReading.health} />
      </SectionCard>

      <SectionCard title="未来流年 · Future Flow" eyebrow="V">
        <KV k="当前大运" v={report.futureFlow.currentLuckCycle} />
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          {report.futureFlow.keyYears.map((y, i) => (
            <div key={i} style={predictionRow}>
              <span
                style={{
                  ...ageBadge,
                  background:
                    y.rating === '高危'
                      ? 'rgba(192,122,142,0.18)'
                      : y.rating === '利好'
                      ? 'rgba(201,166,118,0.2)'
                      : 'rgba(245,240,232,0.08)',
                  color:
                    y.rating === '高危'
                      ? '#E8A0BF'
                      : y.rating === '利好'
                      ? '#C9A676'
                      : 'rgba(245,240,232,0.75)',
                }}
              >
                {y.year} · {y.rating}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{y.reason}</p>
                <p style={sourceText}>{y.source}</p>
              </div>
            </div>
          ))}
        </div>
        {report.futureFlow.monthlyHighRisk && report.futureFlow.monthlyHighRisk.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <p style={{ ...sourceText, marginBottom: 6 }}>流月高风险窗口</p>
            {report.futureFlow.monthlyHighRisk.map((m, i) => (
              <div key={i} style={{ fontSize: 13, marginBottom: 6, color: 'rgba(245,240,232,0.85)' }}>
                · {m.yearMonth}：{m.warning} <span style={sourceText}>{m.source}</span>
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>

      {report.uncertainties.length > 0 ? (
        <SectionCard title="不确定性 · Uncertainties" eyebrow="VI" muted>
          {report.uncertainties.map((u, i) => (
            <p key={i} style={{ margin: '6px 0', fontSize: 13, color: 'rgba(245,240,232,0.7)', lineHeight: 1.7 }}>
              · {u}
            </p>
          ))}
        </SectionCard>
      ) : null}

      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: 'rgba(245,240,232,0.4)',
          textAlign: 'center',
          lineHeight: 1.7,
        }}
      >
        {report.disclaimer}
      </p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onRestart}
          style={{
            ...pillStyle,
            padding: '10px 24px',
            color: '#C9A676',
            borderColor: 'rgba(201,166,118,0.5)',
          }}
        >
          重新缮写
        </button>
        <Link
          href="/lingjian/"
          style={{
            ...pillStyle,
            padding: '10px 24px',
            color: 'rgba(245,240,232,0.85)',
            borderColor: 'rgba(245,240,232,0.2)',
            textDecoration: 'none',
          }}
        >
          归档至灵笺 →
        </Link>
      </div>
    </article>
  );
}

function TrustNotice({ report, isStub }: { report: DestinyReport; isStub: boolean }) {
  const evidenceMode = report.meta?.evidenceMode ?? (isStub ? 'stub' : 'model_cited');
  const isDemo = isStub || evidenceMode === 'stub';

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        background: isDemo ? 'rgba(192,122,142,0.1)' : 'rgba(201,166,118,0.1)',
        border: isDemo ? '1px solid rgba(192,122,142,0.25)' : '1px solid rgba(201,166,118,0.25)',
        fontSize: 12,
        color: isDemo ? '#E8A0BF' : 'rgba(245,240,232,0.78)',
        lineHeight: 1.7,
      }}
    >
      <strong style={{ color: isDemo ? '#E8A0BF' : '#C9A676', fontWeight: 600 }}>
        {isDemo ? '演示命书' : 'AI 初稿'}
      </strong>
      {' · '}
      {isDemo
        ? '当前结果来自演示数据或安全回退，不作为真实命书归因。'
        : '当前出处为模型声明版本，尚未接入典籍原文 RAG 与顾问复核。'}
      <br />
      <span style={{ color: 'rgba(245,240,232,0.45)' }}>
        {report.meta?.promptVersion ?? 'unknown-prompt'} · {formatMetaTime(report.meta?.generatedAt)}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
  muted,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      style={{
        padding: 20,
        borderRadius: 14,
        border: muted
          ? '1px dashed rgba(245,240,232,0.12)'
          : '1px solid rgba(201,166,118,0.18)',
        background: muted ? 'rgba(245,240,232,0.02)' : 'rgba(245,240,232,0.04)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid rgba(201,166,118,0.4)',
            color: '#C9A676',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          {eyebrow}
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: '#F5F0E8',
          }}
        >
          {title}
        </h2>
      </header>
      <div>{children}</div>
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '92px 1fr',
        gap: 12,
        padding: '6px 0',
        borderBottom: '1px solid rgba(245,240,232,0.06)',
        fontSize: 14,
      }}
    >
      <span style={{ color: 'rgba(245,240,232,0.5)', fontSize: 12 }}>{k}</span>
      <span style={{ color: '#F5F0E8', lineHeight: 1.65 }}>{v}</span>
    </div>
  );
}

function DomainCardRow({ label, card }: { label: string; card: DestinyDomainCard }) {
  const [a] = (card.votes || '0/4').split('/').map((n) => parseInt(n, 10));
  const consensusColor = a >= 3 ? '#C9A676' : a >= 2 ? 'rgba(245,240,232,0.7)' : '#E8A0BF';
  return (
    <div
      style={{
        padding: '12px 0',
        borderBottom: '1px solid rgba(245,240,232,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <strong style={{ fontSize: 13, color: '#C9A676', minWidth: 36 }}>{label}</strong>
        <span
          style={{
            fontSize: 11,
            padding: '2px 10px',
            borderRadius: 999,
            background: 'rgba(245,240,232,0.06)',
            color: consensusColor,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {card.votes} 共识
        </span>
        {card.voters && card.voters.length > 0 ? (
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)' }}>
            {card.voters.join(' · ')}
          </span>
        ) : null}
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#F5F0E8' }}>{card.claim}</p>
      {card.minority ? (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 12,
            color: 'rgba(232,160,191,0.85)',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          少数派 · {card.minority}
        </p>
      ) : null}
      <p style={sourceText}>{card.source}</p>
    </div>
  );
}

const predictionRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '8px 0',
};

const ageBadge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 999,
  background: 'rgba(201,166,118,0.15)',
  color: '#C9A676',
  fontSize: 11,
  fontWeight: 600,
  fontFamily: 'Inter, sans-serif',
  whiteSpace: 'nowrap',
  minWidth: 0,
};

const sourceText: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 11,
  color: 'rgba(245,240,232,0.4)',
  fontStyle: 'italic',
  lineHeight: 1.5,
};

function formatMetaTime(value: number | undefined): string {
  if (!value) return '未记录生成时间';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未记录生成时间';
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
