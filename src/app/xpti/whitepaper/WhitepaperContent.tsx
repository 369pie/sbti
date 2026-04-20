'use client';

import { useEffect } from 'react';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import { ITC_AXES } from '@/lib/xpti/itc';
import { ITC_PAIRINGS_CATALOG } from '@/lib/xpti/itc-pairing';
import { XPTI_PERSONALITY_TYPES, getXptiTensionSignature } from '@/lib/xpti/personalities';

const display = '"Cormorant Garamond", "Noto Serif SC", serif';
const mono = '"SF Mono", ui-monospace, "Menlo", monospace';
const PALETTE = {
  paper: '#FFFDF9',
  paperDeep: '#F5F0E8',
  ink: '#1F1A16',
  inkMute: '#5B524B',
  rule: '#D6CDBE',
  rose: '#A85A6E',
  wine: '#6A2A3E',
  gold: '#C9A676',
};

/**
 * Whitepaper · 打印友好版
 *
 * 这一页设计为白底、黑字、A4 友好。用户可以：
 * - 直接阅读
 * - 在浏览器里 ⌘+P / Ctrl+P，「另存为 PDF」即得到引用版 PDF
 *
 * 我们不再单独维护一份 PDF 二进制，源真理是这一页 + itc-theory.md。
 */
