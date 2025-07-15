
'use client';

import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

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
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('name, avatar_url')
                    .eq('id', session.user.id)
                    .single();
                
                setProfile({
                    name: profileData?.name || session.user.user_metadata.name || null,
                    avatar_url: profileData?.avatar_url || null,
                    email: session.user.email || null,
                });
            } else {
                router.push('/');
                setUser(null);
                setProfile(null);
            }
        });

        // Initial check
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
            }
        };
        checkUser();

        return () => {
            subscription?.unsubscribe();
        };
    }, [router, supabase]);

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
