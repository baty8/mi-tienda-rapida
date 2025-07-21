import { createClient } from '@/lib/utils';
import type { Profile } from '@/types';
import { notFound } from 'next/navigation';
import * as React from 'react';
import { StoreClientPage } from './StoreClientPage';

// This is a Server Component, responsible for fetching the basic profile data.
// This is fast and ensures the page frame and metadata load quickly.
async function getStoreProfile(vendorId: string): Promise<Profile | null> {
    const supabase = createClient();

    // Step 1: Fetch the vendor's profile.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vendorId)
        .single();
    
    if (profileError || !profile) {
        console.error('Error fetching profile or profile not found:', profileError?.message);
        return null; // Return null if profile doesn't exist.
    }

    return profile as Profile;
}

export default async function StorePage({ params }: { params: { vendorId: string }}) {
  const { vendorId } = params;
  const profile = await getStoreProfile(vendorId);

  if (!profile) {
      notFound();
  }
  
  // The profile is passed to the Client Component, which will then fetch
  // the catalogs and products on the client side.
  return <StoreClientPage profile={profile} />;
}
