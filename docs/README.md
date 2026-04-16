# WTFTI Documentation Hub

> Owner: Product Strategy
> Status: Canonical Hub
> Priority: P0
> Last Updated: 2026-04-16
> Review Cadence: On primary entry-point changes
> Next Decision: Decide whether to add a current-quarter priorities doc above the long-form strategy stack

This docs tree is organized by decision layer and product surface, not by write date.
If you only need the current product direction, read the `01-strategy` layer first.

## Start Here

1. [01-strategy/wtfti-product-strategy-v2-2026-04-16.md](01-strategy/wtfti-product-strategy-v2-2026-04-16.md) — platform-level strategic baseline
2. [01-strategy/mysti-deep-strategy-2026-04-16.md](01-strategy/mysti-deep-strategy-2026-04-16.md) — latest Mysti strategic document
3. [01-strategy/four-module-polish-strategy-2026-04-16.md](01-strategy/four-module-polish-strategy-2026-04-16.md) — cross-module integration path
4. [01-strategy/EXECUTION-PLAN.md](01-strategy/EXECUTION-PLAN.md) — execution order, gaps, and rollout priorities
5. [01-strategy/wtfti-product-roadmap.md](01-strategy/wtfti-product-roadmap.md) — longer-range expansion narrative

## Directory Map

- `01-strategy` — current strategy, synthesis, and execution docs
- `02-modules` — module specs, product docs, backend plans, and data models
- `03-universes` — theme/IP universe plans, launch briefs, and content packs
- `04-design-growth/design` — design system, naming, share-card, and visual standards
- `04-design-growth/growth` — growth, brand, UGC, and content expansion docs
- `05-operations/audits` — audits, readiness checks, and cleanup lists
- `05-operations/infra` — infrastructure-adjacent or support docs
- `99-archive` — superseded, dated, or historical strategy drafts

## Canonical Docs By Area

- WTFTI platform: [01-strategy/wtfti-product-strategy-v2-2026-04-16.md](01-strategy/wtfti-product-strategy-v2-2026-04-16.md)
- Execution layer: [01-strategy/EXECUTION-PLAN.md](01-strategy/EXECUTION-PLAN.md)
- Mysti: [01-strategy/mysti-deep-strategy-2026-04-16.md](01-strategy/mysti-deep-strategy-2026-04-16.md) and [02-modules/mysti](02-modules/mysti)
- CPTI: [02-modules/cpti/cpti-backend-prd.md](02-modules/cpti/cpti-backend-prd.md), [02-modules/cpti/cpti-data-model-and-instrumentation.md](02-modules/cpti/cpti-data-model-and-instrumentation.md), [02-modules/cpti/cpti-engineering-task-list.md](02-modules/cpti/cpti-engineering-task-list.md)
- WTF CARD: [02-modules/wtf-card/wtf-card-and-identify-product-tiers.md](02-modules/wtf-card/wtf-card-and-identify-product-tiers.md) and [02-modules/wtf-card/wtf-card-atlas-data-model.md](02-modules/wtf-card/wtf-card-atlas-data-model.md)
- Universe content: [03-universes](03-universes)
- Shared visual rules: [04-design-growth/design](04-design-growth/design)
- Growth and expansion: [04-design-growth/growth](04-design-growth/growth)
- Archive lineage: [99-archive/authoritative-strategy-summary.md](99-archive/authoritative-strategy-summary.md)

## When Current Docs Overlap

- Use [01-strategy/wtfti-product-strategy-v2-2026-04-16.md](01-strategy/wtfti-product-strategy-v2-2026-04-16.md) as the platform truth.
- Use [01-strategy/four-module-polish-strategy-2026-04-16.md](01-strategy/four-module-polish-strategy-2026-04-16.md) for cross-module prioritization and login/asset strategy.
- Use [01-strategy/EXECUTION-PLAN.md](01-strategy/EXECUTION-PLAN.md) for action order, not for replacing platform truth.
- Use [01-strategy/wtfti-product-roadmap.md](01-strategy/wtfti-product-roadmap.md) for longer-horizon expansion, not for near-term implementation disputes.
- Treat docs marked `Active Reference` as supporting context, not as top-level decision authority.

## Maintenance Rules

- Put current strategy docs in `01-strategy`.
- Put module-specific specs in the relevant `02-modules/<module>` folder.
- Put universe-specific planning and art packs in `03-universes`.
- When a doc is superseded, move the older version into `99-archive` instead of leaving duplicates at the active layer.
- Update this file whenever you add a new primary entry point or archive a previously canonical doc.
- Key decision docs should keep the same 6-line metadata header: `Owner`, `Status`, `Priority`, `Last Updated`, `Review Cadence`, `Next Decision`.
- Metadata vocabulary and header rules live in [05-operations/docs-metadata-governance.md](05-operations/docs-metadata-governance.md).
- Run `pnpm docs:metadata` after metadata or authority changes.
- If active docs and archive docs conflict, trust the active doc.