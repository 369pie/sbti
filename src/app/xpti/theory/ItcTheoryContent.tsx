'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { basePath } from '@/lib/site';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { ITC_AXES } from '@/lib/xpti/itc';
import { XPTI_DIMENSIONS } from '@/lib/xpti/dimensions';
import { XPTI_PERSONALITY_TYPES, getXptiTensionSignature } from '@/lib/xpti/personalities';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';

const PALETTE = {
  paper: '#F5F0E8',
  paperDeep: '#EFE6D6',
  ink: '#1F1A16',
  inkMute: '#5B524B',
  rule: '#D6CDBE',
  rose: '#A85A6E',
  wine: '#6A2A3E',
  gold: '#C9A676',
};

export function ItcTheoryContent() {
  // theory_view funnel event — fires once on mount.
  useEffect(() => {
    trackFunnelEvent('theory_view', { module: 'xpti', source: 'itc-page' });
  }, []);

  return (
    <main style={{ background: PALETTE.paper, color: PALETTE.ink, minHeight: '100vh' }}>
      {/* ── Eyebrow / hero ─────────────────────────────────────── */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '88px 24px 32px' }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.42em',
            color: PALETTE.rose,
            textTransform: 'uppercase',
          }}
        >
          XPTI · Methodology · v3.0
        </div>
        <h1
          style={{
            fontFamily: display,
            fontWeight: 500,
            fontSize: 'clamp(40px, 6vw, 68px)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            margin: '18px 0 14px',
          }}
        >
          亲密张力坐标系
          <span style={{ display: 'block', fontStyle: 'italic', color: PALETTE.wine, fontSize: '0.62em', marginTop: 8 }}>
            Intimacy Tension Coordinates · ITC
          </span>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.85, color: PALETTE.inkMute, maxWidth: 640 }}>
          ITC 是 XPTI 提出的原创亲密关系框架。它不再把每个人看作一组离散的「人格标签」，
          而是把亲密互动里持续发生的拉扯描述为三条彼此独立、可测量、可对照的张力轴：
        </p>
        <ul style={{ marginTop: 18, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
          {ITC_AXES.map((a) => (
            <li
              key={a.id}
              style={{
                paddingLeft: 18,
                borderLeft: `2px solid ${a.color}`,
                fontFamily: mono,
                fontSize: 13,
                letterSpacing: '0.18em',
                color: PALETTE.ink,
              }}
            >
              {a.english} · <span style={{ color: PALETTE.inkMute, letterSpacing: 0, fontFamily: display, fontSize: 16, fontStyle: 'italic' }}>{a.zh}</span>
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: 36,
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            color: PALETTE.inkMute,
            textTransform: 'uppercase',
          }}
        >
          <Link
            href={`${basePath}/xpti/`}
            style={{
              padding: '12px 22px',
              border: `1px solid ${PALETTE.wine}`,
              color: PALETTE.wine,
              borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            ← 回到 XPTI 测试
          </Link>
          <a
            href={`${basePath}/xpti/test/`}
            style={{
              padding: '12px 22px',
              background: PALETTE.wine,
              color: PALETTE.paper,
              borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            开始测自己的张力 →
          </a>
        </div>
      </section>

      {/* ── 0. Why ITC ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <SectionHeader number="0" eyebrow="Premise" title="为什么需要这套坐标系" />
        <p style={pStyle}>
          市面上的亲密关系测试有两种典型形态：一种是把人贴成 1 个标签（如 MBTI 衍生的恋爱型），
          另一种是把人拆成一长串维度（雷达图越多越显得专业）。两种都没真正解决一个问题——
          <strong style={{ color: PALETTE.ink }}>当一段关系出问题时，这些标签和维度没有告诉你「该谈什么」。</strong>
        </p>
        <p style={pStyle}>
          ITC 的设计目标是让每一段关系都能拥有 3 个**可被对照的坐标**：
          这 3 个坐标既精炼到可以聊（不像 9 维让人疲惫），
          又足够保留差异（不像 1 个标签让人把自己塞进去）。
          <em style={{ color: PALETTE.wine }}>它是一台仪表，不是一面镜子。</em>
        </p>
      </section>

      <Divider />

      {/* ── 1. 三条张力 ────────────────────────────────────────── */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px' }}>
        <SectionHeader number="I" eyebrow="The Three Tensions" title="三条上层张力轴" />

        {ITC_AXES.map((a) => (
          <article
            key={a.id}
            style={{
              marginTop: 36,
              padding: '32px 28px',
              background: '#FFFDF9',
              border: `1px solid ${PALETTE.rule}`,
              borderRadius: 8,
            }}
          >
            <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: a.color,
                }}
              />
              <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.32em', color: a.color, textTransform: 'uppercase' }}>
                {a.english}
              </span>
            </header>
            <h3 style={{ fontFamily: display, fontWeight: 500, fontSize: 30, margin: '8px 0 4px', fontStyle: 'italic' }}>
              {a.zh}
            </h3>
            <p style={{ ...pStyle, fontSize: 15, marginTop: 14 }}>{a.description}</p>

            <div
              style={{
                marginTop: 20,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              <PoleCard color={a.color} variant="low" en={a.poleLow.en} zh={a.poleLow.zh} oneLine={a.poleLow.oneLine} />
              <PoleCard color={a.color} variant="high" en={a.poleHigh.en} zh={a.poleHigh.zh} oneLine={a.poleHigh.oneLine} />
            </div>

            <details style={{ marginTop: 22 }}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontFamily: mono,
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: PALETTE.inkMute,
                }}
              >
                贡献的子维度（来自 9 维）
              </summary>
              <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 13, color: PALETTE.inkMute, lineHeight: 1.8 }}>
                {a.contributors.map((c) => {
                  const dim = XPTI_DIMENSIONS.find((d) => d.id === c.dimensionId);
                  return (
                    <li key={c.dimensionId}>
                      <code style={{ fontFamily: mono, color: a.color }}>{c.dimensionId}</code>{' '}
                      {dim?.name} · 权重 {Math.round(c.weight * 100)}%
                      {c.reversed ? '（反向计入）' : ''}
                    </li>
                  );
                })}
              </ul>
            </details>
          </article>
        ))}
      </section>

      <Divider />

      {/* ── 2. 12 原型张力签名 ───────────────────────────────── */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px' }}>
        <SectionHeader number="II" eyebrow="Archetype Signatures" title="12 原型在三条张力上的签名" />
        <p style={pStyle}>
          XPTI 的 12 种关系原型不是凭空命名的，而是由它们在三条张力上的位置共同定义。
          每个原型都有一条「张力签名」——读完它你就知道这个原型「站在哪里」。
        </p>

        <table
          style={{
            marginTop: 28,
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              {['№', '原型', 'CONTROL', 'DISTANCE', 'NOVELTY'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '10px 8px',
                    borderBottom: `1px solid ${PALETTE.rule}`,
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: '0.32em',
                    color: PALETTE.inkMute,
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {XPTI_PERSONALITY_TYPES.map((p) => {
              const sig = getXptiTensionSignature(p);
              return (
                <tr key={p.slug} style={{ borderBottom: `1px solid ${PALETTE.rule}` }}>
                  <td style={tdNum}>{p.number}</td>
                  <td style={{ ...td, fontFamily: display, fontSize: 17, fontStyle: 'italic' }}>
                    <Link
                      href={`${basePath}/xpti/result/${p.slug}/`}
                      style={{ color: p.color, textDecoration: 'none', borderBottom: `1px dashed ${p.color}66` }}
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td style={{ ...td }}>{tierBadge(sig.control, ITC_AXES[0].color)}</td>
                  <td style={{ ...td }}>{tierBadge(sig.distance, ITC_AXES[1].color)}</td>
                  <td style={{ ...td }}>{tierBadge(sig.novelty, ITC_AXES[2].color)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <Divider />

      {/* ── 3. 6 类张力配对 ─────────────────────────────────── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <SectionHeader number="III" eyebrow="Pairing Models" title="6 类亲密张力配对" />
        <p style={pStyle}>
          两个人的张力签名两两组合，可以聚成 6 类典型亲密结构。
          配对模型的目的不是判断「合不合适」，而是回答另一个问题：
          <strong style={{ color: PALETTE.ink }}>「你们这种关系，最常发生的甜，最常发生的痛，分别是什么？」</strong>
        </p>

        <ul style={{ display: 'grid', gap: 14, listStyle: 'none', padding: 0, marginTop: 28 }}>
          {[
            { id: 'mirror',  zh: '镜像同温', en: 'Mirror Pair',  oneLine: '三条张力几乎一致——默契高，盲点同步。' },
            { id: 'magnet',  zh: '磁极相吸', en: 'Magnet Pair',  oneLine: '一掌舵一交付，一保留一沉浸。最稳定的互补。' },
            { id: 'tide',    zh: '潮汐共振', en: 'Tide Pair',    oneLine: '决策同向，但距离/新鲜在拉扯。' },
            { id: 'fugue',   zh: '赋格对话', en: 'Fugue Pair',   oneLine: '两轴对冲一轴对齐——轮流让位的复调关系。' },
            { id: 'orbit',   zh: '轨道共绕', en: 'Orbit Pair',   oneLine: '一方中性、一方信号强烈——绕着对方的张力转。' },
            { id: 'spark',   zh: '短路火花', en: 'Spark Pair',   oneLine: '三轴全对冲——剧烈、上瘾、需要外部锚才能长走。' },
          ].map((m) => (
            <li
              key={m.id}
              style={{
                padding: '20px 22px',
                background: '#FFFDF9',
                border: `1px solid ${PALETTE.rule}`,
                borderRadius: 6,
              }}
            >
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.gold, textTransform: 'uppercase' }}>
                {m.en}
              </div>
              <h4 style={{ fontFamily: display, fontStyle: 'italic', fontWeight: 500, fontSize: 22, margin: '6px 0 8px' }}>{m.zh}</h4>
              <p style={{ margin: 0, fontSize: 14, color: PALETTE.inkMute, lineHeight: 1.7 }}>{m.oneLine}</p>
            </li>
          ))}
        </ul>

        <p style={{ ...pStyle, marginTop: 26 }}>
          想看自己和某人是哪一类配对？完成 XPTI 测试后可以解锁
          <Link href={`${basePath}/xpti/`} style={{ color: PALETTE.wine, textDecoration: 'underline' }}>「关系合并报告」</Link>。
        </p>
      </section>

      <Divider />

      {/* ── 4. 引用规范 ───────────────────────────────────────── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>
        <SectionHeader number="IV" eyebrow="Citation" title="引用本框架" />
        <p style={pStyle}>
          媒体、播客、心理学博主、咨询师在引用 ITC 框架时，请遵循以下基础规范：
        </p>
        <pre
          style={{
            marginTop: 18,
            padding: 20,
            background: PALETTE.paperDeep,
            border: `1px dashed ${PALETTE.rule}`,
            borderRadius: 6,
            fontFamily: mono,
            fontSize: 12,
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
            color: PALETTE.ink,
          }}
        >
{`Intimacy Tension Coordinates (ITC), v1.0.
WTFTI · XPTI Lab, 2026.
https://wtfti.com/xpti/theory/`}
        </pre>
        <p style={{ ...pStyle, marginTop: 22, fontSize: 13 }}>
          <strong style={{ color: PALETTE.ink }}>方法学边界：</strong>
          ITC 基于自我报告问卷设计，所有张力分数均为偏好维度，不构成临床诊断或人格障碍判断。
          严肃心理评估请咨询持证心理咨询师。
        </p>
        <p style={{ ...pStyle, marginTop: 14, fontSize: 13 }}>
          <a
            href="/xpti/whitepaper/"
            style={{
              color: PALETTE.wine,
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            ↓ 下载完整白皮书 (打印 / 另存为 PDF)
          </a>
        </p>
      </section>
    </main>
  );
}

const pStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.85,
  color: PALETTE.inkMute,
  margin: '14px 0',
};

const td: React.CSSProperties = {
  padding: '14px 8px',
  verticalAlign: 'middle',
};
const tdNum: React.CSSProperties = {
  ...td,
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: '0.18em',
  color: PALETTE.inkMute,
  width: 60,
};

function SectionHeader({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return (
    <header style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.4em', color: PALETTE.gold, textTransform: 'uppercase' }}>
        № {number} · {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: display,
          fontWeight: 500,
          fontSize: 'clamp(28px, 4vw, 40px)',
          margin: '8px 0 0',
          letterSpacing: '-0.01em',
          fontStyle: 'italic',
        }}
      >
        {title}
      </h2>
    </header>
  );
}

function PoleCard({
  color,
  variant,
  en,
  zh,
  oneLine,
}: {
  color: string;
  variant: 'low' | 'high';
  en: string;
  zh: string;
  oneLine: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 6,
        background: `${color}10`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color, textTransform: 'uppercase' }}>
        {variant === 'low' ? '–' : '+'} {en}
      </div>
      <div style={{ fontFamily: display, fontStyle: 'italic', fontSize: 18, margin: '4px 0' }}>{zh}</div>
      <div style={{ fontSize: 13, color: PALETTE.inkMute, lineHeight: 1.7 }}>{oneLine}</div>
    </div>
  );
}

function tierBadge(tier: string, color: string) {
  const isNeutral = tier === 'NEUTRAL';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontFamily: mono,
        fontSize: 10,
        letterSpacing: '0.2em',
        color: isNeutral ? PALETTE.inkMute : color,
        background: isNeutral ? PALETTE.paperDeep : `${color}14`,
        border: `1px solid ${isNeutral ? PALETTE.rule : `${color}66`}`,
      }}
    >
      {tier}
    </span>
  );
}

function Divider() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>
      <hr
        style={{
          border: 0,
          borderTop: `1px solid ${PALETTE.rule}`,
          margin: '8px 0',
        }}
      />
    </div>
  );
}
