
'use client';

import { ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils';

export default function AuthCallbackPage() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleAuthCallback = async () => {
            // The user has been redirected here from an email link.
            // We check the session. The AuthProvider will then take over.
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // If there's a session, the AuthProvider in the root layout
                // will redirect to '/products'. We can push them there as a fallback.
                router.push('/products');
            } else {
                // If there's no session after coming from a callback,
                // it might be a password recovery or other flow.
                // We'll wait for the onAuthStateChange listener to fire.
                // If nothing happens, we send them to login.
                const timer = setTimeout(() => {
                    router.push('/');
                }, 3000);
                return () => clearTimeout(timer);
            }
        };

        handleAuthCallback();
    }, [router, supabase]);


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
            <div className="w-full max-w-md text-center rounded-2xl bg-white text-black shadow-2xl p-8">
                <ShoppingBag className="mx-auto h-16 w-16 animate-pulse text-blue-500" />
                <h1 className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    Autenticando...
                </h1>
                <p className="mt-2 text-gray-600">
                    Estamos verificando tu sesión. Serás redirigido en un momento.
                </p>
            </div>
        </div>
    );
}
