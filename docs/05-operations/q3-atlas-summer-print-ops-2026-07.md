# Q3 Atlas Summer Print Ops

> Owner: Operations + Editorial
> Status: Active Operations Reference
> Priority: P1
> Last Updated: 2026-05-08
> Review Cadence: Weekly until vendor is selected, then On print-run changes
> Next Decision: Decide whether the first run should be a 200-copy gift edition or a smaller 50-copy pilot

This pack is the operational starter kit for Q3-E5: the first print artifact, 《她词条 · 2026 夏》.

## 1. Deliverable Definition

- Format: gift edition, not retail product
- Audience: seed contributors, selected KOLs, editorial archive copies
- Initial run cap: `<= 200` copies
- Core content: first published atlas entries + monthly whitepaper excerpts + editor foreword + seasonal omen appendix

## 2. Vendor RFQ Template

Send this to 3 printers.

```text
主题：询价｜《她词条 · 2026 夏》小批量纸质出版物（200 册内）

你好，

我们在准备一本中文 editorial 风格的小批量礼赠出版物，想请你们按以下规格报价：

1. 数量：50 / 100 / 200 三档分别报价
2. 成品尺寸：A5 或 170mm × 240mm，请分别报价
3. 页数：约 96-128 页，黑白正文 + 局部专色 / 烫金封面
4. 纸张：米白轻涂或自然书纸，正文 100g-120g，封面 250g-300g
5. 装订：锁线胶装优先，也请给精装报价
6. 封面工艺：烫金 logo / 局部压凹各报价一次
7. 交期：从定稿文件交付起，打样与大货各需要多少工作日
8. 物流：支持分开发送或到仓一次性发货的费用结构

请附：
- 单册报价梯度
- 打样费用
- 运费说明
- 近似项目案例照片

谢谢。
```

## 3. Spec Sheet For Vendor Comparison

| 项目 | 目标规格 | 备注 |
|---|---|---|
| 尺寸 | A5 or 170×240mm | 以阅读舒适优先，不追求咖啡桌大书 |
| 页数 | 96-128 | 超过 128 页成本和物流会变钝 |
| 封面 | 深暮紫底 + 金箔标题 | 对齐 Editorial Atelier |
| 纸张 | 米白内页 | 避免冷白办公纸感 |
| 装订 | 锁线胶装优先 | 要能平摊拍照 |
| 附件 | 烫金 Sigil 书签 | 单独核算单价 |

## 4. Proposed Production Schedule

| 时间 | 任务 |
|---|---|
| 6/01-6/15 | 收集 3 家报价 |
| 6/16-6/30 | 定装帧方向 + 预算上限 |
| 7/15 | 第一批 atlas 词条发布 |
| 8/15 | 样书 PDF 定稿 |
| 8/20-8/31 | 打样 + 修订 |
| 9/01-9/10 | 大货印刷 |
| 9/11-9/20 | 收集地址 + 分装 |
| 9/21-9/30 | 寄出 |

## 5. Budget Guardrails

| 项目 | 目标上限 |
|---|---|
| 单册印制 | ¥45 |
| 书签 + 明信片 | ¥15 |
| 包装材料 | ¥8 |
| 单份物流 | ¥12 |
| 总单位成本 | `<= ¥80` |

If unit cost exceeds `¥80`, the fallback is: reduce finish complexity before reducing editorial substance.

## 6. Recipient Cohort Query

Use this query to build the seed shortlist once `atlas_submissions` exists.

```sql
with echo_authors as (
  select
    client_hash as contributor_hash,
    count(*) as echo_count,
    max(created_at) as last_echo_at
  from public.hermosa_echoes_thread
  where is_published = true
    and flagged = false
    and client_hash is not null
  group by 1
),
published_contributors as (
  select
    contributor_hash,
    count(*) as published_count,
    max(published_at) as last_published_at
  from public.atlas_submissions
  where status = 'published'
  group by 1
)
select
  coalesce(p.contributor_hash, e.contributor_hash) as contributor_hash,
  coalesce(p.published_count, 0) as published_count,
  coalesce(e.echo_count, 0) as echo_count,
  greatest(
    coalesce(p.last_published_at, 'epoch'::timestamptz),
    coalesce(e.last_echo_at, 'epoch'::timestamptz)
  ) as last_active_at
from published_contributors p
full join echo_authors e
  on e.contributor_hash = p.contributor_hash
where coalesce(p.published_count, 0) >= 1
   or coalesce(e.echo_count, 0) >= 7
order by
  coalesce(p.published_count, 0) desc,
  coalesce(e.echo_count, 0) desc,
  last_active_at desc
limit 200;
```

Interpretation:

- `published_count >= 1` = atlas contributors
- `echo_count >= 7` = relay seed cohort
- `limit 200` = hard cap for first gift run

## 7. Address Collection Rule

Addresses should **not** be stored in product tables.

Use an external collection sheet or CRM with these fields only:

- contributor hash / recipient code
- display name
- city / province / postal code
- recipient address
- phone
- consent to receive a physical gift

## 8. KOL Seed List

Default Q3 target names from the master plan:

- 文子 / `@Eejoylove`
- Hanya / `@RealHanyaHu`
- plus 3 additional editorially selected women whose audience overlaps with modern-myth, AI, or female creator communities

No public ask is attached to the package. The object itself is the message.