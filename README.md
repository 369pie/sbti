# WTFTI / SBTI

WTFTI is a multi-universe personality atlas platform built on Next.js 16.
The repository name remains `sbti` for historical continuity, but current product,
strategy, and user-facing documentation should be read as WTFTI.

## Project Scope

- WTFTI classic personality tests and share-card flows
- Mysti tarot personality module
- CPTI relationship and pair-testing module
- SoulTI, XPTI, BanTI, and multiple themed universe skins
- Image generation, asset processing, and static export pipelines under `scripts/`

## Quick Start

Install dependencies and start the local app:

```bash
pnpm install
pnpm dev
```

`pnpm dev` and `pnpm build` both run the thumbnail + medium-image generation steps first.

If you need to reproduce Turbopack-specific behavior locally, run:

```bash
pnpm run dev:turbo
```

Open `http://localhost:3000` in your browser.

## Common Commands

- `pnpm dev`
- `pnpm run dev:turbo`
- `pnpm build`
- `pnpm lint`
- `pnpm run images:thumbs`
- `pnpm run images:medium`
- `pnpm run images:all`
- `pnpm run images:banti-launch`

## Key Directories

- `src/app` — application routes and page entry points
- `src/lib` — personalities, share-image helpers, scoring logic, platform utilities
- `public/images/types` — generated and curated universe assets
- `scripts` — image generation, export, and build helpers
- `docs/README.md` — documentation hub and canonical entry points

## Documentation

The documentation set is now organized by decision layer instead of write date.
Start with:

1. [docs/README.md](docs/README.md)
2. [docs/01-strategy/wtfti-product-strategy-v2-2026-04-16.md](docs/01-strategy/wtfti-product-strategy-v2-2026-04-16.md)
3. [docs/01-strategy/EXECUTION-PLAN.md](docs/01-strategy/EXECUTION-PLAN.md)

## Supabase Setup

The repo includes a shared Supabase helper layer under `src/lib/supabase/*`.

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

The helpers also accept legacy fallback names:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
