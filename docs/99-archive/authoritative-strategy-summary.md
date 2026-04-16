# Archive Strategy Summary

> Owner: Product Strategy
> Status: Canonical Archive Summary
> Priority: Reference
> Last Updated: 2026-04-16
> Review Cadence: On archive additions or major strategy resets
> Next Decision: Decide whether `wtfti-deep-product-strategy-2026-04-16.md` should remain active reference material or be absorbed and archived

This file is the single entry point for archived strategy drafts.
Use it to understand what each historical document still contributes, what is now outdated, and which active documents are authoritative.

## Consolidation Result

The archive currently contains four overlapping strategy drafts.
They are still useful for lineage, but none of them should be treated as the current product truth on their own.

| Archived draft | What still matters | What is outdated | Current authority |
|---|---|---|---|
| [wtfti-deep-strategy-research.md](wtfti-deep-strategy-research.md) | platform positioning, JTBD, early retention framing, channel logic | assumes the main fix is retention hooks before accountization; predates the CPTI-led identity pivot | [../01-strategy/wtfti-product-strategy-v2-2026-04-16.md](../01-strategy/wtfti-product-strategy-v2-2026-04-16.md), [../01-strategy/four-module-polish-strategy-2026-04-16.md](../01-strategy/four-module-polish-strategy-2026-04-16.md), [../01-strategy/wtfti-product-roadmap.md](../01-strategy/wtfti-product-roadmap.md) |
| [mysti-product-strategy.md](mysti-product-strategy.md) | Mysti shareability logic, tarot-social fit, content distribution ideas | predates the 2026 Mysti reset; does not frame Mysti as the platform's emotion anchor + return engine; original date is historical and kept as-is | [../01-strategy/mysti-deep-strategy-2026-04-16.md](../01-strategy/mysti-deep-strategy-2026-04-16.md), [../02-modules/mysti/mysti-card-ui-spec.md](../02-modules/mysti/mysti-card-ui-spec.md) |
| [cpti-relationship-growth-strategy-2026-04-15.md](cpti-relationship-growth-strategy-2026-04-15.md) | female-user relationship language, six-digit code rationale, relationship identity framing | still treats CPTI mainly as a growth system; predates backend decomposition, account layering, and active implementation backlog | [../02-modules/cpti/cpti-backend-prd.md](../02-modules/cpti/cpti-backend-prd.md), [../02-modules/cpti/cpti-data-model-and-instrumentation.md](../02-modules/cpti/cpti-data-model-and-instrumentation.md), [../02-modules/cpti/cpti-engineering-task-list.md](../02-modules/cpti/cpti-engineering-task-list.md) |
| [cpti-auth-retention-and-wtf-card-atlas-strategy-2026-04-15.md](cpti-auth-retention-and-wtf-card-atlas-strategy-2026-04-15.md) | login trigger logic, anonymous-to-account transition framing, layered atlas metaphor | broad combined draft has now been split into focused strategy, auth flow, and data-model documents | [../01-strategy/four-module-polish-strategy-2026-04-16.md](../01-strategy/four-module-polish-strategy-2026-04-16.md), [../02-modules/cpti/cpti-supabase-auth-and-upgrade-flow.md](../02-modules/cpti/cpti-supabase-auth-and-upgrade-flow.md), [../02-modules/wtf-card/wtf-card-atlas-data-model.md](../02-modules/wtf-card/wtf-card-atlas-data-model.md) |

## Single Authoritative Summary

### Platform Truth

- WTFTI is now defined as a multi-universe personality asset platform, not a collection of disconnected one-off tests.
- The current platform bottleneck is no longer just shareability or surface-level retention. It is the lack of durable identity, durable assets, and strong cross-universe routing.
- The north-star direction is persistent asset accumulation: more results, more relationships, more collectibles, and more reasons to come back.

### Mysti Truth

- Mysti is no longer just a tarot-themed skin or share card format.
- Its strategic role is now threefold: emotion anchor, return engine, and content distribution arsenal.
- The active focus is deeper prophecy content, stronger pair-reading loops, daily ritual hooks, and higher-quality card presentation.

### CPTI and WTF CARD Truth

- CPTI is the strongest identity wedge because users most naturally want to save relationship results, compare them, and keep them across devices.
- WTF CARD should be treated as the top-level asset cabinet, not as a flat badge wall.
- The active architecture is split on purpose: product strategy, auth flow, backend PRD, data model, and execution backlog are now separate documents.

### Execution Truth

1. Protect assets before expanding content breadth endlessly.
2. Use CPTI and high-value moments to trigger account claiming instead of forcing early registration.
3. Add stronger cross-universe routing from result pages.
4. Add recurring hooks, especially where Mysti and collection mechanics can drive revisit behavior.

## What To Ignore In Older Drafts

- Flat `docs/...` path references that predate the new docs hierarchy.
- Any assumption that anonymous local state is sufficient as a long-term product model.
- Any archived phrasing that collapses platform strategy, backend planning, and implementation order into one file.
- Any branding or product framing that conflicts with the current WTFTI baseline.

## Current Source Of Truth Order

1. [../README.md](../README.md) for navigation.
2. [../01-strategy/wtfti-product-strategy-v2-2026-04-16.md](../01-strategy/wtfti-product-strategy-v2-2026-04-16.md) for platform truth.
3. [../01-strategy/four-module-polish-strategy-2026-04-16.md](../01-strategy/four-module-polish-strategy-2026-04-16.md) for cross-module strategy.
4. [../01-strategy/EXECUTION-PLAN.md](../01-strategy/EXECUTION-PLAN.md) for execution sequencing.
5. Active module specs in `../02-modules/` for implementation detail.

If two archived files disagree, or an archived file disagrees with an active file, follow the active file.