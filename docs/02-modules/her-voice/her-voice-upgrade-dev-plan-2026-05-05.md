# Her Voice 升级迭代开发计划

> Module: Her Voice / HERMOSA  
> Status: Engineering Plan  
> Date: 2026-05-05  
> Source strategy: `docs/04-design-growth/growth/her-voice-strategic-upgrade-2026-05-05.md`  
> Owner: Product + Engineering  
> Target route: `/her-voice/`

---

## 1. Sprint Goal

把 Her Voice 从「单一留言墙」升级为可验证的 **Her Voice Commons · 她说共建馆 MVP**：

> 用户可以在站内贡献「一句话 / 一本书 / 一个 AI 问题」，编辑可以在后台按类型策展，前台能展示本周主题与基础资产入口，所有贡献都有授权、署名、治理与埋点基础。

第一轮不追求完整 AI 自动策展，不追求个人档案，也不追求复杂社区互动。先把结构化贡献飞轮跑起来。

---

## 2. Assumptions

- 团队容量按 **1 名主工程 + AI 协作** 估算。
- 迭代节奏按 **2 周一个开发 Sprint** 估算，单 Sprint 可承诺约 **21 story points**，预留 20% buffer。
- Supabase service role 已在生产环境可用；本地未配置时 API 仍需 graceful fallback。
- 需要遵守仓库 `AGENTS.md`：真正写 Next.js 代码前，先阅读 `node_modules/next/dist/docs/` 中与 App Router、Route Handlers、OG Image/ImageResponse 相关的版本文档。
- UI 继续沿用 WTFTI women-first 视觉系统：`Editorial Atelier × 暮光博物笔记 × Cosmic Romance`，不另起一套品牌。

---

## 3. Scope

### In Scope for MVP

- 新增结构化贡献类型：`voice` / `book` / `ai_question` / `concept` / `feedback`。
- 扩展 `hermosa_messages` 数据模型，支持 `kind`、`metadata`、`topic_week`、`consent_to_feature`、`attribution_mode`、`curation_status`、`safety_level`。
- 扩展 `/api/hermosa/messages` GET/POST 合约，兼容旧客户端。
- 升级 `/her-voice/` 首页：主题征集、贡献类型入口、本周数字、三馆入口、精选墙。
- 升级 `/admin/hermosa/`：按贡献类型和策展状态筛选，支持修改精选/策展/安全状态。
- 新增轻页面：`/her-voice/books/`、`/her-voice/ai-lab/`。
- 新增基础埋点：曝光、投稿开始、投稿成功/失败、授权勾选、共鸣、资产入口点击。
- 保留现有 `HermosaInputCard`，第一轮只做兼容和轻量 follow-up，不大规模重写结果页入口。

### Out of Scope for MVP

- 前台 AI 自动生成内容。
- LLM 后台聚类/摘要/标题建议。
- 用户个人「她说档案」。
- 私信、评论、陌生人匹配、群聊。
- 书籍外部 API 标准化。
- 多张集合型壁纸/书单/AI 卡的完整自动生成器。
- 付费、会员、创作者分成。

---

## 4. Architecture Decision

### Decision: Additive migration on `hermosa_messages`

不新建 `hermosa_contributions`，先在现有 `hermosa_messages` 上做 additive columns。

理由：

- 现有 API、主墙、结果页入口、后台、RLS 都围绕 `hermosa_messages`。
- MVP 的核心是验证贡献类型与策展链路，不需要一开始拆双表。
- Additive columns 对现有读写兼容，回滚成本较低。

后续触发拆表的条件：

- `metadata` 查询变复杂，需要独立书籍/AI 问题索引。
- 资产发布系统需要多对多关系。
- 用户档案需要贡献历史与收藏关系。

---

## 5. Data Contract

### Migration

File:

- `db/migrations/2026-05-05_hermosa_commons_upgrade.sql`

Add columns:

