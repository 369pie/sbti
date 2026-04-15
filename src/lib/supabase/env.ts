const SUPABASE_URL_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
] as const;

const SUPABASE_PUBLISHABLE_KEY_KEYS = [
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
] as const;

type EnvKey = (typeof SUPABASE_URL_KEYS)[number] | (typeof SUPABASE_PUBLISHABLE_KEY_KEYS)[number];

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

export function getSupabasePublicEnv() {
  return {
    url: requireEnv('Supabase URL', SUPABASE_URL_KEYS),
    publishableKey: requireEnv('Supabase publishable key', SUPABASE_PUBLISHABLE_KEY_KEYS),
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(readEnv(SUPABASE_URL_KEYS) && readEnv(SUPABASE_PUBLISHABLE_KEY_KEYS));
}
