
'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthCodeErrorPage() {

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
            <div className="w-full max-w-md text-center rounded-2xl bg-white text-black shadow-2xl p-8">
                <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
                <h1 className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    Enlace Inválido o Expirado
                </h1>
                <p className="mt-2 text-gray-600">
                    El enlace de verificación o de restablecimiento de contraseña que has utilizado ya no es válido. Es posible que haya expirado o que ya haya sido utilizado.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Por favor, solicita un nuevo enlace desde la página de inicio de sesión si lo necesitas.
                </p>
                <Button asChild className="mt-6 w-full bg-blue-600 hover:bg-blue-700">
                   <Link href="/">
                     Volver al Inicio de Sesión
                   </Link>
                </Button>
            </div>
        </div>
    );
}
