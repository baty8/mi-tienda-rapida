
'use client';

import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./ui/sidebar";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

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

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('name, avatar_url')
                    .eq('id', user.id)
                    .single();
                
                setProfile({
                    name: profileData?.name,
                    avatar_url: profileData?.avatar_url,
                    email: user.email,
                });
            }
        };

        fetchProfile();
    }, []);

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