| Column | Type | Default | Notes |
|---|---|---|---|
| `kind` | `text` | `'voice'` | `voice/book/ai_question/concept/feedback` |
| `metadata` | `jsonb` | `'{}'::jsonb` | book title/author, AI scenario/tool, concept key |
| `topic_week` | `text` | `null` | `YYYY-Www` |
| `curation_status` | `text` | `'new'` | `new/shortlisted/selected/published/rejected` |
| `consent_to_feature` | `boolean` | `false` | whether content can enter public assets |
| `attribution_mode` | `text` | `'anonymous'` | `anonymous/signature/profile` |
| `safety_level` | `text` | `'safe'` | `safe/review/blocked` |

Indexes:

- `(kind, created_at desc)` where published and not flagged.
- `(topic_week, kind, created_at desc)` where published and not flagged.
- `(curation_status, created_at desc)`.
- GIN index on `metadata` only if needed after MVP; defer unless query plans require it.

Validation constraints:

- `kind in ('voice','book','ai_question','concept','feedback')`
- `curation_status in ('new','shortlisted','selected','published','rejected')`
- `attribution_mode in ('anonymous','signature','profile')`
- `safety_level in ('safe','review','blocked')`

### TypeScript Contract

File:

- `src/lib/hermosa/tags.ts`

Add:

- `HERMOSA_KINDS`
- `HERMOSA_KIND_LABELS`
- `HERMOSA_KIND_HINTS`
- `isHermosaKind`
- `sanitizeContributionMetadata(kind, input)`

Metadata shape:

```ts
type HermosaContributionMetadata =
  | { bookTitle?: string; bookAuthor?: string; quote?: string; why?: string }
  | { aiScenario?: string; aiQuestion?: string; aiTool?: string; prompt?: string }
  | { conceptName?: string; question?: string; example?: string }
  | Record<string, never>;
```

Sanitization caps:

- `bookTitle`: 80 chars
- `bookAuthor`: 60 chars
- `quote`: 120 chars
- `why`: 180 chars
- `aiScenario`: 80 chars
- `aiQuestion`: 180 chars
- `prompt`: 300 chars
- `conceptName`: 60 chars

---

## 6. User Stories

### HV-01 Data Foundation

As engineering, I need Her Voice contributions to store type, metadata, consent, and curation state so that future asset generation can be built on durable structured data.

Acceptance criteria:

- Migration is additive and safe to re-run.
- Existing rows behave as `kind='voice'`.
- Existing `/her-voice/` and result-page input still work without passing new fields.
- New constraints reject invalid enum values.
- `db:schema-smoke` still passes or documents missing env blocker.

Estimate: 3 pts  
Dependencies: none  
Verification: migration review + API smoke with old payload and new payload.

### HV-02 Messages API Contract Upgrade

As a frontend caller, I can submit a contribution with `kind`, `metadata`, `topic_week`, `consent_to_feature`, and `attribution_mode`.

Acceptance criteria:

- `POST /api/hermosa/messages` accepts old payloads unchanged.
- New payloads are sanitized by kind.
- `GET /api/hermosa/messages?kind=book&topic_week=2026-W18` filters correctly.
- Blocked or unsafe entries are not shown publicly.
- Rate limit behavior remains 3 submissions/hour per client hash.
- Fallback response when Supabase is missing includes new fields.

Estimate: 4 pts  
Dependencies: HV-01  
Verification: route handler unit-style smoke via `curl` or local browser; TypeScript/lint.

### HV-03 Her Voice Commons Homepage

As a visitor, I can understand Her Voice is now a women-first commons, see the current theme, and choose what kind of contribution I want to make.

Acceptance criteria:

- Hero copy changes from "声音广场" to "女性文字、书架与 AI 练习共建馆" without losing HERMOSA identity.
- Above the fold includes:
  - current weekly theme,
  - three contribution entry buttons: 一句话 / 一本书 / 一个 AI 问题,
  - weekly counters,
  - We Heard You link.
- Form changes based on selected kind:
  - `voice`: textarea + tags + signature + consent.
  - `book`: book title + author + why/quote + signature + consent.
  - `ai_question`: scenario + question + optional tool + signature + consent.
