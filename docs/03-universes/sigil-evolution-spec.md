# Voice Sigil Evolution Spec

> Owner: Product Strategy + Design + Frontend
> Status: Active Spec（红线效力范围已收缩，见下）
> Priority: P0
> Last Updated: 2026-08-16
> Review Cadence: Weekly until Q3 Sigil scope is locked
> Next Decision: Decide whether high-order recognition should live on the base sigil row or in a separate sigil_events ledger

> **2026-08-16 founder 裁决**：本规范五条红线的效力范围收缩至 **Voice Sigil 社区荣誉系统本身**，不再约束站内其他养成/成长类系统（星灵养成见 `docs/01-strategy/star-spirit-nurture-strategy-2026-08.md`，其护栏为该提案 §2.1 修订版）。收缩理由：红线立项于 2026-05 的反 leaderboard 语境，后被过度外推为全站反游戏化约束；产品吸引力优先（founder 口径 2026-08-16），数字/进度/公开展示机制按各系统的目标单独裁决。

This spec defines how Q3 extends Voice Sigil without turning it into a leaderboard.

## 1. What Already Exists

- `src/lib/sigil/generate.ts` already ships the **base orbit skeleton**.
- Base `level 0..4` is triggered by cumulative utterance milestones: `1 / 7 / 27 / 81 / 243`.
- `public.hermosa_sigils` already persists `sigil_hash / level / palette / orbit_layers / message_count`.

Q3 does **not** replace this base system. Q3 adds a second layer of meaning: **contextual recognition motifs**.

## 2. Design Intent

Voice Sigil should feel like:

- a trace of being accompanied
- an editorial mark of having written with others
- a private symbol that becomes legible only in the right context

It must not feel like:

- a score
- a rank
- a streak trap
- social capital that can be compared across users

## 3. Non-Negotiable Red Lines

1. Never show numeric levels, points, percentiles, total counts, or countdown-to-next-unlock UI.
2. Never allow sorting, filtering, or search by Sigil honor state.
3. Never display contextual honors outside the context where they were earned.
4. Never tie Sigil evolution to payment, subscription tier, or purchase amount.
5. Never create a generic public profile page whose primary job is to showcase Sigil status.

## 4. Two-Layer Model

### 4.1 Base Orbit Skeleton

The base skeleton remains exactly as it is today.

| Base field | Meaning | Source |
|---|---|---|
| `level` | 0..4 orbit depth | existing `hermosa_sigils.level` |
| `palette` | color family | existing deterministic hash |
| `orbit_layers` | rendered ellipse count | existing `level + 1` |

### 4.2 Contextual Recognition Motifs

Q3 adds lightweight motif overlays that only appear in specific surfaces.

| Motif | What it means | How it should feel |
|---|---|---|
| `editorial_seal` | this voice has been published by the editorial team | a small wax-seal-like sign, not a badge pill |
| `seasonal_ring` | this voice appears in a seasonal issue / print artifact | a quiet outer ring with seasonal glyph rhythm |
| `resonance_mark` | this voice has sustained long-form participation over time | a faint gilded interruption in one orbit, not a crown |
| `curator_mark` | this contribution was manually recognized by the editorial desk | contextual, theme-bound, never global |

## 5. Trigger Logic

The triggers below are **internal logic**, not UI copy.

### 5.1 Automatic Triggers

| Trigger | Internal rule | Award |
|---|---|---|
| Long participation | cumulative utterances ≥ 729 | `resonance_mark` |
| Deep participation | cumulative utterances ≥ 2187 | upgrade `resonance_mark` visual density |
| Relay resonance | replies received across published echoes ≥ 27 | `resonance_mark` if not already set |
| Seasonal inclusion | included in a quarterly issue / print export | `seasonal_ring` |

### 5.2 Editorial Triggers

| Trigger | Internal rule | Award |
|---|---|---|
| Published atlas entry | at least 1 `atlas_submissions.status = 'published'` | `editorial_seal` |
| Featured lead contributor | manually granted by editorial desk for a specific topic or issue | `curator_mark` |

## 6. Where Each Motif May Appear

| Surface | Allowed motifs | Notes |
|---|---|---|
| `/her-voice/my/` | all motifs | private/archive context; still no counters |
| Published atlas entry byline | `editorial_seal`, `curator_mark` | only when tied to that entry |
| Print colophon / bookmark | `seasonal_ring`, `editorial_seal` | artifact context only |
| Weekly wall / message feed cards | none by default | avoid casual public status display |
| Global navigation / leaderboards / sort menus | none | forbidden |

## 7. Rendering Contract

The renderer should evolve from:

```ts
renderSigilSvg({ hash, level, size })
```

to a shape conceptually like:

```ts
renderSigilSvg({
  hash,
  level,
  size,
  motifs: ['editorial_seal', 'seasonal_ring'],
  context: 'atlas-entry',
})
```

Rules:

- the base orbit geometry must stay deterministic per `hash`
- motifs are overlays, not replacements
- motifs may be suppressed by `context`
- the same person can have different visible Sigils in different contexts without changing the base identity

## 8. Suggested Data Contract

Preferred direction:

- keep base state in `public.hermosa_sigils`
- add an append-only `public.sigil_events` table for trigger history
- derive current motif visibility from the latest eligible events

Minimum fields for `sigil_events`:

| Field | Purpose |
|---|---|
| `id` | primary key |
| `sigil_hash` | stable anonymous identity |
| `event_type` | `atlas_published`, `issue_included`, `resonance_reached`, `curator_granted` |
| `context_key` | topic / issue / season binding |
| `payload` | optional JSON detail |
| `created_at` | audit timestamp |

## 9. QA Questions Before Ship

Review every Sigil surface with these questions:

1. If two users put their screens side by side, can one infer who is "higher"?
2. If a user has zero motifs, do they still feel visually complete?
3. Does any motif appear outside the contribution context that granted it?
4. Could a payment event accidentally unlock or imply a motif?
5. Is there any copy that sounds like achievement language instead of editorial recognition?

If any answer is yes, the design failed the spec.