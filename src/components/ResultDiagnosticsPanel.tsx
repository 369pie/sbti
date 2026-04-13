import type { ResultDiagnostics } from '@/lib/result-diagnostics';

interface Props {
  diagnostics: ResultDiagnostics;
  title?: string;
  accent: string;
}

function formatGap(gap: number | null): string {
  if (gap === null) {
    return '候选不足';
  }

  return gap.toFixed(2);
}

export function ResultDiagnosticsPanel({ diagnostics, title = '这次判定说明', accent }: Props) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-mono tracking-wider text-text-muted uppercase mb-2">
            {title}
          </h2>
          <p className="text-sm text-text-secondary leading-7">
            这层解释基于你刚答完的题目，不是按类型模板倒推出来的说明。
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border"
          style={{ color: accent, borderColor: `${accent}30`, background: `${accent}10` }}
        >
          实时判定
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-medium text-text-primary">判定置信度</span>
            <span className="text-xs font-mono rounded-full px-2.5 py-1" style={{ color: accent, background: `${accent}12` }}>
              {diagnostics.confidence.score} · {diagnostics.confidence.label}
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-7 mb-3">
            {diagnostics.confidence.summary}
          </p>
          <p className="text-xs text-text-muted leading-6">
            与第二近结果的差距：{formatGap(diagnostics.confidence.gap)}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-medium text-text-primary">回答一致性</span>
            <span className="text-xs font-mono rounded-full px-2.5 py-1" style={{ color: accent, background: `${accent}12` }}>
              {diagnostics.consistency.score} · {diagnostics.consistency.label}
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-7 mb-3">
            {diagnostics.consistency.summary}
          </p>
          <p className="text-xs text-text-muted leading-6">
            参与一致性比对的维度：{diagnostics.consistency.comparedDimensions}
          </p>
        </div>
      </div>

      {diagnostics.nearMatch && (
        <div className="mt-4 rounded-2xl border border-border-subtle bg-bg-secondary/30 p-4">
          <p className="text-sm font-medium text-text-primary mb-2">
            临界邻近结果：{diagnostics.nearMatch.code} · {diagnostics.nearMatch.name}
          </p>
          <p className="text-sm text-text-secondary leading-7">
            {diagnostics.nearMatch.summary}
          </p>
          {diagnostics.nearMatch.differingDimensions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {diagnostics.nearMatch.differingDimensions.map((dimensionName) => (
                <span
                  key={dimensionName}
                  className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 text-xs text-text-secondary"
                >
                  {dimensionName}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {diagnostics.consistency.flaggedDimensionNames.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-muted leading-6">
            波动较明显的维度：{diagnostics.consistency.flaggedDimensionNames.join('、')}
          </p>
        </div>
      )}
    </div>
  );
}