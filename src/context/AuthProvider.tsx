
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { ShoppingBag } from 'lucide-react';

type AuthContextType = {
  session: Session | null;
  supabase: SupabaseClient;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch the initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setLoading(false);
    };

    getInitialSession();

    // Set up a listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // If loading was true, this is the first auth event, so we are done loading.
        if (loading) {
            setLoading(false);
        }
      }
    );

    // Cleanup the listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, loading]);

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    const isAuthPage = pathname === '/' || pathname.startsWith('/auth');
    const isStorePage = pathname.startsWith('/store');

    // Allow access to public store pages and auth pages regardless of session
    if (isStorePage || (isAuthPage && !session)) {
        return;
    }

    if (session && isAuthPage) {
      router.push('/products');
    } else if (!session && !isAuthPage) {
      router.push('/');
    }
  }, [session, loading, pathname, router]);


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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
