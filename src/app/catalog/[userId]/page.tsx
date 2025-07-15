

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PublicCatalogPage() {
  const params = useParams();
  const catalogId = params.userId as string; // This is the catalogId
  const router = useRouter();

  useEffect(() => {
    // This page is deprecated and should redirect.
    // We need to find the vendor from the catalog to build the new URL.
    const getVendorAndRedirect = async () => {
        if (catalogId) {
            // This is a temporary measure and might not work if Supabase client is not initialized.
            // A better solution is a server-side redirect if possible.
            try {
                const res = await fetch(`/api/get-vendor-from-catalog?catalogId=${catalogId}`);
                if (res.ok) {
                    const { vendorId } = await res.json();
                    if (vendorId) {
                        router.replace(`/store/${vendorId}`);
                        return;
                    }
                }
            } catch (e) {
                // Ignore errors, redirect to home
            }
        }
        router.replace('/');
    };
    
    getVendorAndRedirect();

  }, [catalogId, router]);


  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50">
      <p className="mt-4 text-lg text-muted-foreground">Redirigiendo...</p>
      <Button onClick={() => router.push('/')} className="mt-6">Ir a la página principal</Button>
    </div>
  );
}


    