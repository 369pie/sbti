import type { Metadata } from 'next';
import Link from 'next/link';

import { ADMIN_USER_IDS_ENV, hasConfiguredAdminUsers, isAdminUserId } from '@/lib/admin/roles';
import { fetchWtftiOpsDashboardData, type OpsDataHealthItem, type OpsMetricDelta } from '@/lib/admin/wtfti-ops';
import {
  fetchProductEventsInsights,
  type ProductEventsInsights,
  type OpsModuleFunnel,
  type OpsTopEventDelta,
} from '@/lib/admin/wtfti-ops-insights';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'WTFTI 经营总看板',
  robots: { index: false, follow: false },
};

function formatCount(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', { hour12: false });
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('zh-CN');
}

function formatDeltaText(delta: OpsMetricDelta): string {
  if (delta.previous === 0) {
    return delta.current > 0 ? '新出现的波峰' : '暂无上一周期样本';
  }

  const change = ((delta.current - delta.previous) / delta.previous) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}% vs 前 7 天`;
}

function statusTone(item: OpsDataHealthItem['status']): string {
  if (item === 'durable') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (item === 'partial') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-border-subtle bg-bg-secondary text-text-secondary';
}

function MetricCard({
  eyebrow,
  value,
  title,
  detail,
}: {
  eyebrow: string;
  value: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-5 sm:p-6">
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-text-muted">{eyebrow}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">{value}</div>
      <div className="mt-2 text-sm font-medium text-text-secondary">{title}</div>
      <p className="mt-2 text-sm leading-7 text-text-muted">{detail}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border-subtle bg-bg-elevated p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-7 text-text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-bg-secondary/50 px-4 py-6 text-sm text-text-muted">
      {message}
    </div>
  );
}

function AdminLoginState({ loginHref }: { loginHref: string }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-8 text-center sm:p-10">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-text-muted">WTFTI Admin</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary">登录管理员账号后可查看经营总看板</h1>
          <p className="mt-4 text-base leading-8 text-text-secondary">
            该页面面向内部运营和产品决策，只展示已持久化到服务端的数据。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center rounded-xl bg-accent px-5 py-3 text-sm font-medium text-bg-primary transition-colors hover:bg-accent/90"
            >
              登录管理员账号
            </Link>
            <Link
              href="/me/"
              className="inline-flex items-center rounded-xl border border-border-subtle px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary"
            >
              去个人中心
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminConfigState() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-8 sm:p-10">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-amber-700">WTFTI Admin</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-amber-950">管理员白名单尚未配置</h1>
          <p className="mt-4 text-base leading-8 text-amber-900/80">
            需要先在服务端配置环境变量 <span className="font-mono">{ADMIN_USER_IDS_ENV}</span>，再使用内部看板。
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminForbiddenState() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-border-subtle bg-bg-elevated p-8 text-center sm:p-10">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-text-muted">WTFTI Admin</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary">当前账号没有经营总看板权限</h1>
          <p className="mt-4 text-base leading-8 text-text-secondary">
            该页面只开放给内部管理员账号。普通创作者请使用 Studio、收益中心和个人中心。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/creator/studio/"
              className="inline-flex items-center rounded-xl bg-accent px-5 py-3 text-sm font-medium text-bg-primary transition-colors hover:bg-accent/90"
            >
              去 Creator Studio
            </Link>
            <Link
              href="/me/"
              className="inline-flex items-center rounded-xl border border-border-subtle px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary"
            >
              去个人中心
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 sm:p-10">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-rose-700">WTFTI Admin</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-rose-950">经营看板加载失败</h1>
          <p className="mt-4 text-base leading-8 text-rose-900/80">{message}</p>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return '—';
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function formatChange(value: number): string {
  if (!Number.isFinite(value)) return '新事件';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function FunnelCard({ funnel }: { funnel: OpsModuleFunnel }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-text-primary">{funnel.label}</div>
        <div className="text-xs text-text-muted">
          7 天 {formatCount(funnel.totalSessions7Days)} 会话 ·{' '}
          vs 前 7 天{' '}
          {funnel.totalSessions7DaysPrev > 0
            ? formatChange(((funnel.totalSessions7Days - funnel.totalSessions7DaysPrev) / funnel.totalSessions7DaysPrev) * 100)
            : '新出现'}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {funnel.steps.map((step, index) => {
          const previousStep = index > 0 ? funnel.steps[index - 1] : null;
          const stepDrop =
            previousStep && previousStep.sessions > 0
              ? ((previousStep.sessions - step.sessions) / previousStep.sessions) * 100
              : 0;
          return (
            <div key={step.step}>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>
                  <span className="mr-1 font-mono text-text-muted">#{index + 1}</span>
                  {step.label}
                </span>
                <span>
                  {formatCount(step.sessions)} 会话 · {formatPercent(step.conversion)}
                  {previousStep ? (
                    <span className={`ml-2 text-[11px] ${stepDrop > 30 ? 'text-rose-600' : 'text-text-muted'}`}>
                      流失 {stepDrop.toFixed(1)}%
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-secondary">
                <div
                  className="h-full rounded-full bg-accent/80"
                  style={{ width: `${Math.min(100, step.conversion)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductInsightsSection({
  insights,
  insightsError,
}: {
  insights: ProductEventsInsights | null;
  insightsError: string | null;
}) {
  if (insightsError) {
    return (
      <div className="mt-8">
        <SectionCard
          title="UX 漏斗与体验信号"
          description="读取 product_events / perf_metrics 时出错，已降级显示。"
        >
          <EmptyState message={`UX 数据加载失败: ${insightsError}`} />
        </SectionCard>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  if (!insights.hasProductEvents && !insights.hasPerfMetrics) {
    return (
      <div className="mt-8">
        <SectionCard
          title="UX 漏斗与体验信号"
          description="启用统一埋点后，这里会自动出现 7 天漏斗、流失点和性能健康度。"
        >
          {insights.warnings.length > 0 ? (
            <div className="grid gap-2">
              {insights.warnings.map((warning) => (
                <div
                  key={warning}
                  className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900/80"
                >
                  {warning}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="还没有收到任何 product_events 上报，等用户开始触发即可看到漏斗。" />
          )}
        </SectionCard>
      </div>
    );
  }

  const usableFunnels = insights.funnels.filter((funnel) => funnel.totalSessions7Days > 0);
  const dropOffWithData = insights.dropOffs.filter((item) =>
    item.points.some((point) => point.sessions > 0),
  );
  const engagementWithData = insights.engagement.filter((item) => item.sessions > 0);

  return (
    <>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="近 7 天模块漏斗"
          description="按 session_id 去重统计：进入 → 答题 → 完成 → 分享 → 深度。比单纯 PV 更接近真实使用质量。"
        >
          {usableFunnels.length > 0 ? (
            <div className="grid gap-4">
              {usableFunnels.map((funnel) => (
                <FunnelCard key={funnel.module} funnel={funnel} />
              ))}
            </div>
          ) : (
            <EmptyState message="没有满足漏斗定义的事件，先确认核心模块的埋点已经上线。" />
          )}
        </SectionCard>

        <SectionCard
          title="模块互动质量"
          description="衡量留得住和分享出去的能力。中位完成时长可作为'内容是否过长'的参考。"
        >
          {engagementWithData.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border-subtle">
              <table className="min-w-full divide-y divide-border-subtle text-sm">
                <thead className="bg-bg-secondary/70 text-text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">模块</th>
                    <th className="px-3 py-2 text-right font-medium">会话</th>
                    <th className="px-3 py-2 text-right font-medium">完成率</th>
                    <th className="px-3 py-2 text-right font-medium">分享率</th>
                    <th className="px-3 py-2 text-right font-medium">中位完成</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-bg-elevated">
                  {engagementWithData.map((item) => (
                    <tr key={item.module}>
                      <td className="px-3 py-2 text-text-primary">{item.label}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{formatCount(item.sessions)}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{formatPercent(item.finishRate)}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{formatPercent(item.shareRate)}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{formatDuration(item.medianTimeToFinishMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="近 7 天还没有可统计的会话级数据。" />
          )}
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="流失热点"
          description="高于 30% 的流失会高亮，作为下一步 UX 优化的入口。"
        >
          {dropOffWithData.length > 0 ? (
            <div className="space-y-4">
              {dropOffWithData.map((item) => (
                <div key={item.module}>
                  <div className="text-sm font-medium text-text-primary">{item.label}</div>
                  <div className="mt-2 space-y-2">
                    {item.points.map((point) => (
                      <div key={point.step}>
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span>{point.label}</span>
                          <span className={point.drop > 30 ? 'text-rose-600' : 'text-text-muted'}>
                            流失 {point.drop.toFixed(1)}% · 留下 {formatCount(point.sessions)} 会话
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-secondary">
                          <div
                            className={`h-full rounded-full ${point.drop > 30 ? 'bg-rose-500/80' : 'bg-amber-500/70'}`}
                            style={{ width: `${Math.min(100, point.drop)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="目前还没有覆盖到的漏斗流失数据。" />
          )}
        </SectionCard>

        <SectionCard
          title="近 7 天性能健康"
          description="基于 perf_metrics 的 p75 LCP / INP / CLS。LCP 较差 (>30%) 的页面优先排查。"
        >
          {insights.perfTopPaths.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border-subtle">
              <table className="min-w-full divide-y divide-border-subtle text-sm">
                <thead className="bg-bg-secondary/70 text-text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">路径</th>
                    <th className="px-3 py-2 text-right font-medium">样本</th>
                    <th className="px-3 py-2 text-right font-medium">LCP p75</th>
                    <th className="px-3 py-2 text-right font-medium">INP p75</th>
                    <th className="px-3 py-2 text-right font-medium">CLS p75</th>
                    <th className="px-3 py-2 text-right font-medium">LCP poor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-bg-elevated">
                  {insights.perfTopPaths.map((row) => (
                    <tr key={row.pathname}>
                      <td className="px-3 py-2 text-text-primary">
                        <span className="font-mono text-xs">{row.pathname}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-text-secondary">{formatCount(row.samples)}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{Math.round(row.lcpP75)}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{Math.round(row.inpP75)}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{row.clsP75.toFixed(2)}</td>
                      <td className={`px-3 py-2 text-right ${row.lcpPoorShare > 30 ? 'text-rose-600' : 'text-text-secondary'}`}>
                        {formatPercent(row.lcpPoorShare)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="近 7 天没有 perf_metrics 样本。" />
          )}
        </SectionCard>
      </div>

      <div className="mt-8">
        <SectionCard
          title="周环比信号 TOP"
          description="按变化率排序的事件，正向意味着产品某条路径在加热，负向意味着掉队。"
        >
          {insights.topDeltas.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border-subtle">
              <table className="min-w-full divide-y divide-border-subtle text-sm">
                <thead className="bg-bg-secondary/70 text-text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">模块</th>
                    <th className="px-3 py-2 text-left font-medium">事件</th>
                    <th className="px-3 py-2 text-right font-medium">本周</th>
                    <th className="px-3 py-2 text-right font-medium">前周</th>
                    <th className="px-3 py-2 text-right font-medium">变化</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-bg-elevated">
                  {insights.topDeltas.map((row: OpsTopEventDelta) => (
                    <tr key={`${row.module}-${row.event}`}>
                      <td className="px-3 py-2 text-text-primary">{row.module}</td>
                      <td className="px-3 py-2 font-mono text-xs text-text-secondary">{row.event}</td>
                      <td className="px-3 py-2 text-right text-text-secondary">{formatCount(row.current)}</td>
                      <td className="px-3 py-2 text-right text-text-muted">{formatCount(row.previous)}</td>
                      <td
                        className={`px-3 py-2 text-right ${
                          Number.isFinite(row.change) && row.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatChange(row.change)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="近 14 天事件样本不足，等更多数据后再分析。" />
          )}
        </SectionCard>
      </div>

      {insights.warnings.length > 0 ? (
        <div className="mt-6 grid gap-2">
          {insights.warnings.map((warning) => (
            <div
              key={warning}
              className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900/80"
            >
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default async function CreatorAdminOpsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loginHref = `/auth/login/?next=${encodeURIComponent('/creator/admin/ops/')}`;

  if (!user || user.is_anonymous) {
    return <AdminLoginState loginHref={loginHref} />;
  }

  if (!hasConfiguredAdminUsers()) {
    return <AdminConfigState />;
  }

  if (!isAdminUserId(user.id)) {
    return <AdminForbiddenState />;
  }

  let data;
  let insights: ProductEventsInsights | null = null;
  let insightsError: string | null = null;

  try {
    data = await fetchWtftiOpsDashboardData();
  } catch (error) {
    return <AdminErrorState message={error instanceof Error ? error.message : 'Unknown error'} />;
  }

  try {
    insights = await fetchProductEventsInsights();
  } catch (error) {
    insightsError = error instanceof Error ? error.message : 'Unknown error';
  }

  const trendMax = Math.max(...data.trends14Days.map((item) => item.total), 1);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-text-muted">WTFTI Admin</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              WTFTI 经营总看板
            </h1>
            <p className="mt-4 text-base leading-8 text-text-secondary sm:text-lg">
              这一版只用 Supabase 已落库的数据做平台级运营视图，优先回答供给、完成、关系热度、收益和内部待办。
              First Look、Mysti、SoulTI 还没有服务端漏斗，这里不会伪造它们的核心数字。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/creator/admin/ops/"
              className="inline-flex items-center rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-bg-primary"
            >
              总看板
            </Link>
            <Link
              href="/creator/admin/"
              className="inline-flex items-center rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary"
            >
              审核队列
            </Link>
            <Link
              href="/creator/applications/"
              className="inline-flex items-center rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary"
            >
              创作者申请
            </Link>
            <Link
              href="/creator/earnings/"
              className="inline-flex items-center rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary"
            >
              收益中心
            </Link>
            <Link
              href="/creator/leaderboard/"
              className="inline-flex items-center rounded-xl border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:text-text-primary"
            >
              创作者榜单
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-text-muted">
          <div className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5">
            数据生成于 {formatDateTime(data.generatedAt)}
          </div>
          <div className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5">
            Admin only
          </div>
          <div className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5">
            口径: Supabase 持久化数据
          </div>
          <div className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1.5">
            收益模块仍是模拟支付
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6">
          <div className="text-sm font-medium text-amber-900">当前页的可信口径</div>
          <p className="mt-2 text-sm leading-7 text-amber-900/80">
            可直接用于产品和运营判断的，是 Creator Universe、Identify、CPTI、创作者申请、结算与订单。
            First Look、Mysti、SoulTI 仍缺服务端事件表或结果表，需要下一阶段补埋点后再进入核心漏斗看板。
          </p>
          {data.warnings.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {data.warnings.map((warning) => (
                <div key={warning} className="rounded-2xl border border-amber-300/70 bg-bg-elevated px-4 py-3 text-sm text-amber-900/80">
                  {warning}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            eyebrow="Supply"
            value={formatCount(data.overview.publishedUniverseCount)}
            title="已发布宇宙"
            detail={`${formatCount(data.overview.creatorsWithPublishedCount)} 位创作者已上架 / ${formatCount(data.overview.creatorCount)} 位创作者已入库，其中 ${formatCount(data.overview.verifiedCreatorCount)} 位已认证。`}
          />
          <MetricCard
            eyebrow="Creator UGC"
            value={formatCount(data.overview.creatorTests7Days.current)}
            title="近 7 天测试完成"
            detail={`${formatDeltaText(data.overview.creatorTests7Days)} · 累计 ${formatCount(data.overview.creatorTestsAllTime)} 次完成。`}
          />
          <MetricCard
            eyebrow="Share"
            value={formatPercent(data.overview.creatorShareRate30Days)}
            title="近 30 天分享率"
            detail={`累计 ${formatCount(data.overview.creatorSharesAllTime)} 次分享 / ${formatCount(data.overview.creatorTestsAllTime)} 次测试。`}
          />
          <MetricCard
            eyebrow="Identify"
            value={formatCount(data.overview.identifyAssessments7Days.current)}
            title="近 7 天画像产出"
            detail={`${formatDeltaText(data.overview.identifyAssessments7Days)} · 累计 ${formatCount(data.overview.identifyAssessmentsAllTime)} 份结果。`}
          />
          <MetricCard
            eyebrow="CPTI"
            value={formatCount(data.overview.cptiRelationships7Days.current)}
            title="近 7 天关系生成"
            detail={`${formatDeltaText(data.overview.cptiRelationships7Days)} · 累计 ${formatCount(data.overview.cptiRelationshipsAllTime)} 条关系。`}
          />
          <MetricCard
            eyebrow="Revenue"
            value={formatCurrency(data.overview.revenueGross30DaysCents)}
            title="近 30 天毛收入"
            detail={`创作者净分成 ${formatCurrency(data.overview.revenueNet30DaysCents)} · 历史累计毛收入 ${formatCurrency(data.overview.revenueGrossAllTimeCents)}。`}
          />
          <MetricCard
            eyebrow="Settlement"
            value={formatCurrency(data.overview.pendingSettlementCents)}
            title="待处理结算"
            detail={`${formatCount(data.overview.pendingSettlementCount)} 笔结算仍在 pending / processing。`}
          />
          <MetricCard
            eyebrow="Ops"
            value={formatCount(data.overview.reviewQueueCount)}
            title="审核待办"
            detail={`近 7 天新增 ${formatCount(data.overview.creatorApplicationsNew7Days)} 份创作者申请，适合和审核节奏联动看。`}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <SectionCard
            title="14 天核心完成趋势"
            description="只统计当前已经落到 Supabase 的三条主线: Creator Universe、Identify、CPTI。"
            action={
              <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5">
                  <span className="size-2 rounded-full bg-rose-500" /> Creator UGC
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5">
                  <span className="size-2 rounded-full bg-sky-500" /> Identify
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5">
                  <span className="size-2 rounded-full bg-amber-500" /> CPTI
                </span>
              </div>
            }
          >
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
              <div className="flex h-64 items-end gap-2 sm:gap-3">
                {data.trends14Days.map((item) => {
                  const barHeight = item.total > 0 ? Math.max((item.total / trendMax) * 100, 4) : 0;

                  return (
                    <div key={item.date} className="group flex h-full flex-1 flex-col items-center justify-end">
                      <div className="relative flex h-full w-full items-end justify-center">
                        <div className="absolute -top-10 hidden rounded-xl border border-border-subtle bg-bg-elevated px-3 py-2 text-center text-xs text-text-secondary shadow-sm group-hover:block">
                          <div>{item.date.slice(5).replace('-', '/')}</div>
                          <div className="mt-1 font-medium text-text-primary">{formatCount(item.total)}</div>
                        </div>
                        <div className="flex h-full w-full max-w-8 items-end justify-center rounded-t-xl bg-bg-secondary/70">
                          {item.total > 0 ? (
                            <div className="flex h-full w-full flex-col-reverse overflow-hidden rounded-t-xl" style={{ height: `${barHeight}%` }}>
                              <div className="bg-rose-500/85" style={{ height: `${(item.ugc / item.total) * 100}%` }} />
                              <div className="bg-sky-500/85" style={{ height: `${(item.identify / item.total) * 100}%` }} />
                              <div className="bg-amber-500/85" style={{ height: `${(item.cpti / item.total) * 100}%` }} />
                            </div>
                          ) : (
                            <div className="h-2 w-full rounded-t-xl bg-border-subtle" />
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-[11px] text-text-muted">{item.date.slice(5).replace('-', '/')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard title="创作者供给快照" description="看平台供给质量，而不是只看单个宇宙。">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
                    <div className="text-xs text-text-muted">已上架创作者</div>
                    <div className="mt-2 text-2xl font-semibold text-text-primary">
                      {formatCount(data.overview.creatorsWithPublishedCount)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
                    <div className="text-xs text-text-muted">认证创作者</div>
                    <div className="mt-2 text-2xl font-semibold text-text-primary">
                      {formatCount(data.overview.verifiedCreatorCount)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.creator.tierDistribution.length > 0 ? (
                    data.creator.tierDistribution.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm text-text-secondary">
                          <span>{item.label}</span>
                          <span>{formatCount(item.count)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-secondary">
                          <div className="h-full rounded-full bg-accent/80" style={{ width: `${item.share}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="当前还没有可用的创作者 tier 数据。" />
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="30 天来源 TOP" description="当前只对 Creator Universe 有可靠来源口径。">
              <div className="space-y-3">
                {data.creator.topReferrers30Days.length > 0 ? (
                  data.creator.topReferrers30Days.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3">
                      <div className="w-7 text-xs font-mono text-text-muted">#{index + 1}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-text-primary">{item.label}</div>
                        <div className="text-xs text-text-muted">{formatPercent(item.share)} of 30d creator traffic</div>
                      </div>
                      <div className="text-sm text-text-secondary">{formatCount(item.count)}</div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="近 30 天还没有来源样本。" />
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <SectionCard title="30 天最热宇宙" description="优先看真实完成量和分享率，不只看历史累计。">
            <div className="space-y-3">
              {data.creator.topUniverses30Days.length > 0 ? (
                data.creator.topUniverses30Days.map((item, index) => (
                  <Link
                    key={item.universeId}
                    href={`/creator/studio/${item.universeId}/stats/`}
                    className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3 transition-colors hover:border-border hover:bg-bg-secondary"
                  >
                    <div className="w-8 pt-0.5 text-xs font-mono text-text-muted">#{index + 1}</div>
                    <div className="text-2xl leading-none">{item.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-medium text-text-primary">{item.name}</div>
                        {item.isPaid ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                            付费 {formatCurrency(item.priceCents)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-text-muted">{item.creatorName}</div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-secondary">
                        <span>{formatCount(item.tests)} 次完成</span>
                        <span>{formatCount(item.shares)} 次分享</span>
                        <span>{formatPercent(item.shareRate)} 分享率</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState message="近 30 天还没有 Creator Universe 完成数据。" />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Identify 热门画像" description="这部分能帮助判断画像表达是否过度集中。">
            <div className="space-y-3">
              {data.identify.topPersonas30Days.length > 0 ? (
                data.identify.topPersonas30Days.map((item, index) => (
                  <div key={item.label} className="rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 text-xs font-mono text-text-muted">#{index + 1}</div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{item.label}</div>
                          <div className="text-xs text-text-muted">{formatPercent(item.share)} of last 30 days</div>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary">{formatCount(item.count)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="近 30 天还没有 Identify 画像样本。" />
              )}
            </div>
          </SectionCard>

          <SectionCard title="CPTI 热门关系" description="适合观察当前用户最常解锁的关系类型。">
            <div className="space-y-3">
              {data.cpti.topRelationships30Days.length > 0 ? (
                data.cpti.topRelationships30Days.map((item, index) => (
                  <div key={item.label} className="rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 text-xs font-mono text-text-muted">#{index + 1}</div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{item.label}</div>
                          <div className="text-xs text-text-muted">{formatPercent(item.share)} of last 30 days</div>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary">{formatCount(item.count)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="近 30 天还没有 CPTI 关系样本。" />
              )}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="审核队列"
            description="这部分直接对应今天的上架待办。"
            action={
              <Link
                href="/creator/admin/"
                className="text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                去审核页
              </Link>
            }
          >
            <div className="space-y-3">
              {data.operations.reviewQueue.length > 0 ? (
                data.operations.reviewQueue.map((item) => (
                  <Link
                    key={item.id}
                    href={`/creator/studio/${item.id}/`}
                    className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3 transition-colors hover:border-border hover:bg-bg-secondary"
                  >
                    <div className="text-2xl leading-none">{item.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text-primary">{item.name}</div>
                      <div className="mt-1 text-xs text-text-muted">{item.creatorName}</div>
                      <div className="mt-2 text-xs text-text-secondary">提交于 {formatDate(item.submittedAt)}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState message="当前没有待审核宇宙。" />
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="创作者申请"
            description="用来观察创作者供给意愿和运营跟进压力。"
            action={
              <Link
                href="/creator/applications/"
                className="text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                去申请后台
              </Link>
            }
          >
            {data.operations.applicationsAvailable ? (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
                    <div className="text-xs text-text-muted">免费意向</div>
                    <div className="mt-2 text-xl font-semibold text-text-primary">
                      {formatCount(data.operations.applicationDemandMix.freeOnly)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
                    <div className="text-xs text-text-muted">付费意向</div>
                    <div className="mt-2 text-xl font-semibold text-text-primary">
                      {formatCount(data.operations.applicationDemandMix.paidOnly)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
                    <div className="text-xs text-text-muted">双模式意向</div>
                    <div className="mt-2 text-xl font-semibold text-text-primary">
                      {formatCount(data.operations.applicationDemandMix.mixed)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.operations.applicationStatusCounts.length > 0 ? (
                    data.operations.applicationStatusCounts.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm text-text-secondary">
                          <span>{item.label}</span>
                          <span>{formatCount(item.count)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-secondary">
                          <div className="h-full rounded-full bg-accent/80" style={{ width: `${item.share}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="当前还没有创作者申请记录。" />
                  )}
                </div>

                {data.operations.applicationSourceCounts.length > 0 ? (
                  <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
                    <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted">Top Source Page</div>
                    <div className="mt-3 space-y-2">
                      {data.operations.applicationSourceCounts.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 flex-1 truncate text-text-secondary">{item.label}</span>
                          <span className="text-text-primary">{formatCount(item.count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState message="当前环境还没有初始化创作者申请表，申请运营区块已降级为空态。" />
            )}
          </SectionCard>

          <SectionCard title="待处理结算" description="这个区块直接反映财务队列压力。">
            <div className="space-y-3">
              {data.operations.pendingSettlements.length > 0 ? (
                data.operations.pendingSettlements.map((item) => (
                  <div key={`${item.creatorId}-${item.requestedAt}`} className="rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{item.creatorName}</div>
                        <div className="mt-1 text-xs text-text-muted">申请于 {formatDate(item.requestedAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-text-primary">{formatCurrency(item.amountCents)}</div>
                        <div className="mt-1 text-xs text-amber-700">{item.status}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="当前没有待处理结算。" />
              )}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <SectionCard title="CPTI 收藏榜头部玩家" description="适合观察高价值用户的收藏深度和稀有关系偏好。">
            <div className="space-y-3">
              {data.cpti.topCollectors.length > 0 ? (
                data.cpti.topCollectors.map((item, index) => (
                  <div key={item.userId} className="rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 text-xs font-mono text-text-muted">#{index + 1}</div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">{item.nickname}</div>
                          <div className="mt-1 text-xs text-text-muted">
                            关系类型 {formatCount(item.relationshipTypeCount)} · 灵魂 {formatCount(item.soulCount)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-text-secondary">稀有 {formatCount(item.rareCount)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="当前还没有可展示的 CPTI 收藏榜样本。" />
              )}
            </div>
          </SectionCard>

          <SectionCard title="最近发布" description="方便把内容供给变化和上架节奏放到一起看。">
            <div className="space-y-3">
              {data.creator.recentPublications.length > 0 ? (
                data.creator.recentPublications.map((item) => (
                  <Link
                    key={item.id}
                    href={`/creator/studio/${item.id}/`}
                    className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-bg-secondary/50 px-4 py-3 transition-colors hover:border-border hover:bg-bg-secondary"
                  >
                    <div className="text-2xl leading-none">{item.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-medium text-text-primary">{item.name}</div>
                        {item.isPaid ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                            付费 {formatCurrency(item.priceCents)}
                          </span>
                        ) : (
                          <span className="rounded-full border border-border-subtle bg-bg-secondary px-2 py-0.5 text-[11px] text-text-secondary">
                            免费
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-text-muted">{item.creatorName}</div>
                      <div className="mt-2 text-xs text-text-secondary">
                        发布于 {formatDate(item.publishedAt)} · 累计 {formatCount(item.totalTests)} 次测试
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState message="当前还没有已发布宇宙。" />
              )}
            </div>
          </SectionCard>
        </div>

        <ProductInsightsSection insights={insights} insightsError={insightsError} />

        <div className="mt-8">
          <SectionCard title="数据覆盖情况" description="这是决定下一阶段该补哪条数据链路的依据。">
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {data.dataHealth.map((item) => (
                <div key={item.module} className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-text-primary">{item.module}</div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusTone(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{item.summary}</p>
                  <p className="mt-2 text-xs leading-6 text-text-muted">{item.note}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}