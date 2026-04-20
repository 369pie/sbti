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
