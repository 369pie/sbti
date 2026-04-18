const DEFAULT_SHARE_SITE_ORIGIN = 'https://www.wtfti.com';
const LEGACY_SITE_HOSTS = ['369pie.github.io'];
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const rawSiteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? '';
const configuredSiteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim() ?? '';
/**
 * 分享场景（QR / 卡片底部链接 / OG）始终使用对外可达的公开 origin，
 * 不受 NEXT_PUBLIC_SITE_ORIGIN（开发常指向 localhost）影响。
 * 如有 staging 需求，可显式覆盖 NEXT_PUBLIC_PUBLIC_SHARE_ORIGIN。
 */
const configuredPublicShareOrigin = process.env.NEXT_PUBLIC_PUBLIC_SHARE_ORIGIN?.trim() ?? '';

function normalizeBasePath(value: string): string {
  if (!value || value === '/') return '';
  const prefixed = value.startsWith('/') ? value : `/${value}`;
  return prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed;
}

export const basePath = normalizeBasePath(rawBasePath);
export const siteBasePath = normalizeBasePath(rawSiteBasePath);
export const isLegacyPagesBuild = basePath.length > 0;

const normalizedShareSiteOrigin = (
  configuredPublicShareOrigin || DEFAULT_SHARE_SITE_ORIGIN
).replace(/\/$/, '');
const normalizedInternalSiteOrigin = (configuredSiteOrigin || DEFAULT_SHARE_SITE_ORIGIN).replace(/\/$/, '');

function withNormalizedBasePath(path: string, normalizedBasePath: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedBasePath ? `${normalizedBasePath}${normalizedPath}` : normalizedPath;
}

export const SHARE_SITE_URL = `${normalizedShareSiteOrigin}${siteBasePath ? `${siteBasePath}/` : '/'}`;

export function withBasePath(path: string): string {
  return withNormalizedBasePath(path, basePath) || '/';
}

export function withSiteBasePath(path: string): string {
  return withNormalizedBasePath(path, siteBasePath) || '/';
}

export function getSiteOrigin(): string {
  return normalizedInternalSiteOrigin;
}

export function getSiteUrl(path = '/'): string {
  const pathname = withSiteBasePath(path);
  const origin = getSiteOrigin();
  return origin ? `${origin}${pathname}` : pathname;
}

export function getSiteLabel(): string {
  const origin = getSiteOrigin();

  if (!origin) {
    return siteBasePath ? siteBasePath.slice(1) : 'wtfti';
  }

  const host = origin.replace(/^https?:\/\//, '');
  return `${host}${siteBasePath}`;
}

export function getLegacyRedirectScript(): string {
  return `(() => {
    try {
      const legacyHosts = ${JSON.stringify(LEGACY_SITE_HOSTS)};
      const currentHost = window.location.hostname;
      if (!legacyHosts.includes(currentHost)) {
        return;
      }

      const targetOrigin = ${JSON.stringify(normalizedShareSiteOrigin)};
      const assetBasePath = ${JSON.stringify(basePath)};
      const publicBasePath = ${JSON.stringify(siteBasePath)};
      let pathname = window.location.pathname || '/';

      if (assetBasePath && (pathname === assetBasePath || pathname.startsWith(assetBasePath + '/'))) {
        pathname = pathname.slice(assetBasePath.length) || '/';
      }

      if (!pathname.startsWith('/')) {
        pathname = '/' + pathname;
      }

      if (publicBasePath) {
        pathname = pathname === '/' ? publicBasePath + '/' : publicBasePath + pathname;
      }

      const targetUrl = targetOrigin + pathname + window.location.search + window.location.hash;
      if (targetUrl !== window.location.href) {
        window.location.replace(targetUrl);
      }
    } catch (error) {
      console.error('Legacy site redirect failed', error);
    }
  })();`;
}