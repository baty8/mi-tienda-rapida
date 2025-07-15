
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/ui/sidebar';
import type { Profile } from '@/types';
import { ShoppingBag } from 'lucide-react';
import { ProductProvider } from '@/context/ProductContext';

export default function VendorPagesLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData && !error) {
            setProfile(profileData as Profile);
          } else {
            console.error('Could not fetch profile:', error?.message);
            // Fallback profile if fetch fails but session exists
            setProfile({
                id: session.user.id,
                email: session.user.email || null,
                name: 'Vendedor',
                phone: null,
                avatar_url: null,
            });
          }
          setLoading(false);
        } else {
          setLoading(false);
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
      <ProductProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
            <Sidebar profile={profile} />
            <div className="flex flex-1 flex-col">
                {children}
            </div>
        </div>
      </ProductProvider>
    </ThemeProvider>
  );
}
