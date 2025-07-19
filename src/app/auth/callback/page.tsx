
'use client';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthCallbackPage() {
    // This page handles the session redirect from Supabase.
    // The main logic is in the layout, which detects the auth state change.
    // This page just provides a user-friendly UI during the brief redirect moment.

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
            <div className="w-full max-w-md text-center rounded-2xl bg-white text-black shadow-2xl p-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    ¡Verificación Exitosa!
                </h1>
                <p className="mt-2 text-gray-600">
                    Tu cuenta ha sido verificada. Serás redirigido en un momento...
                </p>
                <div className="mt-6 flex flex-col items-center gap-2">
                     <ShoppingBag className="h-8 w-8 animate-pulse text-primary" />
                     <p className="text-sm text-muted-foreground">Procesando inicio de sesión</p>
                </div>
                 <Button asChild className="mt-6 w-full bg-blue-500 hover:bg-blue-600">
                    <Link href="/products">
                        Si no eres redirigido, haz clic aquí
                    </Link>
                </Button>
            </div>
        </div>
    );
}
