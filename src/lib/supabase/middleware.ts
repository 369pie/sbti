import { createServerSupabaseClient } from './server';
import type { User } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  error?: string;
}

export async function getAuthUser(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error?.message ?? 'No session' };
  }
  
  return { user };
}
