import { createClient } from '@supabase/supabase-js';

import { getSupabasePublicEnv } from './env';

const SUPABASE_SECRET_KEY_KEYS = [
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

function requireAdminKey(): string {
  for (const key of SUPABASE_SECRET_KEY_KEYS) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  throw new Error(
    `Missing Supabase admin key. Checked: ${SUPABASE_SECRET_KEY_KEYS.join(', ')}. ` +
      'Only call createAdminSupabaseClient() from trusted server code.'
  );
}

export function createAdminSupabaseClient() {
  const { url } = getSupabasePublicEnv();
  const secretKey = requireAdminKey();

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
