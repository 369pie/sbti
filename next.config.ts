import type { NextConfig } from "next";

// Use NEXT_PUBLIC_BASE_PATH to set basePath explicitly.
// With a custom domain (e.g. www.wtfti.com), basePath should be empty.
// Only set NEXT_PUBLIC_BASE_PATH=/sbti if deploying to user.github.io/sbti/ without custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  // output: 'export', // Removed: incompatible with API routes (Supabase/CPTI)
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  allowedDevOrigins: ['127.0.0.1'],
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_BASE_PATH: process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? '',
    NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN ?? '',
  },
};

export default nextConfig;
