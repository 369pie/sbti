/**
 * Mirror Challenge — encode/decode challenge data for URL sharing.
 *
 * Format: base64url(mode.summary.testedAt)
 * Example: "beauty.暖秋型人~适合驼色焦糖铁锈红.2026-04-25"
 */

const DELIMITER = '.';
const SUMMARY_SEPARATOR = '~';

export interface ChallengeData {
  mode: string;
  summary: string;
  testedAt: string;
}

/**
 * Encode challenge data into a URL-safe string.
 */
export function encodeChallenge(data: ChallengeData): string {
  const parts = [data.mode, data.summary, data.testedAt];
  const raw = parts.join(DELIMITER);

  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(raw, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode challenge data from URL param.
 */
export function decodeChallenge(encoded: string): ChallengeData | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    let raw: string;
    if (typeof window !== 'undefined') {
      raw = decodeURIComponent(escape(atob(b64)));
    } else {
      raw = Buffer.from(b64, 'base64').toString('utf-8');
    }

    const parts = raw.split(DELIMITER);
    if (parts.length < 3) return null;

    return {
      mode: parts[0],
      summary: parts[1],
      testedAt: parts[2],
    };
  } catch {
    return null;
  }
}

/**
 * Build a full challenge URL.
 */
export function buildChallengeUrl(data: ChallengeData): string {
  const encoded = encodeChallenge(data);
  const base = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://wtfti.com';
  return `${base}/mirror/challenge/?c=${encoded}`;
}

/**
 * Extract challenge data from URL search params.
 */
export function parseChallengeFromUrl(searchParams: URLSearchParams): ChallengeData | null {
  const encoded = searchParams.get('c');
  if (!encoded) return null;
  return decodeChallenge(encoded);
}

/**
 * Get mode display name in Chinese.
 */
export function getModeDisplayName(mode: string): string {
  switch (mode) {
    case 'beauty': return '变美灵镜';
    case 'fortune': return '命纹灵镜';
    case 'color': return '色彩诊断';
    case 'compare': return '风格对比';
    default: return '灵镜';
  }
}

/**
 * Get mode emoji.
 */
export function getModeEmoji(mode: string): string {
  switch (mode) {
    case 'beauty': return '🌹';
    case 'fortune': return '✦';
    case 'color': return '🎨';
    case 'compare': return '⚡';
    default: return '🔮';
  }
}
