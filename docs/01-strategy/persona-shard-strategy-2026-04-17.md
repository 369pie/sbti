# Persona Shard — Strategy & MVP (2026-04-17)

> **一句话**：每测完一个宇宙，不只是收到一张人设卡，是解锁一枚**会呼吸的人格碎片**——它住在 WTF Card 里，每天有新话对你说，跨宇宙会互相共鸣。

## 1. Why 现在做

产品漏斗当前结构：
- 测试 → 结果页 → 分享图 → WTF Card 图鉴 → (end)

现状问题（见代码审计）：
1. 结果页 = 一次性报告，读完 3 分钟就死了
2. 分享图 = 静态战利品，分享者发完即止
3. WTF Card 档案页 = 静态陈列柜，集齐即结束
4. 宇宙数量（20+）边际效应递减 —— 下一步应该是**深度**，不是**广度**

**Persona Shard 把"结果"从展品变成可持有的对象**，在不破坏现有漏斗的前提下添加一条持续回访曲线。

## 2. Positioning（Geoffrey Moore）

> For **已测过 2+ 宇宙的 WTFTI 活跃用户**  
> that need **"然后呢"——一个让测试结果继续活下去的理由**  
> **Persona Shard** is a **人格具象化容器**  
> that **把 15 维度的答题数据变成会呼吸、会说话、会进化的人格碎片**。  
> Unlike **MBTI 主导色 / Character.AI**，Shard 不是陌生宠物也不是 AI 女友 —  
> Shard provides **"这就是你的一面"的镜像体验**，而非角色扮演。

## 3. Reframe（MITRE Canvas 输出）

- 旧问题：如何增加结果页回访 CTA？
- 新问题：**我们如何让每一次测试的结果，变成一个用户愿意每天回来见一面的东西？**

## 4. Anti-Definition（先写禁止条款）

Shard **不是**：
- ❌ 拟人 AI chatbot（MVP 不接 LLM）
- ❌ Tamagotchi 喂食/衰减机制（不给负罪感）
- ❌ 新账号身份（挂在现有 WTF Card）
- ❌ 付费数值养成（Wave 1 完全免费）

Shard **是**：
- ✅ 基于 `profile: Record<DimensionId, H/M/L>` 确定性派生的"个性"
- ✅ 住在 WTF Card 里的活物：voice + pace + energy + mood + stage
- ✅ 输出内容 > 输入互动（不等你喂它）
- ✅ 跨宇宙可组合（Wave 2）
- ✅ 可作为社交馈赠载体（Wave 2/3）

## 5. MVP 架构（Wave 1 · 本次已实现）

### 5.1 数据层（全部 client-side，零后端）

| 模块 | 文件 | 职责 |
|---|---|---|
| Traits | `src/lib/persona-shard/traits.ts` | `(universeId, slug) → { voice, pace, energy, keywords[3], aura, tempo }`。优先用 `personality.profile` 的 15 维 H/M/L，fallback 为 FNV-1a hash |
| Mood | `src/lib/persona-shard/mood.ts` | `calm / spark / shadow`；输入：近 3 天测试活跃度、daily streak、距上次可见天数 |
| Stage | `src/lib/persona-shard/mood.ts` | `dormant / awake / resonant`；输入：是否测过、总宇宙数、7 日内 card 访问次数 |
| Daily Line | `src/lib/persona-shard/daily-line.ts` | `voice × mood` 共 18 个 pool × 3–6 条 ≈ 85 条；`hash(date\|universe\|slug\|voice\|mood) % pool.length` |
| Snapshot | `src/lib/persona-shard/state.ts` | localStorage 快照：card 数据、last-seen、7 日访问日志；新增 `persona-shard-visits-v1` / `persona-shard-last-seen-v1` |
| Hook | `src/lib/persona-shard/use-shard-state.ts` | `useShardState(universeId, slug) → ShardState`；基于 `useSyncExternalStore`，SSR 安全，避开 `react-hooks/set-state-in-effect` |

### 5.2 UI 层

| 组件 | 文件 | 位置 |
|---|---|---|
| `PersonaShardOrb` | `src/components/PersonaShardOrb.tsx` | 会呼吸的圆形碎片 + 今日碎片说 + 语气/节拍/能量标签；框架动画纯 Framer Motion |
| 结果页接入 | `src/components/ResultClosureEngine.tsx` | 新增 "0. Persona Shard" 区块，位于 Universe Switcher 之前 |
| WTF Card 接入 | `src/app/card/CardContent.tsx` | 新增 `ShardPreviewRow`，在"universe"tab 的 badge 网格之上显示第一个已点亮宇宙的碎片预览 |
| Shard 详情页 | `src/app/card/shard/{page,ShardDetailContent}.tsx` | 路径 `/card/shard/?universe=x&slug=y`，query-param 驱动，完全 client side，兼容 `output: 'export'` 静态导出 |

