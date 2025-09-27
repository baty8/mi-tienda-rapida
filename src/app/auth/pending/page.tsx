
'use client';

import { Button } from '@/components/ui/button';
import { getSupabase } from '@/lib/supabase/client';
import { Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
            router.push('/');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
            <div className="w-full max-w-md text-center rounded-2xl bg-white text-black shadow-2xl p-8">
                <Clock className="mx-auto h-16 w-16 text-yellow-500" />
                <h1 className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    Cuenta Pendiente de Aprobación
                </h1>
                <p className="mt-2 text-gray-600">
                    Gracias por registrarte. Tu cuenta ha sido creada y está esperando la aprobación de un administrador.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Recibirás una notificación cuando tu cuenta sea activada. Por favor, intenta iniciar sesión más tarde.
                </p>
                <Button onClick={handleLogout} variant="outline" className="mt-6 w-full">
                   <LogOut className="mr-2 h-4 w-4" />
                   Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
