'use client';

import { useCallback, useEffect, useState } from 'react';
import { getApiPath } from '@/lib/api';

import type { CopyIssue, ValidationReport } from '@/lib/ugc/feminist-validator';

interface Props {
  universeId: string;
  /** Auto-refresh signal — bump this after each editor save to re-run scan */
  refreshToken?: number | string;
}

/**
 * 女权文案合规面板
 *
 * Calls /api/creator/universes/[id]/compliance to surface violations of the
 * 10-clause 文案女权 checklist in real time. Acts as:
 *   - Always-on reviewer mirror in Studio
 *   - Pre-submit gate preview (submit endpoint enforces the same rules)
 */
export function ComplianceGate({ universeId, refreshToken }: Props) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiPath(`/creator/universes/${universeId}/compliance`));
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? '扫描失败');
      }
      const data = (await res.json()) as ValidationReport;
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '扫描失败');
    } finally {
      setLoading(false);
    }
  }, [universeId]);

  useEffect(() => {
    run();
  }, [run, refreshToken]);

  const tone = !report
    ? 'border-border-subtle bg-bg-secondary/40'
    : report.ok
      ? 'border-emerald-400/30 bg-emerald-400/[0.04]'
      : 'border-rose-400/40 bg-rose-400/[0.05]';

  return (
    <div className={`rounded-xl border p-4 text-sm ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-wider uppercase text-text-muted">
            女权文案体检
          </span>
          {loading && <span className="text-text-muted text-xs">扫描中…</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={run}
            className="text-xs px-2 py-1 rounded-md border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors"
          >
            重新扫描
          </button>
          {report && report.issues.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="text-xs px-2 py-1 rounded-md border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border transition-colors"
            >
              {expanded ? '收起' : `查看详情 (${report.issues.length})`}
            </button>
          )}
        </div>
      </div>

      {error && <div className="mt-2 text-rose-300 text-xs">{error}</div>}

      {report && (
        <div className="mt-2">
          <div
            className={`text-sm font-medium ${
              report.ok ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {report.summary}
          </div>
          {!report.ok && (
            <div className="mt-1 text-xs text-text-secondary">
              错误 {report.errorCount} · 建议 {report.warnCount} — 修复所有错误才能提交审核
            </div>
          )}
        </div>
      )}

      {report && expanded && report.issues.length > 0 && (
        <ul className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
          {report.issues.map((issue, i) => (
            <IssueRow key={`${issue.ruleId}-${i}`} issue={issue} />
          ))}
        </ul>
      )}
    </div>
  );
}

function IssueRow({ issue }: { issue: CopyIssue }) {
  const pillTone =
    issue.severity === 'error'
      ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
      : 'bg-amber-500/12 text-amber-200 border-amber-400/40';

  return (
    <li className="rounded-lg border border-border-subtle bg-bg-tertiary p-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${pillTone}`}
        >
          {issue.severity === 'error' ? '错误' : '建议'}
        </span>
        <span className="text-xs text-text-muted">第 {issue.clause} 条</span>
        <span className="text-xs text-text-muted font-mono truncate">{issue.field}</span>
      </div>
      <div className="text-xs text-text-secondary">
        命中：<span className="text-rose-200 font-mono">&ldquo;{issue.match}&rdquo;</span>
      </div>
      <div className="text-xs text-text-secondary mt-1">理由：{issue.reason}</div>
      <div className="text-xs text-emerald-300/80 mt-0.5">建议：{issue.suggestion}</div>
    </li>
  );
}
