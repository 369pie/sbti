---
status: active
owner: perf-wg
last-reviewed: 2026-04-18
tags: [performance, audit, frontend, backend]
---

# WTFTI 平台性能审查 · 2026-04-18

> 距离上一次正式审查（`formal-performance-audit-2026-04-13` + follow-up）已新增 mysti / soulti / xpti / herti / creator / 多 UGC 宇宙等若干模块。本次基于当前仓库静态盘点，定位"接下来 1–2 周必须先做的性能修补"。
>
> **没有跑全量 Lighthouse**，只做了代码层的盘点。落地前请按"验证步骤"补充实测数字。

## 0. 关键背景指标

| 指标 | 当前值 | 备注 |
| --- | --- | --- |
| 路由数（`page.tsx` / `layout.tsx`） | **134** | 较 04-13 翻倍以上 |
| `src/components/*` 顶层组件 | ~100 | 含 30+ ShareImageGenerator |
| 显式导入 `framer-motion` / `recharts` / `html-to-image` / `qrcode` 的源文件 | **76** | 几乎全部为 `'use client'` |
| 真正用 `next/dynamic` 拆包的文件 | **2**（`ShardSection`、`ResultClosureEngine`） | ★ 拆包面严重偏小 |
| `public/images/` 总量 | **871 MB / 1749 文件** | `types/` 占 843 MB，488 张 >500 KB |
| `next.config.ts` | **`output:'export'` 已下线**，`images.unoptimized: true` 仍开 | 可启用 `next/image` 优化 |
| API 路由数（`/api/**/route.ts`） | 50+ | 全部走 Node runtime（Supabase SSR） |
| 仅 1 个 GET 路由设了正向缓存 | `/api/identify/preview` (`s-maxage=60`) | 其它 GET 默认无缓存 |
| `app/layout.tsx` 加载 Google Fonts | **5 套**（含 4 个权重） | 多家族字体 + 多 weight |
| `Navigation.tsx` 行数 | **671** | 全站常驻 client bundle |

## 1. 前端 · 高 ROI 修补（按 ROI 排序）

### P0-1. `next/dynamic` 严重欠用，结果页二次代码分割
- 现状：76 个文件直接 `import { motion } from 'framer-motion'` / `recharts` / `html-to-image`。`ResultContent`、`MystiResultContent`、`IdentifyResultContent`、`CreatorResultContent`、`BantiResultContent`、`WtftiResultContent`、`LoveResultContent`、`SoultiResultContent`、`XptiResultContent`、`MystiPaywall`、`CardContent`、`ShareTemplatesContent` 等都是 300–1000 行级的 `'use client'` 模块。
- 上次审查只针对标准 result 做了懒加载（chart + share generator）。**新增的 8 套结果页 / mysti / soulti / xpti / creator UGC 都没有应用同一模式**。
- 行动：
  1. 抽公共 hook `useDeferredImport()` 或沿用既有 `dynamic(() => import(...), { ssr: false, loading: ... })`，把 **每个 ResultContent 内的 ShareImageGenerator + DimensionChart** 都迁移成进入"分享/向下滚动"后再 hydrate。
  2. `MystiResultContent`（998 行）拆成 hero + below-the-fold 两段，下半段 `dynamic(..., { loading: () => <Skeleton/> })`。
  3. Paywall（`MystiPaywall` 含 framer-motion）只在 `unlocked === false` 时渲染；当前对 hydrated 用户也会拉 motion bundle，应改用 dynamic。
- 验证：`pnpm build` 后对比 `.next/analyze`（建议接 `@next/bundle-analyzer`）；对每个结果页的 First Load JS 设阈值 ≤ **300 KB gzipped**。

### P0-2. 顶层 `<Navigation>` 671 行 + Supabase client 永久挂载
- `Navigation.tsx` 静态导入 `getLiveUniverses` 全集 + 三套下拉菜单 + 多 emoji/desc，全部进每个页面的初始 bundle。
- `AuthProvider` 在所有页面顶层立即 `createBrowserSupabaseClient()`，导致 `@supabase/supabase-js` 在 home / types / xpti landing 等"匿名也能用"的页面也立即下载（独立 chunk 也 ≥ 70 KB gzipped）。
- 行动：
  1. Navigation 下拉部分用 `next/dynamic({ ssr: true })`，仅 hover/点击才加载子菜单详情数据。
  2. `AuthProvider` 改为 lazy：用 `dynamic` 套一层，仅在带登录态的子树（`/me`, `/creator`, `/identify`, `/cpti`, `/mysti`）真正包裹；公共匿名页 fallback 为静态 context。
  3. 把 `getLiveUniverses()` 静态结果改为构建期生成（`scripts/` 输出 JSON，组件 import JSON 即可），避免运行时拉所有 universe 描述。

