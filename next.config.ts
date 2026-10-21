import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

// Use NEXT_PUBLIC_BASE_PATH to set basePath explicitly.
// With a custom domain (e.g. www.wtfti.com), basePath should be empty.
// Only set NEXT_PUBLIC_BASE_PATH=/sbti if deploying to user.github.io/sbti/ without custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Only allow opting out of Next/Vercel image optimization in non-production
// builds. Production should always keep the optimization pipeline on now that
// we no longer ship `output: 'export'`.
const imagesUnoptimized =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_IMAGES_UNOPTIMIZED === '1';

const nextConfig: NextConfig = {
  // output: 'export', // Removed: incompatible with API routes (Supabase/CPTI)
  trailingSlash: true,
  images: {
    unoptimized: imagesUnoptimized,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.runninghub.cn', pathname: '/**' },
      { protocol: 'https', hostname: 'qlogo.cn', pathname: '/**' },
      { protocol: 'https', hostname: '**.qlogo.cn', pathname: '/**' },
    ],
  },
  basePath,
  allowedDevOrigins: ['127.0.0.1'],
  // Route convergence (docs/01-strategy/wtfti-her-refocus-2026-10.md §7).
  // P0 route cut (refocus §7): 301 offline prefixes. Source pages kept on disk for now.
  // IMPORTANT: do NOT redirect /mirror — 美我 stays live.
  async redirects() {
    const toTest = [
      'bird', 'flower', 'fanrenti', 'work', 'drunk', 'love', 'identify', 'daily', 'cp', 'jueti',
      'squad', 'rank', 'combo', 'puzzle', 'gacha', 'banti', 'card',
    ];
    const toHome = [
      'creator', 'ugc', 'c', 'lingjian', 'her-books', 'her-wealth', 'weekly', 'theory', 'guide',
      'share-templates', 'types',
    ];
    // 懂我: merge her-voice → bottle (treehole).
    const toBottle = ['her-voice'];
    return [
      ...toTest.map((r) => ({ source: `/${r}/:path*`, destination: '/start/', permanent: true })),
      ...toHome.map((r) => ({ source: `/${r}/:path*`, destination: '/', permanent: true })),
      ...toBottle.map((r) => ({ source: `/${r}/:path*`, destination: '/bottle/', permanent: true })),
      // Offline wtfti side-universes → main test entry.
      { source: '/wtfti/kings/:path*', destination: '/start/', permanent: true },
      { source: '/wtfti/delta/:path*', destination: '/start/', permanent: true },
      { source: '/wtfti/feng/:path*', destination: '/start/', permanent: true },
      { source: '/wtfti/galaxy/:path*', destination: '/start/', permanent: true },
      // Audit 2026-10-20 Phase 1: 神域 landing + orphan pages → 测试大厅.
      // Kept live: /wtfti/test, /wtfti/result (long-tail test), /wtfti/letters (cron emails),
      // /wtfti/work (universe registry). CPTI / SoulTI sub-pages are still linked from their
      // result pages — pruning those belongs to Phase 2 (couple merge).
      { source: '/wtfti', destination: '/start/', permanent: true },
      ...['symptoms', 'shrine', 'duet', 'profile'].map((r) => ({
        source: `/wtfti/${r}/:path*`, destination: '/start/', permanent: true,
      })),
      // Duplicate "daily" surfaces merge into 今日.
      { source: '/wtfti/daily/:path*', destination: '/today/', permanent: true },
      { source: '/wtfti/moon/:path*', destination: '/today/', permanent: true },
      ...['hogti', 'xpti/whitepaper'].map((r) => ({ source: `/${r}/:path*`, destination: '/start/', permanent: true })),
      // Audit 2026-10-20 decision 4: ONE ¥19/月 membership → /member/.
      // 暮光通行证 page + per-universe pricing pages fold into it (single reports stay on result pages).
      ...['mysti/subscribe', 'xpti/pricing', 'cpti/pricing'].map((r) => ({
        source: `/${r}/:path*`, destination: '/member/', permanent: true,
      })),
      // Audit decision 3: XPTI couple + CPTI = 「我和他」 (entry /xpti/couple/).
      // CPTI leftovers with ~no traffic (30d: squad 0, stealth 0, gallery 4, leaderboard 4 devices).
      ...['cpti/squad', 'cpti/stealth', 'cpti/gallery', 'cpti/leaderboard'].map((r) => ({
        source: `/${r}/:path*`, destination: '/xpti/couple/', permanent: true,
      })),
      // Solo CPTI quiz → 我和他. Pair-code invites keep working under the new path (query is preserved).
      {
        source: '/cpti/test',
        missing: [{ type: 'query', key: 'pairCodeId' }],
        destination: '/xpti/couple/',
        permanent: true,
      },
      // Phase 3 (2026-10-22): CPTI pairing folds into 「我和他」. Old URLs 308 to /xpti/couple/cp/…,
      // which rewrites() serves from the existing CPTI pages — share links (?r=, ?code=, ?pairCodeId=),
      // tokens and paid entitlements (resourceId cpti:<slug>) are unchanged.
      { source: '/cpti', destination: '/xpti/couple/', permanent: true },
      ...['invite', 'theory'].map((r) => ({ source: `/cpti/${r}/:path*`, destination: '/xpti/couple/', permanent: true })),
      { source: '/cpti/test', has: [{ type: 'query', key: 'pairCodeId' }], destination: '/xpti/couple/cp/test/', permanent: true },
      { source: '/cpti/join/:path*', destination: '/xpti/couple/cp/join/:path*', permanent: true },
      { source: '/cpti/relationship/:path*', destination: '/xpti/couple/cp/:path*', permanent: true },
      { source: '/cpti/result/:path*', destination: '/xpti/couple/cp/me/:path*', permanent: true },
      { source: '/cpti/me/:path*', destination: '/xpti/couple/cp/my/:path*', permanent: true },
      // /cpti/scenarios/* stays (SEO landing pages; CTAs point to 我和他). /cpti/admin stays.
    ];
  },
  async rewrites() {
    // Serve 「我和他」 CPTI-pair URLs from the existing CPTI pages (see redirects above).
    // `cp/` sub-paths are ordered most-specific first; `cp/:path*` is the relationship pages.
    return {
      beforeFiles: [
        { source: '/xpti/couple/cp/join/:path*', destination: '/cpti/join/:path*' },
        { source: '/xpti/couple/cp/test/:path*', destination: '/cpti/test/:path*' },
        { source: '/xpti/couple/cp/me/:path*', destination: '/cpti/result/:path*' },
        { source: '/xpti/couple/cp/my/:path*', destination: '/cpti/me/:path*' },
        { source: '/xpti/couple/cp/:path*', destination: '/cpti/relationship/:path*' },
      ],
    };
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_BASE_PATH: process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? '',
    NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN ?? '',
  },
  // Vercel serverless functions only ship files Next can statically trace.
  // The OG/Twitter image routes read woff fonts from `assets/fonts/` at
  // runtime via `process.cwd()`, which the tracer can't see. Force-include
  // them so they exist under /var/task in production.
  outputFileTracingIncludes: {
    '/opengraph-image*': ['./assets/fonts/**'],
    '/twitter-image*': ['./assets/fonts/**'],
    '/**/opengraph-image*': ['./assets/fonts/**'],
    '/**/twitter-image*': ['./assets/fonts/**'],
  },
  experimental: {
    // Tree-shake heavy barrels we know we depend on.
    optimizePackageImports: ['framer-motion', 'recharts', 'qrcode'],
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

export default analyzer(nextConfig);
