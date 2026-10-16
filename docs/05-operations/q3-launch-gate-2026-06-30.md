# Q3 Launch Gate · 2026-06-30

> Owner: Operations + Product Strategy
> Status: Active Operations Reference
> Priority: P0
> Last Updated: 2026-05-08
> Review Cadence: Weekly until 2026-06-30, then only when gate evidence changes
> Next Decision: Decide which epics can start if E2 is red but E1, E3, and E5 are green

This checklist is the formal go / no-go gate for starting Q3 epics from the master plan.

## 1. Gate Rule

- Meeting date: `2026-06-30`
- Decision format: `GO`, `GO WITH CONSTRAINTS`, or `NO-GO`
- Default if evidence is missing: `NO-GO`

## 2. Evidence Matrix

| Epic | Gate owner | Required evidence | Minimum bar | Decision if red |
|---|---|---|---|---|
| E1 · 开放共写 | Product + Editorial | W5 atlas v0 shipped, review SOP written, submission schema ready | ≥ 5 invite-only entries live + editorial queue flow rehearsed once | delay public submission, keep invite-only |
| E2 · 引擎 v3 | Product + Applied AI | W5 v2 eval, tool inventory, cost report | v2 vs v0 ≥ +5pp and P95 cost ≤ ¥3 | delay E2 and block E4 |
| E3 · 徽章 + 高阶 Sigil | Design + Frontend | Sigil v0 live, echoes live, same-voice matching live, anti-vanity spec approved | all three shipped + no red flags in anti-vanity review | delay public honor display |
| E4 · 二代档案 | Product + Frontend | E2 alpha SDK, ≥ 500 real archive samples, complaint log | v3 alpha callable + sample size met | keep one-gen archive only |
| E5 · 纸质出版物 | Operations + Editorial | May whitepaper shipped, print pack ready, legal consent path ready, budget cap approved | vendor shortlist + consent copy + list collection path all ready | reduce to pilot zine / PDF only |

## 3. Checklist

### 3.1 E1 · 她词条开放共写

- [ ] `/her-voice/atlas/` v0 already has 5 live invite-only entries
- [ ] editorial review SOP exists and names owner + turnaround SLA
- [ ] `atlas_submissions` schema is reviewed
- [ ] admin queue flow is drawn or stubbed
- [ ] anti-AI-slop review rule is agreed

**GO if**: the team can point to one real dry-run submission moving from intake to review to publish.

### 3.2 E2 · 命理引擎 v3

- [ ] W5 v2 evaluation doc exists
- [ ] v2 accuracy improvement vs v0 is at least `+5pp`
- [ ] tool catalog is counted and grouped by stream
- [ ] P95 cost estimate is at or under `¥3`
- [ ] fallback path to v2 is defined when v3 confidence is low

**GO if**: both accuracy and cost bars are met. If only one is met, decision is `GO WITH CONSTRAINTS` only for backend prototyping, not public product rollout.

### 3.3 E3 · 创作者徽章 + Sigil 高阶演化

- [ ] base Sigil v0 is already persistent in `hermosa_sigils`
- [ ] relay feature is live and producing real behavior
- [ ] same-voice matching v0 is live or explicitly descoped
- [ ] [../03-universes/sigil-evolution-spec.md](../03-universes/sigil-evolution-spec.md) is approved
- [ ] at least one anti-vanity audit pass is complete

**GO if**: recognition motifs can be shown without any numeric progress or global comparison affordance.

### 3.4 E4 · 星图档案二代

- [ ] one-gen archive has at least `500` real user samples
- [ ] E2 alpha SDK is callable through one stable interface
- [ ] one-gen complaint categories are reviewed
- [ ] animation direction is approved with performance budget

**GO if**: the product team can compare v1 vs v2 on real samples and show a clear quality step-up.

### 3.5 E5 · 纸质出版物

- [ ] first monthly whitepaper shipped successfully
- [ ] print vendor shortlist exists
- [ ] unit cost cap is signed off
- [ ] consent text for print inclusion exists
- [ ] seed recipient list collection path exists

**GO if**: the team can produce one sample PDF and one confirmed quote without inventing any net-new publishing workflow.

## 4. Allowed Partial-Start Combinations

| Scenario | Allowed | Not allowed |
|---|---|---|
| E1 green, E2 red, E3 green, E5 green | start E1, E3, E5 | do not start E4 |
| E1 red, E2 green, E3 green, E5 green | start E2 only | do not open public submissions or full print run |
| E5 red, all others green | start E1, E2, E3 | keep publishing digital-only |
| E2 red and E5 red | start only low-risk E1/E3 prep | no archive v2, no print run |

## 5. Meeting Output Template

At the end of the 2026-06-30 review, record one line per epic:

```md
- E1: GO / GO WITH CONSTRAINTS / NO-GO — owner — next action — evidence link
```

No epic is considered green until the evidence link is attached.