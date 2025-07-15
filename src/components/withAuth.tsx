
'use client';

import { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag } from 'lucide-react';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // onAuthStateChange is the reliable source of truth for the session state.
      // It fires once on load, and again whenever the auth state changes.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
          // If Supabase confirms there is no session, redirect to login.
          router.replace('/');
        } else {
          // If Supabase confirms there is a session, stop loading and show the page.
          setLoading(false);
        }
      });

      // Cleanup the subscription when the component unmounts
      return () => {
        subscription?.unsubscribe();
      };
    }, [router, supabase]);

    if (loading) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
          <ShoppingBag className="h-16 w-16 animate-bounce text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Verificando sesión...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
