
'use client';

import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ShoppingBag } from "lucide-react";

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
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const currentUser = session.user;
                setUser(currentUser);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('name, avatar_url')
                    .eq('id', currentUser.id)
                    .single();
                
                setProfile({
                    name: profileData?.name || currentUser.user_metadata.name || null,
                    avatar_url: profileData?.avatar_url || null,
                    email: currentUser.email || null,
                });
                setLoading(false);
            } else {
                router.replace('/');
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
                <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
            </div>
        )
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
    )
}
