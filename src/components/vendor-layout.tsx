
'use client';

import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
  name: string | null;
  avatar_url: string | null;
  email: string | null;
};

export function VendorLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const currentUser = session.user;
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('name, avatar_url')
                    .eq('id', currentUser.id)
                    .single();
                
                if (profileData) {
                    setProfile({
                        name: profileData?.name || currentUser.user_metadata.name || null,
                        avatar_url: profileData?.avatar_url || null,
                        email: currentUser.email || null,
                    });
                } else if(error) {
                    // This could happen if the profile trigger hasn't run yet.
                    // We'll retry in a moment.
                    console.warn("Could not fetch profile, will retry.");
                }

            } else {
                 // No session, should be handled by middleware, but as a fallback:
                 router.push('/');
            }
        };

        fetchProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
             if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                 fetchProfile();
             }
             if (event === 'SIGNED_OUT') {
                 setProfile(null);
                 router.push('/');
             }
        });

        return () => {
            authListener.subscription.unsubscribe();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase, router]);

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
    )
}
