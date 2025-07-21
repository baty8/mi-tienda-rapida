
import { createClient } from '@/lib/utils';
import type { Profile } from '@/types';
import { notFound } from 'next/navigation';
import { StoreClientContent } from '@/components/StoreClientContent';

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

async function getProfile(vendorId: string): Promise<VendorFullProfile> {
    const supabase = createClient();
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vendorId)
        .single();
    
    if (profileError || !profileData) {
        console.error('Error fetching profile or profile not found:', profileError?.message);
        notFound();
    }
    return profileData;
}

export default async function StorePage({ params }: { params: { vendorId: string }}) {
  const { vendorId } = params;
  const profile = await getProfile(vendorId);

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
