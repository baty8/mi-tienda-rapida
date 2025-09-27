

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/ui/sidebar';
import type { Profile } from '@/types';
import { Menu } from 'lucide-react';
import { ProductProvider, useProduct } from '@/context/ProductContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';

const EyMiTiendaWebLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" x2="21" y1="6" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
);


function VendorApp({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
      
      const isPermittedPublicPath = ['/auth/reset-password', '/auth/pending'].includes(pathname);
      
      if (!session && !isPermittedPublicPath) {
        router.push('/');
      } else if (session) {
        await fetchInitialProfile(session.user);
      }
      setAuthChecked(true);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (event === 'SIGNED_IN' && session) {
        // Solo redirigir si no estamos ya en el flujo de reseteo de contraseña o pendiente
        if (!['/auth/reset-password', '/auth/pending'].includes(pathname)) {
            fetchInitialProfile(session.user);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname]); 

  // New effect to handle redirection based on approval status
  useEffect(() => {
    if (!globalLoading && profile) {
      if (profile.is_approved === false && pathname !== '/auth/pending') {
        router.push('/auth/pending');
      } else if (profile.is_approved === true && pathname === '/auth/pending') {
        router.push('/products');
      }
    }
  }, [globalLoading, profile, pathname, router]);

  if (!authChecked || globalLoading || (profile && !profile.is_approved && pathname !== '/auth/pending')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <EyMiTiendaWebLogo className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando tu tienda...</p>
        </div>
      </div>
    );
  }
  
  // If user is not approved and is on the pending page, show only that page.
  if (profile && !profile.is_approved && pathname === '/auth/pending') {
      return <>{children}</>;
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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      value={{ light: 'light', dark: 'vendor-dark' }}
    >
      <ProductProvider>
        <VendorApp>{children}</VendorApp>
      </ProductProvider>
    </ThemeProvider>
  )
}