### 5.3 进化规则

```
Dormant → Awake：此宇宙测完 + 至少另测 1 个宇宙（触发"自我对照"）
Awake → Resonant：此宇宙 + 总 ≥3 个宇宙测完 + 7 日内 card 访问 ≥ 2 次
```

```
Calm：默认状态
Spark：近 3 天测过新宇宙 or daily streak ≥ 3
Shadow：7 天无交互（框架为"碎片在等你回来"，不是负面）
```

## 6. 成功度量（Gate · 14 天后）

| 指标 | 当前假设 | 目标 | Gate |
|---|---|---|---|
| 结果页 → Shard 详情页 CTR | n/a | ≥ 25% | 不达则迭代 flavor line |
| 测试后 7 日回访率 | <8% | ≥ 15% | 不达则 Wave 2 推迟 |
| 人均跨宇宙测试数 | ~2 | ≥ 3 | 用于验证 Stage 晋升机制 |
| Shard 详情页 → 分享按钮点击率 | n/a | ≥ 10% | 用于校准 Wave 2 社交化 |

## 7. Roadmap

### Wave 1（已交付 · 本次）
- ✅ Traits / Mood / Stage 确定性派生
- ✅ Orb 呼吸动画 + 今日一句
- ✅ 结果页 + WTF Card 嵌入
- ✅ Shard 详情页（/card/shard/?universe=x&slug=y）

### Wave 2（社交化 · 4–8 周）
- Persona Duet：两枚 Shard 合成相性 SVG（复用 `CptiPairShareCard.tsx` 模式）
- Shard 同款人墙：聚合 `/api/ugc/share` 数据，显示"本周 100+ 人和你一样是 X"（只暴露聚合）
- Shard 分享图生成器：单枚碎片 4:5 图，代替部分现有 `*ShareImageGenerator`

### Wave 3（深度 · 8–12 周）
- Persona Gifting：登录用户互赠 Shard 快照，新表 `persona_shard_gifts`
- Shard Fusion：跨宇宙 2 枚 → 生成"第三宇宙"文本

### ⛔ 明确不做（除非数据推翻）
- LLM 长对话（成本/风控/定位错位）
- 喂食/衰减数值（反产品核心价值观）
- Shard 付费皮肤（Wave 1 不做，看 D7 数据再谈）

## 8. 风险 & 规避

| 风险 | 触发 | 规避 |
|---|---|---|
| Tamagotchi 化 | 加入负状态衰减 | 所有进化**只前进/停留**，Shadow 心绪用"等你回来"而非"快死了"框架 |
| LLM 失控 | 给 Shard 接 chatbot | Wave 1/2 全部确定性内容；Wave 3 若用 LLM，仅**离线预生成 + 人工审核**的扩充 |
| UGC 宇宙质量稀释 | UGC 宇宙自动启用 Shard | MVP 只在**已发布**的 UGC 宇宙启用（依赖现有 admin review 基建） |
| 文案产能 | 更多宇宙上线后需更多 flavor | 当前 18 pool 已能支撑所有宇宙共用；按宇宙扩展文案是 Wave 2 的运营任务 |

## 9. 关键代码索引

- 数据层：[src/lib/persona-shard/](../../src/lib/persona-shard/)
- Orb 组件：[src/components/PersonaShardOrb.tsx](../../src/components/PersonaShardOrb.tsx)
- 结果页接入：[src/components/ResultClosureEngine.tsx](../../src/components/ResultClosureEngine.tsx)
- 档案页接入：[src/app/card/CardContent.tsx](../../src/app/card/CardContent.tsx)（`ShardPreviewRow`）
- Shard 详情：[src/app/card/shard/](../../src/app/card/shard/)

---

**实现方式注记**：
- 全部 client-only + localStorage，**零新后端、零数据库迁移**
- `useSyncExternalStore` 替代 `useEffect(setState, [])` 以满足 `react-hooks/set-state-in-effect` 规则
- `/card/shard/` 用 query-param 而非动态路由，兼容 `next.config.ts` 的 `output: 'export'`
- Traits 对所有宇宙通吃：标准 27-slug 宇宙走 profile 派生；非标准宇宙（first-look/cpti/xpti/mysti/soulti/daily/UGC）走 hash 派生
