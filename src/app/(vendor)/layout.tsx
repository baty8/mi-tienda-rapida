
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

const VentaRapidaLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5" />
      <path d="M20.641 12.3223L21 17C21 17.5523 20.5523 18 20 18H4C3.44772 18 3 17.5523 3 17L3.35903 12.3223C3.58294 9.49474 5.9754 7.5 8.8282 7.5H15.1718C18.0246 7.5 20.4171 9.49474 20.641 12.3223Z" />
      <path d="M12 12L12 13" />
      <path d="M15.5 12L16.5 13" />
      <path d="M8.5 12L7.5 13" />
      <path d="M11 21L13 21" />
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
      
      const isResetPasswordPage = pathname.includes('/reset-password');
      
      if (!session && !isResetPasswordPage) {
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
        // Solo redirigir si no estamos ya en el flujo de reseteo de contraseña
        if (!pathname.includes('/reset-password')) {
            fetchInitialProfile(session.user);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname]); 

  if (!authChecked || globalLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <VentaRapidaLogo className="h-12 w-12 animate-pulse text-primary" />
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