### P0-3. Google Fonts 5 家族
- `Noto_Serif_SC` + `Noto_Sans_SC` + `Cormorant_Garamond` + `Fraunces` + `JetBrains_Mono`，每个 4–5 weight，带斜体。Next 字体优化虽内联，但 CSS variable + 多斜体仍会触发多个 woff2，对低端机移动 LCP 影响明显。
- 行动：审一下 `globals.css` 实际命中的 weight 集合（`grep -E "font-(serif|sans|mono|cormorant|fraunces)"`）；保留 2–3 weight，关掉不需要的 italic + Cormorant **或** Fraunces（二选一）。同时 `preload: true` 仅留正文家族。

### P1-4. 全局 CSS 1511 行，单一 `globals.css`
- 没有按宇宙拆分；任何路由都拉全量 CSS。Tailwind v4 + 大量自定义工具类。
- 行动：按宇宙在 `app/{universe}/layout.tsx` 内挂主题级 CSS module（`*.module.css`），把 `mysti-*` / `soulti-*` / `xpti-*` 主题色与 keyframes 移出 `globals.css`，仅保留 reset + 全局排版。

### P1-5. 站内 `<Image unoptimized>` + 488 张 >500 KB 原图
- `images.unoptimized: true` 还开着（历史是为了 `output: 'export'`，但已下线）。
- 488 张大于 500 KB 的 PNG 全靠 `scripts/generate-medium-images.mjs` + thumbs 兜底；任何新模块只要写漏 thumb 都会 regress。
- 行动：
  1. 把 `next.config.ts` 的 `images.unoptimized` 改为 `false`，让 Vercel image optimization 真正生效（`output:'export'` 已不在）。
  2. 升级 `scripts/audit-dirty-types-images.mjs` 加 CI 红线：`/types` 下任意 PNG > 400 KB 又没有同名 `.webp` 时构建失败。
  3. `qr-wechat.png` (732K) / `qr-qq.png` (768K) 转 webp，目前若进首屏 QR 卡片是非常昂贵的额外字节。

### P1-6. 30+ `*ShareImageGenerator` 静态导入污染结果页
- 上次审查记录："Share-image generators must not prewarm full-size character images on mount"。新增的 mysti / soulti / xpti / creator share 组件没有沿用这条规则。
- 行动：在 `src/components/ShareImageGenerator.tsx` 的 wrapper 里再加一层 `dynamic(() => import('./XxxShareImageGenerator'), { ssr: false })`，并在父组件用 `useState(false)` + 点击"生成分享图"按钮才设为 `true`。统一 review 所有 `*ShareImageGenerator.tsx`。

### P2-7. `useEffect` 内 `setState` & dom 测量
- `react-hooks/set-state-in-effect` 在 lint 中开启，但仍存在大量 `useEffect(() => setX(...))`（gallery、paywall、navigation）。这会触发额外的 commit。
- 行动：随上述拆包顺手把它们改成 `useMemo` / lazy `useState` 初始化（已在 user memory 中记录的常见 gotcha）。

## 2. 后端 / API · 高 ROI 修补

### P0-A. GET 接口几乎不缓存
- 50+ 路由里只有 `/api/identify/preview` 设了 `s-maxage=60`。其余 GET（`/api/cpti/leaderboards`、`/api/creator/leaderboard`、`/api/creator/universes`, `/api/me/summary`, `/api/cpti/me/collection` 等）走 Node + Supabase + 默认 `Cache-Control` 为空。
- 行动：
  1. **公共 GET**（leaderboard, universes 列表, types/creator 模板, mysti/themes 等）加 `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`。
  2. **私有 GET**（`me/*`, `assets/me`, `identify/me/*`）维持 `private, no-store` ✅。
  3. 用 Next 16 的 `unstable_cache` 包 supabase 查询，或加 `revalidate = 60` segment 配置。

### P0-B. Supabase client 每次请求都 `createServerSupabaseClient()`
- `src/lib/supabase/server.ts` 在每条 API route 都 `await createServerSupabaseClient()`，再做 `auth.getUser()` 一次 RTT。`proxy.ts` 已经在 edge 层调过一次 `updateSession`，等于每次请求两次 auth roundtrip。
- 行动：
  1. 在 `proxy.ts` 把 user/session 写到 request header（`x-sb-user-id`），下游 route 直接读 header，避免重复 `getUser()`。
  2. 对完全公共的 GET（leaderboards/universes/types），不要进 supabase 读 anon-only 表，改走 `createSupabaseAnonClient()`（不带 cookie 解析）。

### P0-C. `proxy.ts` matcher 太激进
- 当前 matcher 排除 `_next/static`, `_next/image`, 静态图，但**没有排除 `_next/data`、API 静态资源、字体**。在结果页 hydrate 时所有 `/api/*` 请求都会再走一遍 `updateSession` → supabase auth refresh。
- 行动：在 matcher 里追加 `'((?!api/auth|api/.*public).*)'` 或者在 `updateSession` 内根据 path 早退（已知公共 GET 直接 return）。

### P1-D. Mysti 支付 / 订阅链路无幂等 + 无速率限制
- `/api/mysti/payment/create` `/notify` `/verify` 都没看到 idempotency key 也没 rate-limit；恶意脚本可通过反复请求拖慢支付提供方回调链路。
- 行动：
  1. 入参校验 + Vercel KV 实现 5s 内 同一 deviceId/IP 5 次为上限。
  2. `notify` 路由强制鉴权回源签名 + 幂等表（已在 mysti payment-stub-hardening memory 中提到，落到代码）。

### P1-E. CPTI / creator GET 路由可能 N+1
- `/api/cpti/me/collection` `/api/creator/universes` 等列表型接口没有显示 `select(..., { count: 'exact' })` 限制，也没分页参数。
- 行动：增加 `?limit=20&cursor=` 强制分页，DB 侧补 `index_creator_universes_owner_status` 类索引（详细 schema 需查 supabase migrations，单独工单）。

### P2-F. RunningHub 图片生成走前端触发
- `scripts/runninghub-*.mjs` 在 `/api/creator/generate-image/route.ts` 内被调用？需要确认是否走 background queue，否则单请求时延高且占用 Node lambda。
- 行动：把生图请求改为入队（Vercel Queues / Supabase functions），前端轮询状态；当前需要进一步确认实现。

## 3. 监测与基线（必须先于改动落地）

为了避免再出现"上线后才发现回归"，建议在 **下次合并任意 result 页改动之前** 做：

1. **Bundle Analyzer**：
   ```sh
   pnpm add -D @next/bundle-analyzer
   ```
   在 `next.config.ts` 包一层；CI 输出每条路由的 First Load JS。
2. **Lighthouse CI**：脚本 `scripts/lhci-core.mjs` 跑 5 个核心路径
   - `/`
   - `/result/ctrl/`
   - `/wtfti/work/result/juan/`
   - `/mysti/result/drama/`
   - `/xpti/result/elastic/`
   - 阈值（移动端）：performance ≥ 80，LCP ≤ 4.5s，TBT ≤ 300ms。
3. **Web Vitals 上报**：`@vercel/analytics` 已装，加 `useReportWebVitals` 把 LCP/INP/CLS 打到 supabase `web_vitals` 表，按路由聚合每周回看。
4. **API 监控**：在 `proxy.ts` / 关键 GET 路由前后加 `console.timeEnd` + 上报到 Vercel Logs，关注 p95。

## 4. 优先级与排期建议

| 优先级 | 工作项 | 预估 | 谁先做 |
| --- | --- | --- | --- |
| P0 | bundle analyzer + Lighthouse 基线 | 0.5d | 平台 |
| P0 | 5 套结果页统一 dynamic 拆包 | 1.5d | 模块 owner |
| P0 | `Navigation` / `AuthProvider` 懒挂 | 1d | 平台 |
| P0 | Google Fonts 缩成 2 家族 | 0.5d | 设计 + 平台 |
| P0 | 公共 GET API 加 `s-maxage` | 0.5d | 后端 |
| P0 | proxy matcher 收敛 + 复用 user header | 0.5d | 后端 |
| P1 | `images.unoptimized=false` + 488 张大图 webp | 1d | 平台 |
| P1 | ShareImageGenerator 全部 lazy | 1d | 模块 owner |
| P1 | mysti 支付幂等 / 限流 | 1d | mysti owner |
| P1 | `globals.css` 拆主题模块 | 1.5d | 设计系统 |
| P2 | 列表 API 分页 + 索引 | 1d | 后端 |
| P2 | RunningHub 入队改造 | 2d | 创作平台 |

## 5. 后续

- 落地后回填实测数字到本文末尾的"基线 vs 复测"表（仿照 04-13 follow-up 文档）。
- 同步更新 `/memories/repo/formal-performance-audit-2026-04-13.md` 链 / 新增 `formal-performance-audit-2026-04-18.md` 短记。
- 任意新增宇宙 / 结果页前，先把 P0-1（dynamic 拆包模板）和 P1-6（lazy share generator）写进 `docs/02-modules/README.md` 的 checklist。
