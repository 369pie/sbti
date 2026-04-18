import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicEnv } from './env';

let browserClientSingleton: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (browserClientSingleton) {
    return browserClientSingleton;
  }

  const { url, publishableKey } = getSupabasePublicEnv();

  browserClientSingleton = createBrowserClient(url, publishableKey);
  return browserClientSingleton;
}

export const createClient = createBrowserSupabaseClient;
