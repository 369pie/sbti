import type { NextConfig } from "next";

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'sbti';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const basePath = isGitHubPagesBuild ? `/${repoName}` : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN ?? '',
  },
};

export default nextConfig;
