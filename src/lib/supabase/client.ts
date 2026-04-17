import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Fallback values — these are public keys, safe to embed.
// .env.local should override them, but if env injection fails these keep things working.
const FALLBACK_URL = 'https://urvxotpdmhfdnoaltchp.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydnhvdHBkbWhmZG5vYWx0Y2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjQyODAsImV4cCI6MjA5MTg0MDI4MH0.CiHyONuvfLB_LEAYJ19GKUXF5CxeQIZDO5fSTDXDWHE';

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

let browserClientSingleton: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (browserClientSingleton) {
    return browserClientSingleton;
  }

  const url = readClientEnv(URL_KEYS) ?? FALLBACK_URL;
  const key = readClientEnv(KEY_KEYS) ?? FALLBACK_KEY;

  browserClientSingleton = createBrowserClient(url, key);
  return browserClientSingleton;
}

export const createClient = createBrowserSupabaseClient;
