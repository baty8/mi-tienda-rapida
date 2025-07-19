
'use client';

import { ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
    // This page is a temporary stop. The AuthProvider in the root layout will
    // detect the session and redirect the user accordingly.
    const router = useRouter();

    useEffect(() => {
        // In case the AuthProvider doesn't redirect for some reason,
        // this is a fallback to push the user to the products page after a short delay.
        const timer = setTimeout(() => {
            router.push('/products');
        }, 1000);

        return () => clearTimeout(timer);
    }, [router]);


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
            <div className="w-full max-w-md text-center rounded-2xl bg-white text-black shadow-2xl p-8">
                <ShoppingBag className="mx-auto h-16 w-16 animate-pulse text-blue-500" />
                <h1 className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    Procesando inicio de sesión...
                </h1>
                <p className="mt-2 text-gray-600">
                    Estamos verificando tu cuenta. Serás redirigido en un momento.
                </p>
            </div>
        </div>
    );
}
