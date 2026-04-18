const SUPABASE_BROWSER_URL_KEYS = ['NEXT_PUBLIC_SUPABASE_URL'] as const;

const SUPABASE_BROWSER_PUBLISHABLE_KEY_KEYS = [
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const SUPABASE_SERVER_URL_KEYS = [
  ...SUPABASE_BROWSER_URL_KEYS,
  'SUPABASE_URL',
] as const;

const SUPABASE_SERVER_PUBLISHABLE_KEY_KEYS = [
  ...SUPABASE_BROWSER_PUBLISHABLE_KEY_KEYS,
  'SUPABASE_ANON_KEY',
] as const;

type EnvKey =
  | (typeof SUPABASE_BROWSER_URL_KEYS)[number]
  | (typeof SUPABASE_BROWSER_PUBLISHABLE_KEY_KEYS)[number]
  | (typeof SUPABASE_SERVER_URL_KEYS)[number]
  | (typeof SUPABASE_SERVER_PUBLISHABLE_KEY_KEYS)[number];

type SupabasePublicEnv = {
  url?: string;
  publishableKey?: string;
};

function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined';
}

function getRuntimeKeys() {
  if (isBrowserRuntime()) {
    return {
      urlKeys: SUPABASE_BROWSER_URL_KEYS,
      publishableKeyKeys: SUPABASE_BROWSER_PUBLISHABLE_KEY_KEYS,
    };
  }

  return {
    urlKeys: SUPABASE_SERVER_URL_KEYS,
    publishableKeyKeys: SUPABASE_SERVER_PUBLISHABLE_KEY_KEYS,
  };
}

function readBrowserPublicEnv(): SupabasePublicEnv {
  // Next.js only inlines browser env vars for direct property access.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url: typeof url === 'string' && url.length > 0 ? url : undefined,
    publishableKey:
      typeof publishableKey === 'string' && publishableKey.length > 0 ? publishableKey : undefined,
  };
}

function readEnv(keys: readonly EnvKey[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function requireEnv(label: string, keys: readonly EnvKey[]): string {
  const value = readEnv(keys);
  if (value) return value;

  throw new Error(
    `Missing ${label}. Checked: ${keys.join(', ')}. ` +
      'Set these values in your local env or Vercel project settings before using Supabase helpers.'
  );
}

export function getOptionalSupabasePublicEnv() {
  if (isBrowserRuntime()) {
    const env = readBrowserPublicEnv();
    if (!env.url || !env.publishableKey) {
      return null;
    }

    return env as { url: string; publishableKey: string };
  }

  const { urlKeys, publishableKeyKeys } = getRuntimeKeys();
  const url = readEnv(urlKeys);
  const publishableKey = readEnv(publishableKeyKeys);

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function getSupabasePublicEnv() {
  if (isBrowserRuntime()) {
    const env = readBrowserPublicEnv();

    return {
      url: env.url || requireEnv('Supabase URL', SUPABASE_BROWSER_URL_KEYS),
      publishableKey:
        env.publishableKey ||
        requireEnv('Supabase publishable key', SUPABASE_BROWSER_PUBLISHABLE_KEY_KEYS),
    };
  }

  const { urlKeys, publishableKeyKeys } = getRuntimeKeys();

  return {
    url: requireEnv('Supabase URL', urlKeys),
    publishableKey: requireEnv('Supabase publishable key', publishableKeyKeys),
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getOptionalSupabasePublicEnv());
}

export function isSupabaseConfigError(error: unknown): error is Error {
  return error instanceof Error && /^Missing Supabase (URL|publishable key)\./.test(error.message);
}

export function getSupabaseBrowserConfigHelpMessage(): string {
  return '站点认证配置缺失，请在 Vercel 环境变量中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY（或 NEXT_PUBLIC_SUPABASE_ANON_KEY）后重新部署。';
}
