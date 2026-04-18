import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getOptionalSupabasePublicEnv, getSupabasePublicEnv } from './env';

let browserClientSingleton: SupabaseClient | null = null;

export function tryCreateBrowserSupabaseClient(): SupabaseClient | null {
  if (browserClientSingleton) {
    return browserClientSingleton;
  }

  const env = getOptionalSupabasePublicEnv();
  if (!env) {
    return null;
  }

  browserClientSingleton = createBrowserClient(env.url, env.publishableKey);
  return browserClientSingleton;
}

export function createBrowserSupabaseClient() {
  const existing = tryCreateBrowserSupabaseClient();
  if (existing) {
    return existing;
  }

  const { url, publishableKey } = getSupabasePublicEnv();

  browserClientSingleton = createBrowserClient(url, publishableKey);
  return browserClientSingleton;
}

export const createClient = createBrowserSupabaseClient;
