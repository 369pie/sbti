import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export type AnonymousSignInResult = AuthResult;

// ─── Anonymous Auth ──────────────────────────────────────────────────────────

// Single-flight across the whole page (also across dynamic-import chunks via
// globalThis): concurrent callers share ONE signInAnonymously request, and a
// caller arriving after a session exists reuses it. Before this, the result
// page's asset sync and the one-tap archive button raced and created 2 anon
// auth.users per archive click.
const ANON_FLIGHT_KEY = '__wtftiAnonSignInFlight';
type FlightHolder = { [ANON_FLIGHT_KEY]?: Promise<AnonymousSignInResult> | null };

/**
 * Reuse the current session if there is one, otherwise create exactly one
 * anonymous session. Use this instead of calling supabase.auth.signInAnonymously().
 */
export function ensureAnonymousSession(supabase: SupabaseClient): Promise<AnonymousSignInResult> {
  const holder = globalThis as FlightHolder;
  const inflight = holder[ANON_FLIGHT_KEY];
  if (inflight) return inflight;
  const flight = (async (): Promise<AnonymousSignInResult> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return { success: true, userId: session.user.id };
    } catch {
      /* fall through to sign-in */
    }
    return rawSignInAnonymously(supabase);
  })().finally(() => {
    holder[ANON_FLIGHT_KEY] = null;
  });
  holder[ANON_FLIGHT_KEY] = flight;
  return flight;
}

/** Back-compat name: now session-reusing + single-flight. */
export function signInAnonymously(supabase: SupabaseClient): Promise<AnonymousSignInResult> {
  return ensureAnonymousSession(supabase);
}

async function rawSignInAnonymously(
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
  return ensureAnonymousSession(supabase);
}

// ─── Email/Password Auth ─────────────────────────────────────────────────────

export async function signUpWithEmail(
  supabase: SupabaseClient,
  username: string,
  password: string,
  options?: { email?: string; nickname?: string },
): Promise<AuthResult> {
  try {
    // Use email for Supabase auth; if user didn't provide email, generate a placeholder
    // from the username so Supabase doesn't reject the request.
    const email = options?.email;
    const nickname = options?.nickname;
    const authEmail = email || `${username}@wtfti.local`;

    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: {
          username,
          nickname: nickname || '',
          display_name: nickname || username,
          has_real_email: !!email,
        },
        // Skip email confirmation for placeholder emails
        ...(email ? {} : { emailRedirectTo: undefined }),
      },
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    if (!data.user) {
      return { success: false, error: '注册失败，请稍后重试' };
    }

    // If Supabase returned a user but with identities = [] it means a duplicate email
    if (data.user.identities && data.user.identities.length === 0) {
      return { success: false, error: '该用户名已被注册' };
    }

    return { success: true, userId: data.user.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '注册时发生未知错误',
    };
  }
}

export async function signInWithPassword(
  supabase: SupabaseClient,
  login: string,
  password: string,
): Promise<AuthResult> {
  try {
    // Determine if login is email or username
    const isEmail = login.includes('@');
    const email = isEmail ? login : `${login}@wtfti.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    if (!data.user) {
      return { success: false, error: '登录失败，请稍后重试' };
    }

    return { success: true, userId: data.user.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '登录时发生未知错误',
    };
  }
}

export async function signOut(supabase: SupabaseClient): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return {};
}

export async function sendPasswordResetEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback/?type=recovery`,
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '发送重置邮件时发生错误',
    };
  }
}

export async function updatePassword(
  supabase: SupabaseClient,
  newPassword: string,
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '更新密码时发生错误',
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapAuthError(msg: string): string {
  if (msg.includes('User already registered')) return '该账号已被注册';
  if (msg.includes('Invalid login credentials')) return '账号或密码错误';
  if (msg.includes('Email not confirmed')) return '请先验证邮箱后再登录';
  if (msg.includes('Password should be at least')) return '密码至少需要6位';
  if (msg.includes('rate limit')) return '操作太频繁，请稍后再试';
  if (msg.includes('For security purposes')) return '操作太频繁，请稍后再试';
  return msg;
}

/** Get display name from user metadata — prioritizes nickname > display_name > username */
export function getUserDisplayName(user: { user_metadata?: Record<string, unknown> } | null): string {
  if (!user?.user_metadata) return '旅行者';
  const meta = user.user_metadata;
  return (meta.nickname as string) || (meta.display_name as string) || (meta.username as string) || '旅行者';
}

/** Get the username (login name) from user metadata */
export function getUserUsername(user: { user_metadata?: Record<string, unknown> } | null): string {
  if (!user?.user_metadata) return '';
  return (user.user_metadata.username as string) || '';
}

/** Get the nickname from user metadata */
export function getUserNickname(user: { user_metadata?: Record<string, unknown> } | null): string {
  if (!user?.user_metadata) return '';
  return (user.user_metadata.nickname as string) || '';
}
