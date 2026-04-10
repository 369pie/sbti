const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const configuredSiteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? '';

export const SHARE_SITE_URL = 'https://369pie.github.io/sbti/';

function normalizeBasePath(value: string): string {
  if (!value || value === '/') return '';
  const prefixed = value.startsWith('/') ? value : `/${value}`;
  return prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed;
}

export const basePath = normalizeBasePath(rawBasePath);

export function withBasePath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}` || '/';
}

export function getSiteOrigin(): string {
  if (configuredSiteOrigin) {
    return configuredSiteOrigin.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

export function getSiteUrl(path = '/'): string {
  const pathname = withBasePath(path);
  const origin = getSiteOrigin();
  return origin ? `${origin}${pathname}` : pathname;
}

export function getSiteLabel(): string {
  const origin = getSiteOrigin();

  if (!origin) {
    return basePath ? basePath.slice(1) : 'sbti';
  }

  const host = origin.replace(/^https?:\/\//, '');
  return `${host}${basePath}`;
}