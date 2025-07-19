
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // This event fires when the user is signed in,
      // which happens after the redirect from Google or email verification.
      if (session) {
        router.push('/products');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <h1 className="text-2xl font-bold font-headline text-gray-800">
          Autenticando...
        </h1>
        <p className="text-gray-600">
          Por favor, espera un momento mientras te redirigimos.
        </p>
      </div>
    </div>
  );
}
