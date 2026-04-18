'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { getUserDisplayName } from '@/lib/supabase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  /** True if user has a real account (not anonymous, not null) */
  isAuthenticated: boolean;
  displayName: string;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAuthenticated: false,
  displayName: '旅行者',
  refresh: async () => {},
});

/**
 * Schedule work after first paint without blocking initial bundle.
 * Falls back to a short timeout where requestIdleCallback is unavailable
 * (Safari).
 */
function scheduleIdle(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const ric =
    (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number })
      .requestIdleCallback;
  const cic =
    (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
  if (typeof ric === 'function') {
    const handle = ric(cb, { timeout: 1500 });
    return () => cic?.(handle);
  }
  const handle = window.setTimeout(cb, 200);
  return () => window.clearTimeout(handle);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Start NOT-loading so anonymous-friendly pages render their full UI
  // immediately. We flip to `loading: true` only while the supabase client
  // is being lazy-loaded so callers that gate on auth can wait if they want.
  const [loading, setLoading] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const hydratedUserIdRef = useRef<string | null>(null);
  const hydratingUserIdRef = useRef<string | null>(null);
  const hydrationPromiseRef = useRef<Promise<void> | null>(null);

  const resetHydrationState = useCallback(() => {
    hydratedUserIdRef.current = null;
    hydratingUserIdRef.current = null;
    hydrationPromiseRef.current = null;
  }, []);

  const hydrateSignedInState = useCallback(async (sessionUser: User) => {
    if (hydratedUserIdRef.current === sessionUser.id) {
      return;
    }

    if (
      hydratingUserIdRef.current === sessionUser.id &&
      hydrationPromiseRef.current
    ) {
      return hydrationPromiseRef.current;
    }

    hydratingUserIdRef.current = sessionUser.id;
    const hydrationPromise = (async () => {
      if (!sessionUser.is_anonymous) {
        await import('@/lib/auth/claimed-session').then(({ finalizeClaimedSession }) => {
          return finalizeClaimedSession().catch(() => null);
        }).catch(() => null);
      }

      await Promise.all([
        import('@/lib/cpti/cpti-profile').then(({ hydrateCptiProfileFromServer }) => {
          return hydrateCptiProfileFromServer().catch(() => {});
        }).catch(() => {}),
        import('@/lib/assets/asset-sync').then(({ bootstrapPersistentAssets }) => {
          return bootstrapPersistentAssets().catch(() => {});
        }).catch(() => {}),
      ]);
    })();

    hydrationPromiseRef.current = hydrationPromise;

    try {
      await hydrationPromise;
      hydratedUserIdRef.current = sessionUser.id;
    } finally {
      if (hydratingUserIdRef.current === sessionUser.id) {
        hydratingUserIdRef.current = null;
      }
      if (hydrationPromiseRef.current === hydrationPromise) {
        hydrationPromiseRef.current = null;
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      setLoading(false);

      if (u) {
        void hydrateSignedInState(u);
      } else {
        resetHydrationState();
      }
    } catch {
      // Supabase auth lock contention — getUser() and onAuthStateChange
      // race for the same token lock. The listener wins, so we can safely
      // swallow this; auth state is already correct.
    }
  }, [hydrateSignedInState, resetHydrationState, supabase]);

  // Lazy-load supabase client after first paint so anonymous pages don't pay
  // the ~70 KB gzip cost of @supabase/supabase-js on initial bundle.
  useEffect(() => {
    if (supabase) return;
    let cancelled = false;
    const cancel = scheduleIdle(() => {
      setLoading(true);
      import('@/lib/supabase/client')
        .then(({ createBrowserSupabaseClient }) => {
          if (cancelled) return;
          setSupabase(createBrowserSupabaseClient());
        })
        .catch(() => {
          if (cancelled) return;
          setLoading(false);
        });
    });
    return () => {
      cancelled = true;
      cancel();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    // Initial load
    refresh();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          void hydrateSignedInState(session.user);
        } else {
          resetHydrationState();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [hydrateSignedInState, resetHydrationState, supabase, refresh]);

  const isAuthenticated = !!user && !user.is_anonymous;
  const displayName = getUserDisplayName(user);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated, displayName, refresh }),
    [user, loading, isAuthenticated, displayName, refresh],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
