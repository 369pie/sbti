import type { SupabaseClient } from '@supabase/supabase-js';

export interface AnonymousSignInResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export async function signInAnonymously(
  supabase: SupabaseClient
): Promise<AnonymousSignInResult> {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'No user returned from anonymous sign-in' };
    }

    return {
      success: true,
      userId: data.user.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during anonymous sign-in',
    };
  }
}

export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAnonymousUser(supabase: SupabaseClient): Promise<boolean> {
  const user = await getCurrentUser(supabase);
  if (!user) return false;

  // Check if user has is_anonymous claim in JWT
  return user.is_anonymous === true;
}

export async function getOrCreateAnonymousSession(
  supabase: SupabaseClient
): Promise<AnonymousSignInResult> {
  const user = await getCurrentUser(supabase);

  if (user) {
    return {
      success: true,
      userId: user.id,
    };
  }

  return signInAnonymously(supabase);
}
