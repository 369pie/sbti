'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
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

  useEffect(() => {
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
