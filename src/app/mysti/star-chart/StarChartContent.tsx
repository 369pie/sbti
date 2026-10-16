'use client';

/**
 * /mysti/star-chart/ · W4 · E4.4 · v0 preview
 *
 * 用命理引擎 v1 的原子工具集（src/lib/mingli/tools.ts）
 * 把"她的星图档案"草稿在前端实时渲染出来。
 *
 * v0 范围：
 *   - 用户输入 hash（默认匿名）+ 日期；
 *   - 调 todayBriefing(hash, date) → briefingToDraft → 一段编辑部草稿；
 *   - 顶部：Pillar II 面包屑；
 *   - 中部：「今日章节」编辑部草稿大字；
 *   - 底部：内部坐标 raw 卡片（折叠，给 dogfood 看的）。
 *
 * 不接支付。SKU 接入 + 长卡 PDF 在后续 sprint 完成；
 * 现在让用户能看见"原子工具能拼出怎样一份草稿"。
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PillarBreadcrumb } from '@/components/PillarBreadcrumb';
import { todayBriefing, briefingToDraft } from '@/lib/mingli/tools';
import { buildChartDraft, selfEvalDraft } from '@/lib/mingli/tools-v2';

const DEFAULT_HASH = 'preview';

export function StarChartContent() {
  const [hash, setHash] = useState(DEFAULT_HASH);
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  });
  const [showRaw, setShowRaw] = useState(false);
  const [useV2, setUseV2] = useState(false);

  const briefing = useMemo(() => {
    const d = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return null;
    return todayBriefing(hash || DEFAULT_HASH, d);
  }, [hash, dateStr]);

  const draft = useMemo(() => (briefing ? briefingToDraft(briefing) : ''), [briefing]);

  const v2 = useMemo(() => {
    if (!useV2) return null;
    const d = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return null;
    const draftV2 = buildChartDraft(hash || DEFAULT_HASH, d);
    return { draft: draftV2, eval: selfEvalDraft(draftV2) };
  }, [hash, dateStr, useV2]);

  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      <PillarBreadcrumb pillar="II" label="Mysti · 她的星图档案" hint="v0 预览 · 不构成任何决策依据" />

      <main className="max-w-3xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <div className="flex items-center gap-4 mb-8">
          <span
            className="text-[10px]"
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              letterSpacing: '0.32em',
              color: 'var(--color-gem)',
            }}
          >
            N°04 · STAR CHART · 她的星图档案
          </span>
          <span className="editorial-rule flex-1 max-w-[80px]" />
        </div>

        <h1
          className="mb-6 leading-[1.1]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.6rem)',
            color: 'var(--color-text-primary)',
          }}
        >
          为今天的<span style={{ fontStyle: 'italic', color: 'var(--color-sage)' }}>她</span>，
          写一份只属于她的<span style={{ fontStyle: 'italic', color: 'var(--color-gem)' }}>星图</span>。
        </h1>

        <p
          className="mb-10 max-w-2xl"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
          }}
        >
          这是命理引擎 v1 的内部预览。给一个稳定哈希（你的 secret name 也行），选一个日期，
          引擎会把 10 个原子工具拼成一段「今日章节」草稿。<br />
          后续会接编辑部翻译层 + Shrine 长卡，公开版本上线后定价 ¥39 单次 / 通行证赠送 1 次。
        </p>

        <div
          className="grid gap-4 sm:grid-cols-2 mb-10 p-4"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-rule-soft)',
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span
              className="text-[10px]"
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                letterSpacing: '0.32em',
                color: 'var(--color-text-muted)',
              }}
            >
              YOUR HASH · 一个稳定的代号
            </span>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value.slice(0, 64))}
              placeholder="preview"
              style={{
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid var(--color-rule-soft)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span
              className="text-[10px]"
              style={{
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                letterSpacing: '0.32em',
                color: 'var(--color-text-muted)',
              }}
            >
              DATE · 哪一天
            </span>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              style={{
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid var(--color-rule-soft)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </label>
        </div>

        {briefing ? (
          <article
            className="p-6 sm:p-10 mb-8"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-rule-soft)',
            }}
          >
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="text-[10px]"
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  letterSpacing: '0.32em',
                  color: 'var(--color-gem)',
                }}
              >
                CHAPTER · {briefing.weekCode} · {briefing.date}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 22,
                lineHeight: 1.85,
                color: 'var(--color-text-primary)',
              }}
            >
              {draft}
            </p>
            <div
              className="mt-6 pt-4"
              style={{ borderTop: '1px dotted var(--color-rule-soft)' }}
            >
              <span
                className="text-[10px]"
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  letterSpacing: '0.32em',
                  color: 'var(--color-text-muted)',
                }}
              >
                {briefing.starLabel} · {briefing.combo}
              </span>
            </div>
          </article>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>请输入合法日期。</p>
        )}

        {/* W5 · E5.3 · v2 引擎 toggle */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={() => setUseV2((v) => !v)}
            style={{
              padding: '4px 10px',
              border: '1px solid var(--color-gem)',
              background: useV2 ? 'var(--color-gem)' : 'transparent',
              color: useV2 ? 'var(--color-bg-primary)' : 'var(--color-gem)',
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.32em',
              cursor: 'pointer',
            }}
          >
            {useV2 ? '— 关闭引擎 v2' : '+ 引擎 v2 · 三派合参（dogfood）'}
          </button>
        </div>

        {v2 ? (
          <article
            className="p-6 sm:p-10 mb-8"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-gem)',
            }}
          >
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="text-[10px]"
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", monospace',
                  letterSpacing: '0.32em',
                  color: 'var(--color-gem)',
                }}
              >
                ENGINE v2 · 三派合参
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 21,
                lineHeight: 1.85,
                color: 'var(--color-text-primary)',
                marginBottom: 18,
              }}
            >
              {v2.draft.opening}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {v2.draft.opinions.map((o) => (
                <li
                  key={o.school}
                  style={{
                    paddingLeft: 14,
                    borderLeft: '2px solid var(--color-sage)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'ui-monospace, "SF Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      color: 'var(--color-sage)',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    § {o.school}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--color-text-primary)' }}>
                    {o.verdict}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {o.hint}
                  </div>
                </li>
              ))}
            </ul>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 17,
                lineHeight: 1.8,
                color: 'var(--color-text-primary)',
                marginBottom: 12,
              }}
            >
              {v2.draft.closing}
            </p>
            <div
              style={{
                paddingTop: 10,
                borderTop: '1px dotted var(--color-rule-soft)',
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                fontSize: 10,
                letterSpacing: '0.28em',
                color: v2.eval.pass ? 'var(--color-sage)' : 'var(--color-rose)',
              }}
            >
              SELF-EVAL · {v2.eval.pass ? 'PASS' : 'FAIL'} · {v2.eval.score}/100 · {v2.eval.reasons.join(' / ')}
            </div>
          </article>
        ) : null}

        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          style={{
            padding: '4px 10px',
            border: '1px solid var(--color-rule-soft)',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            cursor: 'pointer',
          }}
        >
          {showRaw ? '— 收起内部坐标' : '+ 展开内部坐标（dogfood）'}
        </button>

        {showRaw && briefing ? (
          <pre
            className="mt-4 p-4 overflow-auto"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-rule-soft)',
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              fontSize: 11,
              lineHeight: 1.6,
              color: 'var(--color-text-secondary)',
            }}
          >
            {JSON.stringify(briefing, null, 2)}
          </pre>
        ) : null}

        <div
          className="mt-12 pt-6 flex flex-wrap gap-4"
          style={{ borderTop: '1px solid var(--color-rule-soft)' }}
        >
          <Link
            href="/mysti/daily/"
            className="text-[11px] hover:underline"
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              letterSpacing: '0.32em',
              color: 'var(--color-gem)',
            }}
          >
            ← 回到每日一牌
          </Link>
          <Link
            href="/mysti/"
            className="text-[11px] hover:underline ml-auto"
            style={{
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              letterSpacing: '0.32em',
              color: 'var(--color-text-muted)',
            }}
          >
            了解 Mysti →
          </Link>
        </div>

        <p
          className="mt-10 text-[11px]"
          style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            letterSpacing: '0.18em',
            color: 'var(--color-text-muted)',
          }}
        >
          ENTERTAINMENT · 仅供娱乐与自我观察 · 不构成任何形式的诊断或决策依据
        </p>
      </main>
    </div>
  );
}
