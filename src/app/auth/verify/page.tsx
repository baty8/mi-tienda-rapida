
'use client';

import { PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
            <div className="w-full max-w-md text-center rounded-2xl bg-white text-black shadow-2xl p-8">
                <PartyPopper className="mx-auto h-16 w-16 text-green-500" />
                <h1 className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    ¡Correo Verificado!
                </h1>
                <p className="mt-2 text-gray-600">
                    Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión y empezar a vender.
                </p>
                <Button asChild className="mt-6 w-full bg-blue-600 hover:bg-blue-700">
                   <Link href="/">
                     Ir a Iniciar Sesión
                   </Link>
                </Button>
            </div>
        </div>
    );
}

    
    