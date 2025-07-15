
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
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
          router.replace('/');
        } else {
          setLoading(false);
        }
      });
      
      // Also check initial session
      const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.replace('/');
        } else {
            setLoading(false);
        }
      };
      
      checkInitialSession();

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
