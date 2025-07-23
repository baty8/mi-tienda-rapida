
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/ui/sidebar';
import type { Profile } from '@/types';
import { Menu, ShoppingBag } from 'lucide-react';
import { ProductProvider, useProduct } from '@/context/ProductContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function VendorApp({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { globalLoading, profile, fetchInitialProfile } = useProduct();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.push('/');
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        await fetchInitialProfile(session.user);
      }
      setAuthChecked(true);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (event === 'SIGNED_IN' && session) {
        fetchInitialProfile(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!authChecked || globalLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando tu tienda...</p>
        </div>
      </div>
    );
  }
  
  return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-muted/40">
          <Sidebar profile={profile} className="hidden lg:block" />
          <div className="flex flex-1 flex-col">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="lg:hidden p-0 w-full max-w-sm">
                     <SheetHeader className="sr-only">
                       <SheetTitle>Menú Principal</SheetTitle>
                     </SheetHeader>
                     <Sidebar profile={profile} />
                  </SheetContent>
                </Sheet>
              </header>
              {children}
          </div>
      </div>
  );
}

export default function VendorPagesLayout({ children }: { children: ReactNode }) {
  return (
    <ProductProvider>
      <VendorApp>{children}</VendorApp>
    </ProductProvider>
  )
}

    