export function WhitepaperContent() {
  useEffect(() => {
    trackFunnelEvent('theory_view', { module: 'xpti', source: 'whitepaper' });
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <main
      style={{
        background: PALETTE.paper,
        color: PALETTE.ink,
        minHeight: '100vh',
        padding: '0 0 96px',
        fontFamily: '"Noto Serif SC", "Source Han Serif", serif',
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { size: A4; margin: 18mm 16mm; }
          body { background: #fff !important; }
          h1, h2, h3 { page-break-after: avoid; }
          table { page-break-inside: avoid; }
        }
      `}</style>

      {/* Print bar */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          background: PALETTE.paperDeep,
          borderBottom: `1px solid ${PALETTE.rule}`,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          zIndex: 50,
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.32em', color: PALETTE.wine, textTransform: 'uppercase' }}>
          ITC v1.0 · Whitepaper · Print-Ready
        </div>
        <button
          onClick={handlePrint}
          style={{
            padding: '8px 18px',
            background: PALETTE.wine,
            color: PALETTE.paper,
            border: 'none',
            borderRadius: 999,
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          打印 / 另存为 PDF
        </button>
      </div>

      <article style={{ maxWidth: 720, margin: '48px auto 0', padding: '0 24px' }}>
        {/* Title block */}
        <header style={{ textAlign: 'center', borderBottom: `1px solid ${PALETTE.rule}`, paddingBottom: 32, marginBottom: 32 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.42em', color: PALETTE.rose, textTransform: 'uppercase' }}>
            WTFTI · XPTI Methodology Note
          </div>
          <h1
            style={{
              fontFamily: display,
              fontSize: 'clamp(34px, 5vw, 52px)',
              lineHeight: 1.12,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              margin: '14px 0 4px',
            }}
          >
            亲密张力坐标系
            <span style={{ display: 'block', fontStyle: 'italic', color: PALETTE.wine, fontSize: '0.55em', marginTop: 6 }}>
              Intimacy Tension Coordinates · v1.0
            </span>
          </h1>
          <p style={{ fontSize: 14, color: PALETTE.inkMute, lineHeight: 1.7, marginTop: 18 }}>
            一份把 9 维亲密偏好问卷重新结构化为 3 条上层张力轴的方法学说明。
            <br />
            包含 12 原型的张力签名、6 类配对模型、与引用规范。
          </p>
          <p style={{ fontFamily: mono, fontSize: 11, color: PALETTE.inkMute, marginTop: 16, letterSpacing: '0.18em' }}>
            Last revised · 2026-04-20
          </p>
        </header>

        {/* §1 Why */}
        <section style={{ marginTop: 36 }}>
          <SectionTitle eyebrow="§1" title="为什么需要 ITC" />
          <p style={pStyle}>
            XPTI 的 9 维问卷可以告诉一个人「你在 D1 主导欲上是 2.6 / 3」，
            但很难告诉两个人「<em>我们</em>是哪种配对」。
          </p>
          <p style={pStyle}>
            ITC v1.0 引入 3 条**上层张力轴** ——
            <strong> 控制–臣服 (CONTROL)</strong>、<strong>距离–沉浸 (DISTANCE)</strong>、<strong>重复–新鲜 (NOVELTY)</strong> ——
            把扁平的 9 维聚合成可以被命名、被对话、被引用的结构。
          </p>
        </section>

        {/* §2 Axes */}
        <section style={{ marginTop: 36 }}>
          <SectionTitle eyebrow="§2" title="三条张力轴定义" />
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>轴 ID</th>
                <th style={thStyle}>中文</th>
                <th style={thStyle}>英文</th>
                <th style={thStyle}>主要 9 维输入</th>
              </tr>
            </thead>
            <tbody>
              {ITC_AXES.map((axis) => (
                <tr key={axis.id}>
                  <td style={tdStyle}>
                    <code style={{ fontFamily: mono, fontSize: 11, color: axis.color }}>{axis.id}</code>
                  </td>
                  <td style={tdStyle}>{axis.zh}</td>
                  <td style={{ ...tdStyle, fontFamily: mono, fontSize: 11, letterSpacing: '0.18em' }}>{axis.english}</td>
                  <td style={{ ...tdStyle, fontSize: 12, color: PALETTE.inkMute }}>
                    {axis.contributors
                      .map((c) => `${c.dimensionId}(${c.reversed ? '-' : '+'}${c.weight.toFixed(2)})`)
                      .join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...pStyle, fontSize: 13, color: PALETTE.inkMute }}>
            阈值：有符号张力强度 ≥ +0.25 落在高位极，≤ −0.25 落在低位极，否则记为 NEUTRAL。
          </p>
        </section>

        {/* §3 12 archetypes signature table */}
        <section style={{ marginTop: 36 }}>
          <SectionTitle eyebrow="§3" title="12 原型 · 张力签名速查" />
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>原型名</th>
                <th style={thStyle}>CONTROL</th>
                <th style={thStyle}>DISTANCE</th>
                <th style={thStyle}>NOVELTY</th>
              </tr>
            </thead>
            <tbody>
              {XPTI_PERSONALITY_TYPES.map((p) => {
                const sig = getXptiTensionSignature(p);
                return (
                  <tr key={p.slug}>
                    <td style={{ ...tdStyle, fontFamily: mono, fontSize: 11 }}>{p.slug}</td>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={{ ...tdStyle, fontFamily: mono, fontSize: 11 }}>{sig.control}</td>
                    <td style={{ ...tdStyle, fontFamily: mono, fontSize: 11 }}>{sig.distance}</td>
                    <td style={{ ...tdStyle, fontFamily: mono, fontSize: 11 }}>{sig.novelty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* §4 6 pairing models */}
        <section style={{ marginTop: 36 }}>
          <SectionTitle eyebrow="§4" title="6 类张力配对模型" />
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            {ITC_PAIRINGS_CATALOG.map((pair) => (
              <div
                key={pair.id}
                style={{ borderLeft: `3px solid ${PALETTE.wine}`, padding: '8px 14px', background: PALETTE.paperDeep, borderRadius: 4 }}
              >
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.wine, textTransform: 'uppercase' }}>
                  {pair.english}
                </div>
                <div style={{ fontFamily: display, fontStyle: 'italic', fontSize: 18, marginTop: 4 }}>{pair.label}</div>
                <p style={{ ...pStyle, marginTop: 6 }}>{pair.oneLine}</p>
              </div>
            ))}
          </div>
        </section>

        {/* §5 Limitations */}
        <section style={{ marginTop: 36 }}>
          <SectionTitle eyebrow="§5" title="局限性与免责" />
          <ul style={ulStyle}>
            <li>ITC 基于自我报告问卷，不是临床心理量表，不构成诊断。</li>
            <li>「配对模型」是叙事工具而非匹配算法 — 我们不做交友撮合。</li>
            <li>±0.25 阈值是经验值，v1.1 计划用更大样本重新校准。</li>
            <li>当前问卷为异性恋默认；v3.2 推出 LGBTQ+ 全量内容版本。</li>
          </ul>
        </section>

        {/* §6 Citation */}
        <section style={{ marginTop: 36 }}>
          <SectionTitle eyebrow="§6" title="引用规范" />
          <pre
            style={{
              fontFamily: mono,
              fontSize: 12,
              lineHeight: 1.7,
              padding: 16,
              background: PALETTE.paperDeep,
              border: `1px solid ${PALETTE.rule}`,
              borderRadius: 6,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
{`XPTI Team. (2026). Intimacy Tension Coordinates (ITC) v1.0:
  A Tri-Axial Framework for Sexual & Relational Self-Observation.
  WTFTI Internal Methodology Note.
  https://wtfti.com/xpti/theory/`}
          </pre>
          <p style={{ ...pStyle, fontSize: 13 }}>
            可自由引用，但请：注明源自 XPTI / WTFTI；不在 PUA / 婚介 / 情感操控话术中使用；
            引用时附带 §5 的局限性提示。
          </p>
        </section>

        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${PALETTE.rule}`, textAlign: 'center' }}>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.32em', color: PALETTE.inkMute, textTransform: 'uppercase' }}>
            © 2026 WTFTI · XPTI Product · Methodology v1.0
          </div>
        </footer>
      </article>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
      <span
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.32em',
          color: PALETTE.gold,
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: display,
          fontSize: 'clamp(22px, 3vw, 28px)',
          fontWeight: 500,
          fontStyle: 'italic',
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

const pStyle: React.CSSProperties = {
  fontSize: 14.5,
  lineHeight: 1.85,
  color: PALETTE.ink,
  margin: '12px 0',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 12,
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 10,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: `1px solid ${PALETTE.wine}`,
  color: PALETTE.wine,
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: `1px solid ${PALETTE.rule}`,
  verticalAlign: 'top',
};

const ulStyle: React.CSSProperties = {
  paddingLeft: 22,
  margin: '12px 0',
  lineHeight: 1.85,
  fontSize: 14.5,
};
