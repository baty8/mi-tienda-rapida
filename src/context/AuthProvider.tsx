
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

const AuthContext = createContext<{ session: Session | null }>({
  session: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // No need to set loading to false here again
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (loading) return; // Wait until initial session check is complete

    const isAuthPage = pathname === '/' || pathname.startsWith('/auth');

    if (session && isAuthPage) {
      // User is logged in but on an auth page, redirect to products
      router.push('/products');
    } else if (!session && !isAuthPage) {
      // User is not logged in and not on an auth page, redirect to login
      router.push('/');
    }
  }, [session, pathname, router, loading]);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
