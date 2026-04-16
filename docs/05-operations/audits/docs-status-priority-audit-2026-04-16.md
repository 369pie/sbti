# 文档 Status / Priority 使用审计报告

> Owner: Operations + Product Strategy
> Status: Active Audit
> Priority: P1
> Last Updated: 2026-04-16
> Review Cadence: On metadata taxonomy changes or quarterly doc cleanup
> Next Decision: Decide which downgrade and archive recommendations should be applied in the next cleanup patch

## 一、审计范围与方法

- 审计范围：整个 [docs](../..) 树中的 Markdown 文档
- 数据来源：当前文档头部元信息 + `pnpm docs:metadata`
- 审计时间：2026-04-16
- 审计目标：
  - 看清 `Status` 与 `Priority` 的实际使用分布
  - 找出状态被高估的文档
  - 找出更适合降级为 `Active Reference` 或直接移入 archive 的文档

## 二、总体分布

### 2.1 文档总量

| 指标 | 数量 |
|---|---:|
| 总文档数 | 62 |
| Active / Canonical / Historical 体系内文档 | 58 |
| 已在 archive 的 superseded 文档 | 4 |

### 2.2 Status 分布

| Status | 数量 |
|---|---:|
| Active Spec | 9 |
| Active Reference | 6 |
| Canonical Layer Index | 5 |
| Active Content Kit | 2 |
| Active Universe PRD | 2 |
| Active Universe Plan | 2 |
| Active Audit | 2 |
| 其余单项 Status | 30 |

### 2.3 Priority 分布

| Priority | 数量 | 占 Active 文档比例 |
|---|---:|---:|
| P0 | 11 | 19.0% |
| P1 | 31 | 53.4% |
| P2 | 13 | 22.4% |
| P3 | 1 | 1.7% |
| Reference | 2 | 3.4% |

## 三、关键发现

### 3.1 `P1` 使用明显偏多

`P1` 占了 58 份 active 文档中的 31 份，已经超过一半。这个分布会削弱优先级标签的导航意义，因为用户很难从 `P1` 中快速区分：

- 当前季度真正要看、要动的文档
- 仍有价值，但更多是背景支持的文档

结论：`P0` 控制得还算健康，但 `P1` 需要继续收缩，部分文档应该降到 `P2` 或随状态变化进入 archive。

### 3.2 `Active Reference` 仍然偏少

当前只有 6 份文档是 `Active Reference`，但仓库里已经存在一批明显属于“仍可参考、但不应驱动当下决策”的材料。说明这类状态的使用仍偏保守，部分文档的状态被抬高成了 `Active Spec` 或更高优先级。

### 3.3 有三类文档最容易被高估

最容易被误标为高状态 / 高优先级的是：

1. 已被新版战略吸收的“并行长文”
2. 记录已完成决策的 ADR / draft，而不是现行 source of truth 的文档
3. 旧世界观 / 旧设定表，仍保留信息价值，但不应继续作为 active planning basis

## 四、建议直接进 archive 的文档

这几份文档已经具备较强的“被新版吸收或被新版替代”特征，适合进入下一轮 archive 清理名单。

| 文档 | 当前状态 | 当前优先级 | 建议 | 原因 |
|---|---|---|---|---|
| [../../01-strategy/wtfti-deep-product-strategy-2026-04-16.md](../../01-strategy/wtfti-deep-product-strategy-2026-04-16.md) | Active Reference | P2 | 直接进 archive | 与 [../../01-strategy/wtfti-product-strategy-v2-2026-04-16.md](../../01-strategy/wtfti-product-strategy-v2-2026-04-16.md) 同日、同层、同类问题域，且自身 `Next Decision` 已明确写了“合并后归档” |
| [../../04-design-growth/growth/universe-ti-strategy.md](../../04-design-growth/growth/universe-ti-strategy.md) | Active Reference | P2 | 直接进 archive | 更像早期总论；关键原则已被平台主战略与扩展策略吸收，继续保留在 active 层会和平台战略形成概念重叠 |
| [../../03-universes/xiuxian/xiuxian-personality-design.md](../../03-universes/xiuxian/xiuxian-personality-design.md) | Active Reference | P3 | 直接进 archive | Xiuxian 2.0 已经确立新方向，[../../03-universes/xiuxian/xiuxian-2.0-strategy.md](../../03-universes/xiuxian/xiuxian-2.0-strategy.md) 与 [../../03-universes/xiuxian/xiuxian-2.0-visual-briefs.md](../../03-universes/xiuxian/xiuxian-2.0-visual-briefs.md) 已足够承担 active truth |

### 归档前的唯一前置动作

- 先检查以上三份文档是否还有少量“未迁移结论”需要提炼到现行文档。
- 如果没有，就可以直接照现在的 archive 流程处理：移动到 `99-archive`，并保留当前 authority 跳转。

## 五、建议先降级为 `Active Reference` 的文档

这几份文档仍有参考价值，但不应继续被理解为 active spec / active implementation truth。

| 文档 | 当前状态 | 当前优先级 | 建议状态 | 建议优先级 | 原因 |
|---|---|---|---|---|---|
| [../../02-modules/cpti/cpti-db-decision-vercel-neon-vs-supabase.md](../../02-modules/cpti/cpti-db-decision-vercel-neon-vs-supabase.md) | Active Spec | P1 | Active Reference | P2 | 这是 ADR，核心价值是“为什么选 Supabase”，不是当前实现规范本身；当前 active truth 更像 [../../02-modules/cpti/cpti-backend-prd.md](../../02-modules/cpti/cpti-backend-prd.md) + [../../02-modules/cpti/cpti-data-model-and-instrumentation.md](../../02-modules/cpti/cpti-data-model-and-instrumentation.md) |
| [../../02-modules/cpti/cpti-api-draft.md](../../02-modules/cpti/cpti-api-draft.md) | Active Spec | P1 | Active Reference | P2 | 文件名和正文都表明它是 `Interface Draft`；如果当前还没有进入严格 API contract 冻结期，它更适合作为 route-handler 草案参考，而不是一线 spec |