- Existing universe/tag filters remain available, but move below the contribution module.
- Empty and loading states remain polished on mobile and desktop.

Estimate: 5 pts  
Dependencies: HV-02  
Verification: browser smoke `/her-voice/` desktop/mobile; submit each kind.

### HV-04 Admin Curation Upgrade

As an editor, I can filter Her Voice submissions by kind, safety, consent, and curation status so that I can prepare weekly assets.

Acceptance criteria:

- Admin GET includes new fields and grouped totals by kind/status.
- Admin UI has filters:
  - all,
  - kind,
  - curation status,
  - safety level,
  - consented only.
- Admin PATCH can update:
  - `curation_status`,
  - `safety_level`,
  - `consent_to_feature`,
  - existing `is_featured`, `is_published`, `flagged`, `status`.
- Book/AI metadata appears in each row.
- "Preview card" continues to work for voice contributions.

Estimate: 4 pts  
Dependencies: HV-01, HV-02  
Verification: admin local smoke with token if available; otherwise type/lint + mock UI path review.

### HV-05 Books and AI Lab Lightweight Pages

As a visitor from XHS or Her Voice, I can open a lightweight page for the shared book shelf or AI question lab.

Acceptance criteria:

- New route `/her-voice/books/` lists published, safe `kind='book'` contributions.
- New route `/her-voice/ai-lab/` lists published, safe `kind='ai_question'` contributions.
- Both pages show:
  - current theme,
  - contribution CTA back to `/her-voice/`,
  - count summary,
  - recent selected/featured entries first.
- SEO metadata is present.
- Pages gracefully show empty state when Supabase is unavailable.

Estimate: 3 pts  
Dependencies: HV-02  
Verification: route render smoke; build/lint.

### HV-06 Result Page Follow-Up

As a user who just submitted a voice from a test result page, I get a low-friction follow-up to add a book or AI question without overwhelming the result page.

Acceptance criteria:

- Existing `HermosaInputCard` voice submission still works.
- After successful submission, show two secondary CTAs:
  - `推荐一本书`
  - `写一个 AI 问题`
- CTAs deep-link to `/her-voice/?kind=book` or `/her-voice/?kind=ai_question` with optional universe/slug query.
- Do not add full book/AI forms into every result page in MVP.

Estimate: 2 pts  
Dependencies: HV-03  
Verification: result page smoke where `HermosaInputCard` is mounted.

### HV-07 Analytics

As product, I can measure whether structured Her Voice contributions are working.

Acceptance criteria:

- Add `her_voice` to product event module types and API whitelist.
- Client events:
  - `her_voice_view`
  - `her_voice_kind_select`
  - `her_voice_submit_start`
  - `her_voice_submit_success`
  - `her_voice_submit_error`
  - `her_voice_consent_toggle`
  - `her_voice_echo`
  - `her_voice_asset_click`
- Events include small props: `kind`, `topic_week`, `universe`, `has_consent`.
- Tracking never blocks submission UX.

Estimate: 2 pts  
Dependencies: HV-03  
Verification: network inspection or Supabase events smoke if env available.

### HV-08 Visual Asset Prep, Not Full Generator

As an editor, I need enough structured data and manually usable links to create the first XHS asset package without waiting for full automation.

Acceptance criteria:

- Admin can filter consented + selected entries for a topic week.
- Admin row exposes text and metadata in a copy-friendly format.
- Strategy doc links are included in admin notes or docs, not necessarily in UI.
- Full multi-card OG generator is explicitly deferred to Sprint 2.

Estimate: 1 pt  
Dependencies: HV-04  
Verification: admin curation path walkthrough.

---

## 7. Sprint Plan

### Sprint 1: Commons MVP Foundation

Duration: 2 weeks  
Capacity: 21 pts  
Committed: 21 pts  
Buffer: built into estimates; avoid adding AI curation here.

