
'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils';


export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
           router.push('/products');
        }
        if (event === 'SIGNED_OUT') {
           router.push('/');
        }
      }
    );

    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if(!session) {
            // If on a protected route, redirect to login
            if(window.location.pathname.startsWith('/(vendor)')) {
                 router.push('/');
            }
        }
    };

    checkInitialSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
