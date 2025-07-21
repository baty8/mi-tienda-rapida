
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsSessionReady(true);
      }
      if(event === "SIGNED_IN") {
        router.push('/products');
      }
    });

    // Handle initial state in case the page is loaded after the event
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      // This is a sign we are in the recovery flow
      setIsSessionReady(true);
    } else if (!isSessionReady){
       const timer = setTimeout(() => {
            if(!isSessionReady) { // check again before setting error
                setErrorState("No se detectó un token de recuperación de contraseña. Por favor, utiliza el enlace de tu correo electrónico.");
            }
       }, 3000);
       return () => clearTimeout(timer);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth, isSessionReady]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: '¡Éxito!', description: 'Tu contraseña ha sido actualizada. Inicia sesión con tu nueva contraseña.' });
      await supabase.auth.signOut(); // Force sign out to require new login
      router.push('/');
    }
  };
  
  const renderContent = () => {
      if (errorState) {
          return (
              <>
                 <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <KeyRound className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                       Enlace Inválido o Expirado
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {errorState}
                    </CardDescription>
                  </CardHeader>
                   <CardContent>
                      <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                        <Link href="/">
                          Volver al Inicio
                        </Link>
                      </Button>
                    </CardContent>
              </>
          )
      }
      
      if (!isSessionReady) {
          return (
              <>
                  <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <KeyRound className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                           Esperando...
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                           Verificando tu enlace de recuperación. El formulario aparecerá en breve.
                        </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                  </CardContent>
              </>
          );
      }

      return (
        <>
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <KeyRound className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-2xl font-bold font-headline text-gray-800">
                    Restablecer Contraseña
                </CardTitle>
                <CardDescription className="text-gray-600">
                    Introduce tu nueva contraseña a continuación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-gray-50"
                    />
                    <Input
                        type="password"
                        placeholder="Confirmar nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-gray-50"
                    />
                    <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </Button>
                </form>
            </CardContent>
        </>
      )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-body">
      <Card className="w-full max-w-md text-center shadow-lg">
        {renderContent()}
      </Card>
    </div>
  );
}
