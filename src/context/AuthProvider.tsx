
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { ShoppingBag } from 'lucide-react';

type AuthContextType = {
  session: Session | null;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  supabase: createClient(),
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        // This can happen if the network fails or if Supabase is down.
        // We'll treat it as if there's no session.
        console.error('Error getting initial session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // No need to set loading to false here, as getInitialSession already does it.
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


  if (loading) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
