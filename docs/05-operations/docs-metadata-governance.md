# Docs Metadata Governance

> Owner: Operations + Product Strategy
> Status: Canonical Governance Guide
> Priority: P1
> Last Updated: 2026-04-16
> Review Cadence: On metadata rule changes or lint-script updates
> Next Decision: Decide whether metadata rules should eventually move to YAML frontmatter instead of inline blockquotes

This document defines the controlled metadata contract for WTFTI docs and the lint rules that enforce it.

## Scope

The metadata rules apply to:

- [docs/README.md](../README.md)
- all Markdown files under `docs/01-strategy`
- all Markdown files under `docs/02-modules`
- all Markdown files under `docs/03-universes`
- all Markdown files under `docs/04-design-growth`
- all Markdown files under `docs/05-operations`
- all Markdown files under `docs/99-archive`

## Two Valid Header Shapes

### 1. Active, Canonical, Historical Index Docs

Use this six-line header immediately below the H1 title.

```md
> Owner: Product Strategy
> Status: Canonical Hub
> Priority: P0
> Last Updated: 2026-04-16
> Review Cadence: Monthly
> Next Decision: Decide whether this doc needs to split by audience
```

Use this shape for current decision docs, indexes, guides, logs, specs, audits, and references that are still maintained.

### 2. Superseded Archive Drafts

Use this three-line redirect block immediately below the H1 title.

```md
> Archive Status: Superseded
> Read This For: early framing, legacy rationale, or wording lineage
> Current Authority: [../01-strategy/example.md](../01-strategy/example.md)
```

Use this shape only for archived drafts that should no longer drive decisions directly.

## Field Dictionary

### Owner

- Purpose: who is expected to maintain or review the doc.
- Format: team or function label, optionally joined with ` + `.
- Good examples:
  - `Product Strategy`
  - `Design + Frontend`
  - `Operations + QA`

### Status

- `Canonical ...`
  - Meaning: source-of-truth doc or primary index for a layer.
- `Active ...`
  - Meaning: maintained and currently relevant, but not always the single highest authority.
- `Historical ...`
  - Meaning: still maintained as an index or log, but primarily historical in nature.
- `Archive Status: Superseded`
  - Meaning: archived draft retained only for lineage.

Keep the noun after the prefix specific to the doc's role, such as `Hub`, `Layer Index`, `Spec`, `Proposal`, `Audit`, `Reference`, or `Migration Log`.

### Priority

Allowed values:

- `P0` — immediate decision-critical material
- `P1` — important current guidance
- `P2` — supporting but not first-read material
- `P3` — low-frequency reference
- `Reference` — historical or index-only material

### Last Updated

- Format: `YYYY-MM-DD`
- Rule: update this field whenever the document's meaning, authority, or maintenance guidance changes.

### Review Cadence

Start the value with one of these patterns:

- `Weekly ...`
- `Twice weekly ...`
- `Monthly ...`
- `Quarterly ...`
- `On ...`
- `Before ...`
- `Only when ...`
- `Until ...`

Use trigger-based phrasing when the document is event-driven, and time-based phrasing when it is part of a regular planning or release cycle.

### Next Decision

- Rule: write one unresolved maintenance or strategy question.
- Format: start with `Decide ...`
- Goal: make the next likely review action obvious.

Good examples:

- `Decide whether this proposal becomes the default cross-module share-card direction`
- `Decide which universe wave follows the current P0 and P1 stack`
- `Decide whether this draft should be archived after the next strategy consolidation`

## Status Vocabulary Guidance

Use these role patterns consistently to avoid synonym sprawl:

- Index docs: `Canonical Hub`, `Canonical Layer Index`, `Historical Index`
- Strategy docs: `Canonical Platform Strategy`, `Canonical Cross-Module Strategy`, `Active Growth Strategy`, `Active Expansion Strategy`, `Active Competitive Reference`
- Specs and guides: `Active Spec`, `Active UI Spec`, `Active Design Guide`, `Active Style Guide`, `Active Content Guide`, `Active Layering Spec`
- Execution docs: `Active Execution Plan`, `Active Backlog`, `Active Audit`, `Active Launch Plan`, `Active Production Plan`
- Supporting material: `Active Reference`, `Active Proposal`, `Active Content Kit`, `Active Migration Log`, `Active Operations Reference`

If a new status label is needed, prefer extending one of these patterns instead of inventing a totally new status family.

## Lint Contract

Run the metadata validator with:

```bash
pnpm docs:metadata
```

The validator checks:

- every governed Markdown file has a valid H1 title
- active/current docs use the six-line header in the correct field order
- superseded archive docs use the three-line redirect shape
- `Status`, `Priority`, `Last Updated`, `Review Cadence`, and `Next Decision` follow the expected patterns
- archive redirects include at least one markdown link in `Current Authority`

## Maintenance Rules

- When converting an active doc into archive material, replace the six-line header with the archive redirect block.
- When creating a new source-of-truth doc, update [docs/README.md](../README.md) if it changes the reading path.
- If you change the metadata rules, update this file and keep `pnpm docs:metadata` in sync in the same patch.