| Story | Points | Owner | Dependencies |
|---|---:|---|---|
| HV-01 Data Foundation | 3 | Engineering | none |
| HV-02 Messages API Contract Upgrade | 4 | Engineering | HV-01 |
| HV-03 Her Voice Commons Homepage | 5 | Frontend | HV-02 |
| HV-04 Admin Curation Upgrade | 4 | Full-stack | HV-01, HV-02 |
| HV-05 Books and AI Lab Lightweight Pages | 3 | Frontend | HV-02 |
| HV-07 Analytics | 2 | Frontend/API | HV-03 |

Sprint 1 Definition of Done:

- User can submit voice/book/AI question from `/her-voice/`.
- Admin can filter and curate those submissions.
- Books and AI Lab pages render real data or empty states.
- Core events are emitted.
- `pnpm lint` passes.
- Exact route smoke checks completed for `/her-voice/`, `/her-voice/books/`, `/her-voice/ai-lab/`, `/admin/hermosa/`.

### Sprint 2: Result Entry + First Asset Workflow

Duration: 2 weeks  
Capacity: 21 pts  
Committed target: 16-18 pts, keep extra buffer for design and OG rendering.

Candidate stories:

| Story | Points | Notes |
|---|---:|---|
| HV-06 Result Page Follow-Up | 2 | Deep-link result users into structured commons |
| HV-08 Visual Asset Prep | 1 | Copy-friendly selected lists |
| HV-09 Collection OG Routes | 5 | `/api/hermosa/artifact/books` and `/api/hermosa/artifact/voices` |
| HV-10 Weekly Topic Config | 3 | Static config in `src/lib/hermosa/topics.ts` before DB config |
| HV-11 Consent Review Flow | 4 | selected -> published guardrails |
| HV-12 XHS Landing Pages | 4 | `/her-voice/wallpapers/[week]`, `/her-voice/books/[week]` |

Sprint 2 Definition of Done:

- Result pages can send users to structured Her Voice follow-up.
- Editor can manually produce first XHS asset package.
- At least one collection share image route works.
- Weekly topic pages can become XHS landing destinations.

### Sprint 3: AI-Assisted Curation, Internal Only

Do not start until Sprint 1 metrics show >= 100 valid contributions or editor workload is clearly high.

Candidate stories:

- Internal clustering script for a topic week.
- AI-generated label suggestions with human review.
- AI bias checklist helper.
- Admin "suggest summary" action.
- Never publish AI output directly without editor confirmation.

### Sprint 4: Personal Archive and Contributor Loop

Do not start until contribution replay is proven.

Candidate stories:

- My Her Voice archive.
- Contribution badges.
- "Your words were selected" notification.
- Saved books / saved AI cards.
- Creator-hosted themes.

---

## 8. Critical Path

```
Migration
  -> API contract
    -> Homepage forms
      -> Analytics
      -> Books / AI Lab pages
    -> Admin curation
      -> First XHS asset workflow
```

Blockers:

- If migration is delayed, homepage can still be redesigned visually, but structured book/AI submissions cannot be trusted.
- If API sanitization is weak, public pages and asset workflow should not launch.
- If admin curation is missing, do not publish public book/AI pages beyond safe empty/demo states.

---

## 9. Event Taxonomy

Module: `her_voice`

| Event | Trigger | Required props |
|---|---|---|
| `her_voice_view` | `/her-voice/` first visible | `topic_week` |
| `her_voice_kind_select` | user selects contribution type | `kind` |
| `her_voice_submit_start` | submit button click | `kind`, `topic_week`, `has_consent` |
| `her_voice_submit_success` | API success | `kind`, `topic_week`, `has_consent` |
| `her_voice_submit_error` | API error | `kind`, `error` |
| `her_voice_consent_toggle` | consent checkbox change | `kind`, `value` |
| `her_voice_echo` | echo button click | `kind`, `universe` |
| `her_voice_asset_click` | books/AI/wallpaper CTA | `target`, `topic_week` |

North-star proxy for Sprint 1:

```text
structured_contribution_rate =
  her_voice_submit_success(kind in book, ai_question, concept)
  / her_voice_view
```

---

## 10. QA Matrix

### Functional

- Old voice submission payload still works.
- New voice submission with consent works.
- Book submission with title only works.
- Book submission over length is clamped.
- AI question submission with scenario + question works.
- Invalid `kind` is rejected.
- Rate limit still returns `429 rate_limited`.
- Flagged content is not publicly listed.
- Admin PATCH updates curation state.
- Public pages hide `safety_level='blocked'`.

### UI

- `/her-voice/` desktop 1440px.
- `/her-voice/` mobile 390px.
- `/her-voice/books/` empty state and populated state.
- `/her-voice/ai-lab/` empty state and populated state.
- `/admin/hermosa/` dense rows fit without text overlap.
- Buttons and segmented controls have stable height.

### Accessibility

- Contribution kind selector is keyboard reachable.
- Textarea/input labels are programmatically associated.
- Consent checkbox has clear label.
- Error messages are visible and specific.
- Reduced motion has no required animation.

### Data Safety

- No secret/token appears in logs or user-facing output.
- Metadata is sanitized before insert.
- Prompt fields are length-capped.
- Consent defaults to false.
- Attribution defaults to anonymous.

### Verification Commands

Use the narrowest checks first:

```bash
pnpm lint
pnpm db:schema-smoke
pnpm build
```

If Supabase env is unavailable locally, record that blocker and verify API fallback behavior.

---

## 11. Implementation Notes

### Files likely touched in Sprint 1

Data/API:

- `db/migrations/2026-05-05_hermosa_commons_upgrade.sql`
- `src/lib/hermosa/tags.ts`
- `src/app/api/hermosa/messages/route.ts`
- `src/app/api/hermosa/admin/route.ts`

Frontend:

- `src/app/her-voice/HerVoiceContent.tsx`
- `src/app/her-voice/page.tsx`
- `src/app/her-voice/books/page.tsx`
- `src/app/her-voice/ai-lab/page.tsx`
- `src/app/admin/hermosa/AdminHermosaContent.tsx`

Analytics:

- `src/lib/analytics/product-events.ts`
- `src/app/api/events/ingest/route.ts`

Optional extraction if `HerVoiceContent.tsx` grows too large:

- `src/components/hermosa/HermosaContributionForm.tsx`
- `src/components/hermosa/HermosaWeeklyStats.tsx`
- `src/components/hermosa/HermosaWallCard.tsx`

### Design guardrails

- No card-in-card layout.
- Use segmented controls for kind selection.
- Use restrained editorial type, not oversized hero type inside compact panels.
- Keep cards radius <= 8px unless existing local pattern requires otherwise.
- Use rose/gold accents sparingly; avoid generic cosmic gradient surfaces.
- Do not use in-app explanatory text about how to use the product beyond necessary labels.

---

## 12. Risks

| Risk | Level | Mitigation |
|---|---|---|
| Schema expansion breaks old clients | High | additive defaults; old payload smoke before UI changes |
| Metadata becomes messy fast | Medium | strict sanitizer by kind; no arbitrary nested data in MVP |
| Consent UX reduces submissions | Medium | default anonymous, consent optional; track consent rate |
| Admin complexity grows too much | Medium | filters first, no bulk workflows in Sprint 1 |
| AI promise appears before AI exists | Medium | copy says "AI 练习 / AI 问题", not "AI 自动整理" until Sprint 3 |
| Build fails on Next.js 16 route behavior | Medium | read local Next docs before code changes; keep route handlers simple |
| XHS assets need more design polish than planned | Medium | Sprint 1 only prepares data; full OG asset generator is Sprint 2 |

---

## 13. Release Gate

Do not release Sprint 1 publicly unless all are true:

- `pnpm lint` passes.
- `/her-voice/` can submit all three MVP kinds.
- Admin can hide/flag/block unsafe content.
- Public pages exclude flagged/blocked/unpublished rows.
- Consent defaults are safe.
- Mobile layout has no overlapping controls.
- Product can see at least local event dispatch for submit success/error.

Proceed / refine decision:

- **Proceed** if structured submissions work and admin curation is usable.
- **Refine** if UI is good but admin curation is missing.
- **Defer public launch** if consent/safety defaults are not finished.