### 条件性降级候选

以下文档不建议现在立刻改，但如果对应工作不在近期里程碑内，应考虑下一轮降级：

| 文档 | 当前状态 | 当前优先级 | 条件 |
|---|---|---|---|
| [../../02-modules/soulti/soulti-vertical-strategy.md](../../02-modules/soulti/soulti-vertical-strategy.md) | Active Reference | P1 | 如果 SoulTI 不在下一轮 monetization / content 深化范围内，可降到 `P2` |
| [quiz-system-audit-and-redesign.md](quiz-system-audit-and-redesign.md) | Active Audit | P1 | 如果题库系统重构不是当前季度任务，可降到 `P2` |
| [../../04-design-growth/growth/herti-competitive-strategy.md](../../04-design-growth/growth/herti-competitive-strategy.md) | Active Competitive Reference | P1 | 如果没有明确的 HERTI 应对动作进入当前 roadmap，可降到 `P2` |

## 六、建议保持现状的 `Active Reference`

这几份虽然不是 top-level authority，但当前还不适合 archive。

| 文档 | 维持理由 |
|---|---|
| [../../02-modules/mysti/mysti-tarot-mapping.md](../../02-modules/mysti/mysti-tarot-mapping.md) | 仍承接核心内容映射逻辑，尚未被更细的新文档替代 |
| [../../02-modules/soulti/soulti-vertical-strategy.md](../../02-modules/soulti/soulti-vertical-strategy.md) | 虽然不是 canonical，但当前还没有更新版 SoulTI 全量战略稿可以完全取代 |
| [../../02-modules/xpti/xpti-female-product-strategy.md](../../02-modules/xpti/xpti-female-product-strategy.md) | 与 [../../02-modules/xpti/xpti-upgrade-strategy.md](../../02-modules/xpti/xpti-upgrade-strategy.md) 有明显前后代关系，但仍建议先做一次内容去重，再决定是否归档 |

## 七、优先级层面的治理建议

### 7.1 建议保持 `P0` 不变

当前 `P0` 基本集中在：

- docs hub / layer index
- 平台主战略与执行层
- CPTI 后端主链
- 上线收口审计

这个分布是合理的，不建议扩大 `P0` 面。

### 7.2 下一轮应优先压缩 `P1`

建议先从下面两类文档开始把 `P1` 压回 `P2`：

1. 参考性强于执行性的文档
2. 当前季度没有明确实现动作的策略或审计文档

优先处理顺序建议：

1. [../../02-modules/cpti/cpti-db-decision-vercel-neon-vs-supabase.md](../../02-modules/cpti/cpti-db-decision-vercel-neon-vs-supabase.md)
2. [../../02-modules/cpti/cpti-api-draft.md](../../02-modules/cpti/cpti-api-draft.md)
3. [../../02-modules/soulti/soulti-vertical-strategy.md](../../02-modules/soulti/soulti-vertical-strategy.md)
4. [quiz-system-audit-and-redesign.md](quiz-system-audit-and-redesign.md)
5. [../../04-design-growth/growth/herti-competitive-strategy.md](../../04-design-growth/growth/herti-competitive-strategy.md)

## 八、建议执行顺序

### 第一批：低争议清理

1. 归档 [../../01-strategy/wtfti-deep-product-strategy-2026-04-16.md](../../01-strategy/wtfti-deep-product-strategy-2026-04-16.md)
2. 归档 [../../04-design-growth/growth/universe-ti-strategy.md](../../04-design-growth/growth/universe-ti-strategy.md)
3. 归档 [../../03-universes/xiuxian/xiuxian-personality-design.md](../../03-universes/xiuxian/xiuxian-personality-design.md)

### 第二批：状态与优先级校正

1. 将 [../../02-modules/cpti/cpti-db-decision-vercel-neon-vs-supabase.md](../../02-modules/cpti/cpti-db-decision-vercel-neon-vs-supabase.md) 改为 `Active Reference / P2`
2. 将 [../../02-modules/cpti/cpti-api-draft.md](../../02-modules/cpti/cpti-api-draft.md) 改为 `Active Reference / P2`

### 第三批：条件性处理

在下一个 roadmap 评审时，再决定是否调整：

- [../../02-modules/xpti/xpti-female-product-strategy.md](../../02-modules/xpti/xpti-female-product-strategy.md)
- [../../02-modules/soulti/soulti-vertical-strategy.md](../../02-modules/soulti/soulti-vertical-strategy.md)
- [quiz-system-audit-and-redesign.md](quiz-system-audit-and-redesign.md)
- [../../04-design-growth/growth/herti-competitive-strategy.md](../../04-design-growth/growth/herti-competitive-strategy.md)

## 九、结论

当前元信息体系已经可用，但还存在两个治理信号：

1. `P1` 过多，说明优先级标签仍有“通胀”倾向。
2. 少数 legacy / decision-record / old-theory 文档还停留在过高状态，没有完全回到 `Active Reference` 或 archive。

如果按本报告执行一轮清理，文档层级会更清楚：

- current truth 更短
- reference 文档更明确
- archive 边界更干净
- `Priority` 的导航意义更强