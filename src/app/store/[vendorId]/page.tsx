
'use client';

import { createClient } from '@/lib/utils';
import type { Profile } from '@/types';
import { notFound } from 'next/navigation';
import { StoreClientContent } from '@/components/StoreClientContent';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type VendorFullProfile = Profile & {
    store_bg_color?: string;
    store_primary_color?: string;
    store_accent_color?: string;
    store_font_family?: string;
};

const getFontFamily = (fontName: string | null | undefined): string => {
    if (!fontName) return '"PT Sans", sans-serif';
    switch (fontName) {
        case 'Roboto': return '"Roboto", sans-serif';
        case 'Lato': return '"Lato", sans-serif';
        case 'Merriweather': return '"Merriweather", serif';
        case 'Inconsolata': return '"Inconsolata", monospace';
        default: return '"PT Sans", sans-serif';
    }
};


export default function StorePage({ params }: { params: { vendorId: string }}) {
  const { vendorId } = params;
  const [profile, setProfile] = React.useState<VendorFullProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const getProfile = async () => {
        const supabase = createClient();
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', vendorId)
            .single();
        
        if (profileError || !profileData) {
            console.error('Error fetching profile or profile not found:', profileError?.message);
            setError(true);
        } else {
            setProfile(profileData as VendorFullProfile);
        }
        setLoading(false);
    };

    getProfile();
  }, [vendorId]);


  if (loading) {
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
             <header className="mb-8 text-center flex flex-col items-center">
                 <Skeleton className="h-24 w-24 rounded-full" />
                 <Skeleton className="h-8 w-48 mt-4" />
            </header>
             <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-full sm:w-[250px]" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    )
  }

  if (error || !profile) {
      notFound();
  }

  const storeStyle = {
    '--store-bg': profile.store_bg_color || '#FFFFFF',
    '--store-primary': profile.store_primary_color || '#111827',
    '--store-accent': profile.store_accent_color || '#F3F4F6',
    '--store-font-family': getFontFamily(profile.store_font_family),
  } as React.CSSProperties;

  return (
    <div style={storeStyle} className="min-h-screen">
       <style jsx global>{`
            body { background-color: var(--store-bg); }
            .store-bg { background-color: var(--store-bg); }
            .store-text { color: var(--store-primary); font-family: var(--store-font-family); }
            .store-primary-text { color: var(--store-primary); font-family: var(--store-font-family); }
            .store-secondary-text { color: #6b7280; font-family: var(--store-font-family); }
            .store-primary-bg { background-color: var(--store-primary); color: var(--store-bg); font-family: var(--store-font-family); }
            .store-accent-bg { background-color: var(--store-accent); }
            .store-font { font-family: var(--store-font-family); }
        `}</style>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 store-bg">
        <StoreClientContent 
            profile={profile}
            vendorId={vendorId}
        />
        <footer className="mt-12 text-center text-sm text-gray-500 store-font">
            <p>Potenciado por VentaRapida</p>
        </footer>
      </main>
    </div>
  );
}
