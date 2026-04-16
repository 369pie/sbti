'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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

  const refresh = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // Initial load
    refresh();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, refresh]);

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
