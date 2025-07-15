
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/ui/sidebar';
import type { Profile } from '@/types';
import { ShoppingBag } from 'lucide-react';

export default function VendorPagesLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // This listener is the single source of truth for the user's session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // If a session exists, fetch the user's profile.
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData && !error) {
            setProfile(profileData as Profile);
          } else {
            // This might happen if the profile wasn't created yet.
            // For now, we'll log the error and allow access, but a robust app might handle this differently.
            console.error('Could not fetch profile:', error?.message);
            // Even if profile fails, we have a session, so don't redirect.
            setProfile({
                id: session.user.id,
                email: session.user.email || null,
                name: 'Vendedor',
                phone: null,
                avatar_url: null,
            })
          }
          // Once session and profile are checked, stop loading.
          setLoading(false);
        } else {
          // If there is no session, stop loading and redirect to login.
          setLoading(false);
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  // We want this to run only once on mount, so we pass an empty dependency array.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="flex min-h-screen w-full bg-muted/40">
            <Sidebar profile={profile} />
            <div className="flex flex-1 flex-col">
                {children}
            </div>
        </div>
    </ThemeProvider>
  );
}
