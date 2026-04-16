# SoulTI 付费功能预留清单

> Owner: Product + Monetization
> Status: Active Spec
> Priority: P1
> Last Updated: 2026-04-16
> Review Cadence: Before payment or entitlement implementation
> Next Decision: Decide which SoulTI report sections stay permanently free versus paid

> 最后更新: 2026-04-14
> 状态: **所有内容当前免费开放**，付费入口预留但未接入支付

---

## 1. 付费定价架构

| 层级 | 内容 | 建议定价 | 状态 |
|------|------|---------|------|
| **免费层** | 单层人格结果 + 五轴概览 + 灵魂共振卡 + 分享图 + 三面镜子概览 | ¥0 | ✅ 已上线 |
| **深度镜像** | 轴间交叉解读 + 修复处方 + 灵魂长信 + 每周镜像 | ¥9.9 | ⚠️ 内容已开发，暂免费开放 |
| **灵魂长信升级** | 32 种人格的 2000 字定制长信（当前为 4 个模板覆盖全部人格） | ¥19.9（含深度镜像） | 📋 内容待扩展 |

---

## 2. 需要付费门控的页面/区块

### 2.1 深度镜像报告页 `/soulti/report/[type]/`

**文件**: `src/app/soulti/report/[type]/SoultiDeepReportContent.tsx`

当前状态: 所有内容免费展示。代码中有 `⚠️ PAYMENT GATE` 注释标记需要门控的区块：

| Section | 说明 | 门控方式 |
|---------|------|---------|
| Section 1: Three Mirrors | 三面镜子概览 | **保持免费** — 这是转化钩子 |
| **Section 2: Axis Cross** | 轴间交叉解读（3 组） | 🔒 付费后解锁 |
| **Section 3: Repair** | 修复处方（6 条策略） | 🔒 付费后解锁 |
| **Section 4: Soul Letter** | 写给你的长信 | 🔒 付费后解锁 |
| Section 5: Deep Resonance | 灵魂共振深度版 | 可选：免费或付费 |
| Section 6: Weekly Mirror | 每周镜像回看 | **保持免费** — 复访引擎 |

### 2.2 结果页毛玻璃 Teaser

**文件**: `src/app/soulti/result/[type]/SoultiResultContent.tsx`

当前状态: CTA 按钮直接链接到 `/soulti/report/[type]/`（免费访问）。

付费接入后改为:
1. 检查 localStorage 中的付费 token
2. 有 token → 直接跳转报告页
3. 无 token → 跳转支付流程 → 回调写入 token → 重定向报告页

---

## 3. 付费接入实施方案

### 方案 A: 跳转支付（验证期，推荐先行）

- **平台**: 爱发电 / 小报童 / Notion 会员
- **流程**: 点击 CTA → 跳转外部支付页 → 手动发放解锁码 → 用户输入码解锁
- **开发量**: ~0.5 天（加一个解锁码输入弹窗）
- **优点**: 0 后端成本
- **缺点**: 体验断裂，需手动发码

### 方案 B: 微信小程序内付费（正式期）

- **流程**: 小程序 webview 内嵌报告页 → 小程序支付 → JS Bridge 回传 token
- **开发量**: ~3-5 天
- **优点**: 原生体验，自动完成
- **缺点**: 需注册小程序、接入微信支付

### 方案 C: Stripe / Lemon Squeezy（出海场景）

- **流程**: 点击 CTA → Stripe Checkout → webhook 写入 token
- **开发量**: ~2 天（需后端或 Vercel Edge Function）
- **优点**: 全球支付
- **缺点**: 国内用户不便

---

## 4. 埋点数据收集

当前已部署的埋点（可用于验证付费需求）:

### 4.1 localStorage 埋点

```javascript
// 查看点击数据
JSON.parse(localStorage.getItem('soulti-deep-mirror-clicks') || '[]')
// 返回: [{ t: timestamp, slug: 'spring' }, ...]
```

### 4.2 GTM dataLayer 事件

```javascript
// 事件名: soulti_deep_mirror_click
// 属性:
//   personality_slug: string
//   personality_code: string
```

接入 GA4 后可在 Events 报表中查看:
- 点击率 = `soulti_deep_mirror_click` / 结果页 PV
- 高频 slug = 哪些人格的用户最想看深度报告
- 时段分布 = 深夜点击是否显著高于白天

---

## 5. 内容扩展计划

### 已完成

| 内容 | 数量 | 文件 |
|------|------|------|
| 轴间交叉解读 | 12 组（3 对轴 × 4 组合） | `src/lib/soulti/deep-report.ts` |
| 修复处方 | 2 类 × 6 策略 = 12 条 | `src/lib/soulti/deep-report.ts` |
| 灵魂长信 | 4 封（按 J3×J5 覆盖全 32 人格） | `src/lib/soulti/deep-report.ts` |
| 每周镜像提示 | 12 条（按周循环） | `src/lib/soulti/deep-report.ts` |

### 待扩展（付费正式上线前）

| 内容 | 计划数量 | 优先级 |
|------|---------|--------|
| 灵魂长信 → 每种人格独立信 | 32 封 × 2000 字 | P1 |
| 修复处方 → 按全五轴分化 | 32 种个性化处方 | P2 |
| 关系模式深度报告 | 32 种 | P2 |
| 季度重测对比模板 | 1 套 | P3 |

---

## 6. 技术实施 Checklist

付费正式接入时的开发清单:

- [ ] 选定支付方案（A/B/C）
- [ ] 实现支付 token 存储（localStorage + 可选后端验证）
- [ ] `SoultiDeepReportContent.tsx` 中 Section 2/3/4 包裹 PaymentGate 组件
- [ ] PaymentGate 组件：检查 token → 有则渲染内容 → 无则显示毛玻璃 + 支付 CTA
- [ ] 结果页 teaser 按钮逻辑：有 token → 直链报告 / 无 token → 触发支付
- [ ] 支付成功回调 → 写入 token → 重定向报告页
- [ ] A/B 测试：免费 vs 付费的转化漏斗数据
- [ ] 退款策略文案（放在购买页底部）
