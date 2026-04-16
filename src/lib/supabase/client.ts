import { createBrowserClient } from '@supabase/ssr';

const URL_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
] as const;

const KEY_KEYS = [
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
] as const;

function readClientEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

export function createBrowserSupabaseClient() {
  const url = readClientEnv(URL_KEYS);
  const key = readClientEnv(KEY_KEYS);

  if (!url || !key) {
    console.error(
      `[supabase] Missing env vars. URL: ${url ? 'OK' : 'MISSING'}, Key: ${key ? 'OK' : 'MISSING'}. ` +
      `Checked URL keys: ${URL_KEYS.join(', ')}. Checked Key keys: ${KEY_KEYS.join(', ')}. ` +
      `Make sure .env.local has NEXT_PUBLIC_* vars and dev server was restarted.`
    );
  }

  return createBrowserClient(
    url ?? 'https://placeholder.supabase.co',
    key ?? 'placeholder-key'
  );
}

export const createClient = createBrowserSupabaseClient;
