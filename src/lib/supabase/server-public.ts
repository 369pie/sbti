import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabasePublicEnv } from './env';

export function createPublicServerSupabaseClient(): SupabaseClient {
  const { url, publishableKey } = getSupabasePublicEnv();

